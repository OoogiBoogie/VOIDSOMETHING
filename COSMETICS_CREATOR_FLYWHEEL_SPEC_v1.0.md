# COSMETICS & CREATOR FLYWHEEL SPECIFICATION v1.0

**Status:** ✅ Ready for Implementation  
**Last Updated:** November 10, 2025  
**Scope:** Complete cosmetics system integrated with creator economy & existing HUD  

---

## Executive Summary

Cosmetics in VOID are **not decorative flair** – they are:
- **SKU-backed assets** (ERC-1155) created by the community
- **Creator revenue streams** (40% royalty share)
- **Economic fuel** (fees → VOID/PSX treasury → emissions)
- **Engagement drivers** (missions, ranks, vXP progression)

This spec integrates cosmetics into the **existing WORLD HUD layout** without clutter, reinforcing the creator flywheel at every touchpoint.

---

## 1. COSMETIC CATEGORIES (STRUCTURE)

### 1.1 Full Taxonomy

#### **AVATAR COSMETICS** (High Priority - Tier 1)
| Category | Description | SKU Type | Ownership Check | Creator Access |
|----------|-------------|----------|-----------------|----------------|
| **Avatar Frame** | Profile border/ring in top-left | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Level Ring Style** | Animated XP progress ring | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Nameplate** | Custom name styling/effects | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Title Badge** | "DeFi Whale", "World Explorer" | ERC-1155 SKU or Achievement | `SKUFactory` or `AchievementRegistry` | ⚠️ Some protocol-only |
| **Profile Background** | Card background theme | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |

**Implementation:**
```solidity
// Already exists in SKUFactory
// metadata.category = "avatar_cosmetic"
// metadata.subcategory = "frame" | "ring" | "nameplate" | "title" | "background"
```

---

#### **HUD COSMETICS** (High Priority - Tier 1)
| Category | Description | SKU Type | Ownership Check | Creator Access |
|----------|-------------|----------|-----------------|----------------|
| **HUD Theme** | Global colorway (neon, cyber, holo) | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Mission Card Skin** | WORLD MISSIONS panel card style | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Window Frame** | Panel border/decoration | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Button/Icon Pack** | Bottom dock + UI icons | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Chat Bubble Style** | GLOBAL CHAT message appearance | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |

**Implementation:**
```typescript
// metadata.category = "hud_cosmetic"
// metadata.subcategory = "theme" | "mission_card" | "window_frame" | "icon_pack" | "chat_bubble"
// metadata.cssVariables = { primaryColor: "#00ffff", accentColor: "#ff00ff", ... }
```

---

#### **WORLD COSMETICS** (Medium Priority - Tier 2)
| Category | Description | SKU Type | Ownership Check | Creator Access |
|----------|-------------|----------|-----------------|----------------|
| **Zone Map Skin** | Top-right zone map appearance | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Minimap Overlay** | 3D minimap grid/icons | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Trail Effect** | Player movement trail | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Spawn Animation** | Hub entry effect | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |

**Implementation:**
```typescript
// metadata.category = "world_cosmetic"
// metadata.subcategory = "map_skin" | "minimap_overlay" | "trail" | "spawn_anim"
```

---

#### **SOCIAL COSMETICS** (Medium Priority - Tier 2)
| Category | Description | SKU Type | Ownership Check | Creator Access |
|----------|-------------|----------|-----------------|----------------|
| **Profile Banner** | Profile page header | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Squad Banner** | Squad identification | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Emote Pack** | Social expressions | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |

---

#### **AUDIO COSMETICS** (Low Priority - Tier 3)
| Category | Description | SKU Type | Ownership Check | Creator Access |
|----------|-------------|----------|-----------------|----------------|
| **Sound Pack** | UI interaction sounds | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |
| **Music Theme** | Background ambient music | ERC-1155 SKU | `SKUFactory.balanceOf(user, skuId)` | ✅ Any creator |

---

### 1.2 SKU Metadata Standards

**Cosmetic SKU Metadata Structure:**
```typescript
interface CosmeticSKUMetadata {
  // Standard SKU fields
  name: string;
  description: string;
  creator: address;
  
  // Cosmetic-specific
  category: "avatar_cosmetic" | "hud_cosmetic" | "world_cosmetic" | "social_cosmetic" | "audio_cosmetic";
  subcategory: string; // "frame", "theme", "map_skin", etc.
  
  // Visual/Audio Assets
  assets: {
    thumbnail: string;      // IPFS hash for preview
    preview: string;        // IPFS hash for full preview
    styles?: CSSVariables;  // For HUD themes
    iconPack?: IconPackAssets; // For icon packs
    audioFiles?: AudioAssets;  // For sound packs
  };
  
  // Constraints
  minRank?: number;         // vXP rank requirement (Bronze=0, Silver=1, Gold=2, etc.)
  exclusive?: boolean;      // Limited edition
  seasonalStart?: number;   // Unix timestamp
  seasonalEnd?: number;     // Unix timestamp
  
  // Creator Marketing
  tags: string[];           // ["neon", "cyberpunk", "animated"]
  featured?: boolean;       // MissionAI/GovernanceAI can feature
}
```

---

## 2. CREATOR FLYWHEEL INTEGRATION

### 2.1 Creator → Cosmetic SKU Flow

