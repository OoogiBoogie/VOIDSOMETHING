'use client';

/**
 * VOID CITY MAP MODAL
 * Full-screen GTA-style district map with player tracking and teleport
 * Uses the unified district system from world/map/districts.ts
 * Wired to PlayerPositionContext for direct teleportation
 * 
 * PHASE: REAL ESTATE + ECONOMY
 * Added economy view mode with district heatmaps and stats
 * 
 * PHASE 7: HUD SYNC + WORLD ALIGNMENT COMPLETE
 * Imported BUILDINGS from WorldLayout to show landmark counts per district
 * 3D world and HUD now use same building config
 */

import React, { memo, useState, useMemo } from 'react';
import { usePlayerState } from '@/state/player/usePlayerState';
import { usePlayerPosition } from '@/contexts/PlayerPositionContext';
import { DISTRICTS, getGridDimensions, type DistrictDefinition, type DistrictId } from '@/world/map/districts';
import { worldToMinimap, getDistrictFromWorld, getDistrictCenter } from '@/world/map/mapUtils';
import { useDistrictEconomy, useDistrictRewardStats, useDistrictEconomyMap, useParcelEconomy } from '@/world/economy';
import { useSelectionState } from '@/state/selection/useSelectionState';

// PHASE 7: Import buildings from WorldLayout for HUD/3D world sync
import { LANDMARK_BUILDINGS, getBuildingsInDistrict } from '@/world/config/WorldLayout';

interface VoidCityMapProps {
  onClose: () => void;
}

