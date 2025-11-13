'use client';

/**
 * VOID RIGHT RAIL - Emission | AI Feed | Chat
 */

import React from 'react';
import type { HubMode, HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';
import type { EconomySnapshot } from '@/hud/types/economySnapshot';
import EmissionPanel from '@/hud/rails/EmissionPanel';
import AiFeedPanel from '@/hud/rails/AiFeedPanel';
import ChatPanelSpiny from '@/hud/rails/ChatPanelSpiny';

interface VoidRightRailProps {
  snapshot: EconomySnapshot;
  hubMode: HubMode;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

export default function VoidRightRail({
  snapshot,
  hubMode,
  onOpenWindow,
  theme
}: VoidRightRailProps) {
  return (
    <aside className="flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-bio-silver/30 pl-2">
      <EmissionPanel
        snapshot={snapshot}
        onOpenWindow={onOpenWindow}
        theme={theme}
      />
      <AiFeedPanel
        hubMode={hubMode}
        onOpenWindow={onOpenWindow}
        theme={theme}
      />
      <ChatPanelSpiny
        hubMode={hubMode}
        onOpenWindow={onOpenWindow}
        theme={theme}
      />
    </aside>
  );
}
