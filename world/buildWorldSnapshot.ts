/**
 * VOID WORLD - World Snapshot Builder
 * 
 * Builds complete VoidWorldSnapshot from player position and world state
 * This is the single source of truth for all HUD/map components
 */

import {
  getParcelInfo,
  GRID_SIZE,
  MAX_PARCELS,
  DISTRICT_COLORS,
  DISTRICT_NAMES,
  type WorldPosition,
  type District,
} from "./WorldCoords";
import { CORE_WORLD_FEATURES } from "./features";
import { BOUND_BUILDINGS } from "./buildings";
import type { VoidWorldSnapshot, DistrictMeta } from "./schema";

interface BuildSnapshotOptions {
  playerWorldPos: WorldPosition;
  totalSold?: number;
  pricePerParcel?: number;
  onlineFriends?: number;
}

/**
 * Build district metadata by counting parcels, buildings, and features
 */
function buildDistrictMeta(): DistrictMeta[] {
  const districts: District[] = ["defi", "creator", "dao", "ai", "neutral"];
  
  return districts.map(districtId => {
    // Count parcels in this district
    const midPoint = GRID_SIZE / 2;
    let parcelCount = 0;
    
    for (let z = 0; z < GRID_SIZE; z++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        let d: District = "neutral";
        
        if (x < midPoint && z >= midPoint) d = "defi";
        else if (x >= midPoint && z >= midPoint) d = "creator";
        else if (x < midPoint && z < midPoint) d = "dao";
        else if (x >= midPoint && z < midPoint) d = "ai";
        
        if (d === districtId) parcelCount++;
      }
    }
    
    // Count buildings
    const buildingCount = BOUND_BUILDINGS.filter(b => b.district === districtId).length;
    
    // Count features
    const featureCount = CORE_WORLD_FEATURES.filter(f => f.district === districtId).length;
    
    return {
      id: districtId,
      name: DISTRICT_NAMES[districtId],
      color: DISTRICT_COLORS[districtId],
      parcelCount,
      buildingCount,
      featureCount,
    };
  });
}

/**
 * Build complete world snapshot
 */
export function buildWorldSnapshot(options: BuildSnapshotOptions): VoidWorldSnapshot {
  const { playerWorldPos, totalSold, pricePerParcel, onlineFriends } = options;
  
  // Get player parcel info
  const parcelInfo = getParcelInfo(playerWorldPos);
  
  // Build district metadata
  const districts = buildDistrictMeta();
  
  // Assemble snapshot
  const snapshot: VoidWorldSnapshot = {
    coordinates: playerWorldPos,
    parcelCoords: parcelInfo.coords,
    parcelId: parcelInfo.id,
    district: parcelInfo.district,
    
    districts,
    features: CORE_WORLD_FEATURES,
    buildings: BOUND_BUILDINGS,
    
    onlineFriends,
    landStats: totalSold !== undefined && pricePerParcel !== undefined
      ? {
          totalParcels: MAX_PARCELS,
          totalSold,
          pricePerParcel,
        }
      : undefined,
  };
  
  return snapshot;
}

/**
 * Get default world snapshot (for when player position is unknown)
 */
export function getDefaultWorldSnapshot(): VoidWorldSnapshot {
  const WORLD_EXTENT = GRID_SIZE * 100;
  const centerPos: WorldPosition = {
    x: WORLD_EXTENT / 2,
    z: WORLD_EXTENT / 2,
  };
  
  return buildWorldSnapshot({
    playerWorldPos: centerPos,
    totalSold: 0,
    pricePerParcel: 100,
    onlineFriends: 0,
  });
}
