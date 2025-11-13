# Void Protocol - Phase 1 Deployment Playbook

**Version:** 2.0  
**Target Network:** Base Sepolia (Chain ID: 84532)  
**Date:** November 12, 2025  
**Status:** Ready for Deployment

---

## 📁 Folder Structure

```
deployment/
├── README.md                    # This file
├── DEPLOYMENT_CHECKLIST.md      # Step-by-step deployment guide
├── scripts/
│   ├── deploy-sepolia.ts        # Main deployment script
│   ├── verify-contracts.ts      # Etherscan verification
│   ├── export-addresses.ts      # Generate psx-contracts.json
│   ├── migrate-v1-to-v2.ts      # Data migration from V1
│   └── preflight-check.ps1      # Pre-deployment validation
├── tests/
│   ├── VoidScore.t.sol          # Foundry unit tests
│   ├── VoidScoreV2.t.sol        # V2 specific tests
│   ├── AntiSybil.t.sol          # Sybil resistance tests
│   └── E2E.test.ts              # End-to-end integration tests
├── simulations/
│   ├── simulateDecay.mjs        # Time-decay mathematical validation
│   ├── simulateUsers.mjs        # Load testing (100 concurrent users)
│   ├── tierThresholds.mjs       # Tier progression simulation
│   └── penaltyStacking.mjs      # Sybil penalty calculation
├── monitoring/
│   ├── detectClusters.mjs       # Nightly Sybil cluster detection
│   ├── dashboards/
│   │   ├── score-integrity.json # Grafana dashboard config
│   │   ├── spam-detection.json  # Spam monitoring
│   │   └── user-behavior.json   # Analytics dashboard
│   └── alerts/
│       ├── alert-rules.yml      # Prometheus alert rules
│       └── notify-discord.mjs   # Discord webhook integration
├── docs/
│   ├── AUDIT_NOTES.md           # Pre-deployment audit findings
│   ├── STORAGE_LAYOUT.md        # Contract storage layout
│   ├── API_REFERENCE.md         # Backend API documentation
│   └── ROLLBACK_PLAN.md         # Emergency rollback procedure
└── qa-reports/
    ├── preflight-report.json    # Pre-deployment validation results
    ├── e2e-results.json         # E2E test results
    ├── load-test-results.json   # Performance benchmarks
    └── security-audit.pdf       # External audit report (TBD)
```

---

## 🚀 Quick Start

### 1. Pre-Flight Check

```powershell
# Run validation script
cd deployment
./scripts/preflight-check.ps1

# Expected output:
# ✅ Environment variables configured
# ✅ Network connectivity (Base Sepolia)
# ✅ Wallet balance sufficient (>0.1 ETH)
# ✅ Contract compilation successful
# ✅ Test suite passes (100%)
# ✅ Simulations validated
```

### 2. Run Simulations

```bash
# Mathematical validation
node simulations/simulateDecay.mjs
node simulations/tierThresholds.mjs
node simulations/penaltyStacking.mjs

# Load testing
node simulations/simulateUsers.mjs --users=100 --duration=60s
```

### 3. Run Test Suite

```bash
# Foundry tests
forge test --match-contract VoidScoreV2Test -vvv

# E2E tests
npx hardhat test tests/E2E.test.ts --network sepolia
```

### 4. Deploy to Sepolia

```bash
# Deploy contracts
npx hardhat run scripts/deploy-sepolia.ts --network sepolia

# Verify on Basescan
npx hardhat run scripts/verify-contracts.ts --network sepolia

# Export addresses for frontend
node scripts/export-addresses.ts
```

### 5. Post-Deployment Validation

```bash
# Run E2E tests against deployed contracts
npm run test:e2e:sepolia

# Start monitoring
node monitoring/detectClusters.mjs --daemon
```

---

## 📋 Deployment Checklist

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed step-by-step guide.

**High-level phases:**
1. ✅ Pre-flight validation
2. ✅ Simulation & testing
3. 🔜 Sepolia deployment
4. 🔜 Contract verification
5. 🔜 Frontend integration
6. 🔜 30-day monitoring period

