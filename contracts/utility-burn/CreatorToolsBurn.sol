// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidBurnUtility.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CreatorToolsBurn
 * @notice Creator tools unlock system via VOID burning
 * @dev Sequential tier unlocking with tool metadata
 * 
 * FEATURES:
 * - 3 Creator Tiers (Basic, Advanced, Elite)
 * - Sequential unlock only (Tier 1 → 2 → 3)
 * - Each tier unlocks specific tools
 * - Slow burn curve with increasing costs
 * - AI-adjustable pricing via Governor
 */
contract CreatorToolsBurn is AccessControl {
    bytes32 public constant CREATOR_MANAGER_ROLE = keccak256("CREATOR_MANAGER_ROLE");
    
    VoidBurnUtility public immutable burnUtility;
    
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
     * @param _burnUtility Address of VoidBurnUtility contract
     */
    constructor(address _burnUtility) {
        require(_burnUtility != address(0), "Invalid burn utility address");
        
        burnUtility = VoidBurnUtility(_burnUtility);
        
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
        toolsByTier[3].push("White-Label Mini-Apps");
        toolsByTier[3].push("Priority Support");
        toolsByTier[3].push("Custom Integrations");
    }
    
    /**
     * @notice Unlock creator tier by burning VOID
     * @param tier Target tier (1-3)
     */
    function unlockCreatorTier(uint8 tier) external {
        require(tier >= 1 && tier <= 3, "Invalid tier");
        require(creatorTier[msg.sender] < tier, "Already unlocked");
        require(
            creatorTier[msg.sender] == tier - 1,
            "Must unlock sequentially"
        );
        
        uint256 cost = tierCosts[tier];
        
        // Burn VOID via utility system
        burnUtility.burnForUtility(
            msg.sender,
            cost,
            VoidBurnUtility.BurnCategory.CREATOR_TOOLS,
            string(abi.encodePacked("CREATOR_TIER_", _uint2str(tier)))
        );
        
        // Unlock tier
        creatorTier[msg.sender] = tier;
        
        emit CreatorTierUnlocked(msg.sender, tier, cost, block.timestamp);
    }
    
    /**
     * @notice Get creator tier
     * @param creator Creator address
     */
    function getCreatorTier(address creator) external view returns (uint8) {
        return creatorTier[creator];
    }
    
    /**
     * @notice Get tools available at tier
     * @param tier Target tier (1-3)
     */
    function getToolsForTier(uint8 tier) external view returns (string[] memory) {
        require(tier >= 1 && tier <= 3, "Invalid tier");
        return toolsByTier[tier];
    }
    
    /**
     * @notice Get tier cost
     * @param tier Target tier (1-3)
     */
    function getTierCost(uint8 tier) external view returns (uint256) {
        require(tier >= 1 && tier <= 3, "Invalid tier");
        return tierCosts[tier];
    }
    
    /**
     * @notice Set tier cost (admin or AI Governor)
     * @param tier Target tier (1-3)
     * @param cost New cost in VOID (18 decimals)
     */
    function setTierCost(
        uint8 tier,
        uint256 cost
    ) external onlyRole(CREATOR_MANAGER_ROLE) {
        require(tier >= 1 && tier <= 3, "Invalid tier");
        
        uint256 oldCost = tierCosts[tier];
        tierCosts[tier] = cost;
        
        emit TierCostUpdated(tier, oldCost, cost, block.timestamp);
    }
    
    /**
     * @notice Update tools for tier (admin only)
     * @param tier Target tier (1-3)
     * @param tools Array of tool names
     */
    function setToolsForTier(
        uint8 tier,
        string[] calldata tools
    ) external onlyRole(CREATOR_MANAGER_ROLE) {
        require(tier >= 1 && tier <= 3, "Invalid tier");
        
        // Clear existing tools
        delete toolsByTier[tier];
        
        // Set new tools
        for (uint256 i = 0; i < tools.length; i++) {
            toolsByTier[tier].push(tools[i]);
        }
        
        emit ToolsUpdated(tier, tools, block.timestamp);
    }
    
    /**
     * @notice Batch set tier costs (AI Governor bulk update)
     * @param tiers Array of tiers
     * @param costs Array of costs (must match tiers length)
     */
    function batchSetCosts(
        uint8[] calldata tiers,
        uint256[] calldata costs
    ) external onlyRole(CREATOR_MANAGER_ROLE) {
        require(tiers.length == costs.length, "Array length mismatch");
        
        for (uint256 i = 0; i < tiers.length; i++) {
            uint8 tier = tiers[i];
            uint256 cost = costs[i];
            
            require(tier >= 1 && tier <= 3, "Invalid tier");
            
            uint256 oldCost = tierCosts[tier];
            tierCosts[tier] = cost;
            
            emit TierCostUpdated(tier, oldCost, cost, block.timestamp);
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
