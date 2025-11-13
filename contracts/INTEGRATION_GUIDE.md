# The Void x Net Protocol - Messaging & Storage Integration

## 📋 Overview

Complete on-chain messaging and storage system for The Void metaverse using **Net Protocol** and **Net Storage**.

### Contracts Implemented

1. **`INet.sol`** - Interface for Net Protocol messaging
2. **`IStorage.sol`** - Interface for Net Storage key-value store
3. **`VoidMessaging.sol`** - Global chat, zone chat, and DM system
4. **`VoidStorage.sol`** - User profiles, settings, and global config

---

## 🏗️ Contract Responsibilities

### VoidMessaging
**Purpose**: On-chain messaging backbone for The Void

**Features**:
- ✅ Global chat (visible to all users)
- ✅ Zone chat (per-district channels)
- ✅ Direct messages (private 1-on-1 conversations)
- ✅ Persistent on-chain storage via Net Protocol
- ✅ Event emission for real-time updates
- ✅ Frontend-friendly query helpers

**Key Functions**:
```solidity
// Sending messages
sendGlobalMessage(text)
sendZoneMessage(zoneId, text)
sendDM(recipientAddress, text)

// Reading messages
getLatestGlobalMessages(count)
getLatestZoneMessages(zoneId, count)
getConversationMessages(otherUser, start, end)
getUserMessages(user, start, end)
```

**Message Types**:
- `0` = Global chat
- `1` = Direct message
- `2` = Zone chat
- `3` = System message (future use)

---

### VoidStorage
**Purpose**: Decentralized user data storage

**Features**:
- ✅ User profiles (avatar, display name, bio, links)
- ✅ Messaging settings (notifications, muted users, privacy)
- ✅ Global app configuration (admin only)
- ✅ Versioned storage (all historical data preserved)
- ✅ User data ownership (only owner can update)

**Key Functions**:
```solidity
// User profiles
setProfile(profileJson)
getProfile(userAddress)
getProfileVersion(userAddress, versionIndex)

// Messaging settings
setMessagingSettings(settingsJson)
getMessagingSettings(userAddress)

// Global config (owner only)
setGlobalMessagingConfig(configJson)
getGlobalMessagingConfig()
```

**Data Format**: All data stored as JSON strings
```json
// Profile example
{
  "avatarId": "123",
  "displayName": "VoidExplorer",
  "bio": "Metaverse builder",
  "links": ["https://twitter.com/..."]
}

// Settings example
{
  "notifications": true,
  "mutedUsers": ["0x..."],
  "dmPrivacy": "friends"
}
```

---

## 🚀 Deployment Guide

### 1. Network Configuration

**Ethereum Sepolia (Testnet)**:
```javascript
const NET_PROTOCOL_ADDRESS = "0x00000000B24D62781dB359b07880a105cD0b64e6";
const NET_STORAGE_ADDRESS = "0x00000000DB40fcB9f4466330982372e27Fd7Bbf5";
```

### 2. Deploy VoidMessaging
```solidity
VoidMessaging messaging = new VoidMessaging(
    NET_PROTOCOL_ADDRESS,  // Net Protocol
    NET_STORAGE_ADDRESS    // Net Storage (optional for now)
);
```

### 3. Deploy VoidStorage
```solidity
VoidStorage storage = new VoidStorage(
    NET_STORAGE_ADDRESS  // Net Storage
);
```

### 4. Verify Contracts
```bash
npx hardhat verify --network sepolia <MESSAGING_ADDRESS> <NET_PROTOCOL> <NET_STORAGE>
npx hardhat verify --network sepolia <STORAGE_ADDRESS> <NET_STORAGE>
```

---

## 🎮 Frontend Integration

### Messaging Panel Layout

```
┌─────────────────────────────────────┐
│  CONVERSATIONS                      │
│  ┌─────────────┬────────────────┐   │
│  │  • Global   │  Thread View   │   │
│  │  • Zone #1  │                │   │
│  │  • @User1   │  Messages...   │   │
│  │  • @User2   │                │   │
│  └─────────────┴────────────────┘   │
│              [Input Box]            │
└─────────────────────────────────────┘
```

### Global Chat Example

**TypeScript/React Integration**:
```typescript
import { ethers } from 'ethers';
import VoidMessagingABI from './abis/VoidMessaging.json';

const MESSAGING_ADDRESS = "0x..."; // Deployed address

// Initialize contract
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const messaging = new ethers.Contract(
  MESSAGING_ADDRESS,
  VoidMessagingABI,
  signer
);

// Send global message
async function sendGlobal(text: string) {
  const tx = await messaging.sendGlobalMessage(text);
  await tx.wait();
  console.log('Message sent!');
}

// Get latest 20 global messages
async function loadGlobalChat() {
  const messages = await messaging.getLatestGlobalMessages(20);
  
  messages.forEach(msg => {
    console.log({
      from: msg.from,
      text: msg.text,
      timestamp: new Date(msg.timestamp * 1000)
    });
  });
}

// Listen for new messages (real-time)
messaging.on('VoidMessageSent', (from, to, conversationId, type, topic, text) => {
  if (topic === 'void:global') {
    console.log(`${from}: ${text}`);
    // Update UI with new message
  }
});
```

