// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title VoidBurnUtility
 * @notice Core burn system for VOID utility consumption (v3 - Unlimited Utility, Limited XP)
 * @dev PURE UTILITY SYSTEM - NO FINANCIAL MECHANICS
 * 
 * KEY PRINCIPLES (v3 FINAL SPEC):
 * - ✅ UTILITY ALWAYS WORKS: Caps NEVER block burns
 * - ✅ UNLIMITED ACTIONS: Users can unlock/upgrade as much as they want
 * - ✅ LIMITED XP: Rewards diminish beyond daily credit cap (6k VOID)
 * - ✅ FRICTIONLESS ONBOARDING: No "you hit your cap" messages
 * - ✅ FAIR FOR ALL: Whales and casuals both progress, no exploitation
 * 
 * XP DIMINISHING RETURNS:
 * - First 3,000 VOID burned/day → 100% XP (3,000 XP)
 * - Next 3,000 VOID (3k-6k)     → 50% XP  (1,500 XP)
 * - Beyond 6,000 VOID            → 0% XP   (0 XP)
 * - Burns still execute successfully, just no additional XP
 * 
 * WHAT BLOCKS BURNS:
 * - ❌ Daily caps (REMOVED - only affect XP now)
 * - ✅ Emergency pause (admin only)
 * - ✅ Insufficient VOID balance
 * - ✅ Missing prerequisites (district/tier/level requirements)
 * 
 * COMPLIANCE:
 * - No investment contract mechanics
 * - No expectation of profit
 * - Pure consumption model (like crafting materials)
 */
