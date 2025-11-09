# 🎮 COMPREHENSIVE LAND SYSTEM AUDIT & REBUILD PLAN
**Date:** November 9, 2025  
**Project:** PSX-VOID Metaverse - Land System Overhaul  
**Target:** Xbox/PS1 + Opium + Liquid Chrome Y2K + Expandable Land Architecture

---

## 📋 TABLE OF CONTENTS
1. [Phase 1: Full Audit](#phase-1-full-audit)
2. [Phase 2: Target Architecture](#phase-2-target-architecture)
3. [Phase 3: City/Landscape Design](#phase-3-citylandscape-design)
4. [Phase 4: Aesthetic & HUD Spec](#phase-4-aesthetic--hud-spec)
5. [Phase 5: Expansion System](#phase-5-expansion-system)
6. [Implementation Roadmap](#implementation-roadmap)

---

# PHASE 1: FULL AUDIT

## 🔍 1.1 LAND / MAP / INVENTORY AUDIT

### Current Implementation Analysis

#### ✅ **What Exists & Works:**

**Data Models** (`lib/land/types.ts` - 341 lines)
- ✅ `Parcel` interface with comprehensive fields
- ✅ `Building`, `Business`, `Unit`, `DAO` interfaces
- ✅ Enums: `ZoneType`, `ParcelStatus`, `LicenseType`, `BuildingArchetype`, `HeightClass`
- ✅ TypeScript types are production-ready

**Contract Integration** (`lib/land/contracts.ts` - 288 lines)
- ✅ LandRegistry ABI defined
- ✅ Contract addresses structure exists
- ✅ USE_MOCK_DATA flag for development

**API Layer** (`lib/land/registry-api.ts` - 365 lines)
- ✅ `LandRegistryAPI` class with coordinate conversion
- ✅ Mock data generator (10,000 parcels)
- ✅ Zone/district determination logic

**React Hooks** (`lib/land/hooks.ts` - 401 lines)
- ✅ `useParcelsPage()` - Paginated parcel loading
- ✅ `useParcelDetails()` - Single parcel fetch
- ✅ `usePurchaseParcel()`, `useBuildHouse()` - Transaction hooks
- ✅ Mock fallback implemented

**UI Components**
- ✅ `GlobalLandInventory` - Full inventory browser (500 lines)
- ✅ Filters, search, pagination
- ✅ Table/grid/map views
- ✅ Statistics dashboard

**3D System** (`components/3d/CybercityWorld.tsx` - 293 lines)
- ✅ Connected to new land system (recently migrated)
- ✅ Dynamic building heights per zone
- ✅ Ownership visualization (cyan/amber/purple indicators)
- ✅ Business license badges

#### ❌ **CRITICAL MISMATCHES vs ECOSYSTEM DOCS:**

### **MISMATCH #1: Grid Structure**
**Current:** 100×100 grid = 10,000 parcels (LAND_CONSTANTS.GRID_SIZE = 100)  
**Expected:** 40×40 genesis grid = 1,600 parcels  
**Location:** `lib/land/types.ts` lines 313-314

```typescript
// ❌ WRONG - Current implementation
export const LAND_CONSTANTS = {
  GRID_SIZE: 100,        // Should be 40 for genesis
  TOTAL_PARCELS: 10000,  // Should be 1,600 for genesis
  // ...
}
```

**Impact:**  
- 6.25x more parcels than documented genesis region
- Dilutes scarcity and pricing model
- Mock data generates for wrong grid size

---

### **MISMATCH #2: Missing Tier System**
**Current:** Only `ZoneType` enum (PUBLIC, RESIDENTIAL, COMMERCIAL, PREMIUM, GLIZZY_WORLD)  
**Expected:** Tier system (CORE, RING, FRONTIER) + Districts  
**Location:** No tier concept exists in code

**Expected Structure:**
```
Genesis Region (40×40 = 1,600 parcels)
├── CORE (center ~400 parcels)
│   ├── Gaming District
│   ├── Business District
│   └── DAO HQ
├── RING (middle ~800 parcels)
│   ├── Social District
│   ├── DeFi District
│   └── Residential District
└── FRONTIER (edges ~400 parcels)
    ├── Expansion buffer
    └── Lower-priced entry parcels
```

**Impact:**
- No tier-based pricing formula
- Can't implement documented pricing: `Price = TierMultiplier × DistrictMultiplier × ScarcityFactor`
- Missing geographic scarcity model

---

### **MISMATCH #3: Missing District Concept**
**Current:** Zones are basic enums with no district mapping  
**Expected:** Districts with distinct purposes, visuals, economies

**Missing Districts:**
- ❌ Gaming District (arcades, arenas, esports towers)
- ❌ Business District (offices, HQs, coworking)
- ❌ Social District (clubs, galleries, venues)
- ❌ DeFi District (trading floors, vaults, DAOs)
- ❌ Residential District (apartments, penthouses)

**Impact:**
- Can't assign parcels to themed districts
- No district-specific building types
- Missing visual coherence per area

---

### **MISMATCH #4: Hard-Capped Land (No Expansion)**
**Current:** Fixed max of 10,000 parcels  
**Expected:** Genesis = 1,600 parcels, but system must support infinite expansion

**Problems:**
1. `parcelId` is `0-9999` with no `worldId`/`regionId` dimension
2. No concept of multiple regions/worlds
3. `coordsToParcelId()` assumes single 100×100 grid:
   ```typescript
   // lib/land/registry-api.ts line 31
   coordsToParcelId(x: number, y: number): number {
     return y * 100 + x;  // ❌ HARD-CODED, breaks with new regions
   }
   ```
4. No minting flow for new land

**Impact:**
- **BLOCKS EXPANSION** - Can't add new regions without breaking existing IDs
- Can't support partner/creator worlds
- Can't implement documented expansion phases

---

### **MISMATCH #5: Pricing Formula**
**Current:** Simple zone-based flat pricing  
**Expected:** `Price = Tier × District × Scarcity × (1 + DemandMultiplier)`

**Current (lib/land/registry-api.ts lines 100-108):**
```typescript
getZonePrice(zone: ZoneType): bigint {
  const prices: Record<ZoneType, bigint> = {
    [ZoneType.PUBLIC]: parseEther('100'),      // Flat 100 VOID
    [ZoneType.RESIDENTIAL]: parseEther('200'), // Flat 200 VOID
    // ...
  };
  return prices[zone];  // ❌ No tier/district/scarcity factors
}
```

**Expected Logic:**
```typescript
calculateParcelPrice(parcel: Parcel): bigint {
  const tierMultiplier = { CORE: 3, RING: 2, FRONTIER: 1 }[parcel.tier];
  const districtMultiplier = { GAMING: 1.5, BUSINESS: 1.3, ... }[parcel.district];
  const scarcityBonus = parcel.isCorner ? 1.2 : parcel.isFounderPlot ? 2.0 : 1.0;
  
  return basePrice * tierMultiplier * districtMultiplier * scarcityBonus;
}
```

---

### **MISMATCH #6: Missing Founder Plot Logic**
**Current:** `isFounderPlot: boolean` exists but not used  
**Expected:** Founder plots with special perks, pricing, visuals

**Missing:**
- No founder plot assignment algorithm
- No visual distinction (should have unique architecture)
- No perk system (extra height, revenue bonuses, branding rights)

---

## 🏗️ 1.2 REAL ESTATE & BUSINESS LOGIC AUDIT

### Buildings System

#### ✅ **What Works:**
- `Building` interface with 7 archetypes (CORPORATE_TOWER, RESIDENTIAL_HIVE, etc.)
- Height classes (LOW, MID, HIGH, ULTRA)
- `BuildingPrefabSystem` class exists (422 lines) with complex 3D generation
- Unit/lease interfaces defined

#### ❌ **What's Missing:**

**Building → Unit Mapping:**
- No implemented logic to divide buildings into rentable units
- Unit types defined in types but not used:
  ```typescript
  // Documented unit types not implemented:
  - SHOP (retail storefronts)
  - VENUE (clubs, theaters)
  - OFFICE (coworking, HQ suites)
  - GALLERY (art spaces)
  - ARENA (esports, tournaments)
  - CLUB (nightlife)
  - PENTHOUSE (luxury residential)
  ```

**Cost & XP System:**
- Building costs not tied to documented values:
  ```
  Expected costs (from ecosystem docs):
  - Shop: 500 VOID, 50 XP
  - Venue: 1,000 VOID, 100 XP
  - Office: 750 VOID, 75 XP
  - Arena: 5,000 VOID, 500 XP
  ```
- No XP rewards on building construction

**Capacity & Perks:**
- No max occupancy limits per building type
- No perk system (e.g., penthouses grant governance voting power)

---

### Business Registry

#### ✅ **What Exists:**
- `Business` interface with sector, status, revenue
- `LicenseType` enum (RETAIL, ENTERTAINMENT, SERVICES, GAMING)
- `businessLicense` field on Parcel
- `usePurchaseLicense()` hook

#### ❌ **What's Missing:**

**Storefront & SKU Integration:**
- No link between Business ↔ SKU system
- Business should tie to creator SKUs but no API exists
- Missing `skuIds[]` array population

**Revenue Splits:**
- 80/20 split defined but not enforced in code
- No V4 hook integration for ecosystem fee routing
- `businessRevenue` field exists but no UI to display it

**Business Detail UI:**
- Can see license type in inventory
- Can't view:
  - Business name/branding
  - Linked SKUs/products
  - Revenue history
  - Operational status

---

## 🌆 1.3 WORLD & LANDSCAPE AUDIT

### Current City Layout

**What Exists:**
- Simple grid of buildings at 40-unit spacing
- Dynamic heights based on zone + center distance
- Basic ownership indicators (wireframes, holograms, badges)
- Ground plane

**Visual Quality:**
- ✅ Buildings have varying heights
- ✅ Zone-based colors
- ✅ Window emissives
- ❌ **All buildings are simple boxes** - No architectural variety
- ❌ **No streets/sidewalks** - Just floating buildings
- ❌ **No parks/greenways** - Missing public spaces
- ❌ **No landmarks** - No DAO HQ, hero buildings, district centers
- ❌ **No neon/chrome aesthetic** - Missing PS1/Xbox/Opium vibe

---

### Expansion Support Analysis

**Hard-Coded Bounds:**
```typescript
// components/3d/CybercityWorld.tsx
const PARCEL_SIZE = 40;  // Fixed
// No worldId/regionId concept

// lib/land/types.ts
worldId: string;  // Field exists but always "VOID-1"
layerZ?: number;  // Field exists but never used
```

**Problems:**
1. ❌ Can't add new regions without ID collisions
2. ❌ No region dimension in coordinate system
3. ❌ 3D world doesn't support multi-region rendering
4. ❌ No expansion trigger system (DAO votes, partner launches, creator mints)

---

## 🎨 1.4 UX / HUD AUDIT

### Current UI Theme

**Desktop HUD:**
- Action bar at bottom with buttons
- Profile card top-left
- Mini-map (exists but not visible in land view)
- Global Chat

**Aesthetic:**
- ✅ Dark cyberpunk base colors
- ❌ **NO Xbox/PS1 UI elements**
- ❌ **NO liquid chrome panels**
- ❌ **NO CRT overlay/scanlines**
- ❌ **NO Opium/Carti red/purple/infrared palette**
- ❌ **NO glitch/VHS effects**
- ❌ **NO techno caps headers (Orbitron/Eurostile style)**

**Current Palette (from styles):**
```css
--background: #030712;  /* Near-black */
--foreground: #f5f6fb;  /* White */
/* Missing: Chrome gradients, opium red, toxic teal, Carti purple */
```

---

### Land Registry UI

**GlobalLandInventory Component:**
- ✅ Functional filters & search
- ✅ Pagination working
- ❌ **Generic table/card design** - Needs PS1 BIOS memory card aesthetic
- ❌ **No Xbox blade-style tabs**
- ❌ **No chrome panel effects**
- ❌ **No CRT flicker on open/close**

---

### Missing UI Surfaces

**No UI for:**
- Building detail panels (when clicking 3D building)
- Business registry browser
- Unit rental interface
- DAO land management
- Founder plot showcase
- District maps with tier visualizations

---

# PHASE 2: TARGET ARCHITECTURE

## 🏛️ 2.1 UNIFIED DATA MODELS (WITH EXPANSION SUPPORT)

### Core Entity: Parcel (Upgraded)

```typescript
/**
 * Parcel - Expandable Land NFT
 * Supports infinite regions via worldId + regionId
 */
export interface Parcel {
  // ========== UNIQUE IDENTIFIERS ==========
  parcelId: string;              // Format: "{worldId}-{regionId}-{localId}"
                                  // Examples:
                                  // "VOID-GENESIS-0" (first parcel in genesis)
                                  // "VOID-R2-0" (first parcel in region 2)
                                  // "PARTNER-BRAND-X-0" (partner world)
  
  tokenId: bigint;                // Global ERC-721 ID (never reused)
  
  // ========== LOCATION ==========
  worldId: string;                // "VOID", "PARTNER-X", "CREATOR-Y"
  regionId: string;               // "GENESIS", "R2", "R3", "BRAND-DISTRICT"
  gridX: number;                  // 0 to regionWidth-1
  gridY: number;                  // 0 to regionHeight-1
  layerZ: number;                 // 0=ground, -1=underground, 1+=sky layers
  
  // ========== TIER & DISTRICT (NEW) ==========
  tier: TierType;                 // CORE, RING, FRONTIER
  district: DistrictType;         // GAMING, BUSINESS, SOCIAL, DEFI, RESIDENTIAL
  
  // ========== OWNERSHIP ==========
  ownerAddress: Address | null;
  status: ParcelStatus;           // OWNED, FOR_SALE, DAO_OWNED, RESERVED
  
  // ========== PRICING (UPGRADED FORMULA) ==========
  basePrice: bigint;              // Zone base (100-1000 VOID)
  currentPrice: bigint;           // = basePrice × tierMult × districtMult × scarcity
  listingPrice?: bigint;          // If FOR_SALE
  
  // ========== SPECIAL FLAGS ==========
  isFounderPlot: boolean;
  isCornerLot: boolean;
  isMainStreet: boolean;
  
  // ========== CREATION TRACKING (NEW) ==========
  creationSource: CreationSource; // GENESIS, DAO_EXPANSION, PARTNER_MINT, USER_MINT
  mintedAt: Date;
  mintedBy: Address;              // Creator or expansion contract
  campaignId?: string;            // If part of expansion campaign
  
  // ========== BUILDING LINK ==========
  buildingId: string | null;
  hasBuilding: boolean;
  
  // ========== BUSINESS ==========
  businessLicense: LicenseType;
  businessId?: string;
  
  // ========== METADATA ==========
  metadata: ParcelMetadata;
}

// ========== NEW ENUMS ==========

export enum TierType {
  CORE = "CORE",           // Center, highest value
  RING = "RING",           // Middle belt
  FRONTIER = "FRONTIER"    // Edges, expansion buffer
}

export enum DistrictType {
  GAMING = "GAMING",               // Arcades, arenas, esports
  BUSINESS = "BUSINESS",           // Offices, HQs, coworking
  SOCIAL = "SOCIAL",               // Clubs, galleries, venues
  DEFI = "DEFI",                   // Trading floors, vaults
  RESIDENTIAL = "RESIDENTIAL",     // Apartments, penthouses
  PUBLIC = "PUBLIC",               // Parks, plazas, streets
  DAO = "DAO"                      // Governance buildings
}

export enum CreationSource {
  GENESIS = "GENESIS",             // Original 1,600 parcels
  DAO_EXPANSION = "DAO_EXPANSION", // Protocol-approved expansions
  PARTNER_MINT = "PARTNER_MINT",   // Partner/brand regions
  USER_MINT = "USER_MINT",         // Creator/community mints
  AIRDROP = "AIRDROP"              // Promotional parcels
}
```

---

### Region System (NEW)

```typescript
/**
 * Region - Container for parcels
 * Enables infinite land expansion
 */
export interface Region {
  regionId: string;                // "GENESIS", "R2", "PARTNER-X"
  worldId: string;                 // Parent world
  
  // ========== GRID CONFIGURATION ==========
  gridWidth: number;               // E.g., 40 for genesis
  gridHeight: number;              // E.g., 40 for genesis
  totalParcels: number;            // gridWidth × gridHeight
  
  // ========== TIER LAYOUT ==========
  tierConfig: TierConfiguration;   // How CORE/RING/FRONTIER are distributed
  
  // ========== DISTRICT MAPPING ==========
  districtMap: DistrictZone[];     // Geographic zones per district
  
  // ========== CREATION & GOVERNANCE ==========
  createdAt: Date;
  createdBy: Address;              // DAO multisig, partner deployer, etc.
  governanceContract?: Address;    // If DAO-controlled
  
  // ========== ECONOMIC PARAMS ==========
  priceMultiplier: number;         // Regional price scaling (e.g., 1.5x for premium)
  revenuePoolAddress: Address;     // Where ecosystem fees go
  
  // ========== STATE ==========
  status: RegionStatus;
  mintedParcels: number;           // How many parcels sold/minted
  availableParcels: number;        // Remaining supply
  
  // ========== METADATA ==========
  metadata: RegionMetadata;
}

export interface TierConfiguration {
  coreRadius: number;              // Parcels from center = CORE
  ringRadius: number;              // Parcels in middle belt = RING
  // Remainder = FRONTIER
}

export interface DistrictZone {
  district: DistrictType;
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  allowedBuildings: BuildingArchetype[];
  theme: DistrictTheme;
}

export enum RegionStatus {
  PLANNED = "PLANNED",             // Announced but not minted
  MINTING = "MINTING",             // Active sale
  ACTIVE = "ACTIVE",               // Fully operational
  ARCHIVED = "ARCHIVED"            // Historical/deprecated
}

export interface RegionMetadata {
  name: string;                    // "VOID Genesis", "DeFi District Expansion"
  description: string;
  thumbnail: string;
  partnerBrand?: string;           // If partner region
  theme: string;                   // "cyberpunk-neon", "brutalist-chrome", etc.
}
```

---

### Building Entity (Enhanced)

```typescript
/**
 * Building - Detailed 3D Structure
 * With unit subdivision and visual complexity
 */
export interface Building {
  buildingId: string;
  parcelId: string;                // Format: "{worldId}-{regionId}-{localId}"
  
  // ========== ARCHITECTURE ==========
  archetype: BuildingArchetype;
  variant: number;                 // 0-N visual variants
  heightClass: HeightClass;
  floors: number;
  
  // ========== DIMENSIONS ==========
  baseWidth: number;
  baseDepth: number;
  totalHeight: number;
  
  // ========== UNIT SUBDIVISION (NEW) ==========
  units: BuildingUnit[];           // Rentable spaces inside
  maxUnits: number;                // Capacity based on building type
  occupiedUnits: number;
  
  // ========== VISUAL FEATURES ==========
  hasBalconies: boolean;
  hasRooftopGarden: boolean;
  hasHelipad: boolean;
  hasBillboards: boolean;
  neonSignage: NeonConfig;
  windowPattern: WindowStyle;
  
  // ========== MATERIALS & COLORS ==========
  primaryMaterial: MaterialType;   // CHROME, CONCRETE, GLASS, METAL
  colorScheme: ColorScheme;
  glowIntensity: number;
  
  // ========== BRANDING (If Business) ==========
  businessBranding?: {
    businessId: string;
    logoUrl: string;
    brandColor: string;
    signageType: 'neon' | 'hologram' | 'led-panel' | 'projection';
  };
  
  // ========== PERKS (Founder Plots) ==========
  founderPerks?: {
    extraHeight: number;
    customBranding: boolean;
    governanceVotes: number;
    revenueBonus: number;         // % multiplier
  };
  
  metadata: BuildingMetadata;
}

/**
 * BuildingUnit - Rentable Space
 * Shop, office, venue, etc. inside a building
 */
export interface BuildingUnit {
  unitId: string;
  buildingId: string;
  
  floor: number;
  unitNumber: string;              // "1A", "2B", "PENTHOUSE", etc.
  
  unitType: UnitType;              // SHOP, OFFICE, VENUE, PENTHOUSE, etc.
  squareMeters: number;
  capacity: number;                // Max occupants/items
  
  // ========== RENTAL ==========
  isRented: boolean;
  tenantAddress?: Address;
  rentPerMonth: bigint;            // In VOID
  leaseEndsAt?: Date;
  deposit: bigint;
  
  // ========== LINKED BUSINESS ==========
  businessId?: string;
  skuIds: string[];                // Products sold here
  
  metadata: UnitMetadata;
}

export enum UnitType {
  SHOP = "SHOP",                   // Retail storefront
  VENUE = "VENUE",                 // Club, theater
  OFFICE = "OFFICE",               // Coworking, HQ suite
  GALLERY = "GALLERY",             // Art space
  ARENA = "ARENA",                 // Esports tournament space
  CLUB = "CLUB",                   // Nightlife
  PENTHOUSE = "PENTHOUSE",         // Luxury residential
  STUDIO = "STUDIO",               // Creator workspace
  VAULT = "VAULT"                  // DeFi treasury/safe
}
```

---

### Business Entity (Fully Integrated)

```typescript
/**
 * Business - On-Chain Registered Business
 * Linked to parcels, units, SKUs, and revenue
 */
export interface Business {
  businessId: string;
  ownerAddress: Address;
  
  // ========== BRANDING ==========
  name: string;
  description: string;
  logoUrl: string;
  brandColor: string;
  category: BusinessSector;
  
  // ========== LICENSING ==========
  licenseType: LicenseType;
  licenseIssuedAt: Date;
  licenseExpiresAt: Date;
  licenseStatus: BusinessStatus;
  
  // ========== LOCATIONS ==========
  linkedParcels: string[];         // Parcel IDs where business operates
  linkedUnits: string[];           // Unit IDs (storefronts, offices)
  primaryLocation: string;         // Main parcel ID
  
  // ========== PRODUCTS (SKU INTEGRATION) ==========
  skuIds: string[];                // SKUs sold by this business
  totalSKUs: number;
  activeSKUs: number;
  
  // ========== REVENUE ==========
  totalRevenue: bigint;            // All-time VOID earned
  monthlyRevenue: bigint;          // Last 30 days
  revenueShare: {
    toOwner: number;               // 80%
    toEcosystem: number;           // 20% via V4 hooks
  };
  lastRevenueDate: Date;
  
  // ========== OPERATIONAL ==========
  employeeCount: number;
  customerCount: number;
  rating: number;                  // 0-5 stars
  
  metadata: BusinessMetadata;
}

export interface BusinessMetadata {
  website?: string;
  social?: {
    twitter?: string;
    discord?: string;
  };
  tags: string[];                  // "nightlife", "fashion", "gaming", etc.
  verified: boolean;               // Platform-verified business
}
```

---

## 🗄️ 2.2 EXPANSION ARCHITECTURE

### Land Minting Flows

```typescript
/**
 * Expansion Campaign - New Land Creation Event
 */
export interface ExpansionCampaign {
  campaignId: string;
  regionId: string;
  
  // ========== TIMELINE ==========
  announcedAt: Date;
  mintStartsAt: Date;
  mintEndsAt: Date;
  
  // ========== SUPPLY ==========
  totalParcels: number;
  mintedParcels: number;
  reservedParcels: number;         // For partners, airdrops
  
  // ========== PRICING ==========
  mintPrice: bigint;               // Base price for this campaign
  pricingCurve: PricingCurve;      // FLAT, LINEAR, BONDING
  currentPrice: bigint;            // If bonding curve
  
  // ========== GOVERNANCE ==========
  approvedBy: Address;             // DAO multisig or governance contract
  daoProposalId?: string;
  votesFor: bigint;
  votesAgainst: bigint;
  
  // ========== RESTRICTIONS ==========
  whitelist?: Address[];           // If whitelisted sale
  maxPerWallet: number;
  
  status: CampaignStatus;
}

export enum PricingCurve {
  FLAT = "FLAT",                   // Fixed price
  LINEAR = "LINEAR",               // Price += step per mint
  BONDING = "BONDING",             // Quadratic bonding curve
  DUTCH_AUCTION = "DUTCH_AUCTION"  // Price decreases over time
}

export enum CampaignStatus {
  PROPOSED = "PROPOSED",           // DAO proposal submitted
  APPROVED = "APPROVED",           // DAO voted yes
  ACTIVE = "ACTIVE",               // Minting live
  PAUSED = "PAUSED",               // Temporarily stopped
  COMPLETED = "COMPLETED",         // All parcels minted
  CANCELLED = "CANCELLED"          // DAO/admin cancelled
}
```

---

### Minting Contract Flow

```typescript
/**
 * Pseudo-code for expansion minting
 */

// Step 1: DAO approves new region
await daoGovernance.proposeExpansion({
  regionId: "VOID-R2",
  gridSize: [32, 32],  // Smaller than genesis
  tierConfig: { coreRadius: 8, ringRadius: 16 },
  mintPrice: parseEther("150"),
  campaignDuration: 30 * 24 * 60 * 60  // 30 days
});

// Step 2: Vote passes, campaign created
const campaign = await landExpansionFactory.createCampaign({
  regionId: "VOID-R2",
  totalParcels: 1024,  // 32×32
  mintPrice: parseEther("150"),
  startTime: Date.now() + 7 * 24 * 60 * 60  // Starts in 7 days
});

// Step 3: Users mint during campaign
await landMintingContract.mintParcel({
  regionId: "VOID-R2",
  desiredCoords: { x: 10, y: 10 },  // Optional preference
  paymentAmount: parseEther("150")
});

// Step 4: Parcel NFT minted, assigned coords
// Event: ParcelMinted(tokenId, parcelId: "VOID-R2-325", owner, coords)

// Step 5: Parcel appears in:
// - Global registry
// - User wallet
// - 3D world (new region loaded)
```

---

### Region ID System

```typescript
/**
 * Parcel ID Format: {worldId}-{regionId}-{localId}
 * 
 * Examples:
 * - "VOID-GENESIS-0"        → First genesis parcel
 * - "VOID-GENESIS-1599"     → Last genesis parcel (40×40 = 1,600)
 * - "VOID-R2-0"             → First parcel in expansion region 2
 * - "PARTNER-NIKE-0"        → Partner-branded world
 * - "CREATOR-ALICE-0"       → Creator's personal world
 * 
 * TokenId: Global counter (never reused)
 * - Genesis parcels: tokenId 0-1599
 * - R2 parcels: tokenId 1600-2623 (if R2 has 1,024 parcels)
 * - R3 parcels: tokenId 2624+
 */

// Utility functions
function parseParcelId(parcelId: string): ParcelLocation {
  const [worldId, regionId, localId] = parcelId.split('-');
  return { worldId, regionId, localId: parseInt(localId) };
}

function buildParcelId(worldId: string, regionId: string, localId: number): string {
  return `${worldId}-${regionId}-${localId}`;
}

// Coordinate system per region
function getWorldPosition(parcelId: string): Vector3 {
  const { worldId, regionId, localId } = parseParcelId(parcelId);
  
  // Get region config
  const region = await getRegion(worldId, regionId);
  const { gridWidth, gridHeight } = region;
  
  // Convert local ID to grid coords
  const gridX = localId % gridWidth;
  const gridY = Math.floor(localId / gridWidth);
  
  // Get region offset in world space
  const regionOffset = getRegionOffset(worldId, regionId);
  
  // Calculate final position
  return {
    x: regionOffset.x + (gridX * PARCEL_SIZE),
    y: 0,
    z: regionOffset.z + (gridY * PARCEL_SIZE)
  };
}
```

---


# PHASE 3: CITY/LANDSCAPE DESIGN

##  3.1 GENESIS GRID SPECIFICATION (4040 = 1,600 PARCELS)

Grid: 4040 parcels, 1,600 total
Parcel Size: 4040 world units
Tier Distribution:
- CORE (center 1616): 256 parcels (16%)
- RING (middle): 768 parcels (48%)
- FRONTIER (outer): 576 parcels (36%)

Districts:
- Gaming (NW): Red/orange arcade neon
- Business (NE): Blue chrome corporate towers
- Social (SW): Pink venues
- DeFi (SE): Green data centers
- Residential (middle ring): Violet hives
- DAO (center 44): Purple/gold plaza

Pricing Formula: Base  TierMult  DistrictMult  Scarcity
Examples: Founder CORE Gaming ~5,850 VOID, Regular FRONTIER Residential ~200 VOID

---

# PHASE 4: AESTHETIC & HUD SPEC (Xbox/PS1/Opium/Y2K)

Visual Identity:
1. **Xbox**: Blade UI, metallic green (#00f0ff), orb visualizers
2. **PS1**: Memory card grids, low-poly chunky geometry, CRT scanlines, boot sequences
3. **Opium/Carti**: Red (#ff0032), purple (#7b00ff), infrared (#ff006e), rich black (#0a0a0a)
4. **Liquid Chrome Y2K**: Iridescent gradients (silverpinkblue), holographic overlays

UI Components:
- ChromePanel: Liquid metal gradients, RGB edge glow, CRT scanlines
- Xbox Blade Nav: Slide-in panels from left (inventory/map/social)
- PS1 Memory Card Grid: Land inventory as save files ( = owned,  = available)
- CRT Overlay: Scanlines, chromatic aberration, vignette, barrel distortion, VHS noise

Building Materials:
- CORE tier: 100% chrome/glass, 2x neon, holographic billboards
- RING tier: 70% chrome, 1.5x neon, LED signage
- FRONTIER tier: 40% chrome, 1x neon, basic signage

---

# PHASE 5: EXPANSION SYSTEM

Multi-Region Architecture:
- World: Ecosystem/partner/creator-owned container (e.g., VOID, AGENCY, PARTNER-NIKE)
- Region: 4040 grid within a world (VOID-GENESIS, VOID-EXPANSION-1)
- Region ID format: {WORLD_ID}-{REGION_TYPE}-{INDEX}
- Parcel ID format: {REGION_ID}-{GRID_INDEX}
- Infinite scalability, no hard cap

Expansion Campaigns:
- **DAO Expansion**: Governance vote  treasury funds deployment  founder early access (20% off)  public sale
- **Partner Worlds**: Nike/BAYC/etc. get isolated economics, keep 80% of sales, cross-promote in VOID
- **Creator Regions**: Founders apply  automated approval  region deployed  creator keeps 70%, sets prices

Minting Flows:
- Phase system (whitelist  founder early access  public)
- Bonding curves or flat pricing
- Max per wallet limits
- Founder status requirements

World Layout:
- Regions arranged in spiral pattern from genesis
- Teleportation between regions via map or portal buildings
- egionOffset = spiralPosition[index]  (REGION_SIZE + GAP)

---

# IMPLEMENTATION ROADMAP

**PHASE 1** (Critical - 2-4 hours):
1. Change GRID_SIZE from 100 to 40 in lib/land/types.ts
2. Add TierType and DistrictType enums
3. Update Parcel interface with tier/district/regionId fields
4. Add Region, World, ExpansionCampaign interfaces
5. Update mock data to 4040 with tier/district assignments

**PHASE 2** (High - 3-5 hours):
6. Update coordinate system in egistry-api.ts (add regionId param)
7. Create lib/land/tier-calculator.ts for tier/district logic
8. Create lib/land/region-system.ts for multi-region management
9. Update pricing formula with tierdistrictscarcity
10. Integrate BuildingPrefabSystem into CybercityWorld.tsx

**PHASE 3** (Medium - 8-12 hours):
11. Create chrome panel UI components (liquid metal gradients)
12. Create Xbox blade navigation
13. Create PS1 memory card grid view
14. Add CRT overlay shader (scanlines, chromatic aberration)
15. Apply Opium color palette globally
16. Update building materials (chrome focus)

**PHASE 4** (Low - 6-8 hours):
17. Create expansion campaign system (lib/land/expansion-system.ts)
18. Create campaign portal UI (components/expansion/campaign-portal.tsx)
19. Implement minting flows (phases, whitelist, bonding curves)
20. Deploy smart contracts to testnet
21. Update contract addresses, remove USE_MOCK_DATA

**Total Estimated Time**: 20-30 hours

---

# QA CHECKLIST

Data Model:
- [ ] GRID_SIZE = 40 (not 100)
- [ ] TOTAL_PARCELS = 1,600 (genesis)
- [ ] TierType enum exists
- [ ] DistrictType enum exists
- [ ] Pricing formula: Base  Tier  District  Scarcity

Visuals:
- [ ] Chrome materials (metalness > 0.9)
- [ ] CRT scanlines visible
- [ ] Opium red/Carti purple used
- [ ] Xbox blade UI functional
- [ ] PS1 memory card grid works

Buildings:
- [ ] BuildingPrefabSystem integrated
- [ ] Buildings vary by district
- [ ] Heights match tier rules

Expansion:
- [ ] Multiple regions supported
- [ ] Region IDs include worldId
- [ ] Spiral layout calculates correctly
- [ ] Minting campaigns functional

---

# SUMMARY

**Critical Issues Found**:
1. Wrong grid size (100100 vs 4040)
2. No tier system (CORE/RING/FRONTIER)
3. No districts (Gaming/Business/Social/DeFi)
4. Hard-capped (no expansion architecture)
5. Wrong pricing (flat vs tierdistrictscarcity)
6. Wrong aesthetic (generic vs Xbox/PS1/Opium)

**Recommended Approach**: Full rebuild (Option A)
- Justification: Coordinate system change is fundamental, affects every file
- Changing GRID_SIZE alone breaks parcel IDs and expansion architecture
- Clean rebuild faster than incremental migration
- Risk: Medium (greenfield) vs High (cascading bugs in Option B)

**Next Steps**:
1. Get user approval on Option A vs Option B
2. Implement Phase 1 (data models) FIRST
3. Then Phase 2 (coordinate system + building integration)
4. Then Phase 3 (visual aesthetic)
5. Finally Phase 4 (expansion system)

**Estimated Total Time**: 20-30 hours
**Priority**: Data model changes block everything else

---

**AUDIT COMPLETE** 

Awaiting user decision to proceed with implementation.

