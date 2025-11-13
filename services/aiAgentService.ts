/**
 * AI Agent Service
 * 
 * Manages the 5 autonomous AI agents that monitor and optimize the VOID Engine.
 * In production, these would be separate microservices communicating via
 * Kafka/RabbitMQ. This mock implementation simulates their behavior for UI testing.
 */

import {
  AIAgent,
  AIAgentType,
  AIAgentAction,
  AIAgentPolicy,
  AIAgentMetrics,
  VaultAIState,
  EmissionAIState,
  MissionAIState,
  GovernanceAIState,
  SecurityAIState,
  SecurityThreat,
  ProposalAnalysis,
} from './aiAgentTypes';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_ACTIONS: Map<AIAgentType, AIAgentAction[]> = new Map([
  ['vault', [
    {
      id: 'vault-action-1',
      agentType: 'vault',
      actionType: 'pool_refill',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      priority: 'high',
      description: 'Refilled PSX reward pool (critical threshold reached)',
      params: { poolId: 'psx-pool', token: 'PSX', amount: '1000000' },
      result: {
        success: true,
        message: 'Pool refilled successfully',
        txHash: '0xABCD1234...',
        gasUsed: 125000,
      },
      executionTime: 3200,
    },
    {
      id: 'vault-action-2',
      agentType: 'vault',
      actionType: 'yield_adjustment',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      priority: 'medium',
      description: 'Adjusted VOID vault APR based on utilization',
      params: { token: 'VOID', newAPR: 18.5 },
      result: {
        success: true,
        message: 'APR adjusted from 18.0% to 18.5%',
      },
      executionTime: 1500,
    },
  ]],
  ['emission', [
    {
      id: 'emission-action-1',
      agentType: 'emission',
      actionType: 'emission_adjustment',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      priority: 'medium',
      description: 'Reduced SIGNAL emission rate due to high activity',
      params: { signalRate: 0.95, rationale: 'Activity surge detected, reducing emissions to maintain scarcity' },
      result: {
        success: true,
        message: 'Emission rate adjusted',
      },
      executionTime: 800,
    },
  ]],
  ['mission', [
    {
      id: 'mission-action-1',
      agentType: 'mission',
      actionType: 'mission_creation',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'completed',
      priority: 'low',
      description: 'Generated daily mission: "Creator Collaboration"',
      params: { duration: 24, maxParticipants: 100 },
      result: {
        success: true,
        message: 'Mission created and activated',
      },
      executionTime: 500,
    },
  ]],
  ['governance', [
    {
      id: 'gov-action-1',
      agentType: 'governance',
      actionType: 'proposal_analysis',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      status: 'completed',
      priority: 'high',
      description: 'Analyzed proposal: "Increase vault emissions by 10%"',
      params: { proposalId: 'prop-123' },
      result: {
        success: true,
        message: 'Analysis complete: WEAK_FOR (confidence: 72%)',
        data: { score: 65, recommendation: 'weak_for' },
      },
      executionTime: 2100,
    },
  ]],
  ['security', [
    {
      id: 'security-action-1',
      agentType: 'security',
      actionType: 'alert_admin',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'completed',
      priority: 'critical',
      description: 'Detected abnormal swap volume spike',
      params: { alertMessage: 'Swap volume increased 300% in 10 minutes' },
      result: {
        success: true,
        message: 'Admin notified via Discord',
      },
      executionTime: 150,
    },
  ]],
]);

// ============================================================================
// SERVICE
// ============================================================================

