# QUICK START DEPLOYMENT GUIDE

**⚡ Fast-track Week 4 → Phase 2 execution**  
**Time:** 30 minutes initial setup + 7 days background monitoring  
**Cost:** FREE (Base Sepolia testnet)

---

## 🎯 What You'll Do

1. **Setup credentials** (10 min)
2. **Run automated checks** (5 min)
3. **Execute deployment** (30 min)
4. **Monitor for 24h** (background)
5. **Unlock Phase 2** (7 days)

---

## ⚡ Quick Start (30 Minutes)

### Step 1: Create `.env` File (5 minutes)

```bash
# Copy template
cp .env.example .env

# Edit .env file (use your favorite editor)
code .env
```

**Required values:**

```bash
# 1. Get RPC URL (choose one):
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org  # Public (free, slower)
# OR
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY  # Alchemy (faster)

# 2. Create NEW testnet wallet (MetaMask):
# - Create new account
# - Export private key (NO 0x prefix!)
DEPLOYER_PRIVATE_KEY=abc123def456...  # NO 0x PREFIX

# 3. Get Basescan API key (optional but recommended):
# - Visit: https://basescan.org/myapikey
# - Sign up, create key
BASESCAN_API_KEY=YOUR_API_KEY

# 4. Database URL (if using Supabase/PostgreSQL):
DATABASE_URL=postgresql://...
```

---

### Step 2: Fund Wallet (5 minutes)

**Get 0.5 ETH on Base Sepolia (FREE):**

1. Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Paste your deployer wallet address
3. Request 0.5 ETH
4. Wait ~30 seconds for confirmation

**Verify balance:**
```bash
node scripts/orchestrator/deployment-orchestrator.js check
```

---

### Step 3: Install Dependencies (3 minutes)

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify dotenv
```

---

### Step 4: Run Pre-Flight Validation (2 minutes)

```bash
node scripts/orchestrator/deployment-orchestrator.js check
```

**Expected output:**
```
═══════════════════════════════════════════════════════════
  1. ENVIRONMENT SETUP VALIDATION
═══════════════════════════════════════════════════════════

✅ BASE_SEPOLIA_RPC_URL: Present
✅ DEPLOYER_PRIVATE_KEY: Present
✅ BASESCAN_API_KEY: Present
✅ DATABASE_URL: Present
✅ All environment variables present

═══════════════════════════════════════════════════════════
  2. RPC CONNECTION TEST
═══════════════════════════════════════════════════════════

✅ Connected to base-sepolia (Chain ID: 84532)

═══════════════════════════════════════════════════════════
  3. DEPLOYER WALLET BALANCE
═══════════════════════════════════════════════════════════

ℹ️  Address: 0x...
ℹ️  Balance: 0.5 ETH
✅ Wallet has sufficient balance (≥0.5 ETH)

... (more checks)

═══════════════════════════════════════════════════════════
  VALIDATION SUMMARY
═══════════════════════════════════════════════════════════

ℹ️  Checks passed: 5/9
ℹ️  Checks failed: 4/9
✅ READY FOR DEPLOYMENT
ℹ️  Run: node scripts/orchestrator/deployment-orchestrator.js deploy
```

**If ANY critical checks fail:**
- Fix the issues listed
- Re-run `check` command
- Don't proceed to deployment until all critical checks pass

---

### Step 5: Execute Deployment (30 minutes)

```bash
node scripts/orchestrator/deployment-orchestrator.js deploy
```

**What happens:**
1. ✅ Deploys 25 contracts (~5 min)
2. ✅ Verifies on Basescan (~3 min)
3. ✅ Updates `.env` with addresses (~1 min)
4. ✅ Validates fee distribution (~2 min)

**Expected output:**
```
═══════════════════════════════════════════════════════════
  EXECUTING WEEK 4 DEPLOYMENT
═══════════════════════════════════════════════════════════

ℹ️  Running pre-flight validation...
✅ Pre-flight checks passed. Proceeding with deployment...

═══════════════════════════════════════════════════════════
  STEP 1: DEPLOYING CONTRACTS
═══════════════════════════════════════════════════════════

ℹ️  This will take ~5 minutes...

🚀 Deploying Week 2 Contracts to Base Sepolia...
✅ VOID deployed: 0x...
✅ PSX deployed: 0x...
... (25 contracts)

✅ Contracts deployed successfully

═══════════════════════════════════════════════════════════
  ✅ DEPLOYMENT COMPLETE
═══════════════════════════════════════════════════════════

✅ All contracts deployed and verified

Next steps:
1. Start AI telemetry: node scripts/ai-telemetry.js daemon
2. Migrate land grid: psql $DATABASE_URL -f migrations/001_land_grid_setup.sql
3. Run validation: node scripts/orchestrator/deployment-orchestrator.js validate
```

---

## 📋 Post-Deployment Steps

### Day 2: HUD Integration (45 minutes)

**1. Start dev server:**
```bash
npm run dev
```

**2. Test all hubs:**
- Navigate to WORLD hub → Check missions display
- Navigate to DEFI hub → Check vaults display
- Navigate to CREATOR hub → Check creator dashboard
- Navigate to AI_OPS hub → Check telemetry display

**3. Verify no console errors:**
- Open browser DevTools (F12)
- Check Console tab
- Navigate through all hubs
- Expected: Zero errors

---

### Day 3: AI Telemetry (30 minutes)

**1. Start telemetry daemon:**
```bash
# Option A: Direct execution
node scripts/ai-telemetry.js daemon

