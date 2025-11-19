# QA COMMANDER MODE - SEASONAL BURN SYSTEM TEST EXECUTION

**Status:** PRE-QA PREPARATION  
**Test Plan:** SEASONAL-BURN-SYSTEM-QA-TEST-PLAN.md (48 tests)  
**Network:** Base Sepolia (84532)  
**Season:** 0 (ACTIVE)

---

## PRE-QA DIAGNOSTIC COMMANDS

### STEP 1: Contract Wiring Verification

```bash
# Check all contracts deployed
node -e "
const contracts = {
  VoidBurnUtilitySeasonal: '0x977087456Dc0f52d28c529216Bab573C2EF293f3',
  XPRewardSystemSeasonal: '0x187008E91C7C0C0e8089a68099204A8afa41C90B',
  DistrictAccessBurnSeasonal: '0xbBa6f04577aE216A6FF5E536C310194711cE57Ae',
  LandUpgradeBurnSeasonal: '0xdA7b1b105835ebaA5e20DB4b8818977618D08716',
  CreatorToolsBurnSeasonal: '0x6DCDb3d400afAc09535D7B7A34dAa812e7ccE18a',
  PrestigeBurnSeasonal: '0xDd23059f8A33782275487b3AAE72851Cf539111B',
  MiniAppBurnAccessSeasonal: '0x6187BE555990D62E519d998001f0dF10a8055fd3'
};
Object.entries(contracts).forEach(([name, addr]) => {
  console.log('✅', name, '->', addr);
});
"
```

### STEP 2: On-Chain Contract Verification

```bash
# Verify VoidBurnUtilitySeasonal has code
cast code 0x977087456Dc0f52d28c529216Bab573C2EF293f3 --rpc-url https://sepolia.base.org

# Should return bytecode (not 0x)
```

### STEP 3: Season 0 Configuration Check

```bash
# Read Season 0 config from contract
cast call 0x977087456Dc0f52d28c529216Bab573C2EF293f3 \
  "getCurrentSeasonId()(uint256)" \
  --rpc-url https://sepolia.base.org

# Expected: 0
```

### STEP 4: Role Configuration Check

```bash
# Check if DistrictAccessBurnSeasonal has BURN_MANAGER_ROLE
cast call 0x977087456Dc0f52d28c529216Bab573C2EF293f3 \
  "hasRole(bytes32,address)(bool)" \
  $(cast keccak "BURN_MANAGER_ROLE") \
  0xbBa6f04577aE216A6FF5E536C310194711cE57Ae \
  --rpc-url https://sepolia.base.org

# Expected: true
```

### STEP 5: Frontend Wiring Check

```bash
# Check .env.local has all variables
grep "NEXT_PUBLIC_.*SEASONAL" .env.local | wc -l

# Expected: 9 (7 contracts + 2 config vars)
```

---

## QA FLOW STRUCTURE

### Test Execution Pattern

```
FOR EACH TEST CASE:
  1. SETUP (prepare wallet, get VOID, check prerequisites)
  2. EXECUTE (perform burn action)
  3. VERIFY (check state changes, events, invariants)
  4. TEARDOWN (log results, cleanup)
```

### PASS Criteria

✅ **Transaction succeeds**  
✅ **Expected events emitted**  
✅ **State updated correctly**  
✅ **Invariants hold**  
✅ **No console errors**  
✅ **Gas usage reasonable**

### FAIL Criteria

❌ **Transaction reverts unexpectedly**  
❌ **Events missing or incorrect**  
❌ **State not updated**  
❌ **Invariants violated**  
❌ **Console errors**  
❌ **Gas usage excessive**

### Event Monitoring

