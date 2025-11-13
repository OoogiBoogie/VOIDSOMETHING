# Void Messaging - Anti-Spam & Sybil Resistance Specification

**Version:** 2.0  
**Contract:** VoidMessaging.sol  
**Last Updated:** November 12, 2025  
**Added:** Sybil resistance, asset footprint weighting, cluster analysis

## Overview

The Void messaging system implements multi-layered anti-spam and anti-Sybil controls to prevent abuse while maintaining a smooth user experience. This document details all rate limiting, daily caps, blocking mechanisms, and Sybil detection strategies.

**Defense Layers:**
1. **On-Chain:** Rate limits + daily caps (enforced by contract)
2. **Economic:** Gas costs make farming uneconomical
3. **Off-Chain:** Asset footprint weighting + cluster analysis (enforced by indexer/scoring)
4. **Social:** Block/mute system (user-controlled)

---

## LAYER 1: On-Chain Rate Limiting (Cooldowns)

### Message Type Cooldowns

Each message type has a minimum time interval between sends:

| Message Type | Cooldown | Constant |
|--------------|----------|----------|
| Global Chat | 5 seconds | `GLOBAL_MESSAGE_COOLDOWN` |
| Zone Chat | 3 seconds | `ZONE_MESSAGE_COOLDOWN` |
| Direct Message | 2 seconds | `DM_COOLDOWN` |

### How Cooldowns Work

**Storage:**
```solidity
mapping(address => uint256) public lastGlobalMessage;
mapping(address => uint256) public lastZoneMessage;
mapping(address => uint256) public lastDMTimestamp;
```

**Enforcement:**
```solidity
// Example: Global message
if (block.timestamp < lastGlobalMessage[msg.sender] + GLOBAL_MESSAGE_COOLDOWN) {
    uint256 remaining = (lastGlobalMessage[msg.sender] + GLOBAL_MESSAGE_COOLDOWN) - block.timestamp;
    revert RateLimited(remaining);
}

lastGlobalMessage[msg.sender] = block.timestamp;
```

**Error Details:**
```solidity
error RateLimited(uint256 cooldownRemaining);
```

The error includes the number of seconds remaining until the user can send another message.

### Frontend Handling

**Before Sending:**
```typescript
const cooldown = await messaging.getCooldownRemaining(userAddress, 0); // 0 = global

if (cooldown.toNumber() > 0) {
  alert(`Please wait ${cooldown.toNumber()} seconds before sending another message.`);
  return;
}

// Safe to send
await messaging.sendGlobalMessage(text);
```

**After Rate Limit Error:**
```typescript
try {
  await messaging.sendGlobalMessage(text);
} catch (error) {
  if (error.message.includes('RateLimited')) {
    // Extract remaining seconds from error data
    const remaining = extractRemainingSeconds(error);
    showCooldownTimer(remaining);
  }
}
```

---

## LAYER 2: Daily Caps

### Message Type Caps (Updated v2.0)

Each message type has a maximum number of messages per day:

| Message Type | Daily Cap (v2.0) | Max Points/Day | Constant |
|--------------|------------------|----------------|----------|
| Global Chat | 50 messages | 50 | `MAX_GLOBAL_PER_DAY` |
| Zone Chat | 40 messages | 80 | `MAX_ZONE_PER_DAY` |
| Direct Message | 20 messages | 60 | `MAX_DM_PER_DAY` |

**Change from v1.0:** Zone cap reduced from 200→40 to prevent zone-only farming strategy.

### How Daily Caps Work

**Day Calculation:**
```solidity
uint256 private constant SECONDS_PER_DAY = 86400;
uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
```

Days are calculated as Unix timestamp divided by 86,400. This means:
- Day 0: Jan 1, 1970 00:00:00 UTC
- Day 19694: Nov 12, 2025 00:00:00 UTC
- Resets at midnight UTC every day

**Storage:**
```solidity
// user => day => messageType => count
mapping(address => mapping(uint256 => mapping(uint8 => uint256))) public dailyMessageCount;
```

**Enforcement:**
```solidity
// Example: Global message
uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
uint256 todayCount = dailyMessageCount[msg.sender][currentDay][MESSAGE_TYPE_GLOBAL];

if (todayCount >= MAX_GLOBAL_PER_DAY) {
    revert DailyCapReached(MESSAGE_TYPE_GLOBAL, MAX_GLOBAL_PER_DAY);
}

dailyMessageCount[msg.sender][currentDay][MESSAGE_TYPE_GLOBAL] = todayCount + 1;
```

