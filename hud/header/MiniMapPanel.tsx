'use client';

/**
 * VOID — CANONICAL ZONE MAP (TOP-RIGHT HUD)
 *
 * This version:
 * - Uses world/map/districts.ts as the single source of truth for districts
 * - Uses world/map/mapUtils.ts for world→map coordinate transforms
 * - Still renders:
 *    - District overlays
 *    - Buildings (BOUND_BUILDINGS)
 *    - POIs
 *    - CORE_WORLD_FEATURES
 *    - AI hotspots
 *    - Player pulse marker
 * - No longer relies on WorldCoords DISTRICT_COLORS / DISTRICT_NAMES / worldPosToPercent
 *
 * All map-space percentages are derived from worldToMinimap + WORLD_BOUNDS.
 */

import React, { memo, useCallback, useMemo } from 'react';
import type { WindowType } from '@/hud/windowTypes';
import type { HubTheme } from '@/hud/theme';
import type { EconomySnapshot } from '@/hud/types/economySnapshot';
import { getHubSpineColor } from '@/hud/theme';

import {
  DISTRICTS,
  getDistrictById,
  type DistrictId,
} from '@/world/map/districts';
import {
  worldToMinimap,
  getDistrictFromWorld,
  getDistrictCenter,
} from '@/world/map/mapUtils';
import { useDistrictEconomyMap } from '@/world/economy';
import { useSelectionState } from '@/state/selection/useSelectionState';

import { CORE_WORLD_FEATURES } from '@/world/features';
import { BOUND_BUILDINGS } from '@/world/buildings';
import type { District as LegacyDistrict } from '@/world/WorldCoords';

interface MiniMapPanelProps {
  snapshot: EconomySnapshot;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
  onRequestTeleport?: (pos: { x: number; y?: number; z: number }) => void;
}

/**
 * Map legacy WorldCoords district ids → new DistrictId
 * Adjust this if you add/remove districts.
 */
function legacyToDistrictId(d: LegacyDistrict): DistrictId | null {
  switch (d) {
    case 'defi':
      return 'DEFI';
    case 'creator':
      return 'CREATOR';
    case 'dao':
      return 'DAO';
    case 'ai':
      return 'AI';
    case 'neutral':
    default:
      return null;
  }
}

/**
 * Resolve a color for a legacy district based on new district config.
 * Falls back to reasonable neon defaults if mapping fails.
 */
function getLegacyDistrictColor(d: LegacyDistrict): string {
  const mapped = legacyToDistrictId(d);
  if (mapped) {
    const def = getDistrictById(mapped);
    if (def?.color) return def.color;
  }

  // sensible fallbacks matching old palette
  switch (d) {
    case 'defi':
      return '#09f0c8';
    case 'creator':
      return '#ff3bd4';
    case 'dao':
      return '#8f3bff';
    case 'ai':
      return '#3b8fff';
    default:
      return '#888888';
  }
}

/**
 * Precompute district overlay zones in map-space percentages.
 * Each zone is derived from the district's worldRect and WORLD_BOUNDS via worldToMinimap.
 */
const DISTRICT_ZONES = DISTRICTS.map((district) => {
  const topLeft = worldToMinimap(
    district.worldRect.minX,
    district.worldRect.minZ,
  );
  const bottomRight = worldToMinimap(
    district.worldRect.maxX,
    district.worldRect.maxZ,
  );

  const u1 = topLeft.u;
  const v1 = topLeft.v;
  const u2 = bottomRight.u;
  const v2 = bottomRight.v;

  const xStart = Math.min(u1, u2) * 100;
  const xEnd = Math.max(u1, u2) * 100;
  const zStart = Math.min(v1, v2) * 100;
  const zEnd = Math.max(v1, v2) * 100;

  const center = getDistrictCenter(district);

  return {
    id: district.id,
    label: district.name,
    color: district.color,
    locked: district.locked ?? false,
    xStart,
    xEnd,
    zStart,
    zEnd,
    spawnPoint: {
      x: center.x,
      y: 1,
      z: center.z,
    },
  };
});

