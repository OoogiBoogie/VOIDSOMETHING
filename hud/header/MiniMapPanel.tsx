'use client';

/**
 * BIG MINIMAP PANEL - Landmarks, Districts, Clickable POIs
 * Large, legible map with full interaction
 * OPTIMIZED: Memoized with custom comparison + useCallback for event handlers
 */

import React, { memo, useCallback } from 'react';
import type { WindowType } from '@/hud/windowTypes';
import type { HubTheme } from '@/hud/theme';
import type { EconomySnapshot } from '@/hud/types/economySnapshot';
import { getHubSpineColor } from '@/hud/theme';
import { worldPosToPercent, WORLD_EXTENT } from '@/world/WorldCoords';
import { CORE_WORLD_FEATURES } from '@/world/features';
import { BOUND_BUILDINGS } from '@/world/buildings';

interface MiniMapPanelProps {
  snapshot: EconomySnapshot;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

function MiniMapPanelComponent({ snapshot, onOpenWindow, theme }: MiniMapPanelProps) {
  const world = snapshot.world;
  const districts = world.districts || [];
  const pois = snapshot.pois || [];
  const player = world.coordinates;
  const aiHotspots = snapshot.aiOps.hotspots || [];

  // Calculate player position on map (0-100%) using world coordinate system
  const playerWorldPos = { x: player.x, z: player.z };
  const { xPct: playerMapX, zPct: playerMapZ } = worldPosToPercent(playerWorldPos);

  const handleOpenWorldMap = useCallback(() => {
    onOpenWindow("WORLD_MAP", { world });
  }, [onOpenWindow, world]);

  const handleDistrictClick = useCallback((districtIndex: number) => {
    onOpenWindow("WORLD_MAP", { world, focusDistrict: districtIndex });
  }, [onOpenWindow, world]);

  const handlePOIClick = useCallback((poi: any) => {
    if (poi.type === 'vault') onOpenWindow("VAULT_DETAIL", { vaultId: poi.id });
    if (poi.type === 'drop') onOpenWindow("DROP_DETAIL", { dropId: poi.id });
    if (poi.type === 'proposal') onOpenWindow("PROPOSAL_DETAIL", { proposalId: poi.id });
    if (poi.type === 'gig') onOpenWindow("JOB_DETAIL", { jobId: poi.id });
  }, [onOpenWindow]);

  return (
    <div className="
      relative rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40
      overflow-hidden h-[160px] flex flex-col
    ">
      <div className="px-3 pt-2 pb-1 flex items-center justify-between">
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
            Zone Map
          </div>
          <div className={`text-[0.7rem] font-mono ${theme.accent}`}>
            ({player.x}, {player.z})
          </div>
        </div>

        {/* Compass like your sketch: N / E / S / W */}
        <div className="flex flex-col items-center text-[0.55rem] font-mono text-bio-silver/60 mr-4">
          <span className="text-emerald-300">N</span>
          <div className="flex items-center gap-3">
            <span>W</span>
            <span className="w-6 h-[1px] bg-bio-silver/60" />
            <span>E</span>
          </div>
          <span>S</span>
        </div>

        <button
          type="button"
          className={`text-[0.6rem] font-mono tracking-[0.22em] uppercase ${theme.accent} hover:text-signal-green transition-colors`}
          onClick={handleOpenWorldMap}
        >
          MAP ▸
        </button>
      </div>

      {/* big minimap area */}
      <div className="relative flex-1 m-2 rounded-2xl border border-bio-silver/30 overflow-hidden" style={{ background: 'var(--void-bg-deep)' }}>
        {/* lattice background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(0,255,157,0.25),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(124,0,255,0.4),transparent_55%)] opacity-60" />
        
        {/* district grid */}
        <div className="absolute inset-1 grid grid-cols-6 grid-rows-4 gap-px">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="border border-bio-silver/20 relative group hover:border-signal-green/40 transition-colors cursor-pointer"
              onClick={() => handleDistrictClick(i)}
            >
              <span className="absolute left-0.5 top-0 text-[0.45rem] text-bio-silver/40 group-hover:text-bio-silver/60">
                D{i + 1}
              </span>
            </div>
          ))}
        </div>

        {/* POIs from snapshot */}
        {pois.map((poi) => {
          const poiPos = worldPosToPercent(poi.position);
          const poiColor = poi.hub === 'CREATOR' ? 'bg-cyber-cyan' :
                          poi.hub === 'DEFI' ? 'bg-void-purple' :
                          poi.hub === 'DAO' ? 'bg-psx-blue' :
                          poi.hub === 'AGENCY' ? 'bg-red-400' :
                          'bg-signal-green';

          return (
            <button
              key={poi.id}
              type="button"
              className={`absolute w-2.5 h-2.5 rounded-full ${poiColor} shadow-[0_0_12px_currentColor] z-10 hover:scale-125 transition-transform`}
              style={{
                left: `${poiPos.xPct}%`,
                top: `${poiPos.zPct}%`,
              }}
              title={poi.label}
              onClick={() => handlePOIClick(poi)}
            />
          );
        })}

        {/* World features (landmarks) */}
        {CORE_WORLD_FEATURES.map((feature) => {
          const featurePos = worldPosToPercent(feature.worldPos);
          const featureColor = feature.hub === 'CREATOR' ? 'bg-cyber-cyan' :
                              feature.hub === 'DEFI' ? 'bg-void-purple' :
                              feature.hub === 'DAO' ? 'bg-psx-blue' :
                              feature.hub === 'AGENCY' ? 'bg-red-400' :
                              feature.hub === 'AI_OPS' ? 'bg-blue-400' :
                              'bg-signal-green';

          return (
            <div
              key={feature.id}
              className={`absolute w-2 h-2 ${featureColor} shadow-[0_0_8px_currentColor] z-8`}
              style={{
                left: `${featurePos.xPct}%`,
                top: `${featurePos.zPct}%`,
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', // Triangle for features
              }}
              title={feature.label}
            />
          );
        })}

        {/* AI hotspots */}
        {aiHotspots.map((hotspot, idx) => {
          const hotspotPos = worldPosToPercent({ x: hotspot.x, z: hotspot.z });
          return (
            <div
              key={`hotspot-${idx}`}
              className="absolute w-4 h-4 rounded-full bg-lime-300/20 border border-lime-300/60 animate-pulse z-5"
              style={{
                left: `${hotspotPos.xPct}%`,
                top: `${hotspotPos.zPct}%`,
              }}
              title={hotspot.reason}
            />
          );
        })}

        {/* player marker */}
        <div
          className={`absolute w-3 h-3 rounded-full border-2 ${theme.accentBorder} ${theme.spineColor}/40 shadow-[0_0_15px_currentColor] z-20`}
          style={{
            left: `${playerMapX}%`,
            top: `${playerMapZ}%`,
          }}
        >
          <div className="absolute inset-0 rounded-full bg-current animate-ping opacity-75" />
        </div>
      </div>
    </div>
  );
}

export default memo(MiniMapPanelComponent, (prevProps, nextProps) => {
  // Only re-render if player position or POI count changed
  return (
    prevProps.snapshot.world.coordinates.x === nextProps.snapshot.world.coordinates.x &&
    prevProps.snapshot.world.coordinates.z === nextProps.snapshot.world.coordinates.z &&
    prevProps.snapshot.pois?.length === nextProps.snapshot.pois?.length &&
    prevProps.theme.spineColor === nextProps.theme.spineColor
  );
});
