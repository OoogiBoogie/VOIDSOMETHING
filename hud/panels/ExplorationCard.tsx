'use client';

/**
 * EXPLORATION CARD
 * Replacement for the bottom-left MINIMAP card
 * Shows Phase 6 exploration stats and progress
 */

import React, { memo } from 'react';
import { usePlayerState } from '@/state/player/usePlayerState';
import { getDistrictFromWorld } from '@/world/map/mapUtils';

interface ExplorationCardProps {
  onOpenFullMap?: () => void;
}

function ExplorationCardComponent({ onOpenFullMap }: ExplorationCardProps) {
  const position = usePlayerState((s) => s.position);
  const stats = usePlayerState((s) => s.stats);
  const achievements = usePlayerState((s) => s.achievements);

  const parcelsVisited = stats?.totalParcelsVisited ?? 0;
  const districtsVisited = stats?.totalDistrictsVisited ?? 0;
  const totalXP = stats?.totalXP ?? 0;
  const level = stats?.level ?? 1;
  const achievementCount = achievements?.size ?? 0;

  // Get current district
  const currentDistrict = position ? getDistrictFromWorld(position.x, position.z) : null;

  // Calculate next milestone
  const getNextMilestone = (): { text: string; progress: number; max: number } => {
    if (districtsVisited < 3) {
      return { 
        text: 'Explore 3 districts', 
        progress: districtsVisited, 
        max: 3 
      };
    } else if (parcelsVisited < 10) {
      return { 
        text: 'Discover 10 parcels', 
        progress: parcelsVisited, 
        max: 10 
      };
    } else if (parcelsVisited < 50) {
      return { 
        text: 'Discover 50 parcels', 
        progress: parcelsVisited, 
        max: 50 
      };
    } else {
      return { 
        text: 'Master Explorer!', 
        progress: 100, 
        max: 100 
      };
    }
  };

  const milestone = getNextMilestone();
  const milestoneProgress = (milestone.progress / milestone.max) * 100;

  return (
    <div className="relative rounded-xl bg-black/80 backdrop-blur-xl border border-emerald-500/30 overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.2)]">
      {/* Header */}
      <div className="px-3 pt-2 pb-1.5 border-b border-emerald-500/20 bg-gradient-to-r from-black/60 to-emerald-950/20">
        <div className="flex items-center justify-between">
          <div className="text-[0.6rem] uppercase tracking-[0.25em] text-emerald-400/80 font-bold">
            EXPLORATION
          </div>
          {onOpenFullMap && (
            <button
              type="button"
              onClick={onOpenFullMap}
              className="text-[0.55rem] font-mono uppercase text-emerald-400/70 hover:text-emerald-300 transition-colors"
              title="Open full map"
            >
              MAP ▸
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-3 space-y-3">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-2">
          {/* Districts */}
          <div className="bg-gradient-to-br from-emerald-950/40 to-black/60 rounded-lg p-2.5 border border-emerald-500/20">
            <div className="text-[0.55rem] text-emerald-400/60 uppercase tracking-wider mb-1">
              Districts
            </div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {districtsVisited}
            </div>
            <div className="text-[0.5rem] text-emerald-400/50 mt-0.5">
              Explored
            </div>
          </div>

          {/* Parcels */}
          <div className="bg-gradient-to-br from-emerald-950/40 to-black/60 rounded-lg p-2.5 border border-emerald-500/20">
            <div className="text-[0.55rem] text-emerald-400/60 uppercase tracking-wider mb-1">
              Parcels
            </div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {parcelsVisited}
            </div>
            <div className="text-[0.5rem] text-emerald-400/50 mt-0.5">
              Discovered
            </div>
          </div>
        </div>

        {/* XP & Level */}
        <div className="bg-gradient-to-br from-emerald-950/40 to-black/60 rounded-lg p-2.5 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[0.55rem] text-emerald-400/60 uppercase tracking-wider">
              Progress
            </div>
            <div className="text-[0.55rem] font-mono text-emerald-400">
              Level {level}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden border border-emerald-500/30">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                style={{ width: `${Math.min((totalXP % 100) / 100 * 100, 100)}%` }}
              />
            </div>
            <div className="text-[0.6rem] font-mono text-emerald-400 min-w-[3rem] text-right">
              {totalXP} XP
            </div>
          </div>
        </div>

        {/* Current Location */}
        {currentDistrict && (
          <div className="bg-gradient-to-br from-black/60 to-emerald-950/20 rounded-lg p-2.5 border border-emerald-500/20">
            <div className="text-[0.55rem] text-emerald-400/60 uppercase tracking-wider mb-1">
              Current Location
            </div>
            <div 
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: currentDistrict.color }}
            >
              {currentDistrict.name}
            </div>
          </div>
        )}

        {/* Next Milestone */}
        <div className="bg-gradient-to-br from-emerald-950/40 to-black/60 rounded-lg p-2.5 border border-emerald-500/20">
          <div className="text-[0.55rem] text-emerald-400/60 uppercase tracking-wider mb-1.5">
            Next Milestone
          </div>
          <div className="text-xs text-emerald-400/90 mb-2">
            {milestone.text}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden border border-emerald-500/30">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>
            <div className="text-[0.6rem] font-mono text-emerald-400">
              {milestone.progress}/{milestone.max}
            </div>
          </div>
        </div>

        {/* Achievements Badge */}
        {achievementCount > 0 && (
          <div className="flex items-center justify-between text-[0.55rem] text-emerald-400/70 px-1">
            <span className="uppercase tracking-wider">Achievements</span>
            <span className="font-mono font-bold text-emerald-400">{achievementCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export const ExplorationCard = memo(ExplorationCardComponent, (prevProps, nextProps) => {
  return prevProps.onOpenFullMap === nextProps.onOpenFullMap;
});
