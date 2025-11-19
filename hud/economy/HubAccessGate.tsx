/**
 * HUB ACCESS GATE MODAL (PHASE 5)
 * 
 * Soft-gating modal shown when users try to access locked hubs.
 * Explains requirements and directs to real estate system.
 */

'use client';

import React from 'react';
import type { HubAccessInfo, RealEstateTier } from '@/world/economy/realEstateUtility';

interface HubAccessGateProps {
  hubName: string;
  hubDistrictId: string;
  accessInfo: HubAccessInfo;
  onClose: () => void;
  onViewRealEstate: () => void;
}

export function HubAccessGate({
  hubName,
  hubDistrictId,
  accessInfo,
  onClose,
  onViewRealEstate,
}: HubAccessGateProps) {
  const { allowed, reason, tier, requiredTier, parcelsInDistrict, minParcelsRequired } = accessInfo;
  
  // Should not show if allowed
  if (allowed) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-black/95 border-2 border-red-500/40 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.3)] overflow-hidden">
        {/* Header */}
        <header className="px-5 py-3 border-b-2 border-red-500/30 bg-gradient-to-r from-black/60 to-red-950/20">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-[0.25em] text-red-400 font-bold">
              Hub Access Locked
            </h2>
            <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded text-red-400 text-[9px] font-bold uppercase tracking-wider">
              BETA
            </span>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-lg text-red-400 font-bold mb-2">{hubName}</h3>
            <p className="text-sm text-gray-400">
              This hub is gated for Void landholders and higher-tier agents.
            </p>
          </div>
          
          {/* Requirements */}
          <div className="p-4 bg-red-400/5 rounded-lg border border-red-400/20">
            <div className="text-xs text-red-400/80 uppercase tracking-wider mb-2">Requirements</div>
            
            {reason === 'INSUFFICIENT_TIER' ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Tier:</span>
                  <span className={`font-bold ${
                    tier === 'NONE' ? 'text-gray-500' :
                    tier === 'BRONZE' ? 'text-orange-400' :
                    tier === 'SILVER' ? 'text-gray-300' :
                    tier === 'GOLD' ? 'text-yellow-400' :
                    'text-cyan-400'
                  }`}>
                    {tier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Required Tier:</span>
                  <span className="text-red-400 font-bold">{requiredTier || 'N/A'}</span>
                </div>
                {minParcelsRequired > 0 && (
                  <div className="pt-2 border-t border-red-400/20 text-xs text-gray-500">
                    <strong>OR</strong> own {minParcelsRequired}+ parcel{minParcelsRequired > 1 ? 's' : ''} in {hubDistrictId} district
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Parcels in {hubDistrictId}:</span>
                  <span className="text-red-400 font-bold">{parcelsInDistrict}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Required:</span>
                  <span className="text-red-400 font-bold">{minParcelsRequired}+</span>
                </div>
                {requiredTier && requiredTier !== 'NONE' && (
                  <div className="pt-2 border-t border-red-400/20 text-xs text-gray-500">
                    <strong>OR</strong> reach {requiredTier} tier via real estate activity
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* CTA */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewRealEstate();
            }}
            className="w-full px-4 py-3 rounded-lg bg-amber-400/10 border-2 border-amber-400/40 hover:border-amber-400/70 transition-all text-amber-400 font-semibold text-sm uppercase tracking-wide"
          >
            View Real Estate
          </button>
          
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-gray-400/10 border border-gray-400/40 hover:border-gray-400/70 transition-all text-gray-400 text-xs uppercase tracking-wide"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
