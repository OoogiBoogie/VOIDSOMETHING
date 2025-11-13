'use client';

/**
 * INTEGRATED TAB BAR - In Header, Opens Floating Windows
 * Shows tabs based on hub mode - clicking opens MULTI_TAB window
 */

import React from 'react';
import type { HubMode, HubTheme } from '@/hud/theme';
import type { TabType } from '@/hud/tabs/MultiTabWindow';
import type { WindowType } from '@/hud/windowTypes';

interface Tab {
  id: TabType;
  label: string;
  icon: string;
  hubMode?: HubMode; // Only show in specific hub
}

const ALL_TABS: Tab[] = [
  // Always available
  { id: 'settings', label: 'SETTINGS', icon: '⚙️' },
  { id: 'inventory', label: 'INVENTORY', icon: '🧳' },
  
  // WORLD hub tabs
  { id: 'land', label: 'LAND', icon: '🌍', hubMode: 'WORLD' },
  
  // CREATOR hub tabs
  { id: 'creator', label: 'CREATOR', icon: '🎨', hubMode: 'CREATOR' },
  
  // DEFI hub tabs
  { id: 'wallet', label: 'WALLET', icon: '💼', hubMode: 'DEFI' },
  { id: 'swap', label: 'SWAP', icon: '💱', hubMode: 'DEFI' },
  
  // DAO hub tabs
  { id: 'dao', label: 'DAO', icon: '🏛', hubMode: 'DAO' },
  
  // AGENCY hub tabs
  { id: 'missions', label: 'MISSIONS', icon: '🎯', hubMode: 'AGENCY' },
  
  // AI_OPS hub tabs
  { id: 'ai', label: 'AI', icon: '🧠', hubMode: 'AI_OPS' },
  { id: 'analytics', label: 'ANALYTICS', icon: '📊', hubMode: 'AI_OPS' },
];

interface IntegratedTabBarProps {
  hubMode: HubMode;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

export default function IntegratedTabBar({
  hubMode,
  onOpenWindow,
  theme
}: IntegratedTabBarProps) {
  // Filter tabs based on current hub mode
  const visibleTabs = ALL_TABS.filter(tab => {
    // Always show tabs without hubMode restriction
    if (!tab.hubMode) return true;
    // Show tabs that match current hub
    return tab.hubMode === hubMode;
  });

  const handleTabClick = (tab: TabType) => {
    // Open MULTI_TAB window with the selected tab
    onOpenWindow('MULTI_TAB', { defaultTab: tab });
  };

  return (
    <div className="flex gap-1 items-center justify-center">
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className="px-3 py-1.5 rounded-lg font-mono text-[0.65rem] uppercase tracking-[0.2em] whitespace-nowrap transition-all bg-black/40 border border-bio-silver/20 text-bio-silver/60 hover:text-bio-silver hover:border-bio-silver/40 hover:bg-void-purple/20"
        >
          <span className="mr-1">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
