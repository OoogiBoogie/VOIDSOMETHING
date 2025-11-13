# Void Protocol - Phase 1 Deployment Checklist

**Version:** 2.0  
**Target:** Base Sepolia (84532)  
**Date:** November 12, 2025

---

## Pre-Deployment (Week 0)

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] Foundry installed and updated (`foundryup`)
- [ ] Hardhat configured
- [ ] Environment variables set:
  ```bash
  PRIVATE_KEY=0x...
  BASE_SEPOLIA_RPC=https://sepolia.base.org
  BASESCAN_API_KEY=...
  ALCHEMY_API_KEY=... (optional)
  ```
- [ ] Wallet funded with >0.1 ETH on Base Sepolia
- [ ] Git repository clean (no uncommitted changes)

### Code Validation
- [ ] All contracts compile: `forge build`
- [ ] No compiler warnings
- [ ] Storage layout frozen: `forge inspect VoidScoreV2 storage-layout > deployment/docs/storage-layout.json`
- [ ] ABIs exported: `forge build --extra-output-files abi`

---

## Week 1: Deploy Phase

### Day 1-2: Simulation & Testing

#### Run Mathematical Simulations
- [ ] Score decay validation: `node deployment/simulations/simulateDecay.mjs`
  - Expected: Half-life ~35 days, 90-day decay to ~15%
- [ ] Tier threshold validation: `node deployment/simulations/tierThresholds.mjs`
  - Expected: Bronze 100, Silver 250, Gold 600, S-tier 1500
- [ ] Penalty stacking: `node deployment/simulations/penaltyStacking.mjs`
  - Expected: Range 0.05x - 2.0x confirmed
- [ ] Save simulation reports to `deployment/qa-reports/`

#### Run Test Suite
- [ ] Foundry unit tests: `forge test -vvv`
  - Expected: 100% pass rate
- [ ] VoidScoreV2 specific tests: `forge test --match-contract VoidScoreV2Test`
  - [ ] Dual-score tracking (currentScore, lifetimeScore)
  - [ ] Time decay application
  - [ ] Tier calculation
  - [ ] Event emission (ScoreUpdated, TierReached)
- [ ] Integration tests: `npx hardhat test`
  - Expected: All pass
- [ ] Gas usage report: `forge snapshot`
  - Expected: <$0.20/message on Base Sepolia

#### Load Testing
- [ ] Run 100-user simulation: `node deployment/simulations/simulateUsers.mjs --users=100 --duration=60s`
  - Expected: <1s avg write latency
  - Expected: No reverts
- [ ] Save load test results to `deployment/qa-reports/load-test-results.json`

#### Pre-Flight Check
- [ ] Run: `./deployment/scripts/preflight-check.ps1`
  - [ ] ✅ Environment variables
  - [ ] ✅ Network connectivity
  - [ ] ✅ Wallet balance
  - [ ] ✅ Compilation success
  - [ ] ✅ Test suite passes
  - [ ] ✅ Simulations validated
- [ ] Review pre-flight report: `deployment/qa-reports/preflight-report.json`

**GO/NO-GO DECISION POINT 1:**
- [ ] All simulations show expected behavior
- [ ] Test suite 100% pass rate
- [ ] Pre-flight report all green
- [ ] **Signed off by:** ___________ Date: ___________

---

### Day 3: Deployment Day

#### Deploy Contracts (Base Sepolia)
- [ ] Set network: `export NETWORK=baseSepolia`
- [ ] Deploy VoidScoreV2: `npx hardhat run deployment/scripts/deploy-sepolia.ts --network baseSepolia`
  - [ ] Record deployment tx: `0x...`
  - [ ] Record contract address: `0x...`
  - [ ] Save deployment receipt
- [ ] Deploy or update VoidMessaging (if needed)
  - [ ] Address: `0x...`
- [ ] Deploy or update VoidStorage (if needed)
  - [ ] Address: `0x...`

#### Verify Deployment
- [ ] Check contract deployed: `cast code <address> --rpc-url $BASE_SEPOLIA_RPC`
  - Expected: Non-zero bytecode
- [ ] Check constructor args correct:
  - [ ] VoidMessaging address matches
  - [ ] VoidStorage address matches
- [ ] Check immutable variables set correctly

#### Post-Deployment Tests
- [ ] Call `getCurrentScore(0x0000000000000000000000000000000000000001)`
  - Expected: 0 (no revert)
- [ ] Call `getTier(0x0000000000000000000000000000000000000001)`
  - Expected: 0 (no revert)
- [ ] Call `getLifetimeScore(0x0000000000000000000000000000000000000001)`
  - Expected: 0 (no revert)

**GO/NO-GO DECISION POINT 2:**
- [ ] All contracts deployed successfully
- [ ] Basic view functions work
- [ ] No deployment errors
- [ ] **Signed off by:** ___________ Date: ___________

---

### Day 4-5: Verification & Integration

