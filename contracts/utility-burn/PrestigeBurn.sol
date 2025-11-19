// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidBurnUtility.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PrestigeBurn
 * @notice Prestige rank system via VOID burning
 * @dev Exponential slow burn curve for cosmetic progression
 * 
 * FEATURES:
 * - Prestige ranks 0 → 10
 * - Exponential burn costs (slow curve)
 * - Cosmetic unlocks per rank
 * - Profile perks and badges
 * - AI-adjustable pricing via Governor
 */
contract PrestigeBurn is AccessControl {
    bytes32 public constant PRESTIGE_MANAGER_ROLE = keccak256("PRESTIGE_MANAGER_ROLE");
    
    VoidBurnUtility public immutable burnUtility;
    
    // Prestige ranks (0-10)
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
     * @param _burnUtility Address of VoidBurnUtility contract
     */
    constructor(address _burnUtility) {
        require(_burnUtility != address(0), "Invalid burn utility address");
        
        burnUtility = VoidBurnUtility(_burnUtility);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PRESTIGE_MANAGER_ROLE, msg.sender);
        
        // Set initial exponential slow burn curve
        rankCosts[0] = 0;                  // Rank 0
        rankCosts[1] = 25_000 * 1e18;      // Rank 1: 25k VOID
        rankCosts[2] = 75_000 * 1e18;      // Rank 2: 75k VOID
        rankCosts[3] = 200_000 * 1e18;     // Rank 3: 200k VOID
        rankCosts[4] = 500_000 * 1e18;     // Rank 4: 500k VOID
        rankCosts[5] = 1_250_000 * 1e18;   // Rank 5: 1.25M VOID
        rankCosts[6] = 3_000_000 * 1e18;   // Rank 6: 3M VOID
        rankCosts[7] = 7_000_000 * 1e18;   // Rank 7: 7M VOID
        rankCosts[8] = 15_000_000 * 1e18;  // Rank 8: 15M VOID
        rankCosts[9] = 30_000_000 * 1e18;  // Rank 9: 30M VOID
        rankCosts[10] = 100_000_000 * 1e18; // Rank 10: 100M VOID
        
        // Define initial cosmetics per rank
        cosmeticsByRank[1].push("Bronze Badge");
        cosmeticsByRank[2].push("Silver Badge");
        cosmeticsByRank[3].push("Gold Badge");
        cosmeticsByRank[4].push("Platinum Badge");
        cosmeticsByRank[5].push("Diamond Badge");
        cosmeticsByRank[6].push("Master Badge");
        cosmeticsByRank[7].push("Grandmaster Badge");
        cosmeticsByRank[8].push("Legend Badge");
        cosmeticsByRank[9].push("Mythic Badge");
        cosmeticsByRank[10].push("Eternal Badge");
    }
    
    /**
     * @notice Unlock next prestige rank by burning VOID
     */
    function unlockNextRank() external {
        uint8 currentRank = prestigeRank[msg.sender];
        require(currentRank < 10, "Max rank reached");
        
        uint8 nextRank = currentRank + 1;
        uint256 cost = rankCosts[nextRank];
        
        // Burn VOID via utility system
        burnUtility.burnForUtility(
            msg.sender,
            cost,
            VoidBurnUtility.BurnCategory.PRESTIGE,
            string(abi.encodePacked("PRESTIGE_RANK_", _uint2str(nextRank)))
        );
        
        // Upgrade rank
        prestigeRank[msg.sender] = nextRank;
        
        emit PrestigeRankAchieved(msg.sender, nextRank, cost, block.timestamp);
        
        // Auto-unlock rank cosmetics
        _unlockRankCosmetics(msg.sender, nextRank);
    }
    
    /**
     * @notice Get prestige rank
     * @param user User address
     */
    function getPrestigeRank(address user) external view returns (uint8) {
        return prestigeRank[user];
    }
    
    /**
     * @notice Get rank cost
     * @param rank Target rank (1-10)
     */
    function getRankCost(uint8 rank) external view returns (uint256) {
        require(rank >= 1 && rank <= 10, "Invalid rank");
        return rankCosts[rank];
    }
    
    /**
     * @notice Get cosmetics for rank
     * @param rank Target rank (1-10)
     */
    function getCosmeticsForRank(uint8 rank) external view returns (string[] memory) {
        require(rank >= 1 && rank <= 10, "Invalid rank");
        return cosmeticsByRank[rank];
    }
    
    /**
     * @notice Check if cosmetic unlocked
     * @param user User address
     * @param rank Rank ID
     */
    function isCosmeticUnlocked(address user, uint8 rank) external view returns (bool) {
        return cosmeticUnlocked[user][rank];
    }
    
    /**
     * @notice Set rank cost (admin or AI Governor)
     * @param rank Target rank (1-10)
     * @param cost New cost in VOID (18 decimals)
     */
    function setRankCost(
        uint8 rank,
        uint256 cost
    ) external onlyRole(PRESTIGE_MANAGER_ROLE) {
        require(rank >= 1 && rank <= 10, "Invalid rank");
        
        uint256 oldCost = rankCosts[rank];
        rankCosts[rank] = cost;
        
        emit RankCostUpdated(rank, oldCost, cost, block.timestamp);
    }
    
    /**
     * @notice Update cosmetics for rank (admin only)
     * @param rank Target rank (1-10)
     * @param cosmetics Array of cosmetic IDs
     */
    function setCosmeticsForRank(
        uint8 rank,
        string[] calldata cosmetics
    ) external onlyRole(PRESTIGE_MANAGER_ROLE) {
        require(rank >= 1 && rank <= 10, "Invalid rank");
        
        // Clear existing cosmetics
        delete cosmeticsByRank[rank];
        
        // Set new cosmetics
        for (uint256 i = 0; i < cosmetics.length; i++) {
            cosmeticsByRank[rank].push(cosmetics[i]);
        }
    }
    
    /**
     * @notice Batch set rank costs (AI Governor bulk update)
     * @param ranks Array of ranks
     * @param costs Array of costs (must match ranks length)
     */
    function batchSetCosts(
        uint8[] calldata ranks,
        uint256[] calldata costs
    ) external onlyRole(PRESTIGE_MANAGER_ROLE) {
        require(ranks.length == costs.length, "Array length mismatch");
        
        for (uint256 i = 0; i < ranks.length; i++) {
            uint8 rank = ranks[i];
            uint256 cost = costs[i];
            
            require(rank >= 1 && rank <= 10, "Invalid rank");
            
            uint256 oldCost = rankCosts[rank];
            rankCosts[rank] = cost;
            
            emit RankCostUpdated(rank, oldCost, cost, block.timestamp);
        }
    }
    
    // Internal: Unlock cosmetics for rank
    function _unlockRankCosmetics(address user, uint8 rank) internal {
        cosmeticUnlocked[user][rank] = true;
        
        string[] memory cosmetics = cosmeticsByRank[rank];
        for (uint256 i = 0; i < cosmetics.length; i++) {
            emit CosmeticUnlocked(user, rank, cosmetics[i], block.timestamp);
        }
    }
    
    // Helper: uint to string
    function _uint2str(uint8 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint8 j = _i;
        uint8 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint8 k = len;
        while (_i != 0) {
            k = k-1;
            uint8 _mod = _i % 10;
            bstr[k] = bytes1(uint8(48 + _mod));
            _i /= 10;
        }
        return string(bstr);
    }
}