### Zone Chat Example

```typescript
// When player enters district-1
const currentZone = "district-1";

// Load zone chat history
const zoneMessages = await messaging.getLatestZoneMessages(currentZone, 20);

// Send zone message
async function sendZoneMessage(text: string) {
  const tx = await messaging.sendZoneMessage(currentZone, text);
  await tx.wait();
}

// Listen for zone messages
messaging.on('VoidMessageSent', (from, to, convId, type, topic, text) => {
  if (topic === `void:zone:${currentZone}`) {
    // Update zone chat UI
  }
});
```

### Direct Messages Example

```typescript
// Open DM with specific user
const recipientAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";

// Get conversation ID (optional - frontend can precompute)
const conversationId = await messaging.getConversationId(
  myAddress,
  recipientAddress
);

// Load DM history
const dmMessages = await messaging.getConversationMessages(
  recipientAddress,
  0,  // start index
  50  // end index
);

// Send DM
async function sendDirectMessage(text: string) {
  const tx = await messaging.sendDM(recipientAddress, text);
  await tx.wait();
}

// Listen for DMs (filter by conversationId)
messaging.on('VoidMessageSent', (from, to, convId, type, topic, text) => {
  if (type === 1 && convId === conversationId) {
    // Update DM thread UI
  }
});
```

### Profile & Settings Example

```typescript
import VoidStorageABI from './abis/VoidStorage.json';

const STORAGE_ADDRESS = "0x...";
const storage = new ethers.Contract(STORAGE_ADDRESS, VoidStorageABI, signer);

// Set user profile
async function updateProfile() {
  const profileData = JSON.stringify({
    avatarId: "123",
    displayName: "VoidExplorer",
    bio: "Metaverse builder and DeFi enthusiast",
    links: ["https://twitter.com/void_explorer"]
  });
  
  const tx = await storage.setProfile(profileData);
  await tx.wait();
}

// Get user profile
async function loadProfile(userAddress: string) {
  const [profileJson, _] = await storage.getProfile(userAddress);
  const profile = JSON.parse(profileJson);
  
  return {
    avatarId: profile.avatarId,
    displayName: profile.displayName,
    bio: profile.bio,
    links: profile.links
  };
}

// Update messaging settings
async function updateSettings() {
  const settings = JSON.stringify({
    notifications: true,
    notifyOnDM: true,
    mutedUsers: ["0x..."],
    dmPrivacy: "friends"
  });
  
  const tx = await storage.setMessagingSettings(settings);
  await tx.wait();
}
```

---

## 🔐 Security & Safety

### Access Control
- ✅ **User messaging**: Anyone can send messages (public)
- ✅ **User profiles/settings**: Only owner can update their own data
- ✅ **Global config**: Only contract owner can update
- ✅ **DM validation**: Cannot DM self or address(0)

### Input Validation
- ✅ Empty messages rejected
- ✅ Invalid recipients rejected
- ✅ Empty profile/settings data rejected
- ✅ Zero addresses rejected in constructors

### Gas Optimization
- ✅ View functions use `external` (cheaper than `public`)
- ✅ Immutable variables for protocol addresses
- ✅ Efficient ABI encoding/decoding
- ✅ Pagination support (avoid unbounded loops)
- ⚠️ **Recommendation**: Limit message queries to ≤ 50 at a time

### Edge Cases Handled
- ✅ Empty message arrays returned when no data exists
- ✅ Conversation ID always deterministic (min/max address ordering)
- ✅ Historical data preserved (Net Storage versioning)
- ✅ Event indexing optimized (indexed fields for filtering)

---

## 📊 Event Monitoring

### VoidMessageSent Event
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

**Indexing Strategy**:
- Query all messages by user: Filter `from` field
- Query all DMs to user: Filter `to` field  
- Query specific conversation: Filter `conversationId` field
- Query by type/topic: Filter in application layer

**Example Subgraph/Indexer Query**:
```graphql
{
  voidMessageSents(
    where: { from: "0x..." }
    orderBy: timestamp
    orderDirection: desc
    first: 20
  ) {
    from
    to
    text
    messageType
    topic
    timestamp
  }
}
```

---

## 🧪 Testing Checklist

### VoidMessaging Tests
- [x] Deploy with valid Net Protocol address
- [x] Reject deployment with address(0)
- [x] Send global message successfully
- [x] Send zone message successfully
- [x] Send DM successfully
- [x] Reject empty messages
- [x] Reject DM to self
- [x] Reject DM to address(0)
- [x] Query latest global messages
- [x] Query latest zone messages
- [x] Query conversation messages (filter by ID)
- [x] Query user message history
- [x] Conversation ID deterministic regardless of address order
- [x] Events emitted correctly

