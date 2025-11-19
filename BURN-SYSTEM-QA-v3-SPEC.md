# VOID UTILITY + XP SYSTEM — QA TEST PLAN (v3 Final)

## 🎯 TEST PHILOSOPHY (CRITICAL)

**The v3 spec fundamentally changes how caps work:**

❌ **OLD (v2):** Caps blocked utility burns  
✅ **NEW (v3):** Caps only affect XP rewards

**KEY TESTING PRINCIPLES:**
1. ✅ **Utility burns ALWAYS work** (unless paused)
2. ✅ **No "cap exceeded" errors for utility actions**
3. ✅ **XP diminishes but never blocks actions**
4. ✅ **Only emergency pause stops burns**

---

## T1 — District Access (7/8 Complete ✅)

**Status:** Already tested and working  
**Note:** No changes needed for v3 spec (no cap blocking)

- ✅ T1.1: Wallet connection
- ✅ T1.2: District 2 unlock (100k VOID)
- ✅ T1.3: Insufficient VOID error
- ⏭️ T1.4: Wrong network (UI-level)
- ✅ T1.5: Double unlock prevention
- ✅ T1.6: Multiple unlocks (D3 + D4)
- ✅ T1.7: State persistence
- ✅ T1.8: Failure handling

---

## T2 — Land Upgrade (4/7 Complete ✅)

**Status:** Already tested and working  
**Note:** No changes needed for v3 spec

- ✅ T2.1: Costs verified
- ✅ T2.2: Parcel ownership
- ✅ T2.3: Level 1 upgrade
- ✅ T2.4: Level 3 upgrade
- ⏭️ T2.5-T2.7: Optional tests

---

## T3 — Creator Tools (4/6 Complete ✅)

**Status:** Already tested and working  
**Note:** No changes needed for v3 spec

- ✅ T3.1: Costs verified
- ✅ T3.2: Tier 1 unlock
- ✅ T3.3: Tier 2 unlock
- ⏭️ T3.4-T3.5: Optional tests
- ✅ T3.6: Already unlocked test

---

## T4 — Prestige Ranks (10/10 Complete ✅)

**Status:** Already tested and working (high-value unlocks complete)

- ✅ T4.1: Costs verified
- ✅ T4.2-T4.6: Ranks 1-5 unlocked
- ✅ T4.7-T4.10: Ranks 6-10 unlocked (158M VOID burned)

---

## T5 — Mini-App Access (4/7 Complete ✅)

**Status:** Already tested and working

- ✅ T5.1: App registered
- ✅ T5.2-T5.4: Features unlocked
- ⏭️ T5.5-T5.7: Optional tests

---

## T6 — XP SYSTEM & CAPS (v3 REWRITTEN) ⚠️ NEW

**Critical:** These tests verify the new v3 spec where caps affect XP, not utility.

### T6.1 — XP Diminishing Returns (Tier 1: 0-3k VOID)

**Objective:** Verify first 3k VOID earns 100% XP

**Steps:**
1. Reset daily counters (new wallet or wait 24h)
2. Burn 1,000 VOID for district unlock
3. Check XP earned
4. Burn another 2,000 VOID for land upgrade
5. Check total XP earned

**Expected Results:**
```
Burn 1: 1,000 VOID → 1,000 XP earned (100% rate)
Burn 2: 2,000 VOID → 2,000 XP earned (100% rate)
Total: 3,000 VOID → 3,000 XP (1:1 ratio)
```

**Verification:**
- `getUserXPToday(wallet)` returns 3,000
- `getUserCurrentDayBurned(wallet)` returns 3,000e18
- Both utility actions succeeded
- No "cap exceeded" errors

---

### T6.2 — XP Diminishing Returns (Tier 2: 3k-6k VOID)

**Objective:** Verify 3-6k VOID earns 50% XP

**Steps:**
1. Continue from T6.1 (already burned 3k)
2. Burn 3,000 VOID for creator tier unlock
3. Check XP earned

**Expected Results:**
```
Previous: 3,000 VOID → 3,000 XP
New burn: 3,000 VOID → 1,500 XP (50% rate)
Total: 6,000 VOID → 4,500 XP
```

**Verification:**
- `getUserXPToday(wallet)` returns 4,500
- `getUserCurrentDayBurned(wallet)` returns 6,000e18
- Creator tier unlocked successfully
- No errors