**Step 1: Creator Designs Cosmetic**
```typescript
// Creator uses CREATOR HUD to upload cosmetic assets
// Components: <CosmeticCreationWizard />

const cosmeticDesign = {
  name: "Neon Grid HUD Theme",
  category: "hud_cosmetic",
  subcategory: "theme",
  assets: {
    thumbnail: "ipfs://Qm...",
    preview: "ipfs://Qm...",
    styles: {
      primaryColor: "#00ffff",
      accentColor: "#ff00ff",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      glowIntensity: 1.5
    }
  },
  price: ethers.parseUnits("10", 6) // 10 USDC
}
```

**Step 2: Register as SKU**
```solidity
// Creator calls SKUFactory.createSKU()
function createCosmeticSKU(
  string memory metadataURI,
  uint256 initialSupply,
  uint256 price,
  address paymentToken
) external returns (uint256 skuId) {
  // SKUFactory mints ERC-1155
  // Sets creator as primary beneficiary (40% royalties)
  // Registers with VoidHookRouterV4 for fee routing
}
```

**Step 3: Fee Profile Setup**
```solidity
// VoidHookRouterV4 automatically applies (Week 2 Economic Model v5.2):
// - 40% to creator (royalties)
// - 20% to xVOID stakers (APR yield)
// - 10% to PSX Treasury (buybacks/liquidity)
// - 10% to CREATE Treasury (creator ecosystem)
// - 10% to Agency / Network Operations
// - 5%  to Creator Grants Vault (onboarding)
// - 5%  to Security / Infrastructure Reserve
```

---

### 2.2 User → Purchase Cosmetic Flow

**Step 1: User Discovers Cosmetic**
```typescript
// In CREATOR HUD's <FeaturedSKUsWindow />
// Or via MissionAI highlighting in AI Feed
<CosmeticCard sku={cosmeticSKU}>
  <PreviewButton onClick={() => tryOnCosmetic()} />
  <PurchaseButton onClick={() => buyCosmetic()} />
</CosmeticCard>
```

**Step 2: Purchase Transaction**
```typescript
// User clicks "Buy with USDC"
const tx = await skuFactory.purchaseSKU(skuId, quantity, paymentToken);

// Flow:
// 1. USDC sent to VoidHookRouterV4
// 2. Router swaps portion to VOID via pool
// 3. Fees distributed per profile
// 4. SKU transferred to user (ERC-1155)
// 5. VoidEmitter.logAction("cosmetic_purchased")
```

**Step 3: vXP & SIGNAL Rewards**
```solidity
// VoidEmitter receives event
event CosmeticPurchased(address buyer, address creator, uint256 skuId, uint256 amount);

// Indexer calculates:
// - Buyer: +50 vXP (for engagement)
// - Creator: +10 vXP per sale
// - Both: SIGNAL based on purchase volume

// XPOracle.setXPBatch() updates on-chain
```

---

### 2.3 Economic Flywheel Diagram

```
Creator Designs Cosmetic
    ↓
SKUFactory.createSKU() → ERC-1155 minted
    ↓
User Discovers (CREATOR HUD / AI Feed / Mission Reward)
    ↓
User Purchases (USDC/VOID/PSX)
    ↓
VoidHookRouterV4 Routes Fees:
    - 40% → Creator wallet ✅
    - 20% → xVOID stakers (APR boost) ✅
    - 10% → PSX Treasury (buybacks) ✅
    - 10% → CREATE Treasury (creator ecosystem) ✅
    - 10% → Agency / Network Operations ✅
    - 5%  → Creator Grants Vault (onboarding) ✅
    - 5%  → Security / Infrastructure Reserve ✅
    ↓
VoidEmitter logs action
    ↓
Indexer calculates vXP/SIGNAL
    ↓
XPOracle updates on-chain
    ↓
Buyer + Creator rank up → unlock more cosmetics
    ↓
Treasury uses inflow for VOID/PSX buybacks
    ↓
Emissions adjust based on reserves (EmissionAI)
    ↓
Higher APR → more vault staking → more demand for cosmetics
    ↓
LOOP ♻️
```

---

### 2.4 Mission Integration (Cosmetic Flywheel Boost)

**MissionAI Creates Cosmetic-Linked Missions:**
```typescript
// MissionAI generates missions that require cosmetic usage
const mission = {
  id: 1234,
  hub: HubType.WORLD,
  title: "Neon Explorer",
  description: "Complete 3 WORLD missions while equipped with a Neon HUD theme",
  requirements: {
    missionCount: 3,
    cosmeticCategory: "hud_cosmetic",
    cosmeticTag: "neon"
  },
  rewards: {
    vxp: 100,
    signal: 50,
    void: ethers.parseEther("10"),
    cosmeticDrop: skuId_NeonFrameRare // Chance to win rare cosmetic
  }
}
```

**Flow:**
1. User equips Neon HUD theme (creator SKU)
2. Completes 3 WORLD missions
3. MissionRegistry.completeMission() verifies cosmetic was equipped
4. Rewards: vXP, SIGNAL, VOID, + chance to win rare Neon Frame
5. Creator of Neon HUD theme gets bonus vXP for driving engagement

---

## 3. HUD SURFACING OF COSMETICS

### 3.1 Current HUD Layout Integration

