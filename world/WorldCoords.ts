/**
 * VOID PROTOCOL - WORLD COORDINATE SYSTEM
 * 
 * Converts between:
 * - 3D world coordinates (Three.js x, z within CITY_BOUNDS)
 * - Parcel grid coordinates (0-39, 0-39)
 * - Parcel IDs (0-1599)
 * - District assignments
 * 
 * UNIFIED WITH CITY_BOUNDS:
 * - CITY_BOUNDS: X [-300, 300], Z [-120, 120]
 * - Parcel grid: 40×40 = 1600 parcels
 * - PARCEL_SIZE: 40 world units (matches CybercityWorld rendering)
 * - Parcel extent: 1600 units (40 × 40)
 * 
 * Parcel grid fills CITY_BOUNDS via parcelToCityWorld() transforms
 * 
 * ═══════════════════════════════════════════════════════════════
 * 🔧 EXPANSION GUIDE — How to Scale to More Parcels
 * ═══════════════════════════════════════════════════════════════
 * 
 * To increase total parcels (e.g., 40×40 → 50×50 or 60×60):
 * 
 * 1. Change GRID_SIZE and MAX_PARCELS constants below:
 *    export const GRID_SIZE = 50;           // Was 40
 *    export const MAX_PARCELS = 2500;       // Was 1600 (50 × 50)
 * 
 * 2. That's it! All coordinate transforms use these constants:
 *    - coordsToParcelId() uses GRID_SIZE for row calculation
 *    - parcelIdToCoords() uses GRID_SIZE for grid mapping
 *    - parcelToCityWorld() normalizes via GRID_SIZE
 *    - cityWorldToParcel() scales via GRID_SIZE
 * 
 * 3. DO NOT hardcode parcel counts anywhere else in the codebase.
 *    Real estate, HUD, spawn system all scale automatically.
 * 
 * 4. For non-square grids (e.g., 50×40), refactor to use:
 *    GRID_COLS and GRID_ROWS instead of single GRID_SIZE.
 * 
 * ⚠️ WARNING: Do NOT modify transform function logic unless you
 *             understand the entire coordinate system flow.
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import { CITY_BOUNDS } from '@/lib/city-assets';
import type { DistrictId } from './map/districts';

export const GRID_SIZE = 40;        // ← CHANGE THIS to expand grid (e.g., 50, 60)
export const MAX_PARCELS = 1600;    // ← CHANGE THIS to GRID_SIZE × GRID_SIZE
export const PARCEL_SIZE = 40;      // world units per parcel (matches CybercityWorld)

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
  district: DistrictId;
  center: WorldPosition;
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
 * ============================================================================
 * UNIFIED CITY ↔ PARCEL TRANSFORMS
 * ============================================================================
 * 
 * Maps the 40×40 parcel grid into CITY_BOUNDS (-300→300 X, -120→120 Z)
 * This is the CANONICAL transform - all other systems use this.
 */

/**
 * Convert parcel grid coordinates (0-39) to CITY_BOUNDS world position
 * Parcels are evenly distributed across CITY_BOUNDS
 */
export function parcelToCityWorld(coords: ParcelCoords): WorldPosition {
  const { minX, maxX, minZ, maxZ } = CITY_BOUNDS;
  
  // Normalize parcel coords to 0-1
  const u = (coords.x + 0.5) / GRID_SIZE; // center of parcel
  const v = (coords.z + 0.5) / GRID_SIZE;
  
  // Map to CITY_BOUNDS
  const x = minX + u * (maxX - minX);
  const z = minZ + v * (maxZ - minZ);
  
  return { x, z };
}

/**
 * Convert CITY_BOUNDS world position to parcel grid coordinates
 */
export function cityWorldToParcel(worldPos: WorldPosition): ParcelCoords {
  const { minX, maxX, minZ, maxZ } = CITY_BOUNDS;
  
  // Clamp to CITY_BOUNDS
  const clampedX = Math.max(minX, Math.min(maxX - 0.01, worldPos.x));
  const clampedZ = Math.max(minZ, Math.min(maxZ - 0.01, worldPos.z));
  
  // Normalize to 0-1
  const u = (clampedX - minX) / (maxX - minX);
  const v = (clampedZ - minZ) / (maxZ - minZ);
  
  // Map to grid coords
  const x = Math.floor(u * GRID_SIZE);
  const z = Math.floor(v * GRID_SIZE);
  
  return {
    x: Math.max(0, Math.min(GRID_SIZE - 1, x)),
    z: Math.max(0, Math.min(GRID_SIZE - 1, z)),
  };
}

