'use client';

/**
 * VOID HUD HEADER - Player | Economy | Map
 * Tabs now integrated INSIDE HubEconomyStrip
 */

import React from 'react';
import type { HubMode, HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';
import type { EconomySnapshot, PlayerState } from '@/hud/types/economySnapshot';
import PlayerChipV2 from '@/hud/header/PlayerChipV2';
import HubEconomyStrip from '@/hud/header/HubEconomyStrip';
import MiniMapPanel from '@/hud/header/MiniMapPanel';
import HeaderMenuDropdown from '@/hud/header/HeaderMenuDropdown';

interface VoidHudHeaderProps {
  snapshot: EconomySnapshot;
  playerState: PlayerState;
  hubMode: HubMode;
  setHubMode: (mode: HubMode) => void;
  onOpenWindow: (type: WindowType, props?: any) => void;
  triggerFX: (fx: string, payload?: any) => void;
  theme: HubTheme;
  onRequestTeleport?: (pos: { x: number; y?: number; z: number }) => void;
}

export default function VoidHudHeader({
  snapshot,
  playerState,
  hubMode,
  setHubMode,
  onOpenWindow,
  triggerFX,
  theme,
  onRequestTeleport
}: VoidHudHeaderProps) {
  return (
    <header className="pointer-events-auto px-6 pt-4 pb-2 flex-none relative z-[70]">
      <div className={`
        rounded-3xl bg-black/75 backdrop-blur-3xl border border-bio-silver/40
        shadow-[0_0_40px_rgba(0,0,0,0.8)]
        relative overflow-visible
        transition-all duration-500
      `}>
        {/* chrome spines */}
        <div className="pointer-events-none absolute -left-10 top-0 h-full w-36 bg-[radial-gradient(circle_at_0_0,rgba(0,255,157,0.35),transparent_55%)] opacity-60 blur-sm" />
        <div className="pointer-events-none absolute -right-8 bottom-0 h-full w-40 bg-[radial-gradient(circle_at_100%_100%,rgba(124,0,255,0.45),transparent_55%)] opacity-60 blur-sm" />

        {/* Single Row: Player | Menu | Economy (w/ integrated tabs) | Map */}
        <div className="relative px-4 py-3">
          <div className="grid grid-cols-[minmax(0,20%)_minmax(0,12%)_minmax(0,44%)_minmax(0,24%)] gap-3 items-start">
            <PlayerChipV2
              snapshot={snapshot}
              playerState={playerState}
              onOpenWindow={onOpenWindow}
              theme={theme}
            />
            <HeaderMenuDropdown
              snapshot={snapshot}
              onOpenWindow={onOpenWindow}
              theme={theme}
            />
            <HubEconomyStrip
              snapshot={snapshot}
              hubMode={hubMode}
              setHubMode={setHubMode}
              onOpenWindow={onOpenWindow}
              triggerFX={triggerFX}
              theme={theme}
            />
            <MiniMapPanel
              snapshot={snapshot}
              onOpenWindow={onOpenWindow}
              theme={theme}
              onRequestTeleport={onRequestTeleport}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
