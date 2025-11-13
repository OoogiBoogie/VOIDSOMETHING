/**
 * Governance Service
 * Handles proposals, voting, delegations, and system health KPIs
 */

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: ProposalStatus;
  type: ProposalType;
  votingPower: {
    for: number;
    against: number;
    abstain: number;
  };
  quorum: number;
  threshold: number;
  startBlock: number;
  endBlock: number;
  createdAt: Date;
  executedAt?: Date;
  params?: ProposalParams;
}

export type ProposalStatus = 'pending' | 'active' | 'passed' | 'failed' | 'executed' | 'cancelled';
export type ProposalType = 'parameter' | 'treasury' | 'incubator' | 'upgrade' | 'general';

export interface ProposalParams {
  target?: string;
  functionCall?: string;
  args?: any[];
  before?: any;
  after?: any;
}

export interface Vote {
  id: string;
  proposalId: string;
  voter: string;
  support: 'for' | 'against' | 'abstain';
  votingPower: number;
  reason?: string;
  timestamp: Date;
}

export interface VotingPower {
  vePSX: number;
  xVOID: number;
  agency?: number;
  total: number;
}

export interface Delegation {
  id: string;
  delegator: string;
  delegatee: string;
  token: 'vePSX' | 'xVOID' | 'AGENCY';
  amount: number;
  createdAt: Date;
}

export interface SystemHealth {
  activeCreators: number;
  tvl: number;
  volume24h: number;
  volume7d: number;
  landUtilization: number;
  engagement: EngagementMetrics;
  treasuryGrowth: TreasuryGrowth;
}

export interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionTime: number;
}

export interface TreasuryGrowth {
  current: number;
  changePercent24h: number;
  changePercent7d: number;
  changePercent30d: number;
}

class GovernanceService {
  private proposals: Map<string, Proposal> = new Map();
  private votes: Map<string, Vote[]> = new Map();
  private delegations: Map<string, Delegation> = new Map();

  /**
   * Get all proposals
   */
  async getProposals(filter?: {
    status?: ProposalStatus;
    type?: ProposalType;
  }): Promise<Proposal[]> {
    // TODO: Replace with actual API call to gov_db
    let proposals = Array.from(this.proposals.values());

    if (filter) {
      if (filter.status) {
        proposals = proposals.filter(p => p.status === filter.status);
      }
      if (filter.type) {
        proposals = proposals.filter(p => p.type === filter.type);
      }
    }

    return proposals;
  }

  /**
   * Get proposal by ID
   */
  async getProposal(proposalId: string): Promise<Proposal | null> {
    // TODO: Replace with actual API call
    return this.proposals.get(proposalId) || null;
  }

  /**
   * Create proposal
   */
  async createProposal(
    proposal: Omit<Proposal, 'id' | 'status' | 'votingPower' | 'createdAt'>
  ): Promise<Proposal> {
    // TODO: Replace with actual governance contract call
    const newProposal: Proposal = {
      ...proposal,
      id: `prop-${Date.now()}`,
      status: 'pending',
      votingPower: { for: 0, against: 0, abstain: 0 },
      createdAt: new Date(),
    };

    this.proposals.set(newProposal.id, newProposal);
    return newProposal;
  }

  /**
   * Create proposal from incubator application
   */
  async createProposalFromApplication(applicationId: string): Promise<Proposal> {
    // TODO: Get application data from creatorService
    // TODO: Generate proposal with incubator parameters

    const proposal: Proposal = {
      id: `prop-${Date.now()}`,
      title: `Fund Incubator Application ${applicationId}`,
      description: 'Proposal to approve funding for incubator application',
      proposer: 'dao-committee',
      status: 'active',
      type: 'incubator',
      votingPower: { for: 0, against: 0, abstain: 0 },
      quorum: 100000,
      threshold: 0.5,
      startBlock: 0,
      endBlock: 100000,
      createdAt: new Date(),
    };

    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  /**
   * Vote on proposal
   */
  async vote(
    proposalId: string,
    support: Vote['support'],
    reason?: string
  ): Promise<Vote> {
    // TODO: Replace with actual governance contract call
    const votingPower = await this.getVotingPower('current-user-id');

    const vote: Vote = {
      id: `vote-${Date.now()}`,
      proposalId,
      voter: 'current-user-id',
      support,
      votingPower: votingPower.total,
      reason,
      timestamp: new Date(),
    };

    // Update proposal voting power
    const proposal = this.proposals.get(proposalId);
    if (proposal) {
      proposal.votingPower[support] += vote.votingPower;
    }

    // Store vote
    const proposalVotes = this.votes.get(proposalId) || [];
    proposalVotes.push(vote);
    this.votes.set(proposalId, proposalVotes);

    return vote;
  }

  /**
   * Vote on incubator application
   */
  async voteOnIncubation(
    applicationId: string,
    support: boolean
  ): Promise<Vote> {
    // TODO: Get or create proposal for this application
    // For now, assume there's a proposal
    return this.vote(`incubator-${applicationId}`, support ? 'for' : 'against');
  }

  /**
   * Get voting power for user
   */
  async getVotingPower(userId: string): Promise<VotingPower> {
    // TODO: Replace with actual contract queries
    return {
      vePSX: 1000,
      xVOID: 500,
      agency: 0,
      total: 1500,
    };
  }

  /**
   * Delegate voting power
   */
  async delegateTo(
    delegatee: string,
    token: Delegation['token'],
    amount: number
  ): Promise<Delegation> {
    // TODO: Replace with actual governance contract call
    const delegation: Delegation = {
      id: `del-${Date.now()}`,
      delegator: 'current-user-id',
      delegatee,
      token,
      amount,
      createdAt: new Date(),
    };

    this.delegations.set(delegation.id, delegation);
    return delegation;
  }

  /**
   * Get user's delegations
   */
  async getDelegations(userId: string): Promise<Delegation[]> {
    // TODO: Replace with actual API call
    return Array.from(this.delegations.values()).filter(
      d => d.delegator === userId
    );
  }

  /**
   * Get votes for proposal
   */
  async getProposalVotes(proposalId: string): Promise<Vote[]> {
    // TODO: Replace with actual API call
    return this.votes.get(proposalId) || [];
  }

  /**
   * Get system health KPIs
   */
  async getSystemHealthKPIs(): Promise<SystemHealth> {
    // TODO: Replace with actual analytics DB query
    return {
      activeCreators: 150,
      tvl: 5000000,
      volume24h: 250000,
      volume7d: 1500000,
      landUtilization: 0.75,
      engagement: {
        dailyActiveUsers: 500,
        weeklyActiveUsers: 2000,
        monthlyActiveUsers: 5000,
        averageSessionTime: 1800, // 30 minutes in seconds
      },
      treasuryGrowth: {
        current: 850000,
        changePercent24h: 2.5,
        changePercent7d: 15.3,
        changePercent30d: 45.7,
      },
    };
  }

  /**
   * Execute passed proposal
   */
  async executeProposal(proposalId: string): Promise<{ success: boolean; txHash?: string }> {
    // TODO: Replace with actual governance contract execution
    const proposal = this.proposals.get(proposalId);
    if (proposal && proposal.status === 'passed') {
      proposal.status = 'executed';
      proposal.executedAt = new Date();
      return { success: true, txHash: '0x...' };
    }

    throw new Error('Proposal cannot be executed');
  }
}

// Export singleton instance
export const governanceService = new GovernanceService();
