'use client';

/**
 * MULTI-TAB WINDOW SHELL
 * Reusable tabbed window component for PSX VOID HUD
 * Supports: Wallet, Swap, Land, Creator, DAO, AI, Missions, Analytics, Inventory, Settings
 */

import React, { useState } from 'react';
import WalletTab from './WalletTab';
import SwapTab from './SwapTab';
import LandTab from './LandTab';
import CreatorTab from './CreatorTab';
import DAOTab from './DAOTab';
import AITab from './AITab';
import MissionsTab from './MissionsTab';
import AnalyticsTab from './AnalyticsTab';
import InventoryTab from './InventoryTab';
import SettingsTab from './SettingsTab';

export type TabType = 
  | 'wallet' 
  | 'swap' 
  | 'land' 
  | 'creator' 
  | 'dao' 
  | 'ai' 
  | 'missions' 
  | 'analytics' 
  | 'inventory' 
  | 'settings';

interface Tab {
  id: TabType;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'wallet', label: 'WALLET', icon: '💼' },
  { id: 'swap', label: 'SWAP', icon: '💱' },
  { id: 'land', label: 'LAND', icon: '🌍' },
  { id: 'creator', label: 'CREATOR', icon: '🎨' },
  { id: 'dao', label: 'DAO', icon: '🏛' },
  { id: 'ai', label: 'AI', icon: '🧠' },
  { id: 'missions', label: 'MISSIONS', icon: '🎯' },
  { id: 'analytics', label: 'ANALYTICS', icon: '📊' },
  { id: 'inventory', label: 'INVENTORY', icon: '🧳' },
  { id: 'settings', label: 'SETTINGS', icon: '⚙️' },
];

interface MultiTabWindowProps {
  defaultTab?: TabType;
  onClose?: () => void;
}

export default function MultiTabWindow({ defaultTab = 'wallet', onClose }: MultiTabWindowProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  const renderTabContent = () => {
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
    <div className="w-full max-w-4xl h-[600px] flex flex-col bg-black/90 border border-bio-silver/40 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(124,0,255,0.3)]">
      {/* Window Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-bio-silver/30 bg-black/60">
        <div className="flex justify-between items-center">
          <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60">
            PSX VOID — MULTI-TAB INTERFACE
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-bio-silver/60 hover:text-red-400 transition-colors text-xl leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex-shrink-0 flex gap-1 px-4 py-2 bg-black/40 border-b border-bio-silver/20 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-3 py-1.5 rounded-lg font-mono text-[0.65rem] uppercase tracking-[0.2em] whitespace-nowrap transition-all
              ${activeTab === tab.id
                ? 'bg-void-purple/30 border border-void-purple text-void-purple shadow-[0_0_15px_rgba(124,0,255,0.4)]'
                : 'bg-black/40 border border-bio-silver/20 text-bio-silver/60 hover:text-bio-silver hover:border-bio-silver/40'
              }
            `}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {renderTabContent()}
      </div>

      {/* Window Footer */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-bio-silver/30 bg-black/60">
        <div className="flex justify-between items-center text-[0.6rem] font-mono text-bio-silver/60">
          <span>Build: PSX VOID v0.3.7 (Phase 3)</span>
          <span>Network: Base Sepolia (84532)</span>
          <span>Contracts: ✅ Verified</span>
        </div>
      </div>
    </div>
  );
}

// Coming Soon Placeholder Tab
function ComingSoonTab({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
      <div className="text-6xl mb-4">🚧</div>
      <div className="text-xl font-bold text-void-purple uppercase tracking-wider">{title}</div>
      <div className="text-sm text-bio-silver/60 max-w-md">{subtitle}</div>
      <div className="mt-6 p-4 bg-black/40 border border-void-purple/40 rounded text-[0.7rem] font-mono text-bio-silver/80">
        <div className="text-cyber-cyan mb-2">Phase 3 Implementation</div>
        <div>This module is scheduled for upcoming releases.</div>
        <div className="mt-2 text-bio-silver/60">Check back soon for updates!</div>
      </div>
    </div>
  );
}
