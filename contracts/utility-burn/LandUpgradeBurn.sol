// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidBurnUtility.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title LandUpgradeBurn
 * @notice Land parcel upgrade system via VOID burning
 * @dev Integrates with existing real estate ownership system
 * 
 * FEATURES:
 * - Upgrade owned parcels from Level 0 → 5
 * - Slow burn curve (exponentially increasing costs)
 * - Must own parcel to upgrade it
 * - Sequential upgrades only (1→2→3→4→5)
 * - AI-adjustable pricing via Governor
 */
contract LandUpgradeBurn is AccessControl {
    bytes32 public constant LAND_MANAGER_ROLE = keccak256("LAND_MANAGER_ROLE");
    
    VoidBurnUtility public immutable burnUtility;
    
    // Upgrade levels (0 = base, 1-5 = upgraded)
    mapping(address => mapping(uint256 => uint8)) public parcelUpgradeLevel;
    
    // Upgrade costs per tier (slow burn curve)
    uint256[6] public upgradeCosts;
    
    // Parcel ownership verification (placeholder, integrate with real estate system)
    mapping(address => mapping(uint256 => bool)) public ownsParcel;
    
    // Events
    event ParcelUpgraded(
        address indexed owner,
        uint256 indexed parcelId,
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
    
    /**
     * @notice Initialize land upgrade system
     * @param _burnUtility Address of VoidBurnUtility contract
     */
    constructor(address _burnUtility) {
        require(_burnUtility != address(0), "Invalid burn utility address");
        
        burnUtility = VoidBurnUtility(_burnUtility);
        
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
     */
    function upgradeParcel(uint256 parcelId) external {
        require(ownsParcel[msg.sender][parcelId], "Not parcel owner");
        
        uint8 currentLevel = parcelUpgradeLevel[msg.sender][parcelId];
        require(currentLevel < 5, "Max level reached");
        
        uint8 nextLevel = currentLevel + 1;
        uint256 cost = upgradeCosts[nextLevel];
        
        // Burn VOID via utility system
        burnUtility.burnForUtility(
            msg.sender,
            cost,
            VoidBurnUtility.BurnCategory.LAND_UPGRADE,
            string(abi.encodePacked(
                "PARCEL_",
                _uint2str(uint128(parcelId)),
                "_L",
                _uint2str(nextLevel)
            ))
        );
        
        // Upgrade parcel
        parcelUpgradeLevel[msg.sender][parcelId] = nextLevel;
        
        emit ParcelUpgraded(
            msg.sender,
            parcelId,
            currentLevel,
            nextLevel,
            cost,
            block.timestamp
        );
    }
    
    /**
     * @notice Get parcel upgrade level
     * @param owner Parcel owner
     * @param parcelId Parcel ID
     */
    function getUpgradeLevel(address owner, uint256 parcelId) external view returns (uint8) {
        return parcelUpgradeLevel[owner][parcelId];
    }
    
    /**
     * @notice Get upgrade cost for level
     * @param level Target level (1-5)
     */
    function getUpgradeCost(uint8 level) external view returns (uint256) {
        require(level >= 1 && level <= 5, "Invalid level");
        return upgradeCosts[level];
    }
    
    /**
     * @notice Set upgrade cost for level (admin or AI Governor)
     * @param level Target level (1-5)
     * @param cost New cost in VOID (18 decimals)
     */
    function setUpgradeCost(
        uint8 level,
        uint256 cost
    ) external onlyRole(LAND_MANAGER_ROLE) {
        require(level >= 1 && level <= 5, "Invalid level");
        
        uint256 oldCost = upgradeCosts[level];
        upgradeCosts[level] = cost;
        
        emit UpgradeCostUpdated(level, oldCost, cost, block.timestamp);
    }
    
    /**
     * @notice Batch set upgrade costs (AI Governor bulk update)
     * @param levels Array of levels
     * @param costs Array of costs (must match levels length)
     */
    function batchSetCosts(
        uint8[] calldata levels,
        uint256[] calldata costs
    ) external onlyRole(LAND_MANAGER_ROLE) {
        require(levels.length == costs.length, "Array length mismatch");
        
        for (uint256 i = 0; i < levels.length; i++) {
            uint8 level = levels[i];
            uint256 cost = costs[i];
            
            require(level >= 1 && level <= 5, "Invalid level");
            
            uint256 oldCost = upgradeCosts[level];
            upgradeCosts[level] = cost;
            
            emit UpgradeCostUpdated(level, oldCost, cost, block.timestamp);
        }
    }
    
    /**
     * @notice Register parcel ownership (admin only, or integrate with real estate contract)
     * @param owner Parcel owner
     * @param parcelId Parcel ID
     * @param owned True if owner, false if not
     */
    function setParcelOwnership(
        address owner,
        uint256 parcelId,
        bool owned
    ) external onlyRole(LAND_MANAGER_ROLE) {
        ownsParcel[owner][parcelId] = owned;
    }
    
    /**
     * @notice Batch register parcel ownership
     * @param owners Array of owners
     * @param parcelIds Array of parcel IDs
     * @param ownedFlags Array of ownership flags
     */
    function batchSetOwnership(
        address[] calldata owners,
        uint256[] calldata parcelIds,
        bool[] calldata ownedFlags
    ) external onlyRole(LAND_MANAGER_ROLE) {
        require(
            owners.length == parcelIds.length && parcelIds.length == ownedFlags.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < owners.length; i++) {
            ownsParcel[owners[i]][parcelIds[i]] = ownedFlags[i];
        }
    }
    
    // Helper: uint to string
    function _uint2str(uint128 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint128 j = _i;
        uint128 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint128 k = len;
        while (_i != 0) {
            k = k-1;
            uint128 _mod = _i % 10;
            bstr[k] = bytes1(uint8(48 + _mod));
            _i /= 10;
        }
        return string(bstr);
    }
}
