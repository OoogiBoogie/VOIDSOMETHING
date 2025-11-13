# 🧪 COMPREHENSIVE TESTING GUIDE - VOID PROTOCOL

## 🎯 AI Testing Prompt

**Copy and paste this to your AI assistant to run comprehensive tests:**

```
I need you to comprehensively test the VOID protocol deployed on Base Sepolia testnet.

DEPLOYMENT INFO:
- Network: Base Sepolia (Chain ID: 84532)
- Deployer: 0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f
- RPC: https://sepolia.base.org

DEPLOYED CONTRACTS:
- VoidHookRouterV4: 0x687E678aB2152d9e0952d42B0F872604533D25a9
- XPOracle: 0x8D786454ca2e252cb905f597214dD78C89E3Ba14
- EscrowVault: 0x1A9b3fE46A6e2A9669D6d53fB58D562b97071FB7
- xVOIDVault: 0xab10B2B5E1b07447409BCa889d14F046bEFd8192
- MissionRegistry: 0x7C6BF84fd111A262CCdfEC885ba8677b3F3EE9c7
- TokenExpansionOracle: 0x2B0CDb539682364e801757437e9fb8624eD50779

TESTING REQUIREMENTS:

1. CONTRACT INTERACTION TESTS:
   a. Create a mission in MissionRegistry
   b. Complete a mission and verify vXP award
   c. Stake VOID tokens in xVOIDVault
   d. Check APR boost calculation
   e. Create an escrow with EscrowVault
   f. Release an escrow and verify funds transferred
   g. Trigger fee distribution through VoidHookRouterV4
   h. Verify all 7 recipient addresses received correct percentages

2. ECONOMIC INVARIANT TESTS:
   a. Verify fee split totals exactly 10000 BPS
   b. Test that APR boost never exceeds 2000 BPS (20%)
   c. Test fee distribution with various amounts
   d. Verify each recipient gets exact percentage:
      - Creator: 40%
      - Staker: 20%
      - PSX Treasury: 10%
      - CREATE Treasury: 10%
      - Agency: 10%
      - Grants: 5%
      - Security: 5%

3. EDGE CASE TESTS:
   a. Test with zero values
   b. Test with max uint256 values
   c. Test with single wei amounts
   d. Test unauthorized access (should revert)
   e. Test invalid parameters (should revert)

4. INTEGRATION TESTS:
   a. Full user flow: Mission → vXP → Staking → APR Boost
   b. Full escrow flow: Create → Lock → Release
   c. Full fee flow: Swap → Fee Collection → Distribution

5. GAS OPTIMIZATION TESTS:
   a. Measure gas costs for each function
   b. Compare against baseline
   c. Identify optimization opportunities

6. MONITORING TESTS:
   a. Run live monitoring for 5 minutes
   b. Verify all stats update correctly
   c. Check for any error messages
   d. Verify Basescan links work

TOOLS AVAILABLE:
- Foundry (forge, cast, anvil)
- Test-Deployment.ps1 (PowerShell monitoring script)
- forge test (Solidity unit tests)
- cast call (read contract state)
- cast send (write transactions)

EXPECTED DELIVERABLES:
1. Test results summary (pass/fail for each test)
2. Gas usage report
3. Any bugs or issues found
4. Recommendations for improvements
5. Confirmation that deployment is production-ready

Please run all tests systematically and provide detailed results.
```

---

## 📍 WHERE TO TEST

### Option 1: Use Foundry Test Suite (Recommended)

**Location:** Run from workspace root: `C:\Users\rigof\Documents\000`

```powershell
# Setup environment
$env:Path += ";C:\Users\rigof\.foundry\bin"
$env:FOUNDRY_DISABLE_NIGHTLY_WARNING = "true"

# Run all tests
forge test -vv

# Run specific test file
forge test --match-path test/EconomicInvariants.t.sol -vvv

# Run with gas reporting
forge test --gas-report

# Run with coverage
forge coverage
```

### Option 2: Use PowerShell Monitoring Script

**Location:** `C:\Users\rigof\Documents\000\scripts\Test-Deployment.ps1`

