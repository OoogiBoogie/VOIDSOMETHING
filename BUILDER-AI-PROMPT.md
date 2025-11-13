# PSX VOID – Phase 3 Hardening Tasks

**Context:**
- Network: Base Sepolia (84532) only
- Contracts: DO NOT redeploy or modify fee splits (0.3%) or APR caps
- Auth: Privy is the only source of truth; never use localStorage for wallet state

---

## Tasks (Ordered by Priority)

### 1) WalletConnect Real Project ID ⚠️ HIGH

**Current State:**
- Using `demo-project-id` in `.env.local`
- Will hit rate limits on production

**Required Changes:**
1. Get real project ID from https://cloud.walletconnect.com
2. Replace in `.env.local`:
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-real-id>
   ```
3. Update `lib/wagmiConfig.ts` to use env variable

**Acceptance Criteria:**
- ✅ Mobile wallets connect without throttling/rate limits
- ✅ WalletConnect modal shows project name correctly
- ✅ No 429 errors in browser console

---

### 2) RPC Resilience ⚠️ HIGH

**Current State:**
- Single RPC endpoint with basic fallback
- If primary RPC fails, some users may see errors

**Required Changes:**
1. Update `lib/wagmiConfig.ts`:
   ```typescript
   import { http, fallback } from 'wagmi';
   
   const rpcTransports = fallback([
     http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
     http(process.env.NEXT_PUBLIC_BASE_RPC_URL_FALLBACK),
     http("https://base-sepolia.rpc.thirdweb.com"),
   ], { 
     rank: true, 
     retryCount: 3,
     retryDelay: 1000,
   });
   
   export const wagmiConfig = createConfig({
     chains: [baseSepolia],
     transports: {
       [baseSepolia.id]: rpcTransports,
     },
   });
   ```

2. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_BASE_RPC_URL_FALLBACK=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
   ```

**Acceptance Criteria:**
- ✅ App remains usable if primary RPC is killed
- ✅ Automatic failover within 3-5 seconds
- ✅ No user-facing errors during RPC switch

---

### 3) Input Guards (Swap/Stake) ⚠️ HIGH

**Current State:**
- Basic validation exists in `hud/defi/helpers.ts`
- Needs integration into all tabs

**Required Changes:**
1. Implement decimal safety:
   ```typescript
   // lib/utils/decimals.ts
   import { parseUnits, formatUnits } from 'viem';
   
   export const toUnits = (n: string, decimals: number) => 
     parseUnits(n || "0", decimals);
   
   export const fromUnits = (bn: bigint, decimals: number) => 
     formatUnits(bn ?? 0n, decimals);
   
   // USDC = 6 decimals, VOID = 18 decimals
   export const DECIMALS = {
     VOID: 18,
     USDC: 6,
     xVOID: 18,
   } as const;
   ```

2. Add slippage clamping in SwapTab:
   ```typescript
   const [slippage, setSlippage] = useState(0.5); // Default 0.5%
   
   const clampedSlippage = Math.max(0.1, Math.min(2.0, slippage));
   ```

3. Add max input caps:
   ```typescript
   // Swap: 90% of balance (leave gas headroom)
   const maxSwapAmount = (balance * 90n) / 100n;
   
   // Stake: balance minus dust (0.01 VOID)
   const maxStakeAmount = balance - parseUnits("0.01", 18);
   ```

4. Disable buttons for invalid inputs:
   ```typescript
   const isValid = amount > 0n && amount <= balance;
   const hasError = validateAmountInput(inputValue, balance, { min: 1n });
   
   <button disabled={!isValid || hasError || isPending}>
     {hasError || "Swap"}
   </button>
   ```

**Acceptance Criteria:**
- ✅ No tx can be initiated with invalid inputs
- ✅ Buttons disabled for: 0, NaN, over-balance, negative
- ✅ Error messages concise and helpful ("Insufficient balance", not "tx reverted")
- ✅ Slippage locked to 0.1–2.0% range

---

### 4) Error Boundaries 🔶 MEDIUM

**Current State:**
- No error boundaries, app crashes on unhandled errors

