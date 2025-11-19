'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 * ⚠️ DEPRECATED — DO NOT USE
 * ═══════════════════════════════════════════════════════════════
 * 
 * This file is LEGACY and NOT rendered in the current HUD.
 * 
 * SUPERSEDED BY: hud/navigation/VoidCityMap.tsx
 * 
 * This component uses the old 4-district system (dao, ai, defi, creator)
 * which conflicts with the canonical 9-district system in world/map/districts.ts.
 * 
 * The active WORLD_MAP window is powered by VoidCityMap.tsx (see hud/VoidHudApp.tsx line 271).
 * 
 * This file is retained for reference only and may be deleted in Phase 8 cleanup.
 * 
 * DO NOT import or use this component.
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useMemo } from 'react';
import type { WorldState } from '@/hud/types/economySnapshot';
import type { WorldFeature } from '@/world/schema';
import { DISTRICT_COLORS, DISTRICT_NAMES, type District } from '@/world/WorldCoords';

interface WorldMapWindowProps {
  world?: WorldState;
  features?: WorldFeature[];
  focusDistrict?: District;
  onOpenWindow?: (type: string, props?: any) => void;
  onClose?: () => void;
  onTeleport?: (coords: { x: number; z: number }) => void;
}

const GRID_POSITIONS: Record<District, { colStart: number; colEnd: number; rowStart: number; rowEnd: number }> = {
  dao: { colStart: 1, colEnd: 5, rowStart: 1, rowEnd: 4 },
  ai: { colStart: 9, colEnd: 13, rowStart: 1, rowEnd: 4 },
  defi: { colStart: 1, colEnd: 5, rowStart: 5, rowEnd: 8 },
  creator: { colStart: 9, colEnd: 13, rowStart: 5, rowEnd: 8 },
  neutral: { colStart: 5, colEnd: 9, rowStart: 3, rowEnd: 6 },
};

const DEFAULT_DISTRICTS: District[] = ['dao', 'ai', 'defi', 'creator'];

const HUB_FILTERS = [
  { label: 'Creator Hubs', hub: 'CREATOR', accent: 'cyber' },
  { label: 'DeFi Vaults', hub: 'DEFI', accent: 'void' },
  { label: 'Agency Boards', hub: 'AGENCY', accent: 'red' },
  { label: 'DAO Terminals', hub: 'DAO', accent: 'psx' },
  { label: 'AI Ops', hub: 'AI_OPS', accent: 'signal' },
] as const;

const ACCENT_CLASS: Record<string, string> = {
  cyber: 'bg-cyber-cyan',
  void: 'bg-void-purple',
  red: 'bg-red-500',
  psx: 'bg-psx-blue',
  signal: 'bg-signal-green',
};

function normalizeDistrictId(id?: string | number): District {
  const value = typeof id === 'string' ? id.toLowerCase() : `${id}`;
  if (value.includes('defi')) return 'defi';
  if (value.includes('creator') || value.includes('creative')) return 'creator';
  if (value.includes('dao')) return 'dao';
  if (value.includes('ai')) return 'ai';
  return 'neutral';
}

function getCenter(bounds?: { x: [number, number]; z: [number, number] }) {
  if (!bounds) return undefined;
  return {
    x: Math.round((bounds.x[0] + bounds.x[1]) / 2),
    z: Math.round((bounds.z[0] + bounds.z[1]) / 2),
  };
}

