/**
 * SOCIAL HUB MINIAPP
 * 
 * Internal miniapp for global chat, DMs, and social features.
 * Wraps existing chat/social components.
 */

'use client';

import React, { useState } from 'react';
import { useVoidRuntime } from '../MiniAppManager';
import { GlobalChatWindow } from '@/hud/world/windows/GlobalChatWindow';
import { PhoneWindow } from '@/hud/world/windows/PhoneWindow';

type SocialView = 'global-chat' | 'dms' | 'friends';

/**
 * Social Hub Miniapp Component
 * 
 * Provides access to all social features in one place.
 */
export default function SocialHubApp() {
  const runtime = useVoidRuntime();
  const [view, setView] = useState<SocialView>('global-chat');
  
  return (
    <div className="h-full flex flex-col bg-black/90">
      {/* Header with view tabs */}
      <div className="px-4 py-3 border-b border-purple-500/30">
        <h2 className="text-lg font-bold text-purple-400 font-mono mb-2">
          SOCIAL HUB
        </h2>
        
        {/* View Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('global-chat')}
            className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
              view === 'global-chat'
                ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                : 'bg-black/50 text-gray-500 border border-gray-700 hover:border-purple-500/30'
            }`}
          >
            Global Chat
          </button>
          <button
            onClick={() => setView('dms')}
            className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
              view === 'dms'
                ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                : 'bg-black/50 text-gray-500 border border-gray-700 hover:border-purple-500/30'
            }`}
          >
            Direct Messages
          </button>
          <button
            onClick={() => setView('friends')}
            className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
              view === 'friends'
                ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                : 'bg-black/50 text-gray-500 border border-gray-700 hover:border-purple-500/30'
            }`}
          >
            Friends
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {view === 'global-chat' && (
          <div className="h-full p-4">
            <GlobalChatWindow />
          </div>
        )}
        
        {view === 'dms' && (
          <div className="h-full p-4">
            <PhoneWindow onClose={() => setView('global-chat')} />
          </div>
        )}
        
        {view === 'friends' && (
          <div className="h-full p-4 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">👥</div>
              <p className="font-mono">Friends list coming soon</p>
              <p className="text-xs mt-2">Connect with other agents in the VOID</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-2 border-t border-purple-500/30 text-xs text-gray-500 font-mono">
        <div className="flex justify-between">
          <span>Agent: {runtime.netProfile?.displayName || 'Anonymous'}</span>
          <span>Level: {runtime.netProfile?.level || 1}</span>
        </div>
      </div>
    </div>
  );
}
