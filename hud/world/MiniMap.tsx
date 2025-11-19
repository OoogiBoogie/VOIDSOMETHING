'use client';

import React from 'react';
import { MapPin, Users, Maximize2, Vault, Vote, Palette, Briefcase, Brain } from 'lucide-react';
import { worldPosToPercent, type District as WorldDistrict } from '@/world/WorldCoords';
import type { WorldState } from '@/hud/types/economySnapshot';

type District = WorldState['districts'][number];

// Hub-tagged POIs (Points of Interest)
interface POI {
  id: string;
  hub: 'CREATOR' | 'DEFI' | 'DAO' | 'AGENCY' | 'AI_OPS';
  type: string; // 'vault', 'drop', 'proposal', 'gig', 'hotspot'
  position: { x: number; z: number };
  label: string;
  active: boolean;
}

interface MiniMapProps {
  // WORLD - Player state
  playerPosition: { x: number; z: number };
  districts: District[];
  nearbyPlayers: Array<{ x: number; z: number; username: string }>;
  
  // Hub-tagged POIs
  pois: POI[];
  
  // AI OPS - Hotspots
  aiHotspots: Array<{ x: number; z: number; reason: string }>;
  
  onMapClick: () => void;
}

const DISTRICT_FALLBACK_ORDER: WorldDistrict[] = ['dao', 'ai', 'defi', 'creator'];

const DISTRICT_FALLBACK_PERCENTS: Record<WorldDistrict, { xPct: number; zPct: number }> = {
  dao: { xPct: 25, zPct: 25 },
  ai: { xPct: 75, zPct: 25 },
  defi: { xPct: 25, zPct: 75 },
  creator: { xPct: 75, zPct: 75 },
  neutral: { xPct: 50, zPct: 50 },
};

const normalizeDistrictId = (id?: string | number, fallbackIndex = 0): WorldDistrict => {
  const value = typeof id === 'string' ? id.toLowerCase() : `${id}`;
  if (value.includes('defi')) return 'defi';
  if (value.includes('creator') || value.includes('creative')) return 'creator';
  if (value.includes('dao')) return 'dao';
  if (value.includes('ai')) return 'ai';
  return DISTRICT_FALLBACK_ORDER[fallbackIndex % DISTRICT_FALLBACK_ORDER.length] || 'neutral';
};

const getDistrictPercent = (district: District, index: number) => {
  if (district.bounds) {
    return worldPosToPercent({
      x: (district.bounds.x[0] + district.bounds.x[1]) / 2,
      z: (district.bounds.z[0] + district.bounds.z[1]) / 2,
    });
  }
  const normalized = normalizeDistrictId(district.id, index);
  return DISTRICT_FALLBACK_PERCENTS[normalized];
};

