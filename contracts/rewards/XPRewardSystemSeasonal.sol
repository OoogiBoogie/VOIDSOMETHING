// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../utility-burn/VoidBurnUtilitySeasonal.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title XPRewardSystemSeasonal
 * @notice Seasonal XP and airdrop weight system for VOID utility burns
 * @dev Integrates with VoidBurnUtilitySeasonal for season-based tracking
 * 
 * CORE PHILOSOPHY (SEASONAL SPEC):
 * - XP tracked per season (resets on season rollover)
 * - Lifetime XP accumulated for level progression
 * - Airdrop weight = seasonal XP × multipliers
 * - Multipliers from prestige, creator tier, districts, mini-apps
 * 
 * XP CALCULATION (Section 7):
 * - Computed from UtilityBurn events
 * - Daily + seasonal caps enforced
 * - Soft curve with 3 zones (100%, 50%, 0%)
 * - XP caps NEVER block utility actions
 */
contract XPRewardSystemSeasonal is AccessControl, ReentrancyGuard {
    bytes32 public constant XP_MANAGER_ROLE = keccak256("XP_MANAGER_ROLE");
    
    VoidBurnUtilitySeasonal public immutable burnUtility;
    
    // ═════════════════════════════════════════════════════════════════════════
    // XP TRACKING (LIFETIME + PER-SEASON)
    // ═════════════════════════════════════════════════════════════════════════
    
    // Lifetime XP (for level progression)
    mapping(address => uint256) public lifetimeXP;
    mapping(address => uint256) public currentLevel;
    
    // Per-season XP (for airdrop weight)
    mapping(address => mapping(uint256 => uint256)) public seasonXP;
    
    // Airdrop weight (recalculated when needed)
    mapping(address => mapping(uint256 => uint256)) public airdropWeight;
    
    // Constants
    uint256 public constant XP_PER_LEVEL = 10_000;
    
    // ═════════════════════════════════════════════════════════════════════════
    // MULTIPLIERS (FROM LIFETIME STATE)
    // ═════════════════════════════════════════════════════════════════════════
    
    // Prestige multiplier (1.0x to 5.0x)
    uint256[11] public prestigeMultipliers;
    
    // Creator tier multiplier (1.0x to 2.5x)
    uint256[4] public creatorMultipliers;
    
    // District multiplier (1.0x to 2.0x)
    uint256[6] public districtMultipliers;
    
    // Mini-app multiplier (1.0x to 1.5x)
    // Calculated as: 1.0x + (count * 0.02x), capped at 1.5x
    uint256 public constant MINIAPP_MULT_BASE = 1e18;      // 1.0x
    uint256 public constant MINIAPP_MULT_PER_APP = 2e16;   // 0.02x
    uint256 public constant MINIAPP_MULT_CAP = 15e17;      // 1.5x
    
    // ═════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═════════════════════════════════════════════════════════════════════════
    
    event XPEarned(
        address indexed user,
        uint256 indexed seasonId,
        uint256 xpAmount,
        uint256 newSeasonXP,
        uint256 newLifetimeXP
    );
    
    event LevelUp(address indexed user, uint256 newLevel);
    event AirdropWeightUpdated(address indexed user, uint256 indexed seasonId, uint256 newWeight);
    
    // ═════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═════════════════════════════════════════════════════════════════════════
    
    constructor(address _burnUtility) {
        require(_burnUtility != address(0), "Invalid burn utility address");
        
        burnUtility = VoidBurnUtilitySeasonal(_burnUtility);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(XP_MANAGER_ROLE, msg.sender);
        
        // Initialize prestige multipliers (Rank 0-10)
        prestigeMultipliers[0] = 1e18;   // 1.0x
        prestigeMultipliers[1] = 12e17;  // 1.2x
        prestigeMultipliers[2] = 14e17;  // 1.4x
        prestigeMultipliers[3] = 16e17;  // 1.6x
        prestigeMultipliers[4] = 18e17;  // 1.8x
        prestigeMultipliers[5] = 2e18;   // 2.0x
        prestigeMultipliers[6] = 25e17;  // 2.5x
        prestigeMultipliers[7] = 3e18;   // 3.0x
        prestigeMultipliers[8] = 35e17;  // 3.5x
        prestigeMultipliers[9] = 4e18;   // 4.0x
        prestigeMultipliers[10] = 5e18;  // 5.0x
        
        // Initialize creator tier multipliers (Tier 0-3)
        creatorMultipliers[0] = 1e18;   // 1.0x
        creatorMultipliers[1] = 125e16; // 1.25x
        creatorMultipliers[2] = 15e17;  // 1.5x
        creatorMultipliers[3] = 25e17;  // 2.5x
        
        // Initialize district multipliers (0-5 districts)
        districtMultipliers[0] = 1e18;   // 1.0x
        districtMultipliers[1] = 1e18;   // 1.0x (District 1 free)
        districtMultipliers[2] = 12e17;  // 1.2x
        districtMultipliers[3] = 14e17;  // 1.4x
        districtMultipliers[4] = 17e17;  // 1.7x
        districtMultipliers[5] = 2e18;   // 2.0x
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // XP AWARD FUNCTIONS (CALLED AFTER BURNS)
    // ═════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Award XP to user for a burn (called by indexer or contract)
     * @dev This processes a burn and calculates XP based on seasonal caps
     * @param user User who burned VOID
     * @param seasonId Season ID
     * @param burnAmount Amount of VOID burned
     */
    function awardXPForBurn(
        address user,
        uint256 seasonId,
        uint256 burnAmount
    ) external onlyRole(XP_MANAGER_ROLE) nonReentrant {
        // Calculate XP from burn using seasonal caps
        uint256 xpEarned = burnUtility.computeXPFromBurn(user, seasonId, burnAmount);
        
        if (xpEarned == 0) {
            return; // No XP to award (caps exhausted)
        }
        
        // Update seasonal XP
        seasonXP[user][seasonId] += xpEarned;
        
        // Update lifetime XP
        lifetimeXP[user] += xpEarned;
        
        // Check for level up
        _checkLevelUp(user);
        
        emit XPEarned(user, seasonId, xpEarned, seasonXP[user][seasonId], lifetimeXP[user]);
        
        // Recalculate airdrop weight
        _updateAirdropWeight(user, seasonId);
    }
    
    /**
     * @notice Check and update user level
     */
    function _checkLevelUp(address user) internal {
        uint256 oldLevel = currentLevel[user];
        uint256 newLevel = lifetimeXP[user] / XP_PER_LEVEL;
        
        if (newLevel > oldLevel) {
            currentLevel[user] = newLevel;
            emit LevelUp(user, newLevel);
        }
    }
    
    /**
     * @notice Update airdrop weight for user (seasonal XP × multipliers)
     * @dev Section 7 - Airdrop weight calculation
     */
    function _updateAirdropWeight(address user, uint256 seasonId) internal {
        uint256 baseXP = seasonXP[user][seasonId];
        
        // Get lifetime state from burn utility
        (
            ,
            uint8 prestigeRank,
            uint8 creatorTier,
            uint8 districtsUnlocked,
            uint8 miniAppsUnlocked
        ) = burnUtility.lifetimeState(user);
        
        // Calculate total multiplier
        uint256 prestigeMult = prestigeMultipliers[prestigeRank];
        uint256 creatorMult = creatorMultipliers[creatorTier];
        uint256 districtMult = districtMultipliers[districtsUnlocked];
        uint256 miniAppMult = _calculateMiniAppMultiplier(miniAppsUnlocked);
        
        // Combined multiplier (multiplicative)
        uint256 totalMult = (prestigeMult * creatorMult * districtMult * miniAppMult) / (1e18 * 1e18 * 1e18);
        
        // Calculate weight
        uint256 weight = (baseXP * totalMult) / 1e18;
        
        airdropWeight[user][seasonId] = weight;
        
        emit AirdropWeightUpdated(user, seasonId, weight);
    }
    
    /**
     * @notice Calculate mini-app multiplier
     * @dev 1.0x + (count * 0.02x), capped at 1.5x
     */
    function _calculateMiniAppMultiplier(uint8 count) internal pure returns (uint256) {
        uint256 mult = MINIAPP_MULT_BASE + (uint256(count) * MINIAPP_MULT_PER_APP);
        return mult > MINIAPP_MULT_CAP ? MINIAPP_MULT_CAP : mult;
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Get user's lifetime XP and level
     */
    function getUserLifetimeProgress(address user)
        external
        view
        returns (uint256 xp, uint256 level, uint256 xpToNextLevel)
    {
        uint256 ltXP = lifetimeXP[user];
        uint256 lvl = currentLevel[user];
        uint256 nextLevelXP = (lvl + 1) * XP_PER_LEVEL;
        uint256 remaining = nextLevelXP > ltXP ? nextLevelXP - ltXP : 0;
        
        return (ltXP, lvl, remaining);
    }
    
    /**
     * @notice Get user's seasonal XP
     */
    function getUserSeasonXP(address user, uint256 seasonId) external view returns (uint256) {
        return seasonXP[user][seasonId];
    }
    
    /**
     * @notice Get user's airdrop weight for season
     */
    function getUserAirdropWeight(address user, uint256 seasonId) external view returns (uint256) {
        return airdropWeight[user][seasonId];
    }
    
    /**
     * @notice Get user's current multipliers
     */
    function getUserMultipliers(address user)
        external
        view
        returns (
            uint256 prestigeMult,
            uint256 creatorMult,
            uint256 districtMult,
            uint256 miniAppMult,
            uint256 totalMult
        )
    {
        (
            ,
            uint8 prestigeRank,
            uint8 creatorTier,
            uint8 districtsUnlocked,
            uint8 miniAppsUnlocked
        ) = burnUtility.lifetimeState(user);
        
        prestigeMult = prestigeMultipliers[prestigeRank];
        creatorMult = creatorMultipliers[creatorTier];
        districtMult = districtMultipliers[districtsUnlocked];
        miniAppMult = _calculateMiniAppMultiplier(miniAppsUnlocked);
        
        totalMult = (prestigeMult * creatorMult * districtMult * miniAppMult) / (1e18 * 1e18 * 1e18);
    }
    
    /**
     * @notice Recalculate airdrop weight for user (public function)
     * @dev Can be called by anyone to update weight after state changes
     */
    function recalculateAirdropWeight(address user, uint256 seasonId) external {
        _updateAirdropWeight(user, seasonId);
    }
    
    /**
     * @notice Update multiplier tables (admin only)
     */
    function setPrestigeMultiplier(uint8 rank, uint256 multiplier)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(rank <= 10, "Invalid rank");
        prestigeMultipliers[rank] = multiplier;
    }
    
    function setCreatorMultiplier(uint8 tier, uint256 multiplier)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(tier <= 3, "Invalid tier");
        creatorMultipliers[tier] = multiplier;
    }
    
    function setDistrictMultiplier(uint8 count, uint256 multiplier)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(count <= 5, "Invalid count");
        districtMultipliers[count] = multiplier;
    }
}
