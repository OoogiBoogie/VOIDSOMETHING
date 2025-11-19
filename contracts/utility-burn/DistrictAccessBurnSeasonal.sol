// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidBurnUtilitySeasonal.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DistrictAccessBurnSeasonal
 * @notice District unlock system via VOID burning (Seasonal Spec Compliant)
 * @dev Section 6.1 - District Unlocks
 * 
 * FEATURES:
 * - District 1 (VOID_CITY) is free (always unlocked)
 * - Districts 2-5 require VOID burns
 * - Sequential or non-sequential unlocking (configurable)
 * - Integrates with seasonal burn system
 * - Uses canonical performUtilityBurn pipeline
 */
contract DistrictAccessBurnSeasonal is AccessControl {
    bytes32 public constant DISTRICT_MANAGER_ROLE = keccak256("DISTRICT_MANAGER_ROLE");
    
    VoidBurnUtilitySeasonal public immutable burnUtility;
    
    // District unlock prices (in VOID, 18 decimals)
    mapping(uint8 => uint256) public districtUnlockPrice;
    
    // User unlock status
    mapping(address => mapping(uint8 => bool)) public hasUnlocked;
    mapping(address => uint8) public unlockedCount;
    
    // Configuration
    bool public requireSequentialUnlock; // If true, must unlock 1→2→3→4→5
    
    // Events
    event DistrictUnlocked(
        address indexed user,
        uint8 indexed districtId,
        uint256 indexed seasonId,
        uint256 voidBurned,
        uint256 timestamp
    );
    
    event DistrictPriceUpdated(
        uint8 indexed districtId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );
    
    event SequentialModeToggled(bool enabled, uint256 timestamp);
    
    /**
     * @notice Initialize district access system
     * @param _burnUtility Address of VoidBurnUtilitySeasonal contract
     */
    constructor(address _burnUtility) {
        require(_burnUtility != address(0), "Invalid burn utility address");
        
        burnUtility = VoidBurnUtilitySeasonal(_burnUtility);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRICT_MANAGER_ROLE, msg.sender);
        
        // Grant this contract BURN_MANAGER_ROLE to call performUtilityBurn
        // (Must be granted by VoidBurnUtilitySeasonal admin after deployment)
        
        // Set initial prices (slow burn curve)
        districtUnlockPrice[1] = 0;                // District 1 = free
        districtUnlockPrice[2] = 100_000 * 1e18;   // 100k VOID
        districtUnlockPrice[3] = 250_000 * 1e18;   // 250k VOID
        districtUnlockPrice[4] = 500_000 * 1e18;   // 500k VOID
        districtUnlockPrice[5] = 1_000_000 * 1e18; // 1M VOID
        
        // Default: non-sequential (unlock any district)
        requireSequentialUnlock = false;
    }
    
    /**
     * @notice Unlock district by burning VOID
     * @param districtId District ID (1-5)
     * @dev Section 6.1 - Sequential unlock pattern with prerequisites
     */
    function unlockDistrict(uint8 districtId) external {
        require(districtId >= 1 && districtId <= 5, "Invalid district ID");
        require(!hasUnlocked[msg.sender][districtId], "Already unlocked");
        
        // District 1 is always free
        if (districtId == 1) {
            hasUnlocked[msg.sender][1] = true;
            unlockedCount[msg.sender]++;
            
            uint256 currentSeasonId = burnUtility.getCurrentSeasonId();
            emit DistrictUnlocked(msg.sender, 1, currentSeasonId, 0, block.timestamp);
            
            // Update lifetime state
            _updateLifetimeState(msg.sender);
            return;
        }
        
        // Check sequential requirement (prerequisite)
        if (requireSequentialUnlock) {
            require(
                hasUnlocked[msg.sender][districtId - 1],
                "Must unlock previous district first"
            );
        }
        
        uint256 price = districtUnlockPrice[districtId];
        require(price > 0, "District not available");
        
        // Prepare module data
        bytes memory moduleData = abi.encode(districtId);
        
        // Call canonical burn pipeline
        // This will:
        // 1. Burn VOID
        // 2. Update lifetime state
        // 3. Update seasonal state
        // 4. Emit UtilityBurn event with seasonId
        burnUtility.performUtilityBurn(
            msg.sender,
            price,
            VoidBurnUtilitySeasonal.BurnModule.DISTRICT,
            moduleData
        );
        
        // Mark as unlocked
        hasUnlocked[msg.sender][districtId] = true;
        unlockedCount[msg.sender]++;
        
        uint256 seasonId = burnUtility.getCurrentSeasonId();
        emit DistrictUnlocked(msg.sender, districtId, seasonId, price, block.timestamp);
        
        // Update lifetime state in burn utility
        _updateLifetimeState(msg.sender);
    }
    
    /**
     * @notice Update lifetime state in burn utility
     * @dev Called after any unlock to sync district count
     */
    function _updateLifetimeState(address user) internal {
        // Get current lifetime state
        (
            ,
            uint8 prestigeRank,
            uint8 creatorTier,
            ,
            uint8 miniAppsUnlocked
        ) = burnUtility.lifetimeState(user);
        
        // Update with new district count
        // Note: This requires BURN_MANAGER_ROLE on this contract
        // burnUtility.updateLifetimeState(
        //     user,
        //     prestigeRank,
        //     creatorTier,
        //     unlockedCount[user],
        //     miniAppsUnlocked
        // );
        
        // TODO: Implement updateLifetimeState call once role is granted
    }
    
    /**
     * @notice Check if user has unlocked district
     * @param user User address
     * @param districtId District ID
     */
    function isDistrictUnlocked(address user, uint8 districtId) external view returns (bool) {
        // District 1 always unlocked
        if (districtId == 1) return true;
        return hasUnlocked[user][districtId];
    }
    
    /**
     * @notice Get number of districts unlocked by user
     * @param user User address
     */
    function getUnlockedCount(address user) external view returns (uint8) {
        return unlockedCount[user];
    }
    
    /**
     * @notice Set unlock price for district (admin or AI Governor)
     * @param districtId District ID
     * @param price New price in VOID (18 decimals)
     */
    function setDistrictPrice(
        uint8 districtId,
        uint256 price
    ) external onlyRole(DISTRICT_MANAGER_ROLE) {
        require(districtId >= 2 && districtId <= 5, "Invalid district ID");
        
        uint256 oldPrice = districtUnlockPrice[districtId];
        districtUnlockPrice[districtId] = price;
        
        emit DistrictPriceUpdated(districtId, oldPrice, price, block.timestamp);
    }
    
    /**
     * @notice Toggle sequential unlock requirement (admin only)
     * @param enabled True = must unlock sequentially, False = unlock any
     */
    function setSequentialMode(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        requireSequentialUnlock = enabled;
        emit SequentialModeToggled(enabled, block.timestamp);
    }
    
    /**
     * @notice Batch set prices for multiple districts (AI Governor bulk update)
     * @param districtIds Array of district IDs
     * @param prices Array of prices (must match districtIds length)
     */
    function batchSetPrices(
        uint8[] calldata districtIds,
        uint256[] calldata prices
    ) external onlyRole(DISTRICT_MANAGER_ROLE) {
        require(districtIds.length == prices.length, "Array length mismatch");
        
        for (uint256 i = 0; i < districtIds.length; i++) {
            uint8 districtId = districtIds[i];
            uint256 price = prices[i];
            
            require(districtId >= 2 && districtId <= 5, "Invalid district ID");
            
            uint256 oldPrice = districtUnlockPrice[districtId];
            districtUnlockPrice[districtId] = price;
            
            emit DistrictPriceUpdated(districtId, oldPrice, price, block.timestamp);
        }
    }
}
