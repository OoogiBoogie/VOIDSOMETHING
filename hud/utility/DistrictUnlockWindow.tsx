/**
 * District Unlock Window
 * UI for unlocking Districts 2-5 via VOID burning
 */

"use client"

import React, { useState } from 'react';
import { useDistrictBurn } from '@/hooks/burn/useDistrictBurn';
import { BurnConfirmationModal, BurnCategory } from './BurnConfirmationModal';
import { useAccount } from 'wagmi';

// District data
const DISTRICTS = [
  { id: 1, name: 'Central Plaza', description: 'Starting district', cost: 'FREE', color: 'from-blue-500 to-cyan-500' },
  { id: 2, name: 'Tech Quarter', description: 'Innovation hub', cost: '100,000', color: 'from-purple-500 to-pink-500' },
  { id: 3, name: 'Art District', description: 'Creative community', cost: '250,000', color: 'from-orange-500 to-red-500' },
  { id: 4, name: 'Commerce Center', description: 'Trading hub', cost: '500,000', color: 'from-green-500 to-emerald-500' },
  { id: 5, name: 'Elite Heights', description: 'Premium zone', cost: '1,000,000', color: 'from-yellow-500 to-amber-500' },
];

interface DistrictUnlockWindowProps {
  onClose: () => void;
}

export function DistrictUnlockWindow({ onClose }: DistrictUnlockWindowProps) {
  const { address } = useAccount();
  const { unlockDistrict, useIsUnlocked, useUnlockPrice, unlockedCount, isPending, isSuccess } = useDistrictBurn();
  
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleUnlockClick = (districtId: number) => {
    if (districtId === 1) return; // District 1 is always free
    setSelectedDistrict(districtId);
    setShowConfirmModal(true);
  };

  const handleBurnExecute = () => {
    if (selectedDistrict && selectedDistrict > 1) {
      unlockDistrict(selectedDistrict);
    }
  };

  const handleSuccess = () => {
    setShowConfirmModal(false);
    setSelectedDistrict(null);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/50 rounded-lg shadow-2xl p-6 w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              🗺️ District Access
            </h2>
            <p className="text-gray-400">
              Unlock new districts by burning VOID • {unlockedCount || 0}/5 districts unlocked
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

        {/* District Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DISTRICTS.map((district) => {
            const isUnlocked = district.id === 1 || useIsUnlocked(district.id);
            const actualCost = useUnlockPrice(district.id);

            return (
              <div
                key={district.id}
                className={`relative border-2 rounded-lg p-4 transition-all ${
                  isUnlocked
                    ? 'border-green-500/50 bg-green-900/10'
                    : 'border-purple-500/30 bg-purple-900/10 hover:border-purple-500/70'
                }`}
              >
                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  {isUnlocked ? (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      ✓ UNLOCKED
                    </span>
                  ) : (
                    <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-1 rounded">
                      LOCKED
                    </span>
                  )}
                </div>

                {/* District icon */}
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r ${district.color} flex items-center justify-center text-3xl`}>
                  {district.id}
                </div>

                {/* District info */}
                <h3 className="text-xl font-bold text-white text-center mb-1">
                  {district.name}
                </h3>
                <p className="text-sm text-gray-400 text-center mb-4">
                  {district.description}
                </p>

                {/* Cost */}
                <div className="text-center mb-4">
                  {district.id === 1 ? (
                    <span className="text-green-400 font-bold text-lg">
                      FREE
                    </span>
                  ) : (
                    <div>
                      <span className="text-purple-400 font-bold text-lg">
                        {district.cost} VOID
                      </span>
                      {actualCost && actualCost !== '0' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Current: {Number(actualCost).toLocaleString()} VOID
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Unlock button */}
                {!isUnlocked && district.id > 1 && (
                  <button
                    onClick={() => handleUnlockClick(district.id)}
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg transition-all transform hover:scale-105"
                  >
                    {isPending ? 'Processing...' : '🔥 Burn to Unlock'}
                  </button>
                )}

                {isUnlocked && (
                  <button
                    disabled
                    className="w-full bg-green-600/50 text-white font-bold py-2 rounded-lg cursor-not-allowed"
                  >
                    ✓ Access Granted
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
                VOID tokens are <strong>permanently destroyed</strong> when unlocking districts. This action is <strong>irreversible</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Burn Confirmation Modal */}
      {showConfirmModal && selectedDistrict && (
        <BurnConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          burnAmount={DISTRICTS.find(d => d.id === selectedDistrict)?.cost.replace(/,/g, '') || '0'}
          category={BurnCategory.DISTRICT_UNLOCK}
          actionName={`Unlock ${DISTRICTS.find(d => d.id === selectedDistrict)?.name}`}
          spenderContract={process.env.NEXT_PUBLIC_DISTRICT_ACCESS_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`}
          onBurnExecute={handleBurnExecute}
          onSuccess={handleSuccess}
          metadata={`district-${selectedDistrict}`}
        />
      )}
    </>
  );
}