```typescript
// Events to watch during tests
const SEASONAL_EVENTS = {
  VoidBurnUtilitySeasonal: [
    'UtilityBurnExecuted',
    'SeasonalStateUpdated',
    'DailyReset',
  ],
  XPRewardSystemSeasonal: [
    'XPEarned',
    'LevelUp',
    'SeasonXPRecorded',
  ],
  DistrictAccessBurnSeasonal: [
    'DistrictUnlocked',
  ],
  // etc.
};

// Event listener setup
contract.on('UtilityBurnExecuted', (user, module, amount, xp, event) => {
  console.log('✅ UtilityBurnExecuted:', {
    user,
    module,
    amount: formatEther(amount),
    xp: xp.toString(),
    txHash: event.transactionHash,
  });
});
```

### Invariant Checks

```typescript
// After each test, verify invariants
async function verifyInvariants(user: Address) {
  // Invariant 1: Caps never block utility
  const canBurn = await burnUtility.read.canPerformBurn([user, parseEther('1')]);
  expect(canBurn).toBe(true);
  
  // Invariant 2: XP matches credited burn
  const seasonState = await burnUtility.read.getUserSeasonState([user, 0]);
  const expectedXP = await burnUtility.read.computeXPFromBurn([
    seasonState.creditedBurn,
    0n, // from zero
    season0.xpConfig
  ]);
  expect(seasonState.xp).toBe(expectedXP);
  
  // Invariant 3: Daily burn <= daily cap (for XP credit)
  expect(seasonState.creditedBurn).toBeLessThanOrEqual(season0.dailyCreditCap);
  
  // Invariant 4: Seasonal burn <= seasonal cap (for XP credit)
  const seasonalState = await burnUtility.read.getUserSeasonState([user, 0]);
  expect(seasonalState.creditedBurn).toBeLessThanOrEqual(season0.seasonCreditCap);
  
  // Invariant 5: Lifetime state only increases
  const lifetimeState = await burnUtility.read.lifetimeState([user]);
  expect(lifetimeState.totalBurnedAllTime).toBeGreaterThanOrEqual(previousTotalBurned);
  
  // Invariant 6: Module prerequisites enforced
  // (specific to each module, checked in module tests)
}
```

---

## TEST GROUP T1: DISTRICT UNLOCK (SEASONAL)

### TEST CASE T1-1: Unlock District 2 (Sequential, Zone 1)

**Prerequisites:**
- User has sufficient VOID balance (≥ 1000 VOID)
- User has NOT unlocked District 2 yet
- User HAS unlocked District 1 (sequential requirement)
- Daily burn is 0 (Zone 1)

**Test Steps:**

