// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidBurnUtility.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MiniAppBurnAccess
 * @notice Mini-app premium feature access via VOID burning
 * @dev ONE-TIME PERMANENT UNLOCKS (no subscriptions/renewals)
 * 
 * FEATURES:
 * - One-time burn = permanent access
 * - Feature-based unlocking (not time-based)
 * - Multiple mini-apps supported
 * - AI-adjustable pricing via Governor
 * 
 * COMPLIANCE:
 * - No subscriptions (no recurring revenue)
 * - No renewals (permanent unlock)
 * - Pure utility access model
 */
contract MiniAppBurnAccess is AccessControl {
    bytes32 public constant MINIAPP_MANAGER_ROLE = keccak256("MINIAPP_MANAGER_ROLE");
    
    VoidBurnUtility public immutable burnUtility;
    
    // Mini-app feature unlocks
    mapping(address => mapping(string => mapping(string => bool))) public hasFeatureAccess;
    // user => miniAppId => featureId => unlocked
    
    // Feature prices per mini-app
    mapping(string => mapping(string => uint256)) public featurePrices;
    // miniAppId => featureId => price
    
    // Mini-app metadata
    mapping(string => bool) public miniAppRegistered;
    mapping(string => string[]) public featuresByMiniApp;
    
    // Events
    event MiniAppRegistered(
        string indexed miniAppId,
        string[] features,
        uint256 timestamp
    );
    
    event FeatureUnlocked(
        address indexed user,
        string indexed miniAppId,
        string featureId,
        uint256 voidBurned,
        uint256 timestamp
    );
    
    event FeaturePriceUpdated(
        string indexed miniAppId,
        string featureId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );
    
    /**
     * @notice Initialize mini-app access system
     * @param _burnUtility Address of VoidBurnUtility contract
     */
    constructor(address _burnUtility) {
        require(_burnUtility != address(0), "Invalid burn utility address");
        
        burnUtility = VoidBurnUtility(_burnUtility);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINIAPP_MANAGER_ROLE, msg.sender);
    }
    
    /**
     * @notice Register mini-app with features
     * @param miniAppId Mini-app identifier
     * @param features Array of feature IDs
     * @param prices Array of prices (must match features length)
     */
    function registerMiniApp(
        string calldata miniAppId,
        string[] calldata features,
        uint256[] calldata prices
    ) external onlyRole(MINIAPP_MANAGER_ROLE) {
        require(features.length == prices.length, "Array length mismatch");
        require(!miniAppRegistered[miniAppId], "Mini-app already registered");
        
        miniAppRegistered[miniAppId] = true;
        
        for (uint256 i = 0; i < features.length; i++) {
            featuresByMiniApp[miniAppId].push(features[i]);
            featurePrices[miniAppId][features[i]] = prices[i];
        }
        
        emit MiniAppRegistered(miniAppId, features, block.timestamp);
    }
    
    /**
     * @notice Unlock mini-app feature by burning VOID (permanent access)
     * @param miniAppId Mini-app identifier
     * @param featureId Feature identifier
     */
    function unlockFeature(
        string calldata miniAppId,
        string calldata featureId
    ) external {
        require(miniAppRegistered[miniAppId], "Mini-app not registered");
        require(
            !hasFeatureAccess[msg.sender][miniAppId][featureId],
            "Feature already unlocked"
        );
        
        uint256 price = featurePrices[miniAppId][featureId];
        require(price > 0, "Feature not available");
        
        // Burn VOID via utility system
        burnUtility.burnForUtility(
            msg.sender,
            price,
            VoidBurnUtility.BurnCategory.MINIAPP_ACCESS,
            string(abi.encodePacked("MINIAPP_", miniAppId, "_", featureId))
        );
        
        // Grant permanent access
        hasFeatureAccess[msg.sender][miniAppId][featureId] = true;
        
        emit FeatureUnlocked(msg.sender, miniAppId, featureId, price, block.timestamp);
    }
    
    /**
     * @notice Check if user has feature access
     * @param user User address
     * @param miniAppId Mini-app identifier
     * @param featureId Feature identifier
     */
    function hasAccess(
        address user,
        string calldata miniAppId,
        string calldata featureId
    ) external view returns (bool) {
        return hasFeatureAccess[user][miniAppId][featureId];
    }
    
    /**
     * @notice Get features for mini-app
     * @param miniAppId Mini-app identifier
     */
    function getFeatures(string calldata miniAppId) external view returns (string[] memory) {
        return featuresByMiniApp[miniAppId];
    }
    
    /**
     * @notice Get feature price
     * @param miniAppId Mini-app identifier
     * @param featureId Feature identifier
     */
    function getFeaturePrice(
        string calldata miniAppId,
        string calldata featureId
    ) external view returns (uint256) {
        return featurePrices[miniAppId][featureId];
    }
    
    /**
     * @notice Set feature price (admin or AI Governor)
     * @param miniAppId Mini-app identifier
     * @param featureId Feature identifier
     * @param price New price in VOID (18 decimals)
     */
    function setFeaturePrice(
        string calldata miniAppId,
        string calldata featureId,
        uint256 price
    ) external onlyRole(MINIAPP_MANAGER_ROLE) {
        require(miniAppRegistered[miniAppId], "Mini-app not registered");
        
        uint256 oldPrice = featurePrices[miniAppId][featureId];
        featurePrices[miniAppId][featureId] = price;
        
        emit FeaturePriceUpdated(miniAppId, featureId, oldPrice, price, block.timestamp);
    }
    
    /**
     * @notice Add feature to existing mini-app
     * @param miniAppId Mini-app identifier
     * @param featureId Feature identifier
     * @param price Feature price in VOID (18 decimals)
     */
    function addFeature(
        string calldata miniAppId,
        string calldata featureId,
        uint256 price
    ) external onlyRole(MINIAPP_MANAGER_ROLE) {
        require(miniAppRegistered[miniAppId], "Mini-app not registered");
        
        featuresByMiniApp[miniAppId].push(featureId);
        featurePrices[miniAppId][featureId] = price;
    }
    
    /**
     * @notice Batch set feature prices (AI Governor bulk update)
     * @param miniAppIds Array of mini-app IDs
     * @param featureIds Array of feature IDs
     * @param prices Array of prices (must match length)
     */
    function batchSetPrices(
        string[] calldata miniAppIds,
        string[] calldata featureIds,
        uint256[] calldata prices
    ) external onlyRole(MINIAPP_MANAGER_ROLE) {
        require(
            miniAppIds.length == featureIds.length && featureIds.length == prices.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < miniAppIds.length; i++) {
            string memory miniAppId = miniAppIds[i];
            string memory featureId = featureIds[i];
            uint256 price = prices[i];
            
            require(miniAppRegistered[miniAppId], "Mini-app not registered");
            
            uint256 oldPrice = featurePrices[miniAppId][featureId];
            featurePrices[miniAppId][featureId] = price;
            
            emit FeaturePriceUpdated(miniAppId, featureId, oldPrice, price, block.timestamp);
        }
    }
}
