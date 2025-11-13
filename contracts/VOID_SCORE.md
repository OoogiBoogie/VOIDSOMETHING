# Void Score System - Production Specification

**Version:** 2.0  
**Contract:** VoidScore.sol  
**Last Updated:** November 12, 2025  
**Status:** Production-Ready with Time Decay + Dual-Score Tracking

## Overview

VoidScore is the reputation and economic scoring system for The Void metaverse. It tracks user activity, rewards engagement, and creates a tier-based hierarchy that unlocks privileges, airdrops, and economic opportunities.

**Key Features:**
- **Dual-Score Model:** LifetimeScore (permanent) + CurrentScore (decaying)
- **Time-Decay Mechanism:** Rewards sustained engagement over one-time farming
- **Sybil-Resistant:** Asset footprint weighting + cluster analysis
- **Future-Proof:** Token multiplier hooks + upgradable tier thresholds
- **Auditable:** Versioned formula with explicit parameters

---

## Scoring Formula (Version 2.0)

### Core Formula

```typescript
// Daily score calculation
score_today = 
  clamp(global_count, 0, GLOBAL_CAP) * W_GLOBAL +
  clamp(zone_count, 0, ZONE_CAP) * W_ZONE +
  clamp(dm_count, 0, DM_CAP) * W_DM +
  identity_bonuses +
  token_multiplier_bonus

// Current score with time decay
current_score(day_t) = 
  current_score(day_t-1) * DECAY_RATE + score_today

// Lifetime score (never decreases)
lifetime_score(day_t) = 
  lifetime_score(day_t-1) + score_today
```

### Tunable Parameters (v2.0)

| Parameter | Symbol | Value | Rationale |
|-----------|--------|-------|-----------|
| **Base Weights** | | | |
| Global weight | `W_GLOBAL` | 1 | Low-effort, public chat |
| Zone weight | `W_ZONE` | 2 | Medium-effort, community focus |
| DM weight | `W_DM` | 3 | High-effort, relationship building |
| **Daily Caps (per user, per type)** | | | |
| Global cap | `GLOBAL_CAP` | 50 msgs | Max 50 pts/day |
| Zone cap | `ZONE_CAP` | 40 msgs | Max 80 pts/day |
| DM cap | `DM_CAP` | 20 msgs | Max 60 pts/day |
| **Time Decay** | | | |
| Current score decay | `DECAY_RATE` | 0.98 | 2% daily decay |
| **Identity Bonuses** | | | |
| Has profile | | +100 | One-time |
| Has settings | | +50 | One-time |
| **Token Multipliers (Future)** | | | |
| VOID holder (1000+) | | 1.1x | 10% boost |
| VOID holder (10000+) | | 1.5x | 50% boost |
| PSX holder (5000+) | | 1.2x | 20% boost |

**Parameter Versioning:**
- Current version: **v2.0** (November 12, 2025)
- Previous version: v1.0 (no decay, simpler caps)
- Breaking changes: Added CurrentScore, time decay, revised zone cap
- Migration: Existing scores mapped to LifetimeScore, CurrentScore initialized

---

## Dual-Score Model

### 1. LifetimeScore (Permanent Reputation)

**Purpose:** Recognize long-term contribution, never decreases

**Behavior:**
- Monotonically increasing
- All-time achievement tracking
- Used for: OG badges, Founder status, historical airdrops
- Formula: `lifetime_score += score_today`

**Example:**
```
Day 1:  User earns 100 points → LifetimeScore = 100
Day 2:  User earns 50 points  → LifetimeScore = 150
Day 30: User earns 0 points   → LifetimeScore = 150 (unchanged)
Day 60: User returns, earns 200 → LifetimeScore = 350
```

### 2. CurrentScore (Active Engagement)

**Purpose:** Reward sustained activity, prevent inactive users from dominating

**Behavior:**
- Decays daily by `DECAY_RATE` (default 0.98 = 2% daily decay)
- Replenished by daily activity
- Used for: Current tier, active airdrops, leaderboards, access control
- Formula: `current_score = current_score * 0.98 + score_today`

