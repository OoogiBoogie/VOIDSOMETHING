/**
 * VOID WORLD - Building Bindings
 * 
 * Connects BUILDINGS from city-assets to parcels and districts
 */

import { BUILDINGS, type Building } from "../lib/city-assets";
import {
  worldToParcel,
  coordsToParcelId,
  getDistrict,
  parcelIdToCoords,
  type ParcelCoords,
  type District,
} from "./WorldCoords";

export interface BuildingBinding {
  building: Building;
  parcelId: number;
  parcelCoords: ParcelCoords;
  district: District;
}

/**
 * Bind a building to its parcel location
 */
export function bindBuildingToParcel(building: Building): BuildingBinding {
  // If building already has explicit parcelId, use it
  if (typeof (building as any).parcelId === "number") {
    const parcelId = (building as any).parcelId;
    const coords = parcelIdToCoords(parcelId);
    return {
      building,
      parcelId,
      parcelCoords: coords,
      district: getDistrict(coords),
    };
  }

  // Otherwise derive from world position (x, z are already on Building)
  const worldX = building.x;
  const worldZ = building.z;
  
  const coords = worldToParcel({ x: worldX, z: worldZ });
  const parcelId = coordsToParcelId(coords);
  const district = getDistrict(coords);

  return { building, parcelId, parcelCoords: coords, district };
}

/**
 * All buildings bound to parcels
 */
export const BOUND_BUILDINGS: BuildingBinding[] = BUILDINGS.map(bindBuildingToParcel);

/**
 * Helper: all buildings on a given parcel
 */
export function getBuildingsOnParcel(parcelId: number): BuildingBinding[] {
  return BOUND_BUILDINGS.filter((b) => b.parcelId === parcelId);
}

/**
 * Helper: all buildings in a given district
 */
export function getBuildingsInDistrict(district: District): BuildingBinding[] {
  return BOUND_BUILDINGS.filter((b) => b.district === district);
}

/**
 * Helper: get building binding by ID
 */
export function getBuildingById(buildingId: string): BuildingBinding | undefined {
  return BOUND_BUILDINGS.find((b) => b.building.id === buildingId);
}