---

### T6.3 — XP Diminishing Returns (Beyond 6k VOID)

**Objective:** Verify burns beyond 6k earn 0% XP but still work

**Steps:**
1. Continue from T6.2 (already burned 6k)
2. Burn 5,000 VOID for prestige rank unlock
3. Check XP earned (should not increase)
4. Verify prestige rank unlocked

**Expected Results:**
```
Previous: 6,000 VOID → 4,500 XP
New burn: 5,000 VOID → 0 XP (0% rate)
Total: 11,000 VOID burned → 4,500 XP (capped)
```

**Verification:**
- `getUserXPToday(wallet)` returns 4,500 (unchanged)
- `getUserCurrentDayBurned(wallet)` returns 11,000e18
- ✅ **Prestige rank unlocked successfully** (utility works)
- No "cap exceeded" errors
- UI shows "XP cap reached" but action succeeded

---

### T6.4 — Unlimited Utility Burns (Whale Test)

**Objective:** Verify users can burn unlimited VOID for utility, XP just stops

**Steps:**
1. Perform 20+ utility burns in one day:
   - Unlock all 5 districts (1.85M VOID)
   - Upgrade land to max level (multiple parcels)
   - Unlock all creator tiers (2.6M VOID)
   - Unlock 10+ prestige ranks (155M+ VOID)
   - Unlock multiple mini-apps
2. Track XP throughout
3. Verify all unlocks succeeded

**Expected Results:**
- ✅ All utility burns execute successfully
- XP stops at 4,500 after 6k VOID
- Total burned: 150M+ VOID
- Total XP earned: 4,500 (capped)
- No transactions reverted
- No "cap exceeded" blocking errors
- UI shows XP progress: "4,500 / 4,500 XP today"

**Verification:**
- All districts unlocked
- All land upgraded
- All creator tiers unlocked
- Prestige rank = 10
- All mini-apps unlocked
- XP capped at 4,500
- Zero failed transactions

---

### T6.5 — Daily XP Reset

**Objective:** Verify XP resets daily but unlocks persist

**Steps:**
1. Burn 10k VOID in day 1 (earn 4,500 XP)
2. Wait 24 hours (or simulate time passage)
3. Burn 3k VOID in day 2
4. Check XP earned

**Expected Results:**
```
Day 1: 10,000 VOID → 4,500 XP
Day 2: 3,000 VOID → 3,000 XP (fresh start)
```

**Verification:**
- `getUserXPToday(wallet)` returns 3,000 (day 2)
- `lifetimeXP(wallet)` returns 7,500 (cumulative)
- All unlocks from day 1 still active
- No data loss

---

### T6.6 — XP UI Accuracy

**Objective:** Verify UI shows correct XP behavior

**Steps:**
1. Start with fresh wallet
2. Burn 1k VOID → Check UI shows 1,000 XP
3. Burn 2k VOID → Check UI shows 3,000 XP
4. Burn 3k VOID → Check UI shows 4,500 XP
5. Burn 10k VOID → Check UI still shows 4,500 XP
6. Check UI messages

**Expected UI Behavior:**
- XP meter fills progressively
- Shows "3,000 / 4,500 XP earned today" after burn 3
- Shows "4,500 / 4,500 XP earned today" after burn 4
- Shows message: "XP cap reached for today. Actions still work!"
- Never shows: "Cannot perform action - daily cap exceeded"
- Shows burn count: "11,000 VOID burned today"

---

### T6.7 — Legacy Cap Tracking (Informational Only)

**Objective:** Verify old cap variables still track but don't block

**Steps:**
1. Check `dailyGlobalCap` and `dailyUserCap` values
2. Burn more than old caps
3. Verify burns still work

**Expected Results:**
- Old cap variables exist (for analytics)
- Burns exceed old caps successfully
- No revert errors
- Caps used only for XP calculation

**Verification:**
```solidity
dailyGlobalCap = 500M VOID  // Informational
dailyUserCap = 500M VOID    // Informational
currentDayBurned > dailyGlobalCap  // Burns still work!
```

---

### T6.8 — Emergency Pause (ONLY Thing That Blocks Burns)

**Objective:** Verify pause is the only mechanism that stops burns

