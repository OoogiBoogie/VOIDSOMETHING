import { useMemo } from 'react';
import { usePlayerPosition } from '@/contexts/PlayerPositionContext';
import { buildWorldSnapshot, getDefaultWorldSnapshot } from '@/world/buildWorldSnapshot';
import { type VoidWorldSnapshot } from '@/world/schema';
import { useLandStats } from '@/services/world/useParcels';

interface UseWorldSnapshotOptions {
  onlineFriends?: number;
}

/**
 * Compose PlayerPositionContext + land stats into a single source of truth
 * for HUD/world components. Falls back to the default snapshot until the
 * player position resolves.
 */
export function useWorldSnapshot(options?: UseWorldSnapshotOptions): VoidWorldSnapshot {
  const { position } = usePlayerPosition();
  const { totalSold, pricePerParcel } = useLandStats();

  return useMemo(() => {
    if (!position) {
      return getDefaultWorldSnapshot();
    }

    return buildWorldSnapshot({
      playerWorldPos: { x: position.x, z: position.z },
      totalSold,
      pricePerParcel: pricePerParcel ? Number(pricePerParcel) : undefined,
      onlineFriends: options?.onlineFriends,
    });
  }, [position, totalSold, pricePerParcel, options?.onlineFriends]);
}
