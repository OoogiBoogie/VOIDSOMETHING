'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useVoidVault, useCreatorRoyalties, useClaimableRewards } from '@/hooks/useVoidEngine';

export default function TopBar() {
  const { address } = useAccount();
  const { positions } = useVoidVault(address || '');
  const { royalties } = useCreatorRoyalties(address || '');
  const { rewards } = useClaimableRewards(address || '');

  // Calculate total balances from positions and rewards
  const psxBalance = positions?.find(p => p.stakedToken === 'PSX')?.stakedAmount 
    ? parseFloat(positions.find(p => p.stakedToken === 'PSX')!.stakedAmount) 
    : 12340;
  const createBalance = royalties?.totalEarned 
    ? parseFloat(royalties.totalEarned) 
    : 98765;
  const voidBalance = positions?.reduce((sum, p) => 
    p.stakedToken === 'VOID' ? sum + parseFloat(p.stakedAmount) : sum, 0
  ) || 2345.67;
  const signalBalance = rewards?.reduce((sum, r) => 
    sum + parseFloat(r.amount), 0
  ) || 4201;

  const balances = {
    psx: psxBalance.toLocaleString(),
    create: createBalance.toLocaleString(),
    void: voidBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    signal: signalBalance.toLocaleString(),
  };

  return (
    <header className="flex items-center justify-between rounded-2xl bg-black/80 border border-[#00FF9D]/30 backdrop-blur-xl px-4 py-2 hud-card-signal">
      <div className="flex items-center gap-3">
        <span className="hud-pill bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/60">
          VOID HUD · ONLINE
        </span>
        <div className="hidden md:flex flex-col">
          <span className="text-[0.7rem] font-mono text-[#C7D8FF]/70">
            OPERATOR
          </span>
          <span className="data-text text-xs">AGENT–VOID</span>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <Metric label="PSX" value={balances.psx} className="text-[#3AA3FF]" />
        <Metric label="CREATE" value={balances.create} className="text-[#00D4FF]" />
        <Metric label="VOID" value={balances.void} className="text-[#7C00FF]" />
        <Metric label="SIGNAL" value={balances.signal} className="text-[#00FF9D]" />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute inset-0 opacity-60" />
          <div className="w-3 h-3 rounded-full bg-emerald-400 relative" />
        </div>
        <span className="text-xs font-mono text-[#C7D8FF]/80">0xABCD…1234</span>
      </div>
    </header>
  );
}

function Metric({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="flex flex-col items-end leading-tight">
      <span className={`text-[0.65rem] tracking-[0.25em] font-mono uppercase ${className}`}>
        {label}
      </span>
      <span className={`data-text text-sm ${className}`}>{value}</span>
    </div>
  );
}
