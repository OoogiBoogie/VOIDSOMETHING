# Void Protocol - Legacy System Cleanup Checklist

**Version:** 1.0  
**Date:** 2025-11-12  
**Purpose:** Migration guide from old systems to Void Protocol V1

---

## Executive Summary

This document identifies deprecated messaging/storage systems in The Void codebase and provides a step-by-step migration plan to the new Void Protocol (VoidMessaging, VoidStorage, VoidScore).

**Recommendation:** Complete all cleanup tasks before mainnet deployment to avoid technical debt.

---

## 1. Deprecated Systems Detection

### Old Messaging Systems

**Search Pattern:** Files containing messaging logic not using VoidMessaging.

```bash
# Search for old messaging implementations
grep -r "sendMessage" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules"
grep -r "chatMessage" --include="*.ts" --include="*.tsx"
grep -r "messageHistory" --include="*.ts" --include="*.tsx"
```

**Known Deprecated Patterns:**
- LocalStorage-based chat (if exists)
- Centralized server chat API
- WebSocket-only messaging (no blockchain backing)
- Direct Firebase/Supabase message storage

**Files to Review:**
- [ ] `components/chat/` (all files)
- [ ] `lib/messaging/` (if exists)
- [ ] `hooks/useChat.ts` (if exists)
- [ ] `contexts/ChatContext.tsx` (if exists)
- [ ] `api/chat/` (if exists)

---

### Old Profile Storage

**Search Pattern:** Files storing user data outside VoidStorage.

```bash
# Search for old profile implementations
grep -r "userProfile" --include="*.ts" --include="*.tsx"
grep -r "localStorage.setItem.*profile" --include="*.ts" --include="*.tsx"
grep -r "updateProfile" --include="*.ts" --include="*.tsx"
```

**Known Deprecated Patterns:**
- localStorage profile storage
- Centralized database profiles (MongoDB, PostgreSQL)
- IPFS-only profiles (without VoidStorage fallback)
- Firebase user documents

**Files to Review:**
- [ ] `lib/profile/` (if exists)
- [ ] `hooks/useProfile.ts` (if exists)
- [ ] `contexts/UserContext.tsx`
- [ ] `api/profile/` (if exists)

---

### Old Contract ABIs

**Search Pattern:** Solidity ABIs not matching current contracts.

```bash
# Find all ABI files
find . -name "*.json" -path "*/abis/*"
find . -name "*.abi.json"
```

**Known Deprecated ABIs:**
- Old VoidMessaging versions (pre-anti-spam)
- Old VoidStorage versions (pre-versioning)
- Test/mock contracts from development
- Hardhat deployment artifacts (old addresses)

**Files to Review:**
- [ ] `abis/VoidMessaging.json` (check version)
- [ ] `abis/VoidStorage.json` (check version)
- [ ] `deployments/` (old contract addresses)
- [ ] `.openzeppelin/` (if using upgradeable contracts)

---

### Unused HUD Messaging Logic

**Search Pattern:** HUD components with embedded chat logic.

```bash
# Search HUD directory
grep -r "message" hud/ --include="*.tsx"
grep -r "chat" hud/ --include="*.tsx"
```

**Known Deprecated Patterns:**
- Inline message rendering in HUD windows
- Direct contract calls (not using abstraction layer)
- Hardcoded message formatting
- Local-only message state (no sync)

**Files to Review:**
- [ ] `hud/windows/ChatWindow.tsx` (if exists)
- [ ] `hud/components/MessageList.tsx` (if exists)
- [ ] `hud/hooks/useMessages.ts` (if exists)

---

## 2. Migration Steps

### Step 1: Create Abstraction Layer

**Create:** `lib/void-protocol/client.ts`

```typescript
import { ethers } from 'ethers';
import VoidMessagingABI from '@/abis/VoidMessaging.json';
import VoidStorageABI from '@/abis/VoidStorage.json';
import VoidScoreABI from '@/abis/VoidScore.json';

export const VOID_PROTOCOL = {
  messaging: "0x...", // Deployed VoidMessaging address
  storage: "0x...",   // Deployed VoidStorage address
  score: "0x..."      // Deployed VoidScore address
};

export class VoidProtocolClient {
  messaging: ethers.Contract;
  storage: ethers.Contract;
  score: ethers.Contract;

  constructor(signer: ethers.Signer) {
    this.messaging = new ethers.Contract(
      VOID_PROTOCOL.messaging,
      VoidMessagingABI,
      signer
    );
    this.storage = new ethers.Contract(
      VOID_PROTOCOL.storage,
      VoidStorageABI,
      signer
    );
    this.score = new ethers.Contract(
      VOID_PROTOCOL.score,
      VoidScoreABI,
      signer
    );
  }

  // Messaging methods
  async sendGlobalMessage(text: string) {
    return await this.messaging.sendGlobalMessage(text);
  }

  async getLatestGlobalMessages(count: number) {
    return await this.messaging.getLatestGlobalMessages(count);
  }

  // Storage methods
  async setProfile(profileJson: string) {
    return await this.storage.setProfile(profileJson);
  }

  async getProfile(address: string) {
    return await this.storage.getProfile(address);
  }

  // Score methods
  async getScore(address: string) {
    return await this.score.getScore(address);
  }

  async getTier(address: string) {
    return await this.score.getTier(address);
  }
}
```

