/**
 * VOID PROTOCOL - WORLD COORDINATE SYSTEM
 * 
 * Converts between:
 * - 3D world coordinates (Three.js x, z)
 * - Parcel grid coordinates (0-39, 0-39)
 * - Parcel IDs (0-1599)
 * - District assignments
 * 
 * Grid Layout (40x40 = 1600 parcels):
 *   z=0 (top):    Parcels 1200-1599 (DAO District left, AI District right)
 *   z=19 (mid):   Parcels 600-999
 *   z=39 (bot):   Parcels 0-399 (DeFi District left, Creator District right)
 *   
 *   x: 0 (left) → 39 (right)
 */

export const GRID_SIZE = 40;
export const MAX_PARCELS = 1600;
export const PARCEL_SIZE = 100; // meters per parcel in 3D space

export type District = 'defi' | 'creator' | 'dao' | 'ai' | 'neutral';

export interface ParcelCoords {
  x: number; // 0-39
  z: number; // 0-39
}

export interface WorldPosition {
  x: number; // 3D world coordinate
  z: number; // 3D world coordinate
}

export interface ParcelInfo {
  id: number;
  coords: ParcelCoords;
  district: District;
  center: WorldPosition;
}

/**
 * Convert 3D world position to parcel grid coordinates
 */
export function worldToParcel(worldPos: WorldPosition): ParcelCoords {
  // Clamp to grid bounds (0 to GRID_SIZE * PARCEL_SIZE)
  const maxWorld = GRID_SIZE * PARCEL_SIZE;
  const clampedX = Math.max(0, Math.min(maxWorld - 1, worldPos.x));
  const clampedZ = Math.max(0, Math.min(maxWorld - 1, worldPos.z));

  return {
    x: Math.floor(clampedX / PARCEL_SIZE),
    z: Math.floor(clampedZ / PARCEL_SIZE),
  };
}

/**
 * Convert parcel grid coordinates to parcel ID (0-1599)
 */
export function coordsToParcelId(coords: ParcelCoords): number {
  if (coords.x < 0 || coords.x >= GRID_SIZE || coords.z < 0 || coords.z >= GRID_SIZE) {
    throw new Error(`Invalid parcel coords: (${coords.x}, ${coords.z})`);
  }
  return coords.z * GRID_SIZE + coords.x;
}

/**
 * Convert parcel ID to parcel grid coordinates
 */
export function parcelIdToCoords(parcelId: number): ParcelCoords {
  if (parcelId < 0 || parcelId >= MAX_PARCELS) {
    throw new Error(`Invalid parcel ID: ${parcelId}`);
  }
  return {
    x: parcelId % GRID_SIZE,
    z: Math.floor(parcelId / GRID_SIZE),
  };
}

/**
 * Convert parcel coords to 3D world position (center of parcel)
 */
export function parcelToWorld(coords: ParcelCoords): WorldPosition {
  return {
    x: coords.x * PARCEL_SIZE + PARCEL_SIZE / 2,
    z: coords.z * PARCEL_SIZE + PARCEL_SIZE / 2,
  };
}

/**
 * Determine district based on parcel coordinates
 * 
 * Layout:
 * - Bottom-left (x < 20, z >= 20): DeFi District
 * - Bottom-right (x >= 20, z >= 20): Creator District  
 * - Top-left (x < 20, z < 20): DAO District
 * - Top-right (x >= 20, z < 20): AI District
 */
export function getDistrict(coords: ParcelCoords): District {
  const midPoint = GRID_SIZE / 2;

  if (coords.x < midPoint && coords.z >= midPoint) {
    return 'defi';
  }
  if (coords.x >= midPoint && coords.z >= midPoint) {
    return 'creator';
  }
  if (coords.x < midPoint && coords.z < midPoint) {
    return 'dao';
  }
  if (coords.x >= midPoint && coords.z < midPoint) {
    return 'ai';
  }

  return 'neutral'; // Shouldn't happen with valid coords
}

/**
 * Get full parcel information from 3D world position
 */
export function getParcelInfo(worldPos: WorldPosition): ParcelInfo {
  const coords = worldToParcel(worldPos);
  const id = coordsToParcelId(coords);
  const district = getDistrict(coords);
  const center = parcelToWorld(coords);

  return { id, coords, district, center };
}

/**
 * Check if two world positions are in the same parcel
 */
export function isSameParcel(pos1: WorldPosition, pos2: WorldPosition): boolean {
  const parcel1 = worldToParcel(pos1);
  const parcel2 = worldToParcel(pos2);
  return parcel1.x === parcel2.x && parcel1.z === parcel2.z;
}

/**
 * Get distance between two parcels (Manhattan distance)
 */
export function parcelDistance(coords1: ParcelCoords, coords2: ParcelCoords): number {
  return Math.abs(coords1.x - coords2.x) + Math.abs(coords1.z - coords2.z);
}

/**
 * Get all adjacent parcel IDs (up to 8 neighbors)
 */
export function getAdjacentParcels(parcelId: number): number[] {
  const coords = parcelIdToCoords(parcelId);
  const adjacent: number[] = [];

  for (let dz = -1; dz <= 1; dz++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dz === 0) continue; // Skip self

      const newX = coords.x + dx;
      const newZ = coords.z + dz;

      // Check bounds
      if (newX >= 0 && newX < GRID_SIZE && newZ >= 0 && newZ < GRID_SIZE) {
        adjacent.push(coordsToParcelId({ x: newX, z: newZ }));
      }
    }
  }

  return adjacent;
}

/**
 * District theme colors (matching voidTheme)
 */
export const DISTRICT_COLORS: Record<District, string> = {
  defi: '#09f0c8',     // Neon teal
  creator: '#ff3bd4',  // Neon pink
  dao: '#8f3bff',      // Neon purple
  ai: '#3b8fff',       // Neon blue
  neutral: '#888',     // Gray
};

/**
 * District names
 */
export const DISTRICT_NAMES: Record<District, string> = {
  defi: 'DeFi District',
  creator: 'Creator District',
  dao: 'DAO District',
  ai: 'AI District',
  neutral: 'Neutral Zone',
};

/**
 * World extent (total world size in 3D units)
 */
export const WORLD_EXTENT = GRID_SIZE * PARCEL_SIZE; // 40 * 100 = 4000

/**
 * Normalize a world position (x,z) into map percentages (0-100)
 * for UI minimaps.
 */
export function worldPosToPercent(worldPos: WorldPosition) {
  const maxWorld = WORLD_EXTENT;

  const clampedX = Math.max(0, Math.min(maxWorld - 1, worldPos.x));
  const clampedZ = Math.max(0, Math.min(maxWorld - 1, worldPos.z));

  return {
    xPct: (clampedX / maxWorld) * 100,
    zPct: (clampedZ / maxWorld) * 100,
  };
}

/**
 * Normalize parcel coords (0-39) into map percentages (0-100)
 */
export function parcelToPercent(coords: ParcelCoords) {
  return {
    xPct: ((coords.x + 0.5) / GRID_SIZE) * 100,
    zPct: ((coords.z + 0.5) / GRID_SIZE) * 100,
  };
}
