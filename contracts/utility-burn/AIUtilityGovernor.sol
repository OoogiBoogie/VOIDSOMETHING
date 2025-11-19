// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidBurnUtility.sol";
import "./DistrictAccessBurn.sol";
import "./LandUpgradeBurn.sol";
import "./CreatorToolsBurn.sol";
import "./PrestigeBurn.sol";
import "./MiniAppBurnAccess.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AIUtilityGovernor
 * @notice AI-controlled utility pricing governor (SAFE MODE)
 * @dev CRITICAL: ONLY uses world metrics, NEVER financial data
 * 
 * SAFE METRICS (ALLOWED):
 * ✅ District unlock counts
 * ✅ Land upgrade adoption
 * ✅ Creator tier distribution
 * ✅ Prestige rank progression
 * ✅ Mini-app feature usage
 * ✅ User onboarding rates
 * ✅ Engagement patterns
 * 
 * FORBIDDEN METRICS (NEVER):
 * ❌ Token price
 * ❌ Market data
 * ❌ Liquidity
 * ❌ Exchanges
 * ❌ Trading volumes
 * ❌ Charts/speculation
 * 
 * SAFETY CONSTRAINTS:
 * - Max 10% price change per adjustment
 * - 7-day cooldown between adjustments
 * - Hard-coded min/max bounds
 * - No price increases during onboarding waves
 * - All changes emit events (transparency)
 */