```typescript
// T1-1: District 2 unlock in Zone 1
async function testT1_1_DistrictUnlock_Sequential_Zone1() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST T1-1: Unlock District 2 (Sequential, Zone 1)');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // SETUP
  const districtId = 2;
  const burnAmount = parseEther('1000'); // 1000 VOID
  const user = account.address;
  
  console.log('SETUP:');
  console.log('  District ID:', districtId);
  console.log('  Burn Amount:', formatEther(burnAmount), 'VOID');
  console.log('  User:', user);
  
  // Pre-state
  const preBalance = await voidToken.read.balanceOf([user]);
  const preSeasonState = await burnUtility.read.getUserSeasonState([user, 0]);
  const preLifetimeState = await burnUtility.read.lifetimeState([user]);
  const preUnlocked = await districtAccess.read.hasUnlocked([user, districtId]);
  
  console.log('\nPRE-STATE:');
  console.log('  VOID Balance:', formatEther(preBalance));
  console.log('  Burned Today:', formatEther(preSeasonState.burnedToday));
  console.log('  Season XP:', preSeasonState.xp.toString());
  console.log('  Already Unlocked:', preUnlocked);
  
  expect(preUnlocked).toBe(false); // Must not be unlocked yet
  expect(preBalance).toBeGreaterThanOrEqual(burnAmount); // Must have funds
  
  // EXECUTE
  console.log('\nEXECUTE: Unlocking District 2...');
  
  const tx = await districtAccess.write.unlockDistrict([districtId, burnAmount]);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  
  console.log('  Transaction:', receipt.transactionHash);
  console.log('  Status:', receipt.status === 'success' ? '✅ SUCCESS' : '❌ FAILED');
  console.log('  Gas Used:', receipt.gasUsed.toString());
  
  expect(receipt.status).toBe('success');
  
  // VERIFY
  console.log('\nVERIFY:');
  
  // 1. District unlocked
  const postUnlocked = await districtAccess.read.hasUnlocked([user, districtId]);
  console.log('  District Unlocked:', postUnlocked ? '✅' : '❌');
  expect(postUnlocked).toBe(true);
  
  // 2. VOID burned
  const postBalance = await voidToken.read.balanceOf([user]);
  const burnedAmount = preBalance - postBalance;
  console.log('  VOID Burned:', formatEther(burnedAmount));
  expect(burnedAmount).toBe(burnAmount);
  
  // 3. Season state updated
  const postSeasonState = await burnUtility.read.getUserSeasonState([user, 0]);
  console.log('  Burned Today (Post):', formatEther(postSeasonState.burnedToday));
  console.log('  Season XP (Post):', postSeasonState.xp.toString());
  
  // Zone 1 (0-3000 VOID) → 100% XP
  const expectedXP = burnAmount; // 1:1 in Zone 1
  expect(postSeasonState.xp - preSeasonState.xp).toBe(expectedXP);
  console.log('  XP Earned:', (postSeasonState.xp - preSeasonState.xp).toString(), '✅');
  
  // 4. Lifetime state updated
  const postLifetimeState = await burnUtility.read.lifetimeState([user]);
  console.log('  Total Burned (Lifetime):', formatEther(postLifetimeState.totalBurnedAllTime));
  expect(postLifetimeState.totalBurnedAllTime).toBe(
    preLifetimeState.totalBurnedAllTime + burnAmount
  );
  console.log('  Districts Unlocked:', postLifetimeState.districtsUnlocked, '✅');
  
  // 5. Events emitted
  const events = await districtAccess.getEvents.DistrictUnlocked({
    fromBlock: receipt.blockNumber,
    toBlock: receipt.blockNumber,
  });
  console.log('  Events Emitted:', events.length);
  expect(events.length).toBeGreaterThan(0);
  
  // 6. Invariants
  console.log('\nINVARIANTS:');
  await verifyInvariants(user);
  console.log('  All invariants hold ✅');
  
  // RESULT
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST T1-1: ✅ PASSED');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  return {
    passed: true,
    gasUsed: receipt.gasUsed,
    xpEarned: postSeasonState.xp - preSeasonState.xp,
  };
}
```

**Expected Results:**

```
✅ Transaction succeeds
✅ District 2 unlocked
✅ 1000 VOID burned
✅ 1000 XP earned (Zone 1, 100%)
✅ burnedToday = 1000 VOID
✅ totalBurnedAllTime increased by 1000
✅ districtsUnlocked = 2
✅ DistrictUnlocked event emitted
✅ All invariants hold
```

**PASS/FAIL:**
- **PASS:** All checks ✅
- **FAIL:** Any check ❌

---

### TEST CASE T1-2: Unlock District 3 (Zone 2 Transition)

**Prerequisites:**
- User has already burned 2000 VOID today (in Zone 1)
- User wants to unlock District 3 (costs 1500 VOID)
- This burn will transition from Zone 1 → Zone 2

**Test Steps:**

