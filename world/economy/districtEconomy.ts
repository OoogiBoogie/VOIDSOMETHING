/**
 * DISTRICT ECONOMY SYSTEM
 * 
 * Tracks economic and exploration stats at the district level
 * Integrates with:
 * - Parcel grid (WorldCoords)
 * - Building system (buildings.ts)
 * - XP/Achievement engines (Phase 6)
 * - Airdrop scoring (Phase 6)
 */

import { DISTRICTS, type DistrictId, type DistrictDefinition } from '@/world/map/districts';
import { GRID_SIZE, cityWorldToParcel, coordsToParcelId, type ParcelCoords } from '@/world/WorldCoords';
import { BOUND_BUILDINGS, getBuildingsInDistrict } from '@/world/buildings';
import { BUILDINGS } from '@/lib/city-assets';
import { landRegistryAPI } from '@/lib/land/registry-api';

export interface DistrictEconomyStats {
  districtId: DistrictId;
  name: string;
  color: string;
  
  // Parcel stats
  parcelCount: number;           // Total parcels in district
  visitedCount: number;          // Parcels visited by player
  exploredPct: number;           // Percentage explored (0-100)
  
  // Building stats
  buildingCount: number;         // Total buildings in district
  forSaleCount: number;          // Buildings marked for sale
  
  // Economy stats
  floorPrice: number | null;     // Cheapest listing
  avgPrice: number | null;       // Average listing price
  topParcelValue: number | null; // Highest value parcel
  
  // Engagement multipliers
  xpMultiplier: number;          // XP bonus for this district
  airdropWeight: number;         // Airdrop allocation weight
  
  // Activity score
  economyRating: number;         // 0-100 综合economy score
}

/**
 * Calculate which parcels belong to a district
 * Maps district worldRect bounds to parcel grid
 */
function getDistrictParcels(district: DistrictDefinition): ParcelCoords[] {
  const { minX, maxX, minZ, maxZ } = district.worldRect;
  const parcels: ParcelCoords[] = [];
  
  // Sample points across the district and collect unique parcels
  const samples = 20; // Sample density
  const seen = new Set<string>();
  
  for (let sx = 0; sx <= samples; sx++) {
    for (let sz = 0; sz <= samples; sz++) {
      const x = minX + (sx / samples) * (maxX - minX);
      const z = minZ + (sz / samples) * (maxZ - minZ);
      
      const coords = cityWorldToParcel({ x, z });
      const key = `${coords.x},${coords.z}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        parcels.push(coords);
      }
    }
  }
  
  return parcels;
}

/**
 * Calculate district economy stats
 * @param visitedParcelIds - Set of parcel IDs the player has visited
 */
export function calculateDistrictEconomy(
  district: DistrictDefinition,
  visitedParcelIds: Set<number> = new Set()
): DistrictEconomyStats {
  const parcels = getDistrictParcels(district);
  const parcelCount = parcels.length;
  
  // Count visited parcels
  const visitedCount = parcels.filter((coords) => {
    const id = coordsToParcelId(coords);
    return visitedParcelIds.has(id);
  }).length;
  
  const exploredPct = parcelCount > 0 ? (visitedCount / parcelCount) * 100 : 0;
  
  // Building stats
  const districtBuildings = getBuildingsInDistrict(
    district.id.toLowerCase() as any // Map to legacy district type
  );
  const buildingCount = districtBuildings.length;
  const forSaleBuildings = districtBuildings.filter((b) => b.building.forSale);
  const forSaleCount = forSaleBuildings.length;
  
  // Price stats
  const prices = forSaleBuildings
    .map((b) => b.building.price)
    .filter((p): p is number => p != null);
  
  const floorPrice = prices.length > 0 ? Math.min(...prices) : null;
  const avgPrice = prices.length > 0
    ? prices.reduce((sum, p) => sum + p, 0) / prices.length
    : null;
  
  // Top parcel value (placeholder - would integrate with land registry)
  const topParcelValue = avgPrice ? avgPrice * 1.5 : null;
  
  // XP multiplier based on district type
  const xpMultipliers: Record<string, number> = {
    'HQ': 1.2,
    'AI': 1.3,
    'DEFI': 1.5,
    'CREATOR': 1.4,
    'DAO': 1.3,
    'SOCIAL': 1.1,
    'IDENTITY': 1.0,
    'CENTRAL_EAST': 1.0,
    'CENTRAL_SOUTH': 1.0,
  };
  const xpMultiplier = xpMultipliers[district.id] || 1.0;
  
  // Airdrop weight based on economic activity
  const airdropWeight = buildingCount * 0.1 + exploredPct * 0.5 + (avgPrice || 0) * 0.0001;
  
  // Economy rating (0-100)
  const economyRating = Math.min(
    100,
    (buildingCount * 2) + exploredPct * 0.3 + (forSaleCount * 5)
  );
  
  return {
    districtId: district.id,
    name: district.name,
    color: district.color,
    parcelCount,
    visitedCount,
    exploredPct,
    buildingCount,
    forSaleCount,
    floorPrice,
    avgPrice,
    topParcelValue,
    xpMultiplier,
    airdropWeight,
    economyRating,
  };
}

/**
 * Calculate economy stats for all districts
 */
export function calculateAllDistrictEconomies(
  visitedParcelIds: Set<number> = new Set()
): Map<DistrictId, DistrictEconomyStats> {
  const economies = new Map<DistrictId, DistrictEconomyStats>();
  
  for (const district of DISTRICTS) {
    const stats = calculateDistrictEconomy(district, visitedParcelIds);
    economies.set(district.id, stats);
  }
  
  return economies;
}

/**
 * Get district economy stats by ID
 */
export function getDistrictEconomy(
  districtId: DistrictId,
  visitedParcelIds: Set<number> = new Set()
): DistrictEconomyStats | null {
  const district = DISTRICTS.find((d) => d.id === districtId);
  if (!district) return null;
  
  return calculateDistrictEconomy(district, visitedParcelIds);
}

/**
 * Get top N districts by economy rating
 */
export function getTopDistricts(
  n: number = 5,
  visitedParcelIds: Set<number> = new Set()
): DistrictEconomyStats[] {
  const economies = Array.from(calculateAllDistrictEconomies(visitedParcelIds).values());
  return economies
    .sort((a, b) => b.economyRating - a.economyRating)
    .slice(0, n);
}

/**
 * Get districts with active listings
 */
export function getDistrictsWithListings(
  visitedParcelIds: Set<number> = new Set()
): DistrictEconomyStats[] {
  const economies = Array.from(calculateAllDistrictEconomies(visitedParcelIds).values());
  return economies.filter((e) => e.forSaleCount > 0);
}