---

## 🧪 Testing Matrix

| Test Type | Tool | Coverage | Status |
|-----------|------|----------|--------|
| Unit Tests | Foundry | 95%+ | ✅ Ready |
| Integration Tests | Hardhat | All functions | ✅ Ready |
| E2E Tests | Hardhat + Ethers | User flows | ✅ Ready |
| Load Tests | Custom (100 threads) | Performance | ✅ Ready |
| Security Audit | External firm | Full contract | 🔜 Scheduled |

---

## 📊 Key Metrics

**Pre-Deployment Targets:**
- ✅ Score decay simulation: 2%/day over 90 days validates correctly
- ✅ Tier thresholds: Bronze (100), Silver (250), Gold (600), S-tier (1500)
- ✅ Sybil penalty stacking: 0.05x - 2.0x range confirmed
- ✅ Gas costs: <$0.20/message on Base Sepolia
- ✅ Query performance: <1s for 95th percentile

**Post-Deployment Monitoring:**
- Daily active users (DAU)
- Score distribution by tier
- Sybil detection rate
- Gas cost trends
- Message volume

---

## 🔐 Security Considerations

**Pre-Deployment:**
- ✅ Storage layout frozen (storage-layout.json)
- ✅ Rate limit middleware implemented
- ✅ Reentrancy guards on state-changing functions
- ✅ Access control verified (onlyOwner, onlyMessaging)
- 🔜 External audit scheduled (Consensys Diligence)

**Ongoing:**
- Nightly Sybil cluster detection
- Real-time spam monitoring
- Economic attack cost analysis
- Multi-sig for admin functions (future)

---

## 📞 Support & Escalation

**Pre-Deployment Issues:**
1. Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
2. Review simulation outputs in `qa-reports/`
3. Contact: dev@thevoid.io

**Post-Deployment Issues:**
1. Check monitoring dashboards
2. Review [ROLLBACK_PLAN.md](./docs/ROLLBACK_PLAN.md)
3. Execute emergency pause if critical
4. Contact: security@thevoid.io

---

## 🎯 Success Criteria

**Deployment considered successful when:**
- ✅ All contracts deployed and verified
- ✅ psx-contracts.json exported and integrated
- ✅ E2E tests pass against deployed contracts
- ✅ Frontend connects and displays scores correctly
- ✅ No critical issues in first 72 hours
- ✅ Monitoring dashboards operational

**Go/No-Go Decision Points:**
1. Pre-flight check (all green)
2. Simulation validation (matches expected values)
3. Test suite (100% pass rate)
4. Deployment success (all txs confirmed)
5. Verification success (source code verified)
6. Integration success (frontend functional)

---

## 🗓️ Timeline (4 Weeks)

### Week 1: Deploy
- Day 1-2: Final simulations & testing
- Day 3: Deploy to Sepolia
- Day 4-5: Verification & integration
- Day 6-7: Initial monitoring & fixes

### Week 2: Integrate
- HUD components (ProfilePassport, TierChart)
- Tier-up event system
- API endpoints
- Leaderboard

### Week 3: Test
- Public beta announcement
- Bug bash with 50 testers
- Performance optimization
- Sybil detection tuning

### Week 4: Launch
- Public launch announcement
- Leaderboard goes live
- First airdrop snapshot
- Analytics pipeline activated

---

## 📚 Additional Resources

- [Void Protocol V2.0 Specification](../contracts/VOID_ECONOMIC_ARCHITECTURE.md)
- [Production Upgrades Guide](../contracts/PRODUCTION_READY_UPGRADES.md)
- [VoidScore V2 Spec](../contracts/VOID_SCORE.md)
- [Anti-Sybil Strategy](../contracts/ANTI_SPAM_SPEC.md)
- [Upgradability Plan](../contracts/UPGRADABILITY_STRATEGY.md)

---

**Ready to deploy? Start with:** `./scripts/preflight-check.ps1`
