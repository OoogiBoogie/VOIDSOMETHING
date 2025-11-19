'use client';

/**
 * BOTTOM DOCK - 18 app icons with hub theming and demo mode support
 * 
 * ICON CLASSIFICATION:
 * 🟢 Live + Demo: Profile, Chat, Phone, Guilds, Map, Land, Property, Zones, Vault, Wallet, DAO, Agency, AI
 * 🟡 Demo-only: (none currently)
 * 🔴 Hidden (not for demo): Friends, Voice, Music, Minigames, Hub Selector (replaced with functional icons)
 */

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { isDemoMode } from '@/config/voidConfig';
import type { HubMode, HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';
import { 
  MessageSquare, Users, Shield, Mic, Music, Gamepad2, 
  Map, Layers, Vault, Wallet, Vote, Briefcase, Cpu, LayoutGrid,
  Home, Building2, User, MessageCircle, Grid3x3
} from 'lucide-react';
import { MiniAppDock } from '@/src/miniapps/MiniAppDock';

interface AppIcon {
  id: string;
  icon: React.ElementType;
  label: string;
  windowType: WindowType;
  hubHighlight?: HubMode; // Optional: glow in specific hub
  demoHidden?: boolean; // Hide in demo mode
}

const APPS: AppIcon[] = [
  // 🟢 SOCIAL (always visible, fully functional)
  { id: 'profile', icon: User, label: 'Profile', windowType: 'PLAYER_PROFILE' },
  { id: 'chat', icon: MessageCircle, label: 'Chat', windowType: 'GLOBAL_CHAT' },
  { id: 'phone', icon: MessageSquare, label: 'Phone', windowType: 'PHONE' },
  { id: 'guilds', icon: Shield, label: 'Guilds', windowType: 'GUILDS' },
  
  // 🔴 SOCIAL (hidden in demo mode - not essential for demo)
  { id: 'friends', icon: Users, label: 'Friends', windowType: 'FRIENDS', demoHidden: true },
  { id: 'voice', icon: Mic, label: 'Voice', windowType: 'VOICE_CHAT', demoHidden: true },
  { id: 'music', icon: Music, label: 'Music', windowType: 'MUSIC', demoHidden: true },
  { id: 'games', icon: Gamepad2, label: 'Games', windowType: 'MINIGAMES', demoHidden: true },
  
  // 🟢 WORLD hub apps (fully functional)
  { id: 'map', icon: Map, label: 'Map', windowType: 'WORLD_MAP', hubHighlight: 'WORLD' },
  { id: 'land', icon: Home, label: 'Land', windowType: 'LAND_REGISTRY', hubHighlight: 'WORLD' },
  { id: 'property', icon: Building2, label: 'Market', windowType: 'PROPERTY_MARKET', hubHighlight: 'WORLD' },
  { id: 'zones', icon: Layers, label: 'Zones', windowType: 'ZONE_BROWSER', hubHighlight: 'WORLD' },
  
  // 🟢 DEFI hub apps (fully functional)
  { id: 'vault', icon: Vault, label: 'DeFi', windowType: 'VAULT_DETAIL', hubHighlight: 'DEFI' },
  { id: 'wallet', icon: Wallet, label: 'Wallet', windowType: 'WALLET', hubHighlight: 'DEFI' },
  
  // 🟢 DAO hub apps (fully functional)
  { id: 'dao', icon: Vote, label: 'DAO', windowType: 'DAO_CONSOLE', hubHighlight: 'DAO' },
  
  // 🟢 AGENCY hub apps (fully functional)
  { id: 'agency', icon: Briefcase, label: 'Agency', windowType: 'AGENCY_BOARD', hubHighlight: 'AGENCY' },
  
  // 🟢 AI_OPS hub apps (fully functional)
  { id: 'ai', icon: Cpu, label: 'AI Ops', windowType: 'AI_OPS_PANEL', hubHighlight: 'AI_OPS' },
];

interface BottomDockProps {
  hubMode: HubMode;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

export default function BottomDock({
  hubMode,
  onOpenWindow,
  theme
}: BottomDockProps) {
  const { address } = useAccount();
  const demoMode = isDemoMode();

  // Filter apps based on current hub mode AND demo mode
  const visibleApps = APPS.filter(app => {
    // Hide if marked as demo-hidden and we're in demo mode
    if (demoMode && app.demoHidden) return false;
    
    // Always show social apps (that aren't demo-hidden)
    if (!app.hubHighlight) return true;
    
    // Show apps that match current hub
    return app.hubHighlight === hubMode;
  });

  return (
    <>
      <div className={`
        rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/30
        px-4 py-3 relative overflow-hidden
        transition-all duration-500
      `}>
        {/* chrome rainbow spine at top */}
        <div className="pointer-events-none absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-signal-green via-cyber-cyan via-void-purple via-psx-blue to-signal-green opacity-60" />

        <div className="relative flex items-center justify-center gap-2">
          {/* MINIAPP LAUNCHER - integrated with window system */}
          <MiniAppDock onOpenWindow={onOpenWindow} />

          {visibleApps.map(app => {
          const Icon: React.ElementType = app.icon;
          const isHighlighted = app.hubHighlight === hubMode;

          // Map certain window types to MULTI_TAB with specific default tabs
          const handleClick = () => {
            // Show "Coming Soon" ONLY for incomplete features that aren't hidden
            if (!demoMode && ['friends', 'voice', 'music', 'games'].includes(app.id)) {
              alert('🚧 Coming Soon!\n\nThis feature is currently under development and will be available in a future update.');
              return;
            }
            
            if (app.id === 'profile') {
              onOpenWindow('PLAYER_PROFILE', { address });
            } else if (app.id === 'wallet') {
              onOpenWindow('MULTI_TAB', { defaultTab: 'wallet' });
            } else if (app.id === 'vault') {
              onOpenWindow('MULTI_TAB', { defaultTab: 'swap' });
            } else {
              onOpenWindow(app.windowType);
            }
          };

          return (
            <button
              key={app.id}
              onClick={handleClick}
              className={`
                group relative p-3 rounded-xl border
                transition-all duration-300
                ${isHighlighted 
                  ? 'bg-bio-dark-bone/50 border-bio-silver/50' 
                  : 'bg-bio-dark-bone/20 border-bio-silver/20'
                }
                hover:bg-bio-dark-bone/60 hover:border-bio-silver/60
              `}
            >
              {/* Hub glow on highlighted apps */}
              {isHighlighted && (
                <div 
                  className="absolute inset-0 rounded-xl blur-md opacity-40 pointer-events-none"
                  style={{ background: theme.borderColor }}
                />
              )}

              {/* Lucide icon - className type conflict is cosmetic */}
              {React.createElement(Icon, {
                className: `w-5 h-5 relative z-10 transition-all duration-300 ${
                  isHighlighted 
                    ? 'text-white' 
                    : 'text-bio-silver/60 group-hover:text-bio-silver'
                }`
              })}

              {/* Tooltip on hover */}
              <div className={`
                absolute -top-8 left-1/2 -translate-x-1/2
                px-2 py-1 rounded bg-black/90 border border-bio-silver/40
                text-[9px] font-bold text-bio-silver whitespace-nowrap
                opacity-0 group-hover:opacity-100
                pointer-events-none
                transition-opacity duration-200
              `}>
                {app.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </>
  );
}
