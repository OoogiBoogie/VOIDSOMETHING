/**
 * AI Agent Types & Interfaces
 * 
 * Type definitions for the 5 autonomous AI agents that monitor and manage
 * the VOID Engine ecosystem:
 * 
 * 1. VaultAI - Monitors vault health, optimizes yields, manages pool refills
 * 2. EmissionAI - Manages VOID/SIGNAL emissions, adjusts rates dynamically
 * 3. MissionAI - Creates and manages daily/weekly missions for vXP rewards
 * 4. GovernanceAI - Analyzes proposals, provides recommendations, auto-votes
 * 5. SecurityAI - Monitors for exploits, pauses suspicious contracts, alerts admins
 */

export type AIAgentType = 'vault' | 'emission' | 'mission' | 'governance' | 'security';

export type AgentStatus = 'active' | 'paused' | 'error' | 'maintenance';

export type AgentActionType = 
  | 'pool_refill'
  | 'yield_adjustment'
  | 'emission_adjustment'
  | 'mission_creation'
  | 'proposal_analysis'
  | 'auto_vote'
  | 'security_pause'
  | 'alert_admin'
  | 'data_collection';

export interface AIAgentMetrics {
  agentType: AIAgentType;
  timestamp: string;
  uptime: number;                    // Hours
  actionsExecuted24h: number;
  successRate: number;               // Percentage
  avgResponseTime: number;           // Milliseconds
  errorsLast24h: number;
  lastHealthCheck: string;
  cpuUsage: number;                  // Percentage
  memoryUsage: number;               // MB
}

export interface AIAgentAction {
  id: string;
  agentType: AIAgentType;
  actionType: AgentActionType;
  timestamp: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  params?: Record<string, any>;
  result?: {
    success: boolean;
    message: string;
    txHash?: string;
    gasUsed?: number;
    data?: any;
  };
  executionTime?: number;            // Milliseconds
  retryCount?: number;
}

export interface AIAgentPolicy {
  id: string;
  agentType: AIAgentType;
  name: string;
  description: string;
  enabled: boolean;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  cooldown: number;                  // Seconds between executions
  lastExecuted?: string;
  executionCount: number;
}

export interface PolicyCondition {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number | string;
  timeWindow?: string;               // e.g., '24h', '7d'
}

export interface PolicyAction {
  type: AgentActionType;
  params: Record<string, any>;
  requiresApproval?: boolean;
  autoExecute?: boolean;
}

// ============================================================================
// VAULT AI - Pool & Yield Management
// ============================================================================

export interface VaultAIState {
  poolHealth: {
    [poolId: string]: {
      status: 'healthy' | 'warning' | 'critical';
      daysUntilDepletion: number;
      recommendedRefill: string;
      lastRefill: string;
    };
  };
  yieldOptimization: {
    currentAPR: Record<string, number>;
    targetAPR: Record<string, number>;
    adjustmentNeeded: boolean;
  };
  pendingRefills: number;
  autoRefillEnabled: boolean;
}

export interface VaultAIAction extends AIAgentAction {
  agentType: 'vault';
  actionType: 'pool_refill' | 'yield_adjustment';
  params?: {
    poolId?: string;
    token?: string;
    amount?: string;
    newAPR?: number;
  };
}

// ============================================================================
// EMISSION AI - Emission Rate Management
// ============================================================================

export interface EmissionAIState {
  currentRates: {
    voidPerAction: number;
    signalPerAction: number;
  };
  targetRates: {
    voidPerAction: number;
    signalPerAction: number;
  };
  activityMetrics: {
    actionsLast24h: number;
    voidMintedLast24h: number;
    signalMintedLast24h: number;
    avgActivityPerUser: number;
  };
  adjustmentRecommendation: {
    needed: boolean;
    voidChange?: number;
    signalChange?: number;
    reason?: string;
  };
}

export interface EmissionAIAction extends AIAgentAction {
  agentType: 'emission';
  actionType: 'emission_adjustment';
  params?: {
    voidRate?: number;
    signalRate?: number;
    rationale?: string;
  };
}

// ============================================================================
// MISSION AI - Dynamic Mission Generation
// ============================================================================

export interface MissionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'daily' | 'weekly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  objectives: MissionObjective[];
  rewards: MissionReward[];
  cooldown: number;                  // Hours
  minLevel?: number;
}

export interface MissionObjective {
  type: 'action_count' | 'token_amount' | 'time_based' | 'social' | 'creative';
  target: number;
  metric: string;
  description: string;
}

export interface MissionReward {
  type: 'vxp' | 'void' | 'signal' | 'create' | 'nft';
  amount: string;
  bonus?: string;
}

