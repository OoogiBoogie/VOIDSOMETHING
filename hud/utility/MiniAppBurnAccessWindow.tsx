/**
 * Mini-App Burn Access Window
 * UI for unlocking premium mini-app features
 */

"use client"

import React, { useState } from 'react';
import { useMiniAppBurn } from '@/hooks/burn/useMiniAppBurn';
import { BurnConfirmationModal, BurnCategory } from './BurnConfirmationModal';
import { useAccount } from 'wagmi';

// Example mini-app features (these would come from a config/API in production)
const EXAMPLE_FEATURES = [
  {
    miniAppId: 'void-arcade',
    featureId: 'premium-games',
    name: 'Premium Game Library',
    description: 'Access exclusive arcade games',
    cost: '50,000',
    icon: '🎮',
  },
  {
    miniAppId: 'void-social',
    featureId: 'custom-emotes',
    name: 'Custom Emotes',
    description: 'Upload and use custom emotes',
    cost: '25,000',
    icon: '😎',
  },
  {
    miniAppId: 'void-marketplace',
    featureId: 'seller-tools',
    name: 'Seller Dashboard',
    description: 'Advanced seller analytics and tools',
    cost: '100,000',
    icon: '📊',
  },
  {
    miniAppId: 'void-events',
    featureId: 'host-events',
    name: 'Event Hosting',
    description: 'Create and host community events',
    cost: '75,000',
    icon: '🎉',
  },
];

interface MiniAppBurnAccessWindowProps {
  onClose: () => void;
}

export function MiniAppBurnAccessWindow({ onClose }: MiniAppBurnAccessWindowProps) {
  const { address } = useAccount();
  const { unlockFeature, useHasAccess, useFeaturePrice, isPending, isSuccess } = useMiniAppBurn();
  
  const [selectedFeature, setSelectedFeature] = useState<{ miniAppId: string; featureId: string; name: string; cost: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleUnlockClick = (feature: typeof EXAMPLE_FEATURES[0]) => {
    setSelectedFeature(feature);
    setShowConfirmModal(true);
  };

  const handleBurnExecute = () => {
    if (selectedFeature) {
      unlockFeature(selectedFeature.miniAppId, selectedFeature.featureId);
    }
  };

  const handleSuccess = () => {
    setShowConfirmModal(false);
    setSelectedFeature(null);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/50 rounded-lg shadow-2xl p-6 w-full max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              🚀 Mini-App Premium Features
            </h2>
            <p className="text-gray-400">
              Unlock permanent access to premium features • One-time VOID burn, lifetime access
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* One-Time Purchase Notice */}
        <div className="mb-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-green-400 font-bold text-sm mb-1">LIFETIME ACCESS - NO SUBSCRIPTIONS</h4>
              <p className="text-gray-300 text-xs">
                All features are <strong>one-time permanent unlocks</strong>. Pay once with VOID, access forever. No renewals, no recurring fees.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {EXAMPLE_FEATURES.map((feature) => {
            const hasAccess = useHasAccess(feature.miniAppId, feature.featureId);
            const actualPrice = useFeaturePrice(feature.miniAppId, feature.featureId);

            return (
              <div
                key={`${feature.miniAppId}-${feature.featureId}`}
                className={`relative border-2 rounded-lg p-5 transition-all ${
                  hasAccess
                    ? 'border-green-500/50 bg-green-900/10'
                    : 'border-purple-500/30 bg-purple-900/10 hover:border-purple-500/70'
                }`}
              >
                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  {hasAccess ? (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      ✓ OWNED
                    </span>
                  ) : (
                    <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-1 rounded">
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Feature icon */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{feature.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Mini-app ID */}
                <p className="text-xs text-gray-600 mb-3">
                  App: <span className="text-purple-500">{feature.miniAppId}</span>
                </p>

                {/* Cost */}
                <div className="mb-4">
                  <span className="text-purple-400 font-bold text-lg">
                    {feature.cost} VOID
                  </span>
                  {actualPrice && actualPrice !== '0' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {Number(actualPrice).toLocaleString()} VOID
                    </p>
                  )}
                </div>

                {/* Unlock button */}
                {!hasAccess && (
                  <button
                    onClick={() => handleUnlockClick(feature)}
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
                  >
                    {isPending ? 'Processing...' : '🔥 Unlock Permanently'}
                  </button>
                )}

                {hasAccess && (
                  <button
                    disabled
                    className="w-full bg-green-600/50 text-white font-bold py-3 rounded-lg cursor-not-allowed"
                  >
                    ✓ Lifetime Access
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Custom Feature Section (Admin/Developer tool) */}
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-400 mb-2">DEVELOPER NOTE:</h4>
          <p className="text-xs text-gray-500">
            Mini-apps can register custom features via the <code className="text-purple-400">registerMiniApp()</code> function.
            This UI shows example features. Production implementation should fetch registered features from on-chain or API.
          </p>
        </div>

        {/* Warning footer */}
        <div className="mt-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-red-400 font-bold text-sm mb-1">PERMANENT BURN WARNING</h4>
              <p className="text-gray-300 text-xs">
                VOID tokens are <strong>permanently destroyed</strong> when unlocking features. This action is <strong>irreversible</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Burn Confirmation Modal */}
      {showConfirmModal && selectedFeature && (
        <BurnConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          burnAmount={selectedFeature.cost.replace(/,/g, '')}
          category={BurnCategory.MINIAPP_ACCESS}
          actionName={`Unlock ${selectedFeature.name}`}
          spenderContract={process.env.NEXT_PUBLIC_MINIAPP_BURN_ACCESS as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`}
          onBurnExecute={handleBurnExecute}
          onSuccess={handleSuccess}
          metadata={`${selectedFeature.miniAppId}-${selectedFeature.featureId}`}
        />
      )}
    </>
  );
}
