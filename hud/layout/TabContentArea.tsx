'use client';

/**
 * TAB CONTENT RENDERER - Shows active tab content below header
 */

import React from 'react';
import type { TabType } from '@/hud/tabs/MultiTabWindow';
import WalletTab from '@/hud/tabs/WalletTab';
import SwapTab from '@/hud/tabs/SwapTab';
import LandTab from '@/hud/tabs/LandTab';
import CreatorTab from '@/hud/tabs/CreatorTab';
import DAOTab from '@/hud/tabs/DAOTab';
import AITab from '@/hud/tabs/AITab';
import MissionsTab from '@/hud/tabs/MissionsTab';
import AnalyticsTab from '@/hud/tabs/AnalyticsTab';
import InventoryTab from '@/hud/tabs/InventoryTab';
import SettingsTab from '@/hud/tabs/SettingsTab';

interface TabContentAreaProps {
  activeTab: TabType;
  onClose?: () => void;
}

function ComingSoonTab({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-bio-silver/60">
      <div className="text-4xl mb-4">🚧</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm">{subtitle}</p>
    </div>
  );
}

export default function TabContentArea({ activeTab, onClose }: TabContentAreaProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'wallet':
        return <WalletTab onClose={onClose} />;
      case 'swap':
        return <SwapTab onClose={onClose} />;
      case 'land':
        return <LandTab onClose={onClose} />;
      case 'creator':
        return <CreatorTab onClose={onClose} />;
      case 'dao':
        return <DAOTab onClose={onClose} />;
      case 'ai':
        return <AITab onClose={onClose} />;
      case 'missions':
        return <MissionsTab onClose={onClose} />;
      case 'analytics':
        return <AnalyticsTab onClose={onClose} />;
      case 'inventory':
        return <InventoryTab onClose={onClose} />;
      case 'settings':
        return <SettingsTab onClose={onClose} />;
      default:
        return <ComingSoonTab title="Coming Soon" subtitle="This tab is under construction" />;
    }
  };

  return (
    <div className="pointer-events-auto px-6 flex-none">
      <div className="rounded-2xl bg-black/90 border border-bio-silver/30 overflow-hidden shadow-[0_0_30px_rgba(124,0,255,0.2)] max-h-[400px]">
        <div className="p-4 overflow-y-auto h-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
