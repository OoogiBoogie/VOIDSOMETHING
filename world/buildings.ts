/**
 * VOID WORLD - Building Bindings
 * 
 * Connects BUILDINGS from city-assets to parcels and districts
 * Uses CITY_BOUNDS coordinate system for all transforms
 */

import { BUILDINGS, type Building } from "../lib/city-assets";
import {
  cityWorldToParcel,
  coordsToParcelId,
  getDistrict,
  parcelIdToCoords,
  type ParcelCoords,
} from "./WorldCoords";
import type { DistrictId } from "./map/districts";

export interface BuildingBinding {
  building: Building;
  parcelId: number;
  parcelCoords: ParcelCoords;
  district: DistrictId;
}

/**
 * Bind a building to its parcel location
 * Uses CITY_BOUNDS coordinate system (building.x/z are in CITY_BOUNDS range)
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

  // Building coordinates from city-assets are in CITY_BOUNDS range
  // Use cityWorldToParcel to map to parcel grid
  const worldX = building.x;
  const worldZ = building.z;
  
  const coords = cityWorldToParcel({ x: worldX, z: worldZ });
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
export function getBuildingsInDistrict(district: DistrictId): BuildingBinding[] {
  return BOUND_BUILDINGS.filter((b) => b.district === district);
}

/**
 * Helper: get building binding by ID
 */
export function getBuildingById(buildingId: string): BuildingBinding | undefined {
  return BOUND_BUILDINGS.find((b) => b.building.id === buildingId);
}