**Example (with 2% daily decay):**
```
Day 1:  User earns 100 points → CurrentScore = 100
Day 2:  User earns 50 points  → CurrentScore = 100*0.98 + 50 = 148
Day 3:  User earns 0 points   → CurrentScore = 148*0.98 = 145.04
Day 10: User inactive (7 days)→ CurrentScore = 145.04*(0.98^7) = 127
Day 30: User returns, earns 200 → CurrentScore = 127*(0.98^20) + 200 = 285
```

**Steady State:**
- User earning 100 pts/day reaches equilibrium: `current_score ≈ 100/0.02 = 5000`
- User earning 50 pts/day reaches: `current_score ≈ 2500`
- User earning 200 pts/day reaches: `current_score ≈ 10000`

**Half-Life:**
- At 2% decay, CurrentScore halves every ~35 days of inactivity
- This ensures active users stay competitive vs inactive whales

---

## Message Activity Points

Users earn points for sending messages, with different weights per message type:

| Message Type | Points | Daily Cap | Max Daily Points | Cooldown |
|--------------|--------|-----------|------------------|----------|
| Global Chat  | +1     | 50        | 50               | 5 sec    |
| Zone Chat    | +2     | 40        | 80               | 3 sec    |
| Direct Message | +3   | 20        | 60               | 2 sec    |

**Total Max Daily Score from Messages:** 190 points (50+80+60)

**Daily Cap Behavior:**
- Caps reset at midnight UTC (Unix timestamp / 86400)
- Attempts to exceed cap revert with `DailyCapReached` error
- Users can check remaining quota with `getRemainingDailyQuota(user, messageType)`
- **Revised from v1.0:** Zone cap reduced from 100→40 to prevent zone-only farming

**Example:**
- User sends 50 global messages → earns 50 points (hits cap)
- User sends 40 zone messages → earns 80 points (hits cap)
- User sends 20 DMs → earns 60 points (hits cap)
- **Daily Total (MaxEffort):** 50 + 80 + 60 = **190 points**

**Realistic Daily Average:**
- Casual user: ~50 points/day (mix of 20 global, 10 zone, 5 DM)
- Active user: ~120 points/day (mix of 30 global, 30 zone, 10 DM)
- Power user: ~190 points/day (hitting all caps daily)

---

### Identity Completion Bonuses

One-time bonuses awarded when users complete their Void identity:

| Action | Points | Claimable Once |
|--------|--------|----------------|
| Set Profile | +100 | ✅ Yes |
| Configure Messaging Settings | +50 | ✅ Yes |

**How to Claim:**
1. **Profile Bonus:**
   - Call `VoidStorage.setProfile(profileJson)`
   - Call `VoidScore.claimProfileBonus()`
   - Contract verifies profile exists before awarding points

2. **Settings Bonus:**
   - Call `VoidStorage.setMessagingSettings(settingsJson)`
   - Call `VoidScore.claimSettingsBonus()`
   - Contract verifies settings exist before awarding points

**Example Profile JSON:**
```json
{
  "avatarId": "void-avatar-123",
  "displayName": "VoidExplorer",
  "bio": "Metaverse builder and DeFi enthusiast",
  "links": ["https://twitter.com/voidexplorer", "https://github.com/voidbuilder"]
}
```

**Example Settings JSON:**
```json
{
  "notifications": true,
  "notifyOnDM": true,
  "notifyOnMention": false,
  "mutedUsers": [],
  "dmPrivacy": "everyone",
  "showOnlineStatus": true
}
```

---

## Tier System (Based on CurrentScore)

Users are assigned tiers based on their **CurrentScore** (not LifetimeScore):

