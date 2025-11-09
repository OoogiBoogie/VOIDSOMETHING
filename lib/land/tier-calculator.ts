/**
 * Tier & District Calculator
 * Determines tier and district for parcels based on grid coordinates
 */

import { TierType, DistrictType } from './types';

/**
 * Calculate tier based on distance from center
 * CORE = center 16×16 (256 parcels)
 * RING = middle belt (768 parcels)
 * FRONTIER = outer edge (576 parcels)
 */
export function calculateTier(gridX: number, gridY: number, gridWidth: number = 40): TierType {
  const centerX = gridWidth / 2;  // 20
  const centerY = gridWidth / 2;  // 20
  
  const distFromCenter = Math.sqrt(
    Math.pow(gridX - centerX, 2) + Math.pow(gridY - centerY, 2)
  );
  
  // CORE: Inner 20% (distance < 8)
  if (distFromCenter < gridWidth * 0.2) {
    return TierType.CORE;
  }
  
  // RING: Middle 40% (distance < 16)
  if (distFromCenter < gridWidth * 0.4) {
    return TierType.RING;
  }
  
  // FRONTIER: Outer edge
  return TierType.FRONTIER;
}

/**
 * Calculate district based on quadrant and position
 * Districts: GAMING (NW), BUSINESS (NE), SOCIAL (SW), DEFI (SE), RESIDENTIAL (middle), DAO (center), PUBLIC
 */
export function calculateDistrict(gridX: number, gridY: number, gridWidth: number = 40): DistrictType {
  const centerX = gridWidth / 2;  // 20
  const centerY = gridWidth / 2;  // 20
  
  // DAO Plaza: Center 4×4 (parcels 18-21 in both X and Y)
  if (gridX >= 18 && gridX <= 21 && gridY >= 18 && gridY <= 21) {
    return DistrictType.DAO;
  }
  
  // RESIDENTIAL: Middle ring (8-31 in both X and Y, excluding DAO center)
  if (gridX >= 8 && gridX <= 31 && gridY >= 8 && gridY <= 31) {
    return DistrictType.RESIDENTIAL;
  }
  
  // Quadrant-based districts (outer areas)
  const isNorth = gridY < centerY;
  const isWest = gridX < centerX;
  
  if (isNorth && isWest) {
    return DistrictType.GAMING;      // Northwest
  } else if (isNorth && !isWest) {
    return DistrictType.BUSINESS;    // Northeast
  } else if (!isNorth && isWest) {
    return DistrictType.SOCIAL;      // Southwest
  } else {
    return DistrictType.DEFI;        // Southeast
  }
}

/**
 * Check if parcel is a founder plot
 * Founder plots = every 10th parcel in CORE tier
 */
export function isFounderPlot(gridX: number, gridY: number, gridWidth: number = 40): boolean {
  const tier = calculateTier(gridX, gridY, gridWidth);
  if (tier !== TierType.CORE) return false;
  
  const gridIndex = gridY * gridWidth + gridX;
  return gridIndex % 10 === 0;
}

/**
 * Check if parcel is a corner lot
 */
export function isCornerLot(gridX: number, gridY: number, gridWidth: number = 40): boolean {
  const gridHeight = gridWidth;  // Assuming square grid
  
  return (
    (gridX === 0 || gridX === gridWidth - 1) && 
    (gridY === 0 || gridY === gridHeight - 1)
  );
}

/**
 * Check if parcel is on a main street
 * Main streets at X=20 and Y=20 (center lines)
 */
export function isMainStreet(gridX: number, gridY: number, gridWidth: number = 40): boolean {
  const centerX = gridWidth / 2;
  const centerY = gridWidth / 2;
  
  return gridX === centerX || gridY === centerY;
}

/**
 * Get max building height for a tier
 */
export function getMaxHeightForTier(tier: TierType): number {
  const heightMap: Record<TierType, number> = {
    [TierType.CORE]: 120,      // Up to 120 floors (ultra-high rises)
    [TierType.RING]: 60,       // Up to 60 floors (high rises)
    [TierType.FRONTIER]: 40    // Up to 40 floors (mid rises)
  };
  
  return heightMap[tier];
}

/**
 * Get tier price multiplier
 */
export function getTierMultiplier(tier: TierType): number {
  const multipliers: Record<TierType, number> = {
    [TierType.CORE]: 3,        // 3x base price
    [TierType.RING]: 2,        // 2x base price
    [TierType.FRONTIER]: 1     // 1x base price
  };
  
  return multipliers[tier];
}

/**
 * Get district price multiplier
 */
export function getDistrictMultiplier(district: DistrictType): number {
  const multipliers: Record<DistrictType, number> = {
    [DistrictType.GAMING]: 1.5,
    [DistrictType.BUSINESS]: 1.3,
    [DistrictType.SOCIAL]: 1.2,
    [DistrictType.DEFI]: 1.4,
    [DistrictType.RESIDENTIAL]: 1.0,
    [DistrictType.PUBLIC]: 0.8,
    [DistrictType.DAO]: 0  // Not for sale
  };
  
  return multipliers[district];
}

/**
 * Calculate full parcel price with all multipliers
 */
export function calculateParcelPrice(
  basePrice: bigint,
  tier: TierType,
  district: DistrictType,
  isFounder: boolean,
  isCorner: boolean,
  isMain: boolean,
  gridX: number,
  gridY: number,
  gridWidth: number = 40
): bigint {
  // Tier multiplier
  const tierMult = getTierMultiplier(tier);
  
  // District multiplier
  const distMult = getDistrictMultiplier(district);
  
  // Scarcity multipliers
  let scarcityMult = 1.0;
  
  if (isFounder) scarcityMult *= 2.0;    // Founder plots: 2x
  if (isCorner) scarcityMult *= 1.2;     // Corner lots: 1.2x
  if (isMain) scarcityMult *= 1.15;      // Main street: 1.15x
  
  // CORE tier proximity bonus (up to +50% for center parcels)
  if (tier === TierType.CORE) {
    const centerX = gridWidth / 2;
    const centerY = gridWidth / 2;
    const distFromCenter = Math.sqrt(
      Math.pow(gridX - centerX, 2) + Math.pow(gridY - centerY, 2)
    );
    const maxDist = gridWidth * 0.2;  // CORE radius
    const proximityBonus = 1 + (1 - distFromCenter / maxDist) * 0.5;
    scarcityMult *= proximityBonus;
  }
  
  // Calculate final price
  const finalMultiplier = tierMult * distMult * scarcityMult;
  const finalPrice = Number(basePrice) * finalMultiplier;
  
  return BigInt(Math.floor(finalPrice));
}
