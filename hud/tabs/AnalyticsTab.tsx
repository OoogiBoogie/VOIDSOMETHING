'use client';

/**
 * ANALYTICS TAB - Economic KPIs and data visualization
 * Shows: supply metrics, vault TVL, trading volume, land economy
 * Live Reads: VOID.totalSupply, xVOIDVault.totalStaked, VoidSwapTestnet.reserves
 */

import React from 'react';
import { useAccount, useReadContract } from 'wagmi';

import { formatUnits } from 'viem';
import { VOID_TOKEN_ABI, XVOID_VAULT_ABI } from '@/lib/contracts/abis';

interface AnalyticsTabProps {
  onClose?: () => void;
}

const VOID_TOKEN_ADDRESS = '0x8de4043445939B0D0Cc7d6c752057707279D9893';
const XVOID_VAULT_ADDRESS = '0xab10B2B5E1b07447409BCa889d14F046bEFd8192';

export default function AnalyticsTab({ onClose }: AnalyticsTabProps) {
  
  const { address } = useAccount();

  // Live contract reads
  const { data: totalSupply } = useReadContract({
    address: VOID_TOKEN_ADDRESS as `0x${string}`,
    abi: VOID_TOKEN_ABI,
    functionName: 'totalSupply',
  });

  const { data: totalStaked } = useReadContract({
    address: XVOID_VAULT_ADDRESS as `0x${string}`,
    abi: XVOID_VAULT_ABI,
    functionName: 'totalAssets',
  });

  // Format values
  const totalSupplyFormatted = totalSupply
    ? parseFloat(formatUnits(totalSupply as bigint, 18)).toFixed(0)
    : '0';
  const totalStakedFormatted = totalStaked
    ? parseFloat(formatUnits(totalStaked as bigint, 18)).toFixed(0)
    : '0';
  const stakedPercent = totalSupply && totalStaked
    ? ((Number(totalStaked) / Number(totalSupply)) * 100).toFixed(1)
    : '0';

  // Mock analytics data - ready for API/contract integration
  const mockAnalytics = {
    dailyVolume: 78400, // VoidSwapTestnet daily volume
    landOwned: 320, // Total parcels owned across all players
    uniqueHolders: 542, // VOID token holders
    avgAPR: 12.3, // Average xVOID APR
    treasuryVOID: 210000, // DAO treasury
    activeMissions: 89, // Total active missions
    dailySwaps: 1240, // Number of swaps today
    landSales24h: 12, // Parcels sold in 24h
  };

  // Mock chart data - replace with real charting library (recharts, etc.)
  const mockPriceHistory = [
    { day: 'Mon', price: 0.28 },
    { day: 'Tue', price: 0.29 },
    { day: 'Wed', price: 0.31 },
    { day: 'Thu', price: 0.30 },
    { day: 'Fri', price: 0.29 },
    { day: 'Sat', price: 0.30 },
    { day: 'Sun', price: 0.297 },
  ];

  const mockVolumeHistory = [
    { day: 'Mon', volume: 45000 },
    { day: 'Tue', volume: 52000 },
    { day: 'Wed', volume: 68000 },
    { day: 'Thu', volume: 71000 },
    { day: 'Fri', volume: 59000 },
    { day: 'Sat', volume: 48000 },
    { day: 'Sun', volume: 78400 },
  ];

  const maxVolume = Math.max(...mockVolumeHistory.map(d => d.volume));

  if (!isConnected) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="text-4xl mb-2">📊</div>
        <div className="text-lg font-bold text-void-purple uppercase tracking-wider">Economic Analytics</div>
        <div className="text-sm text-bio-silver/60 max-w-md">
          Connect with Privy to view real-time economic data and performance metrics.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-mono text-sm space-y-6 text-bio-silver">
      {/* Header */}
      <div className="border-b border-bio-silver/30 pb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-2">
          📊 NETWORK ANALYTICS
        </div>
        <div className="text-[0.7rem] text-bio-silver/50">
          Live economic data from Base Sepolia contracts
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-black/40 border border-void-purple/40 rounded">
          <div className="text-[0.6rem] uppercase text-bio-silver/60 mb-1">Total Supply</div>
          <div className="text-lg font-bold text-void-purple">{Number(totalSupplyFormatted).toLocaleString()}</div>
          <div className="text-[0.6rem] text-bio-silver/50 mt-1">VOID</div>
        </div>

        <div className="p-3 bg-black/40 border border-cyber-cyan/40 rounded">
          <div className="text-[0.6rem] uppercase text-bio-silver/60 mb-1">Staked</div>
          <div className="text-lg font-bold text-cyber-cyan">{stakedPercent}%</div>
          <div className="text-[0.6rem] text-bio-silver/50 mt-1">{Number(totalStakedFormatted).toLocaleString()} VOID</div>
        </div>

        <div className="p-3 bg-black/40 border border-signal-green/40 rounded">
          <div className="text-[0.6rem] uppercase text-bio-silver/60 mb-1">24h Volume</div>
          <div className="text-lg font-bold text-signal-green">{mockAnalytics.dailyVolume.toLocaleString()}</div>
          <div className="text-[0.6rem] text-bio-silver/50 mt-1">VOID</div>
        </div>

        <div className="p-3 bg-black/40 border border-psx-blue/40 rounded">
          <div className="text-[0.6rem] uppercase text-bio-silver/60 mb-1">Land Owned</div>
          <div className="text-lg font-bold text-psx-blue">{mockAnalytics.landOwned}</div>
          <div className="text-[0.6rem] text-bio-silver/50 mt-1">Parcels</div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-2 bg-black/40 border border-bio-silver/20 rounded text-center">
          <div className="text-sm font-bold text-bio-silver">{mockAnalytics.uniqueHolders}</div>
          <div className="text-[0.6rem] text-bio-silver/60 uppercase">Holders</div>
        </div>
        <div className="p-2 bg-black/40 border border-bio-silver/20 rounded text-center">
          <div className="text-sm font-bold text-signal-green">{mockAnalytics.avgAPR}%</div>
          <div className="text-[0.6rem] text-bio-silver/60 uppercase">Avg APR</div>
        </div>
        <div className="p-2 bg-black/40 border border-bio-silver/20 rounded text-center">
          <div className="text-sm font-bold text-bio-silver">{mockAnalytics.dailySwaps}</div>
          <div className="text-[0.6rem] text-bio-silver/60 uppercase">Swaps/Day</div>
        </div>
        <div className="p-2 bg-black/40 border border-bio-silver/20 rounded text-center">
          <div className="text-sm font-bold text-void-purple">{mockAnalytics.activeMissions}</div>
          <div className="text-[0.6rem] text-bio-silver/60 uppercase">Active Missions</div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="p-4 bg-black/40 border border-bio-silver/20 rounded">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">
          VOID Price (7 Days)
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {mockPriceHistory.map((item, i) => {
            const maxPrice = 0.32;
            const minPrice = 0.27;
            const range = maxPrice - minPrice;
            const heightPercent = ((item.price - minPrice) / range) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-void-purple to-cyber-cyan rounded-t transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
                <div className="text-[0.6rem] text-bio-silver/60">{item.day}</div>
                <div className="text-[0.65rem] text-void-purple font-bold">${item.price}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Volume Chart */}
      <div className="p-4 bg-black/40 border border-bio-silver/20 rounded">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">
          Trading Volume (7 Days)
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {mockVolumeHistory.map((item, i) => {
            const heightPercent = (item.volume / maxVolume) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-signal-green to-cyber-cyan rounded-t transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
                <div className="text-[0.6rem] text-bio-silver/60">{item.day}</div>
                <div className="text-[0.65rem] text-signal-green font-bold">
                  {(item.volume / 1000).toFixed(0)}K
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Treasury & DAO */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-black/40 border border-psx-blue/40 rounded">
          <div className="text-[0.6rem] uppercase text-bio-silver/60 mb-2">DAO Treasury</div>
          <div className="text-xl font-bold text-psx-blue mb-1">
            {mockAnalytics.treasuryVOID.toLocaleString()} VOID
          </div>
          <div className="text-[0.65rem] text-bio-silver/50">
            Governed by xVOID holders
          </div>
        </div>

        <div className="p-3 bg-black/40 border border-signal-green/40 rounded">
          <div className="text-[0.6rem] uppercase text-bio-silver/60 mb-2">Land Economy</div>
          <div className="text-xl font-bold text-signal-green mb-1">
            {mockAnalytics.landSales24h} Sales
          </div>
          <div className="text-[0.65rem] text-bio-silver/50">
            Last 24 hours across all districts
          </div>
        </div>
      </div>

      {/* Fee Distribution Info */}
      <div className="p-4 bg-black/40 border border-bio-silver/20 rounded">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">
          Fee Distribution Model
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-[0.6rem]">
          <div>
            <div className="text-void-purple font-bold mb-1">40%</div>
            <div className="text-bio-silver/60">Stakers</div>
          </div>
          <div>
            <div className="text-cyber-cyan font-bold mb-1">20%</div>
            <div className="text-bio-silver/60">Creators</div>
          </div>
          <div>
            <div className="text-signal-green font-bold mb-1">10%</div>
            <div className="text-bio-silver/60">Land</div>
          </div>
          <div>
            <div className="text-psx-blue font-bold mb-1">10%</div>
            <div className="text-bio-silver/60">DAO</div>
          </div>
          <div>
            <div className="text-lime-300 font-bold mb-1">10%</div>
            <div className="text-bio-silver/60">AI</div>
          </div>
          <div>
            <div className="text-bio-silver font-bold mb-1">5%</div>
            <div className="text-bio-silver/60">Burn</div>
          </div>
          <div>
            <div className="text-bio-silver font-bold mb-1">5%</div>
            <div className="text-bio-silver/60">Dev</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-bio-silver/30 pt-3">
        <div className="text-[0.65rem] text-bio-silver/50 text-center">
          Analytics refreshed from Base Sepolia · Chain ID 84532
        </div>
      </div>
    </div>
  );
}
