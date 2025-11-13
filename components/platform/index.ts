// components/platform/index.ts
// Shared interfaces the HUD expects (keep narrow & stable)
import type React from "react";

export interface HUDProps {
  onOpenWindow: (id: string, args?: any) => void;
}

export interface PanelProps {
  title?: string;
}

// Required component contracts (names your app imports everywhere)
export type HUDContract = {
  Header: React.FC<PanelProps>;
  BottomDock: React.FC<HUDProps>;
  MiniMap: React.FC;
  ChatPanel: React.FC;
  StatsStrip: React.FC;
  // Add more as needed (Inventory, WorldMapButton, etc.)
};

// A no-op fallback for missing mobile parts so build never fails
export const Stub: React.FC<any> = () => null;
