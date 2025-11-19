// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title VoidBurnUtilitySeasonal
 * @notice Seasonal burn system for VOID utility consumption
 * @dev CANONICAL SPEC IMPLEMENTATION - Season-Based Progression
 * 
 * KEY PRINCIPLES (SEASONAL SPEC - SECTION 1):
 * - ✅ UTILITY ALWAYS WORKS: Caps NEVER block burns
 * - ✅ UNLIMITED ACTIONS: Users can unlock/upgrade as much as they want
 * - ✅ SEASONAL PROGRESSION: XP/score tracked per season (Season 0, 1, 2...)
 * - ✅ FAIR FOR ALL: Whales and casuals both progress
 * - ✅ MINI-APP SIMPLICITY: Devs don't think about tokenomics
 * 
 * SEASONAL MODEL (SECTION 2):
 * - Seasons have configurable duration (e.g., 90 days)
 * - Each season has own XP/score tracking
 * - Daily caps reset per day, seasonal caps reset per season
 * - Lifetime progression (prestige, tiers) never resets
 * 
 * WHAT BLOCKS BURNS (SECTION 8):
 * - ✅ Emergency pause (admin only)
 * - ✅ Module-specific pause
 * - ✅ Insufficient VOID balance
 * - ✅ Missing prerequisites
 * - ❌ Daily caps (only affect XP)
 * - ❌ Seasonal caps (only affect XP)
 */
