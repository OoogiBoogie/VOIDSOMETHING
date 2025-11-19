# SEASONAL BURN SYSTEM — MIGRATION ANALYSIS

**Role:** VOID Seasonal Burn Architect & QA Guardian  
**Date:** November 16, 2025  
**Status:** 🔍 ANALYSIS PHASE — SPEC COMPARISON IN PROGRESS

---

## EXECUTIVE SUMMARY

**Current System:** v3 Burn System (Daily/Yearly Caps, Unlimited Utility, Limited XP)  
**Target System:** Seasonal Burn System (Season-Based Progression, Per-Season Resets)

**Compliance Status:**
- ✅ **CORE PHILOSOPHY ALIGNED** — Utility always works, caps never block actions
- ⚠️ **TIME MODEL MISMATCH** — Daily/yearly vs. seasonal windows
- ⚠️ **STATE MODEL MISMATCH** — No season-based tracking
- ⚠️ **EVENT MODEL INCOMPLETE** — Missing seasonId, module enum
- ⚠️ **XP CALC PARTIAL** — Daily caps exist, but not seasonal caps

**Migration Complexity:** MODERATE  
**Breaking Changes:** YES (state migration required)  
**Backward Compatibility:** NO (new season-based state structure)

---

## SECTION 1 — CURRENT SYSTEM ARCHITECTURE

### 1.1 Contract Inventory

| Contract | Purpose | Current Model | Seasonal Alignment |
|----------|---------|---------------|-------------------|
| **VoidBurnUtility.sol** | Core burn engine | Daily/yearly caps | ⚠️ NEEDS REFACTOR |
| **DistrictAccessBurn.sol** | District unlocks | Sequential/free D1 | ✅ ALIGNED |
| **LandUpgradeBurn.sol** | Land upgrades | Sequential 0→5 | ✅ ALIGNED |
| **CreatorToolsBurn.sol** | Creator tiers | Sequential 0→3 | ✅ ALIGNED |
| **PrestigeBurn.sol** | Prestige ranks | Sequential 0→10 | ✅ ALIGNED |
| **MiniAppBurnAccess.sol** | Mini-app unlocks | One-time permanent | ✅ ALIGNED |
| **XPRewardSystem.sol** | XP & airdrop weight | Daily XP tracking | ⚠️ NEEDS REFACTOR |

### 1.2 Current Burn Pipeline (v3)

```solidity
// VoidBurnUtility.sol — Current Implementation
function burnForUtility(
    address user,
    uint256 amount,
    BurnCategory category,
    string calldata metadata
) external nonReentrant whenNotPaused {
    // ✅ Validates amount
    // ✅ Resets daily counters
    // ✅ Resets yearly counter
    // ✅ Does NOT block on caps (v3 compliance)
    // ✅ Burns VOID to dead address
    // ✅ Updates tracking
    // ✅ Emits VoidBurned event
    
    // ❌ NO SEASON TRACKING
    // ❌ NO PER-SEASON STATE
    // ❌ NO SEASON-BASED XP
}
```

### 1.3 Current State Model

**Lifetime State (VoidBurnUtility.sol):**
```solidity
uint256 public totalBurned;                    // ✅ Global lifetime
mapping(address => uint256) userTotalBurned;   // ✅ User lifetime
mapping(string => uint256) categoryTotalBurned; // ✅ Category lifetime
```

**Time Window State (VoidBurnUtility.sol):**
```solidity
uint256 public lastDayTimestamp;               // ❌ Global day (not per-user)
uint256 public currentDayBurned;               // ❌ Global daily (not per-user)
uint256 public currentYearBurned;              // ❌ Global yearly
uint256 public yearStartTimestamp;             // ❌ Global year start

mapping(address => uint256) lastUserDayTimestamp;    // ✅ Per-user day
mapping(address => uint256) currentDayUserBurned;    // ✅ Per-user daily
```

