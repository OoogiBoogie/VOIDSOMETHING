# Week 2 Deployment Guide

**Status:** ✅ Scripts Ready - Awaiting Deployment Authorization  
**Economic Model:** v5.2 (40/20/10/10/10/5/5) - APPROVED  
**Target Network:** Base Sepolia Testnet  

---

## Prerequisites

### 1. Environment Variables

Create or update `.env` with:

```bash
# Base Sepolia RPC
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
# OR use Alchemy/Infura: https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Deployer wallet (must have ETH on Base Sepolia)
DEPLOYER_PRIVATE_KEY=0x...

# Database (for land grid migration)
DATABASE_URL=postgresql://user:pass@host:5432/void_db

# Optional: Multi-sig addresses (defaults to deployer if not set)
XVOID_STAKING_POOL=0x...
PSX_TREASURY=0x...
CREATE_TREASURY=0x...
AGENCY_WALLET=0x...
CREATOR_GRANTS_VAULT=0x...
SECURITY_RESERVE=0x...
```

### 2. Get Testnet ETH

Deployer wallet needs ~0.5 ETH on Base Sepolia:

```bash
# Option 1: Base Sepolia Faucet
https://portal.cdp.coinbase.com/products/faucet

# Option 2: Bridge from Ethereum Sepolia
https://bridge.base.org/deposit
```

### 3. Install Dependencies

```bash
npm install
```

---

## Deployment Sequence

### Step 1: Deploy Contracts

```bash
npx hardhat run scripts/deploy/deploy-week2-testnet.ts --network baseSepolia
```

**Expected Output:**
- `deployments/CONTRACT_ADDRESSES.testnet.json` - All contract addresses
- `deployments/DEPLOY_LOG_Week2.md` - Deployment log
- Console confirmation with addresses

**What Gets Deployed:**
- ✅ VoidHookRouterV4 (fee router with 40/20/10/10/10/5/5 split)
- ✅ XPOracle (APR boost oracle, +20% max)
- ✅ MissionRegistry (DAO/MissionAI-controlled missions)
- ✅ EscrowVault (dispute resolution for creator deals)
- ✅ TokenExpansionOracle (token eligibility criteria)
- ✅ 7 ERC20 test tokens (PSX, CREATE, VOID, SIGNAL, AGENCY, USDC, WETH)

**Duration:** ~5-10 minutes

---

### Step 2: Validate Fee Distribution

```bash
npx hardhat run scripts/validate/test-fee-distribution.ts --network baseSepolia
```

**Expected Output:**
- `reports/FeeDistributionReport_Week2_Run.json` - Validation telemetry
- Console report with per-recipient breakdown
- Gas metrics (target: ≤150k per tx)

**What Gets Tested:**
- 100 mock purchases @ $10 USDC each = $1,000 total revenue
- Fee routing accuracy (all 6 recipients within 0.1% tolerance)
- Event emissions (FeeDistributed, FeeRoutingExecuted)
- Gas optimization validation

**Pass Criteria:**
- ✅ All recipients receive correct amounts (±0.1%)
- ✅ Fee sum = 100% exact
- ✅ Gas ≤150k per transaction
- ✅ No reverts or errors

**Duration:** ~3-5 minutes

---

### Step 3: Verify Contracts on Basescan

```bash
# Verify VoidHookRouterV4
npx hardhat verify --network baseSepolia <ROUTER_ADDRESS> \
  <XVOID_STAKING_POOL> \
  <PSX_TREASURY> \
  <CREATE_TREASURY> \
  <AGENCY_WALLET> \
  <CREATOR_GRANTS_VAULT> \
  <SECURITY_RESERVE>

# Verify XPOracle
npx hardhat verify --network baseSepolia <XP_ORACLE_ADDRESS> 7200

# Verify other contracts...
```

**Or use automated script (recommended):**

```bash
npx hardhat run scripts/verify-all-contracts.ts --network baseSepolia
```

**Expected Output:**
- Basescan verification links for all contracts
- Source code published
- Contract ABI available

**Duration:** ~10-15 minutes

---

### Step 4: Run Land Grid Migration

```bash
psql $DATABASE_URL -f scripts/MIGRATION_001_fix_land_grid.sql
```

**Expected Output:**
```
INSERT 0 1600
```

