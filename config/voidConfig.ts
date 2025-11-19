/**
 * VOID CONFIG - Central configuration for contracts, topics, and network settings
 * Single source of truth for all addresses and protocol identifiers
 */

// ═══════════════════════════════════════════════════════════════
// 🎛️ FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════

/**
 * BURN UI FEATURE FLAG
 * 
 * Controls visibility of the entire VOID Utility Burn System UI.
 * When false, all burn-related windows, buttons, and badges are hidden.
 * 
 * Set to `true` after contracts are deployed and tested on Base Sepolia.
 * Set to `false` to hide burn UI from users (pre-deployment safety).
 * 
 * Affected UI:
 * - HUD burn windows (District, Creator, Prestige, MiniApp)
 * - Prestige badge in PlayerChipV2
 * - Land upgrade section in RealEstatePanel
 * - Any direct burn controls
 * 
 * Does NOT affect:
 * - Smart contracts (can still be called directly)
 * - Hooks (safe to keep, just not invoked by UI)
 * - Config addresses (remain in voidConfig)
 */
export const ENABLE_BURN_UI = true; // ✅ ENABLED for QA testing (Nov 16, 2025)

// Network configuration
export const VOID_NETWORK = {
  chainId: 84532, // Base Sepolia
  name: 'Base Sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org',
};

// Net Protocol configuration
export const NET_PROTOCOL = {
  appId: 'void-metaverse-v1',
  storageEndpoint: process.env.NEXT_PUBLIC_NET_STORAGE_URL || 'https://net-storage.void.xyz',
  indexerEndpoint: process.env.NEXT_PUBLIC_NET_INDEXER_URL || 'https://net-indexer.void.xyz',
};

// Topic naming conventions for Net Protocol
export const NET_TOPICS = {
  global: 'void:global',
  
  zone: (zoneId: string) => `void:zone:${zoneId}`,
  
  dm: (addressA: string, addressB: string) => {
    // Deterministic DM topic: always sort addresses alphabetically
    const sorted = [addressA.toLowerCase(), addressB.toLowerCase()].sort();
    return `void:dm:${sorted[0]}_${sorted[1]}`;
  },
  
  guild: (guildId: string) => `void:guild:${guildId}`,
  
  squad: (squadId: string) => `void:squad:${squadId}`,
};

// Contract addresses (Base Sepolia testnet)
export const CONTRACTS = {
  // Core token contracts
  VOID: '0x8de4043445939B0D0Cc7d6c752057707279D9893' as `0x${string}`,
  PSX: '0xYourPSXAddress' as `0x${string}`, // TODO: Add deployed PSX address
  
  // Vault and staking
  xVOIDVault: '0xab10B2B5E1b07447409BCa889d14F046bEFd8192' as `0x${string}`,
  
  // Net Protocol integration
  VoidMessaging: process.env.NEXT_PUBLIC_VOID_MESSAGING_ADDRESS as `0x${string}` || '0xYourVoidMessagingAddress' as `0x${string}`,
  VoidStorage: process.env.NEXT_PUBLIC_VOID_STORAGE_ADDRESS as `0x${string}` || '0xYourVoidStorageAddress' as `0x${string}`,
  
  // Identity and scoring
  VoidScore: process.env.NEXT_PUBLIC_VOID_SCORE_ADDRESS as `0x${string}` || '0xYourVoidScoreAddress' as `0x${string}`,
  XPOracle: '0xYourXPOracleAddress' as `0x${string}`, // TODO: Add deployed XPOracle address
  
  // Governance
  VoidDAO: process.env.NEXT_PUBLIC_VOID_DAO_ADDRESS as `0x${string}` || '0xYourVoidDAOAddress' as `0x${string}`,
  
  // Land and zones
  VoidLand: process.env.NEXT_PUBLIC_VOID_LAND_ADDRESS as `0x${string}` || '0xYourVoidLandAddress' as `0x${string}`,
  
  // Agency and gigs
  VoidAgency: process.env.NEXT_PUBLIC_VOID_AGENCY_ADDRESS as `0x${string}` || '0xYourVoidAgencyAddress' as `0x${string}`,
  
  // ═══════════════════════════════════════════════════════════════
  // VOID BURN SYSTEM (Phase 9 - Utility Burn)
  // ═══════════════════════════════════════════════════════════════
  //
  // These addresses must be populated after running:
  // `npx hardhat run scripts/deploy-burn-system.ts --network baseSepolia`
  //
  // Network: Base Sepolia (testnet) - Chain ID: 84532
  //
  // Post-deployment:
  // 1. Copy addresses from deployment output
  // 2. Update .env.local with NEXT_PUBLIC_* variables
  // 3. Restart Next.js dev server
  //
  // For mainnet (Base - Chain ID: 8453):
  // 1. Create separate .env.production with mainnet addresses
  // 2. Ensure all contracts verified on Basescan before launch
  // ═══════════════════════════════════════════════════════════════
  
  VoidBurnUtility: process.env.NEXT_PUBLIC_VOID_BURN_UTILITY as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
  DistrictAccessBurn: process.env.NEXT_PUBLIC_DISTRICT_ACCESS_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
  LandUpgradeBurn: process.env.NEXT_PUBLIC_LAND_UPGRADE_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
  CreatorToolsBurn: process.env.NEXT_PUBLIC_CREATOR_TOOLS_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
  PrestigeBurn: process.env.NEXT_PUBLIC_PRESTIGE_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
  MiniAppBurnAccess: process.env.NEXT_PUBLIC_MINIAPP_BURN_ACCESS as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
  AIUtilityGovernor: process.env.NEXT_PUBLIC_AI_UTILITY_GOVERNOR as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
};

