/**
 * Prestige System Window
 * UI for prestige rank progression (Ranks 0-10)
 */

"use client"

import React, { useState } from 'react';
import { usePrestigeBurn } from '@/hooks/burn/usePrestigeBurn';
import { BurnConfirmationModal, BurnCategory } from './BurnConfirmationModal';
import { useAccount } from 'wagmi';

// Prestige rank data (costs in VOID)
const PRESTIGE_RANKS = [
  { rank: 1, cost: '25,000', cosmetic: 'Bronze Badge', color: 'from-orange-700 to-orange-500' },
  { rank: 2, cost: '75,000', cosmetic: 'Silver Badge', color: 'from-gray-400 to-gray-200' },
  { rank: 3, cost: '150,000', cosmetic: 'Gold Badge', color: 'from-yellow-600 to-yellow-400' },
  { rank: 4, cost: '300,000', cosmetic: 'Platinum Badge', color: 'from-cyan-400 to-cyan-200' },
  { rank: 5, cost: '600,000', cosmetic: 'Diamond Badge', color: 'from-blue-400 to-purple-400' },
  { rank: 6, cost: '1,250,000', cosmetic: 'Obsidian Badge', color: 'from-gray-800 to-black' },
  { rank: 7, cost: '2,500,000', cosmetic: 'Ruby Badge', color: 'from-red-600 to-pink-600' },
  { rank: 8, cost: '5,000,000', cosmetic: 'Sapphire Badge', color: 'from-blue-600 to-indigo-600' },
  { rank: 9, cost: '10,000,000', cosmetic: 'Emerald Badge', color: 'from-green-600 to-teal-600' },
  { rank: 10, cost: '100,000,000', cosmetic: 'Eternal Badge', color: 'from-purple-600 via-pink-600 to-yellow-600' },
];

interface PrestigeSystemWindowProps {
  onClose: () => void;
}

export function PrestigeSystemWindow({ onClose }: PrestigeSystemWindowProps) {
  const { address } = useAccount();
  const { unlockNextRank, prestigeRank, useRankCost, useCosmeticsForRank, isPending, isSuccess } = usePrestigeBurn();
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentRank = prestigeRank || 0;
  const nextRank = currentRank + 1;
  const nextRankData = PRESTIGE_RANKS[nextRank - 1];
  const nextRankCost = useRankCost(nextRank);

  const handleUnlockClick = () => {
    if (nextRank > 10) {
      alert('You have reached maximum prestige rank!');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleBurnExecute = () => {
    unlockNextRank();
  };

  const handleSuccess = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/50 rounded-lg shadow-2xl p-6 w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              ⭐ Prestige System
            </h2>
            <p className="text-gray-400">
              Climb prestige ranks by burning VOID • Current Rank: {currentRank}/10
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

        {/* Current Rank Display */}
        <div className="mb-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-lg p-6 text-center">
          <h3 className="text-gray-400 text-sm mb-2">CURRENT PRESTIGE RANK</h3>
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
            {currentRank}
          </div>
          {currentRank > 0 && PRESTIGE_RANKS[currentRank - 1] && (
            <div className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${PRESTIGE_RANKS[currentRank - 1].color} text-white font-bold`}>
              {PRESTIGE_RANKS[currentRank - 1].cosmetic}
            </div>
          )}
          {currentRank === 0 && (
            <p className="text-gray-500 font-medium">No prestige rank yet</p>
          )}
        </div>

        {/* Next Rank Card */}
        {nextRank <= 10 && nextRankData && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-white mb-3">NEXT RANK:</h4>
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="text-3xl font-bold text-purple-400 mb-1">Rank {nextRank}</h5>
                  <p className="text-gray-400">Unlock: {nextRankData.cosmetic}</p>
                </div>
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${nextRankData.color} flex items-center justify-center text-2xl font-bold text-white`}>
                  {nextRank}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">BURN COST:</p>
                <p className="text-3xl font-bold text-purple-400">
                  {nextRankData.cost} VOID
                </p>
                {nextRankCost && nextRankCost !== '0' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current on-chain cost: {Number(nextRankCost).toLocaleString()} VOID
                  </p>
                )}
              </div>

              <button
                onClick={handleUnlockClick}
                disabled={isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 text-lg"
              >
                {isPending ? 'Processing...' : `🔥 Burn ${nextRankData.cost} VOID → Rank ${nextRank}`}
              </button>
            </div>
          </div>
        )}

        {/* Max Rank Reached */}
        {currentRank === 10 && (
          <div className="mb-6 bg-gradient-to-r from-yellow-900/30 to-purple-900/30 border-2 border-yellow-500/50 rounded-lg p-6 text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">MAXIMUM PRESTIGE REACHED!</h3>
            <p className="text-gray-300">
              You have achieved the highest prestige rank in VOID. Your Eternal Badge is a symbol of ultimate dedication.
            </p>
          </div>
        )}

        {/* All Ranks Progress */}
        <div>
          <h4 className="text-lg font-bold text-white mb-3">PROGRESSION:</h4>
          <div className="grid grid-cols-5 gap-2">
            {PRESTIGE_RANKS.map((rankData) => {
              const isUnlocked = currentRank >= rankData.rank;
              return (
                <div
                  key={rankData.rank}
                  className={`relative border-2 rounded-lg p-3 transition-all text-center ${
                    isUnlocked
                      ? 'border-green-500/50 bg-green-900/20'
                      : rankData.rank === nextRank
                      ? 'border-purple-500/70 bg-purple-900/20'
                      : 'border-gray-700/30 bg-gray-900/10 opacity-40'
                  }`}
                >
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-r ${rankData.color} flex items-center justify-center text-sm font-bold text-white`}>
                    {rankData.rank}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{rankData.cosmetic}</p>
                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
                VOID tokens are <strong>permanently destroyed</strong> when ranking up. Costs increase exponentially. This action is <strong>irreversible</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Burn Confirmation Modal */}
      {showConfirmModal && nextRankData && (
        <BurnConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          burnAmount={nextRankData.cost.replace(/,/g, '')}
          category={BurnCategory.PRESTIGE}
          actionName={`Unlock Prestige Rank ${nextRank}`}
          spenderContract={process.env.NEXT_PUBLIC_PRESTIGE_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`}
          onBurnExecute={handleBurnExecute}
          onSuccess={handleSuccess}
          metadata={`prestige-rank-${nextRank}`}
        />
      )}
    </>
  );
}
