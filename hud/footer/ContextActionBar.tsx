'use client';

/**
 * CONTEXT ACTION BAR - Dynamic interaction prompts
 */

import React from 'react';
import type { HubMode, HubTheme } from '@/hud/theme';

interface ContextAction {
  key: string;
  label: string;
  hub?: HubMode; // Optional: show only in specific hub
}

// Mock context actions based on player state
const MOCK_ACTIONS: ContextAction[] = [
  { key: 'E', label: 'OPEN VAULT', hub: 'DEFI' },
  { key: 'F', label: 'CREATE DROP', hub: 'CREATOR' },
  { key: 'R', label: 'VOTE', hub: 'DAO' },
  { key: 'G', label: 'ACCEPT GIG', hub: 'AGENCY' },
  { key: 'T', label: 'TRAIN AI', hub: 'AI_OPS' },
  { key: 'Q', label: 'QUICK MAP' }, // Always visible
  { key: 'TAB', label: 'INVENTORY' }, // Always visible
];

interface ContextActionBarProps {
  hubMode: HubMode;
  theme: HubTheme;
}

export default function ContextActionBar({
  hubMode,
  theme
}: ContextActionBarProps) {
  // Filter actions: show hub-specific + always-visible actions
  const visibleActions = MOCK_ACTIONS.filter(action => 
    !action.hub || action.hub === hubMode
  );

  return (
    <div className={`
      rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/30
      px-4 py-2 relative overflow-hidden
      transition-all duration-500
    `}>
      {/* chrome spines */}
      <div className="pointer-events-none absolute -left-10 bottom-0 h-full w-36 bg-[radial-gradient(circle_at_0_100%,rgba(0,255,157,0.25),transparent_55%)] opacity-60 blur-sm" />
      <div className="pointer-events-none absolute -right-8 bottom-0 h-full w-40 bg-[radial-gradient(circle_at_100%_100%,rgba(124,0,255,0.35),transparent_55%)] opacity-60 blur-sm" />

      <div className="relative flex items-center gap-4 justify-center flex-wrap">
        {visibleActions.map(action => (
          <div 
            key={action.key}
            className="flex items-center gap-1.5"
          >
            <div 
              className={`
                px-2 py-1 rounded font-bold text-[10px]
                transition-all duration-300
              `}
              style={{
                borderColor: theme.borderColor,
                borderWidth: '1px',
                borderStyle: 'solid',
                color: theme.borderColor,
                background: `${theme.borderColor}15`
              }}
            >
              [{action.key}]
            </div>
            <div className="text-[11px] text-bio-silver/70 tracking-wide">
              {action.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
