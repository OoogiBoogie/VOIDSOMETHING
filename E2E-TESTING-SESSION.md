# 🚦 PSX VOID - E2E Testing Session Guide

**Duration:** 60–90 minutes  
**Goal:** Validate all core economic flows work end-to-end on Base Sepolia testnet

---

## 0️⃣ Pre-Flight Setup (5 min)

### Environment Configuration

1. **Get Real WalletConnect Project ID** (if not done):
   - Visit: https://cloud.walletconnect.com
   - Create project: "PSX VOID Metaverse"
   - Copy Project ID
   - Update `.env.local`:
     ```bash
     NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-real-id>
     ```

2. **Fresh Session**:
   ```powershell
   # Clear browser storage
   # Chrome: DevTools → Application → Clear Storage
   # Or use incognito mode
   
   # Start dev server
   npm run dev
   
   # In another terminal: run coordinate validator
   npm run validate:coords
   ```

3. **Test Wallet Setup**:
   - Ensure you have Base Sepolia ETH for gas
   - Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - Have some test VOID/USDC (mint via contracts if needed)

---

## 1️⃣ Boot & Auth (5 min)

### Goal
Single intro → Privy auth works → HUD loads on Base Sepolia

### Steps
1. Load app → See `VoidBootIntro` screen
2. Press any key to continue
3. Click "Connect with Privy" → Complete auth (email/wallet/social)
4. Verify HUD loads without errors
5. Check network indicator shows **Base Sepolia (84532)**

### Pass Criteria
- ✅ **ONE** intro screen only (no duplicate modals)
- ✅ `useChainGuard()` doesn't show wrong-network warning
- ✅ HUD fully renders with all 10 tabs visible

### Fail Indicators
- ❌ Second intro/wallet modal appears → `VoidBootIntro` bug
- ❌ Wrong network warning → Chain guard issue
- ❌ Blank screen / crash → Check browser console

---

## 2️⃣ Land ↔ World Sync (10 min)

### Goal
Mini-map, Land grid, World Map Overlay stay in sync; ownership loads live

### Steps
1. **Walk across district boundary**:
   - Use WASD to move avatar
   - Watch "Current Parcel" panel update in real-time
   - District color should change when crossing boundaries

2. **Open World Map Overlay**:
   - Press hotkey (Tab/M) or click mini-map "MAP ▸"
   - Verify current parcel highlighted
   - Hover other parcels → see tooltips

3. **Check Land Tab**:
   - Click Land tab in Multi-Tab HUD
   - Verify "Current Parcel" matches world position
   - District color should match theme (purple/teal/pink/blue/gray)

4. **Ownership Verification**:
   - If you own parcels: "Owned by You 🟢" in green
   - If unowned: "Unowned" in muted gray
   - If others own: "Owned by 0x1234..." in secondary color

### Pass Criteria
- ✅ Parcel coordinates update **instantly** on movement
- ✅ District colors use voidTheme CSS vars (no hardcoded hex)
- ✅ `ownerOf(tokenId)` reflects on-chain reality
- ✅ All 3 views (mini-map, overlay, Land tab) stay in sync

### Debugging
```powershell
# Check your owned parcels
.\scripts\cast\Get-ParcelsOwnedBy.ps1 -Address 0xYourAddress

# Expected: List of tokenIds + coordinates
```

---

## 3️⃣ Swap Flow + Fee Routing (15 min)

### Goal
Execute VOID→USDC swap; prove 0.3% fee accrues to VoidHookRouterV4

### Steps
1. **Open Swap Tab** in Multi-Tab HUD

2. **Enter Amount**:
   - Input: `100` VOID
   - Wait 300ms for debounced quote
   - Verify:
     - "You receive" shows USDC amount
     - Fee line: "0.3% protocol fee"
     - Slippage tolerance visible (0.5%)

3. **Execute Swap**:
   - If first time: Click **Approve** → Sign tx → Wait confirmation
   - Click **Swap** → Confirm in wallet → Get tx hash
   - Click Basescan link to verify on-chain

4. **Verify Fee Routing** (CRITICAL):
   ```powershell
   $env:PRIVATE_KEY = "0xYourPrivateKey"
   $env:MY_ADDRESS = "0xYourAddress"
   
   .\scripts\test-fee-routing.ps1
   ```

5. **Check QA Log**:
   ```powershell
   cat qa-reports\2025-11-11.jsonl | Select-String "swap"
   ```

### Pass Criteria
- ✅ Quote appears within 500ms of input
- ✅ Approve tx succeeds (if needed)
- ✅ Swap tx succeeds
- ✅ **Router VOID balance increases ≈ 0.3% of swap input** (±0.01% rounding)
- ✅ QA log entry created with tx hash + delta

### Expected Fee Math
```
Input: 100 VOID (100_000000000000000000 wei)
Fee:   0.3 VOID (300000000000000000 wei)
Router delta: ~299999999999999990 to 300000000000000010 (rounding)
```

