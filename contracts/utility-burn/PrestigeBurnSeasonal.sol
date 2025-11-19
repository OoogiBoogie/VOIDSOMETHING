// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidBurnUtilitySeasonal.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PrestigeBurnSeasonal
 * @notice Prestige rank system via VOID burning (Seasonal Spec Compliant)
 * @dev Section 6.4 - Prestige
 * 
 * FEATURES:
 * - Prestige ranks 0 → 10 (lifetime progression)
 * - Exponential burn costs (slow curve)
 * - Cosmetic unlocks per rank
 * - Profile perks and badges
 * - Uses canonical performUtilityBurn pipeline
 * 
 * NOTE: Prestige is LIFETIME, not season-bound
 */
contract PrestigeBurnSeasonal is AccessControl {
    bytes32 public constant PRESTIGE_MANAGER_ROLE = keccak256("PRESTIGE_MANAGER_ROLE");
    
    VoidBurnUtilitySeasonal public immutable burnUtility;
    
    uint8 public constant MAX_PRESTIGE_RANK = 10;
    
    // Prestige ranks (0-10, lifetime)
    mapping(address => uint8) public prestigeRank;
    
    // Rank costs (exponential slow burn curve)
    uint256[11] public rankCosts;
    
    // Cosmetic unlocks per rank
    mapping(address => mapping(uint8 => bool)) public cosmeticUnlocked;
    mapping(uint8 => string[]) public cosmeticsByRank;
    
    // Events
    event PrestigeRankAchieved(
        address indexed user,
        uint8 indexed rank,
        uint256 indexed seasonId,
        uint256 voidBurned,
        uint256 timestamp
    );
    
    event CosmeticUnlocked(
        address indexed user,
        uint8 indexed rank,
        string cosmeticId,
        uint256 timestamp
    );
    
    event RankCostUpdated(
        uint8 indexed rank,
        uint256 oldCost,
        uint256 newCost,
        uint256 timestamp
    );
    
    /**
     * @notice Initialize prestige system
     * @param _burnUtility Address of VoidBurnUtilitySeasonal contract
     */
    constructor(address _burnUtility) {
        require(_burnUtility != address(0), "Invalid burn utility address");
        
        burnUtility = VoidBurnUtilitySeasonal(_burnUtility);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PRESTIGE_MANAGER_ROLE, msg.sender);
        
        // Set initial exponential slow burn curve
        rankCosts[0] = 0;                    // Rank 0
        rankCosts[1] = 25_000 * 1e18;        // Rank 1: 25k VOID
        rankCosts[2] = 75_000 * 1e18;        // Rank 2: 75k VOID
        rankCosts[3] = 200_000 * 1e18;       // Rank 3: 200k VOID
        rankCosts[4] = 500_000 * 1e18;       // Rank 4: 500k VOID
        rankCosts[5] = 1_250_000 * 1e18;     // Rank 5: 1.25M VOID
        rankCosts[6] = 3_000_000 * 1e18;     // Rank 6: 3M VOID
        rankCosts[7] = 7_000_000 * 1e18;     // Rank 7: 7M VOID
        rankCosts[8] = 15_000_000 * 1e18;    // Rank 8: 15M VOID
        rankCosts[9] = 30_000_000 * 1e18;    // Rank 9: 30M VOID
        rankCosts[10] = 100_000_000 * 1e18;  // Rank 10: 100M VOID
        
        // Define cosmetics per rank
        _initializeCosmetics();
    }
    
    function _initializeCosmetics() internal {
        cosmeticsByRank[1].push("Bronze Badge");
        cosmeticsByRank[1].push("Starter Aura");
        
        cosmeticsByRank[2].push("Silver Badge");
        cosmeticsByRank[2].push("Blue Aura");
        
        cosmeticsByRank[3].push("Gold Badge");
        cosmeticsByRank[3].push("Purple Aura");
        
        cosmeticsByRank[5].push("Platinum Badge");
        cosmeticsByRank[5].push("Rainbow Aura");
        
        cosmeticsByRank[10].push("Diamond Badge");
        cosmeticsByRank[10].push("Legendary Aura");
        cosmeticsByRank[10].push("Void Crown");
    }
    
    /**
     * @notice Prestige to next rank by burning VOID
     * @dev Section 6.4 - Lifetime prestige progression
     */
    function prestige() external {
        uint8 currentRank = prestigeRank[msg.sender];
        require(currentRank < MAX_PRESTIGE_RANK, "Max prestige reached");
        
        // Check eligibility (optional: can add XP/district/land requirements)
        require(_isEligibleForPrestige(msg.sender), "Not eligible for prestige");
        
        uint8 newRank = currentRank + 1;
        uint256 cost = rankCosts[newRank];
        require(cost > 0, "Invalid rank cost");
        
        // Prepare module data
        bytes memory moduleData = abi.encode(newRank);
        
        // Call canonical burn pipeline
        burnUtility.performUtilityBurn(
            msg.sender,
            cost,
            VoidBurnUtilitySeasonal.BurnModule.PRESTIGE,
            moduleData
        );
        
        // Update prestige rank
        prestigeRank[msg.sender] = newRank;
        
        uint256 seasonId = burnUtility.getCurrentSeasonId();
        emit PrestigeRankAchieved(msg.sender, newRank, seasonId, cost, block.timestamp);
        
        // Unlock cosmetics for this rank
        _unlockCosmetics(msg.sender, newRank);
        
        // Update lifetime state in burn utility
        _updateLifetimeState(msg.sender);
    }
    
    /**
     * @notice Check if user is eligible for prestige
     * @dev Can add requirements: XP level, districts, land, etc.
     */
    function _isEligibleForPrestige(address user) internal view returns (bool) {
        // Basic implementation: always eligible
        // TODO: Add requirements based on XP, districts, land level, etc.
        return true;
    }
    
    /**
     * @notice Unlock cosmetics for achieved rank
     */
    function _unlockCosmetics(address user, uint8 rank) internal {
        string[] storage cosmetics = cosmeticsByRank[rank];
        
        for (uint256 i = 0; i < cosmetics.length; i++) {
            if (!cosmeticUnlocked[user][rank]) {
                cosmeticUnlocked[user][rank] = true;
                emit CosmeticUnlocked(user, rank, cosmetics[i], block.timestamp);
            }
        }
    }
    
    /**
     * @notice Update lifetime state in burn utility
     * @dev Called after prestige to sync rank
     */
    function _updateLifetimeState(address user) internal {
        // Get current lifetime state
        (
            ,
            ,
            uint8 creatorTier,
            uint8 districtsUnlocked,
            uint8 miniAppsUnlocked
        ) = burnUtility.lifetimeState(user);
        
        // Update with new prestige rank
        // Note: This requires BURN_MANAGER_ROLE on this contract
        // burnUtility.updateLifetimeState(
        //     user,
        //     prestigeRank[user],
        //     creatorTier,
        //     districtsUnlocked,
        //     miniAppsUnlocked
        // );
        
        // TODO: Implement updateLifetimeState call once role is granted
    }
    
    /**
     * @notice Get user's prestige rank
     */
    function getPrestigeRank(address user) external view returns (uint8) {
        return prestigeRank[user];
    }
    
    /**
     * @notice Get cost for next prestige rank
     */
    function getNextRankCost(address user) external view returns (uint256) {
        uint8 currentRank = prestigeRank[user];
        if (currentRank >= MAX_PRESTIGE_RANK) return 0;
        return rankCosts[currentRank + 1];
    }
    
    /**
     * @notice Get cosmetics for specific rank
     */
    function getCosmeticsForRank(uint8 rank) external view returns (string[] memory) {
        require(rank >= 1 && rank <= MAX_PRESTIGE_RANK, "Invalid rank");
        return cosmeticsByRank[rank];
    }
    
    /**
     * @notice Check if user has unlocked cosmetic
     */
    function hasCosmetic(address user, uint8 rank) external view returns (bool) {
        return cosmeticUnlocked[user][rank];
    }
    
    /**
     * @notice Set rank cost (admin only)
     */
    function setRankCost(
        uint8 rank,
        uint256 cost
    ) external onlyRole(PRESTIGE_MANAGER_ROLE) {
        require(rank >= 1 && rank <= MAX_PRESTIGE_RANK, "Invalid rank");
        
        uint256 oldCost = rankCosts[rank];
        rankCosts[rank] = cost;
        
        emit RankCostUpdated(rank, oldCost, cost, block.timestamp);
    }
    
    /**
     * @notice Batch set rank costs
     */
    function batchSetCosts(
        uint8[] calldata ranks,
        uint256[] calldata costs
    ) external onlyRole(PRESTIGE_MANAGER_ROLE) {
        require(ranks.length == costs.length, "Array length mismatch");
        
        for (uint256 i = 0; i < ranks.length; i++) {
            uint8 rank = ranks[i];
            uint256 cost = costs[i];
            
            require(rank >= 1 && rank <= MAX_PRESTIGE_RANK, "Invalid rank");
            
            uint256 oldCost = rankCosts[rank];
            rankCosts[rank] = cost;
            
            emit RankCostUpdated(rank, oldCost, cost, block.timestamp);
        }
    }
    
    /**
     * @notice Add cosmetics to rank (admin only)
     */
    function addCosmeticsToRank(
        uint8 rank,
        string[] calldata cosmetics
    ) external onlyRole(PRESTIGE_MANAGER_ROLE) {
        require(rank >= 1 && rank <= MAX_PRESTIGE_RANK, "Invalid rank");
        
        for (uint256 i = 0; i < cosmetics.length; i++) {
            cosmeticsByRank[rank].push(cosmetics[i]);
        }
    }
}
