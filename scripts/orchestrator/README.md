# Deployment Orchestrator

**Automated validation and deployment coordination for Week 4 → Phase 2**

---

## Overview

The Deployment Orchestrator automates pre-flight validation, deployment execution, and Phase 2 readiness checks for the VOID testnet deployment pipeline.

---

## Commands

### 1. Pre-Flight Validation

**Check all deployment prerequisites:**

```bash
node scripts/orchestrator/deployment-orchestrator.js check
```

**What it checks:**
- ✅ Environment variables (RPC URL, private key, API key, database URL)
- ✅ RPC connectivity (Base Sepolia chain ID 84532)
- ✅ Deployer wallet balance (≥0.5 ETH)
- ✅ Database connection
- ✅ Hardhat installation
- ✅ Contract deployment status
- ✅ AI telemetry status
- ✅ Land grid migration
- ✅ Cosmetics lock status

**Expected output:**
```
✅ READY FOR DEPLOYMENT
ℹ️  Run: node scripts/orchestrator/deployment-orchestrator.js deploy
```

**If not ready:**
```
⏸️  NOT READY FOR DEPLOYMENT
ℹ️  Fix these critical issues: environment, wallet
```

---

### 2. Execute Deployment

**Deploy all contracts and verify:**

```bash
node scripts/orchestrator/deployment-orchestrator.js deploy
```

**What it does:**
1. Runs pre-flight validation (auto-aborts if fails)
2. Deploys 25 contracts to Base Sepolia (~5 min)
3. Verifies contracts on Basescan (~3 min)
4. Updates `.env` with contract addresses (~1 min)
5. Validates fee distribution (40/20/10/10/10/5/5)

**Expected duration:** ~30 minutes

**Output:**
```
✅ DEPLOYMENT COMPLETE
✅ All contracts deployed and verified

Next steps:
1. Start AI telemetry: node scripts/ai-telemetry.js daemon
2. Migrate land grid: psql $DATABASE_URL -f migrations/001_land_grid_setup.sql
3. Run validation: node scripts/orchestrator/deployment-orchestrator.js validate
```

---

### 3. Post-Deployment Validation

**Verify Phase 1 completion:**

```bash
node scripts/orchestrator/deployment-orchestrator.js validate
```

**What it checks:**
- ✅ All 25 contracts deployed
- ✅ AI telemetry running
- ✅ Land grid migrated (1,600 parcels)
- ✅ Cosmetics locked

**Expected output:**
```
✅ PHASE 1 COMPLETE - READY FOR PHASE 2
ℹ️  Review: PHASE_2_COSMETICS_UNLOCK_GUIDE.md
```

**If incomplete:**
```
⏸️  PHASE 1 INCOMPLETE
ℹ️  Complete remaining steps from WEEK_4_DEPLOYMENT_GUIDE.md
```

---

### 4. Phase 2 Readiness Check

**Verify Phase 2 unlock requirements:**

```bash
node scripts/orchestrator/deployment-orchestrator.js phase2
```

**What it checks:**
- ✅ AI telemetry uptime ≥95% (24 hours)
- ✅ All contracts responding
- ✅ Cosmetics LOCKED (isLocked = true)

**Expected output:**
```
✅ READY FOR PHASE 2 COSMETICS UNLOCK
ℹ️  Proceed with: PHASE_2_COSMETICS_UNLOCK_GUIDE.md → Day 1
```

**If not ready:**
```
⏸️  NOT READY FOR PHASE 2
ℹ️  Address failed checks before unlocking cosmetics
```

---

## Validation Reports

All checks save detailed JSON reports:

**Pre-flight check:**
```
logs/deployment/pre-flight-check.json
```

**Post-deployment validation:**
```
logs/deployment/post-deployment-validation.json
```

**Phase 2 readiness:**
```
logs/deployment/phase2-readiness-check.json
```