| Tier | Name | Min CurrentScore | Color | Benefits |
|------|------|------------------|-------|----------|
| 0 | None | 0 | #808080 | Basic access |
| 1 | Bronze | 100 | #CD7F32 | Profile complete, 5% fee discount |
| 2 | Silver | 250 | #C0C0C0 | Active contributor, 15% fee discount |
| 3 | Gold | 600 | #FFD700 | Power user, 50% fee discount, priority support |
| 4 | S-tier | 1,500 | #FF4500 | Elite status, free fees, exclusive zones |

**Tier Thresholds Rationale:**

| Tier | CurrentScore | Days to Reach (Casual) | Days to Reach (Active) | Days to Reach (Power) |
|------|--------------|------------------------|------------------------|-----------------------|
| Bronze | 100 | 2 days (50pts/day) | 1 day (120pts/day) | 1 day (190pts/day) |
| Silver | 250 | 5-6 days | 2-3 days | 2 days |
| Gold | 600 | 12-14 days | 5-6 days | 4 days |
| S-tier | 1,500 | 30+ days sustained | 15-20 days sustained | 10-12 days sustained |

**Notes:**
- Thresholds lowered from v1.0 to account for time decay
- S-tier requires **sustained daily activity** due to decay
- Inactive users will drop tiers over time (encouraging retention)

**LifetimeScore Badges (Separate from Tiers):**

Users also earn permanent badges based on LifetimeScore milestones:

| Badge | LifetimeScore | Visual |
|-------|---------------|--------|
| OG | 1,000 | Special border |
| Alpha | 5,000 | Glowing icon |
| Founder | 10,000 | Unique animation |
| Legend | 50,000 | Hall of Fame |

---

### Tier Calculation (v2.0)

The tier is automatically calculated from the user's **CurrentScore**:

```solidity
// Updated for v2.0 with lowered thresholds
function _calculateTier(uint256 currentScore) internal pure returns (uint8) {
    if (currentScore < 100) return 0;    // None
    if (currentScore < 250) return 1;    // Bronze
    if (currentScore < 600) return 2;    // Silver
    if (currentScore < 1500) return 3;   // Gold
    return 4;                             // S-tier
}
```

**Contract Storage:**
```solidity
mapping(address => uint256) public currentScores;  // Decaying score
mapping(address => uint256) public lifetimeScores; // Permanent score
mapping(address => uint256) public lastActivityDay; // For decay calculation
```

### Tier Progression Example (v2.0 with Decay)

**Day 1:**
- User sets profile → +100 to both scores
- User sets settings → +50 to both scores
- User sends 20 global messages → +20 points
- **CurrentScore: 170, LifetimeScore: 170** → **Bronze tier**

**Day 2:**
- CurrentScore decays: 170 * 0.98 = 166.6
- User sends 50 global, 20 zone, 10 DM → +140 points
- **CurrentScore: 306.6, LifetimeScore: 310** → **Silver tier**

**Day 7 (sustained activity at 140pts/day):**
- CurrentScore approaches steady state: ~7,000 (decay equilibrium)
- LifetimeScore: 310 + (140 * 5) = 1,010
- **CurrentScore: ~1,200, LifetimeScore: 1,010** → **Gold tier** (from CurrentScore)

**Day 30 (sustained activity):**
- CurrentScore: ~7,000 (equilibrium maintained)
- LifetimeScore: 1,010 + (140 * 23) = 4,230
- **CurrentScore: ~7,000, LifetimeScore: 4,230** → **S-tier** (from CurrentScore)

**Day 40 (user stops for 10 days):**
- CurrentScore decays: 7,000 * (0.98^10) = 5,733
- LifetimeScore: 4,230 (unchanged)
- **CurrentScore: 5,733** → **Still S-tier** (buffer before drop)

**Day 60 (still inactive, 20 days decay):**
- CurrentScore decays: 7,000 * (0.98^30) = 3,841
- LifetimeScore: 4,230 (unchanged)
- **CurrentScore: 3,841** → **Still S-tier** (slowly approaching Gold threshold)

---

## Sybil Resistance & Asset Footprint Weighting

**Challenge:** Prevent multi-account farming and bot manipulation.

