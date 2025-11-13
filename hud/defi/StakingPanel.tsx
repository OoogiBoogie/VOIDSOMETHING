/**
 * VOID PROTOCOL - STAKING PANEL
 * 
 * xVOIDVault staking interface with:
 * - Wallet VOID balance
 * - Staked amount
 * - XP-based APR boost
 * - Claimable rewards
 * - Approve/Stake/Unstake/Claim actions
 */

"use client"

import React, { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'
import { formatUnits, parseUnits, maxUint256 } from 'viem'
import { toast } from 'sonner'
import deployments from '@/deployments/baseSepolia.json'

// Contract addresses from deployment
const VOID_ADDRESS = deployments.VOID as `0x${string}`
const XVOID_VAULT_ADDRESS = deployments.xVOIDVault as `0x${string}`
const XP_ORACLE_ADDRESS = deployments.XPOracle as `0x${string}`

// ABIs
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
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
] as const

const XVOID_VAULT_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'earned',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'stake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getReward',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const

const XP_ORACLE_ABI = [
  {
    name: 'getUserLevel',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getAPRBoost',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export function StakingPanel() {
  const { address, isConnected } = useAccount()
  const { authenticated, login } = usePrivy()
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [activeAction, setActiveAction] = useState<'approve' | 'stake' | 'unstake' | 'claim' | null>(null)

  // Contract reads
  const { data: voidBalance, refetch: refetchVoidBalance } = useReadContract({
    address: VOID_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: VOID_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, XVOID_VAULT_ADDRESS] : undefined,
    query: { enabled: !!address },
  })

  const { data: stakedBalance, refetch: refetchStaked } = useReadContract({
    address: XVOID_VAULT_ADDRESS,
    abi: XVOID_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: claimable, refetch: refetchClaimable } = useReadContract({
    address: XVOID_VAULT_ADDRESS,
    abi: XVOID_VAULT_ABI,
    functionName: 'earned',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: userLevel } = useReadContract({
    address: XP_ORACLE_ADDRESS,
    abi: XP_ORACLE_ABI,
    functionName: 'getUserLevel',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: aprBoost } = useReadContract({
    address: XP_ORACLE_ADDRESS,
    abi: XP_ORACLE_ABI,
    functionName: 'getAPRBoost',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Contract writes
  const { writeContract: writeApprove, data: approveTxHash } = useWriteContract()
  const { writeContract: writeStake, data: stakeTxHash } = useWriteContract()
  const { writeContract: writeUnstake, data: unstakeTxHash } = useWriteContract()
  const { writeContract: writeClaim, data: claimTxHash } = useWriteContract()

  // Transaction receipts
  const { isLoading: isApprovePending } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  })
  const { isLoading: isStakePending } = useWaitForTransactionReceipt({
    hash: stakeTxHash,
  })
  const { isLoading: isUnstakePending } = useWaitForTransactionReceipt({
    hash: unstakeTxHash,
  })
  const { isLoading: isClaimPending } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  })

  // Refetch balances after transactions
  useEffect(() => {
    if (approveTxHash && !isApprovePending) {
      refetchAllowance()
      setActiveAction(null)
      toast.success('VOID approved for staking')
    }
  }, [approveTxHash, isApprovePending, refetchAllowance])

  useEffect(() => {
    if (stakeTxHash && !isStakePending) {
      refetchVoidBalance()
      refetchStaked()
      refetchAllowance()
      setStakeAmount('')
      setActiveAction(null)
      toast.success('VOID staked successfully')
    }
  }, [stakeTxHash, isStakePending, refetchVoidBalance, refetchStaked, refetchAllowance])

  useEffect(() => {
    if (unstakeTxHash && !isUnstakePending) {
      refetchVoidBalance()
      refetchStaked()
      setUnstakeAmount('')
      setActiveAction(null)
      toast.success('VOID unstaked successfully')
    }
  }, [unstakeTxHash, isUnstakePending, refetchVoidBalance, refetchStaked])

  useEffect(() => {
    if (claimTxHash && !isClaimPending) {
      refetchVoidBalance()
      refetchClaimable()
      setActiveAction(null)
      toast.success('Rewards claimed successfully')
    }
  }, [claimTxHash, isClaimPending, refetchVoidBalance, refetchClaimable])

  // Computed values
  const isApproved = allowance ? allowance >= parseUnits('1', 18) : false
  const baseAPR = 10 // Base 10% APR (could be fetched from contract)
  const boostBps = aprBoost ? Number(aprBoost) : 0
  const boostPercent = boostBps / 100
  const totalAPR = baseAPR + boostPercent

  // Action handlers
  const handleApprove = () => {
    if (!address) return
    setActiveAction('approve')
    writeApprove({
      address: VOID_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [XVOID_VAULT_ADDRESS, maxUint256],
    })
  }

  const handleStake = () => {
    if (!address || !stakeAmount) return
    const amount = parseUnits(stakeAmount, 18)
    if (voidBalance && amount > voidBalance) {
      toast.error('Insufficient VOID balance')
      return
    }
    setActiveAction('stake')
    writeStake({
      address: XVOID_VAULT_ADDRESS,
      abi: XVOID_VAULT_ABI,
      functionName: 'stake',
      args: [amount],
    })
  }

  const handleUnstake = () => {
    if (!address || !unstakeAmount) return
    const amount = parseUnits(unstakeAmount, 18)
    if (stakedBalance && amount > stakedBalance) {
      toast.error('Insufficient staked balance')
      return
    }
    setActiveAction('unstake')
    writeUnstake({
      address: XVOID_VAULT_ADDRESS,
      abi: XVOID_VAULT_ABI,
      functionName: 'withdraw',
      args: [amount],
    })
  }

  const handleClaim = () => {
    if (!address) return
    setActiveAction('claim')
    writeClaim({
      address: XVOID_VAULT_ADDRESS,
      abi: XVOID_VAULT_ABI,
      functionName: 'getReward',
    })
  }

  const handleMaxStake = () => {
    if (voidBalance) {
      setStakeAmount(formatUnits(voidBalance, 18))
    }
  }

  const handleMaxUnstake = () => {
    if (stakedBalance) {
      setUnstakeAmount(formatUnits(stakedBalance, 18))
    }
  }

  // Not connected state
  if (!authenticated || !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-[var(--void-neon-purple)]">
            💎 VOID STAKING
          </h3>
          <p className="text-sm text-gray-400">
            Connect wallet with Privy to start staking
          </p>
        </div>
        <button
          onClick={() => login()}
          className="px-6 py-3 bg-gradient-to-r from-[var(--void-neon-purple)] to-purple-600 rounded-lg font-bold hover:scale-105 transition-transform"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  const isPending = isApprovePending || isStakePending || isUnstakePending || isClaimPending

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--void-panel-border)]">
        <h2 className="text-2xl font-bold text-[var(--void-neon-purple)]">
          💎 VOID STAKING
        </h2>
        <div className="text-sm text-gray-400">
          Level {userLevel?.toString() || '0'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-black/30 border border-[var(--void-panel-border)] rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Wallet Balance</div>
          <div className="text-2xl font-mono text-[var(--void-neon-teal)]">
            {voidBalance ? Number(formatUnits(voidBalance, 18)).toFixed(2) : '0.00'}
            <span className="text-sm ml-2">VOID</span>
          </div>
        </div>

        <div className="p-4 bg-black/30 border border-[var(--void-panel-border)] rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Staked Amount</div>
          <div className="text-2xl font-mono text-[var(--void-neon-purple)]">
            {stakedBalance ? Number(formatUnits(stakedBalance, 18)).toFixed(2) : '0.00'}
            <span className="text-sm ml-2">VOID</span>
          </div>
        </div>

        <div className="p-4 bg-black/30 border border-[var(--void-panel-border)] rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Current APR</div>
          <div className="text-2xl font-mono text-green-400">
            {totalAPR.toFixed(1)}%
            {boostPercent > 0 && (
              <span className="text-sm ml-2 text-[var(--void-neon-purple)]">
                +{boostPercent.toFixed(1)}% XP
              </span>
            )}
          </div>
        </div>

        <div className="p-4 bg-black/30 border border-[var(--void-panel-border)] rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Claimable</div>
          <div className="text-2xl font-mono text-yellow-400">
            {claimable ? Number(formatUnits(claimable, 18)).toFixed(3) : '0.000'}
            <span className="text-sm ml-2">VOID</span>
          </div>
        </div>
      </div>

      {/* Pending Transaction Notice */}
      {isPending && (
        <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin w-5 h-5 border-2 border-[var(--void-neon-purple)] border-t-transparent rounded-full" />
            <div>
              <div className="text-sm font-semibold">Transaction pending...</div>
              {(approveTxHash || stakeTxHash || unstakeTxHash || claimTxHash) && (
                <a
                  href={`https://sepolia.basescan.org/tx/${
                    approveTxHash || stakeTxHash || unstakeTxHash || claimTxHash
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--void-neon-teal)] hover:underline"
                >
                  View on Basescan
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stake Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--void-neon-purple)]">Stake VOID</h3>
        <div className="flex space-x-2">
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 px-4 py-2 bg-black/50 border border-[var(--void-panel-border)] rounded-lg font-mono focus:outline-none focus:border-[var(--void-neon-purple)]"
            disabled={isPending}
          />
          <button
            onClick={handleMaxStake}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition-colors"
            disabled={isPending}
          >
            MAX
          </button>
        </div>
        <div className="flex space-x-2">
          {!isApproved ? (
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--void-neon-purple)] to-purple-600 rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {activeAction === 'approve' && isPending ? 'Approving...' : 'Approve VOID'}
            </button>
          ) : (
            <button
              onClick={handleStake}
              disabled={isPending || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--void-neon-purple)] to-purple-600 rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {activeAction === 'stake' && isPending ? 'Staking...' : 'Stake'}
            </button>
          )}
        </div>
      </div>

      {/* Unstake Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--void-neon-teal)]">Unstake VOID</h3>
        <div className="flex space-x-2">
          <input
            type="number"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 px-4 py-2 bg-black/50 border border-[var(--void-panel-border)] rounded-lg font-mono focus:outline-none focus:border-[var(--void-neon-teal)]"
            disabled={isPending}
          />
          <button
            onClick={handleMaxUnstake}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition-colors"
            disabled={isPending}
          >
            MAX
          </button>
        </div>
        <button
          onClick={handleUnstake}
          disabled={isPending || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
          className="w-full px-6 py-3 bg-gradient-to-r from-[var(--void-neon-teal)] to-teal-600 rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {activeAction === 'unstake' && isPending ? 'Unstaking...' : 'Unstake'}
        </button>
      </div>

      {/* Claim Section */}
      <div className="space-y-3">
        <button
          onClick={handleClaim}
          disabled={isPending || !claimable || claimable === 0n}
          className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {activeAction === 'claim' && isPending ? 'Claiming...' : 'Claim Rewards'}
        </button>
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm text-gray-300">
        <div className="font-semibold text-[var(--void-neon-teal)] mb-2">ℹ️ Staking Info</div>
        <ul className="space-y-1 text-xs">
          <li>• Base APR: {baseAPR}%</li>
          <li>• XP Boost: +{boostPercent.toFixed(1)}% (Level {userLevel?.toString() || '0'})</li>
          <li>• Total APR: {totalAPR.toFixed(1)}%</li>
          <li>• Rewards accumulate block-by-block</li>
          <li>• No lock period - unstake anytime</li>
        </ul>
      </div>
    </div>
  )
}