**Your Existing Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Profile] [Tokens] [Hub Tabs]              [Zone Map] [Time]│ ← TOP BAR
├───────────────┬─────────────────────┬───────────────────────┤
│ WORLD MISSIONS│                     │ EMISSION STATUS       │
│ ┌───────────┐ │                     │ AI FEED               │
│ │ Mission 1 │ │   CENTER VIEWPORT   │ GLOBAL CHAT           │
│ │ Mission 2 │ │   (3D World /       │                       │
│ └───────────┘ │    Main Content)    │                       │
│ FRIENDS/NEARBY│                     │                       │
├───────────────┴─────────────────────┴───────────────────────┤
│         [Map] [Chat] [Social] [Inventory] [More]            │ ← BOTTOM DOCK
└─────────────────────────────────────────────────────────────┘
```

---

### 3.2 Cosmetic Integration Points

#### **A. TOP BAR → Profile Block**

**Current:**
```tsx
<div className="profile-block">
  <Avatar src="/guest-avatar.png" />
  <div>
    <span>Guest</span>
    <span>Lvl 7 • 96% XP</span>
  </div>
</div>
```

**Cosmetic-Aware:**
```tsx
<div className="profile-block" style={hudTheme.profileStyles}>
  <CosmeticAvatar 
    userId={user.address}
    cosmetics={{
      frame: equippedCosmetics.avatar_frame,
      ring: equippedCosmetics.level_ring,
      background: equippedCosmetics.profile_background
    }}
  >
    <Avatar src={user.avatar || "/guest-avatar.png"} />
    {equippedCosmetics.level_ring && (
      <AnimatedLevelRing 
        progress={0.96} 
        style={equippedCosmetics.level_ring.styles}
      />
    )}
  </CosmeticAvatar>
  
  <div>
    <span style={equippedCosmetics.nameplate?.textStyle}>
      {user.name || "Guest"}
      {equippedCosmetics.title_badge && (
        <TitleBadge badge={equippedCosmetics.title_badge} />
      )}
    </span>
    <span>Lvl {user.level} • {user.xpProgress}% XP</span>
  </div>
</div>
```

**Component Changes:**
- `components/hud/header/PlayerChipV2.tsx` → becomes `<CosmeticPlayerChip />`
- New: `components/cosmetics/CosmeticAvatar.tsx`
- New: `components/cosmetics/AnimatedLevelRing.tsx`
- New: `components/cosmetics/TitleBadge.tsx`

---

#### **B. TOP BAR → Token Strip + Hub Tabs**

**Cosmetic-Aware:**
```tsx
<div className="top-bar" style={hudTheme.globalStyles}>
  <TokenStrip tokens={tokens} theme={equippedCosmetics.hud_theme} />
  <HubTabs activeHub={activeHub} theme={equippedCosmetics.hud_theme} />
</div>
```

**HUD Theme CSS Variables:**
```css
/* Injected dynamically from equippedCosmetics.hud_theme.styles */
:root {
  --primary-color: #00ffff;
  --accent-color: #ff00ff;
  --bg-color: rgba(0, 0, 0, 0.8);
  --glow-intensity: 1.5;
  --border-radius: 8px;
}
```

---

#### **C. LEFT COLUMN → WORLD MISSIONS Panel**

**Current:**
```tsx
<WorldMissionsPanel>
  {missions.map(mission => (
    <MissionCard key={mission.id} mission={mission} />
  ))}
</WorldMissionsPanel>
```

**Cosmetic-Aware:**
```tsx
<WorldMissionsPanel theme={equippedCosmetics.hud_theme}>
  {missions.map(mission => (
    <CosmeticMissionCard 
      key={mission.id} 
      mission={mission}
      cardSkin={equippedCosmetics.mission_card_skin}
      glowEffect={mission.isHot && equippedCosmetics.mission_card_skin?.glowEffect}
    />
  ))}
</WorldMissionsPanel>
```

**Mission Card Skin Example:**
```typescript
// Creator-designed mission card skin
const neonMissionCardSkin = {
  skuId: 5678,
  name: "Neon Grid Mission Cards",
  styles: {
    borderColor: "#00ffff",
    borderWidth: "2px",
    borderStyle: "solid",
    backgroundImage: "linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,0,255,0.1))",
    boxShadow: "0 0 20px rgba(0,255,255,0.5)",
    glowEffect: true,
    animatedBorder: true
  },
  creator: "0x...",
  price: ethers.parseUnits("5", 6) // 5 USDC
}
```

**Component Changes:**
- `hud/rails/left/WorldMissionsPanel.tsx` → reads `useCosmetics()`
- New: `components/cosmetics/CosmeticMissionCard.tsx`

---

#### **D. RIGHT COLUMN → AI Feed, Global Chat**

**Chat Bubble Cosmetics:**
```tsx
<GlobalChatPanel theme={equippedCosmetics.hud_theme}>
  {messages.map(msg => (
    <CosmeticChatBubble
      key={msg.id}
      message={msg}
      bubbleSkin={users[msg.sender]?.equippedCosmetics?.chat_bubble}
    />
  ))}
</GlobalChatPanel>
```

**AI Feed Cosmetics:**
```tsx
<AIFeedPanel theme={equippedCosmetics.hud_theme}>
  {feedItems.map(item => (
    <AIFeedItem 
      key={item.id}
      item={item}
      iconPack={equippedCosmetics.icon_pack}
    />
  ))}
