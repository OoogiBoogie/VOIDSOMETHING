/**
 * WORLD UNLOCK LOGIC
 * Zone access requirements based on tier
 */

import type { Tier } from '@/lib/score/tierRules';

export type ZoneId = 
  | 'base_city' 
  | 'district_2' 
  | 'district_3' 
  | 'district_4' 
  | 'agency_hq' 
  | 's_tier_sector';

export interface ZoneRequirement {
  zoneId: ZoneId;
  displayName: string;
  requiredTier: Tier;
  description: string;
}

// ================================
// ZONE ACCESS REQUIREMENTS (OFFICIAL)
// ================================

export const ZONE_REQUIREMENTS: Record<ZoneId, ZoneRequirement> = {
  base_city: {
    zoneId: 'base_city',
    displayName: 'Base City',
    requiredTier: 'NONE',
    description: 'Open to all users',
  },
  district_2: {
    zoneId: 'district_2',
    displayName: 'District 2',
    requiredTier: 'BRONZE',
    description: 'Requires Bronze tier',
  },
  district_3: {
    zoneId: 'district_3',
    displayName: 'District 3',
    requiredTier: 'SILVER',
    description: 'Requires Silver tier',
  },
  district_4: {
    zoneId: 'district_4',
    displayName: 'District 4',
    requiredTier: 'GOLD',
    description: 'Requires Gold tier',
  },
  agency_hq: {
    zoneId: 'agency_hq',
    displayName: 'Agency HQ',
    requiredTier: 'GOLD',
    description: 'Requires Gold tier',
  },
  s_tier_sector: {
    zoneId: 's_tier_sector',
    displayName: 'S-Tier Sector',
    requiredTier: 'S_TIER',
    description: 'Exclusive to S-Tier users',
  },
};

// Tier hierarchy for comparison
const TIER_HIERARCHY: Record<Tier, number> = {
  NONE: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  S_TIER: 4,
};

/**
 * Check if user can access a zone
 */
export function canAccessZone(userTier: Tier, zoneId: ZoneId): boolean {
  const requirement = ZONE_REQUIREMENTS[zoneId];
  const userTierLevel = TIER_HIERARCHY[userTier];
  const requiredTierLevel = TIER_HIERARCHY[requirement.requiredTier];
  
  return userTierLevel >= requiredTierLevel;
}

/**
 * Get required tier for a zone
 */
export function requiredTierForZone(zoneId: ZoneId): Tier {
  return ZONE_REQUIREMENTS[zoneId].requiredTier;
}

/**
 * Get all zones accessible to user
 */
export function getUnlockedZones(userTier: Tier): ZoneRequirement[] {
  return Object.values(ZONE_REQUIREMENTS).filter((zone) =>
    canAccessZone(userTier, zone.zoneId)
  );
}

/**
 * Get all zones locked to user
 */
export function getLockedZones(userTier: Tier): ZoneRequirement[] {
  return Object.values(ZONE_REQUIREMENTS).filter(
    (zone) => !canAccessZone(userTier, zone.zoneId)
  );
}

/**
 * Get next zone to unlock
 */
export function getNextZoneToUnlock(userTier: Tier): ZoneRequirement | null {
  const locked = getLockedZones(userTier);
  
  if (locked.length === 0) return null;
  
  // Return lowest tier requirement
  return locked.reduce((lowest, zone) => {
    const lowestLevel = TIER_HIERARCHY[lowest.requiredTier];
    const zoneLevel = TIER_HIERARCHY[zone.requiredTier];
    return zoneLevel < lowestLevel ? zone : lowest;
  });
}

/**
 * Get unlock progress (% of zones unlocked)
 */
export function getUnlockProgress(userTier: Tier): number {
  const totalZones = Object.keys(ZONE_REQUIREMENTS).length;
  const unlockedCount = getUnlockedZones(userTier).length;
  return Math.floor((unlockedCount / totalZones) * 100);
}
