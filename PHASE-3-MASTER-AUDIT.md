# 🔍 VOID PHASE-3 MASTER AUDIT - WINDOW & ICON STATUS

**Audit Date:** November 12, 2025  
**Auditor:** VOID BUILDER v3.0  
**Scope:** All HUD windows, tabs, icons, and data flows

---

## 📊 CURRENT STATE SUMMARY

### ✅ WORKING (8 window types)
1. **WORLD_MAP** → CyberpunkCityMap ✅
2. **LAND_REGISTRY** → GlobalLandInventory ✅
3. **PROPERTY_MARKET** → PropertyMarketplace ✅
4. **ZONES** → PropertyMarketplace ✅
5. **DEFI_OVERVIEW** → GlobalLandInventory ✅
6. **VAULT_DETAIL** → GlobalLandInventory ✅
7. **MULTI_TAB** → MultiTabWindow (wallet/swap/land/creator/dao/ai/missions/analytics/inventory/settings) ✅
8. **MUSIC** → MusicJukebox ✅
9. **WALLET** → MultiTabWindow (wallet tab) ✅
10. **AGENCY_BOARD** → AgencyBoardWindow ✅
11. **GUILDS** → GuildsWindow ✅

### 🟡 PLACEHOLDER / BLANK (26 window types)
These show "Window content coming soon..." fallback:

**CREATOR HUB (3):**
- CREATOR_HUB
- DROP_DETAIL

**DAO (2):**
- DAO_CONSOLE
- PROPOSAL_DETAIL

**AGENCY (1):**
- JOB_DETAIL (gig detail modal)

**AI OPS (3):**
- AI_OPS_CONSOLE
- AI_OPS_PANEL
- AI_CONSOLE

**SOCIAL (3):**
- FRIENDS
- PHONE
- VOICE_CHAT
- GLOBAL_CHAT
- PLAYER_PROFILE (🚨 **CRITICAL - Profile Passport missing**)

**ARCADE (3):**
- ACHIEVEMENTS
- GAMES
- MINIGAMES

**WORLD (2):**
- ZONE_BROWSER
- MISSION_DETAIL

**META (1):**
- HUB_SELECTOR
- VOID_HUB

---

## 🎯 PRIORITY 1 - CRITICAL MISSING FEATURES

### 1. PROFILE PASSPORT (PLAYER_PROFILE) 🚨
**Status:** ❌ Not implemented  
**Window Type:** `PLAYER_PROFILE`  
**Required Components:**
- Avatar/PFP display
- Wallet address (short form)
- Bio text
- Current tier display
- XP progress bar
- Lifetime score
- Current score
- Achievement badges (grid)
- Linked socials (Discord, Twitter, Farcaster icons)
- Joined guilds (list)
- Recent activity feed
- Edit Profile button
- Customize Avatar button (stub)
- View Achievements button

**Mock Data Structure:**
```typescript
interface UserProfile {
  address: string;
  username?: string;
  bio?: string;
  avatar?: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'S_TIER';
  currentScore: number;
  lifetimeScore: number;
  xp: number;
  level: number;
  xpToNext: number;
  achievements: { id: string; name: string; icon: string; unlocked: boolean }[];
  badges: { id: string; name: string; icon: string }[];
  linkedSocials: { platform: string; username: string; verified: boolean }[];
  guilds: { id: string; name: string; role: string }[];
  recentActivity: { type: string; timestamp: number; description: string }[];
}
```

**UI Sections:**
```
┌──────────────────────────────────────────────┐
│  SOCIAL · PROFILE                        [X] │
├──────────────────────────────────────────────┤
│  ┌───┐  0x1234...5678                        │
│  │ 👤 │  @username                            │
│  └───┘  Bio text here...                     │
│                                              │
│  ┌─────────────────────────────────────────┐│
│  │ TIER: GOLD ⭐ · Level 12                ││
│  │ ━━━━━━━━━━━━━━━━━━━━ 78% to Silver     ││
│  │ Current Score: 327 · Lifetime: 8,942   ││
│  └─────────────────────────────────────────┘│
│                                              │
│  ACHIEVEMENTS (12/50)                        │
│  [🎯] [🏆] [⚡] [🔥] [💎] [🌟] ...          │
│                                              │
│  BADGES (4)                                  │
│  [OG] [ALPHA] [BUILDER] [WHALE]             │
│                                              │
│  LINKED SOCIALS                              │
│  🐦 @username · ✅ Verified                  │
│  🎮 username#1234 · ✅ Verified              │
│                                              │
│  GUILDS (2)                                  │
│  🛡️ Void Architects · Member                │
│  🛡️ PSX Whales · Admin                       │
│                                              │
│  RECENT ACTIVITY                             │
│  • Staked 500 VOID (2h ago)                 │
│  • Joined guild "Alpha Builders" (1d ago)   │
│  • Completed gig "3D Design" (3d ago)       │
│                                              │
│  [Edit Profile] [Customize Avatar]          │
└──────────────────────────────────────────────┘
```

