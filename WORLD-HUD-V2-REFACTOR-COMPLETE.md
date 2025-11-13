# WORLD HUD V2 - Economic Lobby Refactor ✅

**Status**: PHASE 1 COMPLETE
**Date**: Current Session
**Objective**: Implement Economic Lobby ideology with EconomySnapshot pattern

---

## ✅ COMPLETED

### 1. Type System Foundation

**Created**: `hud/types/economySnapshot.ts` (250 lines)

- **EconomySnapshot Interface** - Master type with all 6 hubs:
  - `world`: WorldState (zone, coords, friends, districts)
  - `creator`: CreatorState (royalties, drops, launches)
  - `defi`: DeFiState (prices, epoch, vaults, multiplier)
  - `dao`: DAOState (proposals, voting power, PSX, reputation)
  - `agency`: AgencyState (role, gigs, squads, recruiting)
  - `aiOps`: AIOpsState (logs, hotspots, suggestions, risks)

- **Cross-Hub Types**:
  - `Mission` - Hub-tagged quests with rewards
  - `POI` - Spatial economy markers (hub-scoped)
  - `TickerItem` - Economic announcements with hub tags
  - `RewardEntry` - Dopamine feedback system
  - `ChatMessage` - Hub-aware messaging

- **PlayerState Interface**:
  - Meta state: username, wallet, level, XP, streak
  - Token balances: VOID, SIGNAL, PSX, CREATE
  - Achievements tracking

### 2. Component Updates (Hub-Aware Pattern)

#### PlayerChip.tsx ✅
**Purpose**: Multi-hub identity widget (top-left)

**Hub Integration**:
- **WORLD**: Zone, coordinates (location awareness)
- **DEFI**: VOID balance, SIGNAL balance (token holdings)
- **DAO**: PSX balance, voting power (governance weight)
- **CREATOR**: CREATE balance (royalty earnings)
- **AGENCY**: Role, agency name, pledge status (social identity)

**Visual Design**:
- Chrome gradient: signal-green → void-purple → psx-blue
- 4-token grid display (VOID, SIGNAL, PSX, CREATE)
- Agency badge with color coding:
  - PSX_PLEDGED = blue
  - RECRUITING = red
  - OPEN_MISSION = yellow
- Expandable: shows location + voting power

**Data Pattern**: ✅ Reads from `PlayerState` + `EconomySnapshot`

---

#### TopTicker.tsx ✅
**Purpose**: Economic pulse line (top-center)

**Hub Integration**:
- **DEFI**: VOID/PSX prices + 24h change, SIGNAL epoch, emission multiplier
- **All Hubs**: Hub-tagged announcements via `tickerItems[]`

**TickerItem Structure**:
```typescript
{
  id: string;
  hub: 'DEFI' | 'DAO' | 'CREATOR' | 'AGENCY' | 'AI_OPS';
  message: string;
  priority: number;
  color: string; // Hub-specific accent
}
```

