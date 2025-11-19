/**
 * MINIAPP DOCK
 * 
 * Launcher button that opens MiniApp launcher window.
 * Uses standard window system for consistency.
 */

'use client';

import React from 'react';
import { Grid } from 'lucide-react';
import type { WindowType } from '@/hud/windowTypes';

interface MiniAppDockProps {
  onOpenWindow: (type: WindowType, props?: any) => void;
}

/**
 * MiniApp Dock Button
 * 
 * Opens the MiniApp launcher as a standard window.
 */
export function MiniAppDock({ onOpenWindow }: MiniAppDockProps) {
  return (
    <button
      onClick={() => onOpenWindow('MINIAPP_LAUNCHER')}
      className="relative group px-4 py-2 rounded-xl bg-black/60 border border-bio-silver/40 hover:border-signal-green/60 flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(0,255,157,0.3)]"
    >
      <Grid className="w-5 h-5 text-bio-silver group-hover:text-signal-green transition-colors" />
      <span className="text-sm font-semibold text-bio-silver group-hover:text-signal-green transition-colors">
        Apps
      </span>
    </button>
  );
}
