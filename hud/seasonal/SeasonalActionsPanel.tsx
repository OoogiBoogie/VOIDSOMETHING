'use client';

import React, { useState } from 'react';
import { useSeasonalBurn } from '@/hooks/useSeasonalBurn';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { calculateXPFromBurn } from '@/utils/seasonalBurnUtils';
import { SEASONAL_BURN_CONTRACTS } from '@/config/burnContractsSeasonal';
import styles from './SeasonalActionsPanel.module.css';

interface SeasonalActionsPanelProps {
  onClose: () => void;
}

type BurnAction = 'district' | 'land' | 'creator' | 'prestige' | 'miniapp';

export function SeasonalActionsPanel({ onClose }: SeasonalActionsPanelProps) {
  const { address } = useAccount();
  const {
    currentSeasonId,
    userSeasonState,
    dailyXPCap,
    contracts,
    isLoading,
  } = useSeasonalBurn();

  const [selectedAction, setSelectedAction] = useState<BurnAction>('district');
  const [burnAmount, setBurnAmount] = useState<string>('1000');
  const [estimatedXP, setEstimatedXP] = useState<number>(0);
  
  // Wagmi contract write hook
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  
  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  if (!address) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>⚠️ Connect wallet to perform burns</p>
        </div>
      </div>
    );
  }

  const handleBurnAmountChange = (value: string) => {
    setBurnAmount(value);
    const amount = parseFloat(value) || 0;
    
    if (userSeasonState && amount > 0) {
      const xp = calculateXPFromBurn(
        amount,
        userSeasonState.dailyCreditsUsed,
        dailyXPCap
      );
      setEstimatedXP(xp);
    } else {
      setEstimatedXP(0);
    }
  };

  const handleBurn = async () => {
    const amount = parseFloat(burnAmount) || 0;
    
    console.log('Burn initiated:', { burnAmount, amount, type: typeof amount });
    
    if (amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    
    // Simple validation - just check amount is positive
    // More validation happens at contract level

    // Get the correct contract config based on action
    const contractConfig = selectedAction === 'district' 
      ? SEASONAL_BURN_CONTRACTS.DistrictAccessBurnSeasonal
      : SEASONAL_BURN_CONTRACTS.VoidBurnUtilitySeasonal;

    console.log('Burn Debug:', {
      selectedAction,
      contractConfig,
      hasAddress: !!contractConfig?.address,
      hasABI: !!contractConfig?.abi && contractConfig.abi.length > 0,
      abiLength: contractConfig?.abi?.length,
      amount
    });

    if (!contractConfig || !contractConfig.address || !contractConfig.abi || contractConfig.abi.length === 0) {
      alert(`Contract not configured for ${selectedAction}. ABIs may still be loading. Wait a moment and try again.`);
      console.error('Missing contract config:', { selectedAction, contractConfig });
      return;
    }
    
    const contractAddress = contractConfig.address;
    const contractABI = contractConfig.abi;

    try {
      // Convert amount to wei (18 decimals for VOID token)
      // parseUnits expects a string with no more than 18 decimal places
      const cleanAmount = Math.floor(amount).toString(); // Use whole numbers only for now
      const amountWei = parseUnits(cleanAmount, 18);
      
      console.log('Amount conversion:', {
        original: amount,
        clean: cleanAmount,
        wei: amountWei.toString()
      });
      
      // Map action to utility ID (for VoidBurnUtilitySeasonal)
      const utilityIds: Record<BurnAction, number> = {
        district: 1, // District Access uses separate contract
        land: 2,
        creator: 3,
        prestige: 4,
        miniapp: 5,
      };

      // Execute burn transaction
      if (selectedAction === 'district') {
        // DistrictAccessBurnSeasonal.burn(uint256 amount, uint8 districtId)
        // Using districtId = 1 as default (can be made dynamic later)
        writeContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'burn',
          args: [amountWei, 1], // amount, districtId
        });
      } else {
        // VoidBurnUtilitySeasonal.burn(uint256 amount, uint8 utilityId)
        writeContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'burn',
          args: [amountWei, utilityIds[selectedAction]],
        });
      }
    } catch (err) {
      console.error('Burn transaction error:', err);
      alert('Transaction failed. See console for details.');
    }
  };

  const actions = [
    {
      id: 'district' as BurnAction,
      icon: '🏙️',
      name: 'District Access',
      description: 'Unlock new districts to explore',
      cost: '1,000 - 5,000 VOID',
    },
    {
      id: 'land' as BurnAction,
      icon: '🏗️',
      name: 'Land Upgrade',
      description: 'Upgrade your land plots',
      cost: '500 - 10,000 VOID',
    },
    {
      id: 'creator' as BurnAction,
      icon: '🎨',
      name: 'Creator Tools',
      description: 'Unlock advanced creation features',
      cost: '2,000 - 8,000 VOID',
    },
    {
      id: 'prestige' as BurnAction,
      icon: '🏆',
      name: 'Prestige Rank',
      description: 'Increase prestige for XP multipliers',
      cost: '5,000 - 50,000 VOID',
    },
    {
      id: 'miniapp' as BurnAction,
      icon: '⚡',
      name: 'Mini-App Access',
      description: 'Unlock premium mini-app features',
      cost: '1,000 - 3,000 VOID',
    },
  ];

  const selectedActionData = actions.find(a => a.id === selectedAction);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>SEASONAL BURN ACTIONS</h2>
        <p className={styles.subtitle}>Season {currentSeasonId} • All utilities always work</p>
      </div>

      {/* Action Selection */}
      <div className={styles.actionsGrid}>
        {actions.map((action) => (
          <button
            key={action.id}
            className={`${styles.actionCard} ${selectedAction === action.id ? styles.selected : ''}`}
            onClick={() => setSelectedAction(action.id)}
          >
            <div className={styles.actionIcon}>{action.icon}</div>
            <div className={styles.actionName}>{action.name}</div>
            <div className={styles.actionCost}>{action.cost}</div>
          </button>
        ))}
      </div>

      {/* Burn Interface */}
      {selectedActionData && (
        <div className={styles.burnSection}>
          <div className={styles.selectedActionHeader}>
            <div className={styles.selectedActionIcon}>{selectedActionData.icon}</div>
            <div>
              <h3 className={styles.selectedActionName}>{selectedActionData.name}</h3>
              <p className={styles.selectedActionDescription}>{selectedActionData.description}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Burn Amount (VOID)</label>
            <input
              type="number"
              className={styles.input}
              value={burnAmount}
              onChange={(e) => handleBurnAmountChange(e.target.value)}
              placeholder="Enter amount..."
              min="0"
              step="100"
            />
          </div>

          {/* XP Estimate */}
          {estimatedXP > 0 && (
            <div className={styles.xpEstimate}>
              <div className={styles.xpEstimateLabel}>Estimated XP Reward</div>
              <div className={styles.xpEstimateValue}>+{estimatedXP.toLocaleString()} XP</div>
            </div>
          )}

          {/* Transaction Status */}
          {hash && (
            <div className={styles.txStatus}>
              {isConfirming && <p style={{color: '#fbbf24'}}>⏳ Confirming transaction...</p>}
              {isConfirmed && <p style={{color: '#10b981'}}>✅ Burn successful! XP added to your account.</p>}
              {isError && <p style={{color: '#ef4444'}}>❌ Transaction failed: {error?.message}</p>}
            </div>
          )}

          {/* Burn Button */}
          <button
            className={styles.burnButton}
            onClick={handleBurn}
            disabled={isLoading || isPending || isConfirming || !burnAmount || parseFloat(burnAmount) <= 0}
          >
            {isPending && 'Waiting for approval...'}
            {isConfirming && 'Confirming transaction...'}
            {!isPending && !isConfirming && (isLoading ? 'Loading...' : `BURN ${burnAmount || '0'} VOID`)}
          </button>

          {/* Info */}
          <div className={styles.burnInfo}>
            <p className={styles.infoTitle}>ℹ️ HOW IT WORKS</p>
            <ul className={styles.infoList}>
              <li>Utility always works regardless of caps</li>
              <li>XP rewards based on daily credit usage (3 zones)</li>
              <li>Zone 1 (0-3k): 100% XP • Zone 2 (3-6k): 50% XP • Zone 3 (6k+): 0% XP</li>
              <li>Seasonal caps never block actions, only affect XP</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