function VoidCityMapComponent({ onClose }: VoidCityMapProps) {
  const position = usePlayerState((s) => s.position);
  const stats = usePlayerState((s) => s.stats);
  const parcelsVisited = stats?.totalParcelsVisited ?? 0;
  const districtsVisited = stats?.totalDistrictsVisited ?? 0;
  
  // Get building counts per district for display
  const buildingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DISTRICTS.forEach(district => {
      counts[district.id] = getBuildingsInDistrict(district.id).length;
    });
    return counts;
  }, []);
  
  // DEBUG: Log render with state snapshot
  console.log('[HUD] VoidCityMap render', {
    hasPosition: !!position,
    position,
    parcelsVisited,
    districtsVisited,
    districtsCount: DISTRICTS.length,
    landmarkBuildingsCount: LANDMARK_BUILDINGS.length,
    buildingCounts,
  });
  
  // Economy mode toggle
  const [economyMode, setEconomyMode] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId | null>(null);
  
  // Active selection from 3D world
  const { active } = useSelectionState();
  const activeDistrictId = active.districtId;
  const activeParcelId = active.parcelId;
  
  // Use PlayerPositionContext for teleportation
  const { requestTeleport } = usePlayerPosition();
  
  // Get economy map for all districts (for heatmap rendering)
  const economyScores = useDistrictEconomyMap();
  
  // Get current district from player position
  const currentDistrict = useMemo(() => {
    return position ? getDistrictFromWorld(position.x, position.z) : null;
  }, [position]);
  
  // Displayed district = selected (in economy mode) or active (from building click) or current
  const displayedDistrict = selectedDistrict 
    ? DISTRICTS.find(d => d.id === selectedDistrict) 
    : activeDistrictId
    ? DISTRICTS.find(d => d.id === activeDistrictId)
    : currentDistrict;
    
  // Get economy stats using hooks for displayed district
  const { stats: displayedEconomy } = useDistrictEconomy(displayedDistrict?.id || null);
  const { xpPerMinuteEstimate, airdropWeight } = useDistrictRewardStats(displayedDistrict?.id || null);
  
  // Get parcel economy for active parcel
  const { stats: activeParcelStats } = useParcelEconomy(activeParcelId);

  // Get normalized map coordinates [0, 1] (with fallback for no position)
  const { u, v } = position 
    ? worldToMinimap(position.x, position.z)
    : { u: 0.5, v: 0.5 }; // Center of map if no position yet

  // Get heading direction (with fallback)
  const heading = position?.rotation ?? 0;
  const headingDegrees = (heading * 180) / Math.PI;

  // Get grid dimensions
  const { columns, rows } = getGridDimensions();

  const handleDistrictClick = (district: DistrictDefinition) => {
    if (district.locked) return;
    
    // In economy mode, select district for details instead of teleporting
    if (economyMode) {
      setSelectedDistrict(district.id);
      return;
    }
    
    const center = getDistrictCenter(district);
    requestTeleport({ x: center.x, y: 1, z: center.z });
    console.log(`[VoidCityMap] Teleporting to ${district.name} at (${Math.round(center.x)}, ${Math.round(center.z)})`);
  };
  
  // Helper to get heatmap color based on normalized economy score
  const getHeatmapColor = (score: number): string => {
    // score is normalized 0-1
    if (score > 0.75) return 'rgba(6,182,212,0.4)'; // Cyan - hot
    if (score > 0.5) return 'rgba(34,197,94,0.3)'; // Green - warm
    if (score > 0.25) return 'rgba(251,191,36,0.3)'; // Yellow - cool
    return 'rgba(148,163,184,0.2)'; // Gray - cold
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-2 sm:p-4">
      <div className="w-full max-w-7xl h-full max-h-[85vh] sm:max-h-[90vh] flex flex-col bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950 border-2 border-cyan-500/40 rounded-xl sm:rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.3)]">
        
        {/* Header */}
        <header className="flex items-center justify-between px-3 py-2 sm:px-6 sm:py-4 border-b-2 border-cyan-500/30 bg-black/40">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-3xl font-bold tracking-[0.15em] sm:tracking-[0.25em] uppercase bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 bg-clip-text text-transparent">
              VOID CITY MAP
            </h2>
            <p className="text-[10px] sm:text-sm text-cyan-400/60 mt-0.5 sm:mt-1 tracking-wide truncate">
              {economyMode ? 'ECONOMY VIEW' : 'SELECT DISTRICT'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Economy mode toggle */}
            <button
              type="button"
              onClick={() => setEconomyMode(!economyMode)}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 transition-all text-[10px] sm:text-sm font-bold tracking-wide ${
                economyMode
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-black/60 border-cyan-500/40 text-cyan-400/60 hover:border-cyan-400/60'
              }`}
            >
              <span className="hidden sm:inline">{economyMode ? '📊 ECONOMY VIEW' : '🗺️ MAP VIEW'}</span>
              <span className="sm:hidden">{economyMode ? '📊' : '🗺️'}</span>
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all text-xl sm:text-2xl font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              aria-label="Close map"
            >
              ×
            </button>
          </div>
        </header>

        {/* Body - Two column layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: Map Grid */}
          <div className="flex-1 flex items-center justify-center p-8 relative">
            {/* Zoom controls placeholder */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button className="w-10 h-10 rounded-lg bg-black/60 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all text-xl font-bold flex items-center justify-center">
                +
              </button>
              <button className="w-10 h-10 rounded-lg bg-black/60 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all text-xl font-bold flex items-center justify-center">
                −
              </button>
            </div>

            {/* Map container */}
            <div 
              className="relative rounded-2xl border-2 border-cyan-500/30 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.2)]"
              style={{ 
                width: '600px', 
                height: '600px',
                background: 'linear-gradient(135deg, rgba(0,20,40,0.95), rgba(0,30,50,0.95))'
              }}
            >
              {/* Grid background */}
              <div className="absolute inset-0 opacity-25" style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(6,182,212,0.4) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(6,182,212,0.4) 1px, transparent 1px)
                `,
                backgroundSize: `${100 / columns}% ${100 / rows}%`,
              }} />

              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="w-full h-full animate-pulse" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6,182,212,0.3) 2px, rgba(6,182,212,0.3) 4px)',
                }} />
              </div>

              {/* District grid */}
              <div className="absolute inset-0 p-4">
                <div 
                  className="w-full h-full relative"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    gap: '8px',
                  }}
                >
                  {DISTRICTS.map((district) => {
                    const isCurrent = currentDistrict?.id === district.id;
                    const isSelected = selectedDistrict === district.id;
                    const isActive = activeDistrictId === district.id;
                    const economyScore = economyScores[district.id] || 0;
                    const heatColor = economyMode ? getHeatmapColor(economyScore) : undefined;

                    return (
                      <button
                        key={district.id}
                        type="button"
                        disabled={district.locked}
                        onClick={() => handleDistrictClick(district)}
                        className={`
                          relative rounded-lg border-2 transition-all duration-300
                          ${district.locked 
                            ? 'bg-slate-900/40 border-slate-700/40 cursor-not-allowed opacity-50' 
                            : 'border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] cursor-pointer'
                          }
                          ${isCurrent ? 'border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.6)]' : ''}
                          ${isSelected ? 'border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.6)]' : ''}
                          ${isActive && !isSelected ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)]' : ''}
                        `}
                        style={{
                          gridColumn: district.gridX + 1,
                          gridRow: district.gridY + 1,
                          backgroundColor: economyMode && !district.locked ? heatColor : 'rgba(0,0,0,0.4)',
                          borderColor: isSelected ? '#a855f7' : isActive ? '#fbbf24' : isCurrent ? district.color : undefined,
                        }}
                      >
                        {/* Glow overlay for current district */}
                        {isCurrent && !economyMode && (
                          <div 
                            className="absolute inset-0 rounded-lg opacity-30 animate-pulse"
                            style={{ backgroundColor: district.color }}
                          />
                        )}
                        
                        {/* Economy rating badge */}
                        {economyMode && economyScore > 0 && !district.locked && (
                          <div className="absolute top-2 right-2 bg-black/80 border border-cyan-400/60 rounded px-2 py-1 text-xs font-mono font-bold text-cyan-400">
                            {Math.round(economyScore * 100)}
                          </div>
                        )}

                        {/* District name */}
                        <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
                          <div 
                            className={`text-lg font-bold uppercase tracking-wider mb-1 ${district.locked ? 'text-slate-600' : 'text-white'}`}
                            style={{ color: !district.locked ? district.color : undefined }}
                          >
                            {district.name}
                          </div>
                          
                          {district.locked && (
                            <div className="text-2xl opacity-60">🔒</div>
                          )}

                          {!district.locked && !economyMode && (
                            <div className="text-xs text-cyan-400/60 mt-1 space-y-0.5">
                              <div>
                                {buildingCounts[district.id] > 0 
                                  ? `${buildingCounts[district.id]} landmark${buildingCounts[district.id] > 1 ? 's' : ''}`
                                  : 'Click to travel'
                                }
                              </div>
                            </div>
                          )}
                          
                          {!district.locked && economyMode && (
                            <div className="text-xs text-cyan-400/80 mt-1 space-y-0.5">
                              <div>Economy: {Math.round(economyScore * 100)}</div>
                              <div className="text-green-400">Click for details</div>
                            </div>
                          )}
                        </div>

                        {/* Corner accents */}
                        {!district.locked && !economyMode && (
                          <>
                            <div 
                              className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 opacity-40"
                              style={{ borderColor: district.color }}
                            />
                            <div 
                              className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 opacity-40"
                              style={{ borderColor: district.color }}
                            />
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Player marker overlay */}
                <div
                  className="absolute w-8 h-8 z-50 pointer-events-none"
                  style={{
                    left: `${u * 100}%`,
                    top: `${v * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Outer pulse */}
                  <div className="absolute inset-0 rounded-full bg-cyan-400/40 animate-ping" />
                  
                  {/* Inner circle */}
                  <div className="absolute inset-2 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_20px_rgba(6,182,212,1)]" />
                  
                  {/* Direction arrow */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transform: `rotate(${headingDegrees}deg)` }}
                  >
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Map legend */}
            <div className="absolute bottom-4 left-8 bg-black/80 border border-cyan-500/40 rounded-lg px-4 py-3 backdrop-blur-lg">
              <div className="text-xs text-cyan-400/80 mb-2 uppercase tracking-wider font-bold">Legend</div>
              <div className="flex flex-col gap-1.5 text-xs text-cyan-300/70">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 border border-white shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                  <span>Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-cyan-400 bg-cyan-500/20" />
                  <span>Current District</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-lg opacity-60">🔒</div>
                  <span>Locked</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: District Info Panel */}
          <div className="w-96 border-l-2 border-cyan-500/30 bg-black/40 p-6 overflow-y-auto">
            {displayedDistrict ? (
              <div className="space-y-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-cyan-400/60 mb-2">
                    {selectedDistrict ? 'Selected District' : 'Current Location'}
                  </div>
                  <h3 
                    className="text-2xl font-bold uppercase tracking-wide mb-1"
                    style={{ color: displayedDistrict.color }}
                  >
                    {displayedDistrict.name}
                  </h3>
                  <div className="text-sm text-cyan-300/60">
                    {displayedDistrict.locked ? 'Status: Locked' : 'Status: Open for Exploration'}
                  </div>
                </div>

                {/* Economy Stats (when in economy mode) */}
                {economyMode && displayedEconomy && (
                  <div className="space-y-4">
                    {/* Economy rating */}
                    <div className="bg-black/60 rounded-lg p-4 border-2 border-purple-500/40">
                      <div className="text-xs text-purple-400/80 uppercase tracking-wider mb-2">Economy Rating</div>
                      <div className="flex items-end gap-2">
                        <div className="text-4xl font-bold text-purple-400">
                          {Math.round(displayedEconomy.economyRating)}
                        </div>
                        <div className="text-sm text-purple-400/60 mb-1">/100</div>
                      </div>
                      <div className="mt-2 h-2 bg-black/60 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all"
                          style={{ width: `${displayedEconomy.economyRating}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Key metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/60 rounded-lg p-3 border border-cyan-500/30">
                        <div className="text-xs text-cyan-400/60 uppercase tracking-wider mb-1">Parcels</div>
                        <div className="text-xl font-bold text-cyan-400">{displayedEconomy.parcelCount}</div>
                      </div>
                      <div className="bg-black/60 rounded-lg p-3 border border-cyan-500/30">
                        <div className="text-xs text-cyan-400/60 uppercase tracking-wider mb-1">Explored</div>
                        <div className="text-xl font-bold text-green-400">
                          {Math.round(displayedEconomy.exploredPct)}%
                        </div>
                      </div>
                      <div className="bg-black/60 rounded-lg p-3 border border-cyan-500/30">
                        <div className="text-xs text-cyan-400/60 uppercase tracking-wider mb-1">Buildings</div>
                        <div className="text-xl font-bold text-cyan-400">{displayedEconomy.buildingCount}</div>
                      </div>
                      <div className="bg-black/60 rounded-lg p-3 border border-cyan-500/30">
                        <div className="text-xs text-cyan-400/60 uppercase tracking-wider mb-1">For Sale</div>
                        <div className="text-xl font-bold text-yellow-400">{displayedEconomy.forSaleCount}</div>
                      </div>
                    </div>
                    
                    {/* Pricing */}
                    {displayedEconomy.forSaleCount > 0 && (
                      <div className="bg-black/60 rounded-lg p-4 border border-cyan-500/30">
                        <div className="text-xs text-cyan-400/60 uppercase tracking-wider mb-3">Market Pricing</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-cyan-300/70">Floor Price:</span>
                            <span className="font-mono font-bold text-green-400">
                              {displayedEconomy.floorPrice ? `$${displayedEconomy.floorPrice.toLocaleString()}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-cyan-300/70">Avg Price:</span>
                            <span className="font-mono font-bold text-cyan-400">
                              {displayedEconomy.avgPrice ? `$${Math.round(displayedEconomy.avgPrice).toLocaleString()}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-cyan-300/70">Top Parcel:</span>
                            <span className="font-mono font-bold text-purple-400">
                              {displayedEconomy.topParcelValue ? `$${Math.round(displayedEconomy.topParcelValue).toLocaleString()}` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Engagement bonuses */}
                    <div className="bg-gradient-to-br from-cyan-950/40 to-purple-950/40 rounded-lg p-4 border border-cyan-500/40">
                      <div className="text-xs text-cyan-400/80 uppercase tracking-wider mb-3">Engagement Bonuses</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-cyan-300/70">XP Multiplier:</span>
                          <span className="font-mono font-bold text-yellow-400">
                            {displayedEconomy.xpMultiplier.toFixed(1)}x
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-cyan-300/70">Airdrop Weight:</span>
                          <span className="font-mono font-bold text-purple-400">
                            {displayedEconomy.airdropWeight.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Teleport button */}
                    {!displayedDistrict.locked && (
                      <button
                        onClick={() => {
                          const center = getDistrictCenter(displayedDistrict);
                          requestTeleport({ x: center.x, y: 1, z: center.z });
                          setEconomyMode(false);
                        }}
                        className="w-full py-3 rounded-lg border-2 border-cyan-500/60 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-400 text-cyan-400 font-bold uppercase tracking-wide transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                      >
                        ⚡ Teleport to {displayedDistrict.name}
                      </button>
                    )}
                    
                    {/* Active Parcel (from building click) */}
                    {activeParcelId && activeParcelStats && (
                      <div className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 rounded-lg p-4 border-2 border-amber-500/40 mt-4">
                        <div className="text-xs text-amber-400/80 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                          Focused Parcel
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-amber-300/70">Parcel ID:</span>
                            <span className="font-mono font-bold text-amber-400">#{activeParcelId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-300/70">Status:</span>
                            <span className="font-mono text-cyan-400">
                              {activeParcelStats.owner ? 'Owned' : 'Available'}
                            </span>
                          </div>
                          {activeParcelStats.currentValue && activeParcelStats.currentValue > 0 && (
                            <div className="flex justify-between">
                              <span className="text-amber-300/70">Est. Value:</span>
                              <span className="font-mono font-bold text-green-400">
                                ${Math.round(activeParcelStats.currentValue).toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-amber-300/70">Visits:</span>
                            <span className="font-mono text-purple-400">{activeParcelStats.visitCount}</span>
                          </div>
                          {activeParcelStats.buildingCount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-amber-300/70">Buildings:</span>
                              <span className="font-mono text-cyan-400">{activeParcelStats.buildingCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Standard Stats (when NOT in economy mode) */}
                {!economyMode && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/60 rounded-lg p-4 border border-cyan-500/30">
                        <div className="text-xs text-cyan-400/60 uppercase tracking-wider mb-1">Parcels</div>
                        <div className="text-2xl font-bold text-cyan-400">
                          {displayedEconomy?.parcelCount || 400}
                        </div>
                      </div>
                      <div className="bg-black/60 rounded-lg p-4 border border-cyan-500/30">
                        <div className="text-xs text-cyan-400/60 uppercase tracking-wider mb-1">Discovered</div>
                        <div className="text-2xl font-bold text-cyan-400">{parcelsVisited}</div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-cyan-400/60 mb-2">
                        About
                      </div>
                      <p className="text-sm text-cyan-300/80 leading-relaxed">
                        {getDistrictDescription(displayedDistrict.id)}
                      </p>
                    </div>

                    {/* Coordinates */}
                    <div className="bg-black/60 rounded-lg p-4 border border-cyan-500/30">
                      <div className="text-xs text-cyan-400/60 uppercase tracking-wider mb-2">Your Position</div>
                      <div className="font-mono text-cyan-400">
                        {position ? (
                          <>
                            X: {Math.round(position.x)}<br />
                            Z: {Math.round(position.z)}<br />
                            Heading: {Math.round(headingDegrees)}°
                          </>
                        ) : (
                          <span className="text-cyan-400/40">Loading position...</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-cyan-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-cyan-400 mb-2">
                  {economyMode ? 'Select a District' : 'Select a District'}
                </h3>
                <p className="text-sm text-cyan-400/60 max-w-xs">
                  {economyMode 
                    ? 'Click any district on the map to view detailed economy stats and market data'
                    : 'Click any colored district on the map to view available properties and pricing'
                  }
                </p>
              </div>
            )}

            {/* Footer stats */}
            <div className="mt-8 pt-6 border-t border-cyan-500/30">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-400/60 mb-3">
                Exploration Progress
              </div>
              <div className="space-y-2 text-sm text-cyan-300/80">
                <div className="flex justify-between">
                  <span>Districts Explored:</span>
                  <span className="font-mono font-bold text-cyan-400">{districtsVisited}</span>
                </div>
                <div className="flex justify-between">
                  <span>Parcels Discovered:</span>
                  <span className="font-mono font-bold text-cyan-400">{parcelsVisited}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for district descriptions
function getDistrictDescription(districtId: string): string {
  const descriptions: Record<string, string> = {
    'HQ': 'The heart of PSX - central hub connecting all districts. Home to core facilities and the main plaza.',
    'DEFI': 'Financial innovation district. Trade, swap, and explore decentralized finance protocols.',
    'DAO': 'Governance and community decision-making district. Shape the future of The Void.',
    'CREATOR': 'Content creator hub. Build, design, and monetize your creations.',
    'AI': 'Artificial intelligence research district. Cutting-edge AI agents and automation.',
    'SOCIAL': 'Community gathering spaces and social experiences. Connect with other explorers.',
    'IDENTITY': 'Digital identity and reputation district. Manage your on-chain presence.',
    'CENTRAL_EAST': 'Reserved for future expansion. Stay tuned for updates.',
    'CENTRAL_SOUTH': 'Reserved for future expansion. Stay tuned for updates.',
  };
  return descriptions[districtId] || 'Explore this district to discover its secrets.';
}

export const VoidCityMap = memo(VoidCityMapComponent, (prevProps, nextProps) => {
  return prevProps.onClose === nextProps.onClose;
});