---

### Step 2: Replace Old Messaging Calls

**Example Migration:**

**Before (Old System):**
```typescript
// Old: Direct localStorage
function sendMessage(text: string) {
  const messages = JSON.parse(localStorage.getItem('messages') || '[]');
  messages.push({ text, sender: userAddress, timestamp: Date.now() });
  localStorage.setItem('messages', JSON.stringify(messages));
}
```

**After (Void Protocol):**
```typescript
// New: VoidMessaging contract
async function sendMessage(text: string) {
  const client = new VoidProtocolClient(signer);
  await client.sendGlobalMessage(text);
}
```

**Files to Update:**
- [ ] All files calling old `sendMessage()` function
- [ ] All files reading from localStorage messages
- [ ] All WebSocket message handlers

---

### Step 3: Migrate Profile Storage

**Example Migration:**

**Before (Old System):**
```typescript
// Old: Centralized API
async function saveProfile(profile: UserProfile) {
  await fetch('/api/profile', {
    method: 'POST',
    body: JSON.stringify(profile)
  });
}
```

**After (Void Protocol):**
```typescript
// New: VoidStorage contract
async function saveProfile(profile: UserProfile) {
  const client = new VoidProtocolClient(signer);
  const profileJson = JSON.stringify(profile);
  await client.setProfile(profileJson);
  
  // Claim profile bonus
  await client.score.claimProfileBonus();
}
```

**Files to Update:**
- [ ] All files calling old profile API
- [ ] All profile update forms
- [ ] All profile display components

---

### Step 4: Remove Deprecated Files

**Move to `/deprecated` folder:**

```bash
mkdir -p deprecated/messaging
mkdir -p deprecated/profile
mkdir -p deprecated/abis

# Move old messaging files
mv lib/messaging/* deprecated/messaging/
mv components/chat/OldChat.tsx deprecated/messaging/

# Move old profile files
mv lib/profile/oldProfile.ts deprecated/profile/

# Move old ABIs
mv abis/VoidMessagingV0.json deprecated/abis/
```

**Files to Move:**
- [ ] `lib/messaging/localChat.ts`
- [ ] `lib/messaging/webSocketChat.ts`
- [ ] `components/chat/LegacyChat.tsx`
- [ ] `hooks/useOldProfile.ts`
- [ ] `contexts/OldUserContext.tsx`
- [ ] All old ABI files

---

### Step 5: Update Import Statements

**Find and replace:**

```bash
# Old imports
grep -r "from '@/lib/messaging/old" --include="*.ts" --include="*.tsx"

# Replace with
# from '@/lib/void-protocol/client'
```

**Example:**

**Before:**
```typescript
import { sendMessage } from '@/lib/messaging/localChat';
import { getProfile } from '@/lib/profile/oldProfile';
```

**After:**
```typescript
import { VoidProtocolClient } from '@/lib/void-protocol/client';
```

---

### Step 6: Update Environment Variables

**Remove old variables:**
```env
# Deprecated
API_MESSAGING_URL=https://old-api.void.com/messages
FIREBASE_CONFIG=...
MONGODB_URI=...
```

**Add new variables:**
```env
# Void Protocol V1
NEXT_PUBLIC_VOID_MESSAGING=0x...
NEXT_PUBLIC_VOID_STORAGE=0x...
NEXT_PUBLIC_VOID_SCORE=0x...
NEXT_PUBLIC_SEPOLIA_RPC=https://sepolia.infura.io/v3/...
```

---

## 3. Testing Checklist

### Functional Testing

- [ ] Global message sends successfully via VoidMessaging
- [ ] Zone message sends to correct topic
- [ ] DM sends and conversationId is deterministic
- [ ] Profile saves to VoidStorage and retrieves correctly
- [ ] Profile bonus claims successfully
- [ ] Settings save to VoidStorage
- [ ] User score increments on messages
- [ ] Tier updates when thresholds crossed
- [ ] Block/unblock functions work
- [ ] Daily caps enforce correctly
- [ ] Rate limits enforce correctly

### Integration Testing

- [ ] Frontend connects to contracts correctly
- [ ] Wallet connection works (MetaMask, WalletConnect)
- [ ] Events emit and subgraph indexes
- [ ] GraphQL queries return correct data
- [ ] Real-time updates work (WebSocket or polling)
- [ ] Gas estimation accurate
- [ ] Error messages display correctly

### Regression Testing

- [ ] Old message data migrated (if applicable)
- [ ] Old profile data migrated (if applicable)
- [ ] No broken links/imports
- [ ] No 404s on old API routes
- [ ] No console errors from old code
- [ ] Build passes without warnings
- [ ] Production deployment successful

---

## 4. Data Migration Strategy

### Option A: Full Migration (Recommended)

**For users with existing profiles/messages:**