**Example report:**
```json
{
  "timestamp": "2025-11-10T14:30:00.000Z",
  "checks": {
    "environment": { "passed": true, "present": [...] },
    "rpc": { "passed": true, "network": { "name": "base-sepolia", "chainId": "84532" } },
    "wallet": { "passed": true, "wallet": { "address": "0x...", "balance": "0.5" } },
    "contracts": { "passed": true, "contractCount": 25 }
  },
  "summary": { "passed": 9, "failed": 0, "total": 9 },
  "ready": true
}
```

---

## Integration with Deployment Pipeline

### Week 4 Day 1: Deployment

```bash
# Step 1: Pre-flight check
node scripts/orchestrator/deployment-orchestrator.js check

# Step 2: Deploy (if ready)
node scripts/orchestrator/deployment-orchestrator.js deploy

# Step 3: Validate deployment
node scripts/orchestrator/deployment-orchestrator.js validate
```

### Week 4 Days 2-6: Integration & Monitoring

- Manual HUD integration
- Start AI telemetry daemon
- Migrate land grid
- Run system heartbeat
- Optimize HUD performance

### Week 4 Day 7: Phase 1 Completion

```bash
# Validate Phase 1 complete
node scripts/orchestrator/deployment-orchestrator.js validate

# Expected: PHASE 1 COMPLETE
```

### After 24h Stable: Phase 2 Unlock

```bash
# Check Phase 2 readiness
node scripts/orchestrator/deployment-orchestrator.js phase2

# If ready → Start Phase 2 Day 1
# Follow: PHASE_2_COSMETICS_UNLOCK_GUIDE.md
```

---

## Error Handling

**All checks are non-destructive:**
- Read-only validation
- No contract calls (except deployment)
- Safe to run multiple times

**Critical vs. Non-Critical Checks:**

**Critical (block deployment):**
- Environment variables
- RPC connection
- Wallet balance
- Hardhat installation

**Non-Critical (warn only):**
- AI telemetry (can start later)
- Land grid (can migrate later)
- Cosmetics lock (Phase 2 only)

---

## Troubleshooting

### "Module not found" errors

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
```

### "RPC connection failed"

```bash
# Test RPC manually
curl -X POST $BASE_SEPOLIA_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### "Insufficient balance"

```bash
# Get testnet ETH
# Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
```

### "Database connection failed"

```bash
# Test database manually
psql $DATABASE_URL -c "SELECT version();"
```

---

## Advanced Usage

### Programmatic Access

```javascript
const { DeploymentOrchestrator } = require('./deployment-orchestrator.js');

// Run pre-flight checks
const results = await DeploymentOrchestrator.runPreFlightChecks();

if (results.ready) {
  // Execute deployment
  await DeploymentOrchestrator.executeDeploy();
}
```

### Custom Validation

```javascript
const { ValidationChecks } = require('./deployment-orchestrator.js');

// Check specific items
const envCheck = ValidationChecks.checkEnvironment();
const rpcCheck = await ValidationChecks.checkRPCConnection();
const walletCheck = await ValidationChecks.checkWalletBalance();
```

---

## Configuration

Edit `CONFIG` object in `deployment-orchestrator.js`:

```javascript
const CONFIG = {
  requiredEnvVars: ['BASE_SEPOLIA_RPC_URL', 'DEPLOYER_PRIVATE_KEY', ...],
  minWalletBalance: '0.5', // ETH
  expectedContractCount: 25,
  telemetryUptimeThreshold: 95, // %
  systemResponseTimeMax: 500, // ms
  expectedParcelCount: 1600,
  treasurySurplusMin: 10000, // USD/week
  // ...
};
```

---

## See Also

- `DEPLOYMENT_READINESS_SHEET.md` - Complete checklist
- `QUICK_START_DEPLOYMENT.md` - Fast-track guide
- `WEEK_4_DEPLOYMENT_GUIDE.md` - Full 7-day plan
- `PHASE_2_COSMETICS_UNLOCK_GUIDE.md` - Cosmetics unlock guide