---

### 2. MESSAGING SYSTEM 🚨
**Status:** ❌ Not implemented  
**Window Types:** `GLOBAL_CHAT`, `PHONE` (DMs)

**Required Components:**

**A. Global Chat Window**
- Message list (infinite scroll)
- Message composer (input + send button)
- User display (avatar + username + tier badge)
- Timestamp
- Anti-spam UI (rate limit warnings)
- Optimistic message send
- Net Protocol event listener (future)

**B. Zone Chat** (auto-switching)
- Same as global, but filtered by zone
- Header shows current zone name
- Auto-switches when player moves zones

**C. DM System (PHONE window)**
- Conversation list (left panel)
- Active conversation (right panel)
- Typing indicators
- 1:1 messaging
- Mutual follow requirement check
- Tier ≥ X requirement check (configurable)
- "Cannot DM" tooltip when requirements not met

**Mock Data Structure:**
```typescript
interface ChatMessage {
  id: string;
  from: string; // address
  username?: string;
  avatar?: string;
  tier: string;
  message: string;
  timestamp: number;
  channel: 'global' | 'zone' | 'dm';
  zoneId?: string;
}

interface DMConversation {
  withAddress: string;
  username?: string;
  avatar?: string;
  lastMessage: string;
  timestamp: number;
  unread: number;
  canReply: boolean; // based on mutual follow / tier
}
```

**Anti-Spam Logic:**
```typescript
// Daily caps (from ANTI_SPAM_SPEC.md)
const DAILY_CAPS = {
  global: 50,
  zone: 40,
  dm: 20
};

// UI states:
// - Show remaining messages: "38/50 global messages today"
// - Disable send button when capped
// - Show toast: "Daily message cap reached (50/50 global)"
// - Reset at midnight UTC
```

