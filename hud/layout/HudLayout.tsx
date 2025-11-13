'use client';

/**
 * HUD LAYOUT - Main layout with header/footer/3-column body
 * Layout A: PlayerChip | HubStrip | MiniMap in header
 * 3 columns: LeftRail | Center (GameShell) | RightRail
 * Footer: ContextActionBar | BottomDock
 */

import React from 'react';
import { GameShell } from '@/components/game-shell';
import PlayerChipV2 from '../header/PlayerChipV2';
import HubEconomyStrip from '../header/HubEconomyStrip';
import MiniMapPanel from '../header/MiniMapPanel';
import { LeftRail } from '../rails/LeftRail';
import { RightRail } from '../rails/RightRail';
import ContextActionBar from '../footer/ContextActionBar';
import BottomDock from '../footer/BottomDock';

type HubMode = 'WORLD' | 'CREATOR' | 'DEFI' | 'DAO' | 'AGENCY' | 'AI_OPS';

export const HudLayout: React.FC<any> = ({
  snapshot,
  chatState,
  playerState,
  hubMode,
  setHubMode,
  onOpenWindow,
  triggerFX,
  theme,
}) => {
  const hasNearbyPlayers = (snapshot.world?.nearbyPlayers ?? 0) > 0;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">
      {/* HEADER – unchanged A shell */}
      <header className="pointer-events-auto px-6 pt-4 pb-2 flex-none">
        <div
          className="
            rounded-3xl bg-black/75 backdrop-blur-3xl border border-bio-silver/40
            shadow-[0_0_40px_rgba(0,0,0,0.8)]
            relative overflow-hidden
          "
        >
          {/* chrome spines */}
          <div className="pointer-events-none absolute -left-10 top-0 h-full w-36 bg-[radial-gradient(circle_at_0_0,rgba(0,255,157,0.35),transparent_55%)] opacity-60" />
          <div className="pointer-events-none absolute -right-8 bottom-0 h-full w-40 bg-[radial-gradient(circle_at_100%_100%,rgba(124,0,255,0.45),transparent_55%)] opacity-60" />

          <div className="relative grid grid-cols-[minmax(0,24%)_minmax(0,52%)_minmax(0,24%)] gap-4 px-4 py-3 items-start">
            <PlayerChipV2
              snapshot={snapshot}
              playerState={playerState}
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
            />
          </div>
        </div>
      </header>

      {/* MAIN 3-COL BODY – NO SCROLL, A LAYOUT */}
      <main className="pointer-events-none flex-1 px-6 pb-4 overflow-hidden">
        <div className="grid grid-cols-[minmax(0,24%)_minmax(0,52%)_minmax(0,24%)] gap-4 h-full">
          {/* LEFT RAIL: missions + friends + global chat + signals (no scrollbars) */}
          <section className="pointer-events-auto flex flex-col gap-3 overflow-hidden">
            <LeftRail
              snapshot={snapshot}
              chatState={chatState}
              hubMode={hubMode}
              hasNearbyPlayers={hasNearbyPlayers}
              onOpenWindow={onOpenWindow}
              triggerFX={triggerFX}
              theme={theme}
            />
          </section>

          {/* CENTER SAFE PLAY COLUMN – GameShell renders here */}
          <section className="pointer-events-none relative">
            <GameShell />
          </section>

          {/* RIGHT RAIL: job board + hub dynamic panel (WORLD / CREATOR / DEFI / DAO / AGENCY / AI OPS) */}
          <section className="pointer-events-auto flex flex-col gap-3 overflow-hidden">
            <RightRail
              snapshot={snapshot}
              hubMode={hubMode}
              onOpenWindow={onOpenWindow}
              triggerFX={triggerFX}
              theme={theme}
            />
          </section>
        </div>
      </main>

      {/* FOOTER – A dock, unchanged behavior */}
      <footer className="pointer-events-auto px-6 pb-4 flex-none">
        <div className="flex flex-col items-center gap-2">
          <ContextActionBar
            hubMode={hubMode}
            theme={theme}
          />
          <BottomDock
            hubMode={hubMode}
            onOpenWindow={onOpenWindow}
            theme={theme}
          />
        </div>
      </footer>
    </div>
  );
};
