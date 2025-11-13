/**
 * WORLD HUD - Economic Snapshot Types
 * 
 * The WORLD HUD is an economic lobby that surfaces state from all hubs.
 * Every component receives hub-scoped data instead of inventing its own.
 * 
 * Ideology: No "dead" cards — everything is an on-ramp to a hub.
 */

// ============================================================================
// HUB TYPES
// ============================================================================

export type HubType = 'WORLD' | 'CREATOR' | 'DEFI' | 'DAO' | 'AGENCY' | 'AI_OPS';

// ============================================================================
// WORLD HUB - Social layer + presence
// ============================================================================

export interface WorldState {
  zone: string;
  coordinates: { x: number; z: number };
  onlineFriends: number;
  nearbyPlayers: Array<{ x: number; z: number; username: string }>;
  nearbyProjects: Array<{
    id: string;
    type: 'CREATOR' | 'AGENCY';
    name: string;
    recruiting: boolean;
  }>;
  districts: Array<{
    id: string;
    name: string;
    color: string;
    bounds: { x: [number, number]; z: [number, number] };
  }>;
}

// ============================================================================
// CREATOR HUB - Launchpad & royalty engine
// ============================================================================

export interface CreatorState {
  royaltiesEarned: number; // CREATE tokens
  trendingDrops: Array<{
    id: string;
    creator: string;
    name: string;
    minted: number;
    total: number;
    location?: { x: number; z: number }; // for minimap POI
  }>;
  activeLaunches: Array<{
    id: string;
    type: 'BYOT' | 'LAND' | 'IP';
    name: string;
    endsAt: number;
  }>;
  myCreatorToken?: {
    symbol: string;
    holders: number;
    volume24h: number;
  };
}

// ============================================================================
// DEFI HUB - VOID / LP / emission machine
// ============================================================================

export interface DeFiState {
  voidPrice: number;
  voidChange24h: number;
  psxPrice: number;
  psxChange24h: number;
  signalEpoch: number;
  emissionMultiplier: number;
  nextEmissionIn: number; // seconds
  vaults: Array<{
    id: string;
    name: string;
    tvl: number;
    apy: number;
    location?: { x: number; z: number }; // for minimap POI
  }>;
  myPositions: Array<{
    vaultId: string;
    staked: number;
    rewards: number;
  }>;
}

// ============================================================================
// DAO HUB - PSX governance brain
// ============================================================================

export interface DAOState {
  activeProposals: Array<{
    id: string;
    title: string;
    endsAt: number;
    status: 'ACTIVE' | 'PENDING' | 'EXECUTED';
    votesFor: number;
    votesAgainst: number;
    location?: { x: number; z: number }; // for minimap POI (DAO terminal)
  }>;
  myVotingPower: number;
  psxBalance: number;
  reputationPoints: number;
  lastVoted?: number; // timestamp
}

// ============================================================================
// AGENCY HUB - Jobs, pledges, IP-building
// ============================================================================

export type AgencyRole = 'EXPLORER' | 'BUILDER' | 'AGENT' | 'FREELANCE';
export type PledgeStatus = 'NONE' | 'PSX_PLEDGED' | 'RECRUITING';

export interface AgencyState {
  myRole: AgencyRole;
  myAgency?: {
    name: string;
    members: number;
    reputation: number;
  };
  pledgeStatus: PledgeStatus;
  psxPledged: number;
  openGigs: Array<{
    id: string;
    title: string;
    reward: string; // e.g. "500 VOID + 2000 PSX"
    hub: HubType; // which hub the gig relates to
    location?: { x: number; z: number }; // for minimap POI (job board)
  }>;
  squadsOnline: number;
  recruiting: number; // count of projects recruiting
}

// ============================================================================
// AI OPS HUB - Automated strategy + safety
// ============================================================================

export interface AIOpsState {
  logs: Array<{
    id: string;
    agent: 'VaultAI' | 'EmissionAI' | 'MissionAI' | 'GovernanceAI' | 'AgencyAI';
    action: string;
    timestamp: number;
    hub: HubType; // which hub it affects
  }>;
  hotspots: Array<{
    x: number;
    z: number;
    reason: string; // e.g. "High-yield quests", "New creator drop"
    hub: HubType;
  }>;
  suggestions: Array<{
    id: string;
    message: string;
    hub: HubType;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  riskFlags: Array<{
    proposalId?: string;
    vaultId?: string;
    message: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
  }>;
}

// ============================================================================
// CROSS-HUB TYPES
// ============================================================================

// Missions can come from any hub
export interface Mission {
  id: string;
  hub: HubType;
  title: string;
  description: string;
  progress: number; // 0-100
  reward: string; // e.g. "+35 SIGNAL", "+50 VOID"
  onClick: () => void; // navigate to relevant hub
}

// Rewards come from all hubs
export interface RewardEntry {
  id: string;
  hub: HubType;
  action: string; // e.g. "Mission complete", "Creator support", "DAO vote"
  tokens: Array<{
    symbol: 'VOID' | 'PSX' | 'SIGNAL' | 'CREATE';
    amount: number;
  }>;
  timestamp: number;
}

// Ticker items (announcements)
export interface TickerItem {
  id: string;
  hub: HubType;
  message: string;
  priority: number; // 1-10, higher = show more often
}

// POIs on minimap
export interface POI {
  id: string;
  hub: HubType;
  type: 'vault' | 'drop' | 'proposal' | 'gig' | 'hotspot';
  position: { x: number; z: number };
  label: string;
  active: boolean;
}

// Chat messages can be tagged by hub (system messages)
export interface ChatMessage {
  id: string;
  channel: 'GLOBAL' | 'NEARBY' | 'PARTY' | 'GUILD';
  username?: string; // undefined for system messages
  hub?: HubType; // for system messages
  message: string;
  timestamp: number;
}

// ============================================================================
// MASTER SNAPSHOT
// ============================================================================

/**
 * The complete economic state surfaced to WORLD HUD.
 * Components read from this instead of making up data.
 */
export interface EconomySnapshot {
  world: WorldState;
  creator: CreatorState;
  defi: DeFiState;
  dao: DAOState;
  agency: AgencyState;
  aiOps: AIOpsState;
  
  // Cross-hub aggregates
  missions: Mission[];
  recentRewards: RewardEntry[];
  tickerItems: TickerItem[];
  pois: POI[];
  chatMessages: ChatMessage[];
}

// ============================================================================
// PLAYER STATE (meta - level, XP, wallet)
// ============================================================================

export interface PlayerState {
  username: string;
  avatarUrl: string;
  walletAddress: string;
  chain: string;
  level: number;
  xp: number;
  xpProgress: number; // 0-100
  streak: number;
  achievements: number;
  
  // Token balances (cross-hub)
  voidBalance: number; // DEFI
  signalBalance: number; // DEFI
  psxBalance: number; // DAO
  createBalance: number; // CREATOR
}

// ============================================================================
// COMPONENT PROPS PATTERN
// ============================================================================

/**
 * Example of how a component should receive data:
 * 
 * <PlayerChip
 *   player={playerState}
 *   world={snapshot.world}
 *   defi={snapshot.defi}
 *   dao={snapshot.dao}
 *   creator={snapshot.creator}
 *   agency={snapshot.agency}
 * />
 * 
 * NOT:
 * <PlayerChip username="..." voidBalance={123} /> ❌
 * 
 * This keeps the ideology intact: components reflect the economy, not invent it.
 */
