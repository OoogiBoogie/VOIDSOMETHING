/**
 * Creator Tools Window
 * UI for unlocking Creator Tiers 1-3
 */

"use client"

import React, { useState } from 'react';
import { useCreatorBurn } from '@/hooks/burn/useCreatorBurn';
import { BurnConfirmationModal, BurnCategory } from './BurnConfirmationModal';
import { useAccount } from 'wagmi';

// Creator tier data
const CREATOR_TIERS = [
  {
    tier: 1,
    name: 'Basic Creator',
    cost: '100,000',
    color: 'from-blue-500 to-cyan-500',
    icon: '🎨',
    tools: ['Basic 3D Assets', 'Simple Scripting', 'Community Templates', 'Asset Marketplace Access'],
  },
  {
    tier: 2,
    name: 'Advanced Creator',
    cost: '500,000',
    color: 'from-purple-500 to-pink-500',
    icon: '⚡',
    tools: ['Advanced 3D Tools', 'Full Scripting API', 'Custom Shaders', 'Physics Engine', 'Animation System', 'AI NPC Builder'],
  },
  {
    tier: 3,
    name: 'Elite Creator',
    cost: '2,000,000',
    color: 'from-yellow-500 to-orange-500',
    icon: '👑',
    tools: ['Full Creator SDK', 'White-Label Mini-Apps', 'Revenue Share Tools', 'Priority Support', 'Beta Feature Access', 'Creator Dashboard'],
  },
];

interface CreatorToolsWindowProps {
  onClose: () => void;
}

export function CreatorToolsWindow({ onClose }: CreatorToolsWindowProps) {
  const { address } = useAccount();
  const { unlockTier, creatorTier, useTierCost, useToolsForTier, isPending, isSuccess } = useCreatorBurn();
  
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentTier = creatorTier || 0;

  const handleUnlockClick = (tier: number) => {
    // Sequential unlock enforcement
    if (tier !== currentTier + 1) {
      alert(`You must unlock tiers in order. Please unlock Tier ${currentTier + 1} first.`);
      return;
    }
    setSelectedTier(tier);
    setShowConfirmModal(true);
  };

  const handleBurnExecute = () => {
    if (selectedTier) {
      unlockTier(selectedTier);
    }
  };

  const handleSuccess = () => {
    setShowConfirmModal(false);
    setSelectedTier(null);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/50 rounded-lg shadow-2xl p-6 w-full max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              🛠️ Creator Tools
            </h2>
            <p className="text-gray-400">
              Unlock powerful creation tools by burning VOID • Current Tier: {currentTier}
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

        {/* Sequential Unlock Notice */}
        <div className="mb-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-blue-400 font-bold text-sm mb-1">SEQUENTIAL UNLOCKS REQUIRED</h4>
              <p className="text-gray-300 text-xs">
                Creator tiers must be unlocked in order (Tier 1 → Tier 2 → Tier 3). You cannot skip tiers.
              </p>
            </div>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CREATOR_TIERS.map((tierData) => {
            const isUnlocked = currentTier >= tierData.tier;
            const isNext = tierData.tier === currentTier + 1;
            const actualCost = useTierCost(tierData.tier);
            const onChainTools = useToolsForTier(tierData.tier);

            return (
              <div
                key={tierData.tier}
                className={`relative border-2 rounded-lg p-6 transition-all ${
                  isUnlocked
                    ? 'border-green-500/50 bg-green-900/10'
                    : isNext
                    ? 'border-purple-500/70 bg-purple-900/20 shadow-lg shadow-purple-500/20'
                    : 'border-gray-700/30 bg-gray-900/10 opacity-60'
                }`}
              >
                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  {isUnlocked ? (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      ✓ UNLOCKED
                    </span>
                  ) : isNext ? (
                    <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                      NEXT
                    </span>
                  ) : (
                    <span className="bg-gray-600 text-gray-300 text-xs font-bold px-2 py-1 rounded">
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Tier icon */}
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${tierData.color} flex items-center justify-center text-4xl`}>
                  {tierData.icon}
                </div>

                {/* Tier info */}
                <h3 className="text-2xl font-bold text-white text-center mb-1">
                  Tier {tierData.tier}
                </h3>
                <h4 className="text-lg text-purple-400 font-semibold text-center mb-4">
                  {tierData.name}
                </h4>

                {/* Cost */}
                <div className="text-center mb-6">
                  <span className="text-purple-400 font-bold text-xl">
                    {tierData.cost} VOID
                  </span>
                  {actualCost && actualCost !== '0' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {Number(actualCost).toLocaleString()} VOID
                    </p>
                  )}
                </div>

                {/* Tools list */}
                <div className="mb-6">
                  <h5 className="text-sm font-bold text-gray-400 mb-3">TOOLS & FEATURES:</h5>
                  <ul className="space-y-2">
                    {(onChainTools || tierData.tools).map((tool, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-purple-500 flex-shrink-0">▸</span>
                        <span className={isUnlocked ? 'text-gray-200' : 'text-gray-500'}>
                          {tool}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unlock button */}
                {!isUnlocked && isNext && (
                  <button
                    onClick={() => handleUnlockClick(tierData.tier)}
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
                  >
                    {isPending ? 'Processing...' : `🔥 Burn to Unlock Tier ${tierData.tier}`}
                  </button>
                )}

                {isUnlocked && (
                  <button
                    disabled
                    className="w-full bg-green-600/50 text-white font-bold py-3 rounded-lg cursor-not-allowed"
                  >
                    ✓ Tier Unlocked
                  </button>
                )}

                {!isUnlocked && !isNext && (
                  <button
                    disabled
                    className="w-full bg-gray-700/50 text-gray-500 font-bold py-3 rounded-lg cursor-not-allowed"
                  >
                    🔒 Unlock Previous Tiers First
                  </button>
                )}
              </div>
            );
          })}
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
                VOID tokens are <strong>permanently destroyed</strong> when unlocking creator tiers. This action is <strong>irreversible</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Burn Confirmation Modal */}
      {showConfirmModal && selectedTier && (
        <BurnConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          burnAmount={CREATOR_TIERS.find(t => t.tier === selectedTier)?.cost.replace(/,/g, '') || '0'}
          category={BurnCategory.CREATOR_TOOLS}
          actionName={`Unlock Creator Tier ${selectedTier}`}
          spenderContract={process.env.NEXT_PUBLIC_CREATOR_TOOLS_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`}
          onBurnExecute={handleBurnExecute}
          onSuccess={handleSuccess}
          metadata={`creator-tier-${selectedTier}`}
        />
      )}
    </>
  );
}
