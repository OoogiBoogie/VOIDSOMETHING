/**
 * Land System - TypeScript Entity Definitions
 * 
 * Single source of truth for all land/parcel/building/business entities
 * Aligned with LandRegistry.sol contract
 */

import { Address } from 'viem';

// Re-export Address type for other files
export type { Address };

// ========== ENUMS ==========

export enum ZoneType {
  PUBLIC = 0,        // 100 VOID  | General areas
  RESIDENTIAL = 1,   // 200 VOID  | Housing zones
  COMMERCIAL = 2,    // 300 VOID  | Business districts
  PREMIUM = 3,       // 500 VOID  | Center/high-value
  GLIZZY_WORLD = 4   // 1000 VOID | Requires 100k PSX
}

export enum ParcelStatus {
  OWNED = "OWNED",                    // Has owner, not for sale
  FOR_SALE = "FOR_SALE",              // Listed on marketplace
  NOT_FOR_SALE = "NOT_FOR_SALE",      // Owned but not listed
  DAO_OWNED = "DAO_OWNED",            // Owned by DAO contract
  RESTRICTED = "RESTRICTED"           // Special/reserved
}

export enum LicenseType {
  NONE = 0,
  RETAIL = 1,          // 50 VOID  | Shops
  ENTERTAINMENT = 2,   // 75 VOID  | Clubs, arcades
  SERVICES = 3,        // 50 VOID  | Utilities
  GAMING = 4           // 100 VOID | Casinos, tournaments
}

export enum BuildingArchetype {
  CORPORATE_TOWER = "corporate",       // Tall, sleek, lots of glass
  RESIDENTIAL_HIVE = "residential",    // Dense, modular, balconies
  INDUSTRIAL_COMPLEX = "industrial",   // Heavy, blocky, pipes
  DATA_CENTER = "datacenter",          // Windowless, server lights
  ABANDONED_SHELL = "abandoned",       // Dark, broken, minimal lights
  MIXED_USE = "mixed",                 // Residential + commercial
  ENTERTAINMENT_HUB = "entertainment"  // Bright, flashy, neon-heavy
}

export enum HeightClass {
  LOW = "low",          // 10-30 floors  | 100-180 world units
  MID = "mid",          // 30-60 floors  | 180-280 world units
  HIGH = "high",        // 60-100 floors | 280-380 world units
  ULTRA = "ultra"       // 100+ floors   | 380+ world units
}

// Tier system for land scarcity/pricing
export enum TierType {
  CORE = "CORE",           // Center 16×16: 256 parcels (~16%) | 3x price multiplier
  RING = "RING",           // Middle belt: 768 parcels (~48%)  | 2x price multiplier
  FRONTIER = "FRONTIER"    // Outer edge: 576 parcels (~36%)   | 1x price multiplier
}

// District zones with themed buildings/aesthetics
export enum DistrictType {
  GAMING = "GAMING",             // NW quadrant | Red/orange neon, arcade aesthetic
  BUSINESS = "BUSINESS",         // NE quadrant | Blue chrome, corporate towers
  SOCIAL = "SOCIAL",             // SW quadrant | Pink/magenta venues, nightlife
  DEFI = "DEFI",                 // SE quadrant | Green data centers, brutalist
  RESIDENTIAL = "RESIDENTIAL",   // Middle ring | Violet hives, housing
  DAO = "DAO",                   // Center 4×4  | Purple/gold plaza, governance
  PUBLIC = "PUBLIC"              // Parks, streets, shared spaces
}

export enum BusinessSector {
  RETAIL = "retail",
  ENTERTAINMENT = "entertainment",
  SERVICES = "services",
  GAMING = "gaming",
  FOOD_BEVERAGE = "food_beverage",
  NIGHTLIFE = "nightlife",
  TECHNOLOGY = "technology"
}

export enum BusinessStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  EXPIRED = "expired",
  UNDER_CONSTRUCTION = "under_construction"
}

export enum DAOPurpose {
  GOVERNANCE_HQ = "governance_hq",
  PUBLIC_PARK = "public_park",
  COMMUNITY_CENTER = "community_center",
  TREASURY_ASSET = "treasury_asset",
  EVENT_VENUE = "event_venue"
}

// ========== INTERFACES ==========

/**
 * Parcel - Core land NFT entity
 * Matches LandRegistry.sol Parcel struct
 */
export interface Parcel {
  // ========== IDS & IDENTIFICATION ==========
  parcelId: string;                    // Format: "VOID-GENESIS-0" to "VOID-GENESIS-1599"
  tokenId: number;                     // ERC-721 token ID
  gridIndex: number;                   // 0-1599 for genesis (gridY * 40 + gridX)
  
