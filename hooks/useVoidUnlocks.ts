/**
 * HOOK: useVoidUnlocks
 * World unlock system - zone access based on tier
 */

import { useMemo } from 'react';
import { useVoidScore } from '@/hooks/useVoidScore';
import {
  canAccessZone,
  getUnlockedZones,
  getLockedZones,
  getNextZoneToUnlock,
  getUnlockProgress,
  type ZoneId,
  type ZoneRequirement,
} from '@/lib/world/unlockRules';

export function useVoidUnlocks() {
  const { voidScore, isLoading } = useVoidScore();

  /**
   * Check if user can access a zone
   */
  const checkAccess = (zoneId: ZoneId): boolean => {
    if (!voidScore) return false;
    return canAccessZone(voidScore.tier, zoneId);
  };

  /**
   * Get unlocked zones
   */
  const unlockedZones: ZoneRequirement[] = useMemo(() => {
    if (!voidScore) return [];
    return getUnlockedZones(voidScore.tier);
  }, [voidScore]);

  /**
   * Get locked zones
   */
  const lockedZones: ZoneRequirement[] = useMemo(() => {
    if (!voidScore) return [];
    return getLockedZones(voidScore.tier);
  }, [voidScore]);

  /**
   * Get next zone to unlock
   */
  const nextZone: ZoneRequirement | null = useMemo(() => {
    if (!voidScore) return null;
    return getNextZoneToUnlock(voidScore.tier);
  }, [voidScore]);

  /**
   * Get unlock progress
   */
  const progress: number = useMemo(() => {
    if (!voidScore) return 0;
    return getUnlockProgress(voidScore.tier);
  }, [voidScore]);

  return {
    checkAccess,
    unlockedZones,
    lockedZones,
    nextZone,
    progress,
    isLoading,
  };
}
