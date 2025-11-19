'use client';

/**
 * REAL ESTATE LEADERBOARD WINDOW - ECONOMY · RANKINGS
 * 
 * PHASE 5.1: Leaderboard showing top real estate holders by airdrop score
 * 
 * Features:
 * - Top 50 wallets by airdrop score
 * - Tier badges and parcel counts
 * - District dominance breakdown
 * - Tier distribution stats
 */

import React, { useMemo } from 'react';
import { Trophy, TrendingUp, MapPin, Award, Building2 } from 'lucide-react';
import { useRealEstateAirdropScoreState } from '@/world/economy/realEstateAirdropScoring';
import { useParcelMarketState } from '@/state/parcelMarket/useParcelMarketState';
import { getTierFromScore } from '@/world/economy/realEstateUtility';
import type { RealEstateTier } from '@/world/economy/realEstateUtility';

interface RealEstateLeaderboardWindowProps {
  onClose?: () => void;
}

// Tier color mapping
const TIER_COLORS: Record<RealEstateTier, string> = {
  NONE: 'text-bio-silver/40',
  BRONZE: 'text-amber-700',
  SILVER: 'text-slate-400',
  GOLD: 'text-yellow-400',
  DIAMOND: 'text-cyan-400',
};

const TIER_BG: Record<RealEstateTier, string> = {
  NONE: 'bg-bio-silver/10',
  BRONZE: 'bg-amber-900/20',
  SILVER: 'bg-slate-700/20',
  GOLD: 'bg-yellow-600/20',
  DIAMOND: 'bg-cyan-600/20',
};

export function RealEstateLeaderboardWindow({ onClose }: RealEstateLeaderboardWindowProps) {
  const scores = useRealEstateAirdropScoreState((state) => state.scores);
  const getOwnedParcels = useParcelMarketState((state) => state.getOwnedParcels);
  const ownership = useParcelMarketState((state) => state.ownership);
  const getTopScores = useRealEstateAirdropScoreState((state) => state.getTopRealEstateScores);
  
  // Get top 50 wallets
  const topWallets = useMemo(() => {
    return getTopScores(50);
  }, [getTopScores]);
  
  // Build leaderboard entries with ownership data
  const leaderboardEntries = useMemo(() => {
    return topWallets.map((entry, index) => {
      const tier = getTierFromScore(entry.score);
      const parcels = getOwnedParcels(entry.wallet);
      const parcelCount = parcels.length;
      
      // Get district breakdown
      // TODO: ParcelOwnership doesn't have districtId - will show generic count for now
      const districtCounts: Record<string, number> = {
        UNKNOWN: parcelCount,
      };
      
      return {
        rank: index + 1,
        wallet: entry.wallet,
        score: entry.score,
        tier,
        parcelCount,
        districtCounts,
      };
    });
  }, [topWallets, getOwnedParcels]);
  
  // Tier distribution stats
  const tierDistribution = useMemo(() => {
    const distribution: Record<RealEstateTier, number> = {
      NONE: 0,
      BRONZE: 0,
      SILVER: 0,
      GOLD: 0,
      DIAMOND: 0,
    };
    
    leaderboardEntries.forEach((entry) => {
      distribution[entry.tier]++;
    });
    
    return distribution;
  }, [leaderboardEntries]);
  
  // Format wallet address
  function formatWallet(wallet: string): string {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  }
  
  // Get rank badge color
  function getRankColor(rank: number): string {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-slate-400';
    if (rank === 3) return 'text-amber-700';
    return 'text-bio-silver/60';
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pb-2 sm:pb-3 mb-2 sm:mb-3 border-b border-bio-silver/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-lg font-bold text-bio-silver flex items-center gap-1.5 sm:gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-void-purple flex-shrink-0" />
              <span className="truncate">Real Estate Leaderboard</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-bio-silver/60 mt-0.5 sm:mt-1 truncate">Top landowners by airdrop score</p>
          </div>
          <div className="text-[10px] sm:text-xs text-bio-silver/40 flex-shrink-0">
            Top {leaderboardEntries.length}
          </div>
        </div>
      </div>

      {/* Tier Distribution Stats */}
      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-black/40 rounded-lg border border-bio-silver/10">
        <div className="text-[10px] sm:text-xs text-bio-silver/60 mb-1.5 sm:mb-2 uppercase tracking-wider">Tier Distribution</div>
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {(['DIAMOND', 'GOLD', 'SILVER', 'BRONZE', 'NONE'] as RealEstateTier[]).map((tier) => {
            const count = tierDistribution[tier];
            if (count === 0) return null;
            
            return (
              <div
                key={tier}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${TIER_BG[tier]}`}
              >
                <Award className={`w-3 h-3 ${TIER_COLORS[tier]}`} />
                <span className={`text-[10px] sm:text-xs font-mono ${TIER_COLORS[tier]}`}>
                  {tier}: {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2">
        {leaderboardEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-bio-silver/40">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm">No data yet</p>
            <p className="text-[10px] sm:text-xs mt-1">Claim parcels to appear on the leaderboard</p>
          </div>
        )}
        
        {leaderboardEntries.map((entry) => (
          <div
            key={entry.wallet}
            className="p-2 sm:p-3 rounded-lg border bg-black/40 border-bio-silver/10 hover:bg-black/60 transition"
          >
            <div className="flex items-start justify-between gap-2">
              {/* Left: Rank + Wallet */}
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <div className={`text-xs sm:text-sm font-bold ${getRankColor(entry.rank)} min-w-[1.5rem] sm:min-w-[2rem] flex-shrink-0`}>
                  #{entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-mono text-bio-silver truncate">
                    {formatWallet(entry.wallet)}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                    <div className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded ${TIER_BG[entry.tier]} flex-shrink-0`}>
                      <span className={`font-mono ${TIER_COLORS[entry.tier]}`}>
                        {entry.tier}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-bio-silver/60 flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {entry.parcelCount} parcel{entry.parcelCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right: Score */}
              <div className="text-right flex-shrink-0">
                <div className="text-xs sm:text-sm font-bold text-void-purple">
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-[9px] sm:text-xs text-bio-silver/40">score</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-bio-silver/20">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
          <div>
            <div className="text-[10px] sm:text-xs text-bio-silver/60">Total Holders</div>
            <div className="text-base sm:text-lg font-bold text-bio-silver">
              {Object.keys(scores).length}
            </div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-bio-silver/60">Total Parcels</div>
            <div className="text-base sm:text-lg font-bold text-bio-silver">
              {ownership.size}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
