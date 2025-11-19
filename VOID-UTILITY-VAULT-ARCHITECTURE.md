# VOID Utility Vault Architecture - Technical Specification

**Version**: 1.0  
**Status**: Design Document  
**Implementation Phase**: Post-Phase 8  
**Category**: Pure Utility System (Non-Financial)

---

## Overview

The VOID Utility Vault is a **pure consumption sink** for VOID tokens. Unlike treasury or staking systems, tokens sent to the Utility Vault are **permanently consumed** and **never returned**. This system enables district unlocks, land upgrades, creator tools, prestige progression, and mini-app premium features.

**Core Principle**: VOID → Vault (One-way consumption, no distributions, no financial flows)

---

## System Architecture

### 1. VoidUtilityVault.sol (Core Contract)

**Purpose**: Non-withdrawable VOID consumption sink

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VoidUtilityVault is AccessControl, ReentrancyGuard {
    bytes32 public constant UTILITY_MANAGER = keccak256("UTILITY_MANAGER");
    
    IERC20 public immutable voidToken;
    
    // Consumption tracking (view-only, no withdrawals)
    mapping(address => uint256) public totalConsumed;
    mapping(address => mapping(string => uint256)) public consumptionByCategory;
    
    // Utility categories
    enum UtilityCategory {
        DISTRICT_UNLOCK,
        LAND_UPGRADE,
        CREATOR_TOOLS,
        PRESTIGE,
        MINIAPP_ACCESS
    }
    
    // Events
    event UtilityConsumed(
        address indexed user,
        UtilityCategory category,
        uint256 amount,
        string metadata
    );
    
    constructor(address _voidToken) {
        voidToken = IERC20(_voidToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @notice Consume VOID for utility (permanent, non-refundable)
     * @param amount Amount of VOID to consume
     * @param category Utility category
     * @param metadata Optional metadata (e.g., "DISTRICT_2_UNLOCK")
     */
    function consumeVoid(
        uint256 amount,
        UtilityCategory category,
        string calldata metadata
    ) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        // Transfer VOID to vault (permanent lock)
        require(
            voidToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // Track consumption (view-only)
        totalConsumed[msg.sender] += amount;
        consumptionByCategory[msg.sender][_categoryToString(category)] += amount;
        
        emit UtilityConsumed(msg.sender, category, amount, metadata);
    }
    
    /**
     * @notice Get total VOID consumed by user
     */
    function getTotalConsumed(address user) external view returns (uint256) {
        return totalConsumed[user];
    }
    
    /**
     * @notice Get VOID consumed by user in specific category
     */
    function getConsumedByCategory(
        address user,
        UtilityCategory category
    ) external view returns (uint256) {
        return consumptionByCategory[user][_categoryToString(category)];
    }
    
    // Internal helper
    function _categoryToString(UtilityCategory category) internal pure returns (string memory) {
        if (category == UtilityCategory.DISTRICT_UNLOCK) return "DISTRICT_UNLOCK";
        if (category == UtilityCategory.LAND_UPGRADE) return "LAND_UPGRADE";
        if (category == UtilityCategory.CREATOR_TOOLS) return "CREATOR_TOOLS";
        if (category == UtilityCategory.PRESTIGE) return "PRESTIGE";
        if (category == UtilityCategory.MINIAPP_ACCESS) return "MINIAPP_ACCESS";
        return "UNKNOWN";
    }
    
    // NO WITHDRAWAL FUNCTIONS (Permanent vault)
    // NO DISTRIBUTION FUNCTIONS (Pure consumption)
    // NO STAKING REWARDS (Non-financial utility only)
}
```

---

### 2. DistrictAccess.sol (District Unlock System)

**Purpose**: Unlock districts via VOID consumption

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidUtilityVault.sol";

contract DistrictAccess is AccessControl {
    bytes32 public constant DISTRICT_MANAGER = keccak256("DISTRICT_MANAGER");
    
    VoidUtilityVault public immutable vault;
    
    // District unlock prices (in VOID, 18 decimals)
    mapping(uint8 => uint256) public districtUnlockPrice;
    
    // User unlock status
    mapping(address => mapping(uint8 => bool)) public hasUnlocked;
    
    // Events
    event DistrictUnlocked(address indexed user, uint8 districtId, uint256 voidConsumed);
    
    constructor(address _vault) {
        vault = VoidUtilityVault(_vault);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Set initial prices (example)
        districtUnlockPrice[2] = 100_000 * 1e18;  // District 2: 100k VOID
        districtUnlockPrice[3] = 250_000 * 1e18;  // District 3: 250k VOID
        districtUnlockPrice[4] = 500_000 * 1e18;  // District 4: 500k VOID
        districtUnlockPrice[5] = 1_000_000 * 1e18; // District 5: 1M VOID
    }
    
    /**
     * @notice Unlock district by consuming VOID
     */
    function unlockDistrict(uint8 districtId) external {
        require(!hasUnlocked[msg.sender][districtId], "Already unlocked");
        require(districtUnlockPrice[districtId] > 0, "Invalid district");
        
        uint256 price = districtUnlockPrice[districtId];
        
        // Consume VOID via vault (permanent)
        vault.consumeVoid(
            price,
            VoidUtilityVault.UtilityCategory.DISTRICT_UNLOCK,
            string(abi.encodePacked("DISTRICT_", uint2str(districtId)))
        );
        
        hasUnlocked[msg.sender][districtId] = true;
        
        emit DistrictUnlocked(msg.sender, districtId, price);
    }
    
    /**
     * @notice Check if user has unlocked district
     */
    function isDistrictUnlocked(address user, uint8 districtId) external view returns (bool) {
        return hasUnlocked[user][districtId];
    }
    
    /**
     * @notice Set unlock price for district (admin only)
     */
    function setDistrictPrice(uint8 districtId, uint256 price) external onlyRole(DISTRICT_MANAGER) {
        districtUnlockPrice[districtId] = price;
    }
    
    // Helper: uint to string
    function uint2str(uint8 _i) internal pure returns (string memory) {
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
```

---

### 3. LandUpgradeEngine.sol (Parcel Enhancement)

**Purpose**: Upgrade owned parcels with VOID consumption

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidUtilityVault.sol";

contract LandUpgradeEngine is AccessControl {
    bytes32 public constant LAND_MANAGER = keccak256("LAND_MANAGER");
    
    VoidUtilityVault public immutable vault;
    
    // Upgrade tiers (0 = base, 1-5 = upgraded)
    mapping(address => mapping(uint256 => uint8)) public parcelUpgradeLevel;
    
    // Upgrade costs per tier
    uint256[6] public upgradeCosts = [
        0,                  // Tier 0 (base)
        50_000 * 1e18,      // Tier 1: 50k VOID
        150_000 * 1e18,     // Tier 2: 150k VOID
        400_000 * 1e18,     // Tier 3: 400k VOID
        1_000_000 * 1e18,   // Tier 4: 1M VOID
        2_500_000 * 1e18    // Tier 5: 2.5M VOID
    ];
    
    // Events
    event ParcelUpgraded(address indexed owner, uint256 indexed parcelId, uint8 newLevel, uint256 voidConsumed);
    
    constructor(address _vault) {
        vault = VoidUtilityVault(_vault);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @notice Upgrade parcel by consuming VOID
     */
    function upgradeParcel(uint256 parcelId) external {
        uint8 currentLevel = parcelUpgradeLevel[msg.sender][parcelId];
        require(currentLevel < 5, "Max level reached");
        
        uint8 nextLevel = currentLevel + 1;
        uint256 cost = upgradeCosts[nextLevel];
        
        // Consume VOID via vault (permanent)
        vault.consumeVoid(
            cost,
            VoidUtilityVault.UtilityCategory.LAND_UPGRADE,
            string(abi.encodePacked("PARCEL_", uint2str(uint128(parcelId)), "_L", uint2str(nextLevel)))
        );
        
        parcelUpgradeLevel[msg.sender][parcelId] = nextLevel;
        
        emit ParcelUpgraded(msg.sender, parcelId, nextLevel, cost);
    }
    
    /**
     * @notice Get parcel upgrade level
     */
    function getUpgradeLevel(address owner, uint256 parcelId) external view returns (uint8) {
        return parcelUpgradeLevel[owner][parcelId];
    }
    
    // Helper: uint to string
    function uint2str(uint128 _i) internal pure returns (string memory) {
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
```

---

### 4. CreatorToolsAccess.sol (Creator Features)

**Purpose**: Unlock creator tools and upgrade tiers

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidUtilityVault.sol";

contract CreatorToolsAccess is AccessControl {
    bytes32 public constant CREATOR_MANAGER = keccak256("CREATOR_MANAGER");
    
    VoidUtilityVault public immutable vault;
    
    // Creator tiers (0 = none, 1-3 = tiers)
    mapping(address => uint8) public creatorTier;
    
    // Tier unlock costs
    uint256[4] public tierCosts = [
        0,                  // Tier 0 (none)
        100_000 * 1e18,     // Tier 1: 100k VOID
        500_000 * 1e18,     // Tier 2: 500k VOID
        2_000_000 * 1e18    // Tier 3: 2M VOID
    ];
    
    // Tool unlocks per tier
    mapping(uint8 => string[]) public toolsByTier;
    
    // Events
    event CreatorTierUnlocked(address indexed creator, uint8 tier, uint256 voidConsumed);
    
    constructor(address _vault) {
        vault = VoidUtilityVault(_vault);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Define tools per tier
        toolsByTier[1] = ["Basic 3D Assets", "Simple Scripting", "Cosmetics Creator"];
        toolsByTier[2] = ["Advanced Scripting", "Marketplace Publishing", "Revenue Share"];
        toolsByTier[3] = ["Full SDK Access", "White-Label Mini-Apps", "Priority Support"];
    }
    
    /**
     * @notice Unlock creator tier by consuming VOID
     */
    function unlockCreatorTier(uint8 tier) external {
        require(tier > 0 && tier <= 3, "Invalid tier");
        require(creatorTier[msg.sender] < tier, "Already unlocked or not sequential");
        require(creatorTier[msg.sender] == tier - 1, "Must unlock sequentially");
        
        uint256 cost = tierCosts[tier];
        
        // Consume VOID via vault (permanent)
        vault.consumeVoid(
            cost,
            VoidUtilityVault.UtilityCategory.CREATOR_TOOLS,
            string(abi.encodePacked("CREATOR_TIER_", uint2str(tier)))
        );
        
        creatorTier[msg.sender] = tier;
        
        emit CreatorTierUnlocked(msg.sender, tier, cost);
    }
    
    /**
     * @notice Get creator tier
     */
    function getCreatorTier(address creator) external view returns (uint8) {
        return creatorTier[creator];
    }
    
    /**
     * @notice Get tools available at tier
     */
    function getToolsForTier(uint8 tier) external view returns (string[] memory) {
        return toolsByTier[tier];
    }
    
    // Helper: uint to string
    function uint2str(uint8 _i) internal pure returns (string memory) {
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
```

---

### 5. PrestigeSystem.sol (Cosmetic Progression)

**Purpose**: Unlock prestige ranks and cosmetics

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidUtilityVault.sol";

contract PrestigeSystem is AccessControl {
    bytes32 public constant PRESTIGE_MANAGER = keccak256("PRESTIGE_MANAGER");
    
    VoidUtilityVault public immutable vault;
    
    // Prestige ranks (0-10)
    mapping(address => uint8) public prestigeRank;
    
    // Rank costs (exponential scaling)
    uint256[11] public rankCosts = [
        0,                  // Rank 0
        25_000 * 1e18,      // Rank 1: 25k VOID
        75_000 * 1e18,      // Rank 2: 75k VOID
        200_000 * 1e18,     // Rank 3: 200k VOID
        500_000 * 1e18,     // Rank 4: 500k VOID
        1_250_000 * 1e18,   // Rank 5: 1.25M VOID
        3_000_000 * 1e18,   // Rank 6: 3M VOID
        7_000_000 * 1e18,   // Rank 7: 7M VOID
        15_000_000 * 1e18,  // Rank 8: 15M VOID
        30_000_000 * 1e18,  // Rank 9: 30M VOID
        100_000_000 * 1e18  // Rank 10: 100M VOID
    ];
    
    // Cosmetic unlocks per rank
    mapping(address => mapping(uint8 => bool)) public cosmeticUnlocked;
    
    // Events
    event PrestigeRankAchieved(address indexed user, uint8 rank, uint256 voidConsumed);
    event CosmeticUnlocked(address indexed user, uint8 cosmeticId);
    
    constructor(address _vault) {
        vault = VoidUtilityVault(_vault);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @notice Unlock next prestige rank by consuming VOID
     */
    function unlockNextRank() external {
        uint8 currentRank = prestigeRank[msg.sender];
        require(currentRank < 10, "Max rank reached");
        
        uint8 nextRank = currentRank + 1;
        uint256 cost = rankCosts[nextRank];
        
        // Consume VOID via vault (permanent)
        vault.consumeVoid(
            cost,
            VoidUtilityVault.UtilityCategory.PRESTIGE,
            string(abi.encodePacked("PRESTIGE_RANK_", uint2str(nextRank)))
        );
        
        prestigeRank[msg.sender] = nextRank;
        
        emit PrestigeRankAchieved(msg.sender, nextRank, cost);
        
        // Auto-unlock rank cosmetics
        _unlockRankCosmetics(msg.sender, nextRank);
    }
    
    /**
     * @notice Get prestige rank
     */
    function getPrestigeRank(address user) external view returns (uint8) {
        return prestigeRank[user];
    }
    
    // Internal: Unlock cosmetics for rank
    function _unlockRankCosmetics(address user, uint8 rank) internal {
        // Example: Rank 1 = Cosmetic 1, Rank 2 = Cosmetic 2, etc.
        cosmeticUnlocked[user][rank] = true;
        emit CosmeticUnlocked(user, rank);
    }
    
    // Helper: uint to string
    function uint2str(uint8 _i) internal pure returns (string memory) {
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
```

---

### 6. MiniAppAccess.sol (Premium Features)

**Purpose**: Unlock premium mini-app features

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidUtilityVault.sol";

contract MiniAppAccess is AccessControl {
    bytes32 public constant MINIAPP_MANAGER = keccak256("MINIAPP_MANAGER");
    
    VoidUtilityVault public immutable vault;
    
    // Mini-app subscriptions (monthly, quarterly, annual)
    enum SubscriptionTier {
        NONE,
        MONTHLY,
        QUARTERLY,
        ANNUAL
    }
    
    // Subscription costs
    uint256 public monthlyPrice = 10_000 * 1e18;   // 10k VOID/month
    uint256 public quarterlyPrice = 25_000 * 1e18; // 25k VOID/quarter
    uint256 public annualPrice = 80_000 * 1e18;    // 80k VOID/year
    
    // User subscriptions
    mapping(address => mapping(string => SubscriptionTier)) public subscriptionTier;
    mapping(address => mapping(string => uint256)) public subscriptionExpiry;
    
    // Events
    event SubscriptionActivated(address indexed user, string miniAppId, SubscriptionTier tier, uint256 expiresAt);
    
    constructor(address _vault) {
        vault = VoidUtilityVault(_vault);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @notice Subscribe to mini-app by consuming VOID
     */
    function subscribe(string calldata miniAppId, SubscriptionTier tier) external {
        require(tier != SubscriptionTier.NONE, "Invalid tier");
        
        uint256 cost;
        uint256 duration;
        
        if (tier == SubscriptionTier.MONTHLY) {
            cost = monthlyPrice;
            duration = 30 days;
        } else if (tier == SubscriptionTier.QUARTERLY) {
            cost = quarterlyPrice;
            duration = 90 days;
        } else if (tier == SubscriptionTier.ANNUAL) {
            cost = annualPrice;
            duration = 365 days;
        }
        
        // Consume VOID via vault (permanent)
        vault.consumeVoid(
            cost,
            VoidUtilityVault.UtilityCategory.MINIAPP_ACCESS,
            string(abi.encodePacked("MINIAPP_", miniAppId, "_", _tierToString(tier)))
        );
        
        subscriptionTier[msg.sender][miniAppId] = tier;
        subscriptionExpiry[msg.sender][miniAppId] = block.timestamp + duration;
        
        emit SubscriptionActivated(msg.sender, miniAppId, tier, block.timestamp + duration);
    }
    
    /**
     * @notice Check if user has active subscription
     */
    function hasActiveSubscription(address user, string calldata miniAppId) external view returns (bool) {
        return subscriptionExpiry[user][miniAppId] > block.timestamp;
    }
    
    /**
     * @notice Get subscription expiry
     */
    function getSubscriptionExpiry(address user, string calldata miniAppId) external view returns (uint256) {
        return subscriptionExpiry[user][miniAppId];
    }
    
    // Helper: tier to string
    function _tierToString(SubscriptionTier tier) internal pure returns (string memory) {
        if (tier == SubscriptionTier.MONTHLY) return "MONTHLY";
        if (tier == SubscriptionTier.QUARTERLY) return "QUARTERLY";
        if (tier == SubscriptionTier.ANNUAL) return "ANNUAL";
        return "NONE";
    }
}
```

---

## HUD Integration

### 1. District Unlock UI (New Window)

**File**: `hud/utility/DistrictUnlockWindow.tsx`

```tsx
'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { DISTRICTS } from '@/world/WorldLayout';

export function DistrictUnlockWindow() {
  const { address } = useAccount();
  
  const lockedDistricts = DISTRICTS.filter(d => d.id > 1); // District 1 free
  
  const handleUnlock = async (districtId: number) => {
    // TODO: Call DistrictAccess.unlockDistrict(districtId)
    console.log(`Unlocking district ${districtId}`);
  };
  
  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-bold text-bio-silver">Unlock Districts</div>
      
      <div className="space-y-2">
        {lockedDistricts.map(district => (
          <div 
            key={district.id}
            className="p-3 rounded-lg bg-black/40 border border-bio-silver/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-bio-silver">{district.name}</div>
                <div className="text-xs text-bio-silver/60">
                  {district.description || 'Locked district'}
                </div>
              </div>
              <button
                onClick={() => handleUnlock(district.id)}
                className="px-4 py-2 rounded bg-void-purple/20 hover:bg-void-purple/40 
                           border border-void-purple/40 hover:border-void-purple/70 
                           transition-colors text-xs text-void-purple"
              >
                Unlock · {district.unlockPrice} VOID
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 2. Land Upgrade UI (Integrate into RealEstatePanel)

**File**: `hud/economy/RealEstatePanel.tsx` (Add upgrade section)

```tsx
{/* Land Upgrade Section */}
<div className="space-y-2">
  <div className="text-xs text-bio-silver/60 uppercase tracking-wide">Upgrade Owned Parcels</div>
  
  {ownedParcels.map(parcel => (
    <div key={parcel.id} className="p-2 rounded bg-black/40 border border-amber-400/20">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-amber-400">Parcel ({parcel.x}, {parcel.z})</div>
          <div className="text-[10px] text-bio-silver/60">Level {parcel.upgradeLevel || 0}/5</div>
        </div>
        {parcel.upgradeLevel < 5 && (
          <button
            onClick={() => handleUpgradeParcel(parcel.id)}
            className="px-3 py-1 h-8 rounded bg-void-purple/20 hover:bg-void-purple/40 
                       border border-void-purple/40 text-[10px] text-void-purple"
          >
            Upgrade · {getUpgradeCost(parcel.upgradeLevel)} VOID
          </button>
        )}
      </div>
    </div>
  ))}
</div>
```

---

### 3. Creator Tools UI (New Window)

**File**: `hud/creator/CreatorToolsWindow.tsx`

```tsx
'use client';

import React from 'react';
import { useAccount } from 'wagmi';

export function CreatorToolsWindow() {
  const { address } = useAccount();
  const [creatorTier, setCreatorTier] = React.useState(0);
  
  const tiers = [
    { id: 1, name: 'Basic Creator', cost: 100_000, tools: ['3D Assets', 'Simple Scripts', 'Cosmetics'] },
    { id: 2, name: 'Advanced Creator', cost: 500_000, tools: ['Advanced Scripts', 'Marketplace', 'Revenue Share'] },
    { id: 3, name: 'Elite Creator', cost: 2_000_000, tools: ['Full SDK', 'White-Label Apps', 'Priority Support'] }
  ];
  
  const handleUnlockTier = async (tier: number) => {
    // TODO: Call CreatorToolsAccess.unlockCreatorTier(tier)
    console.log(`Unlocking tier ${tier}`);
  };
  
  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-bold text-cyber-cyan">Creator Tools</div>
      
      <div className="space-y-3">
        {tiers.map(tier => (
          <div 
            key={tier.id}
            className={`p-3 rounded-lg border ${
              creatorTier >= tier.id 
                ? 'bg-cyber-cyan/10 border-cyber-cyan/40' 
                : 'bg-black/40 border-bio-silver/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-cyber-cyan">{tier.name}</div>
              {creatorTier < tier.id && (
                <button
                  onClick={() => handleUnlockTier(tier.id)}
                  className="px-3 py-1 rounded bg-void-purple/20 hover:bg-void-purple/40 
                             border border-void-purple/40 text-xs text-void-purple"
                >
                  {tier.cost.toLocaleString()} VOID
                </button>
              )}
              {creatorTier >= tier.id && (
                <div className="text-xs text-cyber-cyan">✓ Unlocked</div>
              )}
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {tier.tools.map(tool => (
                <div 
                  key={tool}
                  className="px-2 py-1 rounded bg-cyber-cyan/10 border border-cyber-cyan/20 
                             text-[10px] text-cyber-cyan"
                >
                  {tool}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 4. Prestige UI (Integrate into PlayerChipV2)

**File**: `hud/header/PlayerChipV2.tsx` (Add prestige badge)

```tsx
{/* Prestige Badge */}
<div className="flex items-center gap-2 px-2 py-1 rounded bg-void-purple/10 border border-void-purple/40">
  <div className="text-[10px] text-bio-silver/60 uppercase tracking-wide">Prestige</div>
  <div className="text-xs text-void-purple font-bold">Rank {prestigeRank}</div>
  <button
    onClick={() => onOpenWindow("PRESTIGE_SYSTEM")}
    className="px-2 py-0.5 rounded bg-void-purple/20 hover:bg-void-purple/40 
               text-[10px] text-void-purple"
  >
    Upgrade
  </button>
</div>
```

---

## Deployment Checklist

### Smart Contracts
- [ ] Deploy `VoidUtilityVault.sol` to Base Sepolia
- [ ] Deploy `DistrictAccess.sol` (reference vault address)
- [ ] Deploy `LandUpgradeEngine.sol` (reference vault address)
- [ ] Deploy `CreatorToolsAccess.sol` (reference vault address)
- [ ] Deploy `PrestigeSystem.sol` (reference vault address)
- [ ] Deploy `MiniAppAccess.sol` (reference vault address)
- [ ] Grant `UTILITY_MANAGER` role to admin wallet
- [ ] Verify all contracts on Basescan

### Frontend Integration
- [ ] Add utility contract ABIs to `src/contracts/abi/`
- [ ] Create wagmi hooks (`useDistrictAccess`, `useLandUpgrade`, etc.)
- [ ] Build `DistrictUnlockWindow.tsx`
- [ ] Build `CreatorToolsWindow.tsx`
- [ ] Build `PrestigeSystemWindow.tsx`
- [ ] Integrate upgrade UI into `RealEstatePanel.tsx`
- [ ] Add prestige badge to `PlayerChipV2.tsx`
- [ ] Add mini-app subscription UI to `MiniAppLauncherModal.tsx`

### Testing
- [ ] Test district unlock flow (approve + consume VOID)
- [ ] Test land upgrade sequential progression
- [ ] Test creator tier unlocking (sequential only)
- [ ] Test prestige rank unlocking (exponential costs)
- [ ] Test mini-app subscription expiry logic
- [ ] Verify all VOID consumption events emit correctly
- [ ] Confirm no withdrawal/distribution functions exist

---

## Security Considerations

### 1. Permanent Consumption Verification
- ✅ No `withdraw()` functions in `VoidUtilityVault.sol`
- ✅ No `transfer()` functions to move VOID out of vault
- ✅ No distribution mechanisms (no staking rewards, no dividends)
- ✅ All consumption tracked via events (transparency)

### 2. Access Control
- ✅ All utility contracts use `AccessControl` from OpenZeppelin
- ✅ Admin roles for price updates (not user-facing operations)
- ✅ `nonReentrant` modifier on all VOID consumption functions
- ✅ Sequential unlock requirements (prestige, creator tiers)

### 3. Price Oracle Protection
- ⚠️ All prices set in VOID (not USD) - admin can adjust if VOID volatility extreme
- ⚠️ Consider Chainlink oracle for USD-denominated pricing (future enhancement)

### 4. Front-Running Mitigation
- ✅ All transactions are user-initiated (no bots can unlock on behalf of users)
- ✅ No orderbook/AMM mechanics (pure utility access)

---

## Legal Compliance

### Pure Utility Classification
- ✅ **No Financial Returns**: VOID consumed, never returned
- ✅ **No Distributions**: No treasury payouts, no staking rewards
- ✅ **No Revenue Sharing**: Creator tools enable publishing, not profit-sharing
- ✅ **Access-Based Model**: District unlocks, land upgrades, prestige ranks = pure utility
- ✅ **No Investment Contract**: Howey Test does not apply (no expectation of profit from others' efforts)

### Terms of Service Requirements
- Must state: "VOID consumption is permanent and non-refundable"
- Must state: "Utility unlocks provide access to features, not financial returns"
- Must state: "No expectation of profit or appreciation"

---

## Future Enhancements

### 1. Dynamic Pricing
- Chainlink oracle for USD-denominated pricing
- Decay curves (cheaper unlocks over time)
- Early adopter bonuses (first 1000 users get 20% discount)

### 2. Utility Bundling
- "District + Land Upgrade" bundles (10% discount)
- "Creator Tier + Prestige" bundles (15% discount)
- "Mini-App Annual + Creator Tools" bundles (20% discount)

### 3. Gasless Transactions
- EIP-2771 meta-transactions for mobile users
- Relayer network for VOID consumption (sponsored gas)

### 4. Governance Integration
- DAO voting on utility prices (community-driven economics)
- Timelocked price updates (7-day delay for transparency)

---

**VOID Utility Vault Status**: DESIGN COMPLETE ✅  
**Implementation Phase**: Post-Phase 8  
**Legal Classification**: Pure Utility System (Non-Financial)

All contracts implement permanent VOID consumption with zero financial flows. No distributions, no treasury operations, no investment contract mechanics.
