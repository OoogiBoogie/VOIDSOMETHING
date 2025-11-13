// components/desktop/index.ts
"use client";

import * as React from "react";
import { HUDContract } from "@/components/platform";

export const DESKTOP: HUDContract = {
  Header: ({ title }) => (
    <div className="px-4 py-2 text-[var(--void-text-primary)]">
      {title ?? "DESKTOP"}
    </div>
  ),
  BottomDock: ({ onOpenWindow }) => (
    <div className="fixed bottom-0 inset-x-0 p-3 flex gap-3 justify-center">
      <button
        onClick={() => onOpenWindow("MULTI_TAB")}
        className="px-4 py-2 rounded-lg bg-[var(--void-surface-2)] hover:bg-[var(--void-surface-3)] text-[var(--void-text-primary)] transition-colors"
      >
        Economy
      </button>
      <button
        onClick={() => onOpenWindow("LAND")}
        className="px-4 py-2 rounded-lg bg-[var(--void-surface-2)] hover:bg-[var(--void-surface-3)] text-[var(--void-text-primary)] transition-colors"
      >
        Land
      </button>
      <button
        onClick={() => onOpenWindow("SWAP")}
        className="px-4 py-2 rounded-lg bg-[var(--void-surface-2)] hover:bg-[var(--void-surface-3)] text-[var(--void-text-primary)] transition-colors"
      >
        Swap
      </button>
    </div>
  ),
  MiniMap: () => (
    <div className="rounded-md h-28 w-28 bg-[var(--void-surface-2)] border border-[var(--void-border)]" />
  ),
  ChatPanel: () => (
    <div className="panel h-40 w-72 bg-[var(--void-surface-1)] border border-[var(--void-border)] rounded-lg p-3">
      Chat
    </div>
  ),
  StatsStrip: () => (
    <div className="panel h-10 w-80 bg-[var(--void-surface-1)] border border-[var(--void-border)] rounded-lg p-2">
      Stats
    </div>
  ),
};
