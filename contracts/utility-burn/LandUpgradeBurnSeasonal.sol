// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidBurnUtilitySeasonal.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title LandUpgradeBurnSeasonal
 * @notice Land parcel upgrade system via VOID burning (Seasonal Spec Compliant)
 * @dev Section 6.2 - Land Upgrades
 * 
 * FEATURES:
 * - Upgrade owned parcels from Level 0 → 5
 * - Slow burn curve (exponentially increasing costs)
 * - Must own parcel to upgrade it
 * - Sequential upgrades only (0→1→2→3→4→5)
 * - Uses canonical performUtilityBurn pipeline
 */
contract LandUpgradeBurnSeasonal is AccessControl {
    bytes32 public constant LAND_MANAGER_ROLE = keccak256("LAND_MANAGER_ROLE");
    
    VoidBurnUtilitySeasonal public immutable burnUtility;
    
    uint8 public constant MAX_LAND_LEVEL = 5;
    
    // Upgrade levels (0 = base, 1-5 = upgraded)
    mapping(address => mapping(uint256 => uint8)) public parcelUpgradeLevel;
    
    // Upgrade costs per tier (slow burn curve)
    uint256[6] public upgradeCosts;
    
    // Parcel ownership verification
    mapping(address => mapping(uint256 => bool)) public ownsParcel;
    
    // Events
    event ParcelUpgraded(
        address indexed owner,
        uint256 indexed parcelId,
        uint256 indexed seasonId,
        uint8 oldLevel,
        uint8 newLevel,
        uint256 voidBurned,
        uint256 timestamp
    );
    
    event UpgradeCostUpdated(
        uint8 indexed level,
        uint256 oldCost,
        uint256 newCost,
        uint256 timestamp
    );
    
    event ParcelOwnershipSet(
        address indexed owner,
        uint256 indexed parcelId,
        bool owns,
        uint256 timestamp
    );
    
    /**
     * @notice Initialize land upgrade system
     * @param _burnUtility Address of VoidBurnUtilitySeasonal contract
     */
    constructor(address _burnUtility) {
        require(_burnUtility != address(0), "Invalid burn utility address");
        
        burnUtility = VoidBurnUtilitySeasonal(_burnUtility);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LAND_MANAGER_ROLE, msg.sender);
        
        // Set initial slow burn curve
        upgradeCosts[0] = 0;                  // Level 0 (base)
        upgradeCosts[1] = 50_000 * 1e18;      // Level 1: 50k VOID
        upgradeCosts[2] = 150_000 * 1e18;     // Level 2: 150k VOID
        upgradeCosts[3] = 400_000 * 1e18;     // Level 3: 400k VOID
        upgradeCosts[4] = 1_000_000 * 1e18;   // Level 4: 1M VOID
        upgradeCosts[5] = 2_500_000 * 1e18;   // Level 5: 2.5M VOID
    }
    
    /**
     * @notice Upgrade parcel by burning VOID
     * @param parcelId Parcel ID (coordinates encoded)
     * @dev Section 6.2 - Owner-only sequential upgrades
     */
    function upgradeParcel(uint256 parcelId) external {
        require(ownsParcel[msg.sender][parcelId], "Not parcel owner");
        
        uint8 currentLevel = parcelUpgradeLevel[msg.sender][parcelId];
        require(currentLevel < MAX_LAND_LEVEL, "Max level reached");
        
        uint8 targetLevel = currentLevel + 1;
        uint256 cost = upgradeCosts[targetLevel];
        require(cost > 0, "Invalid upgrade cost");
        
        // Prepare module data
        bytes memory moduleData = abi.encode(parcelId, targetLevel);
        
        // Call canonical burn pipeline
        burnUtility.performUtilityBurn(
            msg.sender,
            cost,
            VoidBurnUtilitySeasonal.BurnModule.LAND,
            moduleData
        );
        
        // Update parcel level
        parcelUpgradeLevel[msg.sender][parcelId] = targetLevel;
        
        uint256 seasonId = burnUtility.getCurrentSeasonId();
        emit ParcelUpgraded(
            msg.sender,
            parcelId,
            seasonId,
            currentLevel,
            targetLevel,
            cost,
            block.timestamp
        );
    }
    
    /**
     * @notice Get parcel upgrade level
     * @param owner Parcel owner address
     * @param parcelId Parcel ID
     */
    function getParcelLevel(address owner, uint256 parcelId) external view returns (uint8) {
        return parcelUpgradeLevel[owner][parcelId];
    }
    
    /**
     * @notice Get upgrade cost for next level
     * @param owner Parcel owner address
     * @param parcelId Parcel ID
     */
    function getNextUpgradeCost(address owner, uint256 parcelId) external view returns (uint256) {
        uint8 currentLevel = parcelUpgradeLevel[owner][parcelId];
        if (currentLevel >= MAX_LAND_LEVEL) return 0;
        return upgradeCosts[currentLevel + 1];
    }
    
    /**
     * @notice Set parcel ownership (admin or real estate system)
     * @param owner Owner address
     * @param parcelId Parcel ID
     * @param owns True if owns, false if doesn't
     */
    function setParcelOwnership(
        address owner,
        uint256 parcelId,
        bool owns
    ) external onlyRole(LAND_MANAGER_ROLE) {
        ownsParcel[owner][parcelId] = owns;
        emit ParcelOwnershipSet(owner, parcelId, owns, block.timestamp);
    }
    
    /**
     * @notice Batch set parcel ownership
     * @param owners Array of owner addresses
     * @param parcelIds Array of parcel IDs
     * @param ownsArray Array of ownership flags
     */
    function batchSetOwnership(
        address[] calldata owners,
        uint256[] calldata parcelIds,
        bool[] calldata ownsArray
    ) external onlyRole(LAND_MANAGER_ROLE) {
        require(
            owners.length == parcelIds.length && owners.length == ownsArray.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < owners.length; i++) {
            ownsParcel[owners[i]][parcelIds[i]] = ownsArray[i];
            emit ParcelOwnershipSet(owners[i], parcelIds[i], ownsArray[i], block.timestamp);
        }
    }
    
    /**
     * @notice Set upgrade cost for specific level (admin only)
     * @param level Upgrade level (1-5)
     * @param cost New cost in VOID (18 decimals)
     */
    function setUpgradeCost(
        uint8 level,
        uint256 cost
    ) external onlyRole(LAND_MANAGER_ROLE) {
        require(level >= 1 && level <= MAX_LAND_LEVEL, "Invalid level");
        
        uint256 oldCost = upgradeCosts[level];
        upgradeCosts[level] = cost;
        
        emit UpgradeCostUpdated(level, oldCost, cost, block.timestamp);
    }
    
    /**
     * @notice Batch set upgrade costs
     * @param levels Array of levels
     * @param costs Array of costs
     */
    function batchSetCosts(
        uint8[] calldata levels,
        uint256[] calldata costs
    ) external onlyRole(LAND_MANAGER_ROLE) {
        require(levels.length == costs.length, "Array length mismatch");
        
        for (uint256 i = 0; i < levels.length; i++) {
            uint8 level = levels[i];
            uint256 cost = costs[i];
            
            require(level >= 1 && level <= MAX_LAND_LEVEL, "Invalid level");
            
            uint256 oldCost = upgradeCosts[level];
            upgradeCosts[level] = cost;
            
            emit UpgradeCostUpdated(level, oldCost, cost, block.timestamp);
        }
    }
}