contract VoidBurnUtilitySeasonal is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant BURN_MANAGER_ROLE = keccak256("BURN_MANAGER_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant SEASON_MANAGER_ROLE = keccak256("SEASON_MANAGER_ROLE");
    
    IERC20 public immutable voidToken;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // ═════════════════════════════════════════════════════════════════════════
    // SECTION 2: SEASONS & TIMELINE MODEL
    // ═════════════════════════════════════════════════════════════════════════
    
    struct XPConfig {
        uint256 baseXPPerVOID;      // XP per VOID (fixed point, scaled by 1e18)
        uint256 dailySoftCap1;      // e.g., 3000 VOID
        uint256 dailySoftCap2;      // e.g., 6000 VOID
        uint256 dailyMult1;         // e.g., 1.0x (scaled to 1e18)
        uint256 dailyMult2;         // e.g., 0.5x (scaled to 5e17)
        uint256 dailyMult3;         // e.g., 0x (0)
    }
    
    struct SeasonConfig {
        uint256 id;                 // Season ID (0, 1, 2...)
        uint256 startTime;          // Start timestamp
        uint256 endTime;            // End timestamp (exclusive)
        uint256 dailyCreditCap;     // Max VOID per day that can earn XP
        uint256 seasonCreditCap;    // Max VOID per season that can earn XP
        XPConfig xpConfig;          // XP curve parameters
        bool active;                // Season is active
    }
    
    uint256 public currentSeasonId;
    mapping(uint256 => SeasonConfig) public seasons;
    
    // ═════════════════════════════════════════════════════════════════════════
    // SECTION 3: USER STATE MODEL (LIFETIME + PER-SEASON)
    // ═════════════════════════════════════════════════════════════════════════
    
    struct UserLifetimeState {
        uint256 totalBurnedAllTime;    // All-time VOID burned
        uint8   prestigeRank;          // 0-10 (lifetime)
        uint8   creatorTier;           // 0-3 (lifetime)
        uint8   districtsUnlocked;     // 0-5 (lifetime count)
        uint8   miniAppsUnlocked;      // 0-255 (lifetime count)
    }
    
    struct UserSeasonState {
        uint256 lastDailyReset;        // Timestamp of last daily reset
        uint256 burnedToday;           // VOID burned today (for XP calc)
        uint256 burnedThisSeason;      // VOID burned this season (for XP calc)
        uint256 xp;                    // XP earned this season
        uint256 creditedBurn;          // Total credited burn (for XP tracking)
    }
    
    mapping(address => UserLifetimeState) public lifetimeState;
    mapping(address => mapping(uint256 => UserSeasonState)) public seasonState;
    
    // ═════════════════════════════════════════════════════════════════════════
    // SECTION 5: CANONICAL BURN PIPELINE
    // ═════════════════════════════════════════════════════════════════════════
    
    enum BurnModule {
        DISTRICT,
        LAND,
        CREATOR,
        PRESTIGE,
        MINIAPP
    }
    
    // Module-specific pause flags (Section 8)
    mapping(BurnModule => bool) public isModulePaused;
    
    // Burn tracking (transparency only)
    uint256 public totalBurned;
    mapping(address => uint256) public userTotalBurned; // Legacy compatibility
    
    // Events
    event UtilityBurn(
        address indexed user,
        uint256 indexed seasonId,
        BurnModule module,
        uint256 amountVOID,
        bytes moduleData,
        uint256 timestamp
    );
    
    event SeasonCreated(
        uint256 indexed seasonId,
        uint256 startTime,
        uint256 endTime,
        uint256 dailyCreditCap,
        uint256 seasonCreditCap
    );
    
    event SeasonEnded(
        uint256 indexed seasonId,
        uint256 timestamp
    );
    
    event ModulePaused(BurnModule indexed module, uint256 timestamp);
    event ModuleUnpaused(BurnModule indexed module, uint256 timestamp);
    
    event EmergencyBurnPaused(address indexed admin, uint256 timestamp);
    event BurnResumed(address indexed admin, uint256 timestamp);
    
    // ═════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═════════════════════════════════════════════════════════════════════════
    
    constructor(address _voidToken) {
        require(_voidToken != address(0), "Invalid VOID address");
        
        voidToken = IERC20(_voidToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BURN_MANAGER_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(SEASON_MANAGER_ROLE, msg.sender);
        
        // Initialize Season 0 (90-day season)
        _createInitialSeason();
    }
    
    function _createInitialSeason() internal {
        uint256 seasonDuration = 90 days;
        
        seasons[0] = SeasonConfig({
            id: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + seasonDuration,
            dailyCreditCap: 6_000 * 1e18,
            seasonCreditCap: 100_000 * 1e18,
            xpConfig: XPConfig({
                baseXPPerVOID: 1e18,        // 1 XP per VOID (scaled)
                dailySoftCap1: 3_000 * 1e18,
                dailySoftCap2: 6_000 * 1e18,
                dailyMult1: 1e18,           // 1.0x
                dailyMult2: 5e17,           // 0.5x
                dailyMult3: 0               // 0x
            }),
            active: true
        });
        
        currentSeasonId = 0;
        
        emit SeasonCreated(0, block.timestamp, block.timestamp + seasonDuration, 6_000 * 1e18, 100_000 * 1e18);
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // SECTION 4: SEASON MANAGEMENT
    // ═════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Get current active season ID
     * @dev Checks if current season has ended and needs rollover
     */
    function getCurrentSeasonId() public view returns (uint256) {
        SeasonConfig storage cfg = seasons[currentSeasonId];
        
        // Check if current season has ended
        if (block.timestamp >= cfg.endTime) {
            // Season ended but not yet rolled over
            // Return current ID (admin must call endCurrentSeason to advance)
            return currentSeasonId;
        }
        
        return currentSeasonId;
    }
    
    /**
     * @notice Check if a season is active
     */
    function isSeasonActive(uint256 seasonId) public view returns (bool) {
        SeasonConfig storage cfg = seasons[seasonId];
        return cfg.active && block.timestamp >= cfg.startTime && block.timestamp < cfg.endTime;
    }
    
    /**
     * @notice Create a new season (admin only)
     * @dev Called after ending current season
     */
    function createSeason(
        uint256 _seasonId,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _dailyCreditCap,
        uint256 _seasonCreditCap,
        XPConfig calldata _xpConfig
    ) external onlyRole(SEASON_MANAGER_ROLE) {
        require(_startTime < _endTime, "Invalid time range");
        require(_seasonId > currentSeasonId, "Season ID must be greater than current");
        require(seasons[_seasonId].id == 0, "Season already exists");
        
        seasons[_seasonId] = SeasonConfig({
            id: _seasonId,
            startTime: _startTime,
            endTime: _endTime,
            dailyCreditCap: _dailyCreditCap,
            seasonCreditCap: _seasonCreditCap,
            xpConfig: _xpConfig,
            active: false
        });
        
        emit SeasonCreated(_seasonId, _startTime, _endTime, _dailyCreditCap, _seasonCreditCap);
    }
    
    /**
     * @notice End current season and start next one
     * @dev Can only be called if current season has ended or by admin
     */
    function endCurrentSeason(uint256 nextSeasonId) external onlyRole(SEASON_MANAGER_ROLE) {
        SeasonConfig storage current = seasons[currentSeasonId];
        require(block.timestamp >= current.endTime || hasRole(GOVERNOR_ROLE, msg.sender), "Season not ended");
        require(seasons[nextSeasonId].id != 0, "Next season not configured");
        
        current.active = false;
        emit SeasonEnded(currentSeasonId, block.timestamp);
        
        seasons[nextSeasonId].active = true;
        currentSeasonId = nextSeasonId;
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // SECTION 4: TIME WINDOW HANDLING
    // ═════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Update seasonal windows (daily reset)
     * @dev Section 4 - Time & Season Window Handling
     */
    function _updateSeasonWindows(
        UserSeasonState storage userState,
        SeasonConfig storage cfg
    ) internal {
        // Daily reset: if day boundary crossed since lastDailyReset
        if (!_isSameDay(userState.lastDailyReset, block.timestamp)) {
            userState.burnedToday = 0;
            userState.lastDailyReset = block.timestamp;
        }
    }
    
    /**
     * @notice Check if two timestamps are on the same UTC day
     */
    function _isSameDay(uint256 timestamp1, uint256 timestamp2) internal pure returns (bool) {
        return (timestamp1 / 1 days) == (timestamp2 / 1 days);
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // SECTION 5: CANONICAL BURN PIPELINE (performUtilityBurn)
    // ═════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice CANONICAL BURN PIPELINE - All burns go through here
     * @dev Section 5 - The Canonical Burn Pipeline
     * 
     * CRITICAL: This function MUST NOT block burns because of XP caps.
     * The ONLY things that can block a valid burn are:
     * - not enough VOID
     * - unmet prerequisites (checked by caller)
     * - max level / already unlocked (checked by caller)
     * - system/module paused
     */
    function performUtilityBurn(
        address user,
        uint256 amountVOID,
        BurnModule module,
        bytes memory moduleData
    ) external nonReentrant whenNotPaused {
        require(!isModulePaused[module], "Module paused");
        require(amountVOID > 0, "Amount must be > 0");
        
        uint256 seasonId = getCurrentSeasonId();
        SeasonConfig storage cfg = seasons[seasonId];
        require(cfg.active, "No active season");
        
        // ─────────────────────────────────────────────────────────────────────
        // 1) Burn/consume VOID
        // ─────────────────────────────────────────────────────────────────────
        require(
            voidToken.transferFrom(user, BURN_ADDRESS, amountVOID),
            "Burn transfer failed"
        );
        
        // ─────────────────────────────────────────────────────────────────────
        // 2) Update lifetime burn
        // ─────────────────────────────────────────────────────────────────────
        UserLifetimeState storage L = lifetimeState[user];
        L.totalBurnedAllTime += amountVOID;
        
        // Legacy compatibility
        totalBurned += amountVOID;
        userTotalBurned[user] += amountVOID;
        
        // ─────────────────────────────────────────────────────────────────────
        // 3) Update seasonal windows & counters
        // ─────────────────────────────────────────────────────────────────────
        UserSeasonState storage S = seasonState[user][seasonId];
        _updateSeasonWindows(S, cfg);
        
        S.burnedToday += amountVOID;
        S.burnedThisSeason += amountVOID;
        
        // ─────────────────────────────────────────────────────────────────────
        // 4) Emit event for XP/airdrop indexers
        // ─────────────────────────────────────────────────────────────────────
        emit UtilityBurn(
            user,
            seasonId,
            module,
            amountVOID,
            moduleData,
            block.timestamp
        );
        
        // ─────────────────────────────────────────────────────────────────────
        // 5) Module-specific state updates handled by calling contract
        // ─────────────────────────────────────────────────────────────────────
        // (Districts, Land, Creator, Prestige, MiniApp contracts handle their own state)
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // SECTION 7: XP & CAPS LOGIC (READ-ONLY, OFF-CHAIN CAN ALSO CALCULATE)
    // ═════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Calculate XP from burn with seasonal caps and soft curves
     * @dev Section 7 - XP & Caps Logic
     * 
     * This calculates how much XP would be earned from a new burn,
     * considering both daily and seasonal credit caps.
     */
    function computeXPFromBurn(
        address user,
        uint256 seasonId,
        uint256 newBurnAmount
    ) public view returns (uint256 xpReward) {
        SeasonConfig storage cfg = seasons[seasonId];
        UserSeasonState storage S = seasonState[user][seasonId];
        
        // Determine how much of the newly burned amount can be credited for XP
        uint256 dailyRoom = cfg.dailyCreditCap > S.burnedToday
            ? cfg.dailyCreditCap - S.burnedToday
            : 0;
        
        uint256 seasonRoom = cfg.seasonCreditCap > S.burnedThisSeason
            ? cfg.seasonCreditCap - S.burnedThisSeason
            : 0;
        
        uint256 creditable = _min(newBurnAmount, _min(dailyRoom, seasonRoom));
        
        if (creditable == 0) {
            return 0; // No XP if caps exhausted
        }
        
        // Apply soft curve to creditable amount
        return _applyXPCurve(S, cfg, creditable);
    }
    
    /**
     * @notice Apply XP soft curve (3 zones with multipliers)
     * @dev Section 7 - Zone-based XP calculation
     */
    function _applyXPCurve(
        UserSeasonState storage S,
        SeasonConfig storage cfg,
        uint256 creditable
    ) internal view returns (uint256 xpReward) {
        uint256 dBefore = S.burnedToday;
        
        // Zone 1: 0 → dailySoftCap1 (e.g., 0-3k)
        uint256 zone1Remaining = cfg.xpConfig.dailySoftCap1 > dBefore
            ? cfg.xpConfig.dailySoftCap1 - dBefore
            : 0;
        uint256 amountZone1 = _min(creditable, zone1Remaining);
        
        uint256 dAfterZone1 = dBefore + amountZone1;
        
        // Zone 2: dailySoftCap1 → dailySoftCap2 (e.g., 3k-6k)
        uint256 zone2Remaining = cfg.xpConfig.dailySoftCap2 > dAfterZone1
            ? cfg.xpConfig.dailySoftCap2 - dAfterZone1
            : 0;
        uint256 amountZone2 = _min(creditable - amountZone1, zone2Remaining);
        
        // Zone 3: > dailySoftCap2 (e.g., 6k+)
        uint256 amountZone3 = creditable - amountZone1 - amountZone2;
        
        // Calculate XP with multipliers
        xpReward =
            (amountZone1 * cfg.xpConfig.baseXPPerVOID * cfg.xpConfig.dailyMult1) / (1e18 * 1e18) +
            (amountZone2 * cfg.xpConfig.baseXPPerVOID * cfg.xpConfig.dailyMult2) / (1e18 * 1e18) +
            (amountZone3 * cfg.xpConfig.baseXPPerVOID * cfg.xpConfig.dailyMult3) / (1e18 * 1e18);
        
        return xpReward;
    }
    
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // SECTION 8: PAUSE SYSTEM (EMERGENCY ONLY)
    // ═════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Pause specific module
     */
    function pauseModule(BurnModule module) external onlyRole(BURN_MANAGER_ROLE) {
        isModulePaused[module] = true;
        emit ModulePaused(module, block.timestamp);
    }
    
    /**
     * @notice Unpause specific module
     */
    function unpauseModule(BurnModule module) external onlyRole(BURN_MANAGER_ROLE) {
        isModulePaused[module] = false;
        emit ModuleUnpaused(module, block.timestamp);
    }
    
    /**
     * @notice Emergency pause all burns (admin only)
     */
    function pauseBurns() external onlyRole(BURN_MANAGER_ROLE) {
        _pause();
        emit EmergencyBurnPaused(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Resume all burns (admin only)
     */
    function unpauseBurns() external onlyRole(BURN_MANAGER_ROLE) {
        _unpause();
        emit BurnResumed(msg.sender, block.timestamp);
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS (COMPATIBILITY & QUERIES)
    // ═════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Get user's lifetime burned amount
     */
    function getUserTotalBurned(address user) external view returns (uint256) {
        return lifetimeState[user].totalBurnedAllTime;
    }
    
    /**
     * @notice Get user's season state
     */
    function getUserSeasonState(address user, uint256 seasonId)
        external
        view
        returns (UserSeasonState memory)
    {
        return seasonState[user][seasonId];
    }
    
    /**
     * @notice Get season config
     */
    function getSeasonConfig(uint256 seasonId) external view returns (SeasonConfig memory) {
        return seasons[seasonId];
    }
    
    /**
     * @notice Get current season config
     */
    function getCurrentSeasonConfig() external view returns (SeasonConfig memory) {
        return seasons[currentSeasonId];
    }
    
    /**
     * @notice Get user's credited burn for current season
     */
    function getUserCreditedBurn(address user, uint256 seasonId) external view returns (uint256) {
        return seasonState[user][seasonId].creditedBurn;
    }
    
    /**
     * @notice Get user's XP for current season
     */
    function getUserSeasonXP(address user, uint256 seasonId) external view returns (uint256) {
        return seasonState[user][seasonId].xp;
    }
    
    /**
     * @notice Update lifetime state (called by module contracts)
     * @dev Only authorized contracts can update prestige/tier/unlocks
     */
    function updateLifetimeState(
        address user,
        uint8 _prestigeRank,
        uint8 _creatorTier,
        uint8 _districtsUnlocked,
        uint8 _miniAppsUnlocked
    ) external onlyRole(BURN_MANAGER_ROLE) {
        UserLifetimeState storage L = lifetimeState[user];
        L.prestigeRank = _prestigeRank;
        L.creatorTier = _creatorTier;
        L.districtsUnlocked = _districtsUnlocked;
        L.miniAppsUnlocked = _miniAppsUnlocked;
    }
    
    /**
     * @notice Award XP to user for a burn (called after performUtilityBurn)
     * @dev This updates the XP state after a burn is processed
     */
    function awardXPForBurn(
        address user,
        uint256 seasonId,
        uint256 burnAmount
    ) external onlyRole(BURN_MANAGER_ROLE) returns (uint256 xpAwarded) {
        UserSeasonState storage S = seasonState[user][seasonId];
        SeasonConfig storage cfg = seasons[seasonId];
        
        // Calculate creditable amount
        uint256 dailyRoom = cfg.dailyCreditCap > S.burnedToday
            ? cfg.dailyCreditCap - S.burnedToday
            : 0;
        
        uint256 seasonRoom = cfg.seasonCreditCap > S.burnedThisSeason
            ? cfg.seasonCreditCap - S.burnedThisSeason
            : 0;
        
        uint256 creditable = _min(burnAmount, _min(dailyRoom, seasonRoom));
        
        if (creditable > 0) {
            xpAwarded = _applyXPCurve(S, cfg, creditable);
            S.xp += xpAwarded;
            S.creditedBurn += creditable;
        }
        
        return xpAwarded;
    }
}
