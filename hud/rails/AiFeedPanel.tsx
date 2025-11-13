'use client';

/**
 * AI FEED PANEL - AI agent logs filtered by hub
 */

import React from 'react';
import type { HubMode, HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';

interface AiLogEntry {
  id: string;
  timestamp: string;
  agentName: string;
  hub: HubMode;
  message: string;
  type: 'info' | 'success' | 'alert';
}

// Mock AI logs
const MOCK_AI_LOGS: AiLogEntry[] = [
  { id: '1', timestamp: '2m ago', agentName: 'VOID_SCOUT', hub: 'WORLD', message: 'New zone discovered: NEON_RUINS', type: 'info' },
  { id: '2', timestamp: '5m ago', agentName: 'CREATE_BOT', hub: 'CREATOR', message: 'Drop verified: PSX_ART_001', type: 'success' },
  { id: '3', timestamp: '12m ago', agentName: 'DEFI_WATCHER', hub: 'DEFI', message: 'Price alert: VOID +15%', type: 'alert' },
  { id: '4', timestamp: '18m ago', agentName: 'DAO_CLERK', hub: 'DAO', message: 'Proposal passed: VOT-123', type: 'success' },
  { id: '5', timestamp: '22m ago', agentName: 'AGENCY_AI', hub: 'AGENCY', message: 'New gig available: Security', type: 'info' },
  { id: '6', timestamp: '30m ago', agentName: 'NEURAL_NET', hub: 'AI_OPS', message: 'Training complete: Model v4.2', type: 'success' },
];

interface AiFeedPanelProps {
  hubMode: HubMode;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

export default function AiFeedPanel({
  hubMode,
  onOpenWindow,
  theme
}: AiFeedPanelProps) {
  // Filter logs by current hub
  const filteredLogs = MOCK_AI_LOGS.filter(log => log.hub === hubMode);

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'success': return 'text-signal-green';
      case 'alert': return 'text-void-purple';
      default: return 'text-bio-silver/80';
    }
  };

  return (
    <div className={`
      rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/30
      p-4 relative overflow-hidden
      transition-all duration-500
    `}>
      {/* chrome corner glow */}
      <div className={`
        pointer-events-none absolute -top-4 -right-4 w-24 h-24 blur-2xl opacity-50
        bg-[radial-gradient(circle,${theme.chromeGlow},transparent_70%)]
      `} />

      <div className="relative">
        <button
          onClick={() => onOpenWindow('AI_OPS_PANEL')}
          className="w-full text-left group mb-3"
        >
          <h3 className="text-xs font-bold tracking-widest text-bio-silver/70 group-hover:text-bio-silver transition-colors flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: theme.borderColor }} />
            AI FEED · {hubMode}
          </h3>
        </button>

        <div className="flex flex-col gap-2">
          {filteredLogs.length === 0 ? (
            <div className="text-xs text-bio-silver/40 italic py-4 text-center">
              No AI activity
            </div>
          ) : (
            filteredLogs.slice(0, 4).map(log => (
              <button
                key={log.id}
                onClick={() => onOpenWindow('AI_OPS_PANEL')}
                className={`
                  group text-left p-2 rounded-lg bg-bio-dark-bone/30 border border-bio-silver/10
                  hover:bg-bio-dark-bone/50 hover:border-bio-silver/30
                  transition-all duration-300
                  relative overflow-hidden
                `}
              >
                {/* chrome spine */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-0.5`}
                  style={{ background: theme.spineColor }}
                />

                <div className="pl-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-[10px] font-bold text-bio-silver/80">
                      {log.agentName}
                    </div>
                    <div className="text-[9px] text-bio-silver/50">
                      {log.timestamp}
                    </div>
                  </div>
                  <div className={`text-[11px] ${getTypeColor(log.type)}`}>
                    {log.message}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {filteredLogs.length > 4 && (
          <button
            onClick={() => onOpenWindow('AI_OPS_PANEL')}
            className="w-full mt-2 text-[10px] text-bio-silver/60 hover:text-bio-silver transition-colors text-center py-1"
          >
            + {filteredLogs.length - 4} more logs
          </button>
        )}
      </div>
    </div>
  );
}
