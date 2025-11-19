/**
 * WORLD LAYOUT - CANONICAL SOURCE OF TRUTH
 * 
 * Single source for ALL city structure (districts + buildings + landmarks)
 * Used by both:
 * - 3D world rendering (Scene3D, WorldGrid3D)
 * - HUD map overlays (VoidCityMap, ZoneMiniMap)
 * - Real estate system (parcel ownership, economy)
 * 
 * PHASE: HUD SYNC + 3D WORLD ALIGNMENT
 * 
 * ═══════════════════════════════════════════════════════════════
 * 🔧 EXPANSION GUIDE — How to Add Buildings/Landmarks
 * ═══════════════════════════════════════════════════════════════
 * 
 * To add a new landmark building:
 * 
 * 1. Append a new BuildingConfig to LANDMARK_BUILDINGS array:
 *    {
 *      id: 'your-building-id',
 *      name: 'Your Building Name',
 *      type: 'DEFI',                     // BuildingType (see below)
 *      districtId: 'DEFI',                // Must match districts.ts
 *      parcelId: 1234,                    // Optional: real estate parcel
 *      position: { x: 180, y: 0, z: 80 }, // CITY_BOUNDS coords
 *      dimensions: { width: 20, height: 30, depth: 20 },
 *      modelId: 'your_model',             // 3D asset reference
 *      landmark: true,                    // Shows on map
 *      forSale: true,                     // Can be purchased
 *      price: 100000,                     // VOID tokens
 *    }
 * 
 * 2. Both HUD and 3D world will automatically:
 *    - Show building name in RealEstatePanel (if parcelId set)
 *    - Render building marker on VoidCityMap (if landmark: true)
 *    - Spawn 3D mesh in WorldGrid3D (via LANDMARK_BUILDINGS loop)
 * 
 * 3. For procedural buildings (non-landmarks):
 *    - Add to PROCEDURAL_BUILDINGS array instead
 *    - Or import from @/lib/city-assets BUILDINGS
 * 
 * 4. Helper functions:
 *    - getBuildingForParcel(parcelId) → find building by parcel
 *    - getBuildingsInDistrict(districtId) → all buildings in district
 *    - getLandmarkBuildings() → only landmark buildings
 * 
 * ⚠️ WARNING: Ensure position coordinates are within CITY_BOUNDS
 *             and districtId matches a valid district in districts.ts
 * 
 * ═══════════════════════════════════════════════════════════════
 */

// Re-export district definitions from existing canonical source
export {
  DISTRICTS,
  getDistrictById,
  getUnlockedDistricts,
  getGridDimensions,
  type DistrictId,
  type DistrictDefinition,
} from '@/world/map/districts';

// Building type taxonomy
export type BuildingType = 
  | 'HQ'           // PSX Headquarters
  | 'DEFI'         // DeFi protocols, trading
  | 'CREATOR'      // Creator hubs, content
  | 'SOCIAL'       // Social spaces, community
  | 'AI'           // AI research, compute
  | 'DAO'          // Governance, voting
  | 'IDENTITY'     // Identity, reputation
  | 'COMMERCIAL'   // Generic commercial
  | 'RESIDENTIAL'  // Housing, personal
  | 'MIXED'        // Mixed-use
  | 'SPECIAL';     // Landmarks, unique

/**
 * Building configuration
 * Extends the existing city-assets Building type with real estate metadata
 */
export interface BuildingConfig {
  id: string;                  // Unique building identifier
  name: string;                // Display name
  type: BuildingType;          // Categorical type
  parcelId?: number;           // Optional: Real estate parcel ID if this building is a parcel
  districtId: string;          // Which district this belongs to
  
  // 3D world position (CITY_BOUNDS coordinates)
  position: {
    x: number;
    y: number;                 // Usually 0 (ground level)
    z: number;
  };
  
  // 3D dimensions
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  
  // Visual properties
  modelId?: string;            // Reference to 3D asset (if custom model)
  color?: string;              // Hex color for procedural buildings
  
  // Real estate properties
  forSale?: boolean;           // Can be purchased
  price?: number;              // Market price (in VOID tokens)
  
  // Special flags
  locked?: boolean;            // Not accessible yet
  landmark?: boolean;          // Important POI
}

/**
 * LANDMARK BUILDINGS (Special 3D models + real estate parcels)
 * These are the main buildings with custom models that also serve as real estate
 */