**UI Layout (Global Chat):**
```
┌──────────────────────────────────────────────┐
│  COMMS · GLOBAL CHAT                     [X] │
├──────────────────────────────────────────────┤
│  Messages today: 12/50                       │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ 👤 @alice (Gold) · 2m ago              │ │
│  │ Hey everyone! Check out my new drop   │ │
│  │                                        │ │
│  │ 👤 @bob (Silver) · 5m ago             │ │
│  │ Anyone want to run a gig?              │ │
│  │                                        │ │
│  │ 👤 @charlie (S-tier) · 10m ago        │ │
│  │ Just staked 10k VOID!                  │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ Type message...                [Send]  │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**UI Layout (DM / PHONE):**
```
┌──────────────────────────────────────────────┐
│  COMMS · PHONE                           [X] │
├───────────────────┬──────────────────────────┤
│ CONVERSATIONS (3) │ @alice (Gold)            │
│                   │                          │
│ 👤 @alice (Gold)  │ ┌────────────────────┐  │
│ Hey, wanna colab? │ │ You: Sure! When?  │  │
│ 2m ago  [1]       │ │ 5m ago             │  │
│                   │ │                    │  │
│ 👤 @bob (Silver) │ │ Alice: Tomorrow?   │  │
│ Thanks for the... │ │ 2m ago             │  │
│ 1h ago            │ └────────────────────┘  │
│                   │                          │
│ 👤 @charlie ⚠️    │ ┌────────────────────┐  │
│ Cannot DM (tier)  │ │ Type message... [→]│  │
│ 3d ago            │ └────────────────────┘  │
└───────────────────┴──────────────────────────┘
```

---

### 3. GIG DETAIL MODAL (JOB_DETAIL) 🚨
**Status:** ❌ Not implemented  
**Window Type:** `JOB_DETAIL`  
**Triggered From:** AgencyBoardWindow → click gig card

**Required Components:**
- Full gig description
- Requirements list (tier, XP, skills)
- Rewards breakdown (SIGNAL, XP, PSX)
- Estimated time
- Difficulty indicator
- Agency info
- District location
- Apply button (or "Join Squad" if squad-based)
- Back button

**Mock Data Structure:**
```typescript
interface GigDetail {
  id: string;
  title: string;
  agency: {
    name: string;
    address: string;
    verified: boolean;
  };
  district: string;
  description: string;
  requirements: {
    tier?: string;
    minXP?: number;
    skills?: string[];
  };
  rewards: {
    signal: number;
    xp: number;
    psxStake: number;
  };
  estimatedTime: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  slots: { filled: number; total: number };
  status: 'OPEN' | 'IN_PROGRESS' | 'FILLED';
}
```

**UI Layout:**
```
┌──────────────────────────────────────────────┐
│  AGENCY · GIG DETAIL                     [X] │
├──────────────────────────────────────────────┤
│  3D Environment Designer                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                              │
│  VOID Studios · ✅ Verified                  │
│  Creator Zone · 🔴 HARD                      │
│  Slots: 2/5 filled                           │
│                                              │
│  DESCRIPTION                                 │
│  We need a skilled 3D artist to create       │
│  cyberpunk environments for our new zone...  │
│                                              │
│  REQUIREMENTS                                │
│  • Tier: Silver or higher                    │
│  • Min XP: 5,000                             │
│  • Skills: Blender, Unity                    │
│                                              │
│  REWARDS                                     │
│  💰 1,500 SIGNAL                             │
│  ⭐ 500 XP                                    │
│  🔷 5,000 PSX stake required                 │
│                                              │
│  ESTIMATED TIME: 2-3 weeks                   │
│                                              │
│  [← Back] [Apply to Gig] [Join Squad]       │
└──────────────────────────────────────────────┘
```

---

### 4. DAO CONSOLE & PROPOSAL DETAIL 🟡
**Status:** ❌ Not implemented  
**Window Types:** `DAO_CONSOLE`, `PROPOSAL_DETAIL`

**DAO Console (Main View):**
- Active proposals list
- Voting power display (from PSX balance)
- Filter by status (Active/Passed/Rejected)
- Create Proposal button (stub)

**Proposal Detail:**
- Proposal title
- Description
- Proposer info
- Vote count (For/Against/Abstain)
- Voting deadline
- User's vote status
- Vote buttons (For/Against/Abstain)
- Quorum progress bar

**Mock Data Structure:**
```typescript
interface DAOProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  created: number;
  deadline: number;
  status: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED';
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
  quorum: number;
  userVote?: 'FOR' | 'AGAINST' | 'ABSTAIN';
}
```

---

### 5. FRIENDS WINDOW 🟡
**Status:** ❌ Not implemented  
**Window Type:** `FRIENDS`

**Required Sections:**
- Online friends (green dot)
- Offline friends (gray dot)
- Pending requests
- Search/add friend
- Friend actions (DM, Teleport, View Profile, Remove)

**Mock Data Structure:**
```typescript
interface Friend {
  address: string;
  username?: string;
  avatar?: string;
  online: boolean;
  zone?: string;
  coordinates?: { x: number; z: number };
  tier: string;
  mutualGuilds: number;
}
```

---

### 6. VOICE CHAT WINDOW 🟡
**Status:** ❌ Not implemented  
**Window Type:** `VOICE_CHAT`

**Required UI:**
- Active voice channels list
- Current channel participants
- Mute/Unmute button
- Volume slider
- Leave channel button
- Join channel button

---

### 7. HUB SELECTOR 🟡
**Status:** ❌ Not implemented  
**Window Type:** `HUB_SELECTOR`

**Required UI:**
- 6 hub mode cards (WORLD, CREATOR, DEFI, DAO, AGENCY, AI_OPS)
- Current hub highlighted
- Click to switch hub
- Shows hub description + icon

---

## 🎨 BOTTOM ICON BAR - COMPLETE AUDIT

**Total Icons:** 16  
**Working:** 11 ✅  
**Placeholder/Missing:** 5 🟡

### ✅ WORKING ICONS
1. **Music** → MUSIC window → MusicJukebox ✅
2. **Map** → WORLD_MAP → CyberpunkCityMap ✅
3. **Land** → LAND_REGISTRY → GlobalLandInventory ✅
4. **Market** → PROPERTY_MARKET → PropertyMarketplace ✅
5. **Zones** → ZONE_BROWSER → (placeholder but opens)
6. **Wallet** → MULTI_TAB (wallet tab) ✅
7. **Vault** → MULTI_TAB (swap tab) ✅
8. **DAO** → DAO_CONSOLE → (placeholder but opens)
9. **Agency** → AGENCY_BOARD → AgencyBoardWindow ✅
10. **AI** → AI_OPS_PANEL → (placeholder but opens)
11. **Hub** → HUB_SELECTOR → (placeholder but opens)
12. **Guilds** → GUILDS → GuildsWindow ✅

### 🟡 PLACEHOLDER (opens but blank)
13. **Phone** → PHONE → ❌ Needs DM system
14. **Friends** → FRIENDS → ❌ Needs friends list UI
15. **Voice** → VOICE_CHAT → ❌ Needs voice UI
16. **Games** → MINIGAMES → ❌ Needs arcade UI

---

## 📋 TOP TABS AUDIT

**Total Tabs:** 10 (in MultiTabWindow)  
**Working:** 10 ✅ (all open real content)

1. **WALLET** → WalletTab ✅ (VOID/xVOID balances, staking)
2. **SWAP** → SwapTab ✅ (token swap UI)
3. **LAND** → LandTab ✅ (land management)
4. **CREATOR** → CreatorTab ✅ (creator tools)
5. **DAO** → DAOTab ✅ (governance)
6. **AI** → AITab ✅ (AI tools)
7. **MISSIONS** → MissionsTab ✅ (quest system)
8. **ANALYTICS** → AnalyticsTab ✅ (stats)
9. **INVENTORY** → InventoryTab ✅ (items)
10. **SETTINGS** → SettingsTab ✅ (config)

**Note:** All MultiTabWindow tabs exist and render content (some with placeholder data).

---

## 🔴 CRITICAL GAPS - PRIORITY ORDER

### PRIORITY 1 (Must Implement for Phase-3)
1. **PLAYER_PROFILE** (Profile Passport) - Core identity UI
2. **PHONE** (DM System) - Core communication
3. **GLOBAL_CHAT** - Core communication
4. **JOB_DETAIL** (Gig Detail Modal) - Completes Agency flow

### PRIORITY 2 (Should Implement for Phase-3)
5. **FRIENDS** - Core social feature
6. **DAO_CONSOLE** + **PROPOSAL_DETAIL** - Governance UI
7. **HUB_SELECTOR** - Hub switching UI

### PRIORITY 3 (Nice-to-Have for Phase-3)
8. **VOICE_CHAT** - Advanced social
9. **CREATOR_HUB** + **DROP_DETAIL** - Creator tools
10. **AI_OPS_CONSOLE** + **AI_OPS_PANEL** - Advanced tools
11. **ACHIEVEMENTS** - Gamification UI
12. **MINIGAMES** / **GAMES** - Entertainment

---

## 🔌 DATA FLOW AUDIT

### ✅ WORKING DATA FLOWS
1. **Wallet → HUD Strip**
   - `useAccount()` → `address`
   - `useVoidVault()` → `positions` → VOID staked
   - `useVotingPower()` → `psxHeld` → PSX balance
   - Flow: Contract → Hook → economySnapshot → HubEconomyStrip ✅

2. **Wallet → WalletTab**
   - `useReadContract()` → VOID balance
   - `useReadContract()` → xVOID balance
   - `useReadContract()` → claimable rewards
   - `useReadContract()` → APR boost from XPOracle
   - Flow: Contract → useReadContract → WalletTab UI ✅

3. **Land → PropertyMarketplace**
   - `useLandMap()` → districts, parcels
   - Flow: Hook → PropertyMarketplace ✅

### 🟡 MOCK DATA FLOWS (Not Yet Wired)
4. **Agency → GigBoard**
   - Currently: `economySnapshot.agency` → MOCK_GIGS
   - TODO: `/api/agency/open-gigs` → real gigs

5. **Guilds → GuildsWindow**
   - Currently: MOCK_MY_GUILDS, MOCK_TRENDING_GUILDS
   - TODO: `/api/guilds/my-guilds`, `/api/guilds/trending`

6. **Price Data → HUD Strip**
   - Currently: Hardcoded `voidPrice: 0.0024`
   - TODO: CoinGecko API / Uniswap TWAP

### ❌ MISSING DATA FLOWS (Need Implementation)
7. **VoidScore → UI**
   - Need: `useVoidScore(address)` hook
   - Returns: `{ currentScore, lifetimeScore, tier, xpToNext }`
   - Used in: Profile Passport, Wallet (APR boost), HUD strip

8. **Messaging → Chat Windows**
   - Need: `useGlobalChat()`, `useZoneChat()`, `useDMs()`
   - Need: Net Protocol event listener
   - Need: Message storage (IndexedDB? Local state?)

9. **Friends → Friends Window**
   - Need: `/api/friends/list`, `/api/friends/online`
   - Need: `useFriends()` hook

10. **DAO → DAO Console**
    - Need: `/api/dao/proposals`
    - Need: `useDAOProposals()` hook

---

## 🎯 IDENTITY LAYER VISIBILITY (VoidScore)

### Where VoidScore Should Appear:
1. **Profile Passport** (primary display)
   - Current Score (large, prominent)
   - Lifetime Score (secondary)
   - Tier badge (Bronze/Silver/Gold/S-tier)
   - XP progress bar to next tier
   - Tier perks list

2. **Wallet Window** (APR boost section)
   - "Your XP boost: +1.8% APR"
   - "Tier: Gold → 1.5x APR multiplier"

3. **Top HUD Strip** (compact preview)
   - "LVL 12 · Gold ⭐"
   - Or: "327 pts · Gold"

4. **Leaderboard** (future)
   - Top 100 by Current Score
   - Top 100 by Lifetime Score

### Required Hook:
```typescript
function useVoidScore(address: string) {
  // TODO: Wire to VoidScore.sol v2.0
  // For now: return mock data
  return {
    currentScore: 327,
    lifetimeScore: 8942,
    tier: 'GOLD',
    xpToNextTier: 273, // 600 - 327 = 273 to S-tier
    aprMultiplier: 1.5, // Gold tier = 1.5x
    dailyCapRemaining: {
      global: 38, // 50 - 12 used
      zone: 40,
      dm: 20
    }
  };
}
```

---

## ✅ NEXT ACTIONS (Execution Plan)

### Phase 3A - Critical Windows (Week 1)
- [ ] Create ProfilePassportWindow component
- [ ] Create GlobalChatWindow component
- [ ] Create PhoneWindow (DM system) component
- [ ] Create JobDetailWindow (gig detail modal)
- [ ] Wire all 4 to VoidHudApp routing

### Phase 3B - Secondary Windows (Week 2)
- [ ] Create FriendsWindow component
- [ ] Create DAOConsoleWindow component
- [ ] Create ProposalDetailWindow component
- [ ] Create HubSelectorWindow component

### Phase 3C - Data Integration (Week 2-3)
- [ ] Create useVoidScore() hook (with mock data + TODO)
- [ ] Create useGlobalChat() hook
- [ ] Create useDMs() hook
- [ ] Create useFriends() hook
- [ ] Create useDAOProposals() hook
- [ ] Wire VoidScore display to Profile Passport + Wallet + HUD strip

### Phase 3D - Polish (Week 3-4)
- [ ] Add loading skeletons to all windows
- [ ] Add error boundaries
- [ ] Add optimistic UI updates
- [ ] Add toast notifications for all actions
- [ ] Add keyboard shortcuts
- [ ] Add accessibility (ARIA labels)

### Phase 3E - Testing (Week 4)
- [ ] UI logic check (all clicks work)
- [ ] Data flow check (all hooks wired)
- [ ] Error handling check (all edge cases covered)
- [ ] Routing check (all entrypoints work)
- [ ] Performance check (no lag, smooth 60fps)
- [ ] Integration check (all TODOs documented)

---

## 📦 FILES TO CREATE

### New Window Components (7 files)
1. `hud/world/windows/ProfilePassportWindow.tsx` (NEW)
2. `hud/world/windows/GlobalChatWindow.tsx` (NEW)
3. `hud/world/windows/PhoneWindow.tsx` (NEW)
4. `hud/world/windows/JobDetailWindow.tsx` (NEW)
5. `hud/world/windows/FriendsWindow.tsx` (NEW)
6. `hud/world/windows/DAOConsoleWindow.tsx` (NEW)
7. `hud/world/windows/ProposalDetailWindow.tsx` (NEW)
8. `hud/world/windows/HubSelectorWindow.tsx` (NEW)

### New Hooks (5 files)
9. `hooks/useVoidScore.ts` (NEW)
10. `hooks/useGlobalChat.ts` (NEW)
11. `hooks/useDMs.ts` (NEW)
12. `hooks/useFriends.ts` (NEW)
13. `hooks/useDAOProposals.ts` (NEW)

### Updated Files (2 files)
14. `hud/VoidHudApp.tsx` (UPDATE - add routing for 8 new windows)
15. `hud/windowTypes.ts` (UPDATE - add missing window labels if needed)

---

**Audit Complete. Ready to begin Phase-3 implementation.**

**Recommendation:** Start with ProfilePassportWindow (most critical), then messaging (GlobalChat + Phone), then JobDetailWindow.