contract VoidBurnUtility is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant BURN_MANAGER_ROLE = keccak256("BURN_MANAGER_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    
    IERC20 public immutable voidToken;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Burn tracking (transparency only, no distributions)
    uint256 public totalBurned;
    mapping(address => uint256) public userTotalBurned;
    mapping(string => uint256) public categoryTotalBurned;
    
    // Burn categories (utility actions)
    enum BurnCategory {
        DISTRICT_UNLOCK,
        LAND_UPGRADE,
        CREATOR_TOOLS,
        PRESTIGE,
        MINIAPP_ACCESS
    }
    
    // Slow burn safety limits
    struct BurnLimits {
        uint256 dailyGlobalCap;      // Max VOID burned globally per day
        uint256 dailyUserCap;         // Max VOID burned per user per day
        uint256 yearlyGlobalCap;      // Max VOID burned globally per year
        uint256 minBurnAmount;        // Minimum burn per transaction
        uint256 maxBurnAmount;        // Maximum burn per transaction
    }
    
    BurnLimits public limits;
    
    // Burn pacing tracking
    uint256 public lastDayTimestamp;
    uint256 public currentDayBurned;
    uint256 public currentYearBurned;
    uint256 public yearStartTimestamp;
    mapping(address => uint256) public lastUserDayTimestamp;
    mapping(address => uint256) public currentDayUserBurned;
    
    // XP Credit System (v3 spec - caps affect rewards, not utility)
    uint256 public constant DAILY_CREDIT_CAP = 6_000 * 1e18; // 6k VOID max credited for XP
    uint256 public constant TIER1_CAP = 3_000 * 1e18;        // First 3k = 100% XP
    uint256 public constant TIER2_CAP = 6_000 * 1e18;        // 3-6k = 50% XP
    // Beyond 6k = 0% XP (burns still work, just no XP)
    
    // Events
    event VoidBurned(
        address indexed user,
        uint256 amount,
        BurnCategory category,
        string metadata,
        uint256 timestamp
    );
    
    event BurnLimitsUpdated(
        uint256 dailyGlobalCap,
        uint256 dailyUserCap,
        uint256 yearlyGlobalCap,
        uint256 minBurnAmount,
        uint256 maxBurnAmount
    );
    
    event EmergencyBurnPaused(address indexed admin, uint256 timestamp);
    event BurnResumed(address indexed admin, uint256 timestamp);
    
    /**
     * @notice Initialize burn utility system
     * @param _voidToken Address of VOID token contract
     */
    constructor(address _voidToken) {
        require(_voidToken != address(0), "Invalid VOID address");
        
        voidToken = IERC20(_voidToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BURN_MANAGER_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        
        // Set initial slow burn limits (conservative)
        limits = BurnLimits({
            dailyGlobalCap: 10_000_000 * 1e18,    // 10M VOID/day global
            dailyUserCap: 100_000 * 1e18,         // 100k VOID/day per user
            yearlyGlobalCap: 1_000_000_000 * 1e18, // 1B VOID/year global
            minBurnAmount: 100 * 1e18,            // Min 100 VOID
            maxBurnAmount: 1_000_000 * 1e18       // Max 1M VOID per tx
        });
        
        lastDayTimestamp = block.timestamp;
        yearStartTimestamp = block.timestamp;
    }
    
    /**
     * @notice Burn VOID for utility action (permanent consumption)
     * @param user Address of user burning VOID
     * @param amount Amount of VOID to burn (18 decimals)
     * @param category Utility category
     * @param metadata Optional metadata (e.g., "DISTRICT_2_UNLOCK")
     */
    function burnForUtility(
        address user,
        uint256 amount,
        BurnCategory category,
        string calldata metadata
    ) external nonReentrant whenNotPaused {
        require(amount >= limits.minBurnAmount, "Below minimum burn");
        require(amount <= limits.maxBurnAmount, "Exceeds maximum burn");
        
        // Reset daily counters if new day
        if (block.timestamp >= lastDayTimestamp + 1 days) {
            currentDayBurned = 0;
            lastDayTimestamp = block.timestamp;
        }
        
        if (block.timestamp >= lastUserDayTimestamp[user] + 1 days) {
            currentDayUserBurned[user] = 0;
            lastUserDayTimestamp[user] = block.timestamp;
        }
        
        // Reset yearly counter if new year
        if (block.timestamp >= yearStartTimestamp + 365 days) {
            currentYearBurned = 0;
            yearStartTimestamp = block.timestamp;
        }
        
        // ⚠️ IMPORTANT: Caps do NOT block utility burns (per v3 spec)
        // Caps only affect XP/reward calculations (handled by XPRewardSystem)
        // Utility actions ALWAYS work if user has VOID and meets prerequisites
        // Only emergency pause can stop burns
        
        // Execute burn (transfer to dead address - permanent and irreversible)
        require(
            voidToken.transferFrom(user, BURN_ADDRESS, amount),
            "Burn transfer failed"
        );
        
        // Update tracking
        totalBurned += amount;
        userTotalBurned[user] += amount;
        categoryTotalBurned[_categoryToString(category)] += amount;
        currentDayBurned += amount;
        currentDayUserBurned[user] += amount;
        currentYearBurned += amount;
        
        emit VoidBurned(user, amount, category, metadata, block.timestamp);
    }
    
    /**
     * @notice Update burn limits (Governor only, for AI adjustments)
     * @dev Changes must be gradual (max 10% per adjustment, enforced by AIUtilityGovernor)
     */
    function updateBurnLimits(
        uint256 _dailyGlobalCap,
        uint256 _dailyUserCap,
        uint256 _yearlyGlobalCap,
        uint256 _minBurnAmount,
        uint256 _maxBurnAmount
    ) external onlyRole(GOVERNOR_ROLE) {
        require(_minBurnAmount <= _maxBurnAmount, "Invalid min/max");
        require(_dailyUserCap <= _dailyGlobalCap, "User cap > global cap");
        require(_dailyGlobalCap * 365 <= _yearlyGlobalCap, "Inconsistent yearly cap");
        
        limits = BurnLimits({
            dailyGlobalCap: _dailyGlobalCap,
            dailyUserCap: _dailyUserCap,
            yearlyGlobalCap: _yearlyGlobalCap,
            minBurnAmount: _minBurnAmount,
            maxBurnAmount: _maxBurnAmount
        });
        
        emit BurnLimitsUpdated(
            _dailyGlobalCap,
            _dailyUserCap,
            _yearlyGlobalCap,
            _minBurnAmount,
            _maxBurnAmount
        );
    }
    
    /**
     * @notice Emergency pause (admin only)
     */
    function pauseBurns() external onlyRole(BURN_MANAGER_ROLE) {
        _pause();
        emit EmergencyBurnPaused(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Resume burns (admin only)
     */
    function unpauseBurns() external onlyRole(BURN_MANAGER_ROLE) {
        _unpause();
        emit BurnResumed(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Get user's total burned VOID
     */
    function getUserTotalBurned(address user) external view returns (uint256) {
        return userTotalBurned[user];
    }
    
    /**
     * @notice Get category total burned
     */
    function getCategoryTotalBurned(BurnCategory category) external view returns (uint256) {
        return categoryTotalBurned[_categoryToString(category)];
    }
    
    /**
     * @notice Get current day's burned amount
     */
    function getCurrentDayBurned() external view returns (uint256) {
        if (block.timestamp >= lastDayTimestamp + 1 days) {
            return 0; // New day started
        }
        return currentDayBurned;
    }
    
    /**
     * @notice Get user's current day burned amount
     */
    function getUserCurrentDayBurned(address user) external view returns (uint256) {
        if (block.timestamp >= lastUserDayTimestamp[user] + 1 days) {
            return 0; // New day started
        }
        return currentDayUserBurned[user];
    }
    
    /**
     * @notice Get current year's burned amount
     */
    function getCurrentYearBurned() external view returns (uint256) {
        if (block.timestamp >= yearStartTimestamp + 365 days) {
            return 0; // New year started
        }
        return currentYearBurned;
    }
    
    /**
     * @notice Get credited burn for XP calculation (v3 spec)
     * @dev Returns min(burnedToday, DAILY_CREDIT_CAP)
     * @dev Burns beyond cap still work, they just don't earn XP
     */
    function getCreditedBurnToday(address user) external view returns (uint256) {
        uint256 burnedToday = this.getUserCurrentDayBurned(user);
        return burnedToday > DAILY_CREDIT_CAP ? DAILY_CREDIT_CAP : burnedToday;
    }
    
    /**
     * @notice Calculate XP earned from burns with diminishing returns
     * @param burnAmount Amount burned
     * @return xpEarned XP points earned (1 VOID = 1 XP base, then diminishing)
     */
    function calculateXP(uint256 burnAmount) public pure returns (uint256 xpEarned) {
        if (burnAmount <= TIER1_CAP) {
            // First 3k VOID: 100% XP (1 VOID = 1 XP)
            return burnAmount / 1e18; // Convert to whole tokens
        } else if (burnAmount <= TIER2_CAP) {
            // 3-6k VOID: First 3k at 100%, rest at 50%
            uint256 tier1XP = TIER1_CAP / 1e18;
            uint256 tier2Amount = burnAmount - TIER1_CAP;
            uint256 tier2XP = (tier2Amount / 1e18) / 2;
            return tier1XP + tier2XP;
        } else {
            // Beyond 6k VOID: First 3k at 100%, next 3k at 50%, rest at 0%
            uint256 tier1XP = TIER1_CAP / 1e18;
            uint256 tier2XP = (TIER2_CAP - TIER1_CAP) / 1e18 / 2;
            return tier1XP + tier2XP; // = 3000 + 1500 = 4500 XP max per day
        }
    }
    
    /**
     * @notice Get user's XP earned today (with diminishing returns)
     */
    function getUserXPToday(address user) external view returns (uint256) {
        uint256 burnedToday = this.getUserCurrentDayBurned(user);
        return calculateXP(burnedToday);
    }
    
    // Internal helper: category to string
    function _categoryToString(BurnCategory category) internal pure returns (string memory) {
        if (category == BurnCategory.DISTRICT_UNLOCK) return "DISTRICT_UNLOCK";
        if (category == BurnCategory.LAND_UPGRADE) return "LAND_UPGRADE";
        if (category == BurnCategory.CREATOR_TOOLS) return "CREATOR_TOOLS";
        if (category == BurnCategory.PRESTIGE) return "PRESTIGE";
        if (category == BurnCategory.MINIAPP_ACCESS) return "MINIAPP_ACCESS";
        return "UNKNOWN";
    }
}