class AIAgentService {
  /**
   * Get all AI agents with current status
   */
  async getAllAgents(): Promise<AIAgent[]> {
    const now = new Date().toISOString();
    const deployTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago

    return [
      // VaultAI
      {
        type: 'vault',
        name: 'VaultAI',
        description: 'Monitors vault health, manages pool refills, optimizes yields',
        status: 'active',
        version: '1.2.0',
        deployedAt: deployTime,
        lastUpdate: now,
        metrics: {
          agentType: 'vault',
          timestamp: now,
          uptime: 720,
          actionsExecuted24h: 12,
          successRate: 98.5,
          avgResponseTime: 1800,
          errorsLast24h: 0,
          lastHealthCheck: now,
          cpuUsage: 15.2,
          memoryUsage: 128,
        },
        state: {
          poolHealth: {
            'psx-pool': { status: 'healthy', daysUntilDepletion: 45, recommendedRefill: '0', lastRefill: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            'create-pool': { status: 'warning', daysUntilDepletion: 22, recommendedRefill: '500000', lastRefill: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
            'void-pool': { status: 'healthy', daysUntilDepletion: 60, recommendedRefill: '0', lastRefill: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
          },
          yieldOptimization: {
            currentAPR: { PSX: 12.5, CREATE: 15.0, VOID: 18.5 },
            targetAPR: { PSX: 12.5, CREATE: 15.0, VOID: 18.5 },
            adjustmentNeeded: false,
          },
          pendingRefills: 1,
          autoRefillEnabled: true,
        } as VaultAIState,
        policies: [],
        recentActions: MOCK_ACTIONS.get('vault') || [],
      },

      // EmissionAI
      {
        type: 'emission',
        name: 'EmissionAI',
        description: 'Manages VOID/SIGNAL emissions, adjusts rates dynamically',
        status: 'active',
        version: '1.1.5',
        deployedAt: deployTime,
        lastUpdate: now,
        metrics: {
          agentType: 'emission',
          timestamp: now,
          uptime: 720,
          actionsExecuted24h: 8,
          successRate: 100,
          avgResponseTime: 950,
          errorsLast24h: 0,
          lastHealthCheck: now,
          cpuUsage: 8.5,
          memoryUsage: 96,
        },
        state: {
          currentRates: { voidPerAction: 1.0, signalPerAction: 10.0 },
          targetRates: { voidPerAction: 1.0, signalPerAction: 9.5 },
          activityMetrics: {
            actionsLast24h: 15420,
            voidMintedLast24h: 15420,
            signalMintedLast24h: 154200,
            avgActivityPerUser: 12.3,
          },
          adjustmentRecommendation: {
            needed: true,
            signalChange: -0.5,
            reason: 'Activity surge detected, reduce SIGNAL emission to maintain scarcity',
          },
        } as EmissionAIState,
        policies: [],
        recentActions: MOCK_ACTIONS.get('emission') || [],
      },

      // MissionAI
      {
        type: 'mission',
        name: 'MissionAI',
        description: 'Creates and manages dynamic missions for vXP rewards',
        status: 'active',
        version: '1.0.8',
        deployedAt: deployTime,
        lastUpdate: now,
        metrics: {
          agentType: 'mission',
          timestamp: now,
          uptime: 720,
          actionsExecuted24h: 6,
          successRate: 95.2,
          avgResponseTime: 650,
          errorsLast24h: 1,
          lastHealthCheck: now,
          cpuUsage: 5.8,
          memoryUsage: 64,
        },
        state: {
          activeMissions: 12,
          completionRate: 68.5,
          avgParticipation: 234,
          rewardsBudget: { vxp: 50000, void: 10000, signal: 100000 },
          nextMissionGeneration: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        } as MissionAIState,
        policies: [],
        recentActions: MOCK_ACTIONS.get('mission') || [],
      },

      // GovernanceAI
      {
        type: 'governance',
        name: 'GovernanceAI',
        description: 'Analyzes proposals, provides recommendations, auto-votes',
        status: 'active',
        version: '1.3.1',
        deployedAt: deployTime,
        lastUpdate: now,
        metrics: {
          agentType: 'governance',
          timestamp: now,
          uptime: 720,
          actionsExecuted24h: 5,
          successRate: 92.8,
          avgResponseTime: 2500,
          errorsLast24h: 0,
          lastHealthCheck: now,
          cpuUsage: 22.3,
          memoryUsage: 256,
        },
        state: {
          proposalsAnalyzed: 47,
          autoVoteEnabled: false,
          votesCast24h: 3,
          analysisQueue: 2,
          averageConfidence: 78.4,
        } as GovernanceAIState,
        policies: [],
        recentActions: MOCK_ACTIONS.get('governance') || [],
      },

      // SecurityAI
      {
        type: 'security',
        name: 'SecurityAI',
        description: 'Monitors for exploits, pauses suspicious contracts, alerts admins',
        status: 'active',
        version: '2.0.3',
        deployedAt: deployTime,
        lastUpdate: now,
        metrics: {
          agentType: 'security',
          timestamp: now,
          uptime: 720,
          actionsExecuted24h: 42,
          successRate: 99.1,
          avgResponseTime: 120,
          errorsLast24h: 0,
          lastHealthCheck: now,
          cpuUsage: 18.7,
          memoryUsage: 192,
        },
        state: {
          threatLevel: 'green',
          activeThreats: 0,
          threatsDetected24h: 3,
          contractsPaused: 0,
          monitoredContracts: 24,
          lastScan: now,
        } as SecurityAIState,
        policies: [],
        recentActions: MOCK_ACTIONS.get('security') || [],
      },
    ];
  }

  /**
   * Get specific agent by type
   */
  async getAgent(type: AIAgentType): Promise<AIAgent | null> {
    const agents = await this.getAllAgents();
    return agents.find((a) => a.type === type) || null;
  }

  /**
   * Get agent metrics
   */
  async getAgentMetrics(type: AIAgentType): Promise<AIAgentMetrics | null> {
    const agent = await this.getAgent(type);
    return agent?.metrics || null;
  }

  /**
   * Get recent actions for an agent
   */
  async getAgentActions(type: AIAgentType, limit: number = 10): Promise<AIAgentAction[]> {
    const actions = MOCK_ACTIONS.get(type) || [];
    return actions.slice(0, limit);
  }

  /**
   * Pause/resume an agent
   */
  async setAgentStatus(type: AIAgentType, status: 'active' | 'paused'): Promise<{ success: boolean; message: string }> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: `${type.toUpperCase()}AI ${status === 'active' ? 'resumed' : 'paused'} successfully`,
    };
  }

  /**
   * Execute manual action via agent
   */
  async executeAction(type: AIAgentType, action: Partial<AIAgentAction>): Promise<{ success: boolean; message: string; actionId?: string }> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const actionId = `${type}-action-${Date.now()}`;
    return {
      success: true,
      message: `Action executed successfully`,
      actionId,
    };
  }

