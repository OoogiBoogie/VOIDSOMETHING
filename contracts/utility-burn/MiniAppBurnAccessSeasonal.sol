// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidBurnUtilitySeasonal.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MiniAppBurnAccessSeasonal
 * @notice Mini-app premium feature access via VOID burning (Seasonal Spec Compliant)
 * @dev Section 6.5 - Mini-App Unlocks
 * 
 * FEATURES:
 * - One-time burn = permanent access
 * - Feature-based unlocking (not time-based)
 * - Multiple mini-apps supported
 * - Uses canonical performUtilityBurn pipeline
 * 
 * COMPLIANCE:
 * - No subscriptions (no recurring revenue)
 * - No renewals (permanent unlock)
 * - Pure utility access model
 */
contract MiniAppBurnAccessSeasonal is AccessControl {
    bytes32 public constant MINIAPP_MANAGER_ROLE = keccak256("MINIAPP_MANAGER_ROLE");
    
    VoidBurnUtilitySeasonal public immutable burnUtility;
    
    // Mini-app feature unlocks
    mapping(address => mapping(uint256 => bool)) public hasUnlockedMiniApp;
    // user => appId => unlocked
    
    // Mini-app prices
    mapping(uint256 => uint256) public miniAppPrice;
    
    // Mini-app metadata
    mapping(uint256 => bool) public miniAppRegistered;
    mapping(uint256 => string) public miniAppName;
    mapping(uint256 => string) public miniAppDescription;
    
    // Unlock counters
    mapping(address => uint256) public miniAppsUnlockedCount;
    
    // Events
    event MiniAppRegistered(
        uint256 indexed appId,
        string name,
        uint256 price,
        uint256 timestamp
    );
    
    event MiniAppUnlocked(
        address indexed user,
        uint256 indexed appId,
        uint256 indexed seasonId,
        uint256 voidBurned,
        uint256 timestamp
    );
    
    event MiniAppPriceUpdated(
        uint256 indexed appId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );
    
    /**
     * @notice Initialize mini-app access system
     * @param _burnUtility Address of VoidBurnUtilitySeasonal contract
     */
    constructor(address _burnUtility) {
        require(_burnUtility != address(0), "Invalid burn utility address");
        
        burnUtility = VoidBurnUtilitySeasonal(_burnUtility);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINIAPP_MANAGER_ROLE, msg.sender);
    }
    
    /**
     * @notice Register mini-app with metadata and price
     * @param appId Mini-app ID
     * @param name Mini-app name
     * @param description Mini-app description
     * @param price Unlock price in VOID (18 decimals)
     */
    function registerMiniApp(
        uint256 appId,
        string calldata name,
        string calldata description,
        uint256 price
    ) external onlyRole(MINIAPP_MANAGER_ROLE) {
        require(!miniAppRegistered[appId], "Mini-app already registered");
        require(price > 0, "Price must be > 0");
        
        miniAppRegistered[appId] = true;
        miniAppName[appId] = name;
        miniAppDescription[appId] = description;
        miniAppPrice[appId] = price;
        
        emit MiniAppRegistered(appId, name, price, block.timestamp);
    }
    
    /**
     * @notice Unlock mini-app by burning VOID
     * @param appId Mini-app ID
     * @dev Section 6.5 - One-time permanent unlock
     */
    function unlockMiniApp(uint256 appId) external {
        require(miniAppRegistered[appId], "Mini-app not registered");
        require(!hasUnlockedMiniApp[msg.sender][appId], "Already unlocked");
        
        uint256 price = miniAppPrice[appId];
        require(price > 0, "Invalid price");
        
        // Prepare module data
        bytes memory moduleData = abi.encode(appId);
        
        // Call canonical burn pipeline
        burnUtility.performUtilityBurn(
            msg.sender,
            price,
            VoidBurnUtilitySeasonal.BurnModule.MINIAPP,
            moduleData
        );
        
        // Mark as unlocked
        hasUnlockedMiniApp[msg.sender][appId] = true;
        miniAppsUnlockedCount[msg.sender]++;
        
        uint256 seasonId = burnUtility.getCurrentSeasonId();
        emit MiniAppUnlocked(msg.sender, appId, seasonId, price, block.timestamp);
        
        // Update lifetime state in burn utility
        _updateLifetimeState(msg.sender);
    }
    
    /**
     * @notice Update lifetime state in burn utility
     * @dev Called after unlock to sync mini-app count
     */
    function _updateLifetimeState(address user) internal {
        // Get current lifetime state
        (
            ,
            uint8 prestigeRank,
            uint8 creatorTier,
            uint8 districtsUnlocked,
        ) = burnUtility.lifetimeState(user);
        
        // Update with new mini-app count (capped at uint8 max)
        uint256 count = miniAppsUnlockedCount[user];
        uint8 safeCount = count > 255 ? 255 : uint8(count);
        
        // Note: This requires BURN_MANAGER_ROLE on this contract
        // burnUtility.updateLifetimeState(
        //     user,
        //     prestigeRank,
        //     creatorTier,
        //     districtsUnlocked,
        //     safeCount
        // );
        
        // TODO: Implement updateLifetimeState call once role is granted
    }
    
    /**
     * @notice Check if user has unlocked mini-app
     * @param user User address
     * @param appId Mini-app ID
     */
    function isMiniAppUnlocked(address user, uint256 appId) external view returns (bool) {
        return hasUnlockedMiniApp[user][appId];
    }
    
    /**
     * @notice Get mini-app details
     * @param appId Mini-app ID
     */
    function getMiniAppDetails(uint256 appId)
        external
        view
        returns (
            bool registered,
            string memory name,
            string memory description,
            uint256 price
        )
    {
        return (
            miniAppRegistered[appId],
            miniAppName[appId],
            miniAppDescription[appId],
            miniAppPrice[appId]
        );
    }
    
    /**
     * @notice Get number of mini-apps unlocked by user
     * @param user User address
     */
    function getUnlockedCount(address user) external view returns (uint256) {
        return miniAppsUnlockedCount[user];
    }
    
    /**
     * @notice Set mini-app price (admin only)
     * @param appId Mini-app ID
     * @param price New price in VOID (18 decimals)
     */
    function setMiniAppPrice(
        uint256 appId,
        uint256 price
    ) external onlyRole(MINIAPP_MANAGER_ROLE) {
        require(miniAppRegistered[appId], "Mini-app not registered");
        require(price > 0, "Price must be > 0");
        
        uint256 oldPrice = miniAppPrice[appId];
        miniAppPrice[appId] = price;
        
        emit MiniAppPriceUpdated(appId, oldPrice, price, block.timestamp);
    }
    
    /**
     * @notice Batch set prices for multiple mini-apps
     * @param appIds Array of app IDs
     * @param prices Array of prices
     */
    function batchSetPrices(
        uint256[] calldata appIds,
        uint256[] calldata prices
    ) external onlyRole(MINIAPP_MANAGER_ROLE) {
        require(appIds.length == prices.length, "Array length mismatch");
        
        for (uint256 i = 0; i < appIds.length; i++) {
            uint256 appId = appIds[i];
            uint256 price = prices[i];
            
            require(miniAppRegistered[appId], "Mini-app not registered");
            require(price > 0, "Price must be > 0");
            
            uint256 oldPrice = miniAppPrice[appId];
            miniAppPrice[appId] = price;
            
            emit MiniAppPriceUpdated(appId, oldPrice, price, block.timestamp);
        }
    }
    
    /**
     * @notice Update mini-app metadata (admin only)
     * @param appId Mini-app ID
     * @param name New name
     * @param description New description
     */
    function updateMiniAppMetadata(
        uint256 appId,
        string calldata name,
        string calldata description
    ) external onlyRole(MINIAPP_MANAGER_ROLE) {
        require(miniAppRegistered[appId], "Mini-app not registered");
        
        miniAppName[appId] = name;
        miniAppDescription[appId] = description;
    }
}