**Error Details:**
```solidity
error DailyCapReached(uint8 messageType, uint256 cap);
```

### Checking Remaining Quota

Users can check how many messages they have left today:

```solidity
function getRemainingDailyQuota(address user)
    external
    view
    returns (uint256 globalRemaining, uint256 zoneRemaining, uint256 dmRemaining)
{
    uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
    
    uint256 globalUsed = dailyMessageCount[user][currentDay][MESSAGE_TYPE_GLOBAL];
    uint256 zoneUsed = dailyMessageCount[user][currentDay][MESSAGE_TYPE_ZONE];
    uint256 dmUsed = dailyMessageCount[user][currentDay][MESSAGE_TYPE_DM];

    globalRemaining = globalUsed >= MAX_GLOBAL_PER_DAY ? 0 : MAX_GLOBAL_PER_DAY - globalUsed;
    zoneRemaining = zoneUsed >= MAX_ZONE_PER_DAY ? 0 : MAX_ZONE_PER_DAY - zoneUsed;
    dmRemaining = dmUsed >= MAX_DM_PER_DAY ? 0 : MAX_DM_PER_DAY - dmUsed;
}
```

**Frontend Example:**
```typescript
const quota = await messaging.getRemainingDailyQuota(userAddress);

console.log(`You can send ${quota.globalRemaining} more global messages today`);
console.log(`You can send ${quota.zoneRemaining} more zone messages today`);
console.log(`You can send ${quota.dmRemaining} more DMs today`);

// Update UI
document.getElementById('global-remaining').textContent = quota.globalRemaining;
```

---

## Block/Mute System

### How Blocking Works

Users can block other users from sending them DMs. Blocking is one-way:
- If Alice blocks Bob, Bob cannot DM Alice
- Alice can still DM Bob (unless Bob also blocks Alice)

**Storage:**
```solidity
// blocker => blocked => isBlocked
mapping(address => mapping(address => bool)) public blockedUsers;
```

**Functions:**

#### `blockUser(address user)`

Blocks a user from sending you DMs.

```solidity
function blockUser(address user) external {
    if (user == address(0) || user == msg.sender) revert InvalidRecipient();
    
    blockedUsers[msg.sender][user] = true;
    emit UserBlocked(msg.sender, user);
}
```

**Example:**
```typescript
// Alice blocks Bob
await messaging.connect(alice).blockUser(bob.address);

// Bob tries to DM Alice → reverts with UserIsBlocked()
await expect(
  messaging.connect(bob).sendDM(alice.address, "Hello!")
).to.be.revertedWithCustomError(messaging, "UserIsBlocked");
```

#### `unblockUser(address user)`

Unblocks a previously blocked user.

```solidity
function unblockUser(address user) external {
    if (user == address(0)) revert InvalidRecipient();
    
    blockedUsers[msg.sender][user] = false;
    emit UserUnblocked(msg.sender, user);
}
```

**Example:**
```typescript
// Alice unblocks Bob
await messaging.connect(alice).unblockUser(bob.address);

// Bob can now DM Alice again
await messaging.connect(bob).sendDM(alice.address, "Hello!");
```

#### `isBlocked(address blocker, address blocked) → bool`

Checks if a user is blocked.

```solidity
function isBlocked(address blocker, address blocked) external view returns (bool) {
    return blockedUsers[blocker][blocked];
}
```

**Example:**
```typescript
const blocked = await messaging.isBlocked(alice.address, bob.address);

if (blocked) {
  console.log('Alice has blocked Bob');
}
```

### DM Enforcement

The `sendDM()` function checks the block list before sending:

```solidity
function sendDM(address to, string calldata text) external {
    // ... validation ...
    
    // Anti-spam: Check if sender is blocked by recipient
    if (blockedUsers[to][msg.sender]) revert UserIsBlocked();
    
    // ... send message ...
}
```

**Error Details:**
```solidity
error UserIsBlocked();
```

### Frontend Block List Management

**Display Block List:**
```typescript
// Store blocked users in VoidStorage settings
const settings = await voidStorage.getMessagingSettings(userAddress);
const parsed = JSON.parse(settings.text);

console.log('Blocked users:', parsed.mutedUsers);
// ["0x1234...", "0x5678..."]
```