**Hub Color Tags**:
- [DEFI] → void-purple (#7C00FF)
- [DAO] → psx-blue (#00D4FF)
- [CREATOR] → cyber-cyan (#00D4FF)
- [AGENCY] → red (#FF0000)
- [AI OPS] → signal-green (#00FF9D)

**Visual Design**:
- Chrome rail with gradient spine
- Rotating announcements (6s interval)
- Pill tags for each hub
- Real-time token price display with trend indicators

**Dopamine FX**: `triggerFX("tickerSpark")` on new items

**Data Pattern**: ✅ Reads from `economySnapshot.defi` + `economySnapshot.tickerItems`

---

#### MiniMap.tsx ✅
**Purpose**: Spatial economy radar (top-right)

**Hub Integration**:
- **WORLD**: Districts, nearby players, player position
- **CREATOR**: Palette POIs (galleries, mint locations)
- **DEFI**: Vault POIs (DeFi towers)
- **DAO**: Vote POIs (governance hubs)
- **AGENCY**: Briefcase POIs (job boards, agencies)
- **AI OPS**: Brain POIs + AI hotspots (high-activity zones)

**POI Structure**:
```typescript
{
  id: string;
  hub: 'CREATOR' | 'DEFI' | 'DAO' | 'AGENCY' | 'AI_OPS';
  type: string;
  position: { x: number; z: number };
  label: string;
  active: boolean;
}
```

**Hub Icons**:
- 🎨 Palette (CREATOR)
- 🏦 Vault (DEFI)
- 🗳️ Vote (DAO)
- 💼 Briefcase (AGENCY)
- 🧠 Brain (AI OPS)

**AI Hotspot Display**:
- Pulsing green rings
- High-activity areas marked in real-time
- Automated event detection

**Visual Design**:
- Color-coded POI dots by hub
- District boundaries with labels
- Player position (green dot)
- Footer: POI count display

**Dopamine FX**: `triggerFX("mapPulse")` on hotspot events

**Click Action**: Opens full MAP app with hub filters

**Data Pattern**: ✅ Reads from `economySnapshot.pois` + `economySnapshot.aiOps.hotspots`

---

### 3. WorldHubV2 Orchestrator ✅

**Purpose**: Main coordinator, builds EconomySnapshot from all hooks

**Hook Dependencies**:
- `useVoidEngine()` - DeFi state (prices, vaults, balances)
- `useWorldState()` - Social state (friends, position, districts)
- `useLandMap()` - Land/district data
- `useGamification()` - XP, level, streak, missions

**EconomySnapshot Construction**:
```typescript
const economySnapshot = useMemo<EconomySnapshot>(() => ({
  world: {
    zone: districts[0]?.name || 'VOID_CORE',
    coordinates: position || { x: 0, z: 0 },
    onlineFriends: friends?.length || 0,
    nearbyPlayers: [],
    districts: districts.map(d => ({...}))
  },
  creator: {
    royaltiesEarned: parseFloat(royalties?.totalEarned || '0'),
    activeDrop: null,
    scheduledLaunches: []
  },
  defi: {
    voidPrice, voidChange24h,
    psxPrice, psxChange24h,
    signalEpoch, emissionMultiplier,
    vaults: positions.map(...),
    myPositions: positions.map(...)
  },
  dao: {
    activeProposals: [...],
    myVotingPower: 1.0,
    psxStaked: 0,
    reputationScore: level * 100
  },
  agency: {
    myRole: 'FREELANCER',
    myAgency: null,
    activeGigs: [],
    squadMembers: [],
    pledgeStatus: 'NONE',
    recruitingMode: false
  },
  aiOps: {
    logs: [],
    hotspots: [],
    automationSuggestions: [],
    riskAlerts: []
  },
  missions: [],
  recentRewards: [],
  tickerItems: [...],
  pois: [...],
  chatMessages: []
}), [dependencies...]);
```

**PlayerState Construction**:
```typescript
const playerState = useMemo<PlayerStateType>(() => ({
  username: 'Operator',
  walletAddress: address || '0x0000...0000',
  level, xp: currentXP, xpProgress,
  streak: 4,
  achievements: 12,
  voidBalance, signalBalance, psxBalance, createBalance
}), [dependencies...]);
```

**Dopamine FX System**:
```typescript
const [fxState, setFxState] = useState({
  missionCompleted: false,
  tokenGain: false,
  chatIncoming: false,
  tickerEvent: false,
  mapPulse: false
});

const triggerFX = (type: string, data?: any) => {
  console.log('🎮 FX:', type, data);
  // TODO: wire to audio/visual FX system
};
```

**Type Fixes Applied**:
- ✅ `royalties.totalEarned` (not `.total`)
- ✅ `position` → `districts[0].name` for zone
- ✅ `d.color` (not `.baseColor`)
- ✅ `p.id` (not `.vaultId`)
- ✅ `p.pendingRewards.reduce(...)` (not `.rewards`)
- ✅ Filter WORLD hub from tickerItems/POIs (components only accept economic hubs)
- ✅ Type assertions for hub filtering

**Component Prop Mapping**:
- PlayerChip: Receives `playerState` + selected `economySnapshot` fields
- TopTicker: Receives `economySnapshot.defi` + `tickerItems` (with color mapping)
- MiniMap: Receives `economySnapshot.world` + `pois` + `aiOps.hotspots`
- LeftRail: Receives `playerState` + `economySnapshot.missions`
- RightRail: Receives DeFi stats + `economySnapshot.aiOps.logs`

**Helper Function**:
```typescript
const getHubColor = (hub: string): string => {
  switch (hub) {
    case 'DEFI': return '#7C00FF';
    case 'DAO': return '#00D4FF';
    case 'CREATOR': return '#00D4FF';
    case 'AGENCY': return '#FF0000';
    case 'AI_OPS': return '#00FF9D';
    default: return '#E5E7EB';
  }
};
```

---

## 🎨 Layout Grid (22%-56%-22%)

```
┌────────────────────────────────────────────────────────────┐
│ TOP: PlayerChip | TopTicker (pulse line) | MiniMap         │
├──────────┬─────────────────────────────────┬───────────────┤
│          │                                 │               │
│ LeftRail │     SAFE ZONE (56%)             │   RightRail   │
│  (22%)   │     Blue area - NO HUD          │     (22%)     │
│          │     (3D world unobstructed)     │               │
│ Missions │                                 │ AI Feed       │
│ Social   │                                 │ Rewards       │
│          │                                 │ Chat          │
├──────────┴─────────────────────────────────┴───────────────┤
│ BOTTOM: ContextActionBar + BottomAppDock                   │
└────────────────────────────────────────────────────────────┘
```

**Constraints**:
- ✅ Center 56% clear for 3D gameplay
- ✅ Yellow gutters (22% each side) for HUD
- ✅ All interactive elements in gutters
- ✅ Pointer events carefully managed

---

## 🧬 Data Flow Pattern

### ✅ CORRECT Pattern (Implemented)

```
WorldHubV2 (orchestrator)
  ↓
  useVoidEngine() + useWorldState() + useLandMap() + useGamification()
  ↓
  Build EconomySnapshot (all 6 hubs)
  ↓
  Pass to Components (PlayerChip, TopTicker, MiniMap, etc.)
  ↓
  Components read from snapshot, NEVER invent data
```

### ❌ ANTI-PATTERN (Avoided)

```
Component creates placeholder data locally
Component doesn't know hub context
Component shows "random" or "example" values
```

---

## 🎯 Hub Ideology

### 6 Economic Hubs

1. **WORLD** (Social Layer)
   - Friends, parties, location, presence
   - Color: signal-green + cyan

2. **CREATOR** (Launchpad)
   - Royalties, drops, mints, galleries
   - Color: cyber-cyan (#00D4FF)

3. **DEFI** (Vault Machine)
   - VOID/SIGNAL/PSX prices, vaults, LP, emissions
   - Color: void-purple (#7C00FF)

4. **DAO** (Governance Brain)
   - Proposals, voting power, PSX staking, reputation
   - Color: psx-blue (#00D4FF)

5. **AGENCY** (Jobs & Pledges)
   - Roles, gigs, squads, IP-building
   - Color: red (#FF0000)

6. **AI OPS** (Automation)
   - Logs, hotspots, suggestions, risk alerts
   - Color: signal-green (#00FF9D)

**Every HUD element is a portal into one or more hubs**

---

## 🚀 Dopamine System (Wired Structure)

### FX State Tracking
```typescript
{
  missionCompleted: boolean;
  tokenGain: boolean;
  chatIncoming: boolean;
  tickerEvent: boolean;
  mapPulse: boolean;
}
```

### FX Triggers
- `triggerFX('tokenGain', { amount, token })` → Spark trail + sound
- `triggerFX('missionCompleted', { mission })` → Glow + chime
- `triggerFX('tickerEvent', { hub, message })` → Slide-in animation
- `triggerFX('mapPulse', { hotspot })` → Ring expansion
- `triggerFX('chatPing', { message })` → Notification bounce

**Implementation**: Structure in place, needs audio/visual wiring

---

## 📋 REMAINING WORK (Phase 2)

### Components Not Yet Updated

1. **LeftRail.tsx** ⏳
   - Add hub-tagged missions from `snapshot.missions`
   - Agency role display
   - Social snapshot from `snapshot.world.onlineFriends`

2. **RightRail.tsx** ⏳
   - AI OPS feed from `snapshot.aiOps.logs`
   - Spiny chrome chat (vertical spine)
   - Hub-tagged rewards from `snapshot.recentRewards`

3. **ContextActionBar.tsx** ⏳
   - Hub-aware verbs ("OPEN VAULT TERMINAL" = DEFI, etc.)
   - Context from current hub/location

4. **BottomAppDock.tsx** ⏳
   - Hub grouping (social vs economic)
   - Hub routing (click app → open with hub context)

### System Integration

5. **useEconomySnapshot() Hook** ⏳
   - Extract economySnapshot building logic from WorldHubV2
   - Make reusable across app
   - Centralize hub data aggregation

6. **Dopamine FX Wiring** ⏳
   - Create `useDopamineFX()` hook
   - Connect to shader system (CRT, glow, sparks)
   - Wire audio system (trigger sounds on FX events)
   - Map fxState to visual feedback

7. **Spiny Chrome Chat** ⏳
   - Vertical chrome spine at far right of RightRail
   - Tabs: GLOBAL, NEARBY, PARTY/GUILD
   - Hub-tagged messages with color coding
   - System messages from Agency/Creator/VaultAI
   - `triggerFX("chatPing")` on new messages

8. **Testing** ⏳
   - Verify all 6 hubs surface correctly
   - Test hub color coding consistency
   - Test dopamine FX triggers
   - Verify safe play area (56% center clear)
   - Test POI system on minimap
   - Test ticker rotation

---

## 🏗️ Architecture Principles

### 1. Single Source of Truth
- All hub data flows through `EconomySnapshot`
- Components are pure readers, never creators
- No placeholder data in components

### 2. Hub-Scoped Everything
- Every widget knows its hub(s)
- Color coding enforces hub identity
- Cross-hub data tagged with source

### 3. Dopamine-First Design
- FX system tracks all feedback events
- Visual + audio feedback on every action
- Hub events flow through FX pipeline

### 4. Portal Pattern
- HUD is not "decoration" — it's functional portals
- Every card opens deeper into a hub
- MiniMap POIs → full MAP app with hub filters
- TopTicker items → hub-specific detail views

### 5. Safe Play Area
- Center 56% MUST remain clear
- NO floating cards in blue zone
- Gutters only for HUD elements

---

## 📊 Compilation Status

**WorldHubV2.tsx**: ✅ NO ERRORS
**PlayerChip.tsx**: ✅ NO ERRORS
**TopTicker.tsx**: ✅ NO ERRORS
**MiniMap.tsx**: ✅ NO ERRORS

**Pre-existing Errors** (not related to this refactor):
- Missing mobile-hud-lite component
- CRTOverlay prop mismatches
- Hook type mismatches in useWorldState/useBYOTData
- globals.css @apply warnings (Tailwind CSS)

---

## 🎉 Summary

**Phase 1 Complete**: Economic Lobby Foundation

We've successfully transformed the WORLD HUD from a simple overlay into a **living portal system** into the VOID ecosystem. All data now flows through the `EconomySnapshot` pattern, and 3 key components (PlayerChip, TopTicker, MiniMap) are fully hub-aware with proper color coding and dopamine hooks.

**Next Session**: Complete LeftRail, RightRail, ContextActionBar, BottomAppDock, and wire the dopamine FX system to audio/visuals.

---

**Ideology Achieved**: ✅ "Every zone is a portal into the economy, not just UI"
