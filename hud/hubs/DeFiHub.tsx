'use client';

import React from 'react';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useVoidVault, useVaultYieldRates } from '@/hooks/useVoidEngine';

export default function DeFiHub() {
  const { address } = useAccount();
  const { positions } = useVoidVault(address || '');
  const { rates } = useVaultYieldRates();

  const totalStaked = positions?.reduce((sum, p) => sum + parseFloat(p.stakedAmount), 0) || 0;
  const totalPending = positions?.reduce((sum, p) => 
    sum + p.pendingRewards.reduce((s, r) => s + parseFloat(r.amount), 0), 0
  ) || 0;

  return (
    <section className="space-y-4">
      {/* Vault overview */}
      <div className="hud-card-void">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-[#7C00FF] flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            VOID VAULT · OVERVIEW
          </h2>
          <span className="hud-pill bg-[#7C00FF]/10 text-[#7C00FF] border border-[#7C00FF]/40">
            STAKING LIVE
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-black/40 rounded-xl p-4 border border-[#7C00FF]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">Total Staked</p>
            <p className="data-text text-[#7C00FF] text-xl">
              {totalStaked.toLocaleString()} VOID
            </p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-[#7C00FF]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">Pending Rewards</p>
            <p className="data-text text-[#00FF9D] text-xl">
              +{totalPending.toFixed(2)} VOID
            </p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-[#7C00FF]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">Avg APR</p>
            <p className="data-text text-[#00D4FF] text-xl">
              18.5%
            </p>
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-2">
          <button className="py-2 bg-[#7C00FF]/20 hover:bg-[#7C00FF]/30 border border-[#7C00FF]/60 rounded-lg text-[#7C00FF] font-display text-xs uppercase tracking-wider transition-all">
            Stake More
          </button>
          <button className="py-2 bg-[#00FF9D]/20 hover:bg-[#00FF9D]/30 border border-[#00FF9D]/60 rounded-lg text-[#00FF9D] font-display text-xs uppercase tracking-wider transition-all">
            Claim All
          </button>
        </div>
      </div>

      {/* Yield rates */}
      <div className="hud-card-void">
        <h2 className="text-xs text-[#7C00FF] mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          YIELD RATES
        </h2>
        <div className="space-y-2">
          {rates && rates.length > 0 ? (
            rates.map((rate, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-[#7C00FF]/10 hover:border-[#7C00FF]/30 transition-all"
              >
                <div>
                  <p className="text-[0.75rem] text-[#C7D8FF]">{rate.stakedToken}</p>
                  <p className="text-[0.65rem] text-[#C7D8FF]/60">Base APR</p>
                </div>
                <span className="data-text text-[#7C00FF]">{rate.baseAprPct}%</span>
              </div>
            ))
          ) : (
            <>
              <YieldRateCard token="VOID" apr={18.5} />
              <YieldRateCard token="PSX" apr={22.0} />
              <YieldRateCard token="CREATE" apr={15.5} />
            </>
          )}
        </div>
      </div>

      {/* Pool statistics */}
      <div className="hud-card-void">
        <h2 className="text-xs text-[#7C00FF] mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          POOL STATISTICS
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total TVL" value="$2.4M" color="#7C00FF" />
          <StatCard label="24h Volume" value="$182K" color="#00D4FF" />
          <StatCard label="Total Stakers" value="1,247" color="#00FF9D" />
          <StatCard label="Avg Lock Time" value="45 days" color="#3AA3FF" />
        </div>
      </div>
    </section>
  );
}

function YieldRateCard({ token, apr }: { token: string; apr: number }) {
  return (
    <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-[#7C00FF]/10 hover:border-[#7C00FF]/30 transition-all">
      <div>
        <p className="text-[0.75rem] text-[#C7D8FF]">{token}</p>
        <p className="text-[0.65rem] text-[#C7D8FF]/60">Base APR</p>
      </div>
      <span className="data-text text-[#7C00FF]">{apr}%</span>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-black/40 rounded-lg p-3 border border-[#7C00FF]/10">
      <p className="text-[0.65rem] text-[#C7D8FF]/60 mb-1">{label}</p>
      <p className="data-text text-lg" style={{ color }}>{value}</p>
    </div>
  );
}
