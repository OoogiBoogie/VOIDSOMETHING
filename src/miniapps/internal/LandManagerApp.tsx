/**
 * LAND MANAGER MINIAPP
 * 
 * Internal miniapp for viewing and managing land parcels.
 * Wraps existing land tab functionality.
 */

'use client';

import React from 'react';
import { useVoidRuntime } from '../MiniAppManager';
import LandTab from '@/hud/tabs/LandTab';

/**
 * Land Manager Miniapp Component
 * 
 * Displays land ownership and management interface.
 */
export default function LandManagerApp() {
  const runtime = useVoidRuntime();
  
  return (
    <div className="h-full flex flex-col bg-black/90">
      {/* Header */}
      <div className="px-4 py-3 border-b border-green-500/30">
        <h2 className="text-lg font-bold text-green-400 font-mono">
          LAND MANAGER
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          View and manage your VOID territories
        </p>
      </div>
      
      {/* Land Interface */}
      <div className="flex-1 overflow-y-auto">
        <LandTab />
      </div>
      
      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-green-500/30 text-xs text-gray-500 font-mono">
        <div className="flex justify-between">
          <span>Location: {runtime.netProfile?.lastSceneId || 'Unknown'}</span>
          <span>Wallet: {runtime.walletAddress ? `${runtime.walletAddress.slice(0, 6)}...${runtime.walletAddress.slice(-4)}` : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