export default function MiniMap({
  playerPosition,
  districts,
  nearbyPlayers,
  pois,
  aiHotspots,
  onMapClick,
}: MiniMapProps) {
  // Convert world coordinates to minimap coordinates (0-100 scale)
  const playerMapPos = worldPosToPercent(playerPosition);
  
  // Hub icon/color mapping
  const getHubIcon = (hub: string) => {
    switch (hub) {
      case 'CREATOR': return { Icon: Palette, color: 'text-cyber-cyan' };
      case 'DEFI': return { Icon: Vault, color: 'text-void-purple' };
      case 'DAO': return { Icon: Vote, color: 'text-psx-blue' };
      case 'AGENCY': return { Icon: Briefcase, color: 'text-red-500' };
      case 'AI_OPS': return { Icon: Brain, color: 'text-signal-green' };
      default: return { Icon: MapPin, color: 'text-bio-silver' };
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={onMapClick}>
      {/* Chrome frame */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-signal-green via-cyber-cyan to-void-purple opacity-50 blur-sm group-hover:opacity-75 transition-opacity rounded-2xl" />
      
      <div className="relative bg-black/80 backdrop-blur-2xl border border-bio-silver/50 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,234,255,0.35)]">
        {/* Header */}
        <div className="px-3 py-2 border-b border-bio-silver/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="text-xs font-display text-cyber-cyan uppercase tracking-[0.2em]">Map</span>
          </div>
          <Maximize2 className="w-3 h-3 text-bio-silver/60 group-hover:text-signal-green transition-colors" />
        </div>

        {/* Map Canvas */}
        <div className="relative w-[180px] h-[180px] bg-void-deep p-2">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(199,216,255,0.5) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(199,216,255,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Districts (simplified) */}
          {districts.slice(0, 4).map((district, idx) => {
            const bounds = getDistrictPercent(district, idx);
            return (
              <div
                key={district.id}
                className="absolute w-16 h-16 rounded border opacity-20"
                style={{
                  left: `${bounds.xPct}%`,
                  top: `${bounds.zPct}%`,
                  borderColor: district.color,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            );
          })}

          {/* AI OPS - Hotspots */}
          {aiHotspots.map((hotspot, idx) => {
            const pos = worldPosToPercent({ x: hotspot.x, z: hotspot.z });
            return (
              <div
                key={`hotspot-${idx}`}
                className="absolute w-8 h-8 rounded-full bg-signal-green/20 border-2 border-signal-green animate-pulse"
                style={{
                  left: `${pos.xPct}%`,
                  top: `${pos.zPct}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={hotspot.reason}
              />
            );
          })}

          {/* Hub POIs - Creator/DeFi/DAO/Agency markers */}
          {pois.filter(poi => poi.active).slice(0, 10).map((poi) => {
            const pos = worldPosToPercent(poi.position);
            const { Icon, color } = getHubIcon(poi.hub);
            return (
              <div
                key={poi.id}
                className={`absolute ${color}`}
                style={{
                  left: `${pos.xPct}%`,
                  top: `${pos.zPct}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={`${poi.hub}: ${poi.label}`}
              >
                <Icon className="w-3 h-3" />
              </div>
            );
          })}

          {/* Nearby players */}
          {nearbyPlayers.map((player, idx) => {
            const pos = worldPosToPercent(player);
            return (
              <div
                key={idx}
                className="absolute w-2 h-2 rounded-full bg-psx-blue shadow-[0_0_8px_rgba(0,212,255,0.8)]"
                style={{
                  left: `${pos.xPct}%`,
                  top: `${pos.zPct}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={player.username}
              />
            );
          })}

          {/* Player position */}
          <div
            className="absolute w-3 h-3 rounded-full bg-signal-green shadow-[0_0_12px_rgba(0,255,157,1)] z-10"
            style={{
              left: `${playerMapPos.xPct}%`,
              top: `${playerMapPos.zPct}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="absolute inset-0 rounded-full bg-signal-green animate-ping opacity-75" />
          </div>

          {/* Direction indicator */}
          <div
            className="absolute w-6 h-6 border-t-2 border-r-2 border-signal-green opacity-60"
            style={{
              left: `${playerMapPos.xPct}%`,
              top: `${playerMapPos.zPct}%`,
              transform: 'translate(-50%, -50%) rotate(45deg)',
            }}
          />
        </div>

        {/* Footer - Hub POI count */}
        <div className="px-3 py-2 border-t border-bio-silver/20 flex items-center justify-between">
          <div className="text-[0.6rem] font-mono text-bio-silver/60">
            ({Math.floor(playerPosition.x)}, {Math.floor(playerPosition.z)})
          </div>
          <div className="flex items-center gap-2">
            {nearbyPlayers.length > 0 && (
              <div className="flex items-center gap-1 text-[0.6rem] text-psx-blue">
                <Users className="w-3 h-3" />
                <span>{nearbyPlayers.length}</span>
              </div>
            )}
            {pois.filter(p => p.active).length > 0 && (
              <div className="text-[0.6rem] text-signal-green">
                {pois.filter(p => p.active).length} POI
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
