/**
 * ECONOMY HOOKS
 * 
 * React hooks for integrating economy system into HUD
 * Fast, memoized, and reactive to player state changes
 */

'use client';

import { useMemo } from 'react';
import { usePlayerState } from '@/state/player/usePlayerState';
import { 
  calculateDistrictEconomy, 
  type DistrictEconomyStats 
} from './districtEconomy';
import { calculateParcelEconomy, type ParcelEconomyStats } from './parcelEconomy';
import type { DistrictId } from '@/world/map/districts';
import { DISTRICTS } from '@/world/map/districts';

/**
 * Hook for district economy stats
 * Memoized and reactive to player visit data
 */
export function useDistrictEconomy(districtId: DistrictId | null): {
  loading: boolean;
  stats: DistrictEconomyStats | null;
  error?: string;
} {
  const parcelsVisitedMap = usePlayerState((s) => s.parcelsVisited);
  
  const stats = useMemo(() => {
    if (!districtId) return null;
    
    const district = DISTRICTS.find((d) => d.id === districtId);
    if (!district) return null;
    
    // Convert parcelsVisited Map to Set of parcel IDs
    const visitedIds = new Set(
      Array.from(parcelsVisitedMap.values()).map((v: any) => {
        const x = v.x;
        const z = v.z;
        return x * 40 + z; // Simple ID calculation
      })
    );
    
    try {
      return calculateDistrictEconomy(district, visitedIds);
    } catch (error) {
      console.error('[useDistrictEconomy] Error:', error);
      return null;
    }
  }, [districtId, parcelsVisitedMap]);
  
  return {
    loading: false,
    stats,
    error: stats === null && districtId !== null ? 'Failed to load district data' : undefined,
  };
}

/**
 * Hook for parcel economy stats
 */
export function useParcelEconomy(parcelId: number | null): {
  loading: boolean;
  stats: ParcelEconomyStats | null;
  error?: string;
} {
  const parcelsVisitedMap = usePlayerState((s) => s.parcelsVisited);
  const walletAddress = usePlayerState((s) => s.walletAddress);
  
  const stats = useMemo(() => {
    if (parcelId === null) return null;
    
    // Get visit count for this parcel
    const visitEntry = Array.from(parcelsVisitedMap.values()).find((v: any) => {
      const x = v.x;
      const z = v.z;
      const id = x * 40 + z;
      return id === parcelId;
    });
    
    const visitCount = visitEntry ? (visitEntry as any).visitCount || 0 : 0;
    
    try {
      return calculateParcelEconomy(parcelId, visitCount, walletAddress);
    } catch (error) {
      console.error('[useParcelEconomy] Error:', error);
      return null;
    }
  }, [parcelId, parcelsVisitedMap, walletAddress]);
  
  return {
    loading: false,
    stats,
    error: stats === null && parcelId !== null ? 'Failed to load parcel data' : undefined,
  };
}

/**
 * Player portfolio summary
 */
export interface PlayerPortfolioSummary {
  totalParcelsOwned: number;
  totalMarketValue: number;
  totalCostBasis: number;
  totalUnrealizedPnl: number;
  districtsOwned: Array<{
    districtId: DistrictId;
    parcelCount: number;
    marketValue: number;
  }>;
}

/**
 * Hook for player real estate portfolio
 * TODO: Integrate with land registry API when ownership system is live
 */
export function usePlayerPortfolio(): {
  loading: boolean;
  summary: PlayerPortfolioSummary | null;
} {
  const walletAddress = usePlayerState((s) => s.walletAddress);
  const parcelsVisitedMap = usePlayerState((s) => s.parcelsVisited);
  
  const summary = useMemo((): PlayerPortfolioSummary | null => {
    if (!walletAddress) return null;
    
    // TODO: Replace with actual land registry query
    // For now, use visited parcels as a placeholder
    const visitedParcels = Array.from(parcelsVisitedMap.values());
    
    // Placeholder calculation
    const totalParcelsOwned = 0; // Land registry integration needed
    const totalMarketValue = 0;
    const totalCostBasis = 0;
    const totalUnrealizedPnl = 0;
    
    const districtsOwned: Array<{
      districtId: DistrictId;
      parcelCount: number;
      marketValue: number;
    }> = [];
    
    return {
      totalParcelsOwned,
      totalMarketValue,
      totalCostBasis,
      totalUnrealizedPnl,
      districtsOwned,
    };
  }, [walletAddress, parcelsVisitedMap]);
  
  return {
    loading: false,
    summary,
  };
}

/**
 * District reward stats for XP and airdrop visualization
 */
export function useDistrictRewardStats(districtId: DistrictId | null): {
  xpPerMinuteEstimate: number | null;
  airdropWeight: number | null;
} {
  const stats = useDistrictEconomy(districtId);
  
  return useMemo(() => {
    if (!stats.stats) {
      return {
        xpPerMinuteEstimate: null,
        airdropWeight: null,
      };
    }
    
    // XP per minute estimate based on multiplier
    // Baseline: 10 XP/min, multiplied by district bonus
    const baseXpPerMin = 10;
    const xpPerMinuteEstimate = baseXpPerMin * stats.stats.xpMultiplier;
    
    return {
      xpPerMinuteEstimate,
      airdropWeight: stats.stats.airdropWeight,
    };
  }, [stats.stats]);
}

/**
 * Multi-district economy snapshot for minimap overlays
 * Returns normalized scores (0-1) for all districts
 */
export function useDistrictEconomyMap(): Record<DistrictId, number> {
  const parcelsVisitedMap = usePlayerState((s) => s.parcelsVisited);
  
  return useMemo(() => {
    const visitedIds = new Set(
      Array.from(parcelsVisitedMap.values()).map((v: any) => {
        const x = v.x;
        const z = v.z;
        return x * 40 + z;
      })
    );
    
    const scoreMap: Record<string, number> = {};
    
    for (const district of DISTRICTS) {
      try {
        const stats = calculateDistrictEconomy(district, visitedIds);
        // Normalize score to 0-1
        scoreMap[district.id] = stats.economyRating / 100;
      } catch (error) {
        scoreMap[district.id] = 0;
      }
    }
    
    return scoreMap as Record<DistrictId, number>;
  }, [parcelsVisitedMap]);
}
