'use client';

import React from 'react';
import { Vote, Users, TrendingUp } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useVotingPower } from '@/hooks/useVoidEngine';

export default function DAOHub() {
  const { address } = useAccount();
  const { votingPower } = useVotingPower(address || '');

  // Mock proposals for now
  const proposals: any[] = [];
  const activeProposals = 3;
  const totalPower = votingPower?.totalPower || 0;

  return (
    <section className="space-y-4">
      {/* Voting power */}
      <div className="hud-card-psx">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-[#3AA3FF] flex items-center gap-2">
            <Vote className="w-4 h-4" />
            YOUR VOTING POWER
          </h2>
          <span className="hud-pill bg-[#3AA3FF]/10 text-[#3AA3FF] border border-[#3AA3FF]/40">
            DAO MEMBER
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-black/40 rounded-xl p-4 border border-[#3AA3FF]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">Total Power</p>
            <p className="data-text text-[#3AA3FF] text-xl">
              {totalPower.toLocaleString()}
            </p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-[#3AA3FF]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">PSX Weight</p>
            <p className="data-text text-[#00FF9D] text-xl">
              {votingPower?.psxWeight.toLocaleString() || '0'}
            </p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-[#3AA3FF]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">VOID Weight</p>
            <p className="data-text text-[#7C00FF] text-xl">
              {votingPower?.voidWeight.toLocaleString() || '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Active proposals */}
      <div className="hud-card-psx">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-[#3AA3FF] flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            ACTIVE PROPOSALS
          </h2>
          <span className="text-[0.65rem] text-[#C7D8FF]/60">
            {activeProposals} active
          </span>
        </div>

        <div className="space-y-3">
          {proposals && proposals.length > 0 ? (
            proposals.slice(0, 3).map((proposal: any, i: number) => (
              <ProposalCard key={i} proposal={proposal} />
            ))
          ) : (
            <>
              <ProposalCard 
                proposal={{
                  id: '1',
                  title: 'Increase Creator Royalty Pool',
                  description: 'Allocate 5% more to creator rewards',
                  votesFor: 12420,
                  votesAgainst: 3180,
                  status: 'active',
                  endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
                }}
              />
              <ProposalCard 
                proposal={{
                  id: '2',
                  title: 'Enable VOID Vault Auto-Compound',
                  description: 'Automatically reinvest rewards',
                  votesFor: 8940,
                  votesAgainst: 6780,
                  status: 'active',
                  endTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* DAO statistics */}
      <div className="hud-card-psx">
        <h2 className="text-xs text-[#3AA3FF] mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          DAO STATISTICS
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Members" value="2,847" color="#3AA3FF" />
          <StatCard label="Active Voters" value="1,204" color="#00FF9D" />
          <StatCard label="Proposals (30d)" value="12" color="#00D4FF" />
          <StatCard label="Avg Turnout" value="68%" color="#7C00FF" />
        </div>
      </div>
    </section>
  );
}

function ProposalCard({ proposal }: { proposal: any }) {
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const yesPercent = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;

  return (
    <div className="bg-black/40 rounded-xl p-4 border border-[#3AA3FF]/10 hover:border-[#3AA3FF]/30 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-[0.8rem] text-[#C7D8FF] mb-1">{proposal.title}</p>
          <p className="text-[0.65rem] text-[#C7D8FF]/60">{proposal.description}</p>
        </div>
      </div>

      {/* Vote progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-[0.65rem] mb-1">
          <span className="text-[#00FF9D]">YES {yesPercent.toFixed(0)}%</span>
          <span className="text-[#FF3A52]">NO {(100 - yesPercent).toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00FF9D]"
            style={{ width: `${yesPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[0.65rem]">
        <span className="text-[#C7D8FF]/60">Ends in 2d 14h</span>
        <button className="px-3 py-1 bg-[#3AA3FF]/20 hover:bg-[#3AA3FF]/30 border border-[#3AA3FF]/40 rounded text-[#3AA3FF] font-mono uppercase transition-all">
          Vote
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-black/40 rounded-lg p-3 border border-[#3AA3FF]/10">
      <p className="text-[0.65rem] text-[#C7D8FF]/60 mb-1">{label}</p>
      <p className="data-text text-lg" style={{ color }}>{value}</p>
    </div>
  );
}
