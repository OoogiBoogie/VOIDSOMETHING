'use client';

/**
 * VOID HUD FOOTER - Context Bar | Bottom Dock
 */

import React from 'react';
import type { HubMode, HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';
import ContextActionBar from '@/hud/footer/ContextActionBar';
import BottomDock from '@/hud/footer/BottomDock';

interface VoidHudFooterProps {
  hubMode: HubMode;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

export default function VoidHudFooter({
  hubMode,
  onOpenWindow,
  theme
}: VoidHudFooterProps) {
  return (
    <footer className="pointer-events-auto px-6 pb-4 pt-2 flex-none">
      <div className="flex flex-col gap-2">
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
  );
}