contract AIUtilityGovernor is AccessControl {
    bytes32 public constant AI_OPERATOR_ROLE = keccak256("AI_OPERATOR_ROLE");
    
    VoidBurnUtility public immutable burnUtility;
    DistrictAccessBurn public immutable districtAccess;
    LandUpgradeBurn public immutable landUpgrade;
    CreatorToolsBurn public immutable creatorTools;
    PrestigeBurn public immutable prestige;
    MiniAppBurnAccess public immutable miniAppAccess;
    
    // Safety constraints
    uint256 public constant MAX_PRICE_CHANGE_PERCENT = 10; // 10% max change
    uint256 public constant ADJUSTMENT_COOLDOWN = 7 days;
    
    uint256 public lastAdjustmentTimestamp;
    uint256 public adjustmentCount;
    
    // World usage metrics (safe, non-financial)
    struct WorldMetrics {
        uint256 totalDistrictUnlocks;
        uint256 totalLandUpgrades;
        uint256 totalCreatorTiers;
        uint256 totalPrestigeRanks;
        uint256 totalMiniAppUnlocks;
        uint256 activeUsers30d;
        uint256 newUsers7d;
    }
    
    WorldMetrics public currentMetrics;
    
    // Price bounds (hard-coded safety limits)
    struct PriceBounds {
        uint256 minDistrictPrice;
        uint256 maxDistrictPrice;
        uint256 minLandUpgradePrice;
        uint256 maxLandUpgradePrice;
        uint256 minCreatorTierPrice;
        uint256 maxCreatorTierPrice;
        uint256 minPrestigePrice;
        uint256 maxPrestigePrice;
        uint256 minMiniAppPrice;
        uint256 maxMiniAppPrice;
    }
    
    PriceBounds public bounds;
    
    // Events
    event MetricsUpdated(WorldMetrics metrics, uint256 timestamp);
    
    event PricesAdjusted(
        string category,
        uint256 adjustmentPercent,
        bool increased,
        uint256 timestamp
    );
    
    event EmergencyPriceOverride(
        string category,
        uint256[] newPrices,
        address indexed admin,
        uint256 timestamp
    );
    
    /**
     * @notice Initialize AI Governor
     * @param _burnUtility VoidBurnUtility contract
     * @param _districtAccess DistrictAccessBurn contract
     * @param _landUpgrade LandUpgradeBurn contract
     * @param _creatorTools CreatorToolsBurn contract
     * @param _prestige PrestigeBurn contract
     * @param _miniAppAccess MiniAppBurnAccess contract
     */
    constructor(
        address _burnUtility,
        address _districtAccess,
        address _landUpgrade,
        address _creatorTools,
        address _prestige,
        address _miniAppAccess
    ) {
        burnUtility = VoidBurnUtility(_burnUtility);
        districtAccess = DistrictAccessBurn(_districtAccess);
        landUpgrade = LandUpgradeBurn(_landUpgrade);
        creatorTools = CreatorToolsBurn(_creatorTools);
        prestige = PrestigeBurn(_prestige);
        miniAppAccess = MiniAppBurnAccess(_miniAppAccess);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AI_OPERATOR_ROLE, msg.sender);
        
        lastAdjustmentTimestamp = block.timestamp;
        
        // Set hard-coded price bounds (safety limits)
        bounds = PriceBounds({
            minDistrictPrice: 10_000 * 1e18,       // Min 10k VOID
            maxDistrictPrice: 10_000_000 * 1e18,   // Max 10M VOID
            minLandUpgradePrice: 5_000 * 1e18,     // Min 5k VOID
            maxLandUpgradePrice: 25_000_000 * 1e18, // Max 25M VOID
            minCreatorTierPrice: 10_000 * 1e18,    // Min 10k VOID
            maxCreatorTierPrice: 20_000_000 * 1e18, // Max 20M VOID
            minPrestigePrice: 1_000 * 1e18,        // Min 1k VOID
            maxPrestigePrice: 500_000_000 * 1e18,  // Max 500M VOID
            minMiniAppPrice: 1_000 * 1e18,         // Min 1k VOID
            maxMiniAppPrice: 5_000_000 * 1e18      // Max 5M VOID
        });
    }
    
    /**
     * @notice Update world usage metrics (AI operator only)
     * @dev These metrics are collected from on-chain events (non-financial)
     */
    function updateMetrics(
        uint256 _totalDistrictUnlocks,
        uint256 _totalLandUpgrades,
        uint256 _totalCreatorTiers,
        uint256 _totalPrestigeRanks,
        uint256 _totalMiniAppUnlocks,
        uint256 _activeUsers30d,
        uint256 _newUsers7d
    ) external onlyRole(AI_OPERATOR_ROLE) {
        currentMetrics = WorldMetrics({
            totalDistrictUnlocks: _totalDistrictUnlocks,
            totalLandUpgrades: _totalLandUpgrades,
            totalCreatorTiers: _totalCreatorTiers,
            totalPrestigeRanks: _totalPrestigeRanks,
            totalMiniAppUnlocks: _totalMiniAppUnlocks,
            activeUsers30d: _activeUsers30d,
            newUsers7d: _newUsers7d
        });
        
        emit MetricsUpdated(currentMetrics, block.timestamp);
    }
    
    /**
     * @notice AI-controlled district price adjustment
     * @param districtIds Array of district IDs to adjust
     * @param adjustmentPercents Array of adjustment percentages (e.g., 5 = +5%, -5 = -5%)
     * @dev Enforces 10% max change, 7-day cooldown, bounds checking
     */
    function adjustDistrictPrices(
        uint8[] calldata districtIds,
        int8[] calldata adjustmentPercents
    ) external onlyRole(AI_OPERATOR_ROLE) {
        require(
            block.timestamp >= lastAdjustmentTimestamp + ADJUSTMENT_COOLDOWN,
            "Cooldown not elapsed"
        );
        require(districtIds.length == adjustmentPercents.length, "Array length mismatch");
        
        // Check for onboarding wave (no price increases allowed)
        bool onboardingWave = currentMetrics.newUsers7d > currentMetrics.activeUsers30d / 10;
        
        uint256[] memory newPrices = new uint256[](districtIds.length);
        
        for (uint256 i = 0; i < districtIds.length; i++) {
            uint8 districtId = districtIds[i];
            int8 adjustmentPercent = adjustmentPercents[i];
            
            require(
                adjustmentPercent >= -int8(int256(MAX_PRICE_CHANGE_PERCENT)) &&
                adjustmentPercent <= int8(int256(MAX_PRICE_CHANGE_PERCENT)),
                "Exceeds max change"
            );
            
            // Prevent price increases during onboarding waves
            if (onboardingWave && adjustmentPercent > 0) {
                adjustmentPercent = 0;
            }
            
            uint256 currentPrice = districtAccess.districtUnlockPrice(districtId);
            uint256 newPrice = _applyAdjustment(currentPrice, adjustmentPercent);
            
            // Enforce bounds
            require(
                newPrice >= bounds.minDistrictPrice && newPrice <= bounds.maxDistrictPrice,
                "Price out of bounds"
            );
            
            newPrices[i] = newPrice;
        }
        
        // Apply price changes
        districtAccess.batchSetPrices(districtIds, newPrices);
        
        lastAdjustmentTimestamp = block.timestamp;
        adjustmentCount++;
        
        emit PricesAdjusted("DISTRICT", MAX_PRICE_CHANGE_PERCENT, false, block.timestamp);
    }
    
    /**
     * @notice AI-controlled land upgrade price adjustment
     */
    function adjustLandUpgradePrices(
        uint8[] calldata levels,
        int8[] calldata adjustmentPercents
    ) external onlyRole(AI_OPERATOR_ROLE) {
        require(
            block.timestamp >= lastAdjustmentTimestamp + ADJUSTMENT_COOLDOWN,
            "Cooldown not elapsed"
        );
        require(levels.length == adjustmentPercents.length, "Array length mismatch");
        
        bool onboardingWave = currentMetrics.newUsers7d > currentMetrics.activeUsers30d / 10;
        
        uint256[] memory newPrices = new uint256[](levels.length);
        
        for (uint256 i = 0; i < levels.length; i++) {
            uint8 level = levels[i];
            int8 adjustmentPercent = adjustmentPercents[i];
            
            require(
                adjustmentPercent >= -int8(int256(MAX_PRICE_CHANGE_PERCENT)) &&
                adjustmentPercent <= int8(int256(MAX_PRICE_CHANGE_PERCENT)),
                "Exceeds max change"
            );
            
            if (onboardingWave && adjustmentPercent > 0) {
                adjustmentPercent = 0;
            }
            
            uint256 currentPrice = landUpgrade.upgradeCosts(level);
            uint256 newPrice = _applyAdjustment(currentPrice, adjustmentPercent);
            
            require(
                newPrice >= bounds.minLandUpgradePrice && newPrice <= bounds.maxLandUpgradePrice,
                "Price out of bounds"
            );
            
            newPrices[i] = newPrice;
        }
        
        landUpgrade.batchSetCosts(levels, newPrices);
        
        lastAdjustmentTimestamp = block.timestamp;
        adjustmentCount++;
        
        emit PricesAdjusted("LAND_UPGRADE", MAX_PRICE_CHANGE_PERCENT, false, block.timestamp);
    }
    
    /**
     * @notice AI-controlled creator tier price adjustment
     */
    function adjustCreatorTierPrices(
        uint8[] calldata tiers,
        int8[] calldata adjustmentPercents
    ) external onlyRole(AI_OPERATOR_ROLE) {
        require(
            block.timestamp >= lastAdjustmentTimestamp + ADJUSTMENT_COOLDOWN,
            "Cooldown not elapsed"
        );
        require(tiers.length == adjustmentPercents.length, "Array length mismatch");
        
        bool onboardingWave = currentMetrics.newUsers7d > currentMetrics.activeUsers30d / 10;
        
        uint256[] memory newPrices = new uint256[](tiers.length);
        
        for (uint256 i = 0; i < tiers.length; i++) {
            uint8 tier = tiers[i];
            int8 adjustmentPercent = adjustmentPercents[i];
            
            require(
                adjustmentPercent >= -int8(int256(MAX_PRICE_CHANGE_PERCENT)) &&
                adjustmentPercent <= int8(int256(MAX_PRICE_CHANGE_PERCENT)),
                "Exceeds max change"
            );
            
            if (onboardingWave && adjustmentPercent > 0) {
                adjustmentPercent = 0;
            }
            
            uint256 currentPrice = creatorTools.tierCosts(tier);
            uint256 newPrice = _applyAdjustment(currentPrice, adjustmentPercent);
            
            require(
                newPrice >= bounds.minCreatorTierPrice && newPrice <= bounds.maxCreatorTierPrice,
                "Price out of bounds"
            );
            
            newPrices[i] = newPrice;
        }
        
        creatorTools.batchSetCosts(tiers, newPrices);
        
        lastAdjustmentTimestamp = block.timestamp;
        adjustmentCount++;
        
        emit PricesAdjusted("CREATOR_TIER", MAX_PRICE_CHANGE_PERCENT, false, block.timestamp);
    }
    
    /**
     * @notice AI-controlled prestige rank price adjustment
     */
    function adjustPrestigePrices(
        uint8[] calldata ranks,
        int8[] calldata adjustmentPercents
    ) external onlyRole(AI_OPERATOR_ROLE) {
        require(
            block.timestamp >= lastAdjustmentTimestamp + ADJUSTMENT_COOLDOWN,
            "Cooldown not elapsed"
        );
        require(ranks.length == adjustmentPercents.length, "Array length mismatch");
        
        bool onboardingWave = currentMetrics.newUsers7d > currentMetrics.activeUsers30d / 10;
        
        uint256[] memory newPrices = new uint256[](ranks.length);
        
        for (uint256 i = 0; i < ranks.length; i++) {
            uint8 rank = ranks[i];
            int8 adjustmentPercent = adjustmentPercents[i];
            
            require(
                adjustmentPercent >= -int8(int256(MAX_PRICE_CHANGE_PERCENT)) &&
                adjustmentPercent <= int8(int256(MAX_PRICE_CHANGE_PERCENT)),
                "Exceeds max change"
            );
            
            if (onboardingWave && adjustmentPercent > 0) {
                adjustmentPercent = 0;
            }
            
            uint256 currentPrice = prestige.rankCosts(rank);
            uint256 newPrice = _applyAdjustment(currentPrice, adjustmentPercent);
            
            require(
                newPrice >= bounds.minPrestigePrice && newPrice <= bounds.maxPrestigePrice,
                "Price out of bounds"
            );
            
            newPrices[i] = newPrice;
        }
        
        prestige.batchSetCosts(ranks, newPrices);
        
        lastAdjustmentTimestamp = block.timestamp;
        adjustmentCount++;
        
        emit PricesAdjusted("PRESTIGE", MAX_PRICE_CHANGE_PERCENT, false, block.timestamp);
    }
    
    /**
     * @notice Emergency price override (admin only, bypasses cooldown)
     * @dev Use only for critical fixes, emits special event
     */
    function emergencyOverridePrices(
        string calldata category,
        uint8[] calldata ids,
        uint256[] calldata newPrices
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ids.length == newPrices.length, "Array length mismatch");
        
        if (keccak256(bytes(category)) == keccak256("DISTRICT")) {
            districtAccess.batchSetPrices(ids, newPrices);
        } else if (keccak256(bytes(category)) == keccak256("LAND_UPGRADE")) {
            landUpgrade.batchSetCosts(ids, newPrices);
        } else if (keccak256(bytes(category)) == keccak256("CREATOR_TIER")) {
            creatorTools.batchSetCosts(ids, newPrices);
        } else if (keccak256(bytes(category)) == keccak256("PRESTIGE")) {
            prestige.batchSetCosts(ids, newPrices);
        } else {
            revert("Invalid category");
        }
        
        emit EmergencyPriceOverride(category, newPrices, msg.sender, block.timestamp);
    }
    
    // Internal: Apply percentage adjustment
    function _applyAdjustment(
        uint256 currentPrice,
        int8 adjustmentPercent
    ) internal pure returns (uint256) {
        if (adjustmentPercent == 0) return currentPrice;
        
        if (adjustmentPercent > 0) {
            return currentPrice + (currentPrice * uint256(int256(adjustmentPercent))) / 100;
        } else {
            return currentPrice - (currentPrice * uint256(int256(-adjustmentPercent))) / 100;
        }
    }
}
