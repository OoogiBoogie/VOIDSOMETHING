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
  type WorldPosition,
} from "./WorldCoords";
import { DISTRICTS, type DistrictId } from "./map/districts";
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
  return DISTRICTS.map(district => {
    const { id, name, color, worldRect } = district;
    
    // Count parcels in this district's worldRect
    // Each parcel is PARCEL_SIZE (40m) × PARCEL_SIZE (40m)
    // Convert worldRect bounds to parcel count
    const parcelWidth = Math.floor((worldRect.maxX - worldRect.minX) / 40);
    const parcelHeight = Math.floor((worldRect.maxZ - worldRect.minZ) / 40);
    const parcelCount = parcelWidth * parcelHeight;
    
    // Count buildings in this district
    const buildingCount = BOUND_BUILDINGS.filter(b => b.district === id).length;
    
    // Count features in this district
    const featureCount = CORE_WORLD_FEATURES.filter(f => f.district === id).length;
    
    return {
      id,
      name,
      color,
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