**Required Changes:**
1. Create `ErrorBoundary` component:
   ```typescript
   // components/ErrorBoundary.tsx
   import React from 'react';
   
   export class ErrorBoundary extends React.Component<
     { children: React.ReactNode; fallback?: React.ReactNode },
     { hasError: boolean; error?: Error }
   > {
     state = { hasError: false, error: undefined };
     
     static getDerivedStateFromError(error: Error) {
       return { hasError: true, error };
     }
     
     componentDidCatch(error: Error, info: React.ErrorInfo) {
       console.error('[ErrorBoundary]', error, info);
       // Optional: send to telemetry
     }
     
     render() {
       if (this.state.hasError) {
         return this.props.fallback || (
           <div className="error-fallback">
             <h2>Something went wrong</h2>
             <p>{this.state.error?.message}</p>
             <button onClick={() => window.location.reload()}>
               Reload App
             </button>
           </div>
         );
       }
       return this.props.children;
     }
   }
   ```

2. Wrap MultiTabWindow:
   ```typescript
   <ErrorBoundary fallback={<MultiTabErrorFallback />}>
     <MultiTabWindow />
   </ErrorBoundary>
   ```

3. Wrap each tab:
   ```typescript
   <ErrorBoundary fallback={<TabErrorFallback tabName="Swap" />}>
     <SwapTab />
   </ErrorBoundary>
   ```

**Acceptance Criteria:**
- ✅ No hard crashes if a contract call fails
- ✅ Friendly fallback UI with reload option
- ✅ Error logged to console (or telemetry if enabled)

---

### 5) FPS Overlay 🔶 MEDIUM

**Current State:**
- `useFps` hook and `FpsBadge` component created
- Needs Settings toggle integration

**Required Changes:**
1. Add toggle to SettingsTab:
   ```typescript
   const [showFps, setShowFps] = useState(
     process.env.NEXT_PUBLIC_ENABLE_FPS === "1"
   );
   
   <label>
     <input 
       type="checkbox" 
       checked={showFps} 
       onChange={(e) => setShowFps(e.target.checked)} 
     />
     Show FPS Badge
   </label>
   ```

2. Mount FpsBadge in HUDRoot:
   ```typescript
   import { FpsBadge } from '@/hud/dev/FpsBadge';
   
   {showFps && <FpsBadge />}
   ```

3. Add draw calls counter (optional):
   ```typescript
   // In useFps.ts
   const drawCalls = useThree((state) => state.gl.info.render.calls);
   return { fps, drawCalls };
   ```

**Acceptance Criteria:**
- ✅ Testers can toggle FPS badge in Settings
- ✅ Badge shows live FPS + color coding (teal ≥55, yellow 30-54, pink <30)
- ✅ Optional: Shows draw calls for performance debugging

---

### 6) QA Logs 🔶 MEDIUM

**Current State:**
- `scripts/qa-log.ts` created
- `Test-Conductor.ps1` logs to JSONL
- Client-side logging not integrated

**Required Changes:**
1. Add client-side logging hook:
   ```typescript
   // hooks/useQALog.ts
   import { logQA } from '@/scripts/qa-log';
   
   export function useQALog() {
     const logTransaction = (
       action: string, 
       txHash: string, 
       status: 'success' | 'failed' | 'pending'
     ) => {
       if (process.env.NEXT_PUBLIC_ENABLE_QA_LOGS === "1") {
         logQA(action, { txHash, status, timestamp: Date.now() });
       }
     };
     
     return { logTransaction };
   }
   ```

2. Integrate in SwapTab:
   ```typescript
   const { logTransaction } = useQALog();
   
   // After swap tx
   logTransaction('swap', txHash, 'success');
   ```

3. Integrate in WalletTab:
   ```typescript
   logTransaction('stake', txHash, 'success');
   logTransaction('claim', txHash, 'success');
   ```

**Acceptance Criteria:**
- ✅ Every E2E run produces `qa-reports/*.jsonl` artifacts
- ✅ Logs include: tx hash, status, timestamp, user action
- ✅ No PII (personally identifiable information) in logs

---

### 7) Land Buy (Optional) 🟢 LOW

**Current State:**
- Land tab shows ownership, no buy flow

**Required Changes:**
1. Add "Buy Parcel" button in LandTab:
   ```typescript
   const { writeContract } = useWriteContract();
   
   const handleBuyParcel = async () => {
     await writeContract({
       address: WORLD_LAND_ADDRESS,
       abi: worldLandABI,
       functionName: 'buyParcel',
       args: [tokenId],
     });
   };
   ```

