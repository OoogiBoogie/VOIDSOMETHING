/**
 * VOID DEX MINIAPP
 * 
 * Internal miniapp that wraps the existing DEX/swap functionality.
 * Reuses existing swap logic and components.
 */

'use client';

import React from 'react';
import { useVoidRuntime } from '../MiniAppManager';
import SwapTab from '@/hud/tabs/SwapTab';

/**
 * VOID DEX Miniapp Component
 * 
 * Displays the swap interface as a standalone miniapp.
 * Reuses the existing SwapTab component for consistency.
 */
export default function VoidDexApp() {
  const runtime = useVoidRuntime();
  
  return (
    <div className="h-full flex flex-col bg-black/80">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-500/30">
        <h2 className="text-lg font-bold text-cyan-400 font-mono">
          VOID DEX
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Decentralized token exchange
        </p>
      </div>
      
      {/* Swap Interface */}
      <div className="flex-1 overflow-y-auto">
        <SwapTab />
      </div>
      
      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-cyan-500/30 text-xs text-gray-500 font-mono">
        <div className="flex justify-between">
          <span>Connected: {runtime.walletAddress ? `${runtime.walletAddress.slice(0, 6)}...${runtime.walletAddress.slice(-4)}` : 'N/A'}</span>
          <span>XP: {runtime.xp?.current.toString() || '0'}</span>
        </div>
      </div>
    </div>
  );
}