</AIFeedPanel>
```

---

#### **E. BOTTOM DOCK → Icon Packs**

**Current:**
```tsx
<BottomDock>
  <DockIcon icon="map" onClick={() => openMap()} />
  <DockIcon icon="chat" onClick={() => openChat()} />
  <DockIcon icon="social" onClick={() => openSocial()} />
  <DockIcon icon="inventory" onClick={() => openInventory()} />
</BottomDock>
```

**Cosmetic-Aware:**
```tsx
<BottomDock theme={equippedCosmetics.hud_theme}>
  {dockItems.map(item => (
    <CosmeticDockIcon
      key={item.id}
      icon={item.icon}
      iconPack={equippedCosmetics.icon_pack}
      soundPack={equippedCosmetics.sound_pack}
      onClick={item.onClick}
    />
  ))}
</BottomDock>
```

**Icon Pack Structure:**
```typescript
interface IconPackAssets {
  map: string;      // IPFS hash or SVG
  chat: string;
  social: string;
  inventory: string;
  // ... all dock icons
}
```

---

#### **F. ZONE MAP (Top-Right)**

**Cosmetic-Aware:**
```tsx
<ZoneMap 
  mapSkin={equippedCosmetics.zone_map_skin}
  overlays={equippedCosmetics.minimap_overlay}
/>
```

---

### 3.3 Component Cosmetic Query Pattern

**Every cosmetic-aware component:**
```typescript
// hooks/useCosmetics.ts
const { equippedCosmetics, equipCosmetic, unequipCosmetic } = useCosmetics();

// Components read from shared context
<CosmeticMissionCard 
  mission={mission}
  cardSkin={equippedCosmetics.mission_card_skin}
/>
```

**No per-component ad-hoc cosmetic flags** ✅

---

## 4. COSMETIC LOADOUT SYSTEM

### 4.1 Data Model

**Cosmetic Slots:**
```typescript
enum CosmeticSlot {
  // Avatar
  AVATAR_FRAME = "avatar_frame",
  LEVEL_RING = "level_ring",
  NAMEPLATE = "nameplate",
  TITLE_BADGE = "title_badge",
  PROFILE_BACKGROUND = "profile_background",
  
  // HUD
  HUD_THEME = "hud_theme",
  MISSION_CARD_SKIN = "mission_card_skin",
  WINDOW_FRAME = "window_frame",
  ICON_PACK = "icon_pack",
  CHAT_BUBBLE = "chat_bubble",
  
  // World (Tier 2)
  ZONE_MAP_SKIN = "zone_map_skin",
  MINIMAP_OVERLAY = "minimap_overlay",
  TRAIL_EFFECT = "trail_effect",
  SPAWN_ANIMATION = "spawn_animation",
  
  // Social (Tier 2)
  PROFILE_BANNER = "profile_banner",
  SQUAD_BANNER = "squad_banner",
  
  // Audio (Tier 3)
  SOUND_PACK = "sound_pack",
  MUSIC_THEME = "music_theme"
}

interface CosmeticLoadout {
  userId: address;
  slots: Record<CosmeticSlot, CosmeticItem | null>;
  lastUpdated: number;
}

interface CosmeticItem {
  skuId: number;
  name: string;
  category: string;
  subcategory: string;
  metadata: CosmeticSKUMetadata;
  ownedQuantity: number; // From SKUFactory.balanceOf()
}
```

---

### 4.2 Storage Options

**Option A: Local State Only (MVP - Recommended)**
```typescript
// lib/cosmetics/storage.ts
export class CosmeticLoadoutStorage {
  private static KEY = 'void_cosmetic_loadout';
  
  static save(loadout: CosmeticLoadout) {
    localStorage.setItem(this.KEY, JSON.stringify(loadout));
  }
  
  static load(userId: address): CosmeticLoadout | null {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : null;
  }
}
```

**Pros:**
- ✅ Zero gas cost
- ✅ Instant updates
- ✅ Works immediately

**Cons:**
- ❌ No cross-device sync
- ❌ Lost if user clears cache

---

**Option B: On-Chain CosmeticLoadout Contract (Phase 2)**
```solidity
// contracts/CosmeticLoadout.sol
contract CosmeticLoadout {
  struct Loadout {
    mapping(uint8 => uint256) slots; // CosmeticSlot enum → SKU ID
    uint256 lastUpdated;
  }
  
  mapping(address => Loadout) public userLoadouts;
  
  function equipCosmetic(uint8 slot, uint256 skuId) external {
    require(SKUFactory.balanceOf(msg.sender, skuId) > 0, "Not owned");
    userLoadouts[msg.sender].slots[slot] = skuId;
    userLoadouts[msg.sender].lastUpdated = block.timestamp;
  }
  
  function getLoadout(address user) external view returns (uint256[] memory) {
    // Returns SKU IDs for all slots
  }
}
```

**Pros:**
- ✅ Cross-device sync
- ✅ Provably on-chain
- ✅ Can integrate with DAO/governance

**Cons:**
- ❌ Gas cost for equip/unequip
- ❌ More complex UX

**Recommendation:** Start with **Option A (local)**, migrate to **Option B** in Phase 2.

---

### 4.3 Equipping Logic

**User Flow:**
```typescript
// 1. User opens cosmetic inventory
<CosmeticInventoryWindow>
  {ownedCosmetics.map(cosmetic => (
    <CosmeticCard key={cosmetic.skuId} cosmetic={cosmetic}>
      <EquipButton onClick={() => equipCosmetic(cosmetic.slot, cosmetic.skuId)} />
    </CosmeticCard>
  ))}