**Block UI Flow:**
```typescript
async function blockUser(addressToBlock: string) {
  // 1. Block on-chain
  await messaging.blockUser(addressToBlock);
  
  // 2. Update settings in VoidStorage
  const settings = await voidStorage.getMessagingSettings(userAddress);
  const parsed = JSON.parse(settings.text);
  
  if (!parsed.mutedUsers) parsed.mutedUsers = [];
  if (!parsed.mutedUsers.includes(addressToBlock)) {
    parsed.mutedUsers.push(addressToBlock);
  }
  
  await voidStorage.setMessagingSettings(JSON.stringify(parsed));
  
  // 3. Update UI
  refreshBlockList();
}
```

---

## Privilege Escalation (Future)

### Token-Based Rate Limit Increases

High-tier users or token holders can have higher limits:

**Conceptual Implementation:**
```solidity
function getMaxDailyMessages(address user, uint8 messageType) internal view returns (uint256) {
    uint8 tier = voidScore.getTier(user);
    
    if (messageType == MESSAGE_TYPE_GLOBAL) {
        if (tier >= 4) return 200;      // S-tier: 2x limit
        if (tier >= 3) return 150;      // Gold: 1.5x limit
        return MAX_GLOBAL_PER_DAY;      // Others: 100
    }
    
    // Similar logic for other types
}
```

**Benefits:**
- Rewards active, high-reputation users
- Incentivizes tier progression
- Maintains anti-spam for low-tier accounts

### Stake-Based Unlimited Messaging

Users can stake VOID tokens to bypass rate limits:

**Conceptual Implementation:**
```solidity
mapping(address => uint256) public stakedAmount;

modifier rateLimitOrStaked(uint256 lastTimestamp, uint256 cooldown) {
    if (stakedAmount[msg.sender] < 1000 ether) {
        // Apply rate limit for non-stakers
        require(block.timestamp >= lastTimestamp + cooldown, "Rate limited");
    }
    _;
}
```

**Stake Requirements:**
- 1,000 VOID → Bypass global cooldown
- 5,000 VOID → Bypass all cooldowns
- 10,000 VOID → Double daily caps

---

## Testing Checklist

### Rate Limiting Tests

- [ ] User can send first global message immediately
- [ ] User cannot send second global message within 5 seconds
- [ ] After 5 seconds, user can send another global message
- [ ] Different message types have independent cooldowns
- [ ] Cooldown timer accuracy (test at exactly 4.9s and 5.1s)

### Daily Cap Tests

- [ ] User can send 100 global messages in one day
- [ ] 101st global message reverts with `DailyCapReached`
- [ ] After midnight UTC, cap resets (user can send again)
- [ ] Different message types have independent daily counts
- [ ] Edge case: User sends 100th message at 23:59 UTC, can send again at 00:00 UTC

### Block List Tests

- [ ] User can block another user
- [ ] Blocked user cannot DM the blocker
- [ ] Blocker can still DM the blocked user (one-way)
- [ ] User can unblock and blocked user can DM again
- [ ] User cannot block themselves
- [ ] User cannot block address(0)
- [ ] `UserBlocked` event emits correctly
- [ ] `UserUnblocked` event emits correctly

### Integration Tests

- [ ] VoidScore daily caps sync with VoidMessaging daily caps
- [ ] User with S-tier has higher limits (if privilege escalation implemented)
- [ ] Blocked users show in VoidStorage settings JSON
- [ ] Frontend correctly displays remaining quota
- [ ] Frontend correctly shows cooldown timer

---

## Security Considerations

### 1. Timestamp Manipulation

**Risk:** Miners can manipulate block.timestamp by ±15 seconds.

