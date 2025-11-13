# Void Protocol - Indexing & Analytics Guide

**Version:** 1.0  
**Last Updated:** 2025-11-12

## Table of Contents

1. [Overview](#overview)
2. [Event Schema](#event-schema)
3. [Subgraph Entity Definitions](#subgraph-entity-definitions)
4. [Mapping Logic](#mapping-logic)
5. [Frontend Query Examples](#frontend-query-examples)
6. [Analytics Metrics](#analytics-metrics)
7. [Performance Optimization](#performance-optimization)

---

## Overview

The Void Protocol emits comprehensive events across three core contracts:
- **VoidMessaging** - All messaging activity (global, zone, DM)
- **VoidStorage** - Profile and settings updates
- **VoidScore** - Reputation changes and tier progression

This guide provides the complete specification for indexing these events using The Graph Protocol or custom indexers.

---

## Event Schema

### VoidMessaging Events

#### `VoidMessageSent`

```solidity
event VoidMessageSent(
    address indexed from,
    address indexed to,
    bytes32 indexed conversationId,
    uint8 messageType,
    string topic,
    string text
);
```

**Fields:**
- `from` (indexed) - Sender address
- `to` (indexed) - Recipient address (address(0) for public messages)
- `conversationId` (indexed) - Conversation/thread identifier
- `messageType` - 0=global, 1=DM, 2=zone, 3=system
- `topic` - Net Protocol topic string
- `text` - Message content (human-readable)

**Indexing Notes:**
- Index by `from` for user message history
- Index by `to` for DM inbox queries
- Index by `conversationId` for thread reconstruction
- Parse `topic` to extract zone IDs (`void:zone:<zoneId>`)

#### `UserBlocked`

```solidity
event UserBlocked(
    address indexed blocker,
    address indexed blocked
);
```

**Fields:**
- `blocker` (indexed) - User doing the blocking
- `blocked` (indexed) - User being blocked

#### `UserUnblocked`

```solidity
event UserUnblocked(
    address indexed blocker,
    address indexed unblocked
);
```

**Fields:**
- `blocker` (indexed) - User doing the unblocking
- `unblocked` (indexed) - User being unblocked

---

### VoidStorage Events

#### `ProfileUpdated`

```solidity
event ProfileUpdated(
    address indexed user,
    uint256 version
);
```

**Fields:**
- `user` (indexed) - User who updated profile
- `version` - New version index (starts at 1)

**Off-Chain Data Fetch:**
After indexing this event, call `VoidStorage.getProfile(user)` to retrieve the actual profile JSON.

#### `MessagingSettingsUpdated`

```solidity
event MessagingSettingsUpdated(
    address indexed user,
    uint256 version
);
```

**Fields:**
- `user` (indexed) - User who updated settings
- `version` - New version index

**Off-Chain Data Fetch:**
Call `VoidStorage.getMessagingSettings(user)` to retrieve settings JSON.

#### `GlobalConfigUpdated`

```solidity
event GlobalConfigUpdated(
    uint256 version
);
```

**Fields:**
- `version` - New config version

**Off-Chain Data Fetch:**
Call `VoidStorage.getGlobalMessagingConfig()` to retrieve config JSON.

---

### VoidScore Events

#### `ScoreUpdated`

```solidity
event ScoreUpdated(
    address indexed user,
    uint256 newScore,
    string reason,
    uint256 pointsAdded
);
```

**Fields:**
- `user` (indexed) - User whose score changed
- `newScore` - Updated total score
- `reason` - Reason for score change (e.g., "global_message", "profile_bonus")
- `pointsAdded` - Amount of points added

**Reason Values:**
- `"global_message"` - Sent global chat message (+1 point)
- `"zone_message"` - Sent zone chat message (+2 points)
- `"direct_message"` - Sent DM (+3 points)
- `"profile_bonus"` - Set profile (+100 points)
- `"settings_bonus"` - Set settings (+50 points)

#### `TierReached`

```solidity
event TierReached(
    address indexed user,
    uint8 tier,
    uint256 score
);
```

**Fields:**
- `user` (indexed) - User who reached new tier
- `tier` - New tier level (0=None, 1=Bronze, 2=Silver, 3=Gold, 4=S-tier)
- `score` - Current score when tier was reached

---

## Subgraph Entity Definitions

### User Entity

```graphql
type User @entity {
  id: ID!                         # User address (lowercase)
  
  # Messaging Stats
  messageCount: BigInt!           # Total messages sent
  globalMessageCount: BigInt!     # Global messages sent
  zoneMessageCount: BigInt!       # Zone messages sent
  dmCount: BigInt!                # DMs sent
  
  # Reputation
  score: BigInt!                  # Current VoidScore
  tier: Int!                      # Current tier (0-4)
  
  # Identity
  hasProfile: Boolean!            # Has set profile
  hasSettings: Boolean!           # Has set messaging settings
  profileVersion: BigInt!         # Current profile version
  settingsVersion: BigInt!        # Current settings version
  
  # Activity
  firstMessageTimestamp: BigInt!  # First message timestamp
  lastMessageTimestamp: BigInt!   # Most recent message timestamp
  lastActiveDay: BigInt!          # Last day active (timestamp / 86400)
  
  # Relationships
  messagesSent: [Message!]! @derivedFrom(field: "from")
  messagesReceived: [Message!]! @derivedFrom(field: "to")
  conversations: [Conversation!]! @derivedFrom(field: "participants")
  scoreHistory: [ScoreSnapshot!]! @derivedFrom(field: "user")
  profileHistory: [ProfileVersion!]! @derivedFrom(field: "user")
  
  # Block List
  blockedUsers: [String!]!        # Addresses this user has blocked
  blockedByUsers: [String!]!      # Addresses that have blocked this user
}
```

### Message Entity

```graphql
type Message @entity {
  id: ID!                         # Transaction hash + log index
  
  # Participants
  from: User!                     # Sender
  to: User                        # Recipient (null for public messages)
  
  # Content
  text: String!                   # Message text
  messageType: Int!               # 0=global, 1=DM, 2=zone, 3=system
  
  # Context
  topic: String!                  # Net Protocol topic
  conversationId: Bytes!          # Conversation identifier
  conversation: Conversation      # Link to conversation entity
  
  # Metadata
  timestamp: BigInt!              # Block timestamp
  blockNumber: BigInt!            # Block number
  transactionHash: Bytes!         # Transaction hash
}
```

### Conversation Entity

```graphql
type Conversation @entity {
  id: ID!                         # conversationId (bytes32 as hex)
  
  # Participants
  participants: [User!]!          # Users in conversation (2 for DMs)
  conversationType: String!       # "dm", "zone", or "global"
  
  # Zone-specific
  zoneId: String                  # Zone identifier (for zone conversations)
  
  # Stats
  messageCount: BigInt!           # Total messages in conversation
  firstMessageTimestamp: BigInt!  # First message timestamp
  lastMessageTimestamp: BigInt!   # Most recent message timestamp
  
  # Relationships
  messages: [Message!]! @derivedFrom(field: "conversation")
}
```

### Topic Entity

```graphql
type Topic @entity {
  id: ID!                         # Topic string (e.g., "void:global")
  
  # Stats
  messageCount: BigInt!           # Total messages on this topic
  uniqueSenders: BigInt!          # Unique users who posted
  
  # Activity
  firstMessageTimestamp: BigInt!  # First message on topic
  lastMessageTimestamp: BigInt!   # Most recent message
  
  # Daily Stats
  dailyStats: [TopicDailyStats!]! @derivedFrom(field: "topic")
}
```

### TopicDailyStats Entity

```graphql
type TopicDailyStats @entity {
  id: ID!                         # topic-id + day
  
  topic: Topic!                   # Parent topic
  day: BigInt!                    # Day index (timestamp / 86400)
  
  messageCount: BigInt!           # Messages on this day
  uniqueSenders: BigInt!          # Unique senders on this day
  
  timestamp: BigInt!              # Day start timestamp
}
```

### ScoreSnapshot Entity

```graphql
type ScoreSnapshot @entity {
  id: ID!                         # Transaction hash + log index
  
  user: User!                     # User whose score changed
  score: BigInt!                  # New score value
  pointsAdded: BigInt!            # Points added in this update
  reason: String!                 # Reason for score change
  
  timestamp: BigInt!              # Block timestamp
  blockNumber: BigInt!            # Block number
  transactionHash: Bytes!         # Transaction hash
}
```

### ProfileVersion Entity

```graphql
type ProfileVersion @entity {
  id: ID!                         # user-address + version
  
  user: User!                     # User who owns profile
  version: BigInt!                # Version index
  
  # Profile Data (parsed from JSON)
  avatarId: String                # Avatar identifier
  displayName: String             # Display name
  bio: String                     # User bio
  links: [String!]                # Social links
  
  timestamp: BigInt!              # Update timestamp
  blockNumber: BigInt!            # Block number
}
```

---

## Mapping Logic

### Handling `VoidMessageSent` Event

```typescript
import { VoidMessageSent } from '../generated/VoidMessaging/VoidMessaging';
import { Message, User, Conversation, Topic } from '../generated/schema';

export function handleVoidMessageSent(event: VoidMessageSent): void {
  // Load or create sender
  let sender = User.load(event.params.from.toHexString());
  if (sender == null) {
    sender = new User(event.params.from.toHexString());
    sender.messageCount = BigInt.fromI32(0);
    sender.globalMessageCount = BigInt.fromI32(0);
    sender.zoneMessageCount = BigInt.fromI32(0);
    sender.dmCount = BigInt.fromI32(0);
    sender.score = BigInt.fromI32(0);
    sender.tier = 0;
    sender.hasProfile = false;
    sender.hasSettings = false;
    sender.profileVersion = BigInt.fromI32(0);
    sender.settingsVersion = BigInt.fromI32(0);
    sender.firstMessageTimestamp = event.block.timestamp;
    sender.blockedUsers = [];
    sender.blockedByUsers = [];
  }
  
  // Update sender stats
  sender.messageCount = sender.messageCount.plus(BigInt.fromI32(1));
  sender.lastMessageTimestamp = event.block.timestamp;
  sender.lastActiveDay = event.block.timestamp.div(BigInt.fromI32(86400));
  
  // Update type-specific counters
  if (event.params.messageType == 0) {
    sender.globalMessageCount = sender.globalMessageCount.plus(BigInt.fromI32(1));
  } else if (event.params.messageType == 1) {
    sender.dmCount = sender.dmCount.plus(BigInt.fromI32(1));
  } else if (event.params.messageType == 2) {
    sender.zoneMessageCount = sender.zoneMessageCount.plus(BigInt.fromI32(1));
  }
  
  sender.save();
  
  // Load or create recipient (for DMs)
  if (event.params.to.toHexString() != '0x0000000000000000000000000000000000000000') {
    let recipient = User.load(event.params.to.toHexString());
    if (recipient == null) {
      recipient = new User(event.params.to.toHexString());
      // ... initialize recipient
    }
    recipient.save();
  }
  
  // Create message entity
  let messageId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  let message = new Message(messageId);
  message.from = sender.id;
  message.to = event.params.to.toHexString() != '0x0000000000000000000000000000000000000000' 
    ? event.params.to.toHexString() 
    : null;
  message.text = event.params.text;
  message.messageType = event.params.messageType;
  message.topic = event.params.topic;
  message.conversationId = event.params.conversationId;
  message.timestamp = event.block.timestamp;
  message.blockNumber = event.block.number;
  message.transactionHash = event.transaction.hash;
  
  // Link to conversation
  let conversation = Conversation.load(event.params.conversationId.toHexString());
  if (conversation == null) {
    conversation = new Conversation(event.params.conversationId.toHexString());
    conversation.messageCount = BigInt.fromI32(0);
    conversation.firstMessageTimestamp = event.block.timestamp;
    
    // Determine conversation type
    if (event.params.messageType == 0) {
      conversation.conversationType = 'global';
      conversation.participants = [];
    } else if (event.params.messageType == 1) {
      conversation.conversationType = 'dm';
      conversation.participants = [sender.id, event.params.to.toHexString()];
    } else if (event.params.messageType == 2) {
      conversation.conversationType = 'zone';
      conversation.participants = [];
      // Extract zoneId from topic "void:zone:<zoneId>"
      let topicParts = event.params.topic.split(':');
      if (topicParts.length >= 3) {
        conversation.zoneId = topicParts[2];
      }
    }
  }
  
  conversation.messageCount = conversation.messageCount.plus(BigInt.fromI32(1));
  conversation.lastMessageTimestamp = event.block.timestamp;
  conversation.save();
  
  message.conversation = conversation.id;
  message.save();
  
  // Update topic stats
  let topic = Topic.load(event.params.topic);
  if (topic == null) {
    topic = new Topic(event.params.topic);
    topic.messageCount = BigInt.fromI32(0);
    topic.uniqueSenders = BigInt.fromI32(0);
    topic.firstMessageTimestamp = event.block.timestamp;
  }
  
  topic.messageCount = topic.messageCount.plus(BigInt.fromI32(1));
  topic.lastMessageTimestamp = event.block.timestamp;
  topic.save();
  
  // Update daily topic stats
  let day = event.block.timestamp.div(BigInt.fromI32(86400));
  let dailyStatsId = event.params.topic + '-' + day.toString();
  let dailyStats = TopicDailyStats.load(dailyStatsId);
  if (dailyStats == null) {
    dailyStats = new TopicDailyStats(dailyStatsId);
    dailyStats.topic = topic.id;
    dailyStats.day = day;
    dailyStats.messageCount = BigInt.fromI32(0);
    dailyStats.uniqueSenders = BigInt.fromI32(0);
    dailyStats.timestamp = day.times(BigInt.fromI32(86400));
  }
  
  dailyStats.messageCount = dailyStats.messageCount.plus(BigInt.fromI32(1));
  dailyStats.save();
}
```

### Handling `ScoreUpdated` Event

```typescript
import { ScoreUpdated } from '../generated/VoidScore/VoidScore';
import { User, ScoreSnapshot } from '../generated/schema';

export function handleScoreUpdated(event: ScoreUpdated): void {
  // Update user score
  let user = User.load(event.params.user.toHexString());
  if (user == null) {
    user = new User(event.params.user.toHexString());
    // ... initialize user
  }
  
  user.score = event.params.newScore;
  
  // Calculate tier
  if (user.score.lt(BigInt.fromI32(100))) {
    user.tier = 0; // None
  } else if (user.score.lt(BigInt.fromI32(500))) {
    user.tier = 1; // Bronze
  } else if (user.score.lt(BigInt.fromI32(2000))) {
    user.tier = 2; // Silver
  } else if (user.score.lt(BigInt.fromI32(5000))) {
    user.tier = 3; // Gold
  } else {
    user.tier = 4; // S-tier
  }
  
  user.save();
  
  // Create score snapshot
  let snapshotId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
  let snapshot = new ScoreSnapshot(snapshotId);
  snapshot.user = user.id;
  snapshot.score = event.params.newScore;
  snapshot.pointsAdded = event.params.pointsAdded;
  snapshot.reason = event.params.reason;
  snapshot.timestamp = event.block.timestamp;
  snapshot.blockNumber = event.block.number;
  snapshot.transactionHash = event.transaction.hash;
  snapshot.save();
}
```

### Handling `ProfileUpdated` Event

```typescript
import { ProfileUpdated } from '../generated/VoidStorage/VoidStorage';
import { User, ProfileVersion } from '../generated/schema';
import { VoidStorage } from '../generated/VoidStorage/VoidStorage';

export function handleProfileUpdated(event: ProfileUpdated): void {
  // Update user
  let user = User.load(event.params.user.toHexString());
  if (user == null) {
    user = new User(event.params.user.toHexString());
    // ... initialize user
  }
  
  user.hasProfile = true;
  user.profileVersion = event.params.version;
  user.save();
  
  // Fetch profile data from contract
  let contract = VoidStorage.bind(event.address);
  let profileData = contract.getProfile(event.params.user);
  
  // Parse profile JSON
  let profileId = event.params.user.toHexString() + '-' + event.params.version.toString();
  let profile = new ProfileVersion(profileId);
  profile.user = user.id;
  profile.version = event.params.version;
  profile.timestamp = event.block.timestamp;
  profile.blockNumber = event.block.number;
  
  // TODO: Parse JSON from profileData.value0
  // Example: let json = json.fromString(profileData.value0);
  // profile.avatarId = json.avatarId;
  // profile.displayName = json.displayName;
  // etc.
  
  profile.save();
}
```

---

## Frontend Query Examples

### Get User's Latest Messages

```graphql
query GetUserMessages($userAddress: String!, $limit: Int!) {
  messages(
    where: { from: $userAddress }
    orderBy: timestamp
    orderDirection: desc
    first: $limit
  ) {
    id
    text
    messageType
    topic
    timestamp
    to {
      id
    }
  }
}
```

### Get Global Chat (Latest 50)

```graphql
query GetGlobalChat {
  messages(
    where: { messageType: 0 }
    orderBy: timestamp
    orderDirection: desc
    first: 50
  ) {
    id
    from {
      id
      score
      tier
    }
    text
    timestamp
  }
}
```

### Get DM Conversation

```graphql
query GetDMConversation($conversationId: String!, $skip: Int!, $limit: Int!) {
  conversation(id: $conversationId) {
    id
    participants {
      id
      score
      tier
    }
    messageCount
    messages(
      orderBy: timestamp
      orderDirection: asc
      skip: $skip
      first: $limit
    ) {
      id
      from {
        id
      }
      text
      timestamp
    }
  }
}
```

### Get Zone Chat

```graphql
query GetZoneChat($zoneId: String!, $limit: Int!) {
  topic(id: "void:zone:$zoneId") {
    id
    messageCount
    messages(
      orderBy: timestamp
      orderDirection: desc
      first: $limit
    ) {
      id
      from {
        id
        score
        tier
      }
      text
      timestamp
    }
  }
}
```

### Get User Score History

```graphql
query GetScoreHistory($userAddress: String!) {
  user(id: $userAddress) {
    id
    score
    tier
    scoreHistory(orderBy: timestamp, orderDirection: desc) {
      score
      pointsAdded
      reason
      timestamp
    }
  }
}
```

### Get Leaderboard (Top Scores)

```graphql
query GetLeaderboard($limit: Int!) {
  users(
    orderBy: score
    orderDirection: desc
    first: $limit
  ) {
    id
    score
    tier
    messageCount
    hasProfile
  }
}
```

### Get Trending Zones (Most Active Today)

```graphql
query GetTrendingZones($day: BigInt!) {
  topicDailyStats(
    where: { day: $day }
    orderBy: messageCount
    orderDirection: desc
    first: 10
  ) {
    topic {
      id
    }
    messageCount
    uniqueSenders
  }
}
```

---

## Analytics Metrics

### Daily Active Users (DAU)

```graphql
query GetDAU($day: BigInt!) {
  users(where: { lastActiveDay: $day }) {
    id
  }
}
```

**Calculation:** Count distinct users with `lastActiveDay == today`.

### Monthly Active Users (MAU)

```graphql
query GetMAU($startDay: BigInt!, $endDay: BigInt!) {
  users(where: { lastActiveDay_gte: $startDay, lastActiveDay_lte: $endDay }) {
    id
  }
}
```

**Calculation:** Count distinct users with `lastActiveDay` in the past 30 days.

### Messages Per Topic (All-Time)

```graphql
query GetTopicStats {
  topics(orderBy: messageCount, orderDirection: desc) {
    id
    messageCount
    uniqueSenders
  }
}
```

### Average Messages Per User

**Off-Chain Calculation:**
1. Query total `messageCount` across all `User` entities
2. Query total count of `User` entities
3. Divide: `totalMessages / totalUsers`

### Profile Completion Rate

```graphql
query GetProfileCompletion {
  totalUsers: users {
    id
  }
  
  usersWithProfile: users(where: { hasProfile: true }) {
    id
  }
}
```

**Calculation:** `usersWithProfile.length / totalUsers.length * 100`

### Score Distribution

```graphql
query GetScoreDistribution {
  tierNone: users(where: { tier: 0 }) {
    id
  }
  
  tierBronze: users(where: { tier: 1 }) {
    id
  }
  
  tierSilver: users(where: { tier: 2 }) {
    id
  }
  
  tierGold: users(where: { tier: 3 }) {
    id
  }
  
  tierS: users(where: { tier: 4 }) {
    id
  }
}
```

### Spam Detection Metrics

```graphql
query GetHighVolumeUsers($threshold: BigInt!) {
  users(where: { messageCount_gte: $threshold }, orderBy: messageCount, orderDirection: desc) {
    id
    messageCount
    dmCount
    lastMessageTimestamp
  }
}
```

**Use Case:** Identify users sending abnormal message volumes for manual review.

### Conversation Activity

```graphql
query GetActiveConversations($limit: Int!) {
  conversations(
    orderBy: lastMessageTimestamp
    orderDirection: desc
    first: $limit
  ) {
    id
    conversationType
    zoneId
    messageCount
    participants {
      id
      tier
    }
    lastMessageTimestamp
  }
}
```

---

## Performance Optimization

### Indexing Best Practices

1. **Batch Event Processing**
   - Process events in blocks to reduce RPC calls
   - Use multicall for fetching contract data

2. **Pagination**
   - Always use `first`/`skip` for large queries
   - Implement cursor-based pagination for real-time feeds

3. **Caching**
   - Cache frequently accessed data (global chat, leaderboards)
   - Invalidate cache on new `VoidMessageSent` events

4. **Filtering**
   - Use indexed fields (`from`, `to`, `conversationId`) for fast queries
   - Avoid filtering on non-indexed fields when possible

### Database Optimization

1. **Indexes**
   - Create indexes on:
     - `User.score` (for leaderboards)
     - `Message.timestamp` (for chronological queries)
     - `Topic.messageCount` (for trending topics)

2. **Denormalization**
   - Store message counts on `User` entity (avoid counting messages at query time)
   - Pre-calculate tier from score (avoid runtime tier calculation)

3. **Archival**
   - Archive old messages after 6 months
   - Keep message counts but move full text to cold storage

### Real-Time Updates

1. **WebSocket Subscriptions**
   ```graphql
   subscription OnNewMessage {
     messages(orderBy: timestamp, orderDirection: desc, first: 1) {
       id
       from {
         id
         tier
       }
       text
       timestamp
     }
   }
   ```

2. **Event Listeners**
   - Listen to `VoidMessageSent` events directly from contract
   - Update UI optimistically before subgraph confirms

---

## Implementation Checklist

- [ ] Deploy subgraph to The Graph Network
- [ ] Verify all event handlers mapping correctly
- [ ] Test queries for global chat, DMs, zone chat
- [ ] Implement real-time subscriptions for message feeds
- [ ] Set up analytics dashboard (DAU/MAU, leaderboards, trending zones)
- [ ] Configure caching layer (Redis/Memcached)
- [ ] Add monitoring for indexing lag
- [ ] Document API endpoints for frontend consumption
- [ ] Test performance with 10k+ messages
- [ ] Implement rate limiting for public API

---

## Future Enhancements

1. **Full-Text Search**
   - Index message text for search queries
   - Support fuzzy matching and autocomplete

2. **Sentiment Analysis**
   - Analyze message sentiment (positive/negative/neutral)
   - Track sentiment trends per zone

3. **User Recommendations**
   - Suggest DM recipients based on activity overlap
   - Recommend zones based on messaging patterns

4. **Moderation Tools**
   - Flag suspicious activity (spam, abuse)
   - Track blocked users and block patterns

5. **Advanced Analytics**
   - Cohort analysis (user retention)
   - Network graph (who talks to whom)
   - Peak activity hours per zone

---

**End of Indexing & Analytics Guide**
