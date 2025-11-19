// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidBurnUtility.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DistrictAccessBurn
 * @notice District unlock system via VOID burning
 * @dev Integrates with WorldLayout district system
 * 
 * FEATURES:
 * - District 1 (VOID_CITY) is free (always unlocked)
 * - Districts 2-5 require VOID burns
 * - Sequential or non-sequential unlocking (configurable)
 * - Slow burn curve with price scaling
 * - AI-adjustable pricing via Governor
 */
contract DistrictAccessBurn is AccessControl {
    bytes32 public constant DISTRICT_MANAGER_ROLE = keccak256("DISTRICT_MANAGER_ROLE");
    
    VoidBurnUtility public immutable burnUtility;
    
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
     * @param _burnUtility Address of VoidBurnUtility contract
     */
    constructor(address _burnUtility) {
        require(_burnUtility != address(0), "Invalid burn utility address");
        
        burnUtility = VoidBurnUtility(_burnUtility);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRICT_MANAGER_ROLE, msg.sender);
        
        // Set initial prices (slow burn curve)
        // District 1 = free (always unlocked)
        districtUnlockPrice[1] = 0;
        districtUnlockPrice[2] = 100_000 * 1e18;  // 100k VOID
        districtUnlockPrice[3] = 250_000 * 1e18;  // 250k VOID
        districtUnlockPrice[4] = 500_000 * 1e18;  // 500k VOID
        districtUnlockPrice[5] = 1_000_000 * 1e18; // 1M VOID
        
        // Default: non-sequential (unlock any district)
        requireSequentialUnlock = false;
    }
    
    /**
     * @notice Unlock district by burning VOID
     * @param districtId District ID (1-5)
     */
    function unlockDistrict(uint8 districtId) external {
        require(districtId >= 1 && districtId <= 5, "Invalid district ID");
        require(!hasUnlocked[msg.sender][districtId], "Already unlocked");
        
        // District 1 is always free
        if (districtId == 1) {
            hasUnlocked[msg.sender][1] = true;
            unlockedCount[msg.sender]++;
            emit DistrictUnlocked(msg.sender, 1, 0, block.timestamp);
            return;
        }
        
        // Check sequential requirement
        if (requireSequentialUnlock) {
            require(
                hasUnlocked[msg.sender][districtId - 1],
                "Must unlock previous district first"
            );
        }
        
        uint256 price = districtUnlockPrice[districtId];
        require(price > 0, "District not available");
        
        // Burn VOID via utility system
        burnUtility.burnForUtility(
            msg.sender,  // User address
            price,
            VoidBurnUtility.BurnCategory.DISTRICT_UNLOCK,
            string(abi.encodePacked("DISTRICT_", _uint2str(districtId)))
        );
        
        // Mark as unlocked
        hasUnlocked[msg.sender][districtId] = true;
        unlockedCount[msg.sender]++;
        
        emit DistrictUnlocked(msg.sender, districtId, price, block.timestamp);
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