### VoidStorage Tests
- [x] Deploy with valid Storage address
- [x] Reject deployment with address(0)
- [x] User can set profile
- [x] User can update profile (creates new version)
- [x] Anyone can read any user's profile
- [x] Profile version history accessible
- [x] User can set messaging settings
- [x] Settings version history accessible
- [x] Owner can set global config
- [x] Non-owner cannot set global config
- [x] Batch read (getUserData) works
- [x] hasUserData correctly detects existing data

---

## 🔮 Future Enhancements

### Phase 2 (Optional)
1. **Message Reactions**: On-chain emoji reactions to messages
2. **Thread Replies**: Nested conversation support
3. **Group Chats**: Multi-user private channels
4. **Moderation Tools**: Mute, ban, report functionality
5. **Rich Media**: IPFS links for images/files
6. **Encrypted DMs**: End-to-end encryption for private messages
7. **Cross-Chain**: Deploy to other Net Protocol supported chains

### Potential Integrations
- Guild/DAO chat channels
- In-game event announcements (system messages)
- Marketplace negotiations (buyer/seller DMs)
- Achievement notifications
- Friend request system

---

## 📝 Assumptions & Design Decisions

### Net Protocol Assumptions
- Net contract address is stable across deployments
- `sendMessageViaApp` function signature matches interface
- Query functions (`getMessagesByTopic`, `getMessagesBySender`) exist
- Message count functions available for pagination

### Net Storage Assumptions
- Storage contract supports `put`, `get`, `getValueAtIndex`, `getTotalWrites`
- Versioning works as documented (append-only)
- JSON strings stored as `text` parameter (no binary data needed for now)

### Design Decisions
1. **JSON over Structs**: Flexibility for frontend - easier to extend without contract upgrades
2. **Conversation ID**: Deterministic based on address pair - ensures consistency
3. **No On-Chain Filtering**: Use events + indexer for complex queries (gas efficiency)
4. **Immutable Protocol Addresses**: Prevents accidental misconfiguration
5. **Owner-Only Config**: Global settings controlled, but user data is permissionless
6. **No Rate Limiting**: Rely on gas costs as natural rate limiter (future: add if needed)

---

## 🎯 Integration Summary

### What The Void Frontend Should Do

1. **Connect Wallet**: User authenticates via Privy/WalletConnect
2. **Initialize Contracts**: Create ethers.js contract instances for VoidMessaging + VoidStorage
3. **Load User Data**: Fetch profile and settings from VoidStorage
4. **Open Messaging Panel**: Show conversation list (global, zones, DMs)
5. **Subscribe to Events**: Listen for `VoidMessageSent` events for real-time updates
6. **Send Messages**: Call appropriate function based on active conversation
7. **Query History**: Use pagination helpers to load message history
8. **Update Profile**: Allow users to edit profile/settings through UI

### What Should NOT Be Changed
- ❌ Existing intro pipeline (warning → cinematic → password → wallet → spawn)
- ❌ 3D movement, camera, world rendering
- ❌ Current HUD layout (PC/mobile variants)
- ❌ Existing game state management

### Integration Points
- ✅ Add messaging icon to bottom dock (existing pattern)
- ✅ Add profile viewer to user chip dropdown
- ✅ Add settings panel for messaging preferences
- ✅ Show chat notifications when messages arrive (event listener)
- ✅ Display user display names from profiles (instead of addresses)

---

## 📦 Contract Addresses (Post-Deployment)

**Update these after deployment**:

```javascript
// Ethereum Sepolia
export const VOID_CONTRACTS = {
  messaging: "0x...", // VoidMessaging deployment address
  storage: "0x...",   // VoidStorage deployment address
  net: "0x00000000B24D62781dB359b07880a105cD0b64e6",
  netStorage: "0x00000000DB40fcB9f4466330982372e27Fd7Bbf5"
};
```

---

## ✅ Deployment Checklist

- [ ] Compile contracts (no errors)
- [ ] Run full test suite
- [ ] Deploy VoidMessaging to Sepolia
- [ ] Deploy VoidStorage to Sepolia
- [ ] Verify contracts on Etherscan
- [ ] Test send global message on testnet
- [ ] Test query messages on testnet
- [ ] Test profile update on testnet
- [ ] Update frontend with contract addresses
- [ ] Test frontend integration (connect wallet → send message)
- [ ] Set up event indexing (subgraph/backend)
- [ ] Monitor gas costs for typical operations
- [ ] Document contract ABIs for frontend team
- [ ] Production deployment (when ready)

---

**Built with ❤️ for The Void Metaverse**

*Powered by Net Protocol and Net Storage*