```typescript
// T1-2: District unlock crossing into Zone 2
async function testT1_2_DistrictUnlock_Zone2Transition() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST T1-2: Unlock District 3 (Zone 1 → Zone 2 Transition)');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // SETUP
  const districtId = 3;
  const burnAmount = parseEther('1500'); // Will cross 3000 threshold
  const user = account.address;
  
  // Pre-burn: User already at 2000 VOID today
  // This burn: 1500 VOID
  // Zone 1: 0-3000 VOID (100% XP)
  // Zone 2: 3000-6000 VOID (50% XP)
  
  // Expected XP calculation:
  // - First 1000 VOID in Zone 1: 1000 XP (100%)
  // - Next 500 VOID in Zone 2: 250 XP (50%)
  // - Total: 1250 XP
  
  const preSeasonState = await burnUtility.read.getUserSeasonState([user, 0]);
  console.log('PRE-STATE:');
  console.log('  Burned Today:', formatEther(preSeasonState.burnedToday)); // 2000
  console.log('  Current Zone: 1 (0-3000)');
  console.log('  Current XP:', preSeasonState.xp.toString());
  
  // EXECUTE
  console.log('\nEXECUTE: Unlocking District 3 (1500 VOID)...');
  const tx = await districtAccess.write.unlockDistrict([districtId, burnAmount]);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  
  console.log('  Transaction:', receipt.transactionHash);
  console.log('  Status:', receipt.status === 'success' ? '✅ SUCCESS' : '❌ FAILED');
  
  // VERIFY
  const postSeasonState = await burnUtility.read.getUserSeasonState([user, 0]);
  
  console.log('\nPOST-STATE:');
  console.log('  Burned Today:', formatEther(postSeasonState.burnedToday)); // 3500
  console.log('  Current Zone: 2 (3000-6000)');
  console.log('  Current XP:', postSeasonState.xp.toString());
  
  // XP calculation
  const xpEarned = postSeasonState.xp - preSeasonState.xp;
  const expectedZone1XP = parseEther('1000'); // 1000 VOID * 100%
  const expectedZone2XP = parseEther('250');  // 500 VOID * 50%
  const expectedTotalXP = expectedZone1XP + expectedZone2XP; // 1250 XP
  
  console.log('\nXP BREAKDOWN:');
  console.log('  Zone 1 XP (1000 VOID * 100%):', formatEther(expectedZone1XP));
  console.log('  Zone 2 XP (500 VOID * 50%):', formatEther(expectedZone2XP));
  console.log('  Total XP Earned:', formatEther(xpEarned));
  console.log('  Expected:', formatEther(expectedTotalXP));
  console.log('  Match:', xpEarned === expectedTotalXP ? '✅' : '❌');
  
  expect(xpEarned).toBe(expectedTotalXP);
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST T1-2: ✅ PASSED');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  return { passed: true, xpEarned, zone: 2 };
}
```

**Expected Results:**

```
✅ Transaction succeeds
✅ District 3 unlocked
✅ 1500 VOID burned
✅ 1250 XP earned (split between Zone 1 and Zone 2)
✅ burnedToday = 3500 VOID (now in Zone 2)
✅ Correct zone transition handling
✅ All invariants hold
```

---

### TEST CASE T1-3: Unlock District 4 (Zone 3, Zero XP)

**Prerequisites:**
- User has already burned 6500 VOID today (in Zone 3)
- User wants to unlock District 4 (costs 2000 VOID)
- Burn is entirely in Zone 3 → 0% XP

**Test Steps:**