### Debugging
```powershell
# Manual balance check
.\scripts\cast\Get-TokenBalance.ps1 `
  -Token 0x8de4043445939B0D0Cc7d6c752057707279D9893 `
  -Holder 0x687E678aB2152d9e0952d42B0F872604533D25a9 `
  -Decimals 18
```

---

## 4️⃣ Staking + XP Boost (15 min)

### Goal
Staking panel shows live balances; APR = Base + XPOracle boost

### Steps
1. **Open Wallet Tab** in Multi-Tab HUD

2. **Check Initial State**:
   - VOID Balance: Should show `VOID.balanceOf(you)`
   - Staked: Should show `xVOIDVault.balanceOf(you)`
   - Earned: Should show pending rewards
   - APR: Should show **"12.00% + X.XX% XP = YY.YY%"**

3. **Verify XP Boost**:
   - The `+X.XX%` should match `XPOracle.getAPRBoost(your_address)`
   - If you have 0 XP: boost = 0.00%
   - If you have XP: boost > 0%

4. **Stake Flow**:
   - Enter amount (e.g., `10` VOID)
   - If no allowance: Click **Approve** → Sign → Wait
   - Click **Stake** → Confirm → Get tx hash
   - Watch balances update:
     - VOID Balance decreases
     - Staked increases
     - APR recalculates with new boost

5. **Claim Flow** (if earned > 0):
   - Click **Claim** → Confirm
   - Earned should reset to ~0
   - VOID Balance increases

### Pass Criteria
- ✅ All balances display correctly (no "NaN" or crashes)
- ✅ APR = `12.00%` (base) + `XPOracle.getAPRBoost()` (live read)
- ✅ Approve → Stake → Balances update within 5s
- ✅ Buttons disable on invalid input (0, NaN, exceeds balance)
- ✅ Pending tx shows loading state

### XP Boost Math
```typescript
// In WalletTab.tsx
const xpBoost = useReadContract({
  address: XP_ORACLE_ADDRESS,
  abi: xpOracleABI,
  functionName: 'getAPRBoost',
  args: [address],
});

const totalAPR = 12.00 + (xpBoost ? Number(xpBoost) / 100 : 0);
```

### Debugging
```powershell
# Check VOID balance
.\scripts\cast\Get-TokenBalance.ps1 `
  -Token 0x8de4043445939B0D0Cc7d6c752057707279D9893 `
  -Holder 0xYourAddress

# Check staked balance (xVOID)
.\scripts\cast\Get-TokenBalance.ps1 `
  -Token 0xab10B2B5E1b07447409BCa889d14F046bEFd8192 `
  -Holder 0xYourAddress
```

---

## 5️⃣ Performance & Stability (10 min)

### Goal
60 FPS target; no UI crashes; graceful error handling

### Steps
1. **Enable FPS Badge**:
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_SHOW_FPS=1
   ```
   - Restart dev server
   - Badge should appear in bottom-right corner
   - Color coding:
     - 🟢 Teal: ≥55 FPS (good)
     - 🟡 Yellow: 30-54 FPS (acceptable)
     - 🔴 Pink: <30 FPS (poor)

2. **Stress Test**:
   - Walk around entire grid (cross all districts)
   - Rapidly open/close tabs (spam Tab key)
   - Execute 2-3 swaps back-to-back
   - Open World Map Overlay while moving

3. **Monitor**:
   - FPS should stay ≥55 most of the time
   - No visible jank/stutter
   - No browser console errors
   - No white screen crashes

### Pass Criteria
- ✅ FPS ≥60 at 1080p (desktop)
- ✅ FPS ≥30 at 1440p (acceptable)
- ✅ No unhandled React errors
- ✅ Error boundaries show friendly fallback (if triggered)

### Performance Tips
- Disable district heatmap if lag spikes
- Check CPU usage (should be <50% on modern hardware)
- Verify GPU acceleration enabled in browser
- Close other tabs to free memory

---

## 🧪 Negative Tests (10 min)

### Input Validation

1. **Invalid Swap Amount**:
   - Enter `0` → Swap button disabled
   - Enter `abc` → Error: "Invalid number format"
   - Enter `999999999` (exceeds balance) → Error: "Insufficient balance"
   - ✅ All errors use `humanError()` helper (friendly copy)

2. **Invalid Stake Amount**:
   - Enter `-5` → Button disabled
   - Enter `0.00000000000000000001` (below min) → Error shown
   - Enter more than balance → Error: "Insufficient balance"

### RPC Resilience

3. **Primary RPC Failure Simulation**:
   ```bash
   # Edit wagmiConfig.ts temporarily
   # Change primary RPC to invalid URL
   http("https://invalid-rpc.example.com")
   ```
   - App should fallback to ThirdWeb RPC
   - All reads/writes still work
   - No user-facing errors
   - ✅ Revert after test

### Transaction Rejections

4. **User Cancels Tx**:
   - Start swap → Reject in wallet
   - Expected: "Transaction cancelled" message
   - State resets cleanly (no stuck loading)
   - Can retry immediately

