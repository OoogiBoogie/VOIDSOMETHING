/**
 * VOID Governance Service
 * 
 * Manages DAO proposals and voting with PSX-based governance.
 * Implements voting power formula: PSX + (VOID × 0.5) + (vXP × 0.2)
 * 
 * Key Functions:
 * - Create and manage proposals
 * - Calculate voting power
 * - Track votes and results
 * - Execute approved proposals
 * 
 * This is what GovernanceAI (Phase 5) will use to draft proposals.
 */

import {
  GovernanceProposal,
  ProposalParams,
  VotingPower,
  TokenSymbol,
} from './voidTypes';
import { voidEmitterService } from './voidEmitterService';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_PROPOSALS: GovernanceProposal[] = [
  {
    id: 'prop-001',
    type: 'emission_adjust',
    title: 'Increase VOID Emission Rate to 1.2x',
    description: 'Due to increased activity (50% more daily txs), EmissionAI recommends increasing VOID emission rate from 1.0x to 1.2x to maintain reward competitiveness.',
    proposer: '0xEMISSION_AI_AGENT',
    status: 'active',
    votesFor: '15000000',
    votesAgainst: '3000000',
    votesAbstain: '1000000',
    quorum: '10000000',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    params: {
      emissionRates: {
        voidEmitterRate: 1.2,
      },
    },
  },
  {
    id: 'prop-002',
    type: 'pool_refill',
    title: 'Refill PSX Reward Pool with 500K PSX',
    description: 'PSX reward pool currently at 18% capacity. VaultAI recommends refilling with 500,000 PSX from treasury to sustain staking rewards for next 6 months.',
    proposer: '0xVAULT_AI_AGENT',
    status: 'succeeded',
    votesFor: '22000000',
    votesAgainst: '1500000',
    votesAbstain: '500000',
    quorum: '10000000',
    startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    params: {
      poolRefills: [
        {
          token: 'PSX',
          amount: '500000',
        },
      ],
    },
  },
];

const MOCK_VOTES: Map<string, { userId: string; support: 'for' | 'against' | 'abstain'; power: number }[]> = new Map();

// Quorum requirement (10M voting power minimum)
const QUORUM_REQUIRED = 10_000_000;

// Voting period (7 days default)
const VOTING_PERIOD_DAYS = 7;

// ============================================================================
// SERVICE
// ============================================================================

class VoidGovernanceService {
  /**
   * Calculate voting power for a user
   * Formula: PSX_held + (VOID_staked × 0.5) + (vXP × 0.2)
   */
  async calculateVotingPower(userId: string): Promise<VotingPower> {
    // TODO: Get actual balances from wallet/vault
    // For now, mock data
    const psxHeld = '100000'; // Mock: 100K PSX
    const voidStaked = '500000'; // Mock: 500K VOID staked

    // Get vXP from emitter service
    const userVXP = await voidEmitterService.getUserVXP(userId);
    const vxpScore = userVXP?.total || 0;

    // Calculate weights
    const psxWeight = parseFloat(psxHeld);
    const voidWeight = parseFloat(voidStaked) * 0.5;
    const vxpWeight = vxpScore * 0.2;

    const totalPower = psxWeight + voidWeight + vxpWeight;

    return {
      userId,
      psxHeld,
      psxWeight,
      voidStaked,
      voidWeight,
      vxpScore,
      vxpWeight,
      totalPower,
    };
  }

  /**
   * Get all proposals
   */
  async getProposals(status?: GovernanceProposal['status']): Promise<GovernanceProposal[]> {
    if (status) {
      return MOCK_PROPOSALS.filter((p) => p.status === status);
    }
    return MOCK_PROPOSALS;
  }

  /**
   * Get a specific proposal
   */
  async getProposal(proposalId: string): Promise<GovernanceProposal | null> {
    return MOCK_PROPOSALS.find((p) => p.id === proposalId) || null;
  }

