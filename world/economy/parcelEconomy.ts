/**
 * PARCEL ECONOMY SYSTEM
 * 
 * Tracks economic stats at the individual parcel level
 */

import {
  type ParcelCoords,
  coordsToParcelId,
  parcelIdToCoords,
  parcelToCityWorld,
  getDistrict,
  type District,
} from '@/world/WorldCoords';
import { getBuildingsOnParcel } from '@/world/buildings';

export interface ParcelEconomyStats {
  parcelId: number;
  coords: ParcelCoords;
  district: District;
  centerWorld: { x: number; z: number };
  
  // Ownership
  owner: string | null;
  purchasePrice: number | null;
  currentValue: number | null;
  appreciation: number | null; // Percentage
  
  // Buildings
  buildingCount: number;
  buildingValueSum: number;
  
  // Activity
  visitCount: number;
  interactionsXP: number;
  explorationXP: number;
  
  // Calculated
  districtEconomyScore: number;
  totalValue: number;
}

/**
 * Calculate parcel economy stats
 */
export function calculateParcelEconomy(
  parcelId: number,
  visitCount: number = 0,
  ownerAddress: string | null = null
): ParcelEconomyStats {
  const coords = parcelIdToCoords(parcelId);
  const district = getDistrict(coords);
  const centerWorld = parcelToCityWorld(coords);
  
  // Building stats
  const buildings = getBuildingsOnParcel(parcelId);
  const buildingCount = buildings.length;
  const buildingValueSum = buildings.reduce((sum, b) => {
    return sum + (b.building.price || 0);
  }, 0);
  
  // Placeholder ownership data (would integrate with land registry)
  const owner = ownerAddress;
  const purchasePrice = null;
  const currentValue = buildingValueSum > 0 ? buildingValueSum * 1.2 : null;
  const appreciation = purchasePrice && currentValue
    ? ((currentValue - purchasePrice) / purchasePrice) * 100
    : null;
  
  // Activity stats
  const interactionsXP = visitCount * 10;
  const explorationXP = visitCount > 0 ? 50 : 0;
  
  // District economy score (0-100)
  const districtEconomyScore = Math.min(
    100,
    buildingCount * 10 + visitCount * 2
  );
  
  const totalValue = (currentValue || 0) + buildingValueSum;
  
  return {
    parcelId,
    coords,
    district,
    centerWorld,
    owner,
    purchasePrice,
    currentValue,
    appreciation,
    buildingCount,
    buildingValueSum,
    visitCount,
    interactionsXP,
    explorationXP,
    districtEconomyScore,
    totalValue,
  };
}

/**
 * Get parcels by owner
 */
export function getParcelsByOwner(
  ownerAddress: string,
  allVisitCounts: Map<number, number>
): ParcelEconomyStats[] {
  // Placeholder - would query land registry
  return [];
}

/**
 * Get top parcels by value
 */
export function getTopParcelsByValue(
  n: number,
  allVisitCounts: Map<number, number>
): ParcelEconomyStats[] {
  const allParcels: ParcelEconomyStats[] = [];
  
  // Sample some parcels (in production, would cache this)
  for (let i = 0; i < 100; i++) {
    const visitCount = allVisitCounts.get(i) || 0;
    allParcels.push(calculateParcelEconomy(i, visitCount));
  }
  
  return allParcels
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, n);
}
