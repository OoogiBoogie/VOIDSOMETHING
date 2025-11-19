/**
 * BUILDING ECONOMY SYSTEM
 * 
 * Economic stats for individual buildings
 */

import { type Building } from '@/lib/city-assets';
import { type BuildingBinding, BOUND_BUILDINGS } from '@/world/buildings';

export interface BuildingEconomyStats {
  buildingId: string;
  type: string;
  district: string;
  parcelId: number;
  
  // Listing info
  forSale: boolean;
  price: number | null;
  
  // Value metrics
  floorArea: number;
  pricePerSqFt: number | null;
  
  // Position
  worldPos: { x: number; z: number };
  
  // Activity
  visitCount: number;
  lastVisitTime: number | null;
}

/**
 * Calculate building economy stats
 */
export function calculateBuildingEconomy(
  binding: BuildingBinding,
  visitCount: number = 0,
  lastVisitTime: number | null = null
): BuildingEconomyStats {
  const building = binding.building;
  const floorArea = building.width * building.depth;
  const pricePerSqFt = building.price ? building.price / floorArea : null;
  
  return {
    buildingId: building.id,
    type: building.type,
    district: binding.district,
    parcelId: binding.parcelId,
    forSale: building.forSale || false,
    price: building.price || null,
    floorArea,
    pricePerSqFt,
    worldPos: { x: building.x, z: building.z },
    visitCount,
    lastVisitTime,
  };
}

/**
 * Get all buildings for sale
 */
export function getBuildingsForSale(): BuildingEconomyStats[] {
  return BOUND_BUILDINGS
    .filter((b) => b.building.forSale)
    .map((b) => calculateBuildingEconomy(b));
}

/**
 * Get buildings by district
 */
export function getBuildingsByDistrict(district: string): BuildingEconomyStats[] {
  return BOUND_BUILDINGS
    .filter((b) => b.district === district)
    .map((b) => calculateBuildingEconomy(b));
}

/**
 * Get building stats by ID
 */
export function getBuildingEconomy(buildingId: string): BuildingEconomyStats | null {
  const binding = BOUND_BUILDINGS.find((b) => b.building.id === buildingId);
  if (!binding) return null;
  
  return calculateBuildingEconomy(binding);
}

/**
 * Get top buildings by price
 */
export function getTopBuildingsByPrice(n: number = 10): BuildingEconomyStats[] {
  return BOUND_BUILDINGS
    .filter((b) => b.building.price != null)
    .map((b) => calculateBuildingEconomy(b))
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, n);
}