  // ========== MULTI-REGION SUPPORT ==========
  worldId: string;                     // "VOID", "AGENCY", "PARTNER-NIKE"
  regionId: string;                    // "VOID-GENESIS", "VOID-EXPANSION-1"
  
  // ========== GRID COORDINATES ==========
  gridX: number;                       // 0-39 (for 40×40 genesis)
  gridY: number;                       // 0-39
  layerZ?: number;                     // 0 = ground (future: underground/sky layers)
  
  // ========== TIER & DISTRICT SYSTEM ==========
  tier: TierType;                      // CORE/RING/FRONTIER (affects pricing)
  district: DistrictType;              // GAMING/BUSINESS/SOCIAL/DEFI/RESIDENTIAL/DAO/PUBLIC
  zone: ZoneType;                      // Legacy compatibility (PUBLIC/RESIDENTIAL/COMMERCIAL/PREMIUM/GLIZZY_WORLD)
  
  // ========== OWNERSHIP ==========
  owner: Address | null;               // Current owner (wallet or contract)
  status: ParcelStatus;                // OWNED, FOR_SALE, DAO_OWNED, etc.
  
  // ========== SCARCITY BONUSES ==========
  isFounderPlot: boolean;              // Founder-reserved plots (2x scarcity multiplier)
  isCornerLot: boolean;                // Corner parcels (1.2x scarcity multiplier)
  isMainStreet: boolean;               // Main street adjacency (1.15x scarcity multiplier)
  
  // ========== PRICING ==========
  basePrice: bigint;                   // Calculated: Base × Tier × District × Scarcity
  currentPrice: bigint;                // If for sale
  lastSalePrice: bigint;               // Historical data
  
  // ========== MARKETPLACE ==========
  listedForSale: boolean;
  salePrice: bigint | null;
  listingCurrency?: Address;           // VOID token address
  listedAt?: Date;
  
  // ========== BUILDING DATA ==========
  building: Building | null;           // Linked building entity
  maxBuildingHeight: number;           // Max floors allowed (tier-based)
  hasHouse: boolean;                   // Legacy compatibility
  
  // ========== BUSINESS LICENSE ==========
  businessLicense: LicenseType;
  businessRevenue: bigint;
  
  // ========== METADATA ==========
  metadata?: ParcelMetadata;
  
  // ========== ACTIVITY TRACKING ==========
  ownershipHistory: Address[];
  acquiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParcelMetadata {
  rarity?: string;                     // "common", "rare", "premium"
  traits?: string[];                   // ["corner-lot", "main-street", "waterfront"]
  description?: string;
  image?: string;                      // Thumbnail/preview
}

/**
 * Building - 3D visual representation
 */
export interface Building {
  buildingId: string;                  // UUID or "parcel-{parcelId}"
  parcelId: number;                    // Links back to Parcel
  
  // Architecture Type
  archetype: BuildingArchetype;
  visualVariant: number;               // 0-N variants per archetype
  
  // Dimensions
  heightClass: HeightClass;
  floors: number;                      // 10-100 floors
  baseWidth: number;                   // Width in world units
  baseDepth: number;                   // Depth in world units
  totalHeight: number;                 // Height in world units
  
  // Visual Features
  hasBalconies: boolean;
  hasPaneling: boolean;
  hasVents: boolean;
  hasDataScreens: boolean;
  hasRooftopFeatures: boolean;
  verticalFeatures: string[];          // ["spire", "landing_pad", "observation_deck"]
  
  // Materials & Lighting
  colorScheme: BuildingColorScheme;
  lightingDensity: number;             // 0-1 (window coverage)
  decayLevel: number;                  // 0-1 (pristine to deteriorated)
  
  // Ownership Visualization
  ownershipIndicator: OwnershipIndicator;
  
  // Business Branding (if businessLicense != NONE)
  branding?: BusinessBranding;
  
  // Metadata
  createdAt: Date;
  lastUpdated: Date;
  meshId?: string;                     // Babylon.js mesh ID
}

export interface BuildingColorScheme {
  base: string;                        // Hex color
  accent: string;                      // Neon/light color
  secondary?: string;
}

export interface OwnershipIndicator {
  enabled: boolean;
  type: 'hologram' | 'banner' | 'outline' | 'rooftop-beam';
  color: string;                       // Cyan for FOR_SALE, white for OWNED, purple for DAO
  animation?: string;                  // "pulse", "rotate", "flicker"
}

export interface BusinessBranding {
  businessName: string;
  logoUrl?: string;
  signColor: string;
  signPosition: 'facade' | 'rooftop' | 'entrance';
}

/**
 * Business - Commerce layer
 */
export interface Business {
  businessId: string;                  // UUID
  ownerAddress: Address;
  
  // License & Type
  licenseType: LicenseType;
  sector: BusinessSector;
  