export const LANDMARK_BUILDINGS: BuildingConfig[] = [
  // PSX HQ - Central landmark
  {
    id: 'psx-hq',
    name: 'PSX Headquarters',
    type: 'HQ',
    districtId: 'HQ',
    position: { x: -30, y: 0, z: -65 },
    dimensions: { width: 18, height: 28, depth: 18 },
    modelId: 'psx_hq_tower',
    landmark: true,
    forSale: false,
  },
  
  // Glizzy World Casino - Social district landmark
  {
    id: 'glizzy-world-casino',
    name: 'Glizzy World Casino',
    type: 'SOCIAL',
    districtId: 'SOCIAL',
    position: { x: 0, y: 0, z: 60 },
    dimensions: { width: 24, height: 22, depth: 24 },
    modelId: 'glizzy_casino',
    landmark: true,
    forSale: false,
  },
  
  // Creator Hub - Creator district landmark
  {
    id: 'creator-hub',
    name: 'Creator Hub',
    type: 'CREATOR',
    districtId: 'CREATOR',
    position: { x: 150, y: 0, z: 0 },
    dimensions: { width: 20, height: 24, depth: 20 },
    modelId: 'creator_hub',
    landmark: true,
    forSale: false,
  },
  
  // Signals Plaza - AI district landmark
  {
    id: 'signals-plaza',
    name: 'Signals Plaza',
    type: 'AI',
    districtId: 'AI',
    position: { x: 0, y: 0, z: -80 },
    dimensions: { width: 22, height: 20, depth: 22 },
    modelId: 'signals_plaza',
    landmark: true,
    forSale: false,
  },
  
  // DeFi District Tower - DeFi district landmark
  {
    id: 'defi-tower',
    name: 'DeFi Tower',
    type: 'DEFI',
    districtId: 'DEFI',
    position: { x: 180, y: 0, z: 80 },
    dimensions: { width: 18, height: 32, depth: 18 },
    modelId: 'defi_tower',
    landmark: true,
    forSale: false,
  },
  
  // Social District Plaza - Secondary social landmark
  {
    id: 'social-plaza',
    name: 'Social Plaza',
    type: 'SOCIAL',
    districtId: 'SOCIAL',
    position: { x: -40, y: 0, z: 75 },
    dimensions: { width: 16, height: 16, depth: 16 },
    modelId: 'social_plaza',
    landmark: true,
    forSale: false,
  },
];

/**
 * PROCEDURAL BUILDINGS (Generated from city-assets.ts)
 * These are the generic buildings that fill out the cityscape
 * 
 * NOTE: In production, import from @/lib/city-assets BUILDINGS
 * and transform to this format. For now, just placeholder.
 */
export const PROCEDURAL_BUILDINGS: BuildingConfig[] = [
  // Example: Commercial building in northwest
  {
    id: 'nw-commercial-1',
    name: 'Northwest Tower 1',
    type: 'COMMERCIAL',
    districtId: 'DAO',
    position: { x: -85, y: 0, z: -65 },
    dimensions: { width: 14, height: 22, depth: 14 },
    color: '#0f0f1a',
    forSale: true,
    price: 50000,
  },
  // ... more buildings would be imported/transformed from city-assets.ts
];

/**
 * ALL BUILDINGS (Landmarks + Procedural)
 */
export const BUILDINGS: BuildingConfig[] = [
  ...LANDMARK_BUILDINGS,
  ...PROCEDURAL_BUILDINGS,
];

/**
 * Get building by ID
 */
export function getBuildingById(id: string): BuildingConfig | undefined {
  return BUILDINGS.find(b => b.id === id);
}

/**
 * Get building for a real estate parcel
 */
export function getBuildingForParcel(parcelId: number): BuildingConfig | undefined {
  return BUILDINGS.find(b => b.parcelId === parcelId);
}

/**
 * Get all buildings in a district
 */
export function getBuildingsInDistrict(districtId: string): BuildingConfig[] {
  return BUILDINGS.filter(b => b.districtId === districtId);
}

/**
 * Get all landmark buildings
 */
export function getLandmarkBuildings(): BuildingConfig[] {
  return BUILDINGS.filter(b => b.landmark);
}

/**
 * Get all purchasable buildings
 */
export function getPurchasableBuildings(): BuildingConfig[] {
  return BUILDINGS.filter(b => b.forSale && !b.locked);
}
