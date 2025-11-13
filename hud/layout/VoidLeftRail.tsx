'use client';

/**
 * VOID LEFT RAIL - Missions | Social | Achievements
 */

import React from 'react';
import type { HubMode, HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';
import type { EconomySnapshot } from '@/hud/types/economySnapshot';
import MissionList from '@/hud/rails/MissionList';
import SocialSnapshot from '@/hud/rails/SocialSnapshot';

interface VoidLeftRailProps {
  snapshot: EconomySnapshot;
  hubMode: HubMode;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

export default function VoidLeftRail({
  snapshot,
  hubMode,
  onOpenWindow,
  theme
}: VoidLeftRailProps) {
  return (
    <aside className="flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-bio-silver/30 pr-2">
      <MissionList
        hubMode={hubMode}
        onOpenWindow={onOpenWindow}
        theme={theme}
      />
      <SocialSnapshot
        snapshot={snapshot}
        onOpenWindow={onOpenWindow}
        theme={theme}
      />
    </aside>
  );
}
