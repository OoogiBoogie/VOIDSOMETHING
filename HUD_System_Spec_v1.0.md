# HUD System Specification v1.0

**Status:** ✅ Approved for Implementation  
**Last Updated:** November 10, 2025  
**Scope:** Full HUD/Hub Integration for VOID Ecosystem  

---

## Executive Summary

This specification defines the **Heads-Up Display (HUD) system** for the VOID ecosystem, integrating all six hubs (WORLD, CREATOR, DEFI, DAO, AGENCY, AI_OPS) into a unified, functional interface. The HUD provides real-time data visibility, cross-hub navigation, AI overlay integration, and mobile-optimized layouts.

**Core Principle:** Users should be able to see and do everything important from the HUD layer without hunting through disconnected screens.

---

## 1. Hub Data Sources & Integration

### 1.1 WORLD Hub

**Live Data Required:**
- Current parcel position, ownership, district, zone multipliers
- Active missions (nearby + global)
- Player vXP, rank, SIGNAL balance
- Nearby players, events, POIs
- District boundaries, fog of war state
- Chat messages (global + district)

**Contracts:**
- `WorldLand.sol` → parcel data, ownership, districts
- `MissionRegistry.sol` → active missions filtered by WORLD hub
- `XPOracle.sol` → user vXP, rank, voting weight
- `VoidEmitter.sol` → SIGNAL balance, claimable rewards

**Off-Chain Services:**
- `chatService` → real-time chat messages
- `playerPositionService` → player coordinates tracking
- `worldEventService` → dynamic events (POI activations, etc.)

**Hooks:**
```typescript
// Existing
useWorldState() // land/parcel data
usePlayerPosition() // player coords
useGlobalChat() // chat integration

// New Required
useMissionRegistry(hubType: HubType, difficulty?: Difficulty)
useXPOracle(address: string) // vXP, rank, boost
useNearbyMissions(coords: {x, z}, radius: number)
useDistrictInfo(districtId: string)
```

---

### 1.2 CREATOR Hub

**Live Data Required:**
- User's created SKUs (apps, assets, experiences)
- Revenue dashboard (sales, royalties, fees earned)
- Featured/trending SKUs
- Creator support status, followers, reputation
- SKU performance metrics (installs, ratings, engagement)

**Contracts:**
- `SKUFactory.sol` → SKU registry, metadata
- `PSXToken.sol`, `CREATEToken.sol` → balances, fee tracking
- `VoidEmitter.sol` → creator fee distributions (40% share)

**Off-Chain Services:**
- `creatorService` → SKU analytics, revenue tracking
- `skuAnalyticsService` → installs, ratings, engagement
- `supportService` → support tier, follower counts

**Hooks:**
```typescript
// Existing
useSKUFactory() // SKU creation/management
useCreatorDashboard() // basic revenue

// New Required
useCreatorRevenue(creatorAddress: string) // 40% fee share tracking
useSKUPerformance(skuId: string) // analytics
useFeaturedSKUs(limit: number) // trending/recommended
useCreatorReputation(creatorAddress: string) // support tier
```

---

### 1.3 DEFI Hub

**Live Data Required:**
- User vault positions (PSX/VOID/CREATE vaults)
- Current APR (base + lock multiplier + vXP boost)
- Claimable rewards (VOID emissions)
- LP health, impermanent loss estimates
- TVL, global emission rate, system reserves
- Token prices (PSX, VOID, CREATE, SIGNAL, AGENCY)

**Contracts:**
- `VoidVault.sol` → deposits, locks, APR calculations
- `VoidEmitter.sol` → emission rate, claimable rewards
- `XPOracle.sol` → APR boost (max +20%)
- `PSXToken.sol`, `VOIDToken.sol`, `CREATEToken.sol` → balances

**Off-Chain Services:**
- `vaultAI` → vault health, risk flags
- `priceOracle` → token price feeds
- `tvlIndexer` → total value locked tracking

**Hooks:**
```typescript
// Existing
useVoidVault() // vault interactions
useTokenBalance(tokenAddress: string)

// New Required
useVaultPosition(vaultAddress: string, userAddress: string)
useClaimableRewards(userAddress: string)
useSystemMetrics() // TVL, emission rate, reserves
useVaultAPR(vaultAddress: string, userAddress: string)
useVaultAIRecommendations()
```

---

### 1.4 DAO Hub

**Live Data Required:**
- Active proposals (on-chain + off-chain)
- User voting power (PSX + VOID×0.5 + vXP×0.2)
- GovernanceAI recommendation scores
- Proposal outcomes, execution status
- Delegation status
- Treasury balances