#### Etherscan Verification
- [ ] Verify VoidScoreV2: `npx hardhat run deployment/scripts/verify-contracts.ts --network baseSepolia`
  - [ ] Wait for confirmation
  - [ ] Check on Basescan: https://sepolia.basescan.org/address/<address>#code
  - [ ] Source code readable: YES / NO
- [ ] Verify VoidMessaging (if redeployed)
- [ ] Verify VoidStorage (if redeployed)

#### Export Addresses
- [ ] Run: `node deployment/scripts/export-addresses.ts`
- [ ] Check generated file: `psx-contracts.json`
  ```json
  {
    "chainId": 84532,
    "contracts": {
      "VoidScoreV2": "0x...",
      "VoidMessaging": "0x...",
      "VoidStorage": "0x..."
    }
  }
  ```
- [ ] Copy to frontend: `cp psx-contracts.json ../lib/contracts/`
- [ ] Copy ABIs: `cp out/VoidScoreV2.sol/VoidScoreV2.json ../lib/contracts/abis/`

#### Frontend Integration
- [ ] Update `chains/baseSepolia.ts` with new addresses
- [ ] Test wallet connection: WalletConnect to Base Sepolia
- [ ] Test contract calls:
  - [ ] `voidScore.getCurrentScore(userAddress)`
  - [ ] `voidScore.getLifetimeScore(userAddress)`
  - [ ] `voidScore.getTier(userAddress)`
- [ ] Test write functions (testnet wallet):
  - [ ] `voidScore.claimProfileBonus()` (if profile set)
  - [ ] `voidMessaging.sendGlobalMessage("test")`
  - [ ] Check score increased

#### E2E Test Suite
- [ ] Run: `npm run test:e2e:sepolia`
  - [ ] User registration flow
  - [ ] Profile setup + bonus claim
  - [ ] Send messages + score increment
  - [ ] Tier progression
  - [ ] Time decay simulation (fast-forward)
- [ ] All E2E tests pass: YES / NO
- [ ] Save results: `deployment/qa-reports/e2e-results.json`

**GO/NO-GO DECISION POINT 3:**
- [ ] Contracts verified on Basescan
- [ ] psx-contracts.json exported
- [ ] Frontend integration successful
- [ ] E2E tests pass
- [ ] **Signed off by:** ___________ Date: ___________

---

### Day 6-7: Monitoring & Initial Validation

#### Set Up Monitoring
- [ ] Deploy Sybil detection: `node deployment/monitoring/detectClusters.mjs --daemon`
- [ ] Import Grafana dashboards:
  - [ ] Score integrity: `deployment/monitoring/dashboards/score-integrity.json`
  - [ ] Spam detection: `deployment/monitoring/dashboards/spam-detection.json`
  - [ ] User behavior: `deployment/monitoring/dashboards/user-behavior.json`
- [ ] Configure alerts:
  - [ ] Prometheus rules: `deployment/monitoring/alerts/alert-rules.yml`
  - [ ] Discord notifications: `deployment/monitoring/alerts/notify-discord.mjs`

#### Initial User Testing
- [ ] Invite 5-10 alpha testers
- [ ] Provide faucet link for Sepolia ETH
- [ ] Monitor first 24 hours:
  - [ ] Total users registered: _____
  - [ ] Messages sent: _____
  - [ ] Score distribution:
    - Bronze: _____
    - Silver: _____
    - Gold: _____
    - S-tier: _____
  - [ ] Errors detected: _____
  - [ ] Spam detected: _____

#### Critical Issue Response
- [ ] If critical bug found:
  - [ ] Pause contract (if pausable)
  - [ ] Notify users on Discord
  - [ ] Execute rollback: See `deployment/docs/ROLLBACK_PLAN.md`
- [ ] If no critical issues:
  - [ ] Continue monitoring
  - [ ] Collect user feedback
  - [ ] Plan fixes for non-critical issues

**GO/NO-GO DECISION POINT 4:**
- [ ] No critical bugs in first 72 hours
- [ ] Monitoring dashboards operational
- [ ] User feedback positive
- [ ] **Signed off by:** ___________ Date: ___________

---

## Week 2: Integration Phase

### HUD Components
- [ ] Create `components/hud/ProfilePassport.tsx`
  - [ ] Displays currentScore, lifetimeScore, tier
  - [ ] Tier-based visual styling
  - [ ] Badge display
  - [ ] Activity stats
- [ ] Create `hooks/useTierUp.ts`
  - [ ] Listens for TierReached events
  - [ ] Triggers confetti animation
  - [ ] Plays sound effect
  - [ ] Shows tier-up modal
- [ ] Create `components/hud/TierChart.tsx`
  - [ ] Progress bar to next tier
  - [ ] Current vs next tier benefits
- [ ] Update `components/hud/HudEconomyStrip.tsx`
  - [ ] Display dual scores (current/lifetime)
  - [ ] Real-time score updates

