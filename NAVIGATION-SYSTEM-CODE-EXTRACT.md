# THE VOID - NAVIGATION SYSTEM CODE EXTRACT
## Complete Code Package for ChatGPT Rebuild

---

## 📋 EXTRACTION PURPOSE

This document contains ALL existing navigation/map code from The Void repository for ChatGPT to analyze and rebuild. **Claude extracted this code - ChatGPT will rebuild the system.**

**What's broken:**
- Multiple conflicting district definitions
- Inconsistent coordinate systems between maps
- Zone map doesn't track player correctly
- City map modal has overlapping district names
- Bottom-left minimap is low-effort/redundant
- No single source of truth for world layout

**ChatGPT's job:**
1. Analyze all code below
2. Identify conflicts and issues
3. Rebuild unified navigation system with:
   - Single source of truth for districts
   - Consistent world → map coordinate transforms
   - Working player tracking
   - Proper spatial layout

---

## 🗂️ FILE STRUCTURE

### Current Map Components
```
hud/header/MiniMapPanel.tsx          # Old zone map (top-right)
hud/navigation/ZoneMiniMap.tsx        # NEW zone map (recently added)
hud/navigation/VoidCityMap.tsx        # NEW city map modal (recently added)
hud/navigation/Minimap.tsx            # OLD canvas minimap (bottom-left)
hud/panels/ExplorationCard.tsx       # NEW stats card (recently added)
components/cyberpunk-city-map.tsx    # OLD full map modal
```

### Supporting Files
```
hud/navigation/minimapUtils.ts        # OLD minimap coordinate utils
world/map/districts.ts                # NEW district master config
world/map/mapUtils.ts                 # NEW map utilities
world/WorldCoords.ts                  # OLD world coordinate system
state/player/usePlayerState.ts        # Player state store
```

---

## 📄 CODE EXTRACTS

---

### 1. hud/header/MiniMapPanel.tsx
**Purpose:** Old zone map component (top-right widget) - uses DISTRICT_QUADRANTS hardcoded layout

