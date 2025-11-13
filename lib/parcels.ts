/**
 * VOID METAVERSE - PARCEL & DISTRICT SYSTEM
 * 
 * THREE-TIER STRUCTURE:
 * - CORE: Central high-value zone (premium location, high traffic)
 * - RING: Middle belt (balanced price/location)
 * - FRONTIER: Outer experimental zone (low price, high risk/reward)
 * 
 * FIVE DISTRICT TYPES:
 * - GAMING: Casinos, arcades, entertainment
 * - BUSINESS: Commerce, offices, creator hubs
 * - SOCIAL: Plazas, events, community
 * - DEFI: DEX terminals, staking, vaults
 * - RESIDENTIAL: Housing, storage, personal spaces
 */

export type ParcelTier = 'CORE' | 'RING' | 'FRONTIER'
export type DistrictType = 'GAMING' | 'BUSINESS' | 'SOCIAL' | 'DEFI' | 'RESIDENTIAL'
export type DexRole = 
  | 'SWAP_HUB'           // Main DEX trading terminals
  | 'STAKING_ZONE'       // LP and staking pools
  | 'EXPERIMENTAL_LAUNCH' // Frontier meme token launches
  | 'VAULT_DISTRICT'     // Asset management and vaults
  | 'NONE'               // Non-DeFi districts

export interface Parcel {
  id: string
  gridX: number
  gridZ: number
  worldX: number // Actual 3D position
  worldZ: number // Actual 3D position
  tier: ParcelTier
  district: string // References District.id
  districtType: DistrictType
  available: boolean
  price: number // In VOID tokens
  owner?: string
}

export interface District {
  id: string
  name: string
  type: DistrictType
  tier: ParcelTier
  color: string
  description: string
  dexRole: DexRole
  
  // Spatial boundaries
  centerX: number
  centerZ: number
  radius: number // For radial districts
  
  // Parcel info
  parcelIds: string[]
  totalParcels: number
  
  // Building placement zones (for asset positioning)
  buildingZones: {
    type: 'landmark' | 'high-rise' | 'mid-rise' | 'low-rise'
    x: number
    z: number
  }[]
  
  // Requirements
  requirements?: {
    minLevel?: number
    token?: string
    staked?: number
  }
}

/**
 * CORE TIER DISTRICTS (Inner Circle - Radius ~50-80 units from origin)
 */
export const CORE_DISTRICTS: District[] = [
  {
    id: 'core-business',
    name: 'PSX Central',
    type: 'BUSINESS',
    tier: 'CORE',
    color: '#06FFA5',
    description: 'Primary business district. Home to PSX HQ and major creator agencies.',
    dexRole: 'NONE',
    centerX: 0,
    centerZ: 0,
    radius: 50,
    parcelIds: [],
    totalParcels: 16,
    buildingZones: [
      { type: 'landmark', x: 0, z: 0 }, // PSX HQ
      { type: 'high-rise', x: 25, z: 0 },
      { type: 'high-rise', x: -25, z: 0 },
      { type: 'high-rise', x: 0, z: 25 },
      { type: 'high-rise', x: 0, z: -25 },
    ]
  },
  {
    id: 'core-defi',
    name: 'DeFi Core',
    type: 'DEFI',
    tier: 'CORE',
    color: '#8B5CF6',
    description: 'Main DEX terminal and swap hub. Primary liquidity pools.',
    dexRole: 'SWAP_HUB',
    centerX: 60,
    centerZ: -40,
    radius: 40,
    parcelIds: [],
    totalParcels: 12,
    buildingZones: [
      { type: 'landmark', x: 60, z: -40 }, // DeFi Tower
      { type: 'high-rise', x: 75, z: -40 },
      { type: 'high-rise', x: 60, z: -55 },
    ]
  },
  {
    id: 'core-gaming',
    name: 'Casino District',
    type: 'GAMING',
    tier: 'CORE',
    color: '#FF006E',
    description: 'Premium gaming and entertainment. High-stakes casino and arcade.',
    dexRole: 'NONE',
    centerX: -60,
    centerZ: -60,
    radius: 40,
    parcelIds: [],
    totalParcels: 12,
    buildingZones: [
      { type: 'landmark', x: -60, z: -60 }, // Casino
      { type: 'high-rise', x: -75, z: -60 },
    ]
  },
]

/**
 * RING TIER DISTRICTS (Middle Belt - Radius ~100-150 units)
 */