---

## 📦 Artifacts to Save

After completing all tests:

### 1. QA Logs
```powershell
# View today's logs
cat qa-reports\2025-11-11.jsonl

# Should contain entries for:
# - swap_executed
# - swap_fee_accrual
# - stake
# - unstake (if tested)
# - approve
```

### 2. Screenshots
Capture these views:
- [ ] Wallet Tab (showing staked + APR boost)
- [ ] Swap Tab (mid-swap with quote visible)
- [ ] Land Tab (with owned parcels highlighted)
- [ ] World Map Overlay (full grid view)
- [ ] FPS Badge (showing ≥60)

### 3. Transaction Hashes
Document in `E2E-RESULTS.md`:
- Swap tx: `0x...`
- Approve tx: `0x...`
- Stake tx: `0x...`
- Claim tx: `0x...`

---

## ✅ Exit Criteria (Phase 3 Lock)

All must pass to consider Phase 3 production-ready:

### Core Functionality
- [ ] **One intro path** (no duplicate modals)
- [ ] **Chain guard** pinned to 84532 (no mainnet calls)
- [ ] **Swap fee** → Router balance delta ≈ 0.3%
- [ ] **Staking** shows real balances; APR = Base + XP boost
- [ ] **Land ownerOf** reflects on-chain reality
- [ ] **HUD sync** across mini-map/grid/overlay

### Performance
- [ ] **FPS badge** ≥60 at 1080p
- [ ] **No crashes** during 90-min session
- [ ] **QA logs** present with tx hashes

### Polish
- [ ] **All colors** via voidTheme CSS vars (no hex leaks)
- [ ] **Error messages** user-friendly (humanError helper)
- [ ] **Loading states** clear (spinners, disabled buttons)

---

## 🐛 Triage Checklist (If Something Fails)

### Wrong Chain?
- Check `wagmiConfig.ts`: `ACTIVE_CHAIN_ID = 84532`
- Check `useChainGuard()`: Should validate `chainId === 84532`
- Verify `.env.local`: `NEXT_PUBLIC_CHAIN_ID=84532`

### Fee Didn't Accrue?
- Re-run fee script: `.\scripts\test-fee-routing.ps1`
- Compare router balance before/after manually:
  ```powershell
  .\scripts\cast\Get-TokenBalance.ps1 -Token <VOID> -Holder <Router>
  ```
- Confirm pair/route in VoidSwapTestnet
- Check slippage tolerance (should be 0.1–2.0%)

### Quotes Return 0 or Revert?
- Inspect slippage BPS (50 = 0.5%)
- Verify token allowance: `cast call <VOID> "allowance(address,address)(uint256)" <you> <swap>`
- Check token decimals (VOID = 18, USDC = 6)
- Ensure liquidity exists in pool

### Lag Spikes?
- Toggle district heatmap off
- Confirm texture streaming enabled
- Check CPU usage (Task Manager)
- Reduce browser window size to 1080p

---

## 🚀 Optional Fast Wins (After E2E)

### Infrastructure
1. **Secondary RPC**:
   - Add to `.env.local`: `NEXT_PUBLIC_BASE_RPC_FALLBACK_2=https://...`
   - Update `wagmiConfig.ts` fallback array

2. **Land Buy CTA**:
   - Wire up "Buy Parcel" button in Land grid
   - Approve → `WorldLandTestnet.buyParcel(tokenId)`
   - Show success tx hash + Basescan link

### Analytics
3. **Subgraph Integration**:
   - Deploy tiny subgraph for parcel history
   - Query: purchases, transfers, district changes
   - Feed Analytics tab with real data

---

## 📞 Support Commands

### Balance Checks
```powershell
# VOID
.\scripts\cast\Get-TokenBalance.ps1 -Token 0x8de4...D9893 -Holder <addr>

# USDC
.\scripts\cast\Get-TokenBalance.ps1 -Token 0xca0D...E8a9 -Holder <addr> -Decimals 6

# xVOID (staked)
.\scripts\cast\Get-TokenBalance.ps1 -Token 0xab10...8192 -Holder <addr>
```

### Ownership Checks
```powershell
# Your parcels
.\scripts\cast\Get-ParcelsOwnedBy.ps1 -Address <your_addr>

# Specific parcel owner
cast call 0xC455...A206 "ownerOf(uint256)(address)" <tokenId> --rpc-url https://sepolia.base.org
```

### Contract Calls
```powershell
# XP boost
cast call 0x8D78...3Ba14 "getAPRBoost(address)(uint256)" <addr> --rpc-url https://sepolia.base.org

# Swap quote
cast call 0x74bD...d8a9 "getQuote(uint256,address,address)(uint256)" <amountIn> <tokenIn> <tokenOut> --rpc-url https://sepolia.base.org
```

---

**Ready to start?** Run `npm run dev` and begin with Section 0️⃣ Pre-Flight Setup! 🚀