```tsx
'use client';

/**
 * UPGRADED ZONE MAP - Full District System with Labels, Boundaries, Interactive POIs
 * Features:
 * - District quadrants with names, colors, and player counts
 * - Clickable district boundaries
 * - All world features (landmarks, hubs, portals)
 * - Building icons by type
 * - AI hotspots visualization
 * - Real-time player position tracking
 * - Smart compass with cardinal directions
 * OPTIMIZED: Memoized with custom comparison + useCallback for event handlers
 */

import React, { memo, useCallback } from 'react';
import type { WindowType } from '@/hud/windowTypes';
import type { HubTheme } from '@/hud/theme';
import type { EconomySnapshot } from '@/hud/types/economySnapshot';
import { getHubSpineColor } from '@/hud/theme';
import { worldPosToPercent, WORLD_EXTENT, DISTRICT_COLORS, DISTRICT_NAMES, type District } from '@/world/WorldCoords';
import { CORE_WORLD_FEATURES } from '@/world/features';
import { BOUND_BUILDINGS } from '@/world/buildings';

interface MiniMapPanelProps {
  snapshot: EconomySnapshot;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
  onRequestTeleport?: (pos: { x: number; y?: number; z: number }) => void;
}

// District quadrant mapping (aligned with WorldCoords)
// Each district has a spawn point for teleportation
const DISTRICT_QUADRANTS: { 
  district: District; 
  label: string; 
  xStart: number; 
  xEnd: number; 
  zStart: number; 
  zEnd: number;
  spawnPoint: { x: number; y: number; z: number };
}[] = [
  { district: 'dao', label: 'DAO', xStart: 0, xEnd: 50, zStart: 0, zEnd: 50, spawnPoint: { x: 1000, y: 1, z: 1000 } }, // Top-left
  { district: 'ai', label: 'AI', xStart: 50, xEnd: 100, zStart: 0, zEnd: 50, spawnPoint: { x: 3000, y: 1, z: 1000 } }, // Top-right
  { district: 'defi', label: 'DeFi', xStart: 0, xEnd: 50, zStart: 50, zEnd: 100, spawnPoint: { x: 1000, y: 1, z: 3000 } }, // Bottom-left
  { district: 'creator', label: 'Creator', xStart: 50, xEnd: 100, zStart: 50, zEnd: 100, spawnPoint: { x: 3000, y: 1, z: 3000 } }, // Bottom-right
];

function MiniMapPanelComponent({ snapshot, onOpenWindow, theme, onRequestTeleport }: MiniMapPanelProps) {
  const world = snapshot.world;
  const districts = world.districts || [];
  const pois = snapshot.pois || [];
  const player = world.coordinates;
  const aiHotspots = snapshot.aiOps.hotspots || [];

  // Calculate player position on map (0-100%) using world coordinate system
  const playerWorldPos = { x: player.x, z: player.z };
  const { xPct: playerMapX, zPct: playerMapZ } = worldPosToPercent(playerWorldPos);

  const handleOpenWorldMap = useCallback(() => {
    onOpenWindow("WORLD_MAP", { world });
  }, [onOpenWindow, world]);

  const handleDistrictClick = useCallback((district: District, spawnPoint: { x: number; y: number; z: number }) => {
    onOpenWindow("WORLD_MAP", { world, focusDistrict: district });
    console.log(`[MiniMap] Opening world map for ${district} district`);
    if (onRequestTeleport) {
      onRequestTeleport(spawnPoint);
    }
  }, [onOpenWindow, onRequestTeleport, world]);

  const handlePOIClick = useCallback((poi: any) => {
    if (poi.type === 'vault') onOpenWindow("VAULT_DETAIL", { vaultId: poi.id });
    if (poi.type === 'drop') onOpenWindow("DROP_DETAIL", { dropId: poi.id });
    if (poi.type === 'proposal') onOpenWindow("PROPOSAL_DETAIL", { proposalId: poi.id });
    if (poi.type === 'gig') onOpenWindow("JOB_DETAIL", { jobId: poi.id });
  }, [onOpenWindow]);

  return (
    <div className="
      relative rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40
      overflow-hidden h-[200px] flex flex-col
    ">
      {/* Header with title, coords, compass, and map button */}
      <div className="px-3 pt-2 pb-1 flex items-center justify-between border-b border-bio-silver/20">
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
            Zone Map
          </div>
          <div className={`text-[0.7rem] font-mono ${theme.accent}`}>
            ({Math.floor(player.x)}, {Math.floor(player.z)})
          </div>
        </div>

        {/* Improved compass design */}
        <div className="flex flex-col items-center text-[0.6rem] font-mono text-bio-silver/60 mr-2">
          <span className="text-emerald-400 font-semibold">N</span>
          <div className="flex items-center gap-2 my-0.5">
            <span className="text-bio-silver/50">W</span>
            <div className="w-4 h-4 rounded-full border border-bio-silver/40 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-signal-green shadow-[0_0_6px_rgba(0,255,157,0.8)]" />
              </div>
            </div>
            <span className="text-bio-silver/50">E</span>
          </div>
          <span className="text-bio-silver/50">S</span>
        </div>

        <button
          type="button"
          className={`text-[0.6rem] font-mono tracking-[0.22em] uppercase ${theme.accent} hover:text-signal-green transition-colors px-2 py-1 rounded border border-bio-silver/30 hover:border-signal-green/60`}
          onClick={handleOpenWorldMap}
        >
          FULL MAP ▸
        </button>
      </div>

      {/* Main map area with district quadrants */}
      <div className="relative flex-1 m-2 rounded-xl border border-bio-silver/30 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,10,20,0.95), rgba(10,5,25,0.95))' }}>
        {/* Background lattice */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,234,255,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,234,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px',
        }} />

        {/* District quadrants with labels and colors */}
        {DISTRICT_QUADRANTS.map((quadrant) => {
          const color = DISTRICT_COLORS[quadrant.district];
          const name = DISTRICT_NAMES[quadrant.district];
          
          return (
            <button
              key={quadrant.district}
              type="button"
              className="absolute transition-all duration-200 hover:bg-white/5 group cursor-pointer"
              style={{
                left: `${quadrant.xStart}%`,
                top: `${quadrant.zStart}%`,
                width: `${quadrant.xEnd - quadrant.xStart}%`,
                height: `${quadrant.zEnd - quadrant.zStart}%`,
                borderRight: quadrant.xEnd === 50 ? `2px solid ${color}40` : 'none',
                borderBottom: quadrant.zEnd === 50 ? `2px solid ${color}40` : 'none',
              }}
              onClick={() => handleDistrictClick(quadrant.district, quadrant.spawnPoint)}
              title={`Click to teleport to ${name} District`}
            >
              {/* District label */}
              <div className="absolute top-2 left-2 text-left pointer-events-none">
                <div 
                  className="text-[0.5rem] uppercase tracking-[0.25em] font-semibold opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ color }}
                >
                  {name}
                </div>
                <div className="text-[0.45rem] text-bio-silver/50 mt-0.5">
                  Click to travel
                </div>
              </div>

              {/* Corner accent */}
              <div 
                className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 opacity-30 group-hover:opacity-60 transition-opacity"
                style={{ borderColor: color }}
              />
            </button>
          );
        })}


        {/* Buildings from BOUND_BUILDINGS */}
        {BOUND_BUILDINGS.slice(0, 30).map((binding) => {
          const buildingPos = worldPosToPercent({ x: binding.building.x, z: binding.building.z });
          const districtColor = DISTRICT_COLORS[binding.district];
          
          return (
            <div
              key={binding.building.id}
              className="absolute w-1.5 h-1.5 z-5 opacity-60 hover:opacity-100 transition-opacity"
              style={{
                left: `${buildingPos.xPct}%`,
                top: `${buildingPos.zPct}%`,
                backgroundColor: districtColor,
                boxShadow: `0 0 4px ${districtColor}`,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Diamond for buildings
              }}
              title={`${binding.building.type} (${binding.district})`}
            />
          );
        })}

        {/* POIs from snapshot */}
        {pois.map((poi) => {
          const poiPos = worldPosToPercent(poi.position);
          const poiColor = poi.hub === 'CREATOR' ? '#00eaff' :
                          poi.hub === 'DEFI' ? '#7c00ff' :
                          poi.hub === 'DAO' ? '#00d4ff' :
                          poi.hub === 'AGENCY' ? '#ff3b3b' :
                          '#00ff9d';

          return (
            <button
              key={poi.id}
              type="button"
              className="absolute w-3 h-3 rounded-full z-10 hover:scale-150 transition-transform cursor-pointer"
              style={{
                left: `${poiPos.xPct}%`,
                top: `${poiPos.zPct}%`,
                backgroundColor: poiColor,
                boxShadow: `0 0 12px ${poiColor}`,
              }}
              title={poi.label}
              onClick={() => handlePOIClick(poi)}
            />
          );
        })}

        {/* World features (landmarks) */}
        {CORE_WORLD_FEATURES.map((feature) => {
          const featurePos = worldPosToPercent(feature.worldPos);
          const featureColor = feature.hub === 'CREATOR' ? '#00eaff' :
                              feature.hub === 'DEFI' ? '#7c00ff' :
                              feature.hub === 'DAO' ? '#00d4ff' :
                              feature.hub === 'AGENCY' ? '#ff3b3b' :
                              feature.hub === 'AI_OPS' ? '#3b8fff' :
                              '#00ff9d';

          return (
            <div
              key={feature.id}
              className="absolute w-2.5 h-2.5 z-8 opacity-90 hover:opacity-100 transition-opacity"
              style={{
                left: `${featurePos.xPct}%`,
                top: `${featurePos.zPct}%`,
                backgroundColor: featureColor,
                boxShadow: `0 0 10px ${featureColor}`,
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', // Triangle for features
              }}
              title={feature.label}
            />
          );
        })}

        {/* AI hotspots */}
        {aiHotspots.map((hotspot, idx) => {
          const hotspotPos = worldPosToPercent({ x: hotspot.x, z: hotspot.z });
          return (
            <div
              key={`hotspot-${idx}`}
              className="absolute w-5 h-5 rounded-full border-2 border-lime-300/80 animate-pulse z-5"
              style={{
                left: `${hotspotPos.xPct}%`,
                top: `${hotspotPos.zPct}%`,
                backgroundColor: 'rgba(190,255,50,0.15)',
                boxShadow: '0 0 15px rgba(190,255,50,0.5)',
              }}
              title={hotspot.reason}
            />
          );
        })}

        {/* Player marker - pulsing with enhanced visibility */}
        <div
          className="absolute w-4 h-4 rounded-full z-30"
          style={{
            left: `${playerMapX}%`,
            top: `${playerMapZ}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Outer pulse ring */}
          <div 
            className="absolute inset-0 rounded-full animate-ping opacity-60"
            style={{
              backgroundColor: theme.spineColor || '#00ff9d',
              boxShadow: `0 0 20px ${theme.spineColor || '#00ff9d'}`,
            }}
          />
          {/* Inner solid dot */}
          <div 
            className="absolute inset-1 rounded-full border-2"
            style={{
              backgroundColor: theme.spineColor || '#00ff9d',
              borderColor: 'rgba(255,255,255,0.8)',
              boxShadow: `0 0 15px ${theme.spineColor || '#00ff9d'}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(MiniMapPanelComponent, (prevProps, nextProps) => {
  // Only re-render if player position or POI count changed
  return (
    prevProps.snapshot.world.coordinates.x === nextProps.snapshot.world.coordinates.x &&
    prevProps.snapshot.world.coordinates.z === nextProps.snapshot.world.coordinates.z &&
    prevProps.snapshot.pois?.length === nextProps.snapshot.pois?.length &&
    prevProps.theme.spineColor === nextProps.theme.spineColor &&
    prevProps.onRequestTeleport === nextProps.onRequestTeleport
  );
});
```

---

### 2. world/WorldCoords.ts
**Purpose:** OLD world coordinate system - 40x40 parcel grid, 4 districts hardcoded

**KEY ISSUES:**
- Defines world as 40x40 grid (1600 parcels)
- Hardcoded 4 districts: defi, creator, dao, ai
- Uses PARCEL_SIZE = 100
- WORLD_EXTENT = 4000
- District bounds use simple quadrants

```typescript
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

const HALF_WORLD = WORLD_EXTENT / 2;

export const DISTRICT_BOUNDS: Record<District, { x: [number, number]; z: [number, number] }> = {
  defi: { x: [0, HALF_WORLD], z: [HALF_WORLD, WORLD_EXTENT] },
  creator: { x: [HALF_WORLD, WORLD_EXTENT], z: [HALF_WORLD, WORLD_EXTENT] },
  dao: { x: [0, HALF_WORLD], z: [0, HALF_WORLD] },
  ai: { x: [HALF_WORLD, WORLD_EXTENT], z: [0, HALF_WORLD] },
  neutral: { x: [0, WORLD_EXTENT], z: [0, WORLD_EXTENT] },
};

// HELPER: worldPosToPercent
export function worldPosToPercent(worldPos: WorldPosition) {
  return {
    xPct: (worldPos.x / WORLD_EXTENT) * 100,
    zPct: (worldPos.z / WORLD_EXTENT) * 100,
  };
}
```

---

### 3. world/map/districts.ts
**Purpose:** NEW district master config - 9 districts with grid layout

**KEY DIFFERENCES from WorldCoords:**
- 9 districts vs 4
- Uses gridX/gridY for layout (0-3 grid)
- World bounds -150 to +150 (vs 0-4000)
- Different district IDs: HQ, DEFI, DAO, CREATOR, AI, SOCIAL, IDENTITY, etc.

```typescript
/**
 * DISTRICT MASTER CONFIG
 * Single source of truth for all district definitions in The Void
 * Used by both the Zone Map (mini) and City Map (full modal)
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
 * Coordinates calibrated to match Phase 5/6 world layout
 * Grid layout:
 *   0   1   2   3
 * 0 [ ] [ ] [AI] [ ]
 * 1 [ ] [DAO] [HQ] [CREATOR]
 * 2 [ ] [IDENTITY] [SOCIAL] [ ]
 * 3 [ ] [ ] [DEFI] [ ]
 */
export const DISTRICTS: DistrictDefinition[] = [
  // CENTER - PSX HQ
  {
    id: 'HQ',
    name: 'PSX HQ',
    color: '#45ffcc',
    gridX: 2,
    gridY: 1,
    worldRect: { minX: -50, maxX: 50, minZ: -50, maxZ: 50 },
  },

  // NORTH - AI District
  {
    id: 'AI',
    name: 'AI DISTRICT',
    color: '#ff6b9d',
    gridX: 2,
    gridY: 0,
    worldRect: { minX: -50, maxX: 50, minZ: -150, maxZ: -50 },
  },

  // SOUTH - DeFi District
  {
    id: 'DEFI',
    name: 'DEFI DISTRICT',
    color: '#5f8bff',
    gridX: 2,
    gridY: 3,
    worldRect: { minX: -50, maxX: 50, minZ: 50, maxZ: 150 },
  },

  // WEST - DAO District
  {
    id: 'DAO',
    name: 'DAO DISTRICT',
    color: '#b66bff',
    gridX: 1,
    gridY: 1,
    worldRect: { minX: -150, maxX: -50, minZ: -50, maxZ: 50 },
  },

  // EAST - Creator District
  {
    id: 'CREATOR',
    name: 'CREATOR DISTRICT',
    color: '#ffaa00',
    gridX: 3,
    gridY: 1,
    worldRect: { minX: 50, maxX: 150, minZ: -50, maxZ: 50 },
  },

  // SOUTHWEST - Identity District
  {
    id: 'IDENTITY',
    name: 'IDENTITY DISTRICT',
    color: '#00ffaa',
    gridX: 1,
    gridY: 2,
    worldRect: { minX: -150, maxX: -50, minZ: 50, maxZ: 150 },
  },

  // SOUTHEAST - Social District
  {
    id: 'SOCIAL',
    name: 'SOCIAL DISTRICT',
    color: '#ff9d00',
    gridX: 2,
    gridY: 2,
    worldRect: { minX: 50, maxX: 150, minZ: 50, maxZ: 150 },
  },

  // NORTHEAST - Central East (locked example)
  {
    id: 'CENTRAL_EAST',
    name: 'CENTRAL EAST',
    color: '#6b8bff',
    gridX: 3,
    gridY: 0,
    worldRect: { minX: 50, maxX: 150, minZ: -150, maxZ: -50 },
    locked: true,
  },

  // NORTHWEST - Central South (locked example)
  {
    id: 'CENTRAL_SOUTH',
    name: 'CENTRAL SOUTH',
    color: '#8b6bff',
    gridX: 1,
    gridY: 3,
    worldRect: { minX: -150, maxX: -50, minZ: -150, maxZ: -50 },
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
```

---

### 4. world/map/mapUtils.ts
**Purpose:** NEW map utilities using world/map/districts.ts

```typescript
/**
 * MAP UTILITIES
 * Coordinate transforms and spatial queries for The Void navigation system
 */

import { DISTRICTS, DistrictDefinition } from './districts';

/**
 * WORLD BOUNDS
 * Automatically computed from all district rectangles
 * This ensures the map always fits all districts
 */
export const WORLD_BOUNDS = {
  minX: Math.min(...DISTRICTS.map((d) => d.worldRect.minX)),
  maxX: Math.max(...DISTRICTS.map((d) => d.worldRect.maxX)),
  minZ: Math.min(...DISTRICTS.map((d) => d.worldRect.minZ)),
  maxZ: Math.max(...DISTRICTS.map((d) => d.worldRect.maxZ)),
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
```

---

### 5. state/player/usePlayerState.ts
**Purpose:** Zustand store for player state (position, visits, stats, achievements)

**KEY PROPERTIES:**
```typescript
interface PlayerState {
  walletAddress: string | null;
  isConnected: boolean;
  position: PlayerPosition | null;  // { x, y, z, rotation, timestamp }
  currentParcel: { x: number; z: number } | string | null;
  currentDistrict: string | null;
  parcelsVisited: Map<string, ParcelVisit>;
  districtsVisited: Map<string, DistrictVisit>;
  stats: {
    totalSessionTime: number;
    totalParcelsVisited: number;
    totalDistrictsVisited: number;
    totalXP: number;
    level: number;
  };
  achievements: Map<string, Achievement>;
  session: PlayerSession | null;
  isLoading: boolean;
  lastUpdate: number;
}
```

**EXTRACT (first 200 lines):**
```typescript
/**
 * PHASE 5.2 — GLOBAL PLAYER STATE
 * 
 * Zustand store for centralized player state management.
 * Single source of truth for wallet, position, visits, stats, achievements.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  PlayerState,
  PlayerStateActions,
  PlayerPosition,
  ParcelVisit,
  DistrictVisit,
  PlayerSession,
} from "./playerStateTypes";

const initialState: PlayerState = {
  walletAddress: null,
  isConnected: false,
  position: null,
  currentParcel: null,
  currentDistrict: null,
  parcelsVisited: new Map(),
  districtsVisited: new Map(),
  session: null,
  stats: {
    totalSessionTime: 0,
    totalParcelsVisited: 0,
    totalDistrictsVisited: 0,
    totalXP: 0,
    level: 1,
  },
  achievements: new Map(),
  isLoading: false,
  lastUpdate: Date.now(),
};

/**
 * Helper to generate parcel key
 */
function parcelKey(x: number, z: number): string {
  return `${x},${z}`;
}

/**
 * Helper to calculate level from XP
 */
function calculateLevel(xp: number): number {
  // Simple formula: level = floor(sqrt(xp/100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export const usePlayerState = create<PlayerState & PlayerStateActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ============================================================
        // WALLET ACTIONS
        // ============================================================

        setWalletAddress: (address) => {
          set({
            walletAddress: address,
            isConnected: !!address,
            lastUpdate: Date.now(),
          });
        },

        connect: (address) => {
          set({
            walletAddress: address,
            isConnected: true,
            lastUpdate: Date.now(),
          });
        },

        disconnect: () => {
          const state = get();
          if (state.session?.isActive) {
            state.endSession();
          }
          set({
            walletAddress: null,
            isConnected: false,
            session: null,
            lastUpdate: Date.now(),
          });
        },

        // ============================================================
        // POSITION ACTIONS
        // ============================================================

        updatePosition: (positionUpdate) => {
          const state = get();
          const newPosition: PlayerPosition = {
            x: positionUpdate.x ?? state.position?.x ?? 0,
            y: positionUpdate.y ?? state.position?.y ?? 0,
            z: positionUpdate.z ?? state.position?.z ?? 0,
            rotation: positionUpdate.rotation ?? state.position?.rotation ?? 0,
            timestamp: Date.now(),
          };
          set({
            position: newPosition,
            lastUpdate: Date.now(),
          });
          state.updateActivity();
        },

        setCurrentParcel: (x, z) => {
          set({
            currentParcel: { x, z },
            lastUpdate: Date.now(),
          });
          get().recordParcelVisit(x, z);
          get().updateActivity();
        },

        setCurrentDistrict: (districtId) => {
          set({
            currentDistrict: districtId,
            lastUpdate: Date.now(),
          });
          if (districtId) {
            get().recordDistrictVisit(districtId);
          }
          get().updateActivity();
        },

        // ============================================================
        // VISIT TRACKING ACTIONS
        // ============================================================

        recordParcelVisit: (x, z) => {
          const state = get();
          const key = parcelKey(x, z);
          const existing = state.parcelsVisited.get(key);
          const now = Date.now();

          const visit: ParcelVisit = existing
            ? {
                ...existing,
                lastVisitTime: now,
                visitCount: existing.visitCount + 1,
              }
            : {
                x,
                z,
                firstVisitTime: now,
                lastVisitTime: now,
                visitCount: 1,
              };

          const newMap = new Map(state.parcelsVisited);
          newMap.set(key, visit);

          set({
            parcelsVisited: newMap,
            stats: {
              ...state.stats,
              totalParcelsVisited: newMap.size,
            },
            lastUpdate: now,
          });
        },

        recordDistrictVisit: (districtId) => {
          const state = get();
          const existing = state.districtsVisited.get(districtId);
          const now = Date.now();

          const visit: DistrictVisit = existing
            ? {
                ...existing,
                lastVisitTime: now,
                visitCount: existing.visitCount + 1,
              }
            : {
                districtId,
                firstVisitTime: now,
                lastVisitTime: now,
                visitCount: 1,
              };

          const newMap = new Map(state.districtsVisited);
          newMap.set(districtId, visit);

          set({
            districtsVisited: newMap,
            stats: {
              ...state.stats,
              totalDistrictsVisited: newMap.size,
            },
            lastUpdate: now,
          });
        },

        // (... more actions)
      }),
      {
        name: "player-state-storage",
      }
    )
  )
);
```

---

## 🔍 COORDINATE SYSTEM CONFLICTS

### **WorldCoords.ts (OLD SYSTEM)**
```
World bounds: 0 to 4000 (WORLD_EXTENT)
Districts: 4 (defi, creator, dao, ai)
Parcel grid: 40x40 (1600 parcels)
Parcel size: 100 units
Layout: Simple quadrants (0-2000 vs 2000-4000)
```

### **world/map/districts.ts (NEW SYSTEM)**
```
World bounds: -150 to +150 (computed from districts)
Districts: 9 (HQ, DEFI, DAO, CREATOR, AI, SOCIAL, IDENTITY, + 2 locked)
Grid layout: 4x4 cells (gridX 0-3, gridY 0-3)
World rects: Explicit minX/maxX/minZ/maxZ per district
Layout: Center + cardinals + corners
```

### **CONFLICTS:**
1. **Different coordinate origins:**
   - WorldCoords: (0, 0) to (4000, 4000)
   - New districts: (-150, -150) to (+150, +150)

2. **Different district counts:**
   - WorldCoords: 4 districts
   - New system: 9 districts

3. **Different district IDs:**
   - WorldCoords: `'defi' | 'creator' | 'dao' | 'ai'`
   - New system: `'HQ' | 'DEFI' | 'DAO' | 'CREATOR' | 'AI' | 'SOCIAL' | 'IDENTITY'`

4. **Different coordinate transforms:**
   - WorldCoords: `worldPosToPercent()` → 0-100%
   - New system: `worldToMinimap()` → 0-1 normalized

5. **Parcel system exists ONLY in WorldCoords** (40x40 grid, 1600 parcels)

---

## 📊 CURRENT SYSTEM STATUS

### ✅ WORKING FILES (NEW):
- `world/map/districts.ts` - Clean district config
- `world/map/mapUtils.ts` - Clean coordinate transforms
- `hud/navigation/ZoneMiniMap.tsx` - NEW zone map using above
- `hud/navigation/VoidCityMap.tsx` - NEW city map using above
- `hud/panels/ExplorationCard.tsx` - Stats panel

### ❌ CONFLICTING FILES (OLD):
- `world/WorldCoords.ts` - Old coordinate system (40x40, 4 districts, 0-4000)
- `hud/header/MiniMapPanel.tsx` - Uses WorldCoords + DISTRICT_QUADRANTS
- `hud/navigation/minimapUtils.ts` - Different coordinate system (-150 to +150)
- `hud/navigation/Minimap.tsx` - Canvas minimap using minimapUtils

### 🚨 BROKEN INTEGRATIONS:
- Maps use different district definitions
- Player position tracked in WorldCoords format (0-4000)
- New maps expect -150 to +150 coordinates
- No consistent player → map coordinate transform

---

## 🎯 CHATGPT's TASK

**Analyze all code above and rebuild navigation system with:**

1. **Single Source of Truth**
   - Choose ONE coordinate system (recommend: WorldCoords 0-4000 for consistency)
   - Choose ONE district definition system
   - Make all maps use the SAME config

2. **Fix Coordinate Transforms**
   - Ensure player position (from usePlayerState) maps correctly to all displays
   - Unify worldToPercent / worldToMinimap functions
   - Document clearly what coordinate system is canonical

3. **District System**
   - Decide: 4 districts or 9 districts?
   - If 9: How to map them onto existing 40x40 parcel grid?
   - If 4: Simplify back to WorldCoords definitions

4. **Map Components**
   - Zone Map (top-right): Should track player accurately
   - City Map (full-screen): Should show all districts with correct layout
   - Remove redundant/broken components

5. **Integration**
   - Wire everything to usePlayerState.position
   - Ensure parcel system (WorldCoords) still works
   - Maintain backward compatibility with Phase 5/6

---

## 📝 CONSTRAINTS FOR REBUILD

**DO NOT BREAK:**
- usePlayerState position format
- Parcel system (40x40 grid, getParcelInfo)
- Phase 6 XP/achievement tracking
- Existing wallet/session logic

**MUST FIX:**
- Player marker position on maps
- District detection (getDistrictFromWorld vs getDistrict)
- Coordinate transform consistency
- Map → world teleportation

**MUST PRESERVE:**
- Neon PSX aesthetic
- Real-time player tracking
- District color schemes
- HUD layout (top-right zone map, bottom-left panel, full-screen modal)

---

## ⚠️ KEY QUESTIONS FOR CHATGPT

Before rebuilding, you MUST answer:

1. **What is the canonical world coordinate system?**
   - 0 to 4000 (WorldCoords)?
   - -150 to +150 (new districts)?
   - Something else?

2. **How many districts exist?**
   - 4 (defi, creator, dao, ai)?
   - 9 (HQ + 8 others)?
   - Reconcile parcel system with district count?

3. **Where does player position come from?**
   - Three.js world coords (what range?)
   - usePlayerState.position (what format?)
   - How to map to minimap percentage?

4. **What should be the single source of truth?**
   - WorldCoords.ts (refactor to add more districts)?
   - world/map/districts.ts (refactor coordinates to match world)?
   - New file that unifies both?

---

## 🚀 DELIVERABLES EXPECTED

1. **Unified District Config**
   - Single file with ALL district definitions
   - Consistent coordinate system
   - Clear documentation

2. **Coordinate Transform Library**
   - worldToMap(x, z) → map percentage
   - mapToWorld(pct) → world coords
   - getDistrictFromCoords(x, z) → district
   - Clear comments on coordinate ranges

3. **Working Map Components**
   - Zone Map (top-right) - tracks player accurately
   - City Map (full-screen modal) - shows districts correctly
   - Bottom-left panel - meaningful stats (not redundant map)

4. **Integration Guide**
   - How to wire into existing HUD
   - How player position flows to maps
   - Testing checklist

5. **Migration Plan**
   - Which files to delete
   - Which files to keep/modify
   - Backward compatibility notes

---

## 📚 REFERENCE DOCUMENTATION

See also:
- `UNIFIED-NAVIGATION-COMPLETE.md` - Documentation for NEW system attempt
- `PHASE-6-MANUAL-TEST-CHECKLIST.md` - Testing guide
- `WORLD-LAND-MAP-COMPLETE-CODE.md` - Old world map docs

---

**END EXTRACT - ALL CODE PROVIDED ABOVE**

ChatGPT: Review this entire document, identify conflicts, propose unified solution, and rebuild navigation system. Ask clarifying questions BEFORE coding if needed.