```powershell
# Run smoke tests
.\scripts\Test-Deployment.ps1 -SmokeTest

# Start live monitoring
.\scripts\Test-Deployment.ps1 -Monitor

# Run both
.\scripts\Test-Deployment.ps1 -All
```

### Option 3: Manual Testing with Cast CLI

**Location:** Run from workspace root

```powershell
# Setup
$env:Path += ";C:\Users\rigof\.foundry\bin"
$RPC = "https://sepolia.base.org"

# Read contract state
cast call 0x687E678aB2152d9e0952d42B0F872604533D25a9 "CREATOR_SHARE_BPS()(uint256)" --rpc-url $RPC

# Get total vXP
cast call 0x8D786454ca2e252cb905f597214dD78C89E3Ba14 "totalXP()(uint256)" --rpc-url $RPC

# Check mission count
cast call 0x7C6BF84fd111A262CCdfEC885ba8677b3F3EE9c7 "missionCount()(uint256)" --rpc-url $RPC

# Check staked VOID
cast call 0xab10B2B5E1b07447409BCa889d14F046bEFd8192 "totalStakedVOID()(uint256)" --rpc-url $RPC
```

### Option 4: Basescan Explorer (Web Interface)

**Links:**
- **Main Router:** https://sepolia.basescan.org/address/0x687E678aB2152d9e0952d42B0F872604533D25a9
- **Read Contract:** Click "Contract" tab → "Read Contract"
- **Write Contract:** Click "Contract" tab → "Write Contract" (requires wallet connection)

**What you can do:**
- Read all public variables
- View transaction history
- Test write functions (requires Base Sepolia ETH)
- Verify contract source code

### Option 5: Remix IDE (Advanced)

**Steps:**
1. Go to https://remix.ethereum.org
2. Load contract source from `src/hooks/VoidHookRouterV4.sol`
3. Compile with Solidity 0.8.24
4. Deploy → "At Address" → Paste: `0x687E678aB2152d9e0952d42B0F872604533D25a9`
5. Connect to Base Sepolia network in MetaMask
6. Interact with contract functions

---

## 🔬 DETAILED TEST SCENARIOS

### Test 1: Mission Creation & Completion

**Location:** Use Foundry or Cast

```powershell
# Create test file: test/MissionFlow.t.sol
forge test --match-contract MissionFlowTest -vvv
```

**Expected Result:**
- Mission created with ID 0
- User completes mission
- vXP awarded (check XPOracle totalXP increased)
- MissionRegistry stats updated

### Test 2: Staking Flow

**Location:** Use Foundry

```solidity
// Test staking VOID tokens
function testStakeVOID() public {
    // Mint VOID to user
    // Approve xVOIDVault
    // Stake tokens
    // Verify totalStakedVOID increased
    // Verify user's staked balance
}
```

### Test 3: Fee Distribution

**Location:** Use Foundry

```solidity
// Test fee distribution with 1 ETH
function testFeeDistribution() public {
    uint256 amount = 1 ether;
    // Send fees to router
    // Trigger distribution
    // Verify each recipient got correct %
    // Creator: 0.4 ETH (40%)
    // Staker: 0.2 ETH (20%)
    // PSX: 0.1 ETH (10%)
    // CREATE: 0.1 ETH (10%)
    // Agency: 0.1 ETH (10%)
    // Grants: 0.05 ETH (5%)
    // Security: 0.05 ETH (5%)
}
```

### Test 4: Escrow Lifecycle

**Location:** Use Foundry or Cast

```powershell
# Create escrow
cast send 0x1A9b3fE46A6e2A9669D6d53fB58D562b97071FB7 \
  "createEscrow(address,address,uint256)" \
  <beneficiary> <token> <amount> \
  --rpc-url https://sepolia.base.org \
  --private-key $env:DEPLOYER_PRIVATE_KEY

# Check escrow count
cast call 0x1A9b3fE46A6e2A9669D6d53fB58D562b97071FB7 \
  "escrowCount()(uint256)" \
  --rpc-url https://sepolia.base.org
```

---

## 📊 TEST RESULTS TEMPLATE

