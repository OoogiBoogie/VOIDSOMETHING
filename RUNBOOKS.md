# PSX VOID - Runbooks

**Purpose:** Incident response playbooks for production operations  
**Audience:** DevOps, SRE, Protocol Engineers  
**Last Updated:** November 11, 2025

---

## Table of Contents

1. [RPC Outage](#rpc-outage)
2. [Chain Mismatch](#chain-mismatch)
3. [Privy Auth Down](#privy-auth-down)
4. [Critical Vulnerability](#critical-vulnerability)
5. [High Gas Costs](#high-gas-costs)
6. [Contract Upgrade](#contract-upgrade)
7. [UI Deployment Rollback](#ui-deployment-rollback)
8. [Subgraph Sync Issues](#subgraph-sync-issues)

---

## RPC Outage

### Symptoms
- Users report "Network unavailable" banner
- Transactions failing to submit
- Balance queries return errors
- Logs show RPC 429/503 errors

### Immediate Actions (5 min)

1. **Verify Outage**
   ```bash
   curl -X POST https://sepolia.base.org \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
   ```

2. **Check Fallback RPC**
   ```bash
   # If primary down, verify fallback is live
   curl -X POST $FALLBACK_RPC_URL \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
   ```

3. **Monitor Client Behavior**
   - Open browser console → check for automatic fallback
   - Expected: wagmi fallback() switches to backup RPC
   - Users should see brief delay (3-5s) then resume

### Short-Term Fix (30 min)

4. **Add Emergency RPC**
   ```typescript
   // lib/wagmiConfig.ts
   const rpcTransports = fallback([
     http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
     http(process.env.NEXT_PUBLIC_BASE_RPC_URL_FALLBACK),
     http("https://base-sepolia-emergency.example.com"), // ADD THIS
   ], { rank: true, retryCount: 3 });
   ```

5. **Deploy Config Update**
   ```bash
   npm run build
   # Deploy to production (Vercel/Netlify/etc)
   ```

6. **Communicate to Users**
   - Discord/Twitter: "We're aware of RPC issues. App will auto-recover within 5 min."
   - Status page: Update with ETA

### Long-Term Prevention

- **SLA Monitoring:** Alert if primary RPC latency >500ms or error rate >1%
- **Diverse Providers:** Use 3+ different RPC providers (Alchemy, Infura, ThirdWeb, etc.)
- **Health Checks:** Cron job pings all RPCs every 60s
- **Auto-Failover:** wagmi config handles this; verify in E2E tests

---

## Chain Mismatch

### Symptoms
- `useChainGuard()` shows "Wrong network" warning
- User connected to mainnet (chain ID 8453) instead of Sepolia (84532)
- Transactions fail with "unsupported chain" errors

### Immediate Actions (2 min)

1. **Identify User's Chain**
   ```typescript
   // Browser console (user side)
   await window.ethereum.request({ method: 'eth_chainId' })
   // Expected: '0x14ad' (84532)
   // If '0x2105' (8453) → user on mainnet
   ```

2. **Prompt Chain Switch**
   - HUD automatically shows: "Please switch to Base Sepolia"
   - `useChainGuard()` prevents any contract calls
   - User must manually switch in wallet

### User Instructions

**For MetaMask:**
1. Click network dropdown
2. Select "Base Sepolia"
3. If not listed:
   - Add network manually
   - Chain ID: 84532
   - RPC: https://sepolia.base.org
   - Currency: ETH

**For Privy Embedded Wallet:**
1. App auto-switches (if configured)
2. User confirms in modal
3. Refresh if needed

### Prevention

- **Default Chain in wagmiConfig:**
  ```typescript
  const config = createConfig({
    chains: [baseSepolia], // ONLY include Sepolia
    // Do NOT include baseMainnet
  });
  ```

- **Chain Guard on Every Tab:**
  ```typescript
  const { OK, message } = useChainGuard();
  if (!OK) return <ErrorBanner>{message}</ErrorBanner>;
  ```

- **Disable Mainnet in Wallet:**
  - Instructions in onboarding: "Remove Base Mainnet from your wallet"

---

## Privy Auth Down

### Symptoms
- Users can't log in
- "Connect with Privy" button unresponsive
- Console errors: `PrivyProvider: Failed to fetch config`

### Immediate Actions (5 min)

1. **Check Privy Status**
   - https://status.privy.io
   - If red/yellow → outage confirmed

2. **Verify App ID**
   ```bash
   # .env.local
   grep PRIVY_APP_ID .env.local
   # Should match Privy dashboard
   ```

3. **Test with Different Method**
   - Try email login
   - Try Google OAuth
   - Try wallet connection
   - If all fail → Privy outage

### Short-Term Workaround (30 min)

4. **Enable Read-Only Mode**
   ```typescript
   // lib/privy-provider.tsx
   if (!privyReady) {
     return (
       <div>
         <h2>Authentication temporarily unavailable</h2>
         <p>You can browse the app in read-only mode.</p>
         <p>Status: <a href="https://status.privy.io">Privy Status</a></p>
       </div>
     );
   }
   ```

5. **Communicate Downtime**
   - Banner in app: "Auth provider experiencing issues. Read-only mode active."
   - Discord: "Privy is down. We're monitoring. ETA: See status.privy.io"

### Long-Term Prevention

- **Backup Auth:** Consider adding WalletConnect as fallback (no Privy dependency)
- **Graceful Degradation:** Allow anonymous browsing for public data
- **Status Monitoring:** Subscribe to Privy status webhooks

---

## Critical Vulnerability

### Severity Levels

**Critical:** Funds at risk, immediate pause required  
**High:** User data exposure, urgent patch needed  
**Medium:** Non-critical functionality broken, schedule fix  
**Low:** UI glitch, fix in next release

### Critical Vulnerability Response (60 min)

#### Phase 1: Assess (10 min)

1. **Identify Impact**
   - Which contracts affected?
   - How much funds at risk?
   - Is exploit already happening?

2. **Alert Team**
   - Ping #emergency channel
   - Loop in: Lead dev, multisig signers, security team

#### Phase 2: Pause (20 min)

3. **Execute Emergency Pause**
   ```bash
   # If pausable contracts deployed
   cast send $CONTRACT "pause()" \
     --rpc-url $RPC \
     --private-key $PAUSE_GUARDIAN_KEY
   ```

4. **Disable UI**
   ```typescript
   // Add to HUDRoot
   if (EMERGENCY_PAUSE) {
     return (
       <div className="emergency-banner">
         <h1>🚨 Emergency Maintenance</h1>
         <p>All transactions paused. Funds are safe.</p>
         <p>Status: <a href="https://discord.gg/psx-void">Discord</a></p>
       </div>
     );
   }
   ```

#### Phase 3: Fix (30 min)

5. **Deploy Patch**
   - If contract bug → deploy fixed version + migration script
   - If UI bug → fix + redeploy frontend
   - Test on testnet first

6. **Verify Fix**
   ```bash
   # Run E2E test suite
   .\scripts\Test-Conductor.ps1 -WalletPrivKey $TEST_KEY
   ```

#### Phase 4: Resume (10 min)

7. **Unpause Contracts**
   ```bash
   cast send $CONTRACT "unpause()" \
     --rpc-url $RPC \
     --private-key $PAUSE_GUARDIAN_KEY
   ```

8. **Public Disclosure**
   - Blog post: What happened, impact, fix, prevention
   - Discord announcement: "Services restored. Post-mortem in 24h."

---

## High Gas Costs

### Symptoms
- Users complain about expensive transactions
- Base fee >50 gwei on mainnet
- Swap/stake transactions failing due to out-of-gas

### Immediate Actions (5 min)

1. **Check Gas Price**
   ```bash
   cast gas-price --rpc-url $RPC
   # If >50 gwei → high gas period
   ```

2. **Display Warning**
   ```typescript
   // hud/dev/GasBadge.tsx
   const gasPrice = useGasPrice();
   if (gasPrice > 50n * 10n**9n) {
     return <div className="gas-warning">⚠️ Gas is high. Consider waiting.</div>;
   }
   ```

### User Guidance

3. **Recommend Actions**
   - "Gas is high (50+ gwei). Consider waiting 1-2 hours."
   - "Set custom gas limit: 21000 for transfers, 100000 for swaps."
   - "Use 'Slow' speed in wallet to save ~30%."

### Long-Term Solutions

- **Gas Abstraction:** Explore ERC-4337 account abstraction
- **L2 Migration:** Move to Base L2 (already on Base, gas should be low)
- **Batch Transactions:** Allow users to queue multiple actions

---

## Contract Upgrade

### Pre-Deployment Checklist

- [ ] Security audit complete
- [ ] All tests passing (forge test -vvv)
- [ ] Testnet deployment successful
- [ ] E2E testing on testnet (Test-Conductor.ps1)
- [ ] Multisig signers available (3/5 threshold)
- [ ] Timelock delay respected (7 days for mainnet)

### Upgrade Procedure (2 hours)

#### Step 1: Prepare (30 min)

1. **Build Contracts**
   ```bash
   forge build --via-ir --optimizer-runs 200
   ```

2. **Generate Upgrade Calldata**
   ```bash
   cast calldata "upgradeTo(address)" $NEW_IMPLEMENTATION
   ```

3. **Simulate Upgrade**
   ```bash
   # Tenderly/Foundry fork
   forge script scripts/Upgrade.s.sol --fork-url $RPC --broadcast --verify
   ```

#### Step 2: Queue in Timelock (30 min)

4. **Submit to Multisig**
   - Open Safe UI
   - Add transaction: Timelock.queueTransaction(...)
   - Get 3/5 signatures
   - Execute

5. **Wait for Timelock**
   - Mainnet: 7 days
   - Testnet: 2 days

#### Step 3: Execute Upgrade (30 min)

6. **Execute from Timelock**
   ```bash
   # After delay expires
   cast send $TIMELOCK "executeTransaction(...)" \
     --rpc-url $RPC \
     --from $MULTISIG
   ```

7. **Verify New Implementation**
   ```bash
   cast call $PROXY "implementation()(address)" --rpc-url $RPC
   # Should return $NEW_IMPLEMENTATION
   ```

#### Step 4: Verify Functionality (30 min)

8. **Run E2E Tests**
   ```bash
   .\scripts\Test-Conductor.ps1
   ```

9. **Monitor First Transactions**
   - Watch Basescan for first swap/stake
   - Verify fee routing still works
   - Check logs for errors

---

## UI Deployment Rollback

### Symptoms
- Critical UI bug deployed to production
- Users report broken swap/stake buttons
- Error rate spike in logs

### Immediate Rollback (5 min)

1. **Revert Deployment (Vercel)**
   ```bash
   # Vercel dashboard → Deployments → Find previous working version → "Redeploy"
   # Or CLI:
   vercel rollback
   ```

2. **Verify Rollback**
   ```bash
   curl https://app.psx-void.com | grep "version"
   # Should show previous version number
   ```

### Post-Rollback Analysis (30 min)

3. **Identify Root Cause**
   - Check commit diff: `git diff HEAD~1`
   - Review CI logs: .github/workflows/ci.yml
   - Test locally: `npm run dev`

4. **Fix + Redeploy**
   - Apply fix
   - Test with `.\scripts\Test-Conductor.ps1`
   - Redeploy: `vercel --prod`

---

## Subgraph Sync Issues

### Symptoms
- AnalyticsTab shows stale data
- "Last synced 2 hours ago" warning
- Parcel ownership not updating in HUD

### Immediate Actions (10 min)

1. **Check Subgraph Status**
   ```bash
   curl https://api.thegraph.com/subgraphs/name/psx-void/land-testnet | jq '.data._meta'
   ```

2. **Check Block Lag**
   ```json
   {
     "block": {
       "number": 12345,
       "hash": "0x..."
     },
     "hasIndexingErrors": false
   }
   ```
   - Compare to current block: `cast block-number --rpc-url $RPC`
   - If >100 blocks behind → sync issue

### Short-Term Workaround (30 min)

3. **Fallback to RPC Reads**
   ```typescript
   // hud/tabs/AnalyticsTab.tsx
   const { data: subgraphData, error } = useSubgraphQuery();
   
   if (error || isStale(subgraphData)) {
     // Fallback: direct RPC calls
     const data = await fetchFromRPC();
   }
   ```

### Long-Term Fix

4. **Redeploy Subgraph**
   ```bash
   graph deploy --network base-sepolia
   ```

5. **Monitor Sync Progress**
   - Watch Graph Studio dashboard
   - ETA to sync: ~1-2 hours

---

## Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Lead Dev | @dev-lead (Discord) | 24/7 |
| Security Team | security@psx-void.com | 24/7 |
| Multisig Signers | #multisig-ops (Discord) | Business hours |
| RPC Provider Support | Alchemy/Infura support | 24/7 tickets |
| Privy Support | support@privy.io | Business hours |

---

**Note:** Update this runbook after each incident with lessons learned.