  /**
   * Get security threats
   */
  async getSecurityThreats(status?: 'active' | 'resolved'): Promise<SecurityThreat[]> {
    const mockThreats: SecurityThreat[] = [
      {
        id: 'threat-1',
        severity: 'low',
        type: 'other',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        description: 'Abnormal swap volume detected (+300% in 10min)',
        metrics: { abnormalTxCount: 127, suspiciousVolume: '500000' },
        status: 'resolved',
        actions: ['Alert admin', 'Increase monitoring'],
      },
      {
        id: 'threat-2',
        severity: 'medium',
        type: 'price_manipulation',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        affectedContract: '0xVOID_HOOK_ROUTER',
        description: 'Possible price manipulation attempt detected',
        metrics: { priceDeviation: 15.2 },
        status: 'resolved',
        actions: ['Analyzed transaction pattern', 'False positive - legitimate arbitrage'],
      },
    ];

    if (status) {
      return mockThreats.filter((t) => t.status === status || (status === 'active' && t.status !== 'resolved'));
    }
    return mockThreats;
  }

  /**
   * Get proposal analysis from GovernanceAI
   */
  async analyzeProposal(proposalId: string): Promise<ProposalAnalysis> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      proposalId,
      score: 72,
      recommendation: 'weak_for',
      factors: {
        economicImpact: 25,
        communitySupport: 68,
        technicalFeasibility: 85,
        riskLevel: 35,
        alignmentWithGoals: 78,
      },
      reasoning: [
        'Proposal aligns with long-term ecosystem goals',
        'Technical implementation appears sound',
        'Economic impact is moderately positive',
        'Community sentiment is mixed but leaning positive',
        'Risk level is acceptable with proper safeguards',
      ],
      confidence: 72,
    };
  }

  /**
   * Get agent policies
   */
  async getAgentPolicies(type: AIAgentType): Promise<AIAgentPolicy[]> {
    // Mock policies
    const mockPolicies: Record<AIAgentType, AIAgentPolicy[]> = {
      vault: [
        {
          id: 'vault-policy-1',
          agentType: 'vault',
          name: 'Auto Pool Refill',
          description: 'Automatically refill reward pools when they drop below 20%',
          enabled: true,
          conditions: [{ metric: 'poolBalance', operator: '<', threshold: 0.2 }],
          actions: [{ type: 'pool_refill', params: {}, autoExecute: true }],
          cooldown: 3600,
          executionCount: 47,
        },
      ],
      emission: [
        {
          id: 'emission-policy-1',
          agentType: 'emission',
          name: 'Activity-Based Adjustment',
          description: 'Adjust emissions based on 24h activity levels',
          enabled: true,
          conditions: [{ metric: 'activityChange', operator: '>', threshold: 50, timeWindow: '24h' }],
          actions: [{ type: 'emission_adjustment', params: {}, requiresApproval: true }],
          cooldown: 86400,
          executionCount: 12,
        },
      ],
      mission: [],
      governance: [
        {
          id: 'gov-policy-1',
          agentType: 'governance',
          name: 'Auto Analysis',
          description: 'Automatically analyze all new proposals',
          enabled: true,
          conditions: [{ metric: 'newProposal', operator: '==', threshold: 1 }],
          actions: [{ type: 'proposal_analysis', params: {}, autoExecute: true }],
          cooldown: 0,
          executionCount: 47,
        },
      ],
      security: [
        {
          id: 'security-policy-1',
          agentType: 'security',
          name: 'Emergency Pause',
          description: 'Pause contracts if critical threat detected',
          enabled: true,
          conditions: [{ metric: 'threatSeverity', operator: '==', threshold: 'critical' }],
          actions: [{ type: 'security_pause', params: {}, autoExecute: true }],
          cooldown: 0,
          executionCount: 0,
        },
      ],
    };

    return mockPolicies[type] || [];
  }
}

export const aiAgentService = new AIAgentService();
