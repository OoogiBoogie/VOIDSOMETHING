// components/mobile/lite/index.ts (LANDSCAPE)
"use client";

import * as React from "react";
import { HUDContract, Stub } from "@/components/platform";

export const LITE: HUDContract = {
  Header: ({ title }) => (
    <div className="px-3 py-2 text-xs text-[var(--void-text-primary)]">
      {title ?? "LITE"}
    </div>
  ),
  BottomDock: ({ onOpenWindow }) => (
    <div className="fixed bottom-0 inset-x-0 p-2 flex gap-2 justify-center">
      <button
        onClick={() => onOpenWindow("MULTI_TAB")}
        className="px-3 py-1.5 text-sm rounded-lg bg-[var(--void-surface-2)] hover:bg-[var(--void-surface-3)] text-[var(--void-text-primary)] transition-colors"
      >
        Economy
      </button>
      <button
        onClick={() => onOpenWindow("MAP")}
        className="px-3 py-1.5 text-sm rounded-lg bg-[var(--void-surface-2)] hover:bg-[var(--void-surface-3)] text-[var(--void-text-primary)] transition-colors"
      >
        Map
      </button>
    </div>
  ),
  MiniMap: () => (
    <div className="rounded-md h-24 w-24 bg-[var(--void-surface-2)] border border-[var(--void-border)]" />
  ),
  ChatPanel: Stub, // not ready yet? safe no-op
  StatsStrip: Stub,
};