**Contracts:**
- `VoidDAO.sol` → proposals, votes, execution
- `XPOracle.sol` → vXP voting weight
- `PSXToken.sol`, `VOIDToken.sol` → balances for power calc

**Off-Chain Services:**
- `governanceAI` → proposal scoring, recommendations
- `proposalIndexer` → proposal aggregation, history

**Hooks:**
```typescript
// Existing
useGovernance() // basic proposal reading

// New Required
useVotingPower(userAddress: string)
useActiveProposals(status?: ProposalStatus)
useGovernanceAIScores(proposalId: string)
useProposalVotes(proposalId: string)
useDelegation(userAddress: string)
```

---

### 1.5 AGENCY Hub

**Live Data Required:**
- User's active jobs (as client or worker)
- Escrow status per job (milestones, payments)
- Open gigs (filtered by skill/role)
- Squad membership, squad jobs
- Reputation score, completed jobs
- Dispute status (if any)

**Contracts:**
- `EscrowVault.sol` → job escrows, milestones, disputes
- `JobBoard.sol` → job postings, applications

**Off-Chain Services:**
- `agencyService` → job matching, squad coordination
- `squadService` → squad management
- `reputationService` → rating calculations

**Hooks:**
```typescript
// New Required (all new for Agency)
useJobBoard(filters?: {skill, role, budget})
useUserJobs(userAddress: string, role?: 'client'|'worker')
useEscrowStatus(escrowId: string)
useSquad(squadId: string)
useAgencyReputation(userAddress: string)
useJobDisputes(userAddress: string)
```

---

### 1.6 AI_OPS Hub

**Live Data Required:**
- Current emission rate, target range
- Last AI decisions (EmissionAI, VaultAI, SecurityAI)
- APR bounds (min/max allowed)
- Security threat level (green/yellow/red)
- Token expansion criteria status
- AI policy overrides (DAO interventions)

**Contracts:**
- `VoidEmitter.sol` → emission rate
- `VoidVault.sol` → APR bounds
- `TokenExpansionOracle.sol` → expansion criteria

**Off-Chain Services:**
- `emissionAI` → emission rate decisions
- `vaultAI` → vault health monitoring
- `securityAI` → threat detection
- `governanceAI` → proposal recommendations
- `policyManager` → DAO overrides

**Hooks:**
```typescript
// New Required (all new for AI Ops)
useEmissionAI() // current rate, last decision, bounds
useVaultAI() // vault health, risk flags
useSecurityAI() // threat level, paused contracts
useGovernanceAI() // proposal recommendations
useTokenExpansion() // criteria status
useAIActivityLog(limit: number)
usePolicyOverrides() // DAO interventions
```

---

## 2. Required HUD Windows & Panels

### 2.1 WORLD HUD (Primary Layer)

**Core Components:**
```typescript
<WorldMinimap />
  // 3D or 2D view
  // Show: districts, POIs, player position, nearby missions
  // Click: parcel → open ParcelInfoPanel

<MissionBrowserWindow />
  // List: active WORLD missions
  // Filters: difficulty (EASY/MEDIUM/HARD), nearby
  // Actions: view details, accept mission, track progress

<ParcelInfoPanel />
  // Display: owner, district, price, zone multiplier
  // Actions: purchase, view history, navigate to detail

<GlobalChatPanel />
  // Messages: global + district filter
  // Actions: send message, DM, mute user

<PlayerStatsCard />
  // Display: vXP, rank, SIGNAL, PSX balance
  // Actions: view progression, claim SIGNAL

<NearbyPlayersPanel />
  // List: nearby players (proximity-based)
  // Actions: view profile, invite to squad, DM

<NotificationToast />
  // Alerts: mission complete, reward claims, events
  // Actions: click → navigate to source hub
```

---

### 2.2 CREATOR HUD

**Core Components:**
```typescript
<CreatorDashboardWindow />
  // Display: my SKUs, total revenue, followers
  // Actions: create SKU, view analytics, manage pricing

<SKUPerformancePanel />
  // Per-SKU metrics: installs, ratings, engagement
  // Chart: revenue over time
  // Actions: promote SKU, update metadata

<FeaturedSKUsWindow />
  // Display: trending SKUs, recommended picks
  // Filters: category, price range
  // Actions: purchase, add to wishlist

<CreatorRevenueChart />
  // Chart: 40% fee share over time
  // Breakdown: sales, royalties, tips
  // Actions: export data, view transactions

<SKUCreationWizard />
  // Flow: upload asset → set metadata → set price → publish
  // Actions: save draft, preview, publish

<SupportStatusCard />
  // Display: support tier, badges, reputation
  // Actions: view support requests, respond
```