**What Gets Created:**
- 1,600 land parcels (40×40 grid)
- District assignments (PLAZA/DEFI/CREATOR/WILDLANDS)
- x/y coordinates (0-39, 0-39)

**Verification:**
```sql
SELECT COUNT(*) FROM land_parcels;
-- Expected: 1600

SELECT district, COUNT(*) FROM land_parcels GROUP BY district;
-- Expected: 4 districts with balanced distribution
```

**Duration:** ~1 minute

---

### Step 5: Update Frontend Environment

Copy addresses from `deployments/CONTRACT_ADDRESSES.testnet.json` to `.env.local`:

```bash
# Create .env.local from template
cp .env.example .env.local

# Edit .env.local with deployed addresses
# Example:
NEXT_PUBLIC_VOID_HOOK_ROUTER_V4=0x...
NEXT_PUBLIC_XP_ORACLE=0x...
NEXT_PUBLIC_MISSION_REGISTRY=0x...
# ... (copy all addresses)
```

**Verification:**
```bash
npm run dev
# Check browser console for contract connection logs
```

---

## Post-Deployment Checklist

### Contract Deployment
- [ ] VoidHookRouterV4 deployed with correct fee split
- [ ] XPOracle deployed with 2-hour staleness threshold
- [ ] MissionRegistry deployed (VoidEmitter address set)
- [ ] EscrowVault deployed with DAO arbitrator
- [ ] TokenExpansionOracle deployed with criteria
- [ ] All 7 ERC20 test tokens deployed
- [ ] CONTRACT_ADDRESSES.testnet.json generated
- [ ] DEPLOY_LOG_Week2.md generated

### Fee Validation
- [ ] 100 test purchases executed successfully
- [ ] All recipients received correct amounts (±0.1%)
- [ ] Gas optimization target met (≤150k)
- [ ] FeeDistributionReport_Week2_Run.json generated
- [ ] No errors or reverts

### Contract Verification
- [ ] VoidHookRouterV4 verified on Basescan
- [ ] XPOracle verified on Basescan
- [ ] MissionRegistry verified on Basescan
- [ ] EscrowVault verified on Basescan
- [ ] TokenExpansionOracle verified on Basescan
- [ ] All ERC20 mocks verified on Basescan

### Database Migration
- [ ] Land grid SQL migration executed
- [ ] 1,600 parcels inserted
- [ ] All parcels have x/y/district
- [ ] No duplicate coordinates

### Frontend Integration
- [ ] .env.local updated with contract addresses
- [ ] Dev server starts without errors
- [ ] Contract connections verified in console
- [ ] No missing environment variables

---

## Troubleshooting

### Deployment Fails: "Insufficient funds"
**Solution:** Add more ETH to deployer wallet. Need ~0.5 ETH for full deployment.

### Fee Validation Fails: "Out of tolerance"
**Solution:** Check VoidHookRouterV4 fee constants match 40/20/10/10/10/5/5. Re-deploy if needed.

### Gas Exceeds Target (>150k)
**Solution:** This is a warning, not a blocker. Document for Phase 2 optimization (batching).

### Basescan Verification Fails
**Solution:** 
- Ensure contract is deployed first
- Wait 30 seconds after deployment
- Check constructor arguments match exactly
- Use Hardhat's built-in verify task

### Database Migration Fails: "Relation already exists"
**Solution:** 
- Check if migration already ran: `SELECT COUNT(*) FROM land_parcels;`
- If needed, rollback: `DELETE FROM land_parcels; DROP TABLE IF EXISTS land_parcels;`
- Re-run migration

---

## Expected Results

### Contract Addresses File

`deployments/CONTRACT_ADDRESSES.testnet.json`:

```json
{
  "tokens": {
    "PSX": "0x...",
    "CREATE": "0x...",
    "VOID": "0x...",
    "SIGNAL": "0x...",
    "AGENCY": "0x...",
    "USDC_Test": "0x...",
    "WETH_Test": "0x..."
  },
  "week1": {
    "XPOracle": "0x...",
    "MissionRegistry": "0x...",
    "EscrowVault": "0x...",
    "TokenExpansionOracle": "0x..."
  },
  "week2": {
    "VoidHookRouterV4": "0x..."
  },
  "multisigs": {
    "xVoidStakingPool": "0x...",
    "psxTreasury": "0x...",
    "createTreasury": "0x...",
    "agencyWallet": "0x...",
    "creatorGrantsVault": "0x...",
    "securityReserve": "0x..."
  }
}
```

