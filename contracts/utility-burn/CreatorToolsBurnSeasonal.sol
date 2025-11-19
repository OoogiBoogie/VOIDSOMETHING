// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidBurnUtilitySeasonal.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CreatorToolsBurnSeasonal
 * @notice Creator tools unlock system via VOID burning (Seasonal Spec Compliant)
 * @dev Section 6.3 - Creator Tiers
 * 
 * FEATURES:
 * - 3 Creator Tiers (0 = none, 1-3 = Basic/Advanced/Elite)
 * - Sequential unlock only (Tier 0→1→2→3)
 * - Each tier unlocks specific tools
 * - Uses canonical performUtilityBurn pipeline
 */
contract CreatorToolsBurnSeasonal is AccessControl {
    bytes32 public constant CREATOR_MANAGER_ROLE = keccak256("CREATOR_MANAGER_ROLE");
    
    VoidBurnUtilitySeasonal public immutable burnUtility;
    
    uint8 public constant MAX_CREATOR_TIER = 3;
    
    // Creator tiers (0 = none, 1-3 = tiers)
    mapping(address => uint8) public creatorTier;
    
    // Tier unlock costs (slow burn curve)
    uint256[4] public tierCosts;
    
    // Tool metadata per tier
    mapping(uint8 => string[]) public toolsByTier;
    
    // Events
    event CreatorTierUnlocked(
        address indexed creator,
        uint8 indexed tier,
        uint256 indexed seasonId,
        uint256 voidBurned,
        uint256 timestamp
    );
    
    event TierCostUpdated(
        uint8 indexed tier,
        uint256 oldCost,
        uint256 newCost,
        uint256 timestamp
    );
    
    event ToolsUpdated(
        uint8 indexed tier,
        string[] tools,
        uint256 timestamp
    );
    
    /**
     * @notice Initialize creator tools system
     * @param _burnUtility Address of VoidBurnUtilitySeasonal contract
     */
    constructor(address _burnUtility) {
        require(_burnUtility != address(0), "Invalid burn utility address");
        
        burnUtility = VoidBurnUtilitySeasonal(_burnUtility);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CREATOR_MANAGER_ROLE, msg.sender);
        
        // Set initial tier costs (slow burn curve)
        tierCosts[0] = 0;                  // Tier 0 (none)
        tierCosts[1] = 100_000 * 1e18;     // Tier 1: 100k VOID
        tierCosts[2] = 500_000 * 1e18;     // Tier 2: 500k VOID
        tierCosts[3] = 2_000_000 * 1e18;   // Tier 3: 2M VOID
        
        // Define initial tools per tier
        toolsByTier[1].push("Basic 3D Assets");
        toolsByTier[1].push("Simple Scripting");
        toolsByTier[1].push("Cosmetics Creator");
        
        toolsByTier[2].push("Advanced Scripting");
        toolsByTier[2].push("Marketplace Publishing");
        toolsByTier[2].push("Asset Templates");
        
        toolsByTier[3].push("Full SDK Access");
        toolsByTier[3].push("Custom Shaders");
        toolsByTier[3].push("Premium Support");
    }
    
    /**
     * @notice Unlock creator tier by burning VOID
     * @param targetTier Target tier to unlock (1-3)
     * @dev Section 6.3 - Sequential tier progression
     */
    function unlockCreatorTier(uint8 targetTier) external {
        uint8 currentTier = creatorTier[msg.sender];
        
        require(targetTier >= 1 && targetTier <= MAX_CREATOR_TIER, "Invalid tier");
        require(targetTier == currentTier + 1, "Must unlock sequentially");
        
        uint256 cost = tierCosts[targetTier];
        require(cost > 0, "Invalid tier cost");
        
        // Prepare module data
        bytes memory moduleData = abi.encode(targetTier);
        
        // Call canonical burn pipeline
        burnUtility.performUtilityBurn(
            msg.sender,
            cost,
            VoidBurnUtilitySeasonal.BurnModule.CREATOR,
            moduleData
        );
        
        // Update creator tier
        creatorTier[msg.sender] = targetTier;
        
        uint256 seasonId = burnUtility.getCurrentSeasonId();
        emit CreatorTierUnlocked(msg.sender, targetTier, seasonId, cost, block.timestamp);
        
        // Update lifetime state in burn utility
        _updateLifetimeState(msg.sender);
    }
    
    /**
     * @notice Update lifetime state in burn utility
     * @dev Called after tier unlock to sync creator tier
     */
    function _updateLifetimeState(address user) internal {
        // Get current lifetime state
        (
            ,
            uint8 prestigeRank,
            ,
            uint8 districtsUnlocked,
            uint8 miniAppsUnlocked
        ) = burnUtility.lifetimeState(user);
        
        // Update with new creator tier
        // Note: This requires BURN_MANAGER_ROLE on this contract
        // burnUtility.updateLifetimeState(
        //     user,
        //     prestigeRank,
        //     creatorTier[user],
        //     districtsUnlocked,
        //     miniAppsUnlocked
        // );
        
        // TODO: Implement updateLifetimeState call once role is granted
    }
    
    /**
     * @notice Get creator tier for user
     * @param creator Creator address
     */
    function getCreatorTier(address creator) external view returns (uint8) {
        return creatorTier[creator];
    }
    
    /**
     * @notice Get tools available at specific tier
     * @param tier Tier number (1-3)
     */
    function getToolsForTier(uint8 tier) external view returns (string[] memory) {
        require(tier >= 1 && tier <= MAX_CREATOR_TIER, "Invalid tier");
        return toolsByTier[tier];
    }
    
    /**
     * @notice Get cost for next tier unlock
     * @param creator Creator address
     */
    function getNextTierCost(address creator) external view returns (uint256) {
        uint8 currentTier = creatorTier[creator];
        if (currentTier >= MAX_CREATOR_TIER) return 0;
        return tierCosts[currentTier + 1];
    }
    
    /**
     * @notice Set tier unlock cost (admin only)
     * @param tier Tier (1-3)
     * @param cost New cost in VOID (18 decimals)
     */
    function setTierCost(
        uint8 tier,
        uint256 cost
    ) external onlyRole(CREATOR_MANAGER_ROLE) {
        require(tier >= 1 && tier <= MAX_CREATOR_TIER, "Invalid tier");
        
        uint256 oldCost = tierCosts[tier];
        tierCosts[tier] = cost;
        
        emit TierCostUpdated(tier, oldCost, cost, block.timestamp);
    }
    
    /**
     * @notice Update tools for tier (admin only)
     * @param tier Tier (1-3)
     * @param tools Array of tool names
     */
    function setToolsForTier(
        uint8 tier,
        string[] calldata tools
    ) external onlyRole(CREATOR_MANAGER_ROLE) {
        require(tier >= 1 && tier <= MAX_CREATOR_TIER, "Invalid tier");
        
        delete toolsByTier[tier];
        for (uint256 i = 0; i < tools.length; i++) {
            toolsByTier[tier].push(tools[i]);
        }
        
        emit ToolsUpdated(tier, tools, block.timestamp);
    }
    
    /**
     * @notice Batch set tier costs
     * @param tiers Array of tiers
     * @param costs Array of costs
     */
    function batchSetCosts(
        uint8[] calldata tiers,
        uint256[] calldata costs
    ) external onlyRole(CREATOR_MANAGER_ROLE) {
        require(tiers.length == costs.length, "Array length mismatch");
        
        for (uint256 i = 0; i < tiers.length; i++) {
            uint8 tier = tiers[i];
            uint256 cost = costs[i];
            
            require(tier >= 1 && tier <= MAX_CREATOR_TIER, "Invalid tier");
            
            uint256 oldCost = tierCosts[tier];
            tierCosts[tier] = cost;
            
            emit TierCostUpdated(tier, oldCost, cost, block.timestamp);
        }
    }
}
