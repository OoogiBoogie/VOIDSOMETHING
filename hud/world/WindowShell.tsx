'use client';

/**
 * WINDOW SHELL - Controlled center bay pop-ups
 * 
 * All clickable items open windows here at consistent size (70vw × 70vh)
 * Windows scroll internally, never overlap header/footer/rails
 */

import React from 'react';
import {
  DefiOverviewWindow,
  CreatorHubWindow,
  DaoConsoleWindow,
  AgencyBoardWindow,
  AIOpsConsoleWindow,
  MissionDetailWindow,
  WalletWindow,
  ZonesWindow,
  VoidHubWindow,
  CasinoWindow,
} from './windows/index';

export type WindowType =
  | "defiOverview"
  | "vaultDetail"
  | "creatorHub"
  | "dropDetail"
  | "daoConsole"
  | "proposalDetail"
  | "agencyBoard"
  | "jobDetail"
  | "aiOpsConsole"
  | "missionDetail"
  | "friendsList"
  | "wallet"
  | "zones"
  | "games"
  | "casino"
  | "voidHub";

interface ActiveWindow {
  type: WindowType;
  props?: any;
}

interface WindowShellProps {
  activeWindow: ActiveWindow | null;
  onClose: () => void;
}

export default function WindowShell({ activeWindow, onClose }: WindowShellProps) {
  if (!activeWindow) return null;
  const { type, props = {} } = activeWindow;

  return (
    <div className="pointer-events-auto flex items-center justify-center w-full h-full">
      <div className="relative w-[70vw] max-w-[1100px] h-[70vh] max-h-[70vh] rounded-[28px] bg-black/90 backdrop-blur-3xl border border-bio-silver/70 shadow-[0_0_60px_rgba(0,255,198,0.75)] overflow-hidden">
        {/* chrome rails */}
        <div 
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, var(--void-neon-teal), var(--void-neon-purple), var(--void-neon-pink))' }}
        />
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-[2px] bg-[radial-gradient(circle_at_50%_100%,rgba(0,255,198,0.55),transparent_60%)]" />

        {/* header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-bio-silver/40">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-signal-green via-bio-silver to-void-purple shadow-[0_0_16px_rgba(0,255,198,0.8)]" />
            <span className="text-[0.75rem] font-mono tracking-[0.25em] uppercase text-bio-silver/80">
              {labelForWindowType(type)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-bio-silver/60 bg-black/80 flex items-center justify-center text-sm text-bio-silver/80 hover:text-signal-green hover:border-signal-green/80 transition"
          >
            ✕
          </button>
        </div>

        {/* scrollable body */}
        <div className="p-4 h-[calc(100%-3rem)] overflow-auto">
          {renderWindowContent(type, props, onClose)}
        </div>
      </div>
    </div>
  );
}

function labelForWindowType(type: WindowType): string {
  switch (type) {
    case "defiOverview":
      return "DEFI · VAULT MATRIX";
    case "vaultDetail":
      return "DEFI · VAULT DETAIL";
    case "creatorHub":
      return "CREATOR · LAUNCH BAY";
    case "dropDetail":
      return "CREATOR · DROP";
    case "daoConsole":
      return "DAO · CONSOLE";
    case "proposalDetail":
      return "DAO · PROPOSAL";
    case "agencyBoard":
      return "AGENCY · JOB BOARD";
    case "jobDetail":
      return "AGENCY · GIG DETAIL";
    case "aiOpsConsole":
      return "AI OPS · CONTROL ROOM";
    case "missionDetail":
      return "MISSION · BRIEFING";
    case "wallet":
      return "BASE · WALLET";
    case "zones":
      return "WORLD · ZONES & LAND";
    case "games":
      return "WORLD · GAMES";
    case "casino":
      return "DEFI · CASINO POOL";
    case "voidHub":
      return "VOID · GLOBAL HUB";
    default:
      return "VOID · WINDOW";
  }
}

function renderWindowContent(type: WindowType, props: any, onClose: () => void): React.ReactNode {
  const sharedProps = { ...props, onClose };
  
  switch (type) {
    case "defiOverview":
      return <DefiOverviewWindow {...sharedProps} />;
    case "casino":
      return <CasinoWindow {...sharedProps} />;
    case "creatorHub":
      return <CreatorHubWindow {...sharedProps} />;
    case "daoConsole":
      return <DaoConsoleWindow {...sharedProps} />;
    case "agencyBoard":
      return <AgencyBoardWindow {...sharedProps} />;
    case "aiOpsConsole":
      return <AIOpsConsoleWindow {...sharedProps} />;
    case "missionDetail":
      return <MissionDetailWindow {...sharedProps} />;
    case "wallet":
      return <WalletWindow {...sharedProps} />;
    case "zones":
      return <ZonesWindow {...sharedProps} />;
    case "voidHub":
      return <VoidHubWindow {...sharedProps} />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-bio-silver/60">
          Window type "{type}" not yet implemented
        </div>
      );
  }
}
