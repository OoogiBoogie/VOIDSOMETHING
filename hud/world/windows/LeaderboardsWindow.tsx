'use client';

/**
 * LEADERBOARDS WINDOW - SOCIAL · RANKINGS
 * Global leaderboards across all categories
 */

import React, { useState } from 'react';
import { Trophy, Star, Zap, Target, TrendingUp, Users } from 'lucide-react';
import { useVoidLeaderboards, type LeaderboardCategory } from '@/hooks/useVoidLeaderboards';
import { getTierStyle } from '@/lib/score/tierRules';

interface LeaderboardsWindowProps {
  onClose?: () => void;
}

export function LeaderboardsWindow({ onClose }: LeaderboardsWindowProps) {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('TOP_XP');
  
  const { leaderboard, isLoading, getUserPosition } = useVoidLeaderboards(activeCategory);
  
  const categories: { id: LeaderboardCategory; label: string; icon: any }[] = [
    { id: 'TOP_XP', label: 'Total XP', icon: Star },
    { id: 'TOP_TIER', label: 'Highest Tier', icon: TrendingUp },
    { id: 'TOP_GUILDS', label: 'Top Guilds', icon: Users },
    { id: 'TOP_EARNERS', label: 'Top Earners', icon: Zap },
    { id: 'TOP_EXPLORERS', label: 'Explorers', icon: Target },
    { id: 'TOP_CREATORS', label: 'Creators', icon: Trophy },
  ];

  const userPosition = getUserPosition();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pb-3 mb-3 border-b border-bio-silver/20">
        <h2 className="text-lg font-bold text-bio-silver">Global Leaderboards</h2>
        <p className="text-xs text-bio-silver/60 mt-1">Top performers across The VOID</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition flex-shrink-0
              ${activeCategory === cat.id
                ? 'bg-void-purple/20 text-void-purple border border-void-purple/40'
                : 'bg-black/40 text-bio-silver/60 hover:text-bio-silver hover:bg-bio-silver/5'
              }
            `}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-void-purple/30 border-t-void-purple rounded-full animate-spin" />
        </div>
      )}

      {/* Leaderboard List */}
      {!isLoading && leaderboard && (
        <div className="flex-1 overflow-y-auto space-y-2">
          {leaderboard.entries.map((entry) => (
            <div
              key={entry.rank}
              className={`
                p-3 rounded-lg border transition
                ${userPosition?.rank === entry.rank
                  ? 'bg-void-purple/10 border-void-purple/40'
                  : 'bg-black/40 border-bio-silver/10 hover:bg-black/60'
                }
              `}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Rank */}
                  <div className={`
                    text-2xl font-black font-mono
                    ${entry.rank === 1 ? 'text-amber-400' : ''}
                    ${entry.rank === 2 ? 'text-gray-300' : ''}
                    ${entry.rank === 3 ? 'text-orange-600' : ''}
                    ${entry.rank > 3 ? 'text-bio-silver/50' : ''}
                  `}>
                    #{entry.rank}
                  </div>

                  {/* User */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-bio-silver truncate">
                        {entry.displayName || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                      </div>
                      {entry.tier && (
                        <div className={`
                          text-xs px-2 py-0.5 rounded font-mono font-bold
                          ${getTierStyle(entry.tier).border} ${getTierStyle(entry.tier).text}
                        `}>
                          {entry.tier}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-bio-silver/50 font-mono mt-0.5">
                      {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-void-purple">
                      {entry.score.toLocaleString()}
                    </div>
                    {entry.change !== undefined && (
                      <div className={`
                        text-xs font-mono
                        ${entry.change > 0 ? 'text-emerald-400' : entry.change < 0 ? 'text-red-400' : 'text-bio-silver/50'}
                      `}>
                        {entry.change > 0 && '+'}
                        {entry.change !== 0 && entry.change}
                        {entry.change === 0 && '—'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* User Position (if outside top 10) */}
          {userPosition && userPosition.rank > 10 && (
            <>
              <div className="flex items-center gap-2 py-2">
                <div className="flex-1 h-px bg-bio-silver/20" />
                <div className="text-xs text-bio-silver/50 font-mono">YOUR RANK</div>
                <div className="flex-1 h-px bg-bio-silver/20" />
              </div>
              <div className="p-3 rounded-lg bg-void-purple/10 border border-void-purple/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-black font-mono text-void-purple">
                      #{userPosition.rank}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-bio-silver">You</div>
                      <div className="text-xs text-bio-silver/50 font-mono">
                        {userPosition.address.slice(0, 8)}...{userPosition.address.slice(-6)}
                      </div>
                    </div>
                  </div>
                  {userPosition.score > 0 && (
                    <div className="text-lg font-bold text-void-purple">
                      {userPosition.score.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Last Updated */}
      {leaderboard && (
        <div className="pt-3 mt-3 border-t border-bio-silver/10">
          <div className="text-xs text-bio-silver/50 text-center">
            Last updated: {new Date(leaderboard.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
