'use client';

/**
 * VOID HUD LAYOUT - 3-Column No-Scroll Structure
 * Header | Left Rail | Safe Zone | Right Rail | Footer
 */

import React from 'react';
import type { HubMode, HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';
import type { EconomySnapshot, PlayerState } from '@/hud/types/economySnapshot';
import VoidHudHeader from '@/hud/layout/VoidHudHeader';
import VoidLeftRail from '@/hud/layout/VoidLeftRail';
import VoidRightRail from '@/hud/layout/VoidRightRail';
import VoidHudFooter from '@/hud/layout/VoidHudFooter';

interface HudLayoutProps {
  snapshot: EconomySnapshot;
  playerState: PlayerState;
  hubMode: HubMode;
  setHubMode: (mode: HubMode) => void;
  onOpenWindow: (type: WindowType, props?: any) => void;
  triggerFX: (fx: string, payload?: any) => void;
  theme: HubTheme;
  fxState: any;
}

export default function VoidHudLayout({
  snapshot,
  playerState,
  hubMode,
  setHubMode,
  onOpenWindow,
  triggerFX,
  theme,
  fxState
}: HudLayoutProps) {
  const hasNearbyPlayers = (snapshot.world?.nearbyPlayers?.length ?? 0) > 0;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">
      {/* HEADER */}
      <VoidHudHeader
        snapshot={snapshot}
        playerState={playerState}
        hubMode={hubMode}
        setHubMode={setHubMode}
        onOpenWindow={onOpenWindow}
        triggerFX={triggerFX}
        theme={theme}
      />

      {/* MAIN 3-COL BODY */}
      <main className="pointer-events-none flex-1 px-6 pb-4 min-h-0">
        <div className="grid grid-cols-[minmax(0,24%)_minmax(0,52%)_minmax(0,24%)] gap-4 h-full">
          {/* LEFT RAIL - Missions, Social, Progress */}
          <section className="pointer-events-auto flex flex-col gap-3 overflow-y-auto">
            <VoidLeftRail
              snapshot={snapshot}
              hubMode={hubMode}
              onOpenWindow={onOpenWindow}
              theme={theme}
            />
          </section>

          {/* CENTER SAFE PLAY COLUMN - NO HUD */}
          <section className="pointer-events-none relative">
            {/* Optional: subtle chrome grid overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: 'linear-gradient(0deg, rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)',
                  backgroundSize: '60px 60px'
                }}
              />
            </div>
          </section>

          {/* RIGHT RAIL - Chat, Emission, AI Feed */}
          <section className="pointer-events-auto flex flex-col gap-3 overflow-y-auto">
            <VoidRightRail
              snapshot={snapshot}
              hubMode={hubMode}
              onOpenWindow={onOpenWindow}
              theme={theme}
            />
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <VoidHudFooter
        hubMode={hubMode}
        onOpenWindow={onOpenWindow}
        theme={theme}
      />
    </div>
  );
}