</CosmeticInventoryWindow>

// 2. equipCosmetic() validates ownership
async function equipCosmetic(slot: CosmeticSlot, skuId: number) {
  // Check on-chain ownership
  const balance = await skuFactory.balanceOf(user.address, skuId);
  if (balance === 0) {
    throw new Error("You don't own this cosmetic");
  }
  
  // Check rank requirement
  const metadata = await fetchCosmeticMetadata(skuId);
  const userRank = await xpOracle.getRank(user.address);
  if (metadata.minRank && userRank < metadata.minRank) {
    throw new Error(`Requires ${getRankName(metadata.minRank)} rank`);
  }
  
  // Update loadout (local storage for MVP)
  const loadout = CosmeticLoadoutStorage.load(user.address) || { slots: {} };
  loadout.slots[slot] = { skuId, ...metadata };
  CosmeticLoadoutStorage.save(loadout);
  
  // Trigger HUD refresh
  cosmeticContext.refresh();
}

// 3. HUD components auto-update
// All components using useCosmetics() will re-render with new cosmetic
```

---

### 4.4 Creator Restrictions & Protocol Safety

**Reserved Slots (Cannot be Modified by Creators):**
```typescript
const PROTOCOL_RESERVED_SLOTS = [
  // Critical UI elements that must remain legible
  "emission_warning_indicator",
  "security_alert_panel",
  "vault_health_critical"
];
```

**Validation Rules:**
```typescript
// lib/cosmetics/validation.ts
export function validateCosmeticSKU(metadata: CosmeticSKUMetadata): boolean {
  // 1. Must not obscure critical UI
  if (metadata.styles?.opacity < 0.7) {
    throw new Error("Critical UI must be visible (min 70% opacity)");
  }
  
  // 2. Color contrast requirements
  if (!meetsContrastRatio(metadata.styles)) {
    throw new Error("Insufficient color contrast for accessibility");
  }
  
  // 3. File size limits
  if (metadata.assets.fileSize > MAX_COSMETIC_FILE_SIZE) {
    throw new Error("Asset too large");
  }
  
  return true;
}
```

---

## 5. MISSIONS, PROGRESSION & COSMETICS

### 5.1 Mission Rewards

**Mission Types with Cosmetic Rewards:**

**Type A: Direct Cosmetic Drop**
```typescript
const mission = {
  id: 1001,
  hub: HubType.WORLD,
  title: "First Steps",
  description: "Complete your first WORLD mission",
  rewards: {
    vxp: 50,
    signal: 10,
    cosmeticDrop: {
      skuId: 9001,
      name: "Starter Frame",
      dropChance: 1.0 // 100% guaranteed
    }
  }
}
```

**Type B: Choice Reward**
```typescript
const mission = {
  id: 1002,
  hub: HubType.CREATOR,
  title: "Support 3 Creators",
  rewards: {
    vxp: 100,
    signal: 25,
    cosmeticChoice: [
      { skuId: 9010, name: "Creator Badge Bronze" },
      { skuId: 9011, name: "Neon Theme Starter" },
      { skuId: 9012, name: "Chat Bubble Pack Vol 1" }
    ]
  }
}
```

**Type C: Random Rare Drop**
```typescript
const mission = {
  id: 1003,
  hub: HubType.DEFI,
  title: "Vault Master",
  description: "Stake in 3 different vaults for 30 days",
  rewards: {
    vxp: 500,
    signal: 200,
    void: ethers.parseEther("100"),
    rareCosmeticDrop: {
      dropTable: [
        { skuId: 9100, name: "Legendary HUD Theme", dropChance: 0.01 }, // 1%
        { skuId: 9101, name: "Epic Frame", dropChance: 0.05 }, // 5%
        { skuId: 9102, name: "Rare Icon Pack", dropChance: 0.2 } // 20%
      ]
    }
  }
}
```

---

### 5.2 Rank-Gated Cosmetics

**Rank Requirements:**
```typescript
enum Rank {
  BRONZE = 0,   // 0-499 vXP
  SILVER = 1,   // 500-999 vXP
  GOLD = 2,     // 1000-2499 vXP
  PLATINUM = 3, // 2500-4999 vXP
  DIAMOND = 4   // 5000+ vXP
}

// Example cosmetic with rank gate
const platinumFrame = {
  skuId: 9200,
  name: "Platinum Elite Frame",
  category: "avatar_cosmetic",
  subcategory: "frame",
  minRank: Rank.PLATINUM, // Requires 2500+ vXP
  price: ethers.parseUnits("50", 6) // 50 USDC
}
```

**UI Display:**
```tsx
<CosmeticCard cosmetic={platinumFrame}>
  {userRank < platinumFrame.minRank && (
    <RankRequirement>
      🔒 Requires Platinum rank ({platinumFrame.minRank - userVXP} vXP away)
    </RankRequirement>
  )}