### Fee Validation Report

`reports/FeeDistributionReport_Week2_Run.json`:

```json
{
  "testConfig": {
    "network": "Base Sepolia",
    "purchaseCount": 100,
    "purchaseAmountUSDC": "10",
    "totalRevenueUSDC": "1000.0"
  },
  "feeDistribution": {
    "totalDistributed": "600.0",
    "recipients": {
      "xVOID Stakers": {
        "expected": "200.0",
        "actual": "200.0",
        "percentOfTotal": 20.0,
        "deviation": 0.0,
        "status": "PASS"
      },
      // ... (all 6 recipients with PASS status)
    }
  },
  "gasMetrics": {
    "averageGasPerTx": 145000,
    "totalGasUsed": 14500000,
    "gasOptimizationTarget": 150000,
    "targetMet": true
  },
  "validation": {
    "feeSumCorrect": true,
    "allRecipientsWithinTolerance": true,
    "gasTargetMet": true,
    "overallStatus": "PASS"
  }
}
```

---

## Next Steps (Week 2 Continued)

After successful deployment:

1. **Deploy Week 2 Infrastructure** (Task 3)
   - VoidRegistry
   - PolicyManager
   - VoidEmitter (wire to MissionRegistry)
   - VoidTreasury
   - VoidVaultFactory

2. **Integrate SKUFactory → Fee Router** (Task 5)
   - Wire SKUFactory to call VoidHookRouterV4.routeFees()
   - Test end-to-end cosmetic purchase flow
   - Verify events emitted correctly

3. **Build HUD Phase 1** (Tasks 6-10)
   - HUDRoot + HubSwitcher + NotificationToastManager
   - PlayerStatsChip (XP/SIGNAL/rank display)
   - WORLD Hub MVP (MissionBrowser, ParcelInfo)
   - DEFI Hub MVP (VaultPositions, APRBreakdown)
   - CREATOR Hub MVP (CreatorDashboard, FeaturedSKUs)

4. **Build AI Services v0** (Tasks 11-13)
   - EmissionAI (treasury monitoring, emission suggestions)
   - VaultAI (vault health monitoring)
   - MissionAI (static mission generation)

5. **Cosmetics Lock Verification** (Tasks 14-15)
   - Create placeholder hooks (return null/empty)
   - Document unlock conditions
   - Audit codebase for cosmetic references

---

## Support

**Deployment Issues:**
- Check Hardhat console output for errors
- Review `deployments/DEPLOY_LOG_Week2.md`
- Verify `.env` has all required variables

**Fee Validation Issues:**
- Review `reports/FeeDistributionReport_Week2_Run.json`
- Check VoidHookRouterV4 source code matches approved split
- Verify USDC_Test token has sufficient supply

**Database Issues:**
- Check DATABASE_URL connection
- Verify PostgreSQL version ≥12
- Review `scripts/MIGRATION_001_fix_land_grid.sql`

---

## Economic Model Reference

**VoidHookRouterV4 Fee Split (v5.2 - APPROVED):**

| Recipient | % | Weekly @ $10k | 12-Week @ $120k |
|-----------|---|---------------|-----------------|
| Creator Royalties | 40% | $4,000 | $48,000 |
| xVOID Stakers | 20% | $2,000 | $24,000 |
| PSX Treasury | 10% | $1,000 | $12,000 |
| CREATE Treasury | 10% | $1,000 | $12,000 |
| Agency Operations | 10% | $1,000 | $12,000 |
| Creator Grants Vault | 5% | $500 | $6,000 |
| Security Reserve | 5% | $500 | $6,000 |
| **TOTAL** | **100%** | **$10,000** | **$120,000** |

**Validation Metrics:**
- ✅ Fee sum = 10000 bps (100.00% exact)
- ✅ APR equilibrium: +208% @ $500k TVL → +104% @ $1M TVL
- ✅ Treasury surplus: $15k/week after $5k opex = $180k 12-week runway
- ✅ Governance parity: PSX = CREATE = 10% (equal voting power)
- ✅ Creator economics: Top tier $9.6k/month sustainable
- ✅ No inflation risk: Yield backed by fees, not token emissions

---

**Version:** Week 2 Deployment v1.0  
**Last Updated:** 2024-01-08  
**Approval Status:** ✅ FINAL APPROVED BY USER AI