---

### 2.3 DEFI HUD

**Core Components:**
```typescript
<VaultPositionsWindow />
  // List: all vault positions (PSX, VOID, CREATE)
  // Display: vault name, deposited amount, APR, claimable
  // Actions: deposit, withdraw, claim rewards

<APRBreakdownCard />
  // Display: base APR + lock multiplier + vXP boost
  // Example: "15% (base) + 8% (6mo lock) + 3% (vXP boost) = 26% APR"
  // Actions: adjust lock period, view boost details

<SystemMetricsPanel />
  // Display: TVL, emission rate, VOID price, reserves
  // Charts: TVL over time, emission history
  // Actions: view detailed stats

<ClaimRewardsButton />
  // Action: one-click claim from all vaults
  // Display: total claimable VOID
  // Confirmation: transaction summary

<VaultAIRecommendations />
  // Display: AI-suggested vaults/strategies
  // Example: "VaultAI suggests: Stake PSX in 3mo lock for optimal APR"
  // Actions: follow recommendation, dismiss

<LiquidityPoolPanel />
  // Display: LP positions, impermanent loss estimates
  // Actions: add/remove liquidity, claim fees
```

---

### 2.4 DAO HUD

**Core Components:**
```typescript
<ActiveProposalsWindow />
  // List: active proposals, status, deadline
  // Filters: status (ACTIVE, PASSED, FAILED), category
  // Actions: view detail, vote, delegate

<VotingPowerCard />
  // Breakdown: PSX + (VOID × 0.5) + (vXP × 0.2)
  // Example: "1000 PSX + 500 VOID (×0.5) + 300 vXP (×0.2) = 1310 voting power"
  // Actions: view delegation, adjust stakes

<GovernanceAIPanel />
  // Per-proposal: AI recommendation score
  // Display: "👍 82% confidence recommend YES" + reasoning
  // Actions: view full analysis, vote

<ProposalDetailWindow />
  // Display: full proposal text, votes breakdown, execution status
  // Actions: vote YES/NO, delegate vote, view discussion

<DelegationManager />
  // Display: current delegation status
  // Actions: delegate to address, revoke delegation

<TreasuryDashboard />
  // Display: PSX Treasury balance, reserves
  // Charts: treasury growth, spend breakdown
  // Actions: view transactions, propose spend
```

---

### 2.5 AGENCY HUD

**Core Components:**
```typescript
<JobBoardWindow />
  // List: open gigs
  // Filters: skill (dev, design, marketing), budget, duration
  // Actions: view detail, apply for job, create posting

<MyJobsPanel />
  // List: active jobs (as client or worker)
  // Display: job title, status, next milestone, payment
  // Actions: mark milestone complete, message client/worker

<EscrowStatusWindow />
  // Per-job display: milestones, payments, disputes
  // Example: "Milestone 2/5 complete, $500 paid, $1500 remaining"
  // Actions: release payment, initiate dispute

<SquadDashboard />
  // Display: squad members, roles, active squad jobs
  // Actions: invite member, assign role, view squad chat

<ReputationCard />
  // Display: completed jobs, rating (out of 5), badges
  // Example: "87 jobs completed, 4.8★ rating, 'Reliable Dev' badge"
  // Actions: view reviews, respond to feedback

<JobDisputePanel />
  // Display: active disputes, DAO resolution status
  // Actions: provide evidence, view DAO decision
```

---

### 2.6 AI_OPS HUD

**Core Components:**
```typescript
<AIOpsConsoleWindow />
  // Master dashboard: all AI agent statuses
  // Display: emission rate, vault health, security level, active proposals
  // Actions: view detailed AI logs, trigger manual overrides

<EmissionAIPanel />
  // Display: current emission rate, target range, last decision
  // Example: "Emission: 0.72× (safe zone: 0.6-1.0×), last cut: 2h ago"
  // Actions: view reasoning, DAO override

<VaultAIPanel />
  // Display: vault health scores, risk flags
  // Example: "⚠️ PSX Vault: reward pool depleting 15% faster than refill"
  // Actions: view recommendations, adjust APR bounds

<SecurityAIPanel />
  // Display: threat level indicator (green/yellow/red)
  // Alerts: paused contracts, anomaly detections
  // Actions: acknowledge alert, view logs

<GovernanceAIPanel />
  // Display: proposal scores, AI voting logic
  // Example: "Proposal #15: 82% YES (aligns with sustainability goals)"
  // Actions: view full analysis, DAO override

<TokenExpansionWindow />
  // Display: token expansion criteria status
  // List: tokens meeting criteria, unlocked tokens
  // Actions: propose expansion to DAO

<AIActivityLog />
  // List: last 20 AI actions with timestamps
  // Example: "EmissionAI cut emissions to 0.7× (reserve levels high)"
  // Actions: filter by agent, export logs

<PolicyOverrideManager />
  // Display: DAO manual interventions
  // Actions: create override, revoke override, view history
```