</CosmeticCard>
```

---

### 5.3 Creator Missions (Engagement Loop)

**MissionAI Creates Creator-Specific Missions:**
```typescript
// Mission promotes a creator's cosmetic
const creatorMission = {
  id: 2001,
  hub: HubType.WORLD,
  title: "Neon Explorer Challenge",
  description: "Created by @CyberArtist - Complete 5 missions with Neon Grid theme equipped",
  creator: "0x... (CyberArtist address)",
  requirements: {
    missionCount: 5,
    cosmeticRequired: {
      slot: CosmeticSlot.HUD_THEME,
      skuId: 5001 // Neon Grid HUD Theme
    }
  },
  rewards: {
    vxp: 150,
    signal: 50,
    creatorBonus: {
      // Creator gets bonus if their cosmetic drives completions
      vxpPerCompletion: 5,
      signalPerCompletion: 2
    }
  }
}
```

**Flywheel Effect:**
1. Creator uploads Neon Grid HUD theme (SKU #5001)
2. MissionAI generates "Neon Explorer Challenge" mission
3. Users see mission → buy Neon Grid theme to participate
4. Creator earns 40% royalties from sales
5. Users complete mission → creator earns bonus vXP/SIGNAL
6. More engagement → more cosmetic sales → more creator income

---

## 6. AI & COSMETICS INTEGRATION

### 6.1 MissionAI ↔ Cosmetics

**Featured Cosmetics in Missions:**
```typescript
// services/aiAgents/missionAI/cosmeticIntegration.ts
export class MissionAICosmeticEngine {
  // Analyze cosmetic sales/usage data
  async generateCosmeticMissions() {
    const trendingCosmetics = await this.getTrendingCosmetics();
    const underusedCosmetics = await this.getUnderusedCosmetics();
    
    // Create missions for trending cosmetics (reward supply)
    for (const cosmetic of trendingCosmetics) {
      await missionRegistry.createMission({
        title: `${cosmetic.name} Master`,
        requirements: { cosmeticUsage: cosmetic.skuId, duration: 7 * 24 * 3600 },
        rewards: { vxp: 200, signal: 75 }
      });
    }
    
    // Create missions to boost underused cosmetics (reward demand)
    for (const cosmetic of underusedCosmetics) {
      await missionRegistry.createMission({
        title: `Discover ${cosmetic.name}`,
        description: `Try this creator's cosmetic and earn rewards`,
        requirements: { purchaseCosmetic: cosmetic.skuId, useFor: 3 * 24 * 3600 },
        rewards: { vxp: 100, signal: 50, refund: 50% } // 50% USDC refund
      });
    }
  }
}
```

**Hot Mission Highlighting (with Cosmetics):**
```tsx
<MissionCard mission={mission}>
  {missionAI.isHot(mission) && (
    <HotMissionBadge 
      reason="12 users using Neon Grid theme, 3x rewards active"
      cosmeticBonus={mission.cosmeticBonus}
    />
  )}
</MissionCard>
```

---

### 6.2 GovernanceAI ↔ Cosmetics

**Proposal Recommendations on Cosmetic Policies:**
```typescript
// GovernanceAI analyzes cosmetic economy
const proposal = {
  id: 501,
  title: "Adjust Creator Royalty Cap for Cosmetics",
  description: "Increase max creator royalty from 40% to 45% for top-rated cosmetics",
  aiRecommendation: {
    vote: "YES",
    confidence: 0.78,
    reasoning: [
      "Top 10% creators drive 60% of cosmetic sales",
      "Higher royalties incentivize quality",
      "Treasury still receives 15% (sustainable)"
    ]
  }
}
```

---

### 6.3 AI_OPS HUD ↔ Cosmetics

**Cosmetic Analytics Panel:**
```tsx
<AIOpsConsoleWindow>
  <CosmeticAnalyticsPanel>
    <Metric label="Total Cosmetic Sales (7d)" value="$45,230" />
    <Metric label="Top Category" value="HUD Themes (38%)" />
    <Metric label="Avg Creator Revenue" value="$1,250/week" />
    
    <TopSellingCosmetics>
      {topCosmetics.map(cosmetic => (
        <CosmeticRow key={cosmetic.skuId}>
          <span>{cosmetic.name}</span>
          <span>{cosmetic.sales} sold</span>
          <span>${cosmetic.revenue}</span>
        </CosmeticRow>
      ))}
    </TopSellingCosmetics>
    
    <UnderusedCategories>
      <Alert>⚠️ Audio Cosmetics: 2% adoption - MissionAI creating boost missions</Alert>
    </UnderusedCategories>
  </CosmeticAnalyticsPanel>
</AIOpsConsoleWindow>
```

**AI Feed Integration:**
```tsx
<AIFeedPanel>
  <AIFeedItem icon="🎨" type="cosmetic">
    <strong>MissionAI:</strong> Featured "Neon Grid" theme in 3 new missions → +120% sales
  </AIFeedItem>
  <AIFeedItem icon="💎" type="cosmetic">
    <strong>EmissionAI:</strong> Cosmetic fees contributed $12k to treasury (15% of week)
  </AIFeedItem>