**Solution:** Combine on-chain signals with off-chain scoring adjustments.

### On-Chain Signals (Always Enforced)

1. **Gas Economics:**
   - Each message costs ~$0.10 (L2) or ~$10 (mainnet)
   - Daily maximum farming: 190 pts × $0.10 = $19/day cost
   - To reach S-tier (1,500 pts sustained): Requires ~$190+ in gas over 10-20 days
   - Makes pure bot farming uneconomical

2. **Time Decay:**
   - CurrentScore requires sustained activity
   - Multi-account farmers must maintain all accounts daily
   - Cost multiplies linearly with number of accounts

3. **Profile Bonuses:**
   - One-time only (no repeat farming)
   - Requires unique profile data (reputation risk)

### Off-Chain Score Adjustments (Indexer/Backend)

**Applied to final CurrentScore calculation before displaying in UI or using for airdrops.**

#### 1. Asset Footprint Multiplier

```typescript
function getAssetFootprintMultiplier(address: string): number {
  const voidBalance = await voidToken.balanceOf(address);
  const psxBalance = await psxToken.balanceOf(address);
  const nftCount = await nftRegistry.countNFTs(address);
  const txHistory = await getTransactionCount(address);
  
  let multiplier = 1.0;
  
  // VOID token holders
  if (voidBalance >= 10000 * 1e18) multiplier += 0.5;  // +50%
  else if (voidBalance >= 1000 * 1e18) multiplier += 0.1;  // +10%
  
  // PSX token holders
  if (psxBalance >= 5000 * 1e18) multiplier += 0.2;  // +20%
  
  // NFT holders
  if (nftCount >= 10) multiplier += 0.1;  // +10%
  else if (nftCount >= 1) multiplier += 0.05;  // +5%
  
  // Transaction history (not a fresh wallet)
  if (txHistory >= 100) multiplier += 0.05;  // +5%
  
  return multiplier;
}
```

#### 2. Fresh Wallet Penalty

```typescript
function getFreshWalletPenalty(address: string): number {
  const accountAge = Date.now() - await getAccountCreationTime(address);
  const txCount = await getTransactionCount(address);
  
  // Fresh wallets (<7 days old, <10 txs) get heavily discounted
  if (accountAge < 7 * 86400 && txCount < 10) {
    return 0.5;  // 50% penalty
  }
  
  // New wallets (<30 days, <50 txs) get minor discount
  if (accountAge < 30 * 86400 && txCount < 50) {
    return 0.8;  // 20% penalty
  }
  
  return 1.0;  // No penalty
}
```

#### 3. Cluster Analysis (Anti-Sybil)

```typescript
async function getClusterPenalty(address: string): Promise<number> {
  // Check if address is part of a suspected Sybil cluster
  const cluster = await detectCluster(address);
  
  if (!cluster) return 1.0;
  
  // Cluster detection signals:
  // - Created within same time window
  // - Only interact with each other
  // - Identical behavior patterns
  // - Funded from same source wallet
  
  if (cluster.confidence > 0.9) {
    return 0.1;  // 90% penalty for high-confidence Sybil
  }
  
  if (cluster.confidence > 0.7) {
    return 0.5;  // 50% penalty for medium confidence
  }
  
  return 0.8;  // 20% penalty for low confidence
}
```

#### 4. Final Adjusted Score

```typescript
async function getAdjustedCurrentScore(address: string): Promise<number> {
  const rawScore = await voidScore.getCurrentScore(address);
  
  const assetMultiplier = await getAssetFootprintMultiplier(address);
  const freshPenalty = await getFreshWalletPenalty(address);
  const clusterPenalty = await getClusterPenalty(address);
  
  const adjustedScore = rawScore * assetMultiplier * freshPenalty * clusterPenalty;
  
  return Math.floor(adjustedScore);
}
```