---

## 3. Event & Notification System

### 3.1 Event Bus Architecture

**Centralized HUDRoot Event Bus** (Recommended)

```typescript
// hooks/useHUDEventBus.ts
interface HUDEventBus {
  // Mission Events
  onMissionCreated: (mission: Mission) => void
  onMissionCompleted: (missionId: string, user: string, rewards: Rewards) => void
  
  // Reward Events
  onRewardClaimed: (user: string, token: string, amount: BigNumber) => void
  onVXPEarned: (user: string, amount: number, newRank?: string) => void
  
  // Governance Events
  onProposalCreated: (proposalId: string) => void
  onProposalPassed: (proposalId: string) => void
  onProposalExecuted: (proposalId: string) => void
  
  // Vault Events
  onVaultRefill: (vaultAddress: string, amount: BigNumber) => void
  onAPRChanged: (vaultAddress: string, oldAPR: number, newAPR: number) => void
  
  // Agency Events
  onJobCreated: (jobId: string) => void
  onMilestonePaid: (escrowId: string, milestoneIndex: number, amount: BigNumber) => void
  onDisputeInitiated: (escrowId: string) => void
  onDisputeResolved: (escrowId: string, outcome: string) => void
  
  // AI Events
  onEmissionAdjusted: (oldRate: number, newRate: number, reason: string) => void
  onSecurityAlert: (level: 'yellow'|'red', message: string) => void
  onExpansionUnlocked: (tokenAddress: string) => void
}
```

**Subscription Pattern:**

```typescript
// components/hud/HUDRoot.tsx
const HUDRoot = () => {
  const eventBus = useHUDEventBus() // WebSocket + contract listeners
  
  useEffect(() => {
    eventBus.subscribe('mission.*', handleMissionEvents)
    eventBus.subscribe('reward.*', handleRewardEvents)
    eventBus.subscribe('governance.*', handleGovernanceEvents)
    eventBus.subscribe('agency.*', handleAgencyEvents)
    eventBus.subscribe('ai.*', handleAIEvents)
  }, [])
  
  return (
    <>
      <NotificationToastManager events={eventBus.stream} />
      <ActiveHubWindow hub={activeHub} />
      <SharedOverlays />
    </>
  )
}
```

---

### 3.2 Notification Toast Examples

**Mission System:**
```
✅ Mission Complete: 'Deploy Your First SKU' → +50 vXP, 10 SIGNAL
🎯 New Mission Available: 'Stake 100 PSX' in DeFi Hub
```

**Rewards:**
```
💰 Claimed 45.2 VOID from xVOID Vault
⭐ Rank Up! You are now Silver Tier (500 vXP)
```

**Governance:**
```
🗳️ Proposal #12 Passed: 'Increase Creator Fee Share to 45%'
🤖 GovernanceAI recommends: Vote YES on Proposal #15
```

**Agency:**
```
💼 Job Milestone Paid: 1,500 USDC released to your wallet
⚠️ Dispute Initiated: Job #4521 - DAO review in progress
```

**AI Ops:**
```
📉 EmissionAI: Cutting emissions to 0.7× (high reserve levels)
🚨 SecurityAI: PAUSED VoidVault due to anomaly detected
🌍 Land Expansion Unlocked: $GLIZZY met criteria (1M volume 7d)
```

---

## 4. Cross-Hub Navigation

### 4.1 Hub Switcher (Xbox Blade Style)

**Position:** Left rail (vertical tabs) or top bar (horizontal tabs)

```typescript
<HubSwitcher>
  <HubTab icon="🌍" hub="WORLD" active={activeHub === 'WORLD'} />
  <HubTab icon="🎨" hub="CREATOR" active={activeHub === 'CREATOR'} />
  <HubTab icon="💰" hub="DEFI" active={activeHub === 'DEFI'} />
  <HubTab icon="🗳️" hub="DAO" active={activeHub === 'DAO'} />
  <HubTab icon="💼" hub="AGENCY" active={activeHub === 'AGENCY'} />
  <HubTab icon="🤖" hub="AI_OPS" active={activeHub === 'AI_OPS'} />
</HubSwitcher>
```