</AIFeedPanel>
```

---

## 7. IMPLEMENTATION PLAN (PHASED)

### Phase 1: Cosmetics MVP (Week 6-7)

**Goal:** Basic cosmetic system functional with avatar, HUD theme, mission cards

**Files to Create:**

**A. Type Definitions**
- [ ] `lib/cosmetics/types.ts` → CosmeticSlot, CosmeticLoadout, CosmeticSKUMetadata
- [ ] `lib/cosmetics/constants.ts` → Rank requirements, slot definitions
- [ ] `lib/cosmetics/validation.ts` → SKU validation rules

**B. Storage & State**
- [ ] `lib/cosmetics/storage.ts` → Local storage wrapper
- [ ] `contexts/CosmeticContext.tsx` → Global cosmetic state
- [ ] `hooks/useCosmetics.ts` → Main hook for all components

**C. Core Components**
- [ ] `components/cosmetics/CosmeticAvatar.tsx` → Avatar with frame/ring
- [ ] `components/cosmetics/AnimatedLevelRing.tsx` → XP ring with styles
- [ ] `components/cosmetics/TitleBadge.tsx` → Title badge display
- [ ] `components/cosmetics/CosmeticMissionCard.tsx` → Mission card with skin
- [ ] `components/cosmetics/CosmeticInventoryWindow.tsx` → User's cosmetic collection
- [ ] `components/cosmetics/CosmeticCard.tsx` → Preview/purchase/equip UI

**D. Update Existing Components**
- [ ] `hud/header/PlayerChipV2.tsx` → Use CosmeticAvatar
- [ ] `hud/rails/left/WorldMissionsPanel.tsx` → Use CosmeticMissionCard
- [ ] `hud/layout/VoidHUDLayout.tsx` → Inject HUD theme CSS variables

**E. Contract Integration**
- [ ] `hooks/useSKUFactory.ts` → Add cosmetic-specific queries
- [ ] `lib/cosmetics/ownership.ts` → Check SKU balances
- [ ] `lib/cosmetics/metadata.ts` → Fetch IPFS metadata

**F. Creator Tools**
- [ ] `components/creator/CosmeticCreationWizard.tsx` → Upload wizard
- [ ] `components/creator/CosmeticPreview.tsx` → Live preview before mint

**Acceptance Criteria:**
- ✅ User can equip avatar frame, level ring, title badge
- ✅ User can equip HUD theme (changes global colors)
- ✅ User can equip mission card skin (WORLD MISSIONS panel)
- ✅ Creator can upload cosmetic SKU via CREATOR HUD
- ✅ Cosmetics persist in local storage
- ✅ Ownership verified against SKUFactory contract

---

### Phase 2: Extended Cosmetics (Week 8-9)

**Goal:** Add map skins, icon packs, chat bubbles, sound packs

**Files to Create:**
- [ ] `components/cosmetics/CosmeticZoneMap.tsx` → Zone map with skin
- [ ] `components/cosmetics/CosmeticDockIcon.tsx` → Bottom dock icons
- [ ] `components/cosmetics/CosmeticChatBubble.tsx` → Chat message styling
- [ ] `components/cosmetics/SoundPackManager.tsx` → Audio playback

**Update Existing:**
- [ ] `hud/header/ZoneMap.tsx` → Use CosmeticZoneMap
- [ ] `hud/footer/BottomDock.tsx` → Use CosmeticDockIcon
- [ ] `hud/rails/right/GlobalChatPanel.tsx` → Use CosmeticChatBubble

**Acceptance Criteria:**
- ✅ User can equip map skin, icon pack, chat bubble, sound pack
- ✅ Bottom dock icons change based on equipped icon pack
- ✅ Sound effects play from equipped sound pack

---

### Phase 3: Mission & AI Integration (Week 10)

**Goal:** MissionAI creates cosmetic-linked missions, AI Ops shows analytics

**Files to Create:**
- [ ] `services/aiAgents/missionAI/cosmeticEngine.ts` → Mission generation
- [ ] `components/hud/aiops/CosmeticAnalyticsPanel.tsx` → Analytics
- [ ] `hooks/useCosmeticMissions.ts` → Cosmetic-specific missions

**Update Existing:**
- [ ] `services/aiAgents/missionAI/index.ts` → Add cosmetic logic
- [ ] `components/hud/aiops/AIOpsConsoleWindow.tsx` → Add cosmetic panel

**Acceptance Criteria:**
- ✅ MissionAI generates missions requiring cosmetics
- ✅ AI Ops console shows cosmetic sales/usage stats
- ✅ Creator missions drive cosmetic engagement

---

### Phase 4: On-Chain Loadout (Week 11+)

**Goal:** Deploy CosmeticLoadout contract for cross-device sync

**Files to Create:**
- [ ] `contracts/CosmeticLoadout.sol` → On-chain loadout storage
- [ ] `scripts/deploy/deploy-cosmetic-loadout.ts` → Deployment
- [ ] `lib/cosmetics/onChainStorage.ts` → Contract wrapper

**Migration:**
- [ ] Migrate local storage loadouts to on-chain
- [ ] Update `useCosmetics()` to query contract

**Acceptance Criteria:**
- ✅ User loadout syncs across devices
- ✅ Cosmetic equip/unequip writes to contract
- ✅ Gas-efficient batch operations

---

## 8. Summary: Key Files to Create/Update

### New Hooks (8 total)
1. `hooks/useCosmetics.ts` → Main cosmetic hook
2. `hooks/useCosmeticInventory.ts` → User's owned cosmetics
3. `hooks/useCosmeticMetadata.ts` → Fetch SKU metadata
4. `hooks/useCosmeticMissions.ts` → Cosmetic-linked missions
5. `hooks/useCosmeticAnalytics.ts` → AI Ops data
6. `hooks/useCosmeticOwnership.ts` → Verify SKUFactory balance
7. `hooks/useCosmeticLoadout.ts` → Load/save loadout
8. `hooks/useHUDTheme.ts` → Global HUD theme injection

### New Components (20+ total)
**Cosmetics Core:**
1. `components/cosmetics/CosmeticAvatar.tsx`
2. `components/cosmetics/AnimatedLevelRing.tsx`
3. `components/cosmetics/TitleBadge.tsx`
4. `components/cosmetics/CosmeticMissionCard.tsx`
5. `components/cosmetics/CosmeticZoneMap.tsx`
6. `components/cosmetics/CosmeticDockIcon.tsx`
7. `components/cosmetics/CosmeticChatBubble.tsx`
8. `components/cosmetics/SoundPackManager.tsx`

**UI Windows:**
9. `components/cosmetics/CosmeticInventoryWindow.tsx`
10. `components/cosmetics/CosmeticCard.tsx`
11. `components/cosmetics/CosmeticPreview.tsx`
12. `components/cosmetics/RankRequirementBadge.tsx`

**Creator Tools:**
13. `components/creator/CosmeticCreationWizard.tsx`
14. `components/creator/CosmeticAssetUploader.tsx`
15. `components/creator/CosmeticStyleEditor.tsx`

**AI Integration:**
16. `components/hud/aiops/CosmeticAnalyticsPanel.tsx`
17. `components/hud/missions/CosmeticMissionBadge.tsx`

### Updated Components (10+ total)
1. `hud/header/PlayerChipV2.tsx` → Use CosmeticAvatar
2. `hud/header/ZoneMap.tsx` → Use CosmeticZoneMap
3. `hud/rails/left/WorldMissionsPanel.tsx` → Use CosmeticMissionCard
4. `hud/rails/right/GlobalChatPanel.tsx` → Use CosmeticChatBubble
5. `hud/footer/BottomDock.tsx` → Use CosmeticDockIcon
6. `hud/layout/VoidHUDLayout.tsx` → Inject HUD theme
7. `components/hud/aiops/AIOpsConsoleWindow.tsx` → Add cosmetic panel
8. `components/hud/creator/CreatorDashboardWindow.tsx` → Add cosmetic wizard

### New Contracts (1 for Phase 4)
1. `contracts/CosmeticLoadout.sol` → On-chain loadout storage (optional)

### New Services (1)
1. `services/aiAgents/missionAI/cosmeticEngine.ts` → Cosmetic mission generation

---

## 9. Critical Constraints

### UI Legibility Rules
```typescript
// lib/cosmetics/validation.ts
export const UI_SAFETY_RULES = {
  minOpacity: 0.7,        // Critical UI must be 70%+ visible
  minContrast: 4.5,       // WCAG AA compliance
  maxFileSize: 5 * 1024 * 1024, // 5MB per asset
  reservedSlots: [
    "emission_warning",
    "security_alert",
    "vault_health_critical"
  ]
};
```

### Single Source of Truth
```typescript
// All cosmetic data flows through CosmeticContext
// NO component should have local cosmetic state
<CosmeticContext.Provider value={cosmeticState}>
  <VoidHUDLayout />