**XP State (XPRewardSystem.sol):**
```solidity
mapping(address => uint256) lifetimeXP;        // ✅ Lifetime XP
mapping(address => uint256) currentLevel;      // ✅ Current level
mapping(address => uint256) dailyXPEarned;     // ❌ Daily only (no season)
mapping(address => uint256) lastXPDayTimestamp; // ❌ Daily only (no season)
```

**Multipliers (XPRewardSystem.sol):**
```solidity
mapping(address => uint8) prestigeRank;        // ✅ Lifetime
mapping(address => uint8) creatorTier;         // ✅ Lifetime
mapping(address => uint8) districtsUnlocked;   // ✅ Lifetime
mapping(address => uint8) miniAppsUnlocked;    // ✅ Lifetime
```

### 1.4 Current Events

**VoidBurned Event (VoidBurnUtility.sol):**
```solidity
event VoidBurned(
    address indexed user,
    uint256 amount,
    BurnCategory category,  // ✅ Has category enum
    string metadata,
    uint256 timestamp
);

// ❌ MISSING: seasonId
// ❌ MISSING: BurnModule enum mapping
```

---

## SECTION 2 — SEASONAL SPEC REQUIREMENTS

### 2.1 Required Structs (NEW)

**SeasonConfig (Section 2):**
```solidity
struct SeasonConfig {
    uint256 id;                 // e.g., 0, 1, 2...
    uint256 startTime;          // timestamp
    uint256 endTime;            // timestamp (exclusive)
    uint256 dailyCreditCap;     // max VOID per day that can earn XP
    uint256 seasonCreditCap;    // max VOID per season that can earn XP
    XPConfig xpConfig;          // curve parameters for this season
}
```

**XPConfig (Section 2):**
```solidity
struct XPConfig {
    uint256 baseXPPerVOID;      // XP per VOID (fixed point)
    uint256 dailySoftCap1;      // e.g. 3000 VOID
    uint256 dailySoftCap2;      // e.g. 6000 VOID
    uint256 dailyMult1;         // e.g. 1.0x (scaled)
    uint256 dailyMult2;         // e.g. 0.5x
    uint256 dailyMult3;         // e.g. 0x
}
```

**UserLifetimeState (Section 3):**
```solidity
struct UserLifetimeState {
    uint256 totalBurnedAllTime;    // all-time VOID burned
    uint256 prestigeRank;          // 0,1,2,...
    uint8   creatorTier;           // 0..MAX_CREATOR_TIER
    // districts, land, mini-apps tracked elsewhere
}
```

**UserSeasonState (Section 3):**
```solidity
struct UserSeasonState {
    uint256 lastDailyReset;        // timestamp of last daily reset (within this season)
    uint256 burnedToday;           // VOID burned today (for XP calc only)
    uint256 burnedThisSeason;      // VOID burned this season (for XP calc only)
    uint256 xp;                    // XP earned this season (from burns)
    uint256 creditedBurn;          // total amount of burn that actually counted toward XP
}
```

### 2.2 Required State Variables (NEW)

```solidity
uint256 currentSeasonId;
mapping(uint256 => SeasonConfig) seasons; // seasonId -> config

mapping(address => UserLifetimeState) lifetimeState;
mapping(address => mapping(uint256 => UserSeasonState)) seasonState; // user -> seasonId -> state
```

### 2.3 Required Functions (NEW)

**Season Management:**
```solidity
function getCurrentSeasonId() returns (uint256);
function createSeason(SeasonConfig memory config) external; // Admin only
function endCurrentSeason() external; // Admin only
```

**Time Window Handling:**
```solidity
function _updateSeasonWindows(UserSeasonState storage s, SeasonConfig storage cfg) internal;
function _isSameDay(uint256 timestamp1, uint256 timestamp2) internal pure returns (bool);
```

**Canonical Burn Pipeline (Section 5):**
```solidity
enum BurnModule { DISTRICT, LAND, CREATOR, PRESTIGE, MINIAPP }

event UtilityBurn(
    address indexed user,
    uint256 indexed seasonId,
    BurnModule module,
    uint256 amountVOID,
    bytes moduleData,
    uint256 timestamp
);

function performUtilityBurn(
    address user,
    uint256 amountVOID,
    BurnModule module,
    bytes moduleData
) internal;
```