**Behavior:**
- Click tab → switch hub, HUD windows change
- Shared overlays persist (notifications, player stats)
- Deep links work: `/world?mission=123` opens WORLD + mission detail

---

### 4.2 Cross-Hub Flow Examples

**Flow 1: Mission → DeFi Vault**
```typescript
// User clicks mission: "Stake 100 PSX to earn 25 SIGNAL"
onMissionClick(mission) {
  if (mission.requiresHub === 'DEFI') {
    switchHub('DEFI')
    openWindow('VaultPositionsWindow')
    highlightVault('PSX_Vault') // visual pulse
    showToast("Complete staking to finish mission")
  }
}
```

**Flow 2: Creator Purchase → World Access**
```typescript
// User buys SKU: "Glizzy World VIP Pass NFT"
onSKUPurchase(sku) {
  if (sku.metadata.unlocksWorldAccess) {
    showToast("✅ Glizzy World unlocked! Visit WORLD hub to enter")
    if (activeHub === 'WORLD') {
      highlightDistrictOnMinimap('Glizzy World')
    }
  }
}
```

**Flow 3: Agency Payout → DAO Dispute**
```typescript
// Escrow dispute initiated
onDisputeInitiated(escrow) {
  showToast("⚠️ Job dispute active. DAO will review within 48h")
  onToastClick() {
    switchHub('DAO')
    openWindow('ProposalDetailWindow', { proposalId: escrow.disputeProposalId })
  }
}
```

---

## 5. AI Overlays

### 5.1 AI Data Display Map

| AI Agent | HUD Component | Visual Representation |
|----------|---------------|----------------------|
| **EmissionAI** | `<EmissionAIBadge />` in DeFi HUD | Green/Yellow/Red ring around emission rate |
| **VaultAI** | `<VaultRiskIndicator />` per vault | ⚠️ icon + tooltip: "Low reward pool" |
| **MissionAI** | `<HotMissionBadge />` in mission list | 🔥 icon for high-activity missions |
| **GovernanceAI** | `<AIRecommendationScore />` on proposals | 👍/👎 + confidence % |
| **SecurityAI** | `<ThreatLevelIndicator />` in top bar | Green/Yellow/Red dot |

---

### 5.2 AI Overlay Implementations

**EmissionAI → DeFi HUD:**
```typescript
<SystemMetricsPanel>
  <EmissionRate value={0.72} />
  <EmissionAIBadge 
    status="cutting" // or "safe" or "boosting"
    reason="Reserve levels 15% above target"
    color="yellow"
  />
</SystemMetricsPanel>
```
**Visual:** Yellow ring pulses around emission rate number

---

**VaultAI → Vault Position Cards:**
```typescript
<VaultPositionCard vault="PSX_Vault">
  {vaultAIRisk && (
    <VaultRiskIndicator 
      level="medium"
      message="Reward pool depleting faster than refill rate"
      recommendation="Consider shorter lock periods"
    />
  )}
</VaultPositionCard>
```
**Visual:** ⚠️ triangle badge, orange border pulse

---

**MissionAI → Mission List:**
```typescript
<MissionCard mission={mission}>
  {missionAI.isHot(mission) && (
    <HotMissionBadge 
      reason="12 users nearby, 3x XP weekend active"
    />
  )}
</MissionCard>
```
**Visual:** 🔥 fire icon, gradient border

---

**GovernanceAI → DAO Proposals:**
```typescript
<ProposalCard proposal={proposal}>
  <AIRecommendationScore 
    score={82}
    vote="YES"
    reasoning="Aligns with sustainability goals, minimal risk"
  />
</ProposalCard>
```
**Visual:** 👍 icon, green "82% confidence" badge

---

**SecurityAI → Global HUD Top Bar:**
```typescript
<HUDTopBar>
  <ThreatLevelIndicator 
    level="green" // or "yellow" or "red"
    message={level === 'red' ? "VoidVault paused" : "All systems nominal"}
  />
</HUDTopBar>
```
**Visual:** Small circle in top-right (green/yellow/red)

---

## 6. vXP, SIGNAL & Reputation Visibility

### 6.1 Primary Display (Always Visible)