**Steps:**
1. Admin calls `pauseBurns()` on VoidBurnUtility
2. Attempt district unlock
3. Expect revert with "Pausable: paused"
4. Admin calls `unpauseBurns()`
5. Retry district unlock
6. Expect success

**Expected Results:**
- ✅ Pause blocks all burns
- ✅ Unpause allows all burns
- ❌ Caps never block burns (only XP)

---

### T6.9 — Airdrop Weight Calculation

**Objective:** Verify airdrop weight uses multipliers correctly

**Steps:**
1. User with:
   - 4,500 XP (lifetime)
   - Prestige rank 5 (3.0x)
   - Creator tier 2 (1.5x)
   - 3 districts unlocked (1.6x)
   - 5 mini-apps unlocked (1.25x)
2. Calculate expected airdrop weight
3. Verify contract calculation

**Expected Calculation:**
```
Base XP: 4,500
Prestige multiplier: 3.0x
Creator multiplier: 1.5x
District multiplier: 1.6x
Mini-app multiplier: 1.25x

Airdrop Weight = 4,500 × 3.0 × 1.5 × 1.6 × 1.25 = 50,625
```

**Verification:**
- `airdropWeight(wallet)` returns ~50,625
- Multipliers update when new unlocks happen
- Weight recalculated after each unlock

---

## T7 — Emergency Pause (Updated for v3)

### T7.1 — Pause All Burns

**Steps:**
1. Call `pauseBurns()` as admin
2. Attempt various burns (district, land, creator, prestige)
3. Verify all revert with "Pausable: paused"

**Expected:** All utility burns blocked during pause

---

### T7.2 — Unpause Resumes Normal Operation

**Steps:**
1. Call `unpauseBurns()` as admin
2. Retry all burn types
3. Verify all succeed

**Expected:** Normal operation resumes, XP caps still apply

---

### T7.3 — Non-Admin Cannot Pause

**Steps:**
1. Try calling `pauseBurns()` from non-admin wallet
2. Expect revert with role error

**Expected:** Only BURN_MANAGER_ROLE can pause

---

## 📊 UPDATED SUCCESS METRICS (v3)

### Critical Assertions (Must Pass):
1. ✅ **No utility burns blocked by XP caps**
2. ✅ **XP diminishes correctly (100% → 50% → 0%)**
3. ✅ **Burns continue after XP cap hit**
4. ✅ **Only pause/admin stops burns**
5. ✅ **UI never shows "action blocked by cap"**
6. ✅ **Airdrop weight calculates correctly**
7. ✅ **Daily resets work properly**
8. ✅ **Multipliers update on unlocks**

### Performance Targets:
- Support 100+ burns per user per day
- XP calculation gas cost < 50k
- No transaction failures from caps
- UI XP updates < 1 second

---

## 🔧 TESTING TOOLS

### Check XP Status:
```solidity
VoidBurnUtility.getUserXPToday(address) → uint256 xp
VoidBurnUtility.getUserCurrentDayBurned(address) → uint256 burned
VoidBurnUtility.getCreditedBurnToday(address) → uint256 credited
```

### Check Airdrop Weight:
```solidity
XPRewardSystem.getUserXPStatus(address) → (lifetime, level, daily, weight)
XPRewardSystem.getUserMultipliers(address) → (prestige, creator, districts, miniApps)
```

### Check Utility State:
```solidity
DistrictAccessBurn.isDistrictUnlocked(address, uint8) → bool
PrestigeBurn.prestigeRank(address) → uint8
CreatorToolsBurn.creatorTier(address) → uint8
```

---

## ✅ FINAL VALIDATION CHECKLIST

- [ ] T6.1: First 3k VOID = 100% XP
- [ ] T6.2: 3-6k VOID = 50% XP
- [ ] T6.3: Beyond 6k = 0% XP, utility still works
- [ ] T6.4: 150M+ VOID burned, all utility works, XP capped
- [ ] T6.5: Daily XP reset works
- [ ] T6.6: UI shows correct XP behavior
- [ ] T6.7: Old caps don't block burns
- [ ] T6.8: Only pause blocks burns
- [ ] T6.9: Airdrop weight calculates correctly
- [ ] T7.1-T7.3: Emergency pause works

**When all checked:** ✅ v3 spec implementation complete!
