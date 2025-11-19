// hud/navigation/minimapUtils.ts
/**
 * Minimap Utilities
 * World-to-minimap coordinate transformations
 */

export interface WorldCoords {
  x: number;
  z: number;
}

export interface MinimapCoords {
  u: number; // 0-1 normalized x
  v: number; // 0-1 normalized z
}

export interface MinimapConfig {
  worldMinX: number;
  worldMaxX: number;
  worldMinZ: number;
  worldMaxZ: number;
  zoom: number;
}

// Default world extents (The Void spans roughly -150 to +150)
export const DEFAULT_MINIMAP_CONFIG: MinimapConfig = {
  worldMinX: -150,
  worldMaxX: 150,
  worldMinZ: -150,
  worldMaxZ: 150,
  zoom: 1.0,
};

/**
 * Convert world coordinates to minimap normalized coordinates (0-1)
 */
export function worldToMinimap(
  world: WorldCoords,
  config: MinimapConfig = DEFAULT_MINIMAP_CONFIG
): MinimapCoords {
  const { worldMinX, worldMaxX, worldMinZ, worldMaxZ, zoom } = config;

  // Apply zoom (center on origin)
  const zoomedX = world.x / zoom;
  const zoomedZ = world.z / zoom;

  // Normalize to 0-1 range
  const u = (zoomedX - worldMinX) / (worldMaxX - worldMinX);
  const v = (zoomedZ - worldMinZ) / (worldMaxZ - worldMinZ);

  // Clamp to 0-1
  return {
    u: Math.max(0, Math.min(1, u)),
    v: Math.max(0, Math.min(1, v)),
  };
}

/**
 * Convert normalized minimap coordinates to pixel coordinates
 */
export function minimapToPixel(
  minimap: MinimapCoords,
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: minimap.u * width,
    y: minimap.v * height,
  };
}

/**
 * Convert world coordinates directly to pixel coordinates
 */
export function worldToPixel(
  world: WorldCoords,
  width: number,
  height: number,
  config: MinimapConfig = DEFAULT_MINIMAP_CONFIG
): { x: number; y: number } {
  const minimap = worldToMinimap(world, config);
  return minimapToPixel(minimap, width, height);
}

/**
 * District definitions (approximated from city layout)
 * Each district is roughly 100x100 units
 */
export interface DistrictBounds {
  id: string;
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  color: string;
}

export const DISTRICTS: DistrictBounds[] = [
  // Center
  { id: 'center', name: 'Central District', minX: -50, maxX: 50, minZ: -50, maxZ: 50, color: '#06b6d4' },
  
  // Cardinal directions
  { id: 'north', name: 'Northern District', minX: -50, maxX: 50, minZ: 50, maxZ: 150, color: '#3b82f6' },
  { id: 'south', name: 'Southern District', minX: -50, maxX: 50, minZ: -150, maxZ: -50, color: '#8b5cf6' },
  { id: 'east', name: 'Eastern District', minX: 50, maxX: 150, minZ: -50, maxZ: 50, color: '#10b981' },
  { id: 'west', name: 'Western District', minX: -150, maxX: -50, minZ: -50, maxZ: 50, color: '#f59e0b' },
  
  // Corners
  { id: 'northeast', name: 'Northeast District', minX: 50, maxX: 150, minZ: 50, maxZ: 150, color: '#6366f1' },
  { id: 'northwest', name: 'Northwest District', minX: -150, maxX: -50, minZ: 50, maxZ: 150, color: '#ec4899' },
  { id: 'southeast', name: 'Southeast District', minX: 50, maxX: 150, minZ: -150, maxZ: -50, color: '#14b8a6' },
  { id: 'southwest', name: 'Southwest District', minX: -150, maxX: -50, minZ: -150, maxZ: -50, color: '#f97316' },
];

/**
 * Get district ID from world coordinates
 */
export function getDistrictFromCoords(x: number, z: number): DistrictBounds | null {
  return DISTRICTS.find(
    (district) =>
      x >= district.minX &&
      x <= district.maxX &&
      z >= district.minZ &&
      z <= district.maxZ
  ) || null;
}