**XP Calculation (Section 7):**
```solidity
function computeXPFromBurn(
    UserSeasonState storage S,
    SeasonConfig storage cfg,
    uint256 creditable
) internal view returns (uint256 xpReward);
```

---

## SECTION 3 — MISMATCH ANALYSIS

### 3.1 Critical Mismatches (MUST FIX)

| # | Issue | Current | Required | Impact |
|---|-------|---------|----------|--------|
| 1 | **No Season Concept** | Daily/yearly tracking | Season-based tracking | 🔴 CRITICAL |
| 2 | **No SeasonConfig** | Hardcoded caps | Dynamic season configs | 🔴 CRITICAL |
| 3 | **No UserSeasonState** | Global daily/yearly | Per-user, per-season state | 🔴 CRITICAL |
| 4 | **No getCurrentSeasonId()** | N/A | Required for all burns | 🔴 CRITICAL |
| 5 | **Event Missing seasonId** | VoidBurned event | UtilityBurn with seasonId | 🟡 HIGH |
| 6 | **No BurnModule Enum** | String-based category | Enum-based module | 🟡 HIGH |
| 7 | **No Seasonal XP Cap** | Daily cap only | Daily + seasonal caps | 🟡 HIGH |
| 8 | **XP Curve Incomplete** | 3-tier daily | Configurable per season | 🟡 MEDIUM |

### 3.2 Alignment Matches (ALREADY CORRECT)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | **Caps Don't Block Utility** | ✅ COMPLIANT | Lines 161-165 confirm |
| 2 | **Pause System** | ✅ COMPLIANT | whenNotPaused modifier |
| 3 | **Module Sequential Logic** | ✅ COMPLIANT | All 5 modules use prerequisites |
| 4 | **Lifetime Tracking** | ✅ COMPLIANT | userTotalBurned exists |
| 5 | **Permanent Unlocks** | ✅ COMPLIANT | District/land/creator/prestige/miniapp |
| 6 | **VOID Burn to Dead Address** | ✅ COMPLIANT | 0x...dEaD |
| 7 | **Daily Reset Logic** | ✅ COMPLIANT | Existing reset pattern works |

### 3.3 Module-Specific Analysis

**DistrictAccessBurn.sol:**
- ✅ Sequential unlock logic matches Section 6.1
- ✅ Prerequisite checking present
- ✅ Calls burnForUtility correctly
- ❌ Event doesn't include seasonId
- ❌ No module-specific pause

**LandUpgradeBurn.sol:**
- ✅ Owner-only upgrades match Section 6.2
- ✅ Sequential level progression
- ✅ Calls burnForUtility correctly
- ❌ Event doesn't include seasonId
- ❌ No module-specific pause

**CreatorToolsBurn.sol:**
- ✅ Sequential tier logic matches Section 6.3
- ✅ Tier 0→1→2→3 progression
- ✅ Calls burnForUtility correctly
- ❌ Event doesn't include seasonId
- ❌ No module-specific pause

**PrestigeBurn.sol:**
- ✅ Lifetime prestige matches Section 6.4
- ✅ Exponential cost curve
- ✅ Calls burnForUtility correctly
- ❌ Event doesn't include seasonId
- ❌ No module-specific pause

**MiniAppBurnAccess.sol:**
- ✅ One-time permanent unlock matches Section 6.5
- ✅ Feature-based access
- ✅ Calls burnForUtility correctly
- ❌ Event doesn't include seasonId
- ❌ No module-specific pause

---

## SECTION 4 — MIGRATION STRATEGY

### 4.1 Migration Phases

**Phase 1: Core Season Infrastructure (VoidBurnUtility.sol)**
1. Add SeasonConfig and XPConfig structs
2. Add UserLifetimeState and UserSeasonState structs
3. Add season state mappings
4. Implement getCurrentSeasonId()
5. Implement createSeason() and endCurrentSeason()
6. Create Season 0 as initial season