// Anti-spam configuration (matches ANTI_SPAM_SPEC.md v2.0)
export const ANTI_SPAM = {
  dailyCaps: {
    global: 50,
    zone: 40,
    dm: 20,
  },
  
  freshWalletPenalty: {
    days: 7,
    multiplier: 0.5, // 50% reduction for wallets < 7 days old
  },
  
  tierBoosts: {
    BRONZE: 1.0,
    SILVER: 1.2,
    GOLD: 1.5,
    S_TIER: 2.0,
  },
  
  assetFootprintBoosts: {
    minVoidHolding: 100, // VOID tokens
    maxBoost: 2.0,
  },
};

// VoidScore tier thresholds
export const TIER_THRESHOLDS = {
  BRONZE: 100,
  SILVER: 250,
  GOLD: 600,
  S_TIER: 1500,
};

// Message query limits
export const QUERY_LIMITS = {
  messagesPerLoad: 50,
  maxMessagesInView: 100,
  conversationsPerPage: 50,
  gigsPerPage: 50,
  guildsPerPage: 50,
};

// Demo mode configuration
export const DEMO = {
  enableDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  demoWalletAddress: (process.env.NEXT_PUBLIC_DEMO_WALLET || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1') as `0x${string}`,
  
  // Demo world state (seeded data when demo mode is ON)
  demoState: {
    tier: 'GOLD' as const,
    currentScore: 720,
    lifetimeScore: 1050,
    accountAge: 45, // days
    progress: 0.72, // 72% to S_TIER
    voidBalance: 2500,
    xVoidBalance: 1200,
    psxBalance: 850,
    signalsHeld: 12,
    
    // Completed quests
    completedQuests: ['first_message', 'join_guild'],
    
    // Active guild
    guildId: 'void-builders',
    guildName: 'VOID Builders',
    
    // Unlocked zones
    unlockedZones: ['base_city', 'district_2', 'district_3'],
    
    // Leaderboard position
    leaderboardRank: 7,
  },
};

// Feature flags
export const FEATURES = {
  enableNetProtocol: process.env.NEXT_PUBLIC_ENABLE_NET === 'true',
  enableVoidScore: process.env.NEXT_PUBLIC_ENABLE_VOIDSCORE === 'true',
  enableVoidScoreContract: process.env.NEXT_PUBLIC_ENABLE_VOIDSCORE === 'true', // Alias for consistency
  enableIndexer: process.env.NEXT_PUBLIC_ENABLE_INDEXER === 'true',
  enableGuildXYZIntegration: process.env.NEXT_PUBLIC_ENABLE_GUILDXYZ === 'true',
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
  enableDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true', // Alias for DEMO.enableDemoMode
};

// Helper to determine if we should use real or mock data
export function shouldUseMockData(): boolean {
  return FEATURES.useMockData || !FEATURES.enableNetProtocol;
}

// Helper to determine if demo mode is active
export function isDemoMode(): boolean {
  return DEMO.enableDemoMode;
}

// Helper to get demo wallet address if in demo mode
export function getDemoWallet(): `0x${string}` | null {
  return isDemoMode() ? DEMO.demoWalletAddress : null;
}

// Export all as single config object
export const VOID_CONFIG = {
  network: VOID_NETWORK,
  netProtocol: NET_PROTOCOL,
  topics: NET_TOPICS,
  contracts: CONTRACTS,
  antiSpam: ANTI_SPAM,
  tierThresholds: TIER_THRESHOLDS,
  queryLimits: QUERY_LIMITS,
  features: FEATURES,
  demo: DEMO,
};

export default VOID_CONFIG;
