/**
 * VOID Burn Confirmation Modal
 * 
 * Reusable modal for VOID burning operations
 * Shows burn amount, category, and IRREVERSIBLE warning
 * Handles approve → burn flow with loading states
 */

import React, { useState, useEffect } from 'react';
import { formatEther, parseEther } from 'viem';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/config/voidConfig';

// VOID ERC20 ABI (approve function)
const VoidTokenABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export enum BurnCategory {
  DISTRICT_UNLOCK = 'District Unlock',
  LAND_UPGRADE = 'Land Upgrade',
  CREATOR_TOOLS = 'Creator Tools',
  PRESTIGE = 'Prestige Rank',
  MINIAPP_ACCESS = 'Mini-App Access',
}

interface BurnConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  burnAmount: string; // In VOID (e.g., "100000")
  category: BurnCategory;
  actionName: string; // e.g., "Unlock District 2", "Upgrade Parcel to Level 3"
  spenderContract: `0x${string}`; // Contract that will burn VOID
  onBurnExecute: () => void; // Callback to execute actual burn function
  onSuccess?: () => void; // Callback after successful burn
  metadata?: string; // Optional metadata for burn event
}

export function BurnConfirmationModal({
  isOpen,
  onClose,
  burnAmount,
  category,
  actionName,
  spenderContract,
  onBurnExecute,
  onSuccess,
  metadata,
}: BurnConfirmationModalProps) {
  const { address } = useAccount();
  const [step, setStep] = useState<'confirm' | 'approve' | 'burn' | 'success'>('confirm');
  const [error, setError] = useState<string | null>(null);

  const burnAmountWei = parseEther(burnAmount);

  // Approve VOID spend (modern wagmi v2)
  const { writeContract: approveWrite, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isSuccess: isApproved } = useWaitForTransactionReceipt({ hash: approveHash });

  // Trigger approve transaction
  const handleApprove = () => {
    approveWrite({
      address: CONTRACTS.VOID as `0x${string}`,
      abi: VoidTokenABI,
      functionName: 'approve',
      args: [spenderContract, burnAmountWei],
    });
  };

  // Auto-advance to burn step after approval
  useEffect(() => {
    if (isApproved && step === 'approve') {
      setStep('burn');
    }
  }, [isApproved, step]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setError(null);
    }
  }, [isOpen]);

  // Execute burn action
  const handleBurn = () => {
    try {
      onBurnExecute(); // Trigger parent burn function
      setStep('success');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(`Burn failed: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/50 rounded-lg shadow-2xl p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Confirm VOID Burn
          </h2>
          <p className="text-sm text-gray-400">
            {category} • {actionName}
          </p>
        </div>

        {/* Burn Details */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Burn Amount:</span>
            <span className="text-2xl font-bold text-purple-400">
              {Number(burnAmount).toLocaleString()} VOID
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Category:</span>
            <span className="text-white font-medium">{category}</span>
          </div>
        </div>

        {/* IRREVERSIBLE Warning */}
        <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-red-400 font-bold mb-1">⚠️ IRREVERSIBLE ACTION</h3>
              <p className="text-sm text-gray-300">
                VOID tokens will be <strong>permanently burned</strong> and <strong>cannot be recovered</strong>.
                This is a <strong>one-way operation</strong> with no refunds.
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {step === 'confirm' && (
            <>
              <button
                onClick={() => setStep('approve')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
              >
                I Understand - Proceed to Approve
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {step === 'approve' && (
            <>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
              >
                {isApproving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Approving...
                  </span>
                ) : (
                  `Approve ${Number(burnAmount).toLocaleString()} VOID`
                )}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Step 1 of 2: Grant permission to burn contract
              </p>
            </>
          )}

          {step === 'burn' && (
            <>
              <button
                onClick={handleBurn}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
              >
                🔥 Execute Burn - {Number(burnAmount).toLocaleString()} VOID
              </button>
              <p className="text-xs text-gray-400 text-center">
                Step 2 of 2: Execute permanent burn
              </p>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-400 mb-2">
                Burn Successful!
              </h3>
              <p className="text-gray-400 text-sm">
                {Number(burnAmount).toLocaleString()} VOID permanently burned
              </p>
            </div>
          )}
        </div>

        {/* Metadata (if provided) */}
        {metadata && step === 'confirm' && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              <strong>Action ID:</strong> {metadata}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