**Phase 2: Refactor Burn Pipeline**
1. Add BurnModule enum
2. Update UtilityBurn event with seasonId
3. Refactor burnForUtility() to performUtilityBurn() pattern
4. Add _updateSeasonWindows() logic
5. Split lifetime state from season state
6. Remove global daily/yearly counters

**Phase 3: Update XP System (XPRewardSystem.sol)**
1. Add seasonId parameter to awardXP()
2. Implement seasonal XP caps
3. Implement per-season creditable burn tracking
4. Add computeXPFromBurn() with zone logic
5. Preserve lifetime XP for levels

**Phase 4: Update All 5 Modules**
1. Add BurnModule enum value to each contract
2. Update events to include seasonId
3. Add isModulePaused mapping to VoidBurnUtility
4. Update all module functions to use new event signature

**Phase 5: Frontend/HUD Updates**
1. Display current season ID and time remaining
2. Show per-season XP and burns
3. Show daily/seasonal credit remaining
4. Update "XP slowdown" messaging
5. Remove any cap-based blocking UI

**Phase 6: QA & Testing**
1. Test Season 0 → Season 1 rollover
2. Test daily reset within season
3. Test seasonal cap enforcement (XP only)
4. Test all 6 invariants from Section 10
5. Test module-specific pause
6. Test season config updates

### 4.2 State Migration Plan

**Existing Users:**
```solidity
// On first season deployment:
// - Migrate userTotalBurned → lifetimeState[user].totalBurnedAllTime
// - Migrate prestigeRank → lifetimeState[user].prestigeRank
// - Migrate creatorTier → lifetimeState[user].creatorTier
// - Initialize seasonState[user][0] with zeros
// - Set currentSeasonId = 0

// Season 0 config (conservative):
SeasonConfig({
    id: 0,
    startTime: deploymentTimestamp,
    endTime: deploymentTimestamp + 90 days, // 3-month season
    dailyCreditCap: 6_000 * 1e18,
    seasonCreditCap: 100_000 * 1e18,
    xpConfig: XPConfig({
        baseXPPerVOID: 1,
        dailySoftCap1: 3_000 * 1e18,
        dailySoftCap2: 6_000 * 1e18,
        dailyMult1: 1e18,  // 1.0x (scaled to 18 decimals)
        dailyMult2: 5e17,  // 0.5x
        dailyMult3: 0      // 0x
    })
});
```

### 4.3 Backward Compatibility

**Breaking Changes:**
- ❌ New state structure (seasonState mapping)
- ❌ New event signature (UtilityBurn vs VoidBurned)
- ❌ Different XP calculation (seasonal caps)

**Preserved:**
- ✅ Lifetime burn totals
- ✅ Prestige ranks
- ✅ Creator tiers
- ✅ District unlocks
- ✅ Land levels
- ✅ Mini-app unlocks

**Migration Script Required:** YES (one-time data migration)

---

## SECTION 5 — INVARIANT VALIDATION

### 5.1 Section 10 Invariants — Current Compliance

| # | Invariant | Current Status | Notes |
|---|-----------|---------------|-------|
| 1 | **Utility Allowed** | ✅ COMPLIANT | Caps don't block (v3 spec) |
| 2 | **Monotonicity** | ✅ COMPLIANT | Burns always increase |
| 3 | **Idempotent Unlocks** | ✅ COMPLIANT | All modules enforce |
| 4 | **Caps Non-Blocking** | ✅ COMPLIANT | Only XP affected |
| 5 | **Pause-Only Blocking** | ✅ COMPLIANT | whenNotPaused enforced |
| 6 | **XP Under Caps** | ⚠️ PARTIAL | Daily caps work, seasonal missing |

### 5.2 Seasonal Invariants — New Requirements

| # | Invariant | Implementation Required |
|---|-----------|------------------------|
| 1 | **Season Boundary** | XP/state resets on season change |
| 2 | **No Cross-Season Corruption** | seasonState[user][N] independent of seasonState[user][N+1] |
| 3 | **Lifetime Preservation** | lifetimeState never resets |
| 4 | **Config Immutability** | seasons[N] cannot be modified after creation |
| 5 | **Active Season Only** | Burns only allowed in active season (or handle off-season) |

