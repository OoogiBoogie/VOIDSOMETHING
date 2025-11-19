'use client';

/**
 * ZONE MINI MAP
 * Top-right navigation widget showing district grid with real-time player tracking
 * Uses the unified district system from world/map/districts.ts
 */

import React, { memo } from 'react';
import { usePlayerState } from '@/state/player/usePlayerState';
import { DISTRICTS, getGridDimensions } from '@/world/map/districts';
import { worldToMinimap, getDistrictFromWorld, getCardinalDirection } from '@/world/map/mapUtils';
import { useDistrictEconomyMap } from '@/world/economy';
import { useSelectionState } from '@/state/selection/useSelectionState';

interface ZoneMiniMapProps {
  onOpenFullMap?: () => void;
}

function ZoneMiniMapComponent({ onOpenFullMap }: ZoneMiniMapProps) {
  const position = usePlayerState((s) => s.position);
  const stats = usePlayerState((s) => s.stats);
  const districtsVisited = stats?.totalDistrictsVisited ?? 0;
  
  // Get economy scores for subtle overlays
  const economyScores = useDistrictEconomyMap();
  
  // Get active selection for highlighting
  const { active } = useSelectionState();
  const activeDistrictId = active.districtId;

  // Early return if no position data
  if (!position) {
    return null;
  }

  // Get normalized map coordinates [0, 1]
  const { u, v } = worldToMinimap(position.x, position.z);

  // Get current district
  const currentDistrict = getDistrictFromWorld(position.x, position.z);

  // Get heading direction
  const heading = position.rotation ?? 0;
  const headingDegrees = (heading * 180) / Math.PI;
  const cardinalDirection = getCardinalDirection(heading);

  // Get grid dimensions
  const { columns, rows } = getGridDimensions();

  return (
    <div className="relative rounded-xl bg-black/80 backdrop-blur-xl border border-cyan-500/30 overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.2)]">
      {/* Header */}
      <div className="px-3 pt-2 pb-1.5 flex items-center justify-between border-b border-cyan-500/20 bg-gradient-to-r from-black/60 to-cyan-950/20">
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            ZONE MAP
          </div>
          <div className="text-[0.7rem] font-mono text-cyan-300 mt-0.5">
            ({Math.round(position.x)}, {Math.round(position.z)})
          </div>
        </div>

        {/* Compass */}
        <div className="flex flex-col items-center text-[0.55rem] font-mono mr-2">
          <span className="text-cyan-400 font-bold mb-0.5">N</span>
          <div className="flex items-center gap-2">
            <span className="text-cyan-500/60">W</span>
            <div className="w-4 h-4 rounded-full border border-cyan-400/50 relative bg-black/40">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              </div>
            </div>
            <span className="text-cyan-500/60">E</span>
          </div>
          <span className="text-cyan-500/60 mt-0.5">S</span>
        </div>

        {onOpenFullMap && (
          <button
            type="button"
            className="text-[0.6rem] font-mono tracking-[0.22em] uppercase text-cyan-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded border border-cyan-500/40 hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            onClick={onOpenFullMap}
          >
            FULL MAP ▸
          </button>
        )}
      </div>

      {/* Map Grid */}
      <div className="relative m-2 rounded-lg overflow-hidden" style={{ 
        width: '220px', 
        height: '140px',
        background: 'linear-gradient(135deg, rgba(0,15,30,0.95), rgba(0,20,40,0.95))'
      }}>
        {/* Grid background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6,182,212,0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6,182,212,0.3) 1px, transparent 1px)
          `,
          backgroundSize: `${100 / columns}% ${100 / rows}%`,
        }} />

        {/* District cells */}
        <div className="absolute inset-0" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '1px',
        }}>
          {DISTRICTS.map((district) => {
            const isCurrent = currentDistrict?.id === district.id;
            const isActive = activeDistrictId === district.id;
            const economyScore = economyScores[district.id] || 0;
            
            // Subtle economy tint (only for unlocked districts)
            const economyTint = !district.locked && economyScore > 0
              ? `rgba(6,182,212,${Math.max(0.05, economyScore * 0.15)})`
              : undefined;

            return (
              <div
                key={district.id}
                className={`relative border transition-all duration-200
                  ${isCurrent ? 'bg-cyan-500/10 border-cyan-400/40' : isActive ? 'border-amber-400/60' : 'border-white/5'}
                  ${district.locked ? 'opacity-40' : 'opacity-100'}
                  ${isActive ? 'ring-1 ring-amber-400/40' : ''}
                `}
                style={{
                  gridColumn: district.gridX + 1,
                  gridRow: district.gridY + 1,
                  borderColor: isCurrent ? district.color : isActive ? '#fbbf24' : 'rgba(255,255,255,0.05)',
                  boxShadow: isCurrent ? `0 0 12px ${district.color}40` : isActive ? '0 0 10px rgba(251,191,36,0.5)' : 'none',
                  backgroundColor: economyTint,
                }}
              >
                {/* District name label (only for non-locked, current district) */}
                {isCurrent && !district.locked && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center text-[0.45rem] font-bold uppercase tracking-wider opacity-60 pointer-events-none"
                    style={{ color: district.color }}
                  >
                    {district.id}
                  </div>
                )}

                {/* Lock icon for locked districts */}
                {district.locked && (
                  <div className="absolute bottom-0.5 right-0.5 text-[0.5rem] opacity-50">
                    🔒
                  </div>
                )}

                {/* Corner accent for current district */}
                {isCurrent && (
                  <div 
                    className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 opacity-80"
                    style={{ borderColor: district.color }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Player marker */}
        <div
          className="absolute w-3 h-3 z-30 pointer-events-none"
          style={{
            left: `${u * 100}%`,
            top: `${v * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-cyan-400/60 animate-ping" />
          
          {/* Arrow pointing in heading direction */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `rotate(${headingDegrees}deg)`,
            }}
          >
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="px-3 py-1.5 border-t border-cyan-500/20 bg-gradient-to-r from-black/60 to-cyan-950/20">
        <div className="flex items-center justify-between text-[0.55rem] font-mono">
          <div className="text-cyan-400/70">
            {cardinalDirection} • {Math.round(headingDegrees)}°
          </div>
          <div className="text-cyan-400/70">
            {districtsVisited} District{districtsVisited !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export const ZoneMiniMap = memo(ZoneMiniMapComponent, (prevProps, nextProps) => {
  // Only re-render if onOpenFullMap function changes
  return prevProps.onOpenFullMap === nextProps.onOpenFullMap;
});
