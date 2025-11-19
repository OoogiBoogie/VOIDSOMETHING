# VOID UTILITY + XP SYSTEM — IMPLEMENTATION GUIDE (v3 Final)

**Version:** 3.0 Final  
**Status:** Canonical Specification  
**Audience:** Developers, AI agents, frontend teams, mini-app creators

---

## 🎯 EXECUTIVE SUMMARY

**The Big Change in v3:**

| Aspect | v2 (Old) | v3 (New) |
|--------|----------|----------|
| **Utility Burns** | Blocked by daily caps | ✅ **Always work** |
| **XP Rewards** | Unlimited if caps not hit | ✅ **Diminishing returns** |
| **User Experience** | "Cap exceeded" errors | ✅ **Frictionless** |
| **Whale Handling** | Limited by caps | ✅ **Unlimited utility, limited XP** |

**Core Philosophy:**
- **Utility always works** (unlocks, upgrades, progression)
- **Rewards are capped** (XP/airdrop weight)
- **Onboarding is frictionless** (no blocking messages)
- **Whales can use the system** (but don't get infinite XP)

---

## 📐 SYSTEM ARCHITECTURE

### Contract Structure

```
VoidBurnUtility (Core)
├── Burns VOID → dead address
├── Tracks burns (unlimited)
├── Calculates XP (capped)
└── Never blocks utility (unless paused)

XPRewardSystem (Rewards)
├── Awards XP with diminishing returns
├── Calculates airdrop weight
├── Tracks multipliers
└── Handles level progression

DistrictAccessBurn (Utility)
├── Unlocks districts
├── Calls VoidBurnUtility
└── Always succeeds (if VOID available)

LandUpgradeBurn (Utility)
├── Upgrades land parcels
├── Calls VoidBurnUtility
└── Always succeeds (if prerequisites met)

CreatorToolsBurn (Utility)
├── Unlocks creator tiers
├── Calls VoidBurnUtility
└── Always succeeds

PrestigeBurn (Utility)
├── Unlocks prestige ranks
├── Calls VoidBurnUtility
└── Always succeeds

MiniAppBurnAccess (Utility)
├── Unlocks mini-apps
├── Calls VoidBurnUtility
└── Always succeeds
```

---

## 🔥 BURN MECHANICS (v3)

### 1. Core Burn Flow

```solidity
User → Utility Contract → VoidBurnUtility.burnForUtility()
                       → XPRewardSystem.awardXP()
```

**What Happens:**
1. User calls utility function (e.g., `unlockDistrict(2)`)
2. Utility contract checks prerequisites (e.g., district 1 unlocked)
3. Utility contract calls `burnForUtility(user, amount, category, metadata)`
4. VoidBurnUtility:
   - ✅ Checks: `amount >= minBurn`, `amount <= maxBurn`, `!paused`
   - ❌ Does NOT check: daily caps, yearly caps
   - Burns VOID: `transferFrom(user, dead, amount)`
   - Updates tracking: `currentDayUserBurned[user] += amount`
5. XPRewardSystem (optional integration):
   - Calculates XP with diminishing returns
   - Awards XP (capped at 4,500/day)
   - Updates airdrop weight
6. Utility contract updates state: `districtUnlocked[user][2] = true`
7. Returns success

**Critical:** Burns are **NEVER blocked by caps** in v3!

---

### 2. XP Calculation (Diminishing Returns)

```solidity
function calculateXP(uint256 burnAmount) returns (uint256 xp) {
    if (burnAmount <= 3_000e18) {
        // Tier 1: 100% XP
        return burnAmount / 1e18;
    } else if (burnAmount <= 6_000e18) {
        // Tier 2: First 3k at 100%, rest at 50%
        uint256 tier1 = 3_000;
        uint256 tier2 = (burnAmount - 3_000e18) / 1e18 / 2;
        return tier1 + tier2;
    } else {
        // Tier 3: Max 4,500 XP (3,000 + 1,500)
        return 4_500;
    }
}
```

**Example Progression:**

| Total Burned Today | XP Earned | Rate | Utility Works? |
|-------------------|-----------|------|----------------|
| 1,000 VOID | 1,000 XP | 100% | ✅ Yes |
| 3,000 VOID | 3,000 XP | 100% | ✅ Yes |
| 4,000 VOID | 3,500 XP | 50% (last 1k) | ✅ Yes |
| 6,000 VOID | 4,500 XP | Mixed | ✅ Yes |
| 10,000 VOID | 4,500 XP | 0% (last 4k) | ✅ Yes |
| 100,000 VOID | 4,500 XP | 0% (last 94k) | ✅ Yes |
| 1,000,000 VOID | 4,500 XP | 0% (last 994k) | ✅ Yes |

**Key Point:** Utility **always works**, XP just stops increasing.

---

## 🎮 USER EXPERIENCE FLOWS

### Flow 1: New User Onboarding (0-3k VOID)

```
User connects wallet
  ↓
UI shows: "Welcome! Start unlocking the VOID"
  ↓
User unlocks District 2 (100 VOID)
  ↓
✅ District unlocked
✅ 100 XP earned (100% rate)
  ↓
User upgrades land (1,000 VOID)
  ↓
✅ Land upgraded
✅ 1,000 XP earned (100% rate)
  ↓
Total: 1,100 VOID burned, 1,100 XP earned
UI: "Great progress! Keep going!"
```

**No friction, full rewards.**

---

### Flow 2: Active User (3k-6k VOID)

```
User already burned 3,000 VOID today
  ↓
UI shows: "3,000 XP earned (XP slowing down)"
  ↓
User unlocks creator tier (2,000 VOID)
  ↓
✅ Creator tier unlocked
✅ 1,000 XP earned (50% rate)
  ↓
Total: 5,000 VOID burned, 4,000 XP earned
UI: "XP earning reduced, but all features available!"
```

**Utility works, XP slows.**

---

### Flow 3: Whale User (6k+ VOID)

```
User already burned 6,000 VOID today
  ↓
UI shows: "4,500 XP earned (daily cap reached)"
  ↓
User unlocks all remaining districts (1M VOID)
  ↓
✅ All districts unlocked
❌ 0 XP earned (cap hit)
  ↓
User upgrades 10 land parcels (5M VOID)
  ↓
✅ All land upgraded
❌ 0 XP earned (cap hit)
  ↓
User unlocks prestige rank 10 (100M VOID)
  ↓
✅ Prestige rank 10 unlocked ("Eternal Badge")
❌ 0 XP earned (cap hit)
  ↓
Total: 106M VOID burned, 4,500 XP earned
UI: "Maximum progress achieved! XP resets tomorrow."
```

**Unlimited utility, capped XP.**

**Critical UX Rule:** UI never says "Action blocked." Only "XP capped."

---

## 📊 AIRDROP WEIGHT SYSTEM

### Base Formula

```
Airdrop Weight = Lifetime XP × Multipliers
```

### Multipliers

| Source | Range | Calculation |
|--------|-------|-------------|
| **Prestige Rank** | 1.0x - 5.0x | `1.0 + (rank × 0.4)` |
| **Creator Tier** | 1.0x - 2.5x | `1.0 + (tier × 0.5)` |
| **Districts** | 1.0x - 2.0x | `1.0 + (count × 0.2)` |
| **Mini-Apps** | 1.0x - 1.5x | `1.0 + min(count × 0.05, 0.5)` |

### Example Calculation

```
User Stats:
- Lifetime XP: 50,000
- Prestige Rank: 8 → 4.2x
- Creator Tier: 3 → 2.5x
- Districts: 5 → 2.0x
- Mini-Apps: 10 → 1.5x

Airdrop Weight = 50,000 × 4.2 × 2.5 × 2.0 × 1.5
               = 50,000 × 31.5
               = 1,575,000
```

**Multipliers update automatically on unlocks.**

---

## 🛡️ SAFETY MECHANISMS

### What Blocks Burns (v3)

| Mechanism | Blocks Burns? | Purpose |
|-----------|---------------|---------|
| **Daily User Cap** | ❌ No | XP calculation only |
| **Daily Global Cap** | ❌ No | Analytics only |
| **Yearly Cap** | ❌ No | Analytics only |
| **Insufficient VOID** | ✅ Yes | Wallet doesn't have tokens |
| **Missing Prerequisites** | ✅ Yes | E.g., need District 1 before 2 |
| **Emergency Pause** | ✅ Yes | Admin emergency stop |
| **Contract Paused** | ✅ Yes | Individual module pause |

**Only 4 things can stop burns** (3 are logic, 1 is emergency).

---

### Emergency Pause

```solidity
// Admin pauses entire burn system
VoidBurnUtility.pauseBurns()
  → All burns revert with "Pausable: paused"

// Admin unpauses
VoidBurnUtility.unpauseBurns()
  → Burns resume normally
```

**Use Cases:**
- Critical bug discovered
- Exploit detected
- Contract upgrade needed
- Regulatory emergency

---

## 🔧 DEVELOPER INTEGRATION GUIDE

### For Mini-App Developers

**Your mini-app unlocks are simple:**

```solidity
// In your mini-app unlock function
function unlockMyApp() external {
    uint256 cost = 50_000 * 1e18; // 50k VOID
    
    // Call burn utility
    voidBurnUtility.burnForUtility(
        msg.sender,
        cost,
        BurnCategory.MINIAPP_ACCESS,
        "MY_APP_UNLOCK"
    );
    
    // Grant access
    appUnlocked[msg.sender] = true;
    
    // Update XP system (optional)
    xpRewardSystem.updateMiniAppsUnlocked(msg.sender, 1);
}
```

**That's it!** You don't need to think about:
- XP caps
- Daily limits
- Diminishing returns
- Airdrop weights

**System handles everything.**

---

### For Frontend Developers

**Display XP status:**

```javascript
// Get user XP data
const xpToday = await voidBurnUtility.getUserXPToday(userAddress);
const burnedToday = await voidBurnUtility.getUserCurrentDayBurned(userAddress);
const creditedToday = await voidBurnUtility.getCreditedBurnToday(userAddress);

// Display to user
if (xpToday >= 4500) {
  showMessage("XP cap reached for today! Actions still work.");
} else if (xpToday >= 3000) {
  showMessage("XP earning at 50% rate. Keep going!");
} else {
  showMessage(`${xpToday} / 4,500 XP earned today`);
}

// Show burn stats (always positive)
showStats({
  totalBurned: burnedToday,
  xpEarned: xpToday,
  actionsAvailable: "Unlimited ✅"
});
```

**Never show:** "Cannot perform action - cap exceeded"  
**Always show:** Positive messages about progress

---

### For Contract Developers

**Utility contract template:**

```solidity
contract MyUtilityContract {
    VoidBurnUtility public immutable burnUtility;
    
    function unlockFeature(uint8 featureId) external {
        // 1. Check prerequisites
        require(!featureUnlocked[msg.sender][featureId], "Already unlocked");
        
        // 2. Get cost
        uint256 cost = featureCosts[featureId];
        
        // 3. Burn VOID (NEVER reverts from caps in v3!)
        burnUtility.burnForUtility(
            msg.sender,
            cost,
            BurnCategory.YOUR_CATEGORY,
            string(abi.encodePacked("FEATURE_", featureId))
        );
        
        // 4. Grant access
        featureUnlocked[msg.sender][featureId] = true;
        
        // Done! No cap checks needed.
    }
}
```

---

## 📋 MIGRATION FROM v2 TO v3

### Contract Changes

1. **VoidBurnUtility.sol:**
   - ❌ Removed: `require(currentDayBurned + amount <= dailyGlobalCap)`
   - ❌ Removed: `require(currentDayUserBurned + amount <= dailyUserCap)`
   - ❌ Removed: `require(currentYearBurned + amount <= yearlyGlobalCap)`
   - ✅ Added: `calculateXP()` function
   - ✅ Added: `getCreditedBurnToday()` view
   - ✅ Added: XP tier constants

2. **XPRewardSystem.sol:**
   - ✅ Created: New contract for XP/airdrop logic
   - ✅ Added: Diminishing returns
   - ✅ Added: Multiplier system
   - ✅ Added: Airdrop weight calculation

3. **No changes needed:**
   - DistrictAccessBurn.sol
   - LandUpgradeBurn.sol
   - CreatorToolsBurn.sol
   - PrestigeBurn.sol
   - MiniAppBurnAccess.sol

### UI Changes

**Old UI (v2):**
```
❌ "Daily cap exceeded. Try again tomorrow."
❌ "Cannot unlock - cap reached."
❌ Burns blocked, user frustrated
```

**New UI (v3):**
```
✅ "XP cap reached! Actions still work."
✅ "4,500 / 4,500 XP earned today"
✅ Burns always work, user happy
```

---

## ✅ TESTING CHECKLIST

- [ ] Burn 1k VOID → Earn 1k XP → Utility works
- [ ] Burn 3k VOID → Earn 3k XP → Utility works
- [ ] Burn 6k VOID → Earn 4.5k XP → Utility works
- [ ] Burn 100k VOID → Earn 4.5k XP → Utility works
- [ ] Burn during pause → Reverts (only pause blocks)
- [ ] Burn with insufficient VOID → Reverts
- [ ] XP resets daily
- [ ] Airdrop weight updates on unlocks
- [ ] UI shows correct messages
- [ ] No "cap exceeded" blocking errors

---

## 🎯 SUCCESS CRITERIA

**v3 implementation is complete when:**

1. ✅ All utility burns work regardless of daily volume
2. ✅ XP diminishes correctly (100% → 50% → 0%)
3. ✅ UI never shows "action blocked by cap"
4. ✅ Whales can unlock everything in one day
5. ✅ Casuals get full XP from small burns
6. ✅ Airdrop weights calculated fairly
7. ✅ Emergency pause is only blocker
8. ✅ Documentation is clear
9. ✅ Tests pass (see QA document)
10. ✅ User feedback is positive

---

## 📞 SUPPORT & RESOURCES

- **Smart Contracts:** `c:\Users\rigof\Documents\000\contracts\`
- **QA Tests:** `BURN-SYSTEM-QA-v3-SPEC.md`
- **Original Spec:** See user request (v3 final)
- **Deployment:** `deploy-burn-contracts.ps1`

**Questions?** Refer to this document as canonical source.

---

**Version:** 3.0 Final  
**Last Updated:** November 16, 2025  
**Status:** ✅ Ready for deployment and testing