**Example:**
```
Raw CurrentScore: 1,000

Scenario A (Legitimate Power User):
- VOID balance: 15,000 → +50% multiplier = 1.5x
- Account age: 2 years, 500+ txs → no penalty
- Not in cluster → no penalty
- Adjusted Score: 1,000 * 1.5 * 1.0 * 1.0 = 1,500 → S-tier

Scenario B (Suspected Sybil Bot):
- VOID balance: 0 → 1.0x multiplier
- Account age: 3 days, 5 txs → 50% penalty = 0.5x
- In Sybil cluster (90% confidence) → 10% weight = 0.1x
- Adjusted Score: 1,000 * 1.0 * 0.5 * 0.1 = 50 → Bronze tier (from S-tier!)
```

---

## Token Multiplier Hooks (Future Phase 2)

**Status:** Not yet active, but contract has hooks ready.

### VOID Token Multipliers

```solidity
// Future implementation in VoidScore.sol
function getVoidMultiplier(address user) internal view returns (uint256) {
    uint256 balance = voidToken.balanceOf(user);
    
    if (balance >= 10000 ether) return 150;  // 1.5x
    if (balance >= 1000 ether) return 110;   // 1.1x
    return 100;  // 1.0x (no multiplier)
}

function recordMessage(address user, uint8 messageType) external {
    // ... existing logic ...
    uint256 basePoints = getBasePoints(messageType);
    uint256 multiplier = getVoidMultiplier(user);
    uint256 finalPoints = (basePoints * multiplier) / 100;
    
    currentScores[user] += finalPoints;
    lifetimeScores[user] += finalPoints;
    // ...
}
```

### PSX Token Multipliers

```solidity
function getPSXMultiplier(address user) internal view returns (uint256) {
    uint256 balance = psxToken.balanceOf(user);
    
    if (balance >= 5000 ether) return 120;  // 1.2x
    return 100;  // 1.0x
}
```

### Staked VOID for Unlimited Messaging

```solidity
mapping(address => uint256) public stakedVoid;

function stakeForPremium(uint256 amount) external {
    voidToken.transferFrom(msg.sender, address(this), amount);
    stakedVoid[msg.sender] += amount;
}

function getMaxDailyMessages(address user, uint8 msgType) internal view returns (uint256) {
    // If user stakes 1000+ VOID, increase limits
    if (stakedVoid[user] >= 1000 ether) {
        return DAILY_CAPS[msgType] * 2;  // 2x daily cap
    }
    return DAILY_CAPS[msgType];
}
```

**Activation Timeline:**
- Phase 1 (Current): No token multipliers
- Phase 2 (Q1 2026): VOID multipliers activated
- Phase 3 (Q2 2026): PSX multipliers + staking features

---

## Contract Functions

### Core Scoring Functions

#### `recordMessage(address user, uint8 messageType)`

Records a message sent by the user and updates their score.

**Parameters:**
- `user` - Address of the user who sent the message
- `messageType` - 0=global, 1=DM, 2=zone

**Reverts:**
- `InvalidMessageType()` - If messageType > 2
- `DailyCapReached(messageType, cap)` - If user exceeded daily quota

**Events Emitted:**
- `ScoreUpdated(user, newScore, reason, pointsAdded)`
- `TierReached(user, tier, score)` - If tier increased

**Example:**
```solidity
// After user sends a global message
voidScore.recordMessage(msg.sender, 0);
```

#### `claimProfileBonus()`

Claims the one-time +100 point bonus for setting a profile.

**Reverts:**
- `"Profile not set"` - If user hasn't called `VoidStorage.setProfile()`

**Example:**
```solidity
// User sets profile
voidStorage.setProfile('{"avatarId":"123","displayName":"Alice"}');

// User claims bonus
voidScore.claimProfileBonus();
```

#### `claimSettingsBonus()`

Claims the one-time +50 point bonus for configuring messaging settings.

**Reverts:**
- `"Settings not configured"` - If user hasn't called `VoidStorage.setMessagingSettings()`

**Example:**
```solidity
// User sets settings
voidStorage.setMessagingSettings('{"notifications":true,"dmPrivacy":"everyone"}');

// User claims bonus
voidScore.claimSettingsBonus();
```