export const RING_DISTRICTS: District[] = [
  {
    id: 'ring-social',
    name: 'Social Plaza',
    type: 'SOCIAL',
    tier: 'RING',
    color: '#10B981',
    description: 'Community gathering spaces and event venues.',
    dexRole: 'NONE',
    centerX: -50,
    centerZ: 70,
    radius: 45,
    parcelIds: [],
    totalParcels: 20,
    buildingZones: [
      { type: 'landmark', x: -50, z: 70 }, // Signals Plaza
      { type: 'mid-rise', x: -65, z: 70 },
      { type: 'mid-rise', x: -50, z: 85 },
    ]
  },
  {
    id: 'ring-residential',
    name: 'Housing District',
    type: 'RESIDENTIAL',
    tier: 'RING',
    color: '#3B82F6',
    description: 'Residential apartments and creator studios.',
    dexRole: 'NONE',
    centerX: 80,
    centerZ: 60,
    radius: 45,
    parcelIds: [],
    totalParcels: 24,
    buildingZones: [
      { type: 'landmark', x: 80, z: 60 }, // Creator Hub
      { type: 'mid-rise', x: 95, z: 60 },
      { type: 'mid-rise', x: 80, z: 75 },
      { type: 'mid-rise', x: 65, z: 60 },
    ]
  },
  {
    id: 'ring-defi-staking',
    name: 'Staking Ring',
    type: 'DEFI',
    tier: 'RING',
    color: '#A78BFA',
    description: 'LP farming and staking pools. Medium risk/reward.',
    dexRole: 'STAKING_ZONE',
    centerX: 120,
    centerZ: -90,
    radius: 40,
    parcelIds: [],
    totalParcels: 16,
    buildingZones: [
      { type: 'mid-rise', x: 120, z: -90 },
      { type: 'mid-rise', x: 135, z: -90 },
    ]
  },
  {
    id: 'ring-business',
    name: 'Commercial Strip',
    type: 'BUSINESS',
    tier: 'RING',
    color: '#F59E0B',
    description: 'Mid-tier business district. Shops and services.',
    dexRole: 'NONE',
    centerX: -120,
    centerZ: -30,
    radius: 40,
    parcelIds: [],
    totalParcels: 16,
    buildingZones: [
      { type: 'mid-rise', x: -120, z: -30 },
      { type: 'mid-rise', x: -135, z: -30 },
    ]
  },
]

/**
 * FRONTIER TIER DISTRICTS (Outer Belt - Radius ~180+ units)
 */
export const FRONTIER_DISTRICTS: District[] = [
  {
    id: 'frontier-experimental',
    name: 'Experimental Zone',
    type: 'DEFI',
    tier: 'FRONTIER',
    color: '#EC4899',
    description: 'High-risk experimental token launches and meme pools.',
    dexRole: 'EXPERIMENTAL_LAUNCH',
    centerX: -180,
    centerZ: 120,
    radius: 50,
    parcelIds: [],
    totalParcels: 32,
    buildingZones: [
      { type: 'low-rise', x: -180, z: 120 },
      { type: 'low-rise', x: -195, z: 120 },
      { type: 'low-rise', x: -180, z: 135 },
    ]
  },
  {
    id: 'frontier-industrial',
    name: 'Industrial Outskirts',
    type: 'BUSINESS',
    tier: 'FRONTIER',
    color: '#64748B',
    description: 'Warehouses and production facilities.',
    dexRole: 'NONE',
    centerX: 180,
    centerZ: 130,
    radius: 50,
    parcelIds: [],
    totalParcels: 32,
    buildingZones: [
      { type: 'low-rise', x: 180, z: 130 },
      { type: 'low-rise', x: 195, z: 130 },
    ]
  },
  {
    id: 'frontier-gaming',
    name: 'Arcade Frontier',
    type: 'GAMING',
    tier: 'FRONTIER',
    color: '#F97316',
    description: 'Experimental gaming venues and indie arcades.',
    dexRole: 'NONE',
    centerX: 160,
    centerZ: -140,
    radius: 45,
    parcelIds: [],
    totalParcels: 28,
    buildingZones: [
      { type: 'low-rise', x: 160, z: -140 },
      { type: 'low-rise', x: 175, z: -140 },
    ]
  },
  {
    id: 'frontier-residential',
    name: 'Outer Housing',
    type: 'RESIDENTIAL',
    tier: 'FRONTIER',
    color: '#0EA5E9',
    description: 'Affordable housing on the city edge.',
    dexRole: 'NONE',
    centerX: -160,
    centerZ: -120,
    radius: 45,
    parcelIds: [],
    totalParcels: 28,
    buildingZones: [
      { type: 'low-rise', x: -160, z: -120 },
      { type: 'low-rise', x: -175, z: -120 },
    ]
  },
]

export const ALL_DISTRICTS = [
  ...CORE_DISTRICTS,
  ...RING_DISTRICTS,
  ...FRONTIER_DISTRICTS,
]

/**
 * Get district by ID
 */
export function getDistrictById(id: string): District | undefined {
  return ALL_DISTRICTS.find(d => d.id === id)
}

/**
 * Get district at world position
 */
export function getDistrictAt(x: number, z: number): District | null {
  for (const district of ALL_DISTRICTS) {
    const dx = x - district.centerX
    const dz = z - district.centerZ
    const distSq = dx * dx + dz * dz
    
    if (distSq <= district.radius * district.radius) {
      return district
    }
  }
  return null
}

/**
 * Get all districts by tier
 */
export function getDistrictsByTier(tier: ParcelTier): District[] {
  return ALL_DISTRICTS.filter(d => d.tier === tier)
}

/**
 * Get all districts by type
 */
export function getDistrictsByType(type: DistrictType): District[] {
  return ALL_DISTRICTS.filter(d => d.type === type)
}

/**
 * Get all DEX-enabled districts
 */
export function getDexDistricts(): District[] {
  return ALL_DISTRICTS.filter(d => d.dexRole !== 'NONE')
}
