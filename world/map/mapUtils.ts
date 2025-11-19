/**
 * MAP UTILITIES
 * Coordinate transforms and spatial queries for The Void navigation system
 */

import { DISTRICTS, DistrictDefinition } from './districts';
import { CITY_BOUNDS } from '@/lib/city-assets';

/**
 * WORLD BOUNDS
 * Derived from CITY_BOUNDS - the canonical physical world extent
 * All navigation/map systems use this as the single source of truth
 */
export const WORLD_BOUNDS = {
  minX: CITY_BOUNDS.minX,
  maxX: CITY_BOUNDS.maxX,
  minZ: CITY_BOUNDS.minZ,
  maxZ: CITY_BOUNDS.maxZ,
};

/**
 * Convert world coordinates to normalized map coordinates [0, 1]
 * u = horizontal (0 = west, 1 = east)
 * v = vertical (0 = north, 1 = south) - flipped so north is top
 */
export function worldToMinimap(x: number, z: number): { u: number; v: number } {
  const { minX, maxX, minZ, maxZ } = WORLD_BOUNDS;
  const u = (x - minX) / (maxX - minX); // 0–1 horizontally
  const v = 1 - (z - minZ) / (maxZ - minZ); // 0–1 vertically (flip so top is north)
  return { u, v };
}

/**
 * Convert normalized map coordinates back to world coordinates
 */
export function minimapToWorld(u: number, v: number): { x: number; z: number } {
  const { minX, maxX, minZ, maxZ } = WORLD_BOUNDS;
  const x = minX + u * (maxX - minX);
  const z = minZ + (1 - v) * (maxZ - minZ); // flip v back
  return { x, z };
}

/**
 * Get district containing the given world coordinates
 * Returns null if outside all districts
 */
export function getDistrictFromWorld(x: number, z: number): DistrictDefinition | null {
  return (
    DISTRICTS.find(
      (d) =>
        x >= d.worldRect.minX &&
        x <= d.worldRect.maxX &&
        z >= d.worldRect.minZ &&
        z <= d.worldRect.maxZ,
    ) ?? null
  );
}

/**
 * Get distance between two world points
 */
export function getDistance(x1: number, z1: number, x2: number, z2: number): number {
  const dx = x2 - x1;
  const dz = z2 - z1;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Get center point of a district
 */
export function getDistrictCenter(district: DistrictDefinition): { x: number; z: number } {
  const { minX, maxX, minZ, maxZ } = district.worldRect;
  return {
    x: (minX + maxX) / 2,
    z: (minZ + maxZ) / 2,
  };
}

/**
 * Check if a point is within a given radius of a district
 */
export function isNearDistrict(
  x: number,
  z: number,
  district: DistrictDefinition,
  radius: number,
): boolean {
  const center = getDistrictCenter(district);
  return getDistance(x, z, center.x, center.z) <= radius;
}

/**
 * Get all districts sorted by distance from a point
 */
export function getDistrictsByDistance(
  x: number,
  z: number,
): Array<{ district: DistrictDefinition; distance: number }> {
  return DISTRICTS.map((district) => {
    const center = getDistrictCenter(district);
    const distance = getDistance(x, z, center.x, center.z);
    return { district, distance };
  }).sort((a, b) => a.distance - b.distance);
}

/**
 * Convert rotation (radians) to degrees (0-360)
 */
export function rotationToDegrees(rotation: number): number {
  let degrees = (rotation * 180) / Math.PI;
  degrees = (degrees + 360) % 360; // Normalize to 0-360
  return degrees;
}

/**
 * Get cardinal direction from rotation
 */
export function getCardinalDirection(rotation: number): string {
  const degrees = rotationToDegrees(rotation);
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