**Mitigation:**
- Cooldowns (2-5 seconds) are too short to exploit profitably
- Daily caps reset at midnight UTC (±15s doesn't change day)
- No critical economic logic depends on exact timestamp

**Verdict:** Low risk, acceptable for messaging.

### 2. Daily Cap Bypass

**Risk:** User tries to bypass daily cap by using multiple addresses.

**Mitigation:**
- Each address tracked independently (intended behavior)
- Creating multiple wallets requires gas for transactions
- VoidScore penalizes new addresses (no tier/score)
- Economic cost (gas) exceeds benefit (spamming chat)

**Verdict:** Sybil attacks uneconomical, acceptable.

### 3. Block List Privacy

**Risk:** Block list is publicly readable on-chain.

**Mitigation:**
- VoidStorage settings (including `mutedUsers`) stored as JSON
- On-chain `blockedUsers` mapping is public by design
- Users aware that blockchain data is transparent

**Recommendation:** Frontend can optionally encrypt `mutedUsers` in VoidStorage settings.

### 4. Denial of Service (DoS)

**Risk:** Attacker spams with max daily messages to disrupt chat.

**Mitigation:**
- Daily caps prevent sustained spam (max 100 global/day)
- Cooldowns slow down burst spam (5 seconds between messages)
- Blocked users cannot DM targets
- Frontend can filter/hide messages from low-tier users

**Verdict:** Adequate protection, no single user can DoS.

### 5. Gas Griefing

**Risk:** User spams messages to increase gas costs for indexers.

**Mitigation:**
- Daily caps limit total messages (max 400/day per user)
- Events are lightweight (no large data blobs)
- Indexers can rate-limit event processing

**Verdict:** Negligible impact on indexers.

---

## Gas Cost Analysis

### Per-Message Overhead

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Rate limit check | ~2,500 | 1 SLOAD + timestamp math |
| Daily cap check | ~5,000 | 2 SLOADs + math |
| Daily count update | ~20,000 | 1 SSTORE (first message of day) |
| Daily count update | ~5,000 | 1 SSTORE (subsequent messages) |
| Block list check (DMs) | ~2,500 | 1 SLOAD |
| **Total (first message)** | **~30,000** | Anti-spam overhead |
| **Total (subsequent)** | **~15,000** | Anti-spam overhead |

**Impact:**
- Anti-spam adds ~15-30k gas per message
- Global message base cost: ~80k gas
- Total: ~95-110k gas (~$2-3 at 50 gwei + $2000 ETH)
- On L2/testnet: <$0.01 per message

### Block/Unblock Operations

| Operation | Gas Cost |
|-----------|----------|
| `blockUser()` | ~45,000 |
| `unblockUser()` | ~30,000 |
| `isBlocked()` (view) | ~2,500 |

---

## Frontend Integration Examples

### Display Cooldown Timer

```typescript
async function sendMessageWithCooldown(text: string) {
  // Check cooldown
  const cooldown = await messaging.getCooldownRemaining(userAddress, 0);
  
  if (cooldown.toNumber() > 0) {
    // Show countdown
    let remaining = cooldown.toNumber();
    const interval = setInterval(() => {
      document.getElementById('cooldown').textContent = `Wait ${remaining}s`;
      remaining--;
      
      if (remaining <= 0) {
        clearInterval(interval);
        document.getElementById('cooldown').textContent = '';
      }
    }, 1000);
    
    return;
  }
  
  // Send message
  await messaging.sendGlobalMessage(text);
}
```

### Display Daily Quota

```typescript
async function updateQuotaDisplay() {
  const quota = await messaging.getRemainingDailyQuota(userAddress);
  
  document.getElementById('global-quota').textContent = 
    `${quota.globalRemaining} / 100`;
  document.getElementById('zone-quota').textContent = 
    `${quota.zoneRemaining} / 200`;
  document.getElementById('dm-quota').textContent = 
    `${quota.dmRemaining} / 100`;
  
  // Show warning if low
  if (quota.globalRemaining.toNumber() < 10) {
    showWarning('Only 10 global messages left today!');
  }
}

// Update every minute
setInterval(updateQuotaDisplay, 60000);
```

### Block List UI

```tsx
function BlockListPanel() {
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  
  useEffect(() => {
    loadBlockedUsers();
  }, []);
  
  async function loadBlockedUsers() {
    const settings = await voidStorage.getMessagingSettings(userAddress);
    const parsed = JSON.parse(settings.text);
    setBlockedUsers(parsed.mutedUsers || []);
  }
  
  async function blockUser(address: string) {
    await messaging.blockUser(address);
    await loadBlockedUsers();
  }
  
  async function unblockUser(address: string) {
    await messaging.unblockUser(address);
    await loadBlockedUsers();
  }
  
  return (
    <div>
      <h3>Blocked Users</h3>
      {blockedUsers.map(addr => (
        <div key={addr}>
          <span>{addr.slice(0, 6)}...{addr.slice(-4)}</span>
          <button onClick={() => unblockUser(addr)}>Unblock</button>
        </div>
      ))}
    </div>
  );
}
```

---

## Recommended Configuration (v2.0)

For production deployment on Sepolia/mainnet/L2:

| Setting | Value (v2.0) | Rationale |
|---------|--------------|-----------|
| Global cooldown | 5 seconds | Prevents burst spam, allows natural conversation |
| Zone cooldown | 3 seconds | Faster than global (smaller audience) |
| DM cooldown | 2 seconds | Fastest (1-on-1, private) |
| Global daily cap | 50 | Reduced from 100 to discourage spam farming |
| Zone daily cap | 40 | Reduced from 200 to prevent zone-only farming |
| DM daily cap | 20 | Reduced from 100, DMs are highest value |
| CurrentScore decay | 2%/day | Ensures inactive users don't dominate leaderboards |

---

## LAYER 3: Sybil Resistance & Asset Footprint Weighting

**Purpose:** Prevent multi-account farming and bot manipulation through off-chain score adjustments.

**Enforcement:** Applied by indexer/backend before displaying CurrentScore or calculating airdrop eligibility.

### Strategy Overview

The on-chain contract stores raw scores, but the **effective score** shown to users and used for privileges is adjusted based on:

1. **Asset footprint** (VOID/PSX holdings, NFTs, transaction history)
2. **Fresh wallet penalties** (new accounts get discounted)
3. **Cluster analysis** (detect Sybil networks)

**Formula:**
```typescript
effective_current_score = raw_current_score * asset_multiplier * fresh_penalty * cluster_penalty
```

---

### 1. Asset Footprint Multiplier

**Concept:** Wallets with on-chain history and holdings are more trustworthy.

**Implementation:**
```typescript
function getAssetFootprintMultiplier(address: string): Promise<number> {
  const voidBalance = await voidToken.balanceOf(address);
  const psxBalance = await psxToken.balanceOf(address);
  const nftCount = await countUserNFTs(address); // Any ERC721
  const txCount = await provider.getTransactionCount(address);
  const accountAge = await getAccountAgeDays(address);
  
  let multiplier = 1.0; // Base
  
  // VOID token holders (future, once token launches)
  if (voidBalance >= 10000n * 10n**18n) multiplier += 0.5;  // +50% for whales
  else if (voidBalance >= 1000n * 10n**18n) multiplier += 0.1;  // +10% for holders
  
  // PSX token holders
  if (psxBalance >= 5000n * 10n**18n) multiplier += 0.2;  // +20%
  
  // NFT collectors
  if (nftCount >= 10) multiplier += 0.1;  // +10%
  else if (nftCount >= 1) multiplier += 0.05;  // +5%
  
  // Active wallet (lots of past transactions)
  if (txCount >= 500) multiplier += 0.1;  // +10%
  else if (txCount >= 100) multiplier += 0.05;  // +5%
  
  // Old account (Sybil farms are usually fresh)
  if (accountAge >= 365) multiplier += 0.1;  // +10% for 1+ year
  else if (accountAge >= 90) multiplier += 0.05;  // +5% for 3+ months
  
  return multiplier;
}
```

**Example:**
```
Wallet A (OG Holder):
- VOID: 15,000 → +50%
- PSX: 6,000 → +20%
- NFTs: 12 → +10%
- TxCount: 600 → +10%
- Age: 400 days → +10%
- Total Multiplier: 1.0 + 0.5 + 0.2 + 0.1 + 0.1 + 0.1 = 2.0x

Wallet B (Fresh):
- VOID: 0 → 0%
- PSX: 0 → 0%
- NFTs: 0 → 0%
- TxCount: 5 → 0%
- Age: 3 days → 0%
- Total Multiplier: 1.0x (no bonus)
```

---

### 2. Fresh Wallet Penalty

**Concept:** Brand new wallets are discounted to prevent instant Sybil farming.

**Implementation:**
```typescript
function getFreshWalletPenalty(address: string): Promise<number> {
  const txCount = await provider.getTransactionCount(address);
  const accountAge = await getAccountAgeDays(address);
  
  // Very fresh (< 7 days, < 10 txs) = heavy penalty
  if (accountAge < 7 && txCount < 10) {
    return 0.5;  // 50% penalty (score halved)
  }
  
  // Somewhat fresh (< 30 days, < 50 txs) = medium penalty
  if (accountAge < 30 && txCount < 50) {
    return 0.8;  // 20% penalty
  }
  
  // Established wallet = no penalty
  return 1.0;
}
```

**Rationale:**
- Legitimate new users will quickly accumulate transactions
- Sybil farms struggle to age wallets + build history
- Penalty lifts after ~30 days of normal activity

---

### 3. Cluster Analysis (Anti-Sybil Networks)

**Concept:** Detect groups of wallets that behave identically (likely controlled by same entity).

**Signals:**
- All created within narrow time window (< 1 hour)
- All funded from same source wallet
- Only interact with each other (no external engagement)
- Identical messaging patterns (same time of day, same message lengths)
- Same geographic region (if off-chain IP data available)

**Implementation:**
```typescript
async function detectCluster(address: string): Promise<ClusterInfo | null> {
  // 1. Find wallets created around the same time
  const creationTime = await getWalletCreationTime(address);
  const nearbyWallets = await findWalletsCreatedNear(creationTime, 3600); // ±1 hour
  
  if (nearbyWallets.length < 5) return null; // Not a cluster
  
  // 2. Check if all funded from same source
  const sources = await Promise.all(
    nearbyWallets.map(w => getFirstFundingSource(w))
  );
  const commonSource = findCommonElement(sources);
  
  if (!commonSource) return null;
  
  // 3. Check interaction patterns
  const interactionGraph = await buildInteractionGraph(nearbyWallets);
  const isolation = calculateIsolationScore(interactionGraph);
  
  // 4. Check messaging patterns
  const messagingPatterns = await getMessagingPatterns(nearbyWallets);
  const similarity = calculatePatternSimilarity(messagingPatterns);
  
  // 5. Calculate confidence
  let confidence = 0.0;
  if (commonSource) confidence += 0.3;
  if (isolation > 0.8) confidence += 0.4;  // 80%+ messages only to each other
  if (similarity > 0.9) confidence += 0.3;  // 90%+ identical patterns
  
  return {
    walletCount: nearbyWallets.length,
    confidence,
    commonSource,
    isolation,
    similarity
  };
}

function getClusterPenalty(cluster: ClusterInfo | null): number {
  if (!cluster) return 1.0;  // Not in cluster
  
  // High confidence Sybil = severe penalty
  if (cluster.confidence >= 0.9) return 0.1;  // 90% penalty
  
  // Medium confidence = moderate penalty
  if (cluster.confidence >= 0.7) return 0.5;  // 50% penalty
  
  // Low confidence = minor penalty
  return 0.8;  // 20% penalty
}
```

**Example Detection:**
```
Cluster Found:
- 10 wallets created on 2025-11-10 between 14:00-14:30 UTC
- All funded from 0xABCD...1234 with exactly 0.01 ETH
- 95% of their messages are to each other
- All send messages between 9am-5pm EST (same timezone)
- Confidence: 0.95 (very likely Sybil)
- Penalty: 0.1x (90% reduction)

Result:
- Wallet with raw score 1,000 → effective score 100 (demoted from S-tier to Bronze)
```

---

### 4. Final Adjusted Score Calculation

**Aggregate Function:**
```typescript
async function getAdjustedCurrentScore(address: string): Promise<number> {
  // Read raw score from contract
  const rawScore = await voidScore.getCurrentScore(address);
  
  // Apply off-chain adjustments
  const assetMultiplier = await getAssetFootprintMultiplier(address);
  const freshPenalty = await getFreshWalletPenalty(address);
  
  const cluster = await detectCluster(address);
  const clusterPenalty = getClusterPenalty(cluster);
  
  // Calculate adjusted score
  const adjustedScore = rawScore * assetMultiplier * freshPenalty * clusterPenalty;
  
  console.log({
    address,
    rawScore,
    assetMultiplier,
    freshPenalty,
    clusterPenalty,
    adjustedScore: Math.floor(adjustedScore)
  });
  
  return Math.floor(adjustedScore);
}
```

**Where to Use Adjusted Score:**
- **Leaderboards:** Show adjusted score
- **Tier badges:** Calculate tier from adjusted score
- **Airdrops:** Eligibility based on adjusted score
- **Access control:** Gate features by adjusted tier

**Where to Use Raw Score:**
- **User profile:** Show lifetime score (unadjusted, permanent)
- **On-chain queries:** Contract only knows raw score
- **Historical analysis:** Track score over time without penalties

---

### 5. Handling False Positives

**Challenge:** Legitimate users might get penalized (new users, privacy-focused users with few txs).

**Solutions:**

**A. Manual Appeals:**
- Users can submit verification request
- Team reviews account history
- Override penalty if legitimate

**B. Alternative Verification:**
- Link Twitter/Discord with Void account
- Prove humanity via Gitcoin Passport
- Stake small amount of VOID to bypass fresh wallet penalty

**C. Progressive Trust:**
- Penalty automatically lifts after 30 days + 50 transactions
- No permanent blacklist

**Example Code:**
```typescript
// Allow user to stake VOID to bypass fresh wallet penalty
async function stakeForTrust(amount: BigNumber): Promise<void> {
  await voidToken.approve(voidScore.address, amount);
  await voidScore.stakeForTrust(amount);
  
  // Now fresh wallet penalty doesn't apply
}

// Contract
function stakeForTrust(uint256 amount) external {
  voidToken.transferFrom(msg.sender, address(this), amount);
  trustedStakes[msg.sender] += amount;
}

// In indexer
async function getFreshWalletPenalty(address: string): Promise<number> {
  const staked = await voidScore.trustedStakes(address);
  
  if (staked >= 100n * 10n**18n) {
    return 1.0;  // No penalty if staked 100+ VOID
  }
  
  // Normal logic...
}
```

---

## LAYER 4: Social Moderation (Block/Mute)

(Existing block/mute system documentation remains unchanged...)

---

## Summary: Multi-Layer Defense

| Layer | Enforcement | Prevents |
|-------|-------------|----------|
| **Rate Limits** | On-chain contract | Burst spam (1000 msgs/sec attacks) |
| **Daily Caps** | On-chain contract | Sustained farming (24/7 bots) |
| **Gas Economics** | Blockchain itself | Unprofitable farming (cost > reward) |
| **Time Decay** | On-chain scoring | Inactive whales dominating |
| **Asset Footprint** | Off-chain indexer | Fresh wallet farming |
| **Cluster Analysis** | Off-chain indexer | Sybil network attacks |
| **Block/Mute** | Social (user-controlled) | Personal harassment |

**Combined Effectiveness:**

A sophisticated attacker would need to:
1. Pay gas for thousands of transactions ($$$)
2. Age multiple wallets for 30+ days (time)
3. Acquire VOID/PSX/NFTs for each wallet ($$$)
4. Avoid behavioral clustering (very difficult)
5. Maintain sustained daily activity with decay (ongoing cost)

**Economic Calculation:**
- To fake S-tier (1,500 current score) with 10 Sybil accounts:
  - Gas: 10 accounts × $19/day × 15 days = $2,850
  - Aging: 30+ days wait time
  - Assets: 10 accounts × 1,000 VOID = 10,000 VOID (~$$$)
  - Cluster penalty: If detected, score reduced 90%
  - **Total Cost:** $3k+ and 30+ days for uncertain outcome

VS. legitimate engagement:
- Single account, 15 days of real activity: $285 gas, reaches S-tier reliably

**Conclusion:** The system makes Sybil attacks economically irrational while allowing legitimate users to progress naturally.

---

## Monitoring & Alerts

**Recommended Dashboards:**

1. **Spam Detection Dashboard:**
   - Wallets hitting daily caps repeatedly
   - Wallets with unusual message patterns
   - Cluster detection results

2. **Score Integrity Dashboard:**
   - Distribution of adjusted vs raw scores
   - Penalty application rates (fresh wallet, cluster)
   - Asset multiplier distribution

3. **User Behavior Dashboard:**
   - Message type distribution (global/zone/DM ratios)
   - Time-of-day patterns
   - Conversation diversity (how many unique recipients)

**Alert Triggers:**
- \>50 wallets created in same hour (potential Sybil farm)
- Wallet with >90% messages to same recipient (suspicious)
- Sudden spike in new wallets with zero asset footprint

---

**Document Complete**  
**Version:** 2.0  
**Date:** November 12, 2025

**Adjust for your community:**
- High-activity community → Increase caps to 200/400/200
- Low-spam community → Reduce cooldowns to 3/2/1 seconds
- Professional use → Increase DM cap to 200

---

**End of Anti-Spam Specification**