Create this file to track results: `test-results.md`

```markdown
# Test Results - VOID Protocol Base Sepolia

**Date:** [Date]
**Tester:** [Name/AI]
**Network:** Base Sepolia

## Contract Interaction Tests
- [ ] Create mission: PASS/FAIL
- [ ] Complete mission: PASS/FAIL
- [ ] Stake VOID: PASS/FAIL
- [ ] APR boost calc: PASS/FAIL
- [ ] Create escrow: PASS/FAIL
- [ ] Release escrow: PASS/FAIL
- [ ] Fee distribution: PASS/FAIL

## Economic Invariant Tests
- [ ] Fee split = 10000 BPS: PASS/FAIL
- [ ] APR boost ≤ 2000 BPS: PASS/FAIL
- [ ] Creator gets 40%: PASS/FAIL
- [ ] Staker gets 20%: PASS/FAIL
- [ ] Others get correct %: PASS/FAIL

## Edge Case Tests
- [ ] Zero values: PASS/FAIL
- [ ] Max values: PASS/FAIL
- [ ] Unauthorized access: PASS/FAIL

## Gas Costs
- Create mission: ___ gas
- Stake VOID: ___ gas
- Distribute fees: ___ gas

## Issues Found
1. [Description]
2. [Description]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Overall Status
- [ ] READY FOR PRODUCTION
- [ ] NEEDS FIXES
```

---

## 🎯 QUICK TEST COMMANDS

### Smoke Test (5 minutes)
```powershell
.\scripts\Test-Deployment.ps1 -SmokeTest
```

### Full Test Suite (15 minutes)
```powershell
forge test -vvv --gas-report
```

### Live Monitoring (Continuous)
```powershell
.\scripts\Test-Deployment.ps1 -Monitor
```

### Manual Contract Read
```powershell
$RPC = "https://sepolia.base.org"
cast call 0x687E678aB2152d9e0952d42B0F872604533D25a9 "CREATOR_SHARE_BPS()(uint256)" --rpc-url $RPC
```

---

## 🚨 CRITICAL TESTS (MUST PASS)

1. **Fee Split = 10000 BPS** ✅ (Already verified)
2. **APR Boost ≤ 2000 BPS** ✅ (Already verified)
3. **All contracts accessible** ✅ (Already verified)
4. **Fee distribution correctness** ⏳ (Needs testing with real txs)
5. **Mission creation & completion** ⏳ (Needs testing)
6. **Staking & unstaking** ⏳ (Needs testing)
7. **Escrow lifecycle** ⏳ (Needs testing)

---

## 📞 GET TESTNET ETH (BASE SEPOLIA)

You'll need Base Sepolia ETH for testing:

1. **Base Sepolia Faucet:**
   - https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - Requires Coinbase account

2. **Alchemy Faucet:**
   - https://www.alchemy.com/faucets/base-sepolia
   - Free, no account needed

3. **Bridge from Sepolia:**
   - Get Sepolia ETH from https://sepoliafaucet.com
   - Bridge to Base Sepolia via https://bridge.base.org/deposit

**Deployer Address:** `0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f`

---

## ✅ TESTING CHECKLIST

Before declaring deployment production-ready:

- [ ] All smoke tests pass (5/5) ✅ DONE
- [ ] Full forge test suite passes
- [ ] Mission creation works
- [ ] Mission completion awards vXP
- [ ] Staking works correctly
- [ ] APR boost calculation accurate
- [ ] Escrow creation works
- [ ] Escrow release works
- [ ] Fee distribution sends to 7 recipients
- [ ] Each recipient gets exact percentage
- [ ] Gas costs are reasonable
- [ ] No unauthorized access possible
- [ ] Edge cases handled gracefully
- [ ] Live monitoring shows correct data
- [ ] All Basescan links work
- [ ] Contract source verified (optional)

---

**TESTING LOCATION:** `C:\Users\rigof\Documents\000`
**PRIMARY TOOL:** `.\scripts\Test-Deployment.ps1`
**SECONDARY TOOL:** `forge test`
**WEB INTERFACE:** https://sepolia.basescan.org