# Option B: PM2 (recommended)
pm2 start scripts/ai-telemetry.js --name void-telemetry -- daemon
pm2 logs void-telemetry
```

**2. Verify logs updating:**
```bash
# Wait 5 minutes, then check:
cat logs/ai/telemetry/aggregated_telemetry.json
```

**Expected:**
```json
{
  "timestamp": 1699635600000,
  "cycleCount": 5,
  "systemHealth": "ALL_HEALTHY",
  "services": {
    "missionAI": { "status": "UP" },
    "emissionAI": { "status": "UP" },
    "vaultAI": { "status": "UP" }
  }
}
```

**3. Let run for 24 hours** (background monitoring)

---

### Day 4: Land Grid Migration (30 minutes)

**1. Run migration:**
```bash
psql $DATABASE_URL -f migrations/001_land_grid_setup.sql
```

**2. Verify parcels:**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM land_parcels;"
```

**Expected:** `1600`

**3. Test in HUD:**
- Open WORLD hub
- Hover over parcels on 3D grid
- Verify parcel info displays (ID, coordinates, district)

---

### Day 5: System Heartbeat (20 minutes)

**1. Run heartbeat:**
```bash
npx ts-node scripts/system/heartbeat.ts
```

**Expected:**
```
✅ XPOracle: HEALTHY (45ms)
✅ MissionRegistry: HEALTHY (52ms)
... (9 services)

Overall System Health: HEALTHY ✅
Average Response Time: 47ms ✅
24h Uptime: 98.5% ✅
```

**2. Save report:**
- Report auto-saved: `logs/system/heartbeat_YYYY-MM-DD.json`

---

### Day 6: HUD Optimization (60 minutes)

**Manual code updates:**
1. Add React.memo to expensive components
2. Lazy load WorldGrid3D
3. Implement event aggregation
4. Debounce frequent updates

**Performance targets:**
- CPU ≤30%
- Hub transitions <500ms
- FPS ≥30

---

### Day 7: Phase 1 Completion (30 minutes)

**1. Run all validations:**
```bash
node scripts/orchestrator/deployment-orchestrator.js validate
```

**Expected:**
```
✅ PHASE 1 COMPLETE - READY FOR PHASE 2
ℹ️  Review: PHASE_2_COSMETICS_UNLOCK_GUIDE.md
```

**2. Export artifacts:**
```bash
mkdir phase1-complete
cp deployments/baseSepolia/deployed_addresses.json phase1-complete/
cp logs/ai/telemetry/aggregated_telemetry.json phase1-complete/
cp logs/system/heartbeat_*.json phase1-complete/
tar -czf phase1-complete-$(date +%Y%m%d).tar.gz phase1-complete/
```

---

## 🎯 Phase 2 Unlock (After 24h Stable)

### Pre-Unlock Validation

**Run readiness check:**
```bash
node scripts/orchestrator/deployment-orchestrator.js phase2
```

**Expected:**
```
✅ Telemetry uptime ≥95% (24h)
✅ Contracts responding
✅ Cosmetics LOCKED
✅ READY FOR PHASE 2 COSMETICS UNLOCK
ℹ️  Proceed with: PHASE_2_COSMETICS_UNLOCK_GUIDE.md → Day 1
```

**If ready → Start Phase 2 Day 1:**
- Create cosmetic data structures (local storage only)
- NO minting, NO IPFS uploads
- Cosmetics remain LOCKED

---

## 🚨 Troubleshooting

### Issue: "Insufficient funds for gas"
```bash
# Check balance
node scripts/orchestrator/deployment-orchestrator.js check

# Get more ETH
# Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
```

### Issue: "RPC connection failed"
```bash
# Test RPC manually
curl -X POST $BASE_SEPOLIA_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# If fails, use alternative RPC:
# Alchemy: https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```

### Issue: "Module not found: hardhat"
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify dotenv
```

### Issue: "AI telemetry not updating"
```bash
# Check if running
pm2 list

# Restart if needed
pm2 restart void-telemetry
pm2 logs void-telemetry
```

---

## 📚 Reference Documentation

**Quick Reference:**
- This guide (you are here)
- `DEPLOYMENT_READINESS_SHEET.md` - Complete checklist
- `WEEK_4_QUICK_START.md` - Fast-track card

**Detailed Guides:**
- `WEEK_4_DEPLOYMENT_GUIDE.md` - Full 7-day plan (650 lines)
- `WEEK_4_PREREQUISITES.md` - Credential setup (400 lines)
- `PHASE_2_COSMETICS_UNLOCK_GUIDE.md` - Cosmetics unlock (1,250 lines)

**Scripts:**
- `scripts/orchestrator/deployment-orchestrator.js` - Automated validation & deployment
- `scripts/deploy/deploy-week2-testnet.ts` - Main deployment
- `scripts/verify/verify-contracts.ts` - Basescan verification
- `scripts/system/heartbeat.ts` - System health monitor
- `scripts/ai-telemetry.js` - AI telemetry daemon

---

## ✅ Success Checklist

**Before deployment:**
- [ ] `.env` file created with 4 variables
- [ ] Wallet funded (≥0.5 ETH Base Sepolia)
- [ ] Dependencies installed
- [ ] Pre-flight check passed

**After deployment:**
- [ ] 25 contracts deployed and verified
- [ ] `.env` updated with addresses
- [ ] Fee distribution validated
- [ ] HUD integration tested
- [ ] AI telemetry running 24h+
- [ ] Land grid migrated (1,600 parcels)
- [ ] System heartbeat passing
- [ ] Phase 1 validation complete

**Ready for Phase 2:**
- [ ] Telemetry uptime ≥95% (24h)
- [ ] HUD stable (no errors)
- [ ] Contracts responding
- [ ] Cosmetics LOCKED
- [ ] Phase 2 readiness check passed

---

**Next:** Run `node scripts/orchestrator/deployment-orchestrator.js check` to start!
