// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title XPRewardSystem
 * @notice XP and airdrop weight system for VOID utility burns (v3 spec)
 * @dev Tracks XP earned from burns with diminishing returns and multipliers
 * 
 * CORE PHILOSOPHY (v3):
 * - Burns are tracked separately from utility (unlimited utility)
 * - XP earned = f(creditedBurnToday) with diminishing returns
 * - Airdrop weight = XP × multipliers (prestige, creator tier, districts, etc.)
 * - Daily XP resets, but lifetime XP and unlocks persist
 * 
 * XP CALCULATION:
 * - First 3k VOID → 100% XP (3,000 XP)
 * - Next 3k VOID  → 50% XP  (1,500 XP)
 * - Beyond 6k     → 0% XP   (0 XP)
 * - Max daily XP from burns: 4,500 XP
 * 
 * MULTIPLIERS:
 * - Prestige rank bonus (1.0x to 5.0x)
 * - Creator tier bonus (1.0x to 2.5x)
 * - District count bonus (1.0x to 2.0x)
 * - Mini-app unlock bonus (1.0x to 1.5x)
 */
contract XPRewardSystem is AccessControl, ReentrancyGuard {
    bytes32 public constant XP_MANAGER_ROLE = keccak256("XP_MANAGER_ROLE");
    
    // XP tracking
    mapping(address => uint256) public lifetimeXP;
    mapping(address => uint256) public currentLevel;
    mapping(address => uint256) public dailyXPEarned;
    mapping(address => uint256) public lastXPDayTimestamp;
    
    // Airdrop weight (recalculated daily)
    mapping(address => uint256) public airdropWeight;
    
    // Multiplier sources (updated by burn contracts)
    mapping(address => uint8) public prestigeRank;      // 0-10
    mapping(address => uint8) public creatorTier;       // 0-3
    mapping(address => uint8) public districtsUnlocked; // 0-5
    mapping(address => uint8) public miniAppsUnlocked;  // 0-255
    
    // Constants
    uint256 public constant XP_PER_LEVEL = 10_000;
    uint256 public constant MAX_DAILY_XP_FROM_BURNS = 4_500;
    
    // Events
    event XPEarned(address indexed user, uint256 xpAmount, uint256 newTotalXP, uint256 newLevel);
    event LevelUp(address indexed user, uint256 newLevel);
    event AirdropWeightUpdated(address indexed user, uint256 newWeight);
    event MultiplierUpdated(address indexed user, string multiplierType, uint256 newValue);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(XP_MANAGER_ROLE, msg.sender);
    }
    
    /**
     * @notice Award XP to user (called by VoidBurnUtility)
     * @param user Address earning XP
     * @param burnAmount Amount of VOID burned (used for XP calc)
     */
    function awardXP(address user, uint256 burnAmount) external onlyRole(XP_MANAGER_ROLE) {
        // Reset daily XP if new day
        if (block.timestamp >= lastXPDayTimestamp[user] + 1 days) {
            dailyXPEarned[user] = 0;
            lastXPDayTimestamp[user] = block.timestamp;
        }
        
        // Calculate XP with diminishing returns
        uint256 xpEarned = _calculateXP(burnAmount);
        
        // Cap daily XP from burns
        if (dailyXPEarned[user] + xpEarned > MAX_DAILY_XP_FROM_BURNS) {
            xpEarned = MAX_DAILY_XP_FROM_BURNS > dailyXPEarned[user] 
                ? MAX_DAILY_XP_FROM_BURNS - dailyXPEarned[user] 
                : 0;
        }
        
        if (xpEarned == 0) return; // No XP to award
        
        // Update XP
        dailyXPEarned[user] += xpEarned;
        lifetimeXP[user] += xpEarned;
        
        // Check for level up
        uint256 newLevel = lifetimeXP[user] / XP_PER_LEVEL;
        if (newLevel > currentLevel[user]) {
            currentLevel[user] = newLevel;
            emit LevelUp(user, newLevel);
        }
        
        emit XPEarned(user, xpEarned, lifetimeXP[user], currentLevel[user]);
        
        // Recalculate airdrop weight
        _updateAirdropWeight(user);
    }
    
    /**
     * @notice Update multipliers (called by burn contracts when user unlocks things)
     */
    function updatePrestigeRank(address user, uint8 rank) external onlyRole(XP_MANAGER_ROLE) {
        prestigeRank[user] = rank;
        _updateAirdropWeight(user);
        emit MultiplierUpdated(user, "prestige", rank);
    }
    
    function updateCreatorTier(address user, uint8 tier) external onlyRole(XP_MANAGER_ROLE) {
        creatorTier[user] = tier;
        _updateAirdropWeight(user);
        emit MultiplierUpdated(user, "creator", tier);
    }
    
    function updateDistrictsUnlocked(address user, uint8 count) external onlyRole(XP_MANAGER_ROLE) {
        districtsUnlocked[user] = count;
        _updateAirdropWeight(user);
        emit MultiplierUpdated(user, "districts", count);
    }
    
    function updateMiniAppsUnlocked(address user, uint8 count) external onlyRole(XP_MANAGER_ROLE) {
        miniAppsUnlocked[user] = count;
        _updateAirdropWeight(user);
        emit MultiplierUpdated(user, "miniapps", count);
    }
    
    /**
     * @notice Calculate XP from burn amount (diminishing returns)
     */
    function _calculateXP(uint256 burnAmount) internal pure returns (uint256) {
        uint256 TIER1_CAP = 3_000 * 1e18;
        uint256 TIER2_CAP = 6_000 * 1e18;
        
        if (burnAmount <= TIER1_CAP) {
            // First 3k: 100% XP
            return burnAmount / 1e18;
        } else if (burnAmount <= TIER2_CAP) {
            // 3-6k: First 3k at 100%, rest at 50%
            uint256 tier1XP = TIER1_CAP / 1e18;
            uint256 tier2Amount = burnAmount - TIER1_CAP;
            uint256 tier2XP = (tier2Amount / 1e18) / 2;
            return tier1XP + tier2XP;
        } else {
            // Beyond 6k: Max 4500 XP
            return 4_500; // 3000 + 1500
        }
    }
    
    /**
     * @notice Calculate airdrop weight with multipliers
     */
    function _updateAirdropWeight(address user) internal {
        uint256 baseWeight = lifetimeXP[user];
        
        // Prestige multiplier (1.0x to 5.0x)
        uint256 prestigeMultiplier = 10 + (prestigeRank[user] * 4); // 10-50 (1.0x to 5.0x)
        
        // Creator tier multiplier (1.0x to 2.5x)
        uint256 creatorMultiplier = 10 + (creatorTier[user] * 5); // 10-25 (1.0x to 2.5x)
        
        // District multiplier (1.0x to 2.0x)
        uint256 districtMultiplier = 10 + (districtsUnlocked[user] * 2); // 10-20 (1.0x to 2.0x)
        
        // Mini-app multiplier (1.0x to 1.5x)
        uint256 miniAppMultiplier = 10 + (miniAppsUnlocked[user] > 10 ? 5 : miniAppsUnlocked[user] / 2); // 10-15
        
        // Combine multipliers
        uint256 totalMultiplier = (prestigeMultiplier * creatorMultiplier * districtMultiplier * miniAppMultiplier) / 1000;
        
        airdropWeight[user] = (baseWeight * totalMultiplier) / 10;
        
        emit AirdropWeightUpdated(user, airdropWeight[user]);
    }
    
    /**
     * @notice Get user's current XP status
     */
    function getUserXPStatus(address user) external view returns (
        uint256 lifetime,
        uint256 level,
        uint256 dailyEarned,
        uint256 airdropWt
    ) {
        return (
            lifetimeXP[user],
            currentLevel[user],
            block.timestamp >= lastXPDayTimestamp[user] + 1 days ? 0 : dailyXPEarned[user],
            airdropWeight[user]
        );
    }
    
    /**
     * @notice Get user's multipliers
     */
    function getUserMultipliers(address user) external view returns (
        uint8 prestige,
        uint8 creator,
        uint8 districts,
        uint8 miniApps
    ) {
        return (
            prestigeRank[user],
            creatorTier[user],
            districtsUnlocked[user],
            miniAppsUnlocked[user]
        );
    }
}
