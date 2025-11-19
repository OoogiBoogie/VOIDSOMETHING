'use client';

/**
 * DAO TAB - Governance and voting
 * Shows: voting power, proposals, voting interface, governance metrics
 * Actions: vote on proposals, delegate power
 */

import React, { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';

import { formatUnits } from 'viem';
import { XVOID_VAULT_ABI } from '@/lib/contracts/abis';

interface Proposal {
  id: number;
  title: string;
  description: string;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  timeRemaining: string;
}

interface DAOTabProps {
  onClose?: () => void;
}

const CONTRACTS = {
  xVOIDVault: '0xab10B2B5E1b07447409BCa889d14F046bEFd8192',
};

export default function DAOTab({ onClose }: DAOTabProps) {
  
  const { address } = useAccount();
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);

  // Read voting power from staked xVOID
  const { data: votingPower } = useReadContract({
    address: CONTRACTS.xVOIDVault as `0x${string}`,
    abi: XVOID_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const votingPowerFormatted = votingPower ? parseFloat(formatUnits(votingPower as bigint, 18)) : 0;

  // Mock proposals - ready to replace with VoidDAO.getProposals()
  const mockProposals: Proposal[] = [
    {
      id: 18,
      title: 'Enable Cross-District Trade Tax',
      description: 'Implement 0.1% tax on land transfers between districts to fund district development',
      forVotes: 12500,
      againstVotes: 3200,
      abstainVotes: 1100,
      status: 'active',
      timeRemaining: '8h 23m',
    },
    {
      id: 19,
      title: 'Launch PSX Vault on Mainnet',
      description: 'Deploy the PSX staking vault to mainnet with 15% base APR',
      forVotes: 28000,
      againstVotes: 2100,
      abstainVotes: 800,
      status: 'active',
      timeRemaining: '2d 4h',
    },
    {
      id: 20,
      title: 'Integrate Zora Reward Layer',
      description: 'Add Zora protocol for creator NFT rewards and royalty distribution',
      forVotes: 8900,
      againstVotes: 9200,
      abstainVotes: 2400,
      status: 'active',
      timeRemaining: '5d 12h',
    },
    {
      id: 17,
      title: 'Airdrop to Active Agents',
      description: 'Distribute 50,000 VOID to wallets with >1000 XP',
      forVotes: 32000,
      againstVotes: 1200,
      abstainVotes: 900,
      status: 'passed',
      timeRemaining: 'Ended',
    },
  ];

  const mockMetrics = {
    activeProposals: 3,
    passedProposals: 142,
    participationRate: 67,
    treasuryVOID: 210000,
    treasuryAPY: 3.1,
  };

  const handleVote = (proposalId: number, support: 0 | 1 | 2) => {
    // TODO: Wire to VoidDAO.vote(proposalId, support)
    // support: 0 = against, 1 = for, 2 = abstain
    console.log(`Vote on proposal ${proposalId}:`, support);
  };

  const getTotalVotes = (proposal: Proposal) => {
    return proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
  };

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? ((votes / total) * 100).toFixed(1) : '0.0';
  };

  if (!isConnected) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="text-4xl mb-2">🏛</div>
        <div className="text-lg font-bold text-psx-blue uppercase tracking-wider">DAO Governance</div>
        <div className="text-sm text-bio-silver/60 max-w-md">
          Connect with Privy to participate in the VOID network governance.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-mono text-sm space-y-6 text-bio-silver">
      {/* Header */}
      <div className="border-b border-bio-silver/30 pb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-2">
          🏛 GOVERNANCE : DAO CORE
        </div>
      </div>

      {/* Voting Power */}
      <div className="p-4 border border-psx-blue/40 rounded-lg bg-black/40 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-bio-silver/60 uppercase tracking-wider">Your Voting Power</div>
            <div className="text-2xl font-bold text-psx-blue">{votingPowerFormatted.toFixed(2)} xVOID</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-bio-silver/60">Governance Level</div>
            <div className="text-sm font-bold text-signal-green">
              {votingPowerFormatted > 10000 ? 'Validator' : votingPowerFormatted > 1000 ? 'Delegate' : 'Member'}
            </div>
          </div>
        </div>

        {votingPowerFormatted === 0 && (
          <div className="p-2 bg-psx-blue/10 border border-psx-blue/30 rounded text-[0.7rem] text-psx-blue">
            💡 Stake VOID in the DeFi tab to gain voting power
          </div>
        )}
      </div>

      {/* Governance Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-black/40 border border-bio-silver/20 rounded text-center">
          <div className="text-lg font-bold text-cyber-cyan">{mockMetrics.activeProposals}</div>
          <div className="text-[0.65rem] text-bio-silver/60 uppercase">Active</div>
        </div>
        <div className="p-3 bg-black/40 border border-bio-silver/20 rounded text-center">
          <div className="text-lg font-bold text-signal-green">{mockMetrics.passedProposals}</div>
          <div className="text-[0.65rem] text-bio-silver/60 uppercase">Passed</div>
        </div>
        <div className="p-3 bg-black/40 border border-bio-silver/20 rounded text-center">
          <div className="text-lg font-bold text-void-purple">{mockMetrics.participationRate}%</div>
          <div className="text-[0.65rem] text-bio-silver/60 uppercase">Participation</div>
        </div>
      </div>

      {/* Proposals List */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">
          Active Proposals ({mockProposals.filter(p => p.status === 'active').length})
        </div>

        <div className="space-y-3">
          {mockProposals.map((proposal) => {
            const total = getTotalVotes(proposal);
            const forPct = parseFloat(getVotePercentage(proposal.forVotes, total));
            const againstPct = parseFloat(getVotePercentage(proposal.againstVotes, total));
            const abstainPct = parseFloat(getVotePercentage(proposal.abstainVotes, total));

            return (
              <div
                key={proposal.id}
                className={`p-4 bg-black/40 border rounded transition-colors ${
                  proposal.status === 'active'
                    ? 'border-psx-blue/40 hover:border-psx-blue'
                    : 'border-bio-silver/20'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.75rem] font-bold text-psx-blue">#{proposal.id}</span>
                      <span className="text-[0.75rem] font-bold text-bio-silver">{proposal.title}</span>
                      {proposal.status === 'passed' && (
                        <span className="text-[0.6rem] px-2 py-0.5 bg-signal-green/20 border border-signal-green/40 rounded text-signal-green">
                          PASSED
                        </span>
                      )}
                    </div>
                    <div className="text-[0.65rem] text-bio-silver/60 mb-2">{proposal.description}</div>
                    <div className="text-[0.65rem] text-cyber-cyan">
                      {proposal.status === 'active' ? `⏱ ${proposal.timeRemaining} remaining` : '✓ Ended'}
                    </div>
                  </div>
                </div>

                {/* Vote Bars */}
                <div className="space-y-2 mb-3">
                  <div>
                    <div className="flex justify-between text-[0.65rem] mb-1">
                      <span className="text-signal-green">For</span>
                      <span className="text-bio-silver">{proposal.forVotes.toLocaleString()} ({forPct}%)</span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-signal-green to-signal-green/80"
                        style={{ width: `${forPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[0.65rem] mb-1">
                      <span className="text-red-400">Against</span>
                      <span className="text-bio-silver">{proposal.againstVotes.toLocaleString()} ({againstPct}%)</span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-400 to-red-400/80"
                        style={{ width: `${againstPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[0.65rem] mb-1">
                      <span className="text-bio-silver/60">Abstain</span>
                      <span className="text-bio-silver">{proposal.abstainVotes.toLocaleString()} ({abstainPct}%)</span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-bio-silver/40 to-bio-silver/20"
                        style={{ width: `${abstainPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Vote Buttons */}
                {proposal.status === 'active' && (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleVote(proposal.id, 1)}
                      disabled={votingPowerFormatted === 0}
                      className="py-1.5 px-3 bg-signal-green/20 border border-signal-green hover:bg-signal-green/30 rounded text-signal-green font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      For
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 0)}
                      disabled={votingPowerFormatted === 0}
                      className="py-1.5 px-3 bg-red-400/20 border border-red-400 hover:bg-red-400/30 rounded text-red-400 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Against
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 2)}
                      disabled={votingPowerFormatted === 0}
                      className="py-1.5 px-3 bg-bio-silver/20 border border-bio-silver hover:bg-bio-silver/30 rounded text-bio-silver font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Abstain
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Treasury Info */}
      <div className="border-t border-bio-silver/30 pt-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">DAO Treasury</div>
        <div className="grid grid-cols-3 gap-3 text-[0.7rem]">
          <div className="p-2 bg-black/40 border border-bio-silver/20 rounded text-center">
            <div className="text-sm font-bold text-void-purple">{mockMetrics.treasuryVOID.toLocaleString()}</div>
            <div className="text-[0.6rem] text-bio-silver/60">VOID Holdings</div>
          </div>
          <div className="p-2 bg-black/40 border border-bio-silver/20 rounded text-center">
            <div className="text-sm font-bold text-signal-green">{mockMetrics.treasuryAPY}%</div>
            <div className="text-[0.6rem] text-bio-silver/60">Yield APY</div>
          </div>
          <div className="p-2 bg-black/40 border border-bio-silver/20 rounded text-center">
            <div className="text-sm font-bold text-cyber-cyan">12h</div>
            <div className="text-[0.6rem] text-bio-silver/60">Last Distribution</div>
          </div>
        </div>
      </div>

      {votingPowerFormatted === 0 && (
        <div className="p-3 bg-red-500/10 border border-red-500/40 rounded text-center text-[0.7rem] text-red-400">
          ⚠️ You need xVOID voting power to participate in governance
        </div>
      )}
    </div>
  );
}