function MiniMapPanelComponent({
  snapshot,
  onOpenWindow,
  theme,
  onRequestTeleport,
}: MiniMapPanelProps) {
  const world = snapshot.world;
  const pois = snapshot.pois || [];
  const playerCoords = world.coordinates; // assumes { x, z } in same space as districts
  const aiHotspots = snapshot.aiOps.hotspots || [];
  
  // Get economy scores for subtle overlays
  const economyScores = useDistrictEconomyMap();
  
  // Get active selection for highlighting
  const { active } = useSelectionState();
  const activeDistrictId = active.districtId;

  // Player map position: derived from canonical worldToMinimap
  const { u: playerU, v: playerV } = worldToMinimap(
    playerCoords.x,
    playerCoords.z,
  );
  const playerMapX = playerU * 100;
  const playerMapZ = playerV * 100;

  // Current district for label / context
  const currentDistrict = useMemo(
    () => getDistrictFromWorld(playerCoords.x, playerCoords.z),
    [playerCoords.x, playerCoords.z],
  );

  const spineColor = theme.spineColor || getHubSpineColor(theme);

  const handleOpenWorldMap = useCallback(() => {
    onOpenWindow('WORLD_MAP', { world });
  }, [onOpenWindow, world]);

  const handleDistrictClick = useCallback(
    (districtId: DistrictId, spawnPoint: { x: number; y: number; z: number }) => {
      onOpenWindow('WORLD_MAP', { world, focusDistrict: districtId });
      console.log(`[MiniMap] Opening world map for ${districtId} district`);
      if (onRequestTeleport) {
        onRequestTeleport(spawnPoint);
      }
    },
    [onOpenWindow, onRequestTeleport, world],
  );

  const handlePOIClick = useCallback(
    (poi: any) => {
      if (poi.type === 'vault') onOpenWindow('VAULT_DETAIL', { vaultId: poi.id });
      if (poi.type === 'drop') onOpenWindow('DROP_DETAIL', { dropId: poi.id });
      if (poi.type === 'proposal')
        onOpenWindow('PROPOSAL_DETAIL', { proposalId: poi.id });
      if (poi.type === 'gig') onOpenWindow('JOB_DETAIL', { jobId: poi.id });
    },
    [onOpenWindow],
  );

  return (
    <div
      className="
      relative rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40
      overflow-hidden h-[200px] flex flex-col
    "
    >
      {/* Header with title, coords, compass, and map button */}
      <div className="px-3 pt-2 pb-1 flex items-center justify-between border-b border-bio-silver/20">
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
            Zone Map
          </div>
          <div className={`text-[0.7rem] font-mono ${theme.accent}`}>
            ({Math.floor(playerCoords.x)}, {Math.floor(playerCoords.z)})
          </div>
          {currentDistrict && (
            <div className="text-[0.55rem] text-bio-silver/60">
              {currentDistrict.name}
            </div>
          )}
        </div>

        {/* Compass (simple for now, can be tied into rotation later) */}
        <div className="flex flex-col items-center text-[0.6rem] font-mono text-bio-silver/60 mr-2">
          <span className="text-emerald-400 font-semibold">N</span>
          <div className="flex items-center gap-2 my-0.5">
            <span className="text-bio-silver/50">W</span>
            <div className="w-4 h-4 rounded-full border border-bio-silver/40 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-signal-green shadow-[0_0_6px_rgba(0,255,157,0.8)]" />
              </div>
            </div>
            <span className="text-bio-silver/50">E</span>
          </div>
          <span className="text-bio-silver/50">S</span>
        </div>

        <button
          type="button"
          className={`text-[0.6rem] font-mono tracking-[0.22em] uppercase ${theme.accent} hover:text-signal-green transition-colors px-2 py-1 rounded border border-bio-silver/30 hover:border-signal-green/60`}
          onClick={handleOpenWorldMap}
        >
          FULL MAP ▸
        </button>
      </div>

      {/* Main map area */}
      <div
        className="relative flex-1 m-2 rounded-xl border border-bio-silver/30 overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,10,20,0.95), rgba(10,5,25,0.95))',
        }}
      >
        {/* Background lattice */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
            linear-gradient(to right, rgba(0,234,255,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,234,255,0.15) 1px, transparent 1px)
          `,
            backgroundSize: '25px 25px',
          }}
        />

        {/* District overlays derived from DISTRICTS/worldRect */}
        {DISTRICT_ZONES.map((zone) => {
          const economyScore = economyScores[zone.id] || 0;
          const economyTint = !zone.locked && economyScore > 0
            ? `${zone.color}${Math.round(economyScore * 25).toString(16).padStart(2, '0')}`
            : undefined;
          const isActive = activeDistrictId === zone.id;
            
          return (
          <button
            key={zone.id}
            type="button"
            className={`absolute transition-all duration-200 hover:bg-white/5 group cursor-pointer ${
              isActive ? 'ring-2 ring-amber-400' : ''
            }`}
            style={{
              left: `${zone.xStart}%`,
              top: `${zone.zStart}%`,
              width: `${zone.xEnd - zone.xStart}%`,
              height: `${zone.zEnd - zone.zStart}%`,
              borderColor: isActive ? '#fbbf24' : `${zone.color}40`,
              borderWidth: isActive ? 2 : 1,
              borderStyle: 'solid',
              backgroundColor: economyTint,
              boxShadow: isActive ? '0 0 18px rgba(251, 191, 36, 0.7)' : undefined,
            }}
            onClick={() => handleDistrictClick(zone.id, zone.spawnPoint)}
            title={`Click to travel to ${zone.label}`}
          >
            {/* District label */}
            <div className="absolute top-2 left-2 text-left pointer-events-none">
              <div
                className="text-[0.5rem] uppercase tracking-[0.25em] font-semibold opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ color: zone.color }}
              >
                {zone.label}
              </div>
              <div className="text-[0.45rem] text-bio-silver/50 mt-0.5">
                Click to travel
              </div>
            </div>

            {/* Corner accent */}
            <div
              className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 opacity-30 group-hover:opacity-60 transition-opacity"
              style={{ borderColor: zone.color }}
            />

            {zone.locked && (
              <div className="absolute top-2 right-2 text-[0.6rem]">
                🔒
              </div>
            )}
          </button>
          );
        })}

        {/* Buildings from BOUND_BUILDINGS */}
        {BOUND_BUILDINGS.slice(0, 30).map((binding) => {
          const { u, v } = worldToMinimap(
            binding.building.x,
            binding.building.z,
          );
          const color = getLegacyDistrictColor(binding.district as LegacyDistrict);

          return (
            <div
              key={binding.building.id}
              className="absolute w-1.5 h-1.5 z-5 opacity-60 hover:opacity-100 transition-opacity"
              style={{
                left: `${u * 100}%`,
                top: `${v * 100}%`,
                backgroundColor: color,
                boxShadow: `0 0 4px ${color}`,
                clipPath:
                  'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // diamond
              }}
              title={`${binding.building.type} (${binding.district})`}
            />
          );
        })}

        {/* POIs from snapshot */}
        {pois.map((poi) => {
          const { u, v } = worldToMinimap(poi.position.x, poi.position.z);
          const poiColor =
            poi.hub === 'CREATOR'
              ? '#00eaff'
              : poi.hub === 'DEFI'
              ? '#7c00ff'
              : poi.hub === 'DAO'
              ? '#00d4ff'
              : poi.hub === 'AGENCY'
              ? '#ff3b3b'
              : '#00ff9d';

          return (
            <button
              key={poi.id}
              type="button"
              className="absolute w-3 h-3 rounded-full z-10 hover:scale-150 transition-transform cursor-pointer"
              style={{
                left: `${u * 100}%`,
                top: `${v * 100}%`,
                backgroundColor: poiColor,
                boxShadow: `0 0 12px ${poiColor}`,
              }}
              title={poi.label}
              onClick={() => handlePOIClick(poi)}
            />
          );
        })}

        {/* World features (landmarks) */}
        {CORE_WORLD_FEATURES.map((feature) => {
          const { u, v } = worldToMinimap(
            feature.worldPos.x,
            feature.worldPos.z,
          );
          const featureColor =
            feature.hub === 'CREATOR'
              ? '#00eaff'
              : feature.hub === 'DEFI'
              ? '#7c00ff'
              : feature.hub === 'DAO'
              ? '#00d4ff'
              : feature.hub === 'AGENCY'
              ? '#ff3b3b'
              : feature.hub === 'AI_OPS'
              ? '#3b8fff'
              : '#00ff9d';

          return (
            <div
              key={feature.id}
              className="absolute w-2.5 h-2.5 z-8 opacity-90 hover:opacity-100 transition-opacity"
              style={{
                left: `${u * 100}%`,
                top: `${v * 100}%`,
                backgroundColor: featureColor,
                boxShadow: `0 0 10px ${featureColor}`,
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', // triangle
              }}
              title={feature.label}
            />
          );
        })}

        {/* AI hotspots */}
        {aiHotspots.map((hotspot, idx) => {
          const { u, v } = worldToMinimap(hotspot.x, hotspot.z);
          return (
            <div
              key={`hotspot-${idx}`}
              className="absolute w-5 h-5 rounded-full border-2 border-lime-300/80 animate-pulse z-5"
              style={{
                left: `${u * 100}%`,
                top: `${v * 100}%`,
                backgroundColor: 'rgba(190,255,50,0.15)',
                boxShadow: '0 0 15px rgba(190,255,50,0.5)',
              }}
              title={hotspot.reason}
            />
          );
        })}

        {/* Player marker — now driven by worldToMinimap + WORLD_BOUNDS */}
        <div
          className="absolute w-4 h-4 rounded-full z-30"
          style={{
            left: `${playerMapX}%`,
            top: `${playerMapZ}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Outer pulse ring */}
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-60"
            style={{
              backgroundColor: spineColor,
              boxShadow: `0 0 20px ${spineColor}`,
            }}
          />
          {/* Inner solid dot */}
          <div
            className="absolute inset-1 rounded-full border-2"
            style={{
              backgroundColor: spineColor,
              borderColor: 'rgba(255,255,255,0.8)',
              boxShadow: `0 0 15px ${spineColor}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(MiniMapPanelComponent, (prevProps, nextProps) => {
  // Only re-render if player position or POI count changed
  return (
    prevProps.snapshot.world.coordinates.x ===
      nextProps.snapshot.world.coordinates.x &&
    prevProps.snapshot.world.coordinates.z ===
      nextProps.snapshot.world.coordinates.z &&
    prevProps.snapshot.pois?.length === nextProps.snapshot.pois?.length &&
    prevProps.theme.spineColor === nextProps.theme.spineColor &&
    prevProps.onRequestTeleport === nextProps.onRequestTeleport
  );
});