  /**
   * Create a new proposal (requires minimum voting power)
   */
  async createProposal(
    proposer: string,
    type: GovernanceProposal['type'],
    title: string,
    description: string,
    params?: ProposalParams
  ): Promise<GovernanceProposal> {
    // Check proposer voting power (minimum 100K required)
    const votingPower = await this.calculateVotingPower(proposer);
    if (votingPower.totalPower < 100_000) {
      throw new Error('Insufficient voting power to create proposal (minimum: 100,000)');
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + VOTING_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    const proposal: GovernanceProposal = {
      id: `prop-${Date.now()}`,
      type,
      title,
      description,
      proposer,
      status: 'pending',
      votesFor: '0',
      votesAgainst: '0',
      votesAbstain: '0',
      quorum: QUORUM_REQUIRED.toString(),
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
      params,
    };

    MOCK_PROPOSALS.push(proposal);
    MOCK_VOTES.set(proposal.id, []);

    // TODO: Replace with actual on-chain proposal creation
    return proposal;
  }

  /**
   * Cast a vote on a proposal
   */
  async vote(
    proposalId: string,
    userId: string,
    support: 'for' | 'against' | 'abstain'
  ): Promise<{
    success: boolean;
    votingPower: number;
    txHash: string;
  }> {
    const proposal = MOCK_PROPOSALS.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.status !== 'active') {
      throw new Error('Proposal is not active for voting');
    }

    // Check if already voted
    const votes = MOCK_VOTES.get(proposalId) || [];
    if (votes.some((v) => v.userId === userId)) {
      throw new Error('Already voted on this proposal');
    }

    // Calculate voting power
    const votingPower = await this.calculateVotingPower(userId);

    // Record vote
    votes.push({
      userId,
      support,
      power: votingPower.totalPower,
    });
    MOCK_VOTES.set(proposalId, votes);

    // Update proposal vote counts
    const powerStr = votingPower.totalPower.toFixed(2);
    switch (support) {
      case 'for':
        proposal.votesFor = (parseFloat(proposal.votesFor) + votingPower.totalPower).toFixed(2);
        break;
      case 'against':
        proposal.votesAgainst = (parseFloat(proposal.votesAgainst) + votingPower.totalPower).toFixed(2);
        break;
      case 'abstain':
        proposal.votesAbstain = (parseFloat(proposal.votesAbstain) + votingPower.totalPower).toFixed(2);
        break;
    }

    // Award vXP for voting
    await voidEmitterService.recordAction(userId, 'governance', 'vote_cast', {
      proposalId,
      support,
      votingPower: votingPower.totalPower,
    });

    // TODO: Replace with actual on-chain vote transaction
    return {
      success: true,
      votingPower: votingPower.totalPower,
      txHash: '0xMOCK_VOTE_TX',
    };
  }

  /**
   * Get votes for a proposal
   */
  async getProposalVotes(proposalId: string): Promise<{
    userId: string;
    support: 'for' | 'against' | 'abstain';
    power: number;
  }[]> {
    return MOCK_VOTES.get(proposalId) || [];
  }

  /**
   * Check if proposal has reached quorum and update status
   */
  async updateProposalStatus(proposalId: string): Promise<GovernanceProposal> {
    const proposal = MOCK_PROPOSALS.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    const now = Date.now();
    const endTime = new Date(proposal.endTime).getTime();

    // Check if voting period has ended
    if (now >= endTime && proposal.status === 'active') {
      const totalVotes =
        parseFloat(proposal.votesFor) +
        parseFloat(proposal.votesAgainst) +
        parseFloat(proposal.votesAbstain);

      const quorum = parseFloat(proposal.quorum);

      // Check quorum
      if (totalVotes < quorum) {
        proposal.status = 'failed';
      } else {
        // Check if for > against
        const votesFor = parseFloat(proposal.votesFor);
        const votesAgainst = parseFloat(proposal.votesAgainst);

        if (votesFor > votesAgainst) {
          proposal.status = 'succeeded';
        } else {
          proposal.status = 'failed';
        }
      }
    }

    return proposal;
  }

