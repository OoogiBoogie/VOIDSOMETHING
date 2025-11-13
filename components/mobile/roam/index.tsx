// components/mobile/roam/index.ts (PORTRAIT)
"use client";

import * as React from "react";
import { HUDContract, Stub } from "@/components/platform";

export const ROAM: HUDContract = {
  Header: ({ title }) => (
    <div className="px-3 py-2 text-xs text-[var(--void-text-primary)]">
      {title ?? "ROAM"}
    </div>
  ),
  BottomDock: ({ onOpenWindow }) => (
    <div className="fixed bottom-0 inset-x-0 p-2 grid grid-cols-3 gap-2">
      <button
        onClick={() => onOpenWindow("CHAT")}
        className="px-2 py-1.5 text-xs rounded-lg bg-[var(--void-surface-2)] hover:bg-[var(--void-surface-3)] text-[var(--void-text-primary)] transition-colors"
      >
        Chat
      </button>
      <button
        onClick={() => onOpenWindow("MULTI_TAB")}
        className="px-2 py-1.5 text-xs rounded-lg bg-[var(--void-surface-2)] hover:bg-[var(--void-surface-3)] text-[var(--void-text-primary)] transition-colors"
      >
        Hub
      </button>
      <button
        onClick={() => onOpenWindow("PROFILE")}
        className="px-2 py-1.5 text-xs rounded-lg bg-[var(--void-surface-2)] hover:bg-[var(--void-surface-3)] text-[var(--void-text-primary)] transition-colors"
      >
        Me
      </button>
    </div>
  ),
  MiniMap: () => (
    <div className="rounded-md h-20 w-20 bg-[var(--void-surface-2)] border border-[var(--void-border)]" />
  ),
  ChatPanel: Stub,
  StatsStrip: Stub,
};