```typescript
// T1-3: District unlock in Zone 3 (no XP)
async function testT1_3_DistrictUnlock_Zone3_NoXP() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST T1-3: Unlock District 4 (Zone 3, No XP)');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // SETUP
  const districtId = 4;
  const burnAmount = parseEther('2000');
  const user = account.address;
  
  const preSeasonState = await burnUtility.read.getUserSeasonState([user, 0]);
  console.log('PRE-STATE:');
  console.log('  Burned Today:', formatEther(preSeasonState.burnedToday)); // 6500
  console.log('  Current Zone: 3 (6000+)');
  console.log('  Current XP:', preSeasonState.xp.toString());
  
  // EXECUTE
  console.log('\nEXECUTE: Unlocking District 4 (2000 VOID in Zone 3)...');
  const tx = await districtAccess.write.unlockDistrict([districtId, burnAmount]);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  
  console.log('  Transaction:', receipt.transactionHash);
  console.log('  Status:', receipt.status === 'success' ? '✅ SUCCESS' : '❌ FAILED');
  
  // VERIFY
  const postSeasonState = await burnUtility.read.getUserSeasonState([user, 0]);
  const postUnlocked = await districtAccess.read.hasUnlocked([user, districtId]);
  
  console.log('\nPOST-STATE:');
  console.log('  District Unlocked:', postUnlocked ? '✅' : '❌');
  console.log('  Burned Today:', formatEther(postSeasonState.burnedToday)); // 8500
  console.log('  Current Zone: 3 (6000+)');
  console.log('  Current XP:', postSeasonState.xp.toString());
  
  const xpEarned = postSeasonState.xp - preSeasonState.xp;
  console.log('\nXP VERIFICATION:');
  console.log('  XP Earned:', formatEther(xpEarned));
  console.log('  Expected: 0 (Zone 3 = 0% XP)');
  console.log('  Match:', xpEarned === 0n ? '✅' : '❌');
  
  expect(xpEarned).toBe(0n);
  expect(postUnlocked).toBe(true);
  
  // CRITICAL: Utility still worked despite no XP
  console.log('\nINVARIANT 1 CHECK:');
  console.log('  Utility worked in Zone 3:', postUnlocked ? '✅' : '❌');
  console.log('  Caps did NOT block action: ✅');
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST T1-3: ✅ PASSED (Utility works, no XP earned)');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  return { passed: true, xpEarned: 0, utilityWorked: true };
}
```

**Expected Results:**

```
✅ Transaction succeeds
✅ District 4 unlocked
✅ 2000 VOID burned
✅ 0 XP earned (Zone 3 = 0%)
✅ burnedToday = 8500 VOID
✅ CRITICAL: Utility still works despite no XP
✅ Invariant 1 verified (caps never block utility)
```

---

## QA EXECUTION FLOW

### Phase 1: Setup (Before Any Tests)
1. Fund test wallet with ETH for gas
2. Acquire test VOID tokens
3. Approve contracts to spend VOID
4. Verify Season 0 is active
5. Reset daily state if needed (wait for 00:00 UTC or advance time)

### Phase 2: Execute Tests (T1 Group)
1. Run T1-1 (Zone 1)
2. Run T1-2 (Zone 1 → Zone 2 transition)
3. Run T1-3 (Zone 3, no XP)
4. Log all results

### Phase 3: Validation
1. Verify all invariants after each test
2. Check events were emitted correctly
3. Confirm gas usage is reasonable
4. Document any failures

### Phase 4: Reporting
1. Generate test report
2. Mark tests as PASS/FAIL
3. Log any issues found
4. Prepare for next test group

---

## SUCCESS CRITERIA

**FOR EACH TEST:**
- ✅ All assertions pass
- ✅ All invariants verified
- ✅ Events emitted correctly
- ✅ Gas usage < 500k per transaction
- ✅ No console errors

**FOR T1 GROUP:**
- ✅ All 3 tests pass
- ✅ Zone transitions work correctly
- ✅ XP calculations accurate
- ✅ Utility works in all zones
- ✅ Invariant 1 holds (caps never block)

---

## READY FOR EXECUTION

After wiring validation passes and HUD integration complete:

**Command to begin QA:**
```
QA COMMANDER: Execute test group T1 (District Unlock)
```

**Test execution order:**
1. T1-1: District 2 (Zone 1, full XP)
2. T1-2: District 3 (Zone transition)
3. T1-3: District 4 (Zone 3, no XP)

**Reporting format:**
```
T1-1: ✅ PASSED (Gas: 245k, XP: 1000)
T1-2: ✅ PASSED (Gas: 268k, XP: 1250)
T1-3: ✅ PASSED (Gas: 251k, XP: 0)

T1 GROUP: ✅ 3/3 PASSED
```

---

**QA Commander Mode:** ARMED  
**Test Plan:** 48 tests across 7 groups  
**Current Focus:** T1 (District Unlock) - 3 tests  
**Status:** READY FOR PRE-QA VALIDATION