---

### View Functions

#### `getScore(address user) → uint256`

Returns the user's total score.

**Example:**
```solidity
uint256 score = voidScore.getScore(0x1234...);
// score = 1250
```

#### `getTier(address user) → uint8`

Returns the user's current tier (0-4).

**Example:**
```solidity
uint8 tier = voidScore.getTier(0x1234...);
// tier = 2 (Silver)
```

#### `getDailyActivity(address user, uint256 day) → (uint256, uint256, uint256)`

Returns message counts for a specific day.

**Parameters:**
- `user` - User address
- `day` - Day index (block.timestamp / 86400)

**Returns:**
- `globalCount` - Global messages sent that day
- `dmCount` - DMs sent that day
- `zoneCount` - Zone messages sent that day

**Example:**
```solidity
uint256 today = block.timestamp / 86400;
(uint256 global, uint256 dm, uint256 zone) = voidScore.getDailyActivity(user, today);
// global = 30, dm = 15, zone = 50
```

#### `getTodayActivity(address user) → (uint256, uint256, uint256)`

Convenience function to get today's activity.

**Example:**
```solidity
(uint256 global, uint256 dm, uint256 zone) = voidScore.getTodayActivity(user);
```

#### `getRemainingDailyQuota(address user, uint8 messageType) → uint256`

Returns how many more messages the user can send today.

**Example:**
```solidity
uint256 remaining = voidScore.getRemainingDailyQuota(user, 0); // Global
// remaining = 20 (user sent 30 out of 50)
```

#### `getUserScoringData(address user)`

Returns comprehensive scoring data in one call.

**Returns:**
- `score` - Total score
- `tier` - Current tier (0-4)
- `profileBonusClaimed` - Has claimed profile bonus
- `settingsBonusClaimed` - Has claimed settings bonus
- `globalRemaining` - Global messages remaining today
- `dmRemaining` - DMs remaining today
- `zoneRemaining` - Zone messages remaining today

**Example:**
```solidity
(
  uint256 score,
  uint8 tier,
  bool profileBonus,
  bool settingsBonus,
  uint256 globalRem,
  uint256 dmRem,
  uint256 zoneRem
) = voidScore.getUserScoringData(user);
```

---

## Integration Patterns

### Pattern 1: VoidMessaging Calls VoidScore Directly

**Approach:** VoidMessaging automatically records messages in VoidScore.

**Pros:**
- Automatic score updates (no user action needed)
- Guaranteed consistency between messages and scores

**Cons:**
- Tight coupling between contracts
- Extra gas cost per message

**Implementation:**
```solidity
// In VoidMessaging.sol
VoidScore public immutable voidScore;

function sendGlobalMessage(string calldata text) external {
    // ... existing logic ...
    
    // Automatically record message
    voidScore.recordMessage(msg.sender, MESSAGE_TYPE_GLOBAL);
}
```

### Pattern 2: Off-Chain Indexing (Event-Driven)

**Approach:** Subgraph listens to `VoidMessageSent` events and updates score off-chain.

**Pros:**
- No extra gas cost for users
- Flexible scoring logic (can change without redeployment)

**Cons:**
- Scores not available on-chain
- Requires indexer infrastructure

**Implementation:**
```typescript
// In subgraph mapping
export function handleVoidMessageSent(event: VoidMessageSent): void {
  let user = User.load(event.params.from.toHexString());
  
  // Update off-chain score
  if (event.params.messageType == 0) {
    user.score = user.score.plus(BigInt.fromI32(1));
  } else if (event.params.messageType == 1) {
    user.score = user.score.plus(BigInt.fromI32(3));
  } // etc.
  
  user.save();
}
```

### Pattern 3: Hybrid (User-Triggered)

**Approach:** Users manually call `recordMessage()` after sending messages.

**Pros:**
- Flexible (users can choose when to update)
- Contracts remain loosely coupled