---

## SECTION 6 — IMPLEMENTATION ROADMAP

### 6.1 Immediate Actions

1. ✅ **Scan all contracts** (COMPLETE)
2. ✅ **Map current vs seasonal** (COMPLETE)
3. 🔄 **Produce mismatch summary** (THIS DOCUMENT)
4. ⏸️ **Design seasonal refactor** (NEXT)
5. ⏸️ **Implement seasonal contracts** (PENDING)
6. ⏸️ **Update frontend/HUD** (PENDING)
7. ⏸️ **Update QA test plan** (PENDING)

### 6.2 File Changes Required

| File | Change Type | Complexity | Priority |
|------|-------------|------------|----------|
| VoidBurnUtility.sol | 🔴 MAJOR REFACTOR | HIGH | P0 |
| XPRewardSystem.sol | 🟡 MODERATE REFACTOR | MEDIUM | P0 |
| DistrictAccessBurn.sol | 🟢 MINOR UPDATE | LOW | P1 |
| LandUpgradeBurn.sol | 🟢 MINOR UPDATE | LOW | P1 |
| CreatorToolsBurn.sol | 🟢 MINOR UPDATE | LOW | P1 |
| PrestigeBurn.sol | 🟢 MINOR UPDATE | LOW | P1 |
| MiniAppBurnAccess.sol | 🟢 MINOR UPDATE | LOW | P1 |
| BURN-SYSTEM-QA-v3-SPEC.md | 🟡 MODERATE UPDATE | MEDIUM | P2 |
| Frontend/HUD components | 🟡 MODERATE UPDATE | MEDIUM | P2 |

### 6.3 Estimated Timeline

- **Phase 1 (Core Season Infra):** 2-3 hours
- **Phase 2 (Burn Pipeline Refactor):** 3-4 hours
- **Phase 3 (XP System Update):** 2-3 hours
- **Phase 4 (Module Updates):** 1-2 hours
- **Phase 5 (Frontend/HUD):** 3-4 hours
- **Phase 6 (QA & Testing):** 4-6 hours

**Total Estimated Effort:** 15-22 hours

---

## SECTION 7 — NEXT STEPS

### Awaiting User Decision:

1. **Proceed with Seasonal Refactor?**
   - Option A: Full migration to seasonal model (recommended per canonical spec)
   - Option B: Hybrid approach (keep v3, add season tracking layer)
   - Option C: Defer seasonal migration (stay on v3)

2. **Season 0 Configuration:**
   - Start time: Now vs future date?
   - Duration: 30 days, 90 days, or custom?
   - Daily credit cap: Keep 6k VOID or adjust?
   - Seasonal credit cap: Propose 100k VOID or custom?

3. **Migration Timing:**
   - Immediate (before production deployment)
   - Post-deployment (requires contract upgrade)
   - Gradual rollout (deploy Season 0 first, migrate later)

4. **Testing Priorities:**
   - Focus on season rollover?
   - Focus on XP cap enforcement?
   - Focus on invariant validation?

---

## SECTION 8 — GUARDIAN MODE PROTECTION

🛡️ **CANONICAL SPEC PROTECTION ACTIVE**

**Will Flag Violations Of:**
1. Utility blocking based on caps (Section 1)
2. Missing season tracking (Section 2-3)
3. Incorrect burn pipeline pattern (Section 5)
4. Module logic deviations (Section 6)
5. XP/cap separation failures (Section 7)
6. Pause misuse (Section 8)
7. Frontend cap-based blocking (Section 9)
8. Invariant violations (Section 10)

**This Document Serves As:**
- Migration reference for seasonal refactor
- Mismatch inventory for QA validation
- Implementation roadmap for development
- Compliance checklist for guardian mode

---

**END OF MIGRATION ANALYSIS**

**Status:** Awaiting user directive to proceed with seasonal refactor implementation.

**Next Document:** SEASONAL-BURN-SYSTEM-REFACTOR-PLAN.md (pending approval)
