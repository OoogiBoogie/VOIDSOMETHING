'use client';

/**
 * CHAT PANEL SPINY - Chrome spine chat with hub-colored messages
 */

import React, { useState } from 'react';
import type { HubMode, HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  hub: HubMode;
  timestamp: string;
}

// Mock chat messages
const MOCK_CHAT: ChatMessage[] = [
  { id: '1', username: 'CyberVoid42', message: 'Just staked 5k VOID, feeling bullish', hub: 'DEFI', timestamp: '2m ago' },
  { id: '2', username: 'PixelPunk', message: 'New drop just went live in Creator Hub!', hub: 'CREATOR', timestamp: '3m ago' },
  { id: '3', username: 'DAOWhale', message: 'Vote on VOT-123 ends in 1 hour', hub: 'DAO', timestamp: '5m ago' },
  { id: '4', username: 'Anon_7788', message: 'Anyone want to explore NEON_RUINS?', hub: 'WORLD', timestamp: '8m ago' },
  { id: '5', username: 'GlitchRunner', message: 'Looking for a dev gig, DM me', hub: 'AGENCY', timestamp: '10m ago' },
];

interface ChatPanelSpinyProps {
  hubMode: HubMode;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

export default function ChatPanelSpiny({
  hubMode,
  onOpenWindow,
  theme
}: ChatPanelSpinyProps) {
  const [inputValue, setInputValue] = useState('');

  // Get hub color for message spine
  const getHubSpineColor = (msgHub: HubMode): string => {
    const colors: Record<HubMode, string> = {
      'WORLD': '#00FF9D',
      'CREATOR': '#00D4FF',
      'DEFI': '#7C00FF',
      'DAO': '#3B82F6',
      'AGENCY': '#FF6B6B',
      'AI_OPS': '#BEFF00'
    };
    return colors[msgHub];
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    // Mock send - in real app would send to server
    console.log('Send message:', inputValue);
    setInputValue('');
  };

  return (
    <div className={`
      rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/30
      p-4 relative overflow-hidden
      transition-all duration-500
      flex flex-col h-[300px]
    `}>
      {/* chrome corner glow */}
      <div className={`
        pointer-events-none absolute -bottom-4 -right-4 w-24 h-24 blur-2xl opacity-50
        bg-[radial-gradient(circle,${theme.chromeGlow},transparent_70%)]
      `} />

      <div className="relative flex-1 flex flex-col">
        <button
          onClick={() => onOpenWindow('GLOBAL_CHAT')}
          className="w-full text-left group mb-3"
        >
          <h3 className="text-xs font-bold tracking-widest text-bio-silver/70 group-hover:text-bio-silver transition-colors flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
            GLOBAL CHAT
          </h3>
        </button>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-bio-silver/30 mb-3 pr-1">
          <div className="flex flex-col gap-2">
            {MOCK_CHAT.map(msg => (
              <div
                key={msg.id}
                className="relative pl-2"
              >
                {/* Chrome spine colored by message hub */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                  style={{ background: getHubSpineColor(msg.hub) }}
                />

                <div className="pl-2">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <div className="text-[10px] font-bold text-bio-silver/80">
                      {msg.username}
                    </div>
                    <div className="text-[9px] text-bio-silver/40">
                      {msg.timestamp}
                    </div>
                  </div>
                  <div className="text-[11px] text-bio-silver leading-relaxed">
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type message..."
            className={`
              flex-1 px-3 py-2 rounded-lg bg-bio-dark-bone/30 border border-bio-silver/20
              text-[11px] text-bio-silver placeholder:text-bio-silver/40
              focus:outline-none focus:border-bio-silver/50
              transition-all duration-300
            `}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`
              px-3 py-2 rounded-lg font-bold text-[10px]
              transition-all duration-300
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
            style={{
              background: inputValue.trim() ? theme.borderColor : 'transparent',
              borderColor: theme.borderColor,
              borderWidth: '1px',
              borderStyle: 'solid',
              color: inputValue.trim() ? '#000' : theme.borderColor
            }}
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}