export function WorldMapWindow({ world, features = [], focusDistrict, onOpenWindow, onTeleport }: WorldMapWindowProps) {
  const playerCoords = world?.coordinates ?? { x: 0, z: 0 };

  const districtCards = useMemo(() => {
    const source = world?.districts && world.districts.length > 0
      ? world.districts
      : DEFAULT_DISTRICTS.map(id => ({ id, name: DISTRICT_NAMES[id], color: DISTRICT_COLORS[id], bounds: undefined }));

    return source.map((district, idx) => {
      const normalized = normalizeDistrictId(district.id as string);
      const placement = GRID_POSITIONS[normalized] ?? GRID_POSITIONS.neutral;

      return {
        key: `${normalized}-${idx}`,
        id: normalized,
        name: district.name || DISTRICT_NAMES[normalized],
        color: district.color || DISTRICT_COLORS[normalized],
        bounds: district.bounds,
        placement,
      };
    });
  }, [world?.districts]);

  const featureCounts = useMemo(() => {
    return HUB_FILTERS.reduce<Record<string, number>>((acc, filter) => {
      acc[filter.hub] = features.filter(f => f.hub === filter.hub).length;
      return acc;
    }, {});
  }, [features]);

  const topFeatures = useMemo(() => {
    return [...features]
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 6);
  }, [features]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
            Current Position
          </div>
          <div className="text-[0.85rem] font-mono text-signal-green">
            ({playerCoords.x}, {playerCoords.z})
          </div>
        </div>
        <div className="text-right text-[0.6rem] uppercase tracking-[0.2em] text-bio-silver/60">
          <div>Online Friends</div>
          <div className="text-[0.85rem] font-mono text-cyber-cyan">
            {world?.onlineFriends ?? 0}
          </div>
        </div>
      </div>

      {/* big map grid */}
      <div className="flex-1 rounded-3xl bg-black/80 backdrop-blur-2xl border border-signal-green/60 shadow-[0_0_40px_rgba(0,255,157,0.7)] overflow-hidden flex">
        <div className="relative flex-1">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(0,255,157,0.2),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(124,0,255,0.3),transparent_55%)] opacity-60" />
          <div className="absolute inset-[8px] border border-bio-silver/30 grid grid-cols-12 grid-rows-8">
            {districtCards.map((district) => (
              <button
                key={district.key}
                type="button"
                onClick={() => {
                  onOpenWindow?.('agencyBoard', { districtId: district.id });
                  const target = getCenter(district.bounds);
                  if (target && onTeleport) {
                    onTeleport(target);
                  }
                }}
                className={`relative border border-bio-silver/15 group transition ${focusDistrict === district.id ? 'border-signal-green/80 shadow-[0_0_20px_rgba(0,255,157,0.4)]' : 'hover:border-signal-green/70'}`}
                style={{
                  gridColumn: `${district.placement.colStart} / ${district.placement.colEnd}`,
                  gridRow: `${district.placement.rowStart} / ${district.placement.rowEnd}`,
                }}
              >
                <span className="absolute left-1 top-1 text-[0.55rem] text-bio-silver/70 group-hover:text-signal-green transition">
                  {district.name}
                </span>
                <span
                  className="absolute right-1 bottom-1 text-[0.5rem] font-mono"
                  style={{ color: district.color }}
                >
                  {district.id.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* sidebar with filters */}
        <div className="w-64 border-l border-bio-silver/30 bg-black/85 flex flex-col">
          <div className="px-3 py-2 border-b border-bio-silver/30 text-[0.75rem] font-mono tracking-[0.22em] uppercase text-bio-silver/70">
            World Signals
          </div>
          <div className="px-3 py-3 flex flex-col gap-2 text-[0.7rem]">
            {HUB_FILTERS.map(filter => (
              <label key={filter.hub} className="flex items-center justify-between cursor-pointer hover:text-bio-silver transition">
                <span className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${ACCENT_CLASS[filter.accent]}`} />
                  <span className="text-bio-silver/80 text-[0.7rem]">{filter.label}</span>
                </span>
                <span className="text-cyber-cyan font-mono text-[0.65rem]">
                  {featureCounts[filter.hub] ?? 0}
                </span>
              </label>
            ))}
          </div>

          <div className="px-3 pb-3 flex-1 overflow-hidden">
            <div className="text-[0.65rem] uppercase tracking-[0.2em] text-bio-silver/60 mb-2">
              Active Nodes
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {topFeatures.length === 0 && (
                <div className="text-[0.65rem] text-bio-silver/50">
                  No tracked features yet.
                </div>
              )}
              {topFeatures.map(feature => (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => {
                    if (feature.worldPos && onTeleport) {
                      onTeleport({ x: feature.worldPos.x, z: feature.worldPos.z });
                    }
                  }}
                  className="w-full rounded-xl border border-bio-silver/20 px-3 py-2 text-left hover:border-signal-green/60 hover:bg-white/5 transition"
                >
                  <div className="text-[0.75rem] text-bio-silver flex items-center justify-between">
                    <span>{feature.label}</span>
                    <span className="text-[0.6rem] font-mono text-bio-silver/60">{feature.hub}</span>
                  </div>
                  <div className="text-[0.6rem] text-bio-silver/60 truncate">
                    {feature.description || feature.type}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