</CosmeticContext.Provider>
```

### Start Small, Expand
```
Phase 1 (MVP): Avatar + HUD Theme + Mission Cards
    ↓
Phase 2: Maps + Icons + Chat + Audio
    ↓
Phase 3: Missions + AI Integration
    ↓
Phase 4: On-Chain Loadout
```

---

## 10. Economic Impact Projections

**Assumptions:**
- 1,000 active users
- 10% purchase cosmetics weekly
- Avg cosmetic price: $10 USDC

**Weekly Cosmetic Revenue:**
```
1,000 users × 10% × $10 = $1,000/week

Fee Distribution (Week 2 Economic Model v5.2):
- Creators: $400 (40%)
- xVOID stakers: $200 (20%)
- PSX Treasury: $100 (10%)
- CREATE Treasury: $100 (10%)
- Agency Operations: $100 (10%)
- Creator Grants: $50 (5%)
- Security: $50 (5%)
```

**Flywheel Effects:**
- Combined Treasury: $200/week → VOID/PSX buybacks
- Emissions: $200/week to stakers → higher APR → more staking
- vXP: 100 cosmetic purchases × 50 vXP = 5,000 vXP distributed
- SIGNAL: 100 purchases × 10 SIGNAL = 1,000 SIGNAL minted

**Creator Incentive:**
- Top creator: 50 sales/week × $4 royalty = $200/week
- Passive income while sleeping ✅

---

## 11. Next Steps

1. **Approve this cosmetics spec**
2. **Complete Week 2-5 HUD core implementation first** (from HUD_System_Spec_v1.0.md)
3. **Week 6-7: Implement Phase 1 Cosmetics MVP**
   - Avatar cosmetics (frame, ring, title)
   - HUD theme
   - Mission card skins
4. **Week 8-9: Phase 2 Extended Cosmetics**
5. **Week 10: Phase 3 Mission/AI Integration**

**Your Build AI is ready to implement cosmetics once HUD core is complete.** ✅

---

**Document Version:** 1.0  
**Approved By:** User (pending)  
**Implementation Target:** Week 6-11 (after HUD core complete)  
**Status:** ✅ Ready for Approval