**Top Bar:**
```typescript
<HUDTopBar>
  <PlayerStatsChip>
    <XPDisplay 
      currentXP={1247}
      rank="Silver"
      nextRank="Gold"
      xpToNext={253}
    />
    <SIGNALBalance balance={450} />
    <ReputationBadge 
      tier="Trusted"
      score={87}
    />
  </PlayerStatsChip>
</HUDTopBar>
```

**Visual:**
- `⭐ Silver 1,247 XP` (hover: "253 XP to Gold")
- `🔷 450 SIGNAL`
- `🛡️ Trusted (87)` (hover: reputation breakdown)

---

### 6.2 Progression Panel (Expandable)

```typescript
<ProgressionWindow>
  <XPProgressBar 
    current={1247}
    nextMilestone={1500}
    milestones={[500, 1000, 1500, 2500, 5000]}
  />
  <RankBenefits rank="Silver">
    <Benefit>+10% APR boost (current)</Benefit>
    <Benefit locked>+15% APR boost (Gold - 253 XP away)</Benefit>
  </RankBenefits>
  <MissionProgress>
    <MissionMilestone>
      "Complete 5 WORLD missions" → 3/5 ✅✅✅⚪⚪
      Reward: +100 XP, 25 SIGNAL
    </MissionMilestone>
  </MissionProgress>
</ProgressionWindow>
```

---

### 6.3 Rank/Tier System

| vXP Range | Rank | APR Boost | SIGNAL Multiplier |
|-----------|------|-----------|------------------|
| 0-499 | Bronze | +0% | 1.0× |
| 500-999 | Silver | +5% | 1.2× |
| 1,000-2,499 | Gold | +10% | 1.5× |
| 2,500-4,999 | Platinum | +15% | 2.0× |
| 5,000+ | Diamond | +20% | 2.5× |

---

## 7. Mobile Roam HUD

### 7.1 Minimal "Fully Functional" Mobile HUD

```typescript
<MobileRoamHUD>
  {/* Top Bar (Collapsed) */}
  <MobileTopBar>
    <XPChip>{xp} XP</XPChip>
    <SIGNALChip>{signal} SIGNAL</SIGNALChip>
    <MenuButton /> {/* Hamburger for full nav */}
  </MobileTopBar>
  
  {/* Bottom Dock (Always Visible) */}
  <MobileBottomDock>
    <DockButton icon="🗺️" onClick={() => toggleMinimap()} />
    <DockButton icon="💬" onClick={() => toggleChat()} badge={unreadCount} />
    <DockButton icon="🎯" onClick={() => toggleMissions()} />
    <DockButton icon="🎒" onClick={() => toggleInventory()} />
    <DockButton icon="💰" onClick={() => toggleBalances()} />
  </MobileBottomDock>
  
  {/* Swipeable Panels */}
  <SwipeablePanel visible={minimapOpen}>
    <MinimapMobile />
  </SwipeablePanel>
  
  <SwipeablePanel visible={chatOpen}>
    <ChatPanelMobile />
  </SwipeablePanel>
  
  <SwipeablePanel visible={missionsOpen}>
    <MissionListMobile />
  </SwipeablePanel>
</MobileRoamHUD>
```

---

### 7.2 Reusable vs Mobile-Specific Components

| Component | Desktop HUD | Mobile HUD | Notes |
|-----------|-------------|------------|-------|
| **Minimap** | `<WorldMinimap />` 3D | `<MinimapMobile />` 2D | Simplified for performance |
| **Chat** | `<GlobalChatPanel />` sidebar | `<ChatPanelMobile />` fullscreen | Same data, different layout |
| **Missions** | `<MissionBrowserWindow />` windowed | `<MissionListMobile />` swipeable | Card-based, touch-optimized |
| **Inventory** | `<GlobalInventoryUI />` grid | `<InventoryMobile />` vertical | Same backend |
| **Balances** | `<PlayerStatsCard />` persistent | `<BalanceSheetMobile />` modal | Swipe-up sheet |

**Shared Logic:** All hooks, event bus, data fetching identical

---

## 8. Implementation Checklist

### Phase 1: Core HUD Infrastructure (Week 1)

**Files to Create:**
- [ ] `hooks/useHUDEventBus.ts` → WebSocket + contract listeners
- [ ] `components/hud/NotificationToastManager.tsx` → Toast UI
- [ ] `lib/events/hudEvents.ts` → Event type definitions
- [ ] `services/eventAggregator.ts` → Combine on-chain + off-chain
- [ ] `components/hud/HubSwitcher.tsx` → Xbox blade tabs
- [ ] `hooks/useHubNavigation.ts` → Hub state management
- [ ] `components/hud/HUDRoot.tsx` → Top-level container
- [ ] `components/hud/PlayerStatsChip.tsx` → Top bar display
- [ ] `components/hud/ProgressionWindow.tsx` → XP/rank panel

