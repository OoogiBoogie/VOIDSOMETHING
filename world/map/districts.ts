/**
 * DISTRICT MASTER CONFIG
 * Single source of truth for all district definitions in The Void
 * Used by both the Zone Map (mini) and City Map (full modal)
 * 
 * ═══════════════════════════════════════════════════════════════
 * 🔧 EXPANSION GUIDE — How to Add New Districts
 * ═══════════════════════════════════════════════════════════════
 * 
 * To add a new district (e.g., expand the world):
 * 
 * 1. Add new DistrictId to the union type:
 *    export type DistrictId =
 *      | 'HQ' | 'DEFI' | 'DAO' | 'CREATOR' | 'AI' | 'SOCIAL' | 'IDENTITY'
 *      | 'CENTRAL_EAST' | 'CENTRAL_SOUTH'
 *      | 'YOUR_NEW_DISTRICT';  // ← Add here
 * 
 * 2. Append new DistrictDefinition to DISTRICTS array below:
 *    {
 *      id: 'YOUR_NEW_DISTRICT',
 *      name: 'Your District Name',
 *      color: '#ff00ff',                // Neon color for map
 *      gridX: 3,                         // Column on map grid
 *      gridY: 1,                         // Row on map grid
 *      worldRect: {                      // World-space bounds
 *        minX: 300,
 *        maxX: 400,
 *        minZ: -40,
 *        maxZ: 40,
 *      },
 *      locked: false,                    // Optional: lock until ready
 *    }
 * 
 * 3. That's it! HUD and world logic will automatically:
 *    - Render the new district in VoidCityMap
 *    - Include it in getDistrictFromWorld() lookups
 *    - Track ownership, economy, real estate per district
 * 
 * 4. DO NOT hardcode district names or colors in UI components.
 *    Always import DISTRICTS from this file.
 * 
 * ⚠️ WARNING: Ensure worldRect bounds don't overlap with existing
 *             districts. Use getDistrictFromWorld() to test.
 * 
 * ═══════════════════════════════════════════════════════════════
 */

export type DistrictId =
  | 'HQ'
  | 'DEFI'
  | 'DAO'
  | 'CREATOR'
  | 'AI'
  | 'SOCIAL'
  | 'IDENTITY'
  | 'CENTRAL_EAST'
  | 'CENTRAL_SOUTH';

export interface DistrictDefinition {
  id: DistrictId;
  name: string;
  color: string;                // Neon color for map rendering
  gridX: number;                // Column index on map grid (0 = leftmost)
  gridY: number;                // Row index on map grid (0 = topmost)
  worldRect: {                  // Actual world-space bounds
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  locked?: boolean;             // Display lock icon if true
}

/**
 * ALL DISTRICTS IN THE VOID
 * Aligned with CITY_BOUNDS (-300 to 300 X, -120 to 120 Z)
 * 3×3 grid layout: west/center/east × north/center/south
 * Split X at -100 and 100
 * Split Z at -40 and 40
 * 
 * Grid layout:
 *   0 (W)      1 (C)      2 (E)
 * 0 (N) [C_SOUTH] [AI]     [C_EAST]
 * 1 (C) [DAO]     [HQ]     [CREATOR]
 * 2 (S) [IDENTITY][SOCIAL] [DEFI]
 */
export const DISTRICTS: DistrictDefinition[] = [
  // CENTER - PSX HQ
  {
    id: 'HQ',
    name: 'PSX HQ',
    color: '#45ffcc',
    gridX: 1,
    gridY: 1,
    worldRect: { minX: -100, maxX: 100, minZ: -40, maxZ: 40 },
  },

  // NORTH CENTER - AI District
  {
    id: 'AI',
    name: 'AI DISTRICT',
    color: '#ff6b9d',
    gridX: 1,
    gridY: 0,
    worldRect: { minX: -100, maxX: 100, minZ: -120, maxZ: -40 },
  },

  // SOUTH EAST - DeFi District
  {
    id: 'DEFI',
    name: 'DEFI DISTRICT',
    color: '#5f8bff',
    gridX: 2,
    gridY: 2,
    worldRect: { minX: 100, maxX: 300, minZ: 40, maxZ: 120 },
  },

  // WEST CENTER - DAO District
  {
    id: 'DAO',
    name: 'DAO DISTRICT',
    color: '#b66bff',
    gridX: 0,
    gridY: 1,
    worldRect: { minX: -300, maxX: -100, minZ: -40, maxZ: 40 },
  },

  // EAST CENTER - Creator District
  {
    id: 'CREATOR',
    name: 'CREATOR DISTRICT',
    color: '#ffaa00',
    gridX: 2,
    gridY: 1,
    worldRect: { minX: 100, maxX: 300, minZ: -40, maxZ: 40 },
  },

  // SOUTH WEST - Identity District
  {
    id: 'IDENTITY',
    name: 'IDENTITY DISTRICT',
    color: '#00ffaa',
    gridX: 0,
    gridY: 2,
    worldRect: { minX: -300, maxX: -100, minZ: 40, maxZ: 120 },
  },

  // SOUTH CENTER - Social District
  {
    id: 'SOCIAL',
    name: 'SOCIAL DISTRICT',
    color: '#ff9d00',
    gridX: 1,
    gridY: 2,
    worldRect: { minX: -100, maxX: 100, minZ: 40, maxZ: 120 },
  },

  // NORTH EAST - Central East (locked)
  {
    id: 'CENTRAL_EAST',
    name: 'CENTRAL EAST',
    color: '#6b8bff',
    gridX: 2,
    gridY: 0,
    worldRect: { minX: 100, maxX: 300, minZ: -120, maxZ: -40 },
    locked: true,
  },

  // NORTH WEST - Central South (locked)
  {
    id: 'CENTRAL_SOUTH',
    name: 'CENTRAL SOUTH',
    color: '#8b6bff',
    gridX: 0,
    gridY: 0,
    worldRect: { minX: -300, maxX: -100, minZ: -120, maxZ: -40 },
    locked: true,
  },
];

/**
 * Get district by ID
 */
export function getDistrictById(id: DistrictId): DistrictDefinition | undefined {
  return DISTRICTS.find((d) => d.id === id);
}

/**
 * Get all unlocked districts
 */
export function getUnlockedDistricts(): DistrictDefinition[] {
  return DISTRICTS.filter((d) => !d.locked);
}

/**
 * Get district grid dimensions (for rendering)
 */
export function getGridDimensions() {
  const maxX = Math.max(...DISTRICTS.map((d) => d.gridX));
  const maxY = Math.max(...DISTRICTS.map((d) => d.gridY));
  return { columns: maxX + 1, rows: maxY + 1 };
}