**Cons:**
- Users must remember to call `recordMessage()`
- Extra transaction cost

**Implementation:**
```solidity
// User flow
await messaging.sendGlobalMessage("Hello Void!");
await voidScore.recordMessage(userAddress, 0); // Extra transaction
```

**Recommended Pattern:** **Pattern 1** (auto-recording) for production simplicity and guaranteed consistency.

---

## Use Cases

### 1. Airdrop Weighting

Distribute tokens based on user tier:

```solidity
function calculateAirdrop(address user) public view returns (uint256) {
    uint8 tier = voidScore.getTier(user);
    
    if (tier == 0) return 0;          // None: no airdrop
    if (tier == 1) return 100 ether;  // Bronze: 100 tokens
    if (tier == 2) return 500 ether;  // Silver: 500 tokens
    if (tier == 3) return 2000 ether; // Gold: 2,000 tokens
    return 10000 ether;               // S-tier: 10,000 tokens
}
```

### 2. Access Gating

Restrict features to high-tier users:

```solidity
modifier onlyGoldOrHigher() {
    require(voidScore.getTier(msg.sender) >= 3, "Gold tier required");
    _;
}

function mintLegendaryNFT() external onlyGoldOrHigher {
    // Only Gold and S-tier users can mint
}
```

### 3. Dynamic Fee Discounts

Lower fees for higher-tier users:

```solidity
function getMintFee(address user) public view returns (uint256) {
    uint8 tier = voidScore.getTier(user);
    uint256 baseFee = 0.1 ether;
    
    if (tier == 0) return baseFee;              // None: full price
    if (tier == 1) return baseFee * 90 / 100;   // Bronze: 10% off
    if (tier == 2) return baseFee * 75 / 100;   // Silver: 25% off
    if (tier == 3) return baseFee * 50 / 100;   // Gold: 50% off
    return 0;                                    // S-tier: free
}
```

### 4. DAO Voting Power

Scale voting power by score:

```solidity
function getVotingPower(address user) public view returns (uint256) {
    uint256 score = voidScore.getScore(user);
    return score * 1e18; // 1 vote per score point
}
```

### 5. Leaderboards

Display top users by score:

```typescript
// Frontend query
const { data } = await subgraph.query(`
  query GetLeaderboard {
    users(orderBy: score, orderDirection: desc, first: 10) {
      id
      score
      tier
      messageCount
    }
  }
`);
```

---

## Future Extensibility

### Token-Based Multipliers

Boost points for VOID/PSX token holders:

```solidity
function recordMessage(address user, uint8 messageType) external {
    // ... existing logic ...
    
    // Apply multiplier if user holds tokens
    uint256 voidBalance = voidToken.balanceOf(user);
    uint256 multiplier = 1;
    
    if (voidBalance >= 10000 ether) {
        multiplier = 2; // 2x points for whales
    } else if (voidBalance >= 1000 ether) {
        multiplier = 1.5; // 1.5x for holders
    }
    
    points = points * multiplier;
    scores[user] += points;
}
```

### NFT Ownership Bonuses

Award points for holding specific NFTs:

```solidity
function claimNFTBonus(uint256 tokenId) external {
    require(voidNFT.ownerOf(tokenId) == msg.sender, "Not owner");
    require(!nftBonusClaimed[tokenId], "Already claimed");
    
    nftBonusClaimed[tokenId] = true;
    scores[msg.sender] += 500; // +500 points for NFT
    
    emit ScoreUpdated(msg.sender, scores[msg.sender], "nft_bonus", 500);
}
```

### Quest Completion Rewards

Award points for completing quests:

```solidity
function completeQuest(address user, uint256 questId) external onlyQuestContract {
    uint256 questPoints = questRewards[questId];
    scores[user] += questPoints;
    
    emit ScoreUpdated(user, scores[user], "quest_complete", questPoints);
}
```

### Land Ownership Benefits

Passive score generation for landowners:

```solidity
function claimLandRevenue(uint256 landTokenId) external {
    require(voidLand.ownerOf(landTokenId) == msg.sender, "Not owner");
    
    uint256 daysSinceLastClaim = (block.timestamp - lastLandClaim[landTokenId]) / 86400;
    uint256 passivePoints = daysSinceLastClaim * 10; // +10 points/day
    
    scores[msg.sender] += passivePoints;
    lastLandClaim[landTokenId] = block.timestamp;
    
    emit ScoreUpdated(msg.sender, scores[msg.sender], "land_revenue", passivePoints);
}
```

---

## Testing Checklist

- [ ] User earns correct points for each message type (1/2/3)
- [ ] Daily caps enforce correctly (global: 50, zone: 100, DM: 50)
- [ ] Caps reset at midnight UTC
- [ ] Profile bonus claims once and only if profile is set
- [ ] Settings bonus claims once and only if settings are set
- [ ] Tier calculates correctly at each threshold (100/500/2000/5000)
- [ ] `TierReached` event emits when tier increases
- [ ] `ScoreUpdated` event includes correct reason string
- [ ] `getRemainingDailyQuota()` returns accurate count
- [ ] `getUserScoringData()` returns all fields correctly
- [ ] Multiple users don't interfere with each other's scores
- [ ] Edge case: user at 99 points claiming profile bonus → jumps to Bronze
- [ ] Edge case: user at 4999 points sending one message → reaches S-tier

---

## Security Considerations

1. **Daily Cap Enforcement**
   - Caps must reset reliably (use `block.timestamp / 86400`)
   - Test around midnight UTC boundary

2. **Bonus Claim Prevention**
   - Check `profileBonusClaimed` and `settingsBonusClaimed` mappings
   - Verify contract calls to VoidStorage return non-empty data

3. **Score Overflow**
   - Use `uint256` for scores (supports up to 2^256 - 1)
   - No realistic overflow risk (even at 1M messages → 1M points)

4. **Access Control**
   - `recordMessage()` is public (anyone can call)
   - Recommendation: Add `onlyMessaging` modifier if using Pattern 1

5. **Gas Costs**
   - `recordMessage()` costs ~50k gas (1 storage write + event)
   - Batch operations not needed (single call per message)

---

## Gas Cost Estimates

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| `recordMessage()` | ~50,000 | First time for user |
| `recordMessage()` | ~35,000 | Subsequent calls |
| `claimProfileBonus()` | ~55,000 | Includes Storage read |
| `claimSettingsBonus()` | ~55,000 | Includes Storage read |
| `getScore()` | ~2,500 | View function |
| `getTier()` | ~3,000 | View function (calculation) |
| `getUserScoringData()` | ~15,000 | Batch read |

**Total Cost Example:**
- User sends 10 messages/day → ~350k gas/day → ~$5/day at 50 gwei + $2000 ETH
- On Sepolia/L2: Negligible (<$0.01/day)

---

## Frontend Integration Example

```typescript
import { VoidScore } from './contracts/VoidScore';
import { ethers } from 'ethers';

// Connect to contract
const voidScore = new ethers.Contract(
  '0xVoidScoreAddress',
  VoidScore.abi,
  signer
);

// Get user data
const userData = await voidScore.getUserScoringData(userAddress);
console.log('Score:', userData.score.toString());
console.log('Tier:', userData.tier);
console.log('Global messages remaining:', userData.globalRemaining.toString());

// Check if user can send more messages
if (userData.globalRemaining.toNumber() === 0) {
  alert('Daily global message limit reached. Try again tomorrow!');
}

// Display tier badge
const tierNames = ['None', 'Bronze', 'Silver', 'Gold', 'S-tier'];
const tierColors = ['#808080', '#CD7F32', '#C0C0C0', '#FFD700', '#FF4500'];

const tierBadge = document.createElement('div');
tierBadge.textContent = tierNames[userData.tier];
tierBadge.style.backgroundColor = tierColors[userData.tier];
```

---

**End of VoidScore Specification**