**Hooks to Create:**
- [ ] `hooks/useXPOracle.ts` → Query XPOracle.sol
- [ ] `hooks/useSIGNALBalance.ts` → Query VoidEmitter.sol
- [ ] `hooks/useReputation.ts` → Query reputation service

**Contracts to Query:**
- [x] `XPOracle.sol` → getXP(), getVotingWeight(), getAPRBoost()
- [ ] `VoidEmitter.sol` → signalBalance(), claimableRewards()

---

### Phase 2: Per-Hub Windows (Week 2-3)

**WORLD Hub:**
- [ ] `components/hud/world/MissionBrowserWindow.tsx`
- [ ] `components/hud/world/ParcelInfoPanel.tsx`
- [ ] `components/hud/world/NearbyPlayersPanel.tsx`
- [ ] `components/hud/world/DistrictOverlay.tsx`
- [ ] `hooks/useMissionRegistry.ts`
- [ ] `hooks/useNearbyMissions.ts`
- [ ] `hooks/useDistrictInfo.ts`

**CREATOR Hub:**
- [ ] `components/hud/creator/CreatorDashboardWindow.tsx`
- [ ] `components/hud/creator/SKUPerformancePanel.tsx`
- [ ] `components/hud/creator/FeaturedSKUsWindow.tsx`
- [ ] `components/hud/creator/CreatorRevenueChart.tsx`
- [ ] `hooks/useCreatorRevenue.ts`
- [ ] `hooks/useSKUPerformance.ts`
- [ ] `hooks/useFeaturedSKUs.ts`

**DEFI Hub:**
- [ ] `components/hud/defi/VaultPositionsWindow.tsx`
- [ ] `components/hud/defi/APRBreakdownCard.tsx`
- [ ] `components/hud/defi/SystemMetricsPanel.tsx`
- [ ] `components/hud/defi/ClaimRewardsButton.tsx`
- [ ] `components/hud/defi/VaultAIRecommendations.tsx`
- [ ] `hooks/useVaultPosition.ts`
- [ ] `hooks/useVaultAPR.ts`
- [ ] `hooks/useClaimableRewards.ts`
- [ ] `hooks/useSystemMetrics.ts`
- [ ] `hooks/useVaultAI.ts`

**DAO Hub:**
- [ ] `components/hud/dao/ActiveProposalsWindow.tsx`
- [ ] `components/hud/dao/VotingPowerCard.tsx`
- [ ] `components/hud/dao/GovernanceAIPanel.tsx`
- [ ] `components/hud/dao/ProposalDetailWindow.tsx`
- [ ] `components/hud/dao/DelegationManager.tsx`
- [ ] `hooks/useVotingPower.ts`
- [ ] `hooks/useActiveProposals.ts`
- [ ] `hooks/useGovernanceAIScores.ts`

**AGENCY Hub:**
- [ ] `components/hud/agency/JobBoardWindow.tsx`
- [ ] `components/hud/agency/MyJobsPanel.tsx`
- [ ] `components/hud/agency/EscrowStatusWindow.tsx`
- [ ] `components/hud/agency/SquadDashboard.tsx`
- [ ] `components/hud/agency/ReputationCard.tsx`
- [ ] `components/hud/agency/JobDisputePanel.tsx`
- [ ] `hooks/useJobBoard.ts`
- [ ] `hooks/useUserJobs.ts`
- [ ] `hooks/useEscrowStatus.ts`
- [ ] `hooks/useSquad.ts`
- [ ] `hooks/useAgencyReputation.ts`

**AI_OPS Hub:**
- [ ] `components/hud/aiops/AIOpsConsoleWindow.tsx`
- [ ] `components/hud/aiops/EmissionAIPanel.tsx`
- [ ] `components/hud/aiops/VaultAIPanel.tsx`
- [ ] `components/hud/aiops/SecurityAIPanel.tsx`
- [ ] `components/hud/aiops/GovernanceAIPanel.tsx`
- [ ] `components/hud/aiops/TokenExpansionWindow.tsx`
- [ ] `components/hud/aiops/AIActivityLog.tsx`
- [ ] `hooks/useEmissionAI.ts`
- [ ] `hooks/useVaultAI.ts`
- [ ] `hooks/useSecurityAI.ts`
- [ ] `hooks/useGovernanceAI.ts`
- [ ] `hooks/useTokenExpansion.ts`