2. Show approval step:
   ```typescript
   // Approve VOID to WorldLandTestnet
   await writeContract({
     address: VOID_ADDRESS,
     abi: erc20ABI,
     functionName: 'approve',
     args: [WORLD_LAND_ADDRESS, price],
   });
   ```

3. Update UI on success:
   ```typescript
   const { data: owner } = useReadContract({
     address: WORLD_LAND_ADDRESS,
     abi: worldLandABI,
     functionName: 'ownerOf',
     args: [tokenId],
   });
   
   useEffect(() => {
     if (owner === address) {
       showToast('Parcel purchased! You now own this land.');
     }
   }, [owner, address]);
   ```

**Acceptance Criteria:**
- ✅ ownerOf updates on chain within 3s of buy tx
- ✅ HUD reflects new ownership instantly
- ✅ Approve → Buy flow works smoothly

---

### 8) Indexer (Optional) 🟢 LOW

**Current State:**
- No subgraph, all data fetched via RPC

**Required Changes:**
1. Deploy lightweight subgraph:
   ```graphql
   # schema.graphql
   type Parcel @entity {
     id: ID!
     tokenId: BigInt!
     owner: Bytes!
     district: String!
     lastTransfer: BigInt!
   }
   
   type Swap @entity {
     id: ID!
     tokenIn: Bytes!
     tokenOut: Bytes!
     amountIn: BigInt!
     amountOut: BigInt!
     feeBps: Int!
     sender: Bytes!
     txHash: Bytes!
     blockTime: BigInt!
   }
   ```

2. Add queries in AnalyticsTab:
   ```typescript
   const { data } = useQuery({
     queryKey: ['recent-swaps'],
     queryFn: async () => {
       const res = await fetch(SUBGRAPH_URL, {
         method: 'POST',
         body: JSON.stringify({
           query: `{
             swaps(first: 10, orderBy: blockTime, orderDirection: desc) {
               id tokenIn tokenOut amountIn amountOut txHash
             }
           }`
         })
       });
       return res.json();
     }
   });
   ```

3. Fallback to RPC if subgraph down:
   ```typescript
   if (!data || error) {
     // Fallback: direct RPC calls
     const swaps = await fetchSwapsFromRPC();
   }
   ```

**Acceptance Criteria:**
- ✅ AnalyticsTab shows top holders, recent swaps, district ownership %
- ✅ Fallback to RPC when subgraph unavailable
- ✅ Subgraph syncs within 1-2 blocks

---

## Constraints

### DO NOT

- ❌ Redeploy contracts (use existing addresses)
- ❌ Change fee split constants (0.3% is locked)
- ❌ Change APR caps (12% base is locked)
- ❌ Use inline hex colors (use voidTheme CSS vars)
- ❌ Store wallet state in localStorage (Privy only)

### DO

- ✅ Use wagmi hooks for all contract interactions
- ✅ Use Zod for env validation (`lib/env.ts`)
- ✅ Log errors to console with context
- ✅ Test all changes with `Test-Conductor.ps1`
- ✅ Update CHANGELOG.md with all changes

---

## Deliverables

1. **Updated Code**
   - Input guards integrated in all DeFi tabs
   - Error boundaries wrapped around critical components
   - RPC fallback configured with 3+ endpoints

2. **Verified E2E**
   - Run `.\scripts\Test-Conductor.ps1` with real wallet
   - All flows pass: swap, stake, land sync, FPS ≥60
   - QA logs present in `qa-reports/`

3. **CHANGELOG Entry**
   - Document all changes under `[0.3.1-phase3-beta]`
   - Include breaking changes, new features, bug fixes

---

## Timeline

**Estimated Effort:** 4-6 hours

- Tasks 1-3 (WalletConnect, RPC, Input Guards): 2 hours
- Tasks 4-5 (Error Boundaries, FPS Overlay): 1 hour
- Task 6 (QA Logs): 1 hour
- Tasks 7-8 (Land Buy, Indexer): 2 hours (optional)
- Testing + QA: 1 hour

---

## Success Criteria

- ✅ Zero TypeScript errors
- ✅ Zero console errors during E2E test
- ✅ All Test-Conductor checks pass
- ✅ FPS ≥60 at 1080p during stress test
- ✅ No inline hex colors remaining
- ✅ CHANGELOG.md updated

---

**Paste this entire document to your builder AI before the next work cycle.**