/**
 * LEGACY: Convert parcel coords to local parcel space (0-1600 range)
 * Used internally for parcel-relative calculations only
 * DO NOT use for rendering - use parcelToCityWorld instead
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
 * Layout (aligned with new 9-district system):
 * - Uses parcelToCityWorld to map to CITY_BOUNDS
 * - Then checks against new district boundaries
 * - Falls back to legacy 4-district quadrants for compatibility
 */
/**
 * Get district for given parcel coordinates
 * Maps old 4-quadrant system to new 9-district system
 * OLD: lowercase ("defi", "dao", etc.) → NEW: uppercase ("DEFI", "DAO", etc.)
 */
export function getDistrict(coords: ParcelCoords): DistrictId {
  const midPoint = GRID_SIZE / 2;

  if (coords.x < midPoint && coords.z >= midPoint) {
    return 'DEFI';      // Was "defi" - SE quadrant
  }
  if (coords.x >= midPoint && coords.z >= midPoint) {
    return 'CREATOR';   // Was "creator" - NE quadrant
  }
  if (coords.x < midPoint && coords.z < midPoint) {
    return 'DAO';       // Was "dao" - SW quadrant
  }
  if (coords.x >= midPoint && coords.z < midPoint) {
    return 'AI';        // Was "ai" - NW quadrant
  }

  return 'HQ';          // Was "neutral" - Center/default
}

/**
 * Get full parcel information from CITY_BOUNDS world position
 * THIS IS THE CANONICAL FUNCTION - use this for all player position tracking
 */
export function getParcelInfo(worldPos: WorldPosition): ParcelInfo {
  const coords = cityWorldToParcel(worldPos); // Use CITY transform
  const id = coordsToParcelId(coords);
  const district = getDistrict(coords);
  const center = parcelToCityWorld(coords); // Use CITY transform

  return { id, coords, district, center };
}

/**
 * PHASE 5.1: Convert parcel ID directly to CITY_BOUNDS world position
 * Used for home parcel spawn system
 * 
 * @param parcelId - Parcel ID (0-1599)
 * @param districtId - Optional district ID (unused for now, reserved for validation)
 * @returns World position in CITY_BOUNDS coordinates with Y=1 for spawn
 */
export function parcelIdToWorldCoords(parcelId: number, districtId?: string): { x: number; y: number; z: number } | null {
  try {
    // Convert parcel ID to grid coords
    const coords = parcelIdToCoords(parcelId);
    
    // Convert grid coords to city world position (center of parcel)
    const worldPos = parcelToCityWorld(coords);
    
    // Return with Y=1 for spawn height
    return {
      x: worldPos.x,
      y: 1, // Spawn height above ground
      z: worldPos.z,
    };
  } catch (err) {
    console.error(`[WorldCoords] Failed to convert parcel ${parcelId} to world coords:`, err);
    return null;
  }
}

/**
 * Check if two world positions are in the same parcel
 */
export function isSameParcel(pos1: WorldPosition, pos2: WorldPosition): boolean {
  const parcel1 = cityWorldToParcel(pos1);
  const parcel2 = cityWorldToParcel(pos2);
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
 * LEGACY: Parcel-local extent (internal use only)
 * DO NOT use for rendering - use CITY_BOUNDS instead
 */
export const WORLD_EXTENT = GRID_SIZE * PARCEL_SIZE; // 40 * 40 = 1600

/**
 * DEPRECATED: Use worldToMinimap from world/map/mapUtils.ts instead
 * This function uses legacy coordinate system
 */
export function worldPosToPercent(worldPos: WorldPosition) {
  // For legacy compatibility - map CITY_BOUNDS to percent
  const { minX, maxX, minZ, maxZ } = CITY_BOUNDS;
  
  const clampedX = Math.max(minX, Math.min(maxX, worldPos.x));
  const clampedZ = Math.max(minZ, Math.min(maxZ, worldPos.z));
  
  const xPct = ((clampedX - minX) / (maxX - minX)) * 100;
  const zPct = ((clampedZ - minZ) / (maxZ - minZ)) * 100;

  return { xPct, zPct };
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