  // Location
  linkedParcelIds: number[];           // Can own multiple adjacent parcels
  primaryParcelId: number;
  buildingIds: string[];               // Buildings occupied
  
  // Branding
  brandName: string;
  tagline?: string;
  logoUrl?: string;
  brandColors: {
    primary: string;
    secondary: string;
  };
  
  // Status & Performance
  status: BusinessStatus;
  openedAt: Date;
  totalRevenue: bigint;
  monthlyRevenue: bigint;
  customerCount?: number;
  
  // Integration with Game Systems
  features?: BusinessFeatures;
  
  // Revenue Splits (from V4 Hooks)
  revenueDistribution: RevenueDistribution;
}

export interface BusinessFeatures {
  hasJukebox?: boolean;                // Music system
  hasCasino?: boolean;                 // Gaming
  hasRetail?: boolean;                 // SKU sales
  hasTipping?: boolean;                // Social features
}

export interface RevenueDistribution {
  toOwner: bigint;                     // 80% of business revenue
  toParcelOwners?: bigint;             // If renting
  toEcosystem: bigint;                 // 20% via hooks
}

/**
 * SKU - Stock Keeping Unit (Product/Service)
 */
export interface SKU {
  skuId: string;                       // UUID or tokenId
  tokenId?: number;                    // ERC-1155 token ID
  
  // Ownership
  businessId: string;                  // Linked business
  creatorAddress: Address;
  
  // Product Info
  name: string;
  description: string;
  category: SKUCategory;
  
  // Pricing & Supply
  price: bigint;                       // In VOID or ETH
  currency: 'VOID' | 'ETH';
  maxSupply: number;                   // Total cap
  currentSupply: number;               // Minted so far
  availableStock: number;              // Not yet sold
  
  // Media
  imageUrl?: string;
  animationUrl?: string;
  externalUrl?: string;
  
  // Metadata
  attributes?: SKUAttribute[];
  
  // Sales Data
  totalSales: number;
  totalRevenue: bigint;
  
  // Status
  isActive: boolean;
  isLimitedEdition: boolean;
  
  // Timestamps
  createdAt: Date;
  lastSaleAt?: Date;
}

export enum SKUCategory {
  VIRTUAL_ITEM = "virtual_item",       // In-game items, cosmetics
  DIGITAL_CONTENT = "digital_content", // Music, art, media
  SERVICE = "service",                 // Access passes, subscriptions
  PHYSICAL = "physical",               // Real-world goods (future)
  COLLECTIBLE = "collectible"          // Limited edition NFTs
}

export interface SKUAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date';
}

/**
 * DAO Parcel - Community-owned land
 */
export interface DAOParcel {
  parcelId: number;
  daoContract: Address;
  daoName: string;
  purpose: DAOPurpose;
  
  // Governance
  governanceToken?: Address;
  votingPower?: Map<Address, number>;
  proposalCount?: number;
  
  // Special Flags
  isPublicSpace: boolean;              // Park, plaza, community center
  isTreasuryLand: boolean;             // Held as asset
  isGovernanceZone: boolean;           // DAO HQ
  
  // Visual Treatment
  specialMarker: SpecialMarker;
}

export interface SpecialMarker {
  color: string;                       // Purple/gold for DAO
  icon: string;                        // DAO logo
  animation: string;                   // Special effects
}

/**
 * World Coordinate - Expansion-ready coordinate system
 */
export interface WorldCoordinate {
  worldId: string;                     // "VOID-1", "VOID-2", "GLIZZY-WORLD", etc.
  regionId?: string;                   // "downtown", "residential-north", etc.
  gridX: number;                       // 0-99 (current), expandable
  gridY: number;                       // 0-99 (current), expandable
  layerZ: number;                      // 0=ground, -1=underground, 1,2,3=sky levels
}

/**
 * District - Themed area grouping
 */
export interface District {
  id: string;
  name: string;
  zone: ZoneType;
  parcels: number[];
  features: DistrictFeatures;
  theme: DistrictTheme;
}

export interface DistrictFeatures {
  hasStreets: boolean;
  hasSidewalks: boolean;
  hasParkSpace: boolean;
  hasWaterways: boolean;
  hasPublicTransport: boolean;
}

export interface DistrictTheme {
  colorPalette: string[];
  architecturalStyle: string;
  lightingStyle: string;
  density: 'low' | 'medium' | 'high' | 'ultra';
}

// ========== CONSTANTS ==========