### Backend API
- [ ] Create `/api/score/:address` endpoint
  - [ ] Returns { currentScore, lifetimeScore, tier }
- [ ] Create `/api/leaderboard` endpoint
  - [ ] Cursor-based pagination
  - [ ] Filter by tier
  - [ ] Limit 200 results/query
- [ ] Create `/api/user/:address/activity` endpoint
  - [ ] Message history
  - [ ] Score progression over time

### Testing
- [ ] Component unit tests
- [ ] API integration tests
- [ ] UI/UX testing with 10 users
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## Week 3: Testing & Optimization

### Public Beta
- [ ] Announce on Discord/Twitter
- [ ] Provide onboarding guide
- [ ] Target: 50 active testers
- [ ] Monitor for 7 days

### Bug Bash
- [ ] Collect bug reports
- [ ] Prioritize: Critical / High / Medium / Low
- [ ] Fix critical bugs within 24 hours
- [ ] Fix high-priority bugs within 72 hours

### Performance Optimization
- [ ] Profile frontend rendering
  - [ ] Target: 60 FPS @ 1080p
- [ ] Optimize API queries
  - [ ] Target: <1s for 95th percentile
- [ ] Reduce bundle size
  - [ ] Target: <500KB initial load

### Sybil Detection Tuning
- [ ] Review cluster detection results
- [ ] Adjust penalty thresholds if needed
- [ ] Validate false positive rate <5%

---

## Week 4: Launch Phase

### Pre-Launch
- [ ] Final security review
- [ ] External audit report received (if applicable)
- [ ] Address any medium/high findings
- [ ] Update documentation with final addresses

### Launch Day
- [ ] Announce public launch
- [ ] Enable leaderboard
- [ ] Take first airdrop snapshot
- [ ] Monitor error rates (target: <0.1%)

### Post-Launch Monitoring (First Week)
- [ ] Daily active users (DAU): _____
- [ ] Total messages sent: _____
- [ ] Average gas cost: $_____ per message
- [ ] Sybil detection rate: _____%
- [ ] User retention (Day 7): _____%

### First Airdrop
- [ ] Calculate eligibility (Tier 2+)
- [ ] Apply adjusted score (Sybil penalties)
- [ ] Generate allocation CSV
- [ ] Execute airdrop via Merkle distributor

---

## Post-Launch (Ongoing)

### Weekly Reviews
- [ ] Review analytics dashboard
- [ ] Analyze tier distribution
- [ ] Monitor score inflation/deflation
- [ ] Adjust parameters if needed (via governance)

### Monthly Audits
- [ ] Security audit
- [ ] Economic model review
- [ ] Sybil detection effectiveness
- [ ] User growth metrics

### Quarterly Planning
- [ ] Plan v2.1 features
- [ ] Token integration (VOID/PSX)
- [ ] Quest system
- [ ] Land integration

---

## Emergency Procedures

### Critical Bug Discovered
1. [ ] Pause contract immediately (if pausable)
2. [ ] Notify community on Discord
3. [ ] Execute rollback plan: `deployment/docs/ROLLBACK_PLAN.md`
4. [ ] Deploy hotfix
5. [ ] Resume operations
6. [ ] Post-mortem report

### Sybil Attack Detected
1. [ ] Run cluster analysis: `node deployment/monitoring/detectClusters.mjs`
2. [ ] Apply penalties to detected clusters
3. [ ] Block wallet addresses (if severe)
4. [ ] Notify community
5. [ ] Tighten detection parameters

### Contract Upgrade Needed
1. [ ] Follow `deployment/docs/UPGRADABILITY_STRATEGY.md`
2. [ ] Deploy new version
3. [ ] Run parallel for 30 days
4. [ ] Migrate users gradually
5. [ ] Deprecate old version

---

## Sign-Offs

### Pre-Deployment
- **Engineering Lead:** ___________ Date: ___________
- **Security Lead:** ___________ Date: ___________
- **Product Owner:** ___________ Date: ___________

### Go-Live
- **Engineering Lead:** ___________ Date: ___________
- **Product Owner:** ___________ Date: ___________
- **Executive Sponsor:** ___________ Date: ___________

---

## Success Metrics

### Deployment Success
- [ ] All contracts deployed and verified ✅
- [ ] psx-contracts.json integrated ✅
- [ ] E2E tests pass ✅
- [ ] Monitoring operational ✅

### Week 1 Success
- [ ] 10+ active users
- [ ] 100+ messages sent
- [ ] <0.1% error rate
- [ ] No critical bugs

### Week 4 Success
- [ ] 50+ active users
- [ ] 1000+ messages sent
- [ ] Leaderboard operational
- [ ] First airdrop executed

### Month 1 Success
- [ ] 100+ active users
- [ ] 10,000+ messages sent
- [ ] Retention >50%
- [ ] Positive user feedback

---

**Current Status:** 🟡 Pre-Deployment  
**Next Milestone:** Run Simulations  
**Target Launch Date:** December 10, 2025