1. **Export old data:**
   ```typescript
   const oldMessages = JSON.parse(localStorage.getItem('messages') || '[]');
   const oldProfile = JSON.parse(localStorage.getItem('profile') || '{}');
   ```

2. **Migrate to new system:**
   ```typescript
   // Set profile
   await voidStorage.setProfile(JSON.stringify(oldProfile));
   
   // Re-send important messages (optional)
   for (const msg of importantMessages) {
     await messaging.sendGlobalMessage(msg.text);
   }
   ```

3. **Clear old data:**
   ```typescript
   localStorage.removeItem('messages');
   localStorage.removeItem('profile');
   ```

### Option B: Fresh Start (Simple)

**For new deployments or small user bases:**

1. Announce migration to users
2. Deploy new contracts
3. Users re-create profiles
4. Old data archived (read-only)

### Option C: Hybrid (Gradual)

**For large user bases:**

1. Run both systems in parallel (2 weeks)
2. Migrate users gradually
3. Monitor usage on old system
4. Deprecate when <5% traffic on old system
5. Full shutdown after 30 days

---

## 5. Centralized Config Module

**Create:** `lib/void-protocol/config.ts`

```typescript
export const VOID_CONFIG = {
  contracts: {
    messaging: process.env.NEXT_PUBLIC_VOID_MESSAGING!,
    storage: process.env.NEXT_PUBLIC_VOID_STORAGE!,
    score: process.env.NEXT_PUBLIC_VOID_SCORE!,
  },
  
  net: {
    protocol: "0x00000000B24D62781dB359b07880a105cD0b64e6",
    storage: "0x00000000DB40fcB9f4466330982372e27Fd7Bbf5"
  },
  
  rpc: {
    sepolia: process.env.NEXT_PUBLIC_SEPOLIA_RPC!,
    mainnet: process.env.NEXT_PUBLIC_MAINNET_RPC!
  },
  
  subgraph: {
    endpoint: process.env.NEXT_PUBLIC_SUBGRAPH_URL!
  }
};

// Validation
if (!VOID_CONFIG.contracts.messaging) {
  throw new Error("Missing NEXT_PUBLIC_VOID_MESSAGING");
}
```

**Usage:**
```typescript
import { VOID_CONFIG } from '@/lib/void-protocol/config';

const messaging = new ethers.Contract(
  VOID_CONFIG.contracts.messaging,
  abi,
  signer
);
```

---

## 6. Documentation Updates

### Update README.md

**Remove:**
- Old API documentation
- Old deployment instructions
- Deprecated environment variables

**Add:**
- Void Protocol V1 overview
- New contract addresses
- Subgraph endpoint
- Migration guide link

### Update CONTRIBUTING.md

**Remove:**
- Old messaging API integration
- Legacy profile system docs

**Add:**
- VoidMessaging integration guide
- VoidStorage usage examples
- VoidScore scoring logic
- Event indexing instructions

### Create DEPRECATED.md

**Contents:**
- List of all deprecated systems
- Reasons for deprecation
- Alternative (Void Protocol)
- Timeline for removal

---

## 7. Deployment Checklist

### Pre-Deployment

- [ ] All old code moved to `/deprecated`
- [ ] All imports updated
- [ ] All environment variables updated
- [ ] Config module created and validated
- [ ] Tests pass (unit, integration, e2e)
- [ ] Build succeeds without warnings
- [ ] Gas costs reviewed and acceptable
- [ ] Security audit completed (if mainnet)

### Deployment

- [ ] Deploy VoidMessaging to Sepolia
- [ ] Deploy VoidStorage to Sepolia
- [ ] Deploy VoidScore to Sepolia
- [ ] Verify contracts on Etherscan
- [ ] Deploy subgraph to The Graph
- [ ] Update frontend environment variables
- [ ] Deploy frontend to staging
- [ ] Run smoke tests on staging
- [ ] Deploy frontend to production
- [ ] Monitor for errors (24 hours)

### Post-Deployment

- [ ] Announce migration to users
- [ ] Monitor gas costs
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Archive old code (after 30 days)
- [ ] Remove `/deprecated` folder (after 90 days)

---

## 8. Rollback Plan

**If critical issues found post-deployment:**

1. **Immediate Actions:**
   - Pause frontend (maintenance mode)
   - Revert to previous deployment
   - Announce issue to users

2. **Fix Issues:**
   - Identify root cause
   - Deploy patched contracts (if needed)
   - Test thoroughly on testnet

3. **Gradual Re-Deployment:**
   - Deploy to staging
   - Run extended smoke tests
   - Deploy to production (off-peak hours)
   - Monitor closely (48 hours)

---

## Final Checklist Summary

- [ ] All deprecated systems identified
- [ ] Migration plan created
- [ ] Abstraction layer implemented
- [ ] Old code moved to `/deprecated`
- [ ] Environment variables updated
- [ ] Config module created
- [ ] Documentation updated
- [ ] Testing completed
- [ ] Deployment successful
- [ ] Monitoring in place

**Estimated Time:** 1-2 weeks (depends on codebase size)

---

**End of Legacy System Cleanup Checklist**