---

### Phase 3: AI Overlays & Integration (Week 4)

**AI Visual Indicators:**
- [ ] `components/hud/ai/EmissionAIBadge.tsx` → DeFi HUD
- [ ] `components/hud/ai/VaultRiskIndicator.tsx` → Vault cards
- [ ] `components/hud/ai/HotMissionBadge.tsx` → Mission list
- [ ] `components/hud/ai/AIRecommendationScore.tsx` → DAO proposals
- [ ] `components/hud/ai/ThreatLevelIndicator.tsx` → Top bar

**Cross-Hub Actions:**
- [ ] Update `hooks/useHubNavigation.ts` → Add navigateToAction()
- [ ] Update `NotificationToastManager.tsx` → Add click handlers

---

### Phase 4: Mobile Roam HUD (Week 5)

**Mobile Components:**
- [ ] `components/hud/mobile/MobileRoamHUD.tsx`
- [ ] `components/hud/mobile/MobileTopBar.tsx`
- [ ] `components/hud/mobile/MobileBottomDock.tsx`
- [ ] `components/hud/mobile/MinimapMobile.tsx`
- [ ] `components/hud/mobile/ChatPanelMobile.tsx`
- [ ] `components/hud/mobile/MissionListMobile.tsx`
- [ ] `components/hud/mobile/InventoryMobile.tsx`
- [ ] `components/hud/mobile/BalanceSheetMobile.tsx`

---

## 9. Acceptance Criteria

### Per-Hub Functionality Tests

**WORLD Hub:**
- ✅ Minimap shows 40×40 grid, districts, player position
- ✅ Click mission → opens detail → accept button works
- ✅ Hover parcel → shows owner, price, district
- ✅ Chat sends messages, DMs work
- ✅ Nearby missions highlighted by MissionAI

**CREATOR Hub:**
- ✅ Dashboard shows total revenue (40% fee share)
- ✅ SKU performance panel shows installs, ratings
- ✅ Featured SKUs window shows trending picks
- ✅ Create SKU flow works end-to-end

**DEFI Hub:**
- ✅ Vault positions window shows all deposits, APRs
- ✅ APR breakdown shows base + lock + vXP boost
- ✅ One-click claim button works for all vaults
- ✅ VaultAI recommendations appear when relevant

**DAO Hub:**
- ✅ Proposal list shows active proposals
- ✅ Voting power card shows PSX + VOID×0.5 + vXP×0.2
- ✅ GovernanceAI score displays on proposals
- ✅ Vote buttons work, delegation works

**AGENCY Hub:**
- ✅ Job board shows open gigs, filters work
- ✅ My jobs panel shows active work
- ✅ Escrow status window shows milestones, payments
- ✅ Dispute flow works end-to-end

**AI_OPS Hub:**
- ✅ AI Ops console shows all agent statuses
- ✅ Emission panel shows current rate, bounds
- ✅ Security panel shows threat level
- ✅ Activity log shows last 20 AI actions

---

### Cross-Hub Tests

- ✅ Click hub tab → switches hub, windows change
- ✅ Click notification → navigates to correct hub + window
- ✅ Deep links work (e.g., `/defi?vault=0x123`)
- ✅ Shared overlays persist across hub switches
- ✅ AI overlays appear in correct contexts

---

### Mobile Tests

- ✅ Bottom dock always visible
- ✅ Swipeable panels work smoothly
- ✅ Touch targets min 44px
- ✅ Same hooks work on mobile and desktop

---

## 10. Next Steps

1. **Approve this HUD specification**
2. **Deploy Week 1 contracts to Base Sepolia**
   - Run `npx hardhat run scripts/deploy/deploy-testnet.ts --network baseSepolia`
   - Update `.env` with deployed addresses
3. **Run land grid migration SQL**
   - `psql <connection_string> -f scripts/MIGRATION_001_fix_land_grid.sql`
4. **Start Phase 1 HUD implementation** (Core infrastructure)
5. **Build AI services in TypeScript** (Week 2)
6. **Integrate indexer** (vXP calculation, mission tracking)
7. **Phase 2-4 HUD implementation** (Per-hub windows, AI overlays, mobile)

---

**Document Version:** 1.0  
**Approved By:** User (pending)  
**Implementation Target:** Week 2-5 of 4-week sprint  
**Status:** ✅ Ready for Execution