export const LAND_CONSTANTS = {
  GRID_SIZE: 40,  // Genesis region: 40×40 grid
  TOTAL_PARCELS: 1600,  // Genesis region: 1,600 parcels
  PARCEL_SIZE_WORLD_UNITS: 40,
  GLIZZY_WORLD_PSX_REQUIREMENT: 100_000n,
  
  ZONE_PRICES: {
    [ZoneType.PUBLIC]: 100n,
    [ZoneType.RESIDENTIAL]: 200n,
    [ZoneType.COMMERCIAL]: 300n,
    [ZoneType.PREMIUM]: 500n,
    [ZoneType.GLIZZY_WORLD]: 1000n,
  },
  
  LICENSE_PRICES: {
    [LicenseType.RETAIL]: 50n,
    [LicenseType.ENTERTAINMENT]: 75n,
    [LicenseType.SERVICES]: 50n,
    [LicenseType.GAMING]: 100n,
  },
  
  REVENUE_SPLIT: {
    TO_OWNER: 80, // 80% to parcel owner
    TO_ECOSYSTEM: 20, // 20% to ecosystem via V4 hooks
  },
} as const;

// ========== MULTI-REGION EXPANSION SYSTEM ==========

/**
 * World - Top-level container for regions
 * Examples: VOID (ecosystem), AGENCY (partner), PARTNER-NIKE (brand collab)
 */
export interface World {
  worldId: string;                     // "VOID", "AGENCY", "PARTNER-NIKE"
  name: string;                        // Display name
  description: string;
  
  // Ownership
  ownerAddress: Address;               // Ecosystem, partner, or creator
  ownerType: 'ecosystem' | 'partner' | 'creator';
  
  // Regions
  regionCount: number;
  genesisRegionId: string;             // First region (e.g., "VOID-GENESIS")
  
  // Economics
  treasuryAddress: Address;
  creatorRoyalty: number;              // % of sales (0-100)
  ecosystemRoyalty: number;            // % of sales (0-100)
  founderBenefits: boolean;            // Apply founder perks?
  
  // Metadata
  theme: string;                       // "cyberpunk-metropolis", "fantasy-realm"
  logo: string;                        // IPFS or URL
  website?: string;
  
  // Status
  status: 'active' | 'paused' | 'deprecated';
  launchDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Region - 40×40 (or variable) grid within a World
 * Genesis = 40×40 (1,600 parcels), expansions can be any size
 */
export interface Region {
  regionId: string;                    // "VOID-GENESIS", "VOID-EXPANSION-1"
  worldId: string;                     // Parent world
  
  // Grid Specs
  gridWidth: number;                   // 40 for genesis, variable for expansions
  gridHeight: number;                  // 40 for genesis
  totalParcels: number;                // gridWidth × gridHeight
  
  // World Positioning
  worldPosition: {
    offsetX: number;                   // X offset in global world space
    offsetZ: number;                   // Z offset in global world space
  };
  
  // Status
  status: 'active' | 'minting' | 'planned' | 'deprecated';
  mintCampaignId?: string;             // If currently minting
  
  // Ownership
  creatorAddress?: Address;            // If creator-owned region
  
  // Metadata
  name: string;
  description: string;
  theme: string;
  
  // Timestamps
  launchDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ExpansionCampaign - Minting campaign for new regions
 */
export interface ExpansionCampaign {
  campaignId: string;                  // "VOID-EXP-1-CAMPAIGN"
  regionId: string;                    // Region being minted
  worldId: string;
  
  // Campaign Info
  name: string;                        // "Neon District Expansion"
  description: string;
  theme: string;                       // "cyberpunk-venice"
  
  // Supply
  totalParcels: number;
  parcelsAvailable: number;
  parcelsMinted: number;
  
  // Timing
  startDate: Date;
  endDate: Date;
  phases: MintPhase[];                 // Whitelist, founder early access, public
  
  // Pricing
  pricingModel: 'flat' | 'linear' | 'bonding';
  basePrice: bigint;                   // Starting price in VOID
  currentPrice: bigint;                // Current price (if bonding curve)
  
  // Governance
  approvedBy: Address;                 // DAO multisig or governance contract
  daoProposalId?: string;
  votesFor: bigint;
  votesAgainst: bigint;
  
  // Restrictions
  whitelist?: Address[];               // Whitelisted wallets
  maxPerWallet: number;                // Max parcels per wallet
  requiresFounderStatus: boolean;      // Must be founder?
  
  // Status
  status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MintPhase - Time-gated mint windows with different pricing/access
 */
export interface MintPhase {
  phaseId: string;
  name: string;                        // "Founder Early Access", "Public Sale"
  
  // Timing
  startDate: Date;
  endDate: Date;
  
  // Supply
  maxMints: number;                    // Max parcels in this phase
  mintedCount: number;                 // Current count
  
  // Pricing
  priceMultiplier: number;             // 0.8 = 20% discount, 1.0 = base price
  
  // Access Control
  eligibility: 'founders' | 'whitelist' | 'public';
  eligibleAddresses?: Address[];
  
  // Status
  status: 'upcoming' | 'active' | 'completed';
}

