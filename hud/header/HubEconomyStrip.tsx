'use client';

/**
 * HUB ECONOMY STRIP - Ticker + Hub Mode Switcher
 * Central economic console with clickable metrics and hub chips
 * OPTIMIZED: Memoized with custom comparison to prevent unnecessary re-renders
 * DEMO MODE: Displays "(Demo)" label when demo mode is active
 */

import React, { memo, useCallback } from 'react';
import { isDemoMode } from '@/config/voidConfig';
import type { HubMode, HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';
import type { EconomySnapshot } from '@/hud/types/economySnapshot';
import type { TabType } from '@/hud/tabs/MultiTabWindow';

interface HubEconomyStripProps {
  snapshot: EconomySnapshot;
  hubMode: HubMode;
  setHubMode: (mode: HubMode) => void;
  onOpenWindow: (type: WindowType, props?: any) => void;
  triggerFX: (fx: string, payload?: any) => void;
  theme: HubTheme;
}

const hubs: HubMode[] = ["WORLD", "CREATOR", "DEFI", "DAO", "AGENCY", "AI_OPS"];

function HubEconomyStripComponent({
  snapshot,
  hubMode,
  setHubMode,
  onOpenWindow,
  triggerFX,
  theme
}: HubEconomyStripProps) {
  const defi = snapshot.defi;
  const dao = snapshot.dao;
  const creator = snapshot.creator;

  // Safe number conversions (handles both string and number types)
  const voidPrice = typeof defi.voidPrice === 'string' ? parseFloat(defi.voidPrice) : (defi.voidPrice || 0);
  const voidChange24h = typeof defi.voidChange24h === 'string' ? parseFloat(defi.voidChange24h) : (defi.voidChange24h || 0);
  const psxBalance = typeof dao.psxBalance === 'string' ? parseFloat(dao.psxBalance) : (dao.psxBalance || 0);
  const emissionMultiplier = typeof defi.emissionMultiplier === 'string' ? parseFloat(defi.emissionMultiplier) : (defi.emissionMultiplier || 0);
  const signalEpoch = defi.signalEpoch || (defi as any).epoch || 0;

  const handleModeClick = useCallback((mode: HubMode) => {
    setHubMode(mode);
    triggerFX('hubSwitch', { mode });
  }, [setHubMode, triggerFX]);

  // Tab definitions matching IntegratedTabBar
  const ALL_TABS: Array<{ id: TabType; label: string; icon: string; hubMode?: HubMode }> = [
    { id: 'settings', label: 'SETTINGS', icon: '⚙️' },
    { id: 'inventory', label: 'INVENTORY', icon: '🧳' },
    { id: 'land', label: 'LAND', icon: '🌍', hubMode: 'WORLD' },
    { id: 'creator', label: 'CREATOR', icon: '🎨', hubMode: 'CREATOR' },
    { id: 'wallet', label: 'WALLET', icon: '💼', hubMode: 'DEFI' },
    { id: 'swap', label: 'SWAP', icon: '💱', hubMode: 'DEFI' },
    { id: 'dao', label: 'DAO', icon: '🏛', hubMode: 'DAO' },
    { id: 'missions', label: 'MISSIONS', icon: '🎯', hubMode: 'AGENCY' },
    { id: 'ai', label: 'AI', icon: '🧠', hubMode: 'AI_OPS' },
    { id: 'analytics', label: 'ANALYTICS', icon: '📊', hubMode: 'AI_OPS' },
  ];

  const visibleTabs = ALL_TABS.filter(tab => !tab.hubMode || tab.hubMode === hubMode);

  const handleTabClick = useCallback((tab: TabType) => {
    console.log('🎯 Header Tab Clicked:', tab, 'Opening MULTI_TAB window');
    onOpenWindow('MULTI_TAB', { defaultTab: tab });
    triggerFX('tabClick', { tab });
  }, [onOpenWindow, triggerFX]);
  
  // Determine price label based on demo mode
  const demoMode = isDemoMode();
  const priceLabel = demoMode ? '(Demo)' : '';

  return (
    <div className={`
      relative rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40
      overflow-hidden ${theme.chromeGlow}
      transition-all duration-500
    `}>
      {/* chrome spine line */}
      <div 
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, var(--void-neon-teal), var(--void-neon-purple), var(--void-neon-pink))' }}
      />

      {/* ticker row - DISPLAY ONLY (not clickable) */}
      <div className="px-3 pt-2 flex items-center justify-between text-[0.7rem] font-mono">
        <div className="text-bio-silver">
          VOID ${voidPrice.toFixed(4)} {priceLabel && <span className="text-[0.6rem] opacity-50">{priceLabel}</span>} · <span className={voidChange24h >= 0 ? 'text-signal-green' : 'text-red-400'}>{voidChange24h >= 0 ? '+' : ''}{voidChange24h.toFixed(1)}%</span>
        </div>
        <div className="text-bio-silver">
          PSX ${psxBalance.toFixed(4)} {priceLabel && <span className="text-[0.6rem] opacity-50">{priceLabel}</span>} · <span className={psxBalance >= 0 ? 'text-signal-green' : 'text-red-400'}>Voting Power</span>
        </div>
        <div className="text-bio-silver">
          CREATE · {creator.trendingDrops?.length || 0} drops
        </div>
        <div className="text-bio-silver">
          SIGNAL epoch {signalEpoch} · {emissionMultiplier.toFixed(1)}×
        </div>
      </div>

      {/* hub chips */}
      <div className="px-3 pb-2 pt-1 flex gap-2 text-[0.6rem] uppercase tracking-[0.25em]">
        {hubs.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => handleModeClick(h)}
            className={`
              relative px-2 py-1 rounded-full border transition-all duration-300
              ${h === hubMode
                ? `${theme.accentBorder} ${theme.accent} bg-black/80 shadow-[0_0_20px_currentColor]`
                : "border-bio-silver/40 text-bio-silver/60 hover:text-bio-silver hover:border-bio-silver/60"}
            `}
          >
            {h === 'AI_OPS' ? 'AI OPS' : h}
            {h === hubMode && (
              <span className="pointer-events-none absolute -inset-1 rounded-full border border-bio-silver/20 blur-[2px] opacity-80" />
            )}
          </button>
        ))}
      </div>

      {/* integrated tab buttons - adaptive to hub mode */}
      <div className="px-3 pb-2 flex gap-1 items-center justify-center border-t border-bio-silver/10 pt-2">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className="px-3 py-1.5 rounded-lg font-mono text-[0.65rem] uppercase tracking-[0.2em] whitespace-nowrap transition-all bg-black/40 border border-bio-silver/20 text-bio-silver/60 hover:text-bio-silver hover:border-bio-silver/40 hover:bg-void-purple/20"
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(HubEconomyStripComponent, (prevProps, nextProps) => {
  // Only re-render if critical data changed
  return (
    prevProps.hubMode === nextProps.hubMode &&
    prevProps.theme.spineColor === nextProps.theme.spineColor &&
    prevProps.snapshot.defi.voidPrice === nextProps.snapshot.defi.voidPrice &&
    prevProps.snapshot.defi.voidChange24h === nextProps.snapshot.defi.voidChange24h &&
    prevProps.snapshot.dao.psxBalance === nextProps.snapshot.dao.psxBalance &&
    prevProps.snapshot.defi.signalEpoch === nextProps.snapshot.defi.signalEpoch &&
    prevProps.snapshot.creator.trendingDrops?.length === nextProps.snapshot.creator.trendingDrops?.length
  );
});
