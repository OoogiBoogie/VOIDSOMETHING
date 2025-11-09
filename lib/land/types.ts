/**
 * Land System - TypeScript Entity Definitions
 * 
 * Single source of truth for all land/parcel/building/business entities
 * Aligned with LandRegistry.sol contract
 */

import { Address } from 'viem';

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
  // On-Chain Data (from LandRegistry.sol)
  parcelId: number;                    // 0-9999 (100x100 grid)
  tokenId: number;                     // ERC-721 token ID (same as parcelId)
  ownerAddress: Address | null;        // Current owner (wallet or contract)
  
  // Grid Coordinates (on-chain)
  worldId: string;                     // "VOID-1" (main world)
  gridX: number;                       // 0-99
  gridY: number;                       // 0-99
  layerZ?: number;                     // 0 = ground (future: underground=-1, sky=1,2,3...)
  
  // Zone Data (on-chain)
  zone: ZoneType;
  zonePrice: bigint;                   // Base price in VOID (100-1000 VOID)
  
  // Status (derived from contract events)
  status: ParcelStatus;
  listingPrice?: bigint;               // If FOR_SALE
  listingCurrency?: Address;           // VOID token address
  listedAt?: Date;
  
  // Building Link (on-chain via hasHouse boolean + buildingId extension)
  buildingId: string | null;           // Links to Building entity
  hasHouse: boolean;                   // True if house built (from contract)
  
  // Business Data (on-chain)
  businessLicense: LicenseType;
  businessRevenue: bigint;             // Accumulated revenue (80% to owner)
  
  // Metadata (IPFS or off-chain indexed)
  metadata: ParcelMetadata;
  
  // Activity Tracking
  lastSalePrice?: bigint;
  lastSaleDate?: Date;
  previousOwners?: Address[];
  totalRevenue?: bigint;
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
  GRID_SIZE: 100,
  TOTAL_PARCELS: 10000,
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