  /**
   * Execute a succeeded proposal (admin/timelock)
   */
  async executeProposal(proposalId: string): Promise<{
    success: boolean;
    txHash: string;
    result: string;
  }> {
    const proposal = MOCK_PROPOSALS.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.status !== 'succeeded') {
      throw new Error('Proposal must be in succeeded state to execute');
    }

    let result = '';

    // Execute based on proposal type
    switch (proposal.type) {
      case 'emission_adjust':
        if (proposal.params?.emissionRates) {
          // TODO: Call voidHookRouterService.setEmissionRates()
          result = `Emission rates updated: ${JSON.stringify(proposal.params.emissionRates)}`;
        }
        break;

      case 'pool_refill':
        if (proposal.params?.poolRefills) {
          // TODO: Call voidTreasuryService.refillRewardPool()
          result = `Pool refills executed: ${proposal.params.poolRefills.length} pools`;
        }
        break;

      case 'hook_update':
        if (proposal.params?.hookUpdates) {
          // TODO: Call voidHookRouterService.setHook()
          result = `Hook updated: ${proposal.params.hookUpdates.hookId}`;
        }
        break;

      case 'treasury_spend':
        if (proposal.params?.treasurySpend) {
          // TODO: Execute treasury transfer
          result = `Treasury transfer: ${proposal.params.treasurySpend.amount} ${proposal.params.treasurySpend.token}`;
        }
        break;

      default:
        result = 'Custom proposal executed';
    }

    proposal.status = 'executed';

    // TODO: Replace with actual on-chain execution
    return {
      success: true,
      txHash: '0xMOCK_EXECUTE_TX',
      result,
    };
  }

  /**
   * Get governance statistics
   */
  async getGovernanceStats(): Promise<{
    totalProposals: number;
    activeProposals: number;
    succeededProposals: number;
    failedProposals: number;
    totalVotingPower: number;
    uniqueVoters: number;
    participationRate: number;
    avgVotesPerProposal: number;
  }> {
    const totalProposals = MOCK_PROPOSALS.length;
    const activeProposals = MOCK_PROPOSALS.filter((p) => p.status === 'active').length;
    const succeededProposals = MOCK_PROPOSALS.filter((p) => p.status === 'succeeded' || p.status === 'executed').length;
    const failedProposals = MOCK_PROPOSALS.filter((p) => p.status === 'failed').length;

    // Count unique voters across all proposals
    const uniqueVoters = new Set();
    for (const votes of MOCK_VOTES.values()) {
      for (const vote of votes) {
        uniqueVoters.add(vote.userId);
      }
    }

    // Calculate total voting power that has participated
    let totalVotingPower = 0;
    for (const votes of MOCK_VOTES.values()) {
      for (const vote of votes) {
        totalVotingPower += vote.power;
      }
    }

    const avgVotesPerProposal = totalProposals > 0 ? uniqueVoters.size / totalProposals : 0;

    // Participation rate (voters / total eligible ~ simplified)
    const participationRate = totalProposals > 0 ? (uniqueVoters.size / 10000) * 100 : 0; // Mock: assume 10K eligible voters

    return {
      totalProposals,
      activeProposals,
      succeededProposals,
      failedProposals,
      totalVotingPower,
      uniqueVoters: uniqueVoters.size,
      participationRate,
      avgVotesPerProposal,
    };
  }

  /**
   * Get voting power leaderboard
   */
  async getVotingPowerLeaderboard(limit: number = 10): Promise<VotingPower[]> {
    // TODO: Get real user data
    // For now, mock top voters
    const mockUserIds = Array.from({ length: limit }, (_, i) => `user-${i + 1}`);

    const leaderboard = await Promise.all(
      mockUserIds.map((userId) => this.calculateVotingPower(userId))
    );

    return leaderboard.sort((a, b) => b.totalPower - a.totalPower);
  }
}

// Singleton export
export const voidGovernanceService = new VoidGovernanceService();
