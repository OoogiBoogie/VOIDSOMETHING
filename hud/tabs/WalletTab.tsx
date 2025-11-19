'use client';

/**
 * WALLET TAB - VOID + xVOID balances, staking, rewards
 * Shows: wallet balance, staked amount, claimable rewards, APR boost
 * Actions: approve, stake, unstake, claim
 */

import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

import { formatUnits, parseUnits, maxUint256 } from 'viem';
import { VOID_TOKEN_ABI, XVOID_VAULT_ABI } from '@/lib/contracts/abis';
import { XP_ORACLE_ABI, XP_ORACLE_ADDRESS } from '@/lib/contracts/abis/xpOracle';
import { useVoidAirdrop } from '@/hooks/useVoidAirdrop';
import { Star } from 'lucide-react';

const CONTRACTS = {
  VOID: '0x8de4043445939B0D0Cc7d6c752057707279D9893',
  xVOIDVault: '0xab10B2B5E1b07447409BCa889d14F046bEFd8192',
  XPOracle: XP_ORACLE_ADDRESS,
};

interface WalletTabProps {
  onClose?: () => void;
}

export default function WalletTab({ onClose }: WalletTabProps) {
  
  const { address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const { airdropData, isLoading: isAirdropLoading } = useVoidAirdrop();

  // Read balances
  const { data: voidBalance } = useReadContract({
    address: CONTRACTS.VOID as `0x${string}`,
    abi: VOID_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: xvoidBalance } = useReadContract({
    address: CONTRACTS.xVOIDVault as `0x${string}`,
    abi: XVOID_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: claimableRewards } = useReadContract({
    address: CONTRACTS.xVOIDVault as `0x${string}`,
    abi: XVOID_VAULT_ABI,
    functionName: 'earned',
    args: address ? [address] : undefined,
  });

  const { data: allowance } = useReadContract({
    address: CONTRACTS.VOID as `0x${string}`,
    abi: VOID_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.xVOIDVault] : undefined,
  });

  // XPOracle: APR boost from XP
  const { data: aprBoostBps } = useReadContract({
    address: CONTRACTS.XPOracle as `0x${string}`,
    abi: XP_ORACLE_ABI,
    functionName: 'getAPRBoost',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Write operations
  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: stake, data: stakeHash } = useWriteContract();
  const { writeContract: unstake, data: unstakeHash } = useWriteContract();
  const { writeContract: claim, data: claimHash } = useWriteContract();

  const { isLoading: approveLoading } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: stakeLoading } = useWaitForTransactionReceipt({ hash: stakeHash });
  const { isLoading: unstakeLoading } = useWaitForTransactionReceipt({ hash: unstakeHash });
  const { isLoading: claimLoading } = useWaitForTransactionReceipt({ hash: claimHash });

  // Mock data for testing
  const mockData = {
    voidBalance: 10492.30,
    xvoidBalance: 4500.00,
    usdcBalance: 2341.11,
    claimableRewards: 43.2,
    vaultAPR: 12.5,
    xpBoost: 1.8,
    level: 12,
    levelName: 'Adept',
    xpProgress: 78,
    dailyBonus: 0.2,
    nextClaim: '3h 12m',
  };

  const voidBal = voidBalance ? parseFloat(formatUnits(voidBalance as bigint, 18)) : mockData.voidBalance;
  const xvoidBal = xvoidBalance ? parseFloat(formatUnits(xvoidBalance as bigint, 18)) : mockData.xvoidBalance;
  const rewards = claimableRewards ? parseFloat(formatUnits(claimableRewards as bigint, 18)) : mockData.claimableRewards;
  const isApproved = allowance ? (allowance as bigint) > BigInt(0) : false;

  // APR calculation
  const baseAPR = 1200; // 12.00% in basis points
  const boostBps = Number(aprBoostBps ?? 0); // XP boost in basis points (e.g., up to 2000 = 20%)
  const effectiveAPRbps = Math.min(baseAPR + boostBps, 10000); // cap at 100%
  const effectiveAPRpct = (effectiveAPRbps / 100).toFixed(2);
  const boostPct = (boostBps / 100).toFixed(2);

  const handleApprove = () => {
    if (!address) return;
    approve({
      address: CONTRACTS.VOID as `0x${string}`,
      abi: VOID_TOKEN_ABI,
      functionName: 'approve',
      args: [CONTRACTS.xVOIDVault, maxUint256],
    });
  };

  const handleStake = () => {
    if (!address || !stakeAmount) return;
    const amount = parseUnits(stakeAmount, 18);
    stake({
      address: CONTRACTS.xVOIDVault as `0x${string}`,
      abi: XVOID_VAULT_ABI,
      functionName: 'stake',
      args: [amount],
    });
  };

  const handleUnstake = () => {
    if (!address || !unstakeAmount) return;
    const amount = parseUnits(unstakeAmount, 18);
    unstake({
      address: CONTRACTS.xVOIDVault as `0x${string}`,
      abi: XVOID_VAULT_ABI,
      functionName: 'withdraw',
      args: [amount],
    });
  };

  const handleClaim = () => {
    if (!address) return;
    claim({
      address: CONTRACTS.xVOIDVault as `0x${string}`,
      abi: XVOID_VAULT_ABI,
      functionName: 'getReward',
    });
  };

  return (
    <div className="p-6 font-mono text-sm space-y-6 text-bio-silver">
      {/* Header */}
      <div className="border-b border-bio-silver/30 pb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-2">
          💼 WALLET OVERVIEW
        </div>
        <div className="text-[0.7rem] space-y-1">
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Connected Wallet:</span>
            <span className="text-cyber-cyan">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x92A3...bE12'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Network:</span>
            <span className="text-signal-green">Base Sepolia</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Status:</span>
            <span className="text-signal-green">🟢 Synced</span>
          </div>
        </div>
      </div>

      {/* Token Balances */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">TOKENS:</div>
        <div className="space-y-2 text-[0.75rem]">
          <div className="flex justify-between items-center p-2 bg-black/40 rounded border border-bio-silver/20">
            <span className="text-void-purple font-bold">VOID:</span>
            <span className="text-signal-green">{voidBal.toFixed(2)} VOID</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/40 rounded border border-bio-silver/20">
            <span className="text-psx-blue font-bold">USDC:</span>
            <span className="text-signal-green">{mockData.usdcBalance.toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/40 rounded border border-void-purple/40">
            <span className="text-void-purple font-bold">xVOID (staked):</span>
            <span className="text-void-purple">{xvoidBal.toFixed(2)} xVOID</span>
          </div>
        </div>
      </div>

      {/* Staking Vaults */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">STAKING VAULTS:</div>
        <div className="space-y-2 text-[0.7rem]">
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Vault APR:</span>
            <span className="text-signal-green">
              {(baseAPR / 100).toFixed(2)}% + {boostPct}% XP = {effectiveAPRpct}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Claimable Rewards:</span>
            <span className="text-cyber-cyan font-bold">{rewards.toFixed(2)} VOID</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Next Claim:</span>
            <span className="text-bio-silver">~{mockData.nextClaim}</span>
          </div>
        </div>
      </div>

      {/* XP Oracle */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">XP ORACLE:</div>
        <div className="space-y-2 text-[0.7rem]">
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Level:</span>
            <span className="text-signal-green">{mockData.level} ({mockData.levelName})</span>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-bio-silver/60">XP Progress:</span>
              <span className="text-bio-silver">{mockData.xpProgress}%</span>
            </div>
            <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-bio-silver/30">
              <div 
                className="h-full bg-gradient-to-r from-void-purple to-cyber-cyan"
                style={{ width: `${mockData.xpProgress}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Daily Bonus:</span>
            <span className="text-signal-green">+{mockData.dailyBonus}% yield boost active</span>
          </div>
        </div>
      </div>

      {/* Staking Actions */}
      <div className="space-y-3">
        {!isConnected && (
          <div className="p-3 bg-red-500/10 border border-red-500/40 rounded text-center text-[0.7rem] text-red-400">
            ⚠️ Connect wallet to access staking
          </div>
        )}

        {isConnected && !isApproved && (
          <button
            onClick={handleApprove}
            disabled={approveLoading}
            className="w-full py-2 px-4 bg-void-purple/20 border border-void-purple hover:bg-void-purple/30 rounded text-void-purple font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {approveLoading ? 'Approving...' : '[ Approve VOID ]'}
          </button>
        )}

        {isConnected && isApproved && (
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3 space-y-2">
              <input
                type="text"
                placeholder="Amount to stake"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full px-3 py-2 bg-black/60 border border-bio-silver/30 rounded text-bio-silver text-xs focus:border-void-purple focus:outline-none"
              />
              <button
                onClick={handleStake}
                disabled={stakeLoading || !stakeAmount}
                className="w-full py-2 px-4 bg-void-purple/20 border border-void-purple hover:bg-void-purple/30 rounded text-void-purple font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {stakeLoading ? 'Staking...' : '[ Stake VOID ]'}
              </button>
            </div>

            <div className="col-span-3 space-y-2">
              <input
                type="text"
                placeholder="Amount to unstake"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className="w-full px-3 py-2 bg-black/60 border border-bio-silver/30 rounded text-bio-silver text-xs focus:border-cyber-cyan focus:outline-none"
              />
              <button
                onClick={handleUnstake}
                disabled={unstakeLoading || !unstakeAmount}
                className="w-full py-2 px-4 bg-cyber-cyan/20 border border-cyber-cyan hover:bg-cyber-cyan/30 rounded text-cyber-cyan font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {unstakeLoading ? 'Unstaking...' : '[ Unstake ]'}
              </button>
            </div>

            <button
              onClick={handleClaim}
              disabled={claimLoading || rewards === 0}
              className="col-span-3 py-2 px-4 bg-signal-green/20 border border-signal-green hover:bg-signal-green/30 rounded text-signal-green font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {claimLoading ? 'Claiming...' : '[ Claim Rewards ]'}
            </button>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="border-t border-bio-silver/30 pt-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">Recent Transactions:</div>
        <div className="space-y-2 text-[0.65rem]">
          {stakeHash && (
            <div className="flex items-center gap-2 text-signal-green">
              <span>⏳</span>
              <span>Stake pending...</span>
              <a
                href={`https://sepolia.basescan.org/tx/${stakeHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyber-cyan hover:underline"
              >
                View
              </a>
            </div>
          )}
          {claimHash && (
            <div className="flex items-center gap-2 text-signal-green">
              <span>⏳</span>
              <span>Claim pending...</span>
              <a
                href={`https://sepolia.basescan.org/tx/${claimHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyber-cyan hover:underline"
              >
                View
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 text-signal-green">
            <span>✔</span>
            <span>Stake 2,000 VOID → xVOID (+12.5% APY)</span>
          </div>
          <div className="flex items-center gap-2 text-signal-green">
            <span>✔</span>
            <span>Claim 28.4 VOID rewards</span>
          </div>
          <div className="flex items-center gap-2 text-bio-silver/60">
            <span>⏳</span>
            <span>Pending: VOID → USDC Swap (0.3% fee)</span>
          </div>
        </div>
      </div>

      {/* Airdrop Preview */}
      <div className="border border-void-purple/30 bg-void-purple/5 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-void-purple" />
          <div className="text-xs uppercase tracking-[0.3em] text-void-purple">
            AIRDROP WEIGHT
          </div>
        </div>
        
        {isAirdropLoading ? (
          <div className="text-xs text-bio-silver/60">Loading...</div>
        ) : airdropData ? (
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-bio-silver/60">Total Weight</span>
              <span className="text-lg font-bold text-void-purple">
                {airdropData.weight.toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-1.5 text-[0.7rem]">
              <div className="flex justify-between">
                <span className="text-bio-silver/60">XP Component (40%)</span>
                <span className="text-bio-silver">{airdropData.breakdown.xpComponent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bio-silver/60">Tier Component (30%)</span>
                <span className="text-bio-silver">{airdropData.breakdown.tierComponent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bio-silver/60">Quest Component (20%)</span>
                <span className="text-bio-silver">{airdropData.breakdown.questComponent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bio-silver/60">Guild Component (10%)</span>
                <span className="text-bio-silver">{airdropData.breakdown.guildComponent.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-void-purple/20 text-[0.65rem] text-bio-silver/50">
              Airdrop allocation calculated based on activity, tier, and contribution
            </div>
          </div>
        ) : (
          <div className="text-xs text-bio-silver/60">
            Connect wallet to view airdrop weight
          </div>
        )}
      </div>
    </div>
  );
}