export interface MissionAIState {
  activeMissions: number;
  completionRate: number;            // Percentage
  avgParticipation: number;
  rewardsBudget: {
    vxp: number;
    void: number;
    signal: number;
  };
  nextMissionGeneration: string;
}

export interface MissionAIAction extends AIAgentAction {
  agentType: 'mission';
  actionType: 'mission_creation';
  params?: {
    template?: MissionTemplate;
    duration?: number;
    maxParticipants?: number;
  };
}

// ============================================================================
// GOVERNANCE AI - Proposal Analysis & Voting
// ============================================================================

export interface ProposalAnalysis {
  proposalId: string;
  score: number;                     // 0-100
  recommendation: 'strong_for' | 'weak_for' | 'neutral' | 'weak_against' | 'strong_against';
  factors: {
    economicImpact: number;          // -100 to +100
    communitySupport: number;        // 0 to 100
    technicalFeasibility: number;    // 0 to 100
    riskLevel: number;               // 0 to 100
    alignmentWithGoals: number;      // 0 to 100
  };
  reasoning: string[];
  confidence: number;                // Percentage
}

export interface GovernanceAIState {
  proposalsAnalyzed: number;
  autoVoteEnabled: boolean;
  votesCast24h: number;
  analysisQueue: number;
  averageConfidence: number;
}

export interface GovernanceAIAction extends AIAgentAction {
  agentType: 'governance';
  actionType: 'proposal_analysis' | 'auto_vote';
  params?: {
    proposalId?: string;
    analysis?: ProposalAnalysis;
    voteChoice?: 'for' | 'against' | 'abstain';
  };
}

// ============================================================================
// SECURITY AI - Threat Detection & Response
// ============================================================================

export interface SecurityThreat {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'exploit' | 'price_manipulation' | 'governance_attack' | 'reentrancy' | 'flash_loan' | 'other';
  timestamp: string;
  affectedContract?: string;
  affectedFunction?: string;
  description: string;
  metrics: {
    abnormalTxCount?: number;
    suspiciousVolume?: string;
    priceDeviation?: number;
  };
  status: 'detected' | 'investigating' | 'mitigated' | 'resolved' | 'false_positive';
  actions: string[];
}

export interface SecurityAIState {
  threatLevel: 'green' | 'yellow' | 'orange' | 'red';
  activeThreats: number;
  threatsDetected24h: number;
  contractsPaused: number;
  monitoredContracts: number;
  lastScan: string;
}

export interface SecurityAIAction extends AIAgentAction {
  agentType: 'security';
  actionType: 'security_pause' | 'alert_admin' | 'data_collection';
  params?: {
    threat?: SecurityThreat;
    contractAddress?: string;
    pauseReason?: string;
    alertMessage?: string;
  };
}

// ============================================================================
// UNIFIED AI AGENT INTERFACE
// ============================================================================

export interface AIAgent {
  type: AIAgentType;
  name: string;
  description: string;
  status: AgentStatus;
  version: string;
  deployedAt: string;
  lastUpdate: string;
  metrics: AIAgentMetrics;
  state: VaultAIState | EmissionAIState | MissionAIState | GovernanceAIState | SecurityAIState;
  policies: AIAgentPolicy[];
  recentActions: AIAgentAction[];
}

export interface AIAgentConfig {
  enabled: boolean;
  autoExecute: boolean;
  maxActionsPerHour: number;
  requireApprovalThreshold: 'low' | 'medium' | 'high' | 'always';
  notificationChannels: ('email' | 'discord' | 'telegram' | 'dashboard')[];
  escalationContacts: string[];
}

// ============================================================================
// SMART CONTRACT INTERFACES
// ============================================================================

export interface AIAgentRegistry {
  agentAddress: string;
  agentType: AIAgentType;
  owner: string;
  permissions: string[];
  active: boolean;
  registeredAt: string;
  lastActivity: string;
}

export interface PolicyManagerContract {
  policyId: string;
  agentType: AIAgentType;
  bytecode: string;
  enabled: boolean;
  executionCount: number;
  gasLimit: number;
  createdBy: string;
  createdAt: string;
}

export interface AutoProposalContract {
  proposalId: string;
  createdBy: AIAgentType;
  title: string;
  description: string;
  calldata: string;
  targetContract: string;
  votingPeriod: number;
  quorum: string;
  status: 'pending' | 'active' | 'executed' | 'rejected';
  createdAt: string;
}

export interface EmissionOracleContract {
  oracleAddress: string;
  currentVoidRate: string;
  currentSignalRate: string;
  lastUpdate: string;
  updateFrequency: number;          // Seconds
  owner: string;
  trustedUpdaters: string[];
}
