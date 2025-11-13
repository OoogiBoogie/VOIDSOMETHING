'use client';

import React from 'react';
import { Palette, TrendingUp, Users } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useCreatorRoyalties } from '@/hooks/useVoidEngine';

export default function CreatorHub() {
  const { address } = useAccount();
  const { royalties } = useCreatorRoyalties(address || '');

  const totalEarned = royalties ? parseFloat(royalties.totalEarned) : 0;
  const claimable = royalties ? parseFloat(royalties.claimable) : 0;

  return (
    <section className="space-y-4">
      {/* Creator earnings */}
      <div className="hud-card-cyber">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-[#00D4FF] flex items-center gap-2">
            <Palette className="w-4 h-4" />
            CREATOR EARNINGS
          </h2>
          <span className="hud-pill bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/40">
            ACTIVE
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-black/40 rounded-xl p-4 border border-[#00D4FF]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">Total Earned</p>
            <p className="data-text text-[#00D4FF] text-xl">
              {totalEarned.toLocaleString()} CREATE
            </p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-[#00D4FF]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">Claimable</p>
            <p className="data-text text-[#00FF9D] text-xl">
              {claimable.toLocaleString()} CREATE
            </p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-[#00D4FF]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">This Week</p>
            <p className="data-text text-[#7C00FF] text-xl">
              +{(claimable * 0.3).toFixed(0)} CREATE
            </p>
          </div>
        </div>

        <button className="mt-4 w-full py-3 bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 border border-[#00D4FF]/60 rounded-xl text-[#00D4FF] font-display text-sm uppercase tracking-wider transition-all">
          Claim Royalties
        </button>
      </div>

      {/* Recent drops */}
      <div className="hud-card-cyber">
        <h2 className="text-xs text-[#00D4FF] mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          RECENT DROPS
        </h2>
        <div className="space-y-2">
          {[
            { name: 'Cyber Samurai #042', sales: 12, revenue: 340 },
            { name: 'Neon Dreams Collection', sales: 8, revenue: 280 },
            { name: 'VOID Glitch Art', sales: 5, revenue: 150 },
          ].map((drop, i) => (
            <div 
              key={i}
              className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
            >
              <div>
                <p className="text-[0.75rem] text-[#C7D8FF]">{drop.name}</p>
                <p className="text-[0.65rem] text-[#C7D8FF]/60">{drop.sales} sales</p>
              </div>
              <span className="data-text text-[#00D4FF]">+{drop.revenue} CREATE</span>
            </div>
          ))}
        </div>
      </div>

      {/* Creator leaderboard */}
      <div className="hud-card-cyber">
        <h2 className="text-xs text-[#00D4FF] mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          TOP CREATORS · THIS MONTH
        </h2>
        <div className="space-y-2">
          {[
            { rank: 1, name: 'CyberArtist_X', earned: 45200 },
            { rank: 2, name: 'VoidCreator', earned: 38900 },
            { rank: 3, name: 'NeonDreamer', earned: 31500 },
          ].map((creator) => (
            <div 
              key={creator.rank}
              className="flex items-center justify-between p-2 bg-black/40 rounded hover:bg-black/60 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="data-text text-[#00D4FF] font-bold">#{creator.rank}</span>
                <span className="text-[0.75rem] text-[#C7D8FF]">{creator.name}</span>
              </div>
              <span className="data-text text-[#00FF9D]">{creator.earned.toLocaleString()} CREATE</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
