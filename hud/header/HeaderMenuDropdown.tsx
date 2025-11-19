'use client';

/**
 * HEADER MENU DROPDOWN - Quick Access Menu
 * Contains Agency, Real Estate, Marketplace, Leaderboard, and Seasonal Burn sections
 */

import React, { useState } from 'react';
import { Shield, Home, Store, Trophy, Flame, ChevronDown } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useRealEstatePerks } from '@/world/economy/realEstateUtility';
import type { WindowType } from '@/hud/windowTypes';
import type { HubTheme } from '@/hud/theme';
import type { EconomySnapshot } from '@/hud/types/economySnapshot';

interface HeaderMenuDropdownProps {
  snapshot: EconomySnapshot;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

export default function HeaderMenuDropdown({ snapshot, onOpenWindow, theme }: HeaderMenuDropdownProps) {
  const [expanded, setExpanded] = useState(false);
  const { address } = useAccount();
  const perks = useRealEstatePerks(address || undefined);
  
  const agencyRole = snapshot.agency?.myRole || 'None';
  const seasonalBurnEnabled = process.env.NEXT_PUBLIC_ENABLE_SEASONAL_BURN_UI === 'true';

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`
          w-full px-3 py-2 rounded-xl
          bg-black/80 backdrop-blur-2xl border border-bio-silver/40
          hover:border-signal-green/60 transition-all duration-300
          flex items-center justify-between gap-2
          ${expanded ? 'border-signal-green/60' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${theme.spineColor}`} />
          <span className="text-[0.7rem] text-bio-silver font-medium uppercase tracking-wide">
            MENU
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-bio-silver/60 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - Horizontal Grid Layout */}
      {expanded && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="rounded-xl bg-black/95 backdrop-blur-3xl border border-bio-silver/40 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden min-w-[400px]">
            <div className="p-3 space-y-2">
              {/* Top Row - Agency & Real Estate (Blue Section) */}
              <div className="grid grid-cols-2 gap-2">
                {/* Agency Role */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenWindow("AGENCY_BOARD", { agency: snapshot.agency });
                    setExpanded(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-red-400/10 border border-red-400/40 hover:border-red-400/70 hover:bg-red-400/20 transition-colors text-left"
                >
                  <div className="text-[0.55rem] text-bio-silver/60 uppercase tracking-wide mb-0.5">Agency Role</div>
                  <div className="text-[0.7rem] text-red-400 truncate font-medium">{agencyRole}</div>
                </button>

                {/* Real Estate Portfolio */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenWindow("REAL_ESTATE");
                    setExpanded(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/40 hover:border-amber-400/70 hover:bg-amber-400/20 transition-colors text-left"
                >
                  <div className="text-[0.55rem] text-bio-silver/60 uppercase tracking-wide mb-0.5">Real Estate</div>
                  {perks && perks.totalParcelsOwned > 0 ? (
                    <div className="text-[0.7rem] text-amber-400 truncate font-medium">
                      {perks.totalParcelsOwned} Parcels
                    </div>
                  ) : (
                    <div className="text-[0.7rem] text-amber-400 truncate font-medium">No land</div>
                  )}
                </button>
              </div>

              {/* Bottom Row - Marketplace & Leaderboard (Blue Section) */}
              <div className="grid grid-cols-2 gap-2">
                {/* Marketplace */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenWindow("REAL_ESTATE_MARKET");
                    setExpanded(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-green-400/10 border border-green-400/40 hover:border-green-400/70 hover:bg-green-400/20 transition-colors text-left"
                >
                  <div className="text-[0.55rem] text-bio-silver/60 uppercase tracking-wide mb-0.5">Marketplace</div>
                  <div className="text-[0.7rem] text-green-400 truncate font-medium">Browse Listings</div>
                </button>

                {/* Leaderboard */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenWindow("REAL_ESTATE_LEADERBOARD");
                    setExpanded(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-void-purple/10 border border-void-purple/40 hover:border-void-purple/70 hover:bg-void-purple/20 transition-colors text-left"
                >
                  <div className="text-[0.55rem] text-bio-silver/60 uppercase tracking-wide mb-0.5">Leaderboard</div>
                  <div className="text-[0.7rem] text-void-purple truncate font-medium">Top Landowners</div>
                </button>
              </div>

              {/* Seasonal Burn System (Orange Section) */}
              {seasonalBurnEnabled && (
                <>
                  <div className="border-t border-bio-silver/20 pt-2">
                    <div className="text-[0.55rem] text-orange-400/80 uppercase tracking-wider px-1 mb-2 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      🔥 Seasonal Burn
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {/* Season Dashboard */}
                      <button
                        type="button"
                        onClick={() => {
                          onOpenWindow("SEASON_DASHBOARD");
                          setExpanded(false);
                        }}
                        className="px-2 py-2 rounded-lg bg-orange-500/10 border border-orange-500/40 hover:border-orange-500/70 hover:bg-orange-500/20 transition-colors text-left"
                      >
                        <div className="text-[0.55rem] text-bio-silver/60 uppercase tracking-wide mb-0.5">Dashboard</div>
                        <div className="text-[0.65rem] text-orange-400 truncate font-medium">📊 Overview</div>
                      </button>

                      {/* Seasonal XP Panel */}
                      <button
                        type="button"
                        onClick={() => {
                          onOpenWindow("SEASONAL_XP");
                          setExpanded(false);
                        }}
                        className="px-2 py-2 rounded-lg bg-purple-500/10 border border-purple-500/40 hover:border-purple-500/70 hover:bg-purple-500/20 transition-colors text-left"
                      >
                        <div className="text-[0.55rem] text-bio-silver/60 uppercase tracking-wide mb-0.5">Seasonal XP</div>
                        <div className="text-[0.65rem] text-purple-400 truncate font-medium">⭐ Rewards</div>
                      </button>

                      {/* Seasonal Burn Actions */}
                      <button
                        type="button"
                        onClick={() => {
                          onOpenWindow("SEASONAL_ACTIONS");
                          setExpanded(false);
                        }}
                        className="px-2 py-2 rounded-lg bg-red-500/10 border border-red-500/40 hover:border-red-500/70 hover:bg-red-500/20 transition-colors text-left"
                      >
                        <div className="text-[0.55rem] text-bio-silver/60 uppercase tracking-wide mb-0.5">Burn XP</div>
                        <div className="text-[0.65rem] text-red-400 truncate font-medium">🔥 Earn XP</div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
