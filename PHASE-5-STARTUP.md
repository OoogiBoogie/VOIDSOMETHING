# PHASE 5 STARTUP GUIDE

**Project:** VOID Metaverse HUD  
**Phase:** 5 - Base Sepolia Testnet Deployment  
**Timeline:** Week 5 (7 days)  
**Status:** ⏸ READY TO EXECUTE

---

## EXECUTIVE SUMMARY

Phase 5 transitions VOID from demo mode to live testnet deployment on Base Sepolia. This phase includes smart contract deployment, contract verification, indexer backend launch, Net Protocol integration, and testnet beta access. By the end of Week 5, VOID will be a fully functional decentralized metaverse on Base Sepolia testnet.

**Key Objectives:**
1. Deploy 4 smart contracts to Base Sepolia
2. Verify contracts on Basescan
3. Launch indexer backend with PostgreSQL
4. Enable Net Protocol real-time messaging
5. Add testnet UX guardrails
6. Open invite-only beta to 100+ testers

**Success Criteria:**
- All contracts deployed and verified
- Indexer syncing blockchain events
- Real-time messaging operational
- 100+ beta signups
- Zero critical bugs in production

---

## TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Base Sepolia Deployment Sequence](#base-sepolia-deployment-sequence)
3. [Smart Contract Details](#smart-contract-details)
4. [Contract Verification](#contract-verification)
5. [Indexer Backend Launch](#indexer-backend-launch)
6. [Net Protocol Integration](#net-protocol-integration)
7. [Testnet UX Guardrails](#testnet-ux-guardrails)
8. [Beta Access Plan](#beta-access-plan)
9. [Monitoring & Observability](#monitoring--observability)
10. [Rollback Plan](#rollback-plan)
11. [Phase 6 Preparation](#phase-6-preparation)

---

## PREREQUISITES

### Required Before Starting Phase 5

**Code:**
- [x] Phase 4.6 complete (demo immutability, self-diagnostics, demo build)
- [x] Zero regressions from Phase 4.5
- [x] All E2E tests passing (14/14)
- [x] Demo freeze build operational

**Infrastructure:**
- [ ] Base Sepolia RPC endpoint (Alchemy or QuickNode)
- [ ] PostgreSQL database (Supabase or Railway)
- [ ] Vercel Pro account (for production deployment)
- [ ] Domain name (e.g., voidmetaverse.xyz)
- [ ] SSL certificates (auto-provisioned by Vercel)

**Accounts & Access:**
- [ ] Deployer wallet with 0.1 Sepolia ETH (for gas)
- [ ] Base Sepolia ETH from faucet (https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [ ] Basescan API key (for contract verification)
- [ ] Alchemy API key (for RPC access)
- [ ] Net Protocol API key (for messaging)
- [ ] GitHub repo access (for CI/CD)

**Team:**
- [ ] Smart contract developer (Solidity)
- [ ] Backend developer (Node.js + PostgreSQL)
- [ ] Frontend developer (React + Web3)
- [ ] DevOps engineer (deployment + monitoring)
- [ ] Community manager (beta testers)

### Time Estimates

| Task | Duration | Responsible |
|------|----------|-------------|
| Smart contract deployment | 4 hours | Smart contract dev |
| Contract verification | 2 hours | Smart contract dev |
| Indexer backend setup | 6 hours | Backend dev |
| Net Protocol integration | 4 hours | Frontend dev |
| Testnet UX guardrails | 2 hours | Frontend dev |
| Beta access setup | 2 hours | Community manager |
| Testing & QA | 8 hours | Full team |
| **TOTAL** | **28 hours** | **~3.5 work days** |

**Recommended Schedule:** Deploy Monday morning, test all week, launch beta Friday

---

## BASE SEPOLIA DEPLOYMENT SEQUENCE

### Step-by-Step Deployment

**Day 1: Smart Contract Deployment**

#### Step 1: Prepare Deployment Environment

```bash
# Install dependencies
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers

# Configure hardhat.config.cts for Base Sepolia
```

**hardhat.config.cts:**
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY!,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};

export default config;
```

#### Step 2: Deploy VoidScore Contract

**Purpose:** ERC-20 token + on-chain XP tracking

**Constructor Args:**
- `name`: "VOID Score"
- `symbol`: "VOID"
- `initialSupply`: 1,000,000 VOID (with 18 decimals)

**Deployment Command:**
```bash
npx hardhat run scripts/deploy-voidscore.ts --network baseSepolia
```

**scripts/deploy-voidscore.ts:**
```typescript
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying VoidScore contract...");

  const VoidScore = await ethers.getContractFactory("VoidScore");
  const voidScore = await VoidScore.deploy(
    "VOID Score",
    "VOID",
    ethers.utils.parseEther("1000000") // 1M VOID
  );

  await voidScore.deployed();

  console.log("✅ VoidScore deployed to:", voidScore.address);
  console.log("Transaction hash:", voidScore.deployTransaction.hash);
  
  // Wait for 5 confirmations before verification
  await voidScore.deployTransaction.wait(5);
  
  console.log("Waiting 30 seconds before verification...");
  await new Promise(resolve => setTimeout(resolve, 30000));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Expected Output:**
```
Deploying VoidScore contract...
✅ VoidScore deployed to: 0x1234567890abcdef1234567890abcdef12345678
Transaction hash: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

**Save Address:**
- Copy contract address to `config/contracts.json`:
```json
{
  "baseSepolia": {
    "VoidScore": "0x1234567890abcdef1234567890abcdef12345678"
  }
}
```

#### Step 3: Deploy XPOracle Contract

**Purpose:** Off-chain XP → On-chain verification with Chainlink oracle

**Constructor Args:**
- `voidScoreAddress`: (address from Step 2)
- `oracleAddress`: Chainlink oracle on Base Sepolia (TBD - may use custom oracle initially)

**Deployment Command:**
```bash
npx hardhat run scripts/deploy-xporacle.ts --network baseSepolia
```

**Expected Output:**
```
Deploying XPOracle contract...
✅ XPOracle deployed to: 0x2345678901bcdef2345678901bcdef2345678901
Transaction hash: 0xbcdef2345678901bcdef2345678901bcdef2345678901bcdef2345678901
```

**Save Address:**
```json
{
  "baseSepolia": {
    "VoidScore": "0x1234567890abcdef1234567890abcdef12345678",
    "XPOracle": "0x2345678901bcdef2345678901bcdef2345678901"
  }
}
```

#### Step 4: Deploy VoidMessaging Contract

**Purpose:** On-chain messaging with Net Protocol integration

**Constructor Args:**
- `netProtocolAddress`: Net Protocol contract on Base Sepolia (from Net Protocol docs)

**Deployment Command:**
```bash
npx hardhat run scripts/deploy-voidmessaging.ts --network baseSepolia
```

**Expected Output:**
```
Deploying VoidMessaging contract...
✅ VoidMessaging deployed to: 0x3456789012cdef3456789012cdef3456789012
Transaction hash: 0xcdef3456789012cdef3456789012cdef3456789012cdef3456789012
```

**Save Address:**
```json
{
  "baseSepolia": {
    "VoidScore": "0x1234567890abcdef1234567890abcdef12345678",
    "XPOracle": "0x2345678901bcdef2345678901bcdef2345678901",
    "VoidMessaging": "0x3456789012cdef3456789012cdef3456789012"
  }
}
```

#### Step 5: Deploy VoidAgency Contract

**Purpose:** Gig marketplace with smart contract escrow

**Constructor Args:**
- `voidTokenAddress`: (VoidScore address from Step 2)
- `platformFee`: 5% (500 basis points)

**Deployment Command:**
```bash
npx hardhat run scripts/deploy-voidagency.ts --network baseSepolia
```

**Expected Output:**
```
Deploying VoidAgency contract...
✅ VoidAgency deployed to: 0x4567890123def4567890123def4567890123
Transaction hash: 0xdef4567890123def4567890123def4567890123def4567890123
```

**Save Address:**
```json
{
  "baseSepolia": {
    "VoidScore": "0x1234567890abcdef1234567890abcdef12345678",
    "XPOracle": "0x2345678901bcdef2345678901bcdef2345678901",
    "VoidMessaging": "0x3456789012cdef3456789012cdef3456789012",
    "VoidAgency": "0x4567890123def4567890123def4567890123"
  }
}
```

**Day 1 Complete:** All 4 contracts deployed ✅

---

## SMART CONTRACT DETAILS

### VoidScore (ERC-20 + XP Tracking)

**Solidity Version:** 0.8.20  
**Inheritance:** OpenZeppelin ERC20, Ownable  
**Features:**
- Standard ERC-20 token (VOID)
- On-chain XP storage per address
- Tier calculation based on XP
- Events: XPUpdated, TierChanged, QuestCompleted

**Key Functions:**
```solidity
function updateXP(address user, uint256 xp) external onlyOracle;
function getUserXP(address user) external view returns (uint256);
function getUserTier(address user) external view returns (string memory);
function getTierThreshold(string memory tier) external pure returns (uint256);
```

**Tier Thresholds:**
- BRONZE: 100 XP
- SILVER: 250 XP
- GOLD: 600 XP
- PLATINUM: 1500 XP
- VOID: 3000 XP

**Gas Costs (Estimated):**
- updateXP(): ~50,000 gas (~$0.001 on Base)
- getUserXP(): 0 gas (view function)
- getUserTier(): 0 gas (view function)

**Security Features:**
- Only oracle can update XP (prevents cheating)
- Rate limiting (max 1 update per user per minute)
- Emergency pause function (owner only)

### XPOracle (Off-Chain XP Bridge)

**Solidity Version:** 0.8.20  
**Inheritance:** Ownable  
**Features:**
- Off-chain XP → on-chain verification
- Signature-based authentication
- Nonce tracking (prevent replay attacks)
- Batch updates (gas optimization)

**Key Functions:**
```solidity
function verifyAndUpdateXP(
  address user,
  uint256 xp,
  bytes memory signature
) external;
function batchUpdateXP(
  address[] memory users,
  uint256[] memory xps,
  bytes[] memory signatures
) external;
```

**How It Works:**
1. User completes quest off-chain (e.g., sends message)
2. Backend calculates XP and signs update
3. Frontend calls `verifyAndUpdateXP()` with signature
4. Oracle verifies signature and updates VoidScore contract

**Gas Optimization:**
- Batch updates reduce per-user gas cost by 60%
- Example: 10 users = ~300,000 gas total = ~30,000 gas per user = $0.0006

### VoidMessaging (Net Protocol Integration)

**Solidity Version:** 0.8.20  
**Inheritance:** Ownable  
**Features:**
- On-chain message storage (hash only, content off-chain)
- Daily message cap enforcement
- Tier-based message boosts
- Anti-spam measures

**Key Functions:**
```solidity
function sendMessage(bytes32 messageHash) external;
function getUserMessageCount(address user, uint256 day) external view returns (uint256);
function getMessageCap(address user) external view returns (uint256);
```

**Message Cap Logic:**
```solidity
Base cap: 50 messages/day
BRONZE: +0% (50 messages)
SILVER: +25% (62 messages)
GOLD: +50% (75 messages)
PLATINUM: +100% (100 messages)
VOID: Unlimited
```

**Net Protocol Integration:**
- Message content stored off-chain via Net Protocol
- Message hash stored on-chain for verification
- E2E encryption handled by Net Protocol SDK

### VoidAgency (Gig Marketplace)

**Solidity Version:** 0.8.20  
**Inheritance:** Ownable, ReentrancyGuard  
**Features:**
- Gig creation (creator posts gig + budget)
- Gig claiming (worker claims gig)
- Escrow (payment locked until completion)
- Approval/rejection (creator approves work)
- Dispute resolution (owner arbitration)

**Key Functions:**
```solidity
function createGig(string memory title, uint256 budget) external returns (uint256 gigId);
function claimGig(uint256 gigId) external;
function submitWork(uint256 gigId, string memory workURL) external;
function approveGig(uint256 gigId) external;
function rejectGig(uint256 gigId, string memory reason) external;
```

**Escrow Flow:**
1. Creator calls `createGig()` → VOID tokens locked in contract
2. Worker calls `claimGig()` → Gig status = CLAIMED
3. Worker calls `submitWork()` → Gig status = PENDING_APPROVAL
4. Creator calls `approveGig()` → VOID released to worker (95% to worker, 5% to platform)
5. Alternative: Creator calls `rejectGig()` → VOID refunded to creator

**Platform Fee:**
- 5% of gig budget
- Example: 500 VOID gig → 475 VOID to worker, 25 VOID to platform
- Accumulated fees withdrawable by owner

**Gas Costs (Estimated):**
- createGig(): ~100,000 gas (~$0.002)
- claimGig(): ~50,000 gas (~$0.001)
- approveGig(): ~80,000 gas (~$0.0016)

---

## CONTRACT VERIFICATION

### Why Verify Contracts?

**Benefits:**
- Users can read contract source code on Basescan
- Increased trust and transparency
- Easier debugging (view function calls)
- Required for some DEX listings

**Verification Methods:**
1. Hardhat Etherscan plugin (automated)
2. Basescan UI (manual upload)
3. Sourcify (decentralized verification)

**Recommended:** Hardhat Etherscan plugin (fastest, most reliable)

### Verification Process

**Step 1: Install Hardhat Etherscan Plugin**

```bash
npm install --save-dev @nomiclabs/hardhat-etherscan
```

**Step 2: Configure Basescan API Key**

Add to `.env`:
```
BASESCAN_API_KEY=YOUR_API_KEY_HERE
```

Get API key: https://basescan.org/myapikey

**Step 3: Verify VoidScore Contract**

```bash
npx hardhat verify --network baseSepolia \
  0x1234567890abcdef1234567890abcdef12345678 \
  "VOID Score" "VOID" "1000000000000000000000000"
```

**Expected Output:**
```
Verifying contract...
Successfully submitted source code for contract
contracts/VoidScore.sol:VoidScore at 0x1234567890abcdef1234567890abcdef12345678
for verification on the block explorer. Waiting for verification result...

Successfully verified contract VoidScore on Basescan.
https://sepolia.basescan.org/address/0x1234567890abcdef1234567890abcdef12345678#code
```

**Step 4: Verify XPOracle Contract**

```bash
npx hardhat verify --network baseSepolia \
  0x2345678901bcdef2345678901bcdef2345678901 \
  "0x1234567890abcdef1234567890abcdef12345678" \
  "0xOracleAddressHere"
```

**Step 5: Verify VoidMessaging Contract**

```bash
npx hardhat verify --network baseSepolia \
  0x3456789012cdef3456789012cdef3456789012 \
  "0xNetProtocolAddressHere"
```

**Step 6: Verify VoidAgency Contract**

```bash
npx hardhat verify --network baseSepolia \
  0x4567890123def4567890123def4567890123 \
  "0x1234567890abcdef1234567890abcdef12345678" \
  500
```

**Verification Checklist:**

- [ ] VoidScore verified on Basescan
- [ ] XPOracle verified on Basescan
- [ ] VoidMessaging verified on Basescan
- [ ] VoidAgency verified on Basescan
- [ ] All contract ABIs match deployment
- [ ] All constructor args correct
- [ ] Source code visible on Basescan

**Day 2 Complete:** All contracts verified ✅

---

## INDEXER BACKEND LAUNCH

### Architecture

**Tech Stack:**
- **Runtime:** Node.js 20+ (ESM modules)
- **Database:** PostgreSQL 15+ (Supabase or Railway)
- **ORM:** Prisma (type-safe database access)
- **Blockchain:** ethers.js (event listening)
- **API:** Express.js (REST endpoints)
- **Cache:** Redis (optional, for leaderboards)

**Purpose:**
- Index blockchain events from smart contracts
- Store XP, tier, quest, leaderboard data
- Provide REST API for frontend
- Real-time updates via Server-Sent Events

### Database Schema

**Prisma Schema (prisma/schema.prisma):**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  address       String   @unique
  xp            Int      @default(0)
  lifetimeXP    Int      @default(0)
  tier          String   @default("BRONZE")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  quests        Quest[]
  messages      Message[]
  gigs          Gig[]
  leaderboard   LeaderboardEntry?
}

model Quest {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  questId       String
  completed     Boolean  @default(false)
  xpReward      Int
  completedAt   DateTime?
  createdAt     DateTime @default(now())
  
  @@index([userId, questId])
}

model Message {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  messageHash   String   @unique
  timestamp     DateTime @default(now())
  
  @@index([userId, timestamp])
}

model Gig {
  id            String   @id @default(uuid())
  creatorId     String
  creator       User     @relation(fields: [creatorId], references: [id])
  title         String
  description   String
  budget        Int
  claimedBy     String?
  status        String   @default("OPEN") // OPEN, CLAIMED, COMPLETED, REJECTED
  createdAt     DateTime @default(now())
  completedAt   DateTime?
  
  @@index([status, createdAt])
}

model LeaderboardEntry {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  rank          Int
  xp            Int
  tier          String
  updatedAt     DateTime @updatedAt
  
  @@index([rank])
  @@index([xp(sort: Desc)])
}
```

### Event Indexing

**indexer/index.ts:**

```typescript
import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import VoidScoreABI from '../abis/VoidScore.json';

const prisma = new PrismaClient();
const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
const voidScoreAddress = process.env.VOIDSCORE_CONTRACT_ADDRESS!;
const voidScore = new ethers.Contract(voidScoreAddress, VoidScoreABI, provider);

// Index XPUpdated events
voidScore.on('XPUpdated', async (user: string, newXP: bigint, event: any) => {
  console.log(`XPUpdated: ${user} → ${newXP.toString()} XP`);
  
  await prisma.user.upsert({
    where: { address: user.toLowerCase() },
    update: {
      xp: Number(newXP),
      lifetimeXP: Number(newXP), // Simplified, should track separately
      updatedAt: new Date(),
    },
    create: {
      address: user.toLowerCase(),
      xp: Number(newXP),
      lifetimeXP: Number(newXP),
    },
  });
  
  // Update tier based on XP
  const tier = calculateTier(Number(newXP));
  await prisma.user.update({
    where: { address: user.toLowerCase() },
    data: { tier },
  });
  
  // Update leaderboard
  await updateLeaderboard();
});

// Index TierChanged events
voidScore.on('TierChanged', async (user: string, newTier: string, event: any) => {
  console.log(`TierChanged: ${user} → ${newTier}`);
  
  await prisma.user.update({
    where: { address: user.toLowerCase() },
    data: { tier: newTier },
  });
});

// Index QuestCompleted events
voidScore.on('QuestCompleted', async (user: string, questId: string, xpReward: bigint, event: any) => {
  console.log(`QuestCompleted: ${user} completed ${questId} (+${xpReward} XP)`);
  
  const userRecord = await prisma.user.findUnique({
    where: { address: user.toLowerCase() },
  });
  
  if (userRecord) {
    await prisma.quest.create({
      data: {
        userId: userRecord.id,
        questId,
        completed: true,
        xpReward: Number(xpReward),
        completedAt: new Date(),
      },
    });
  }
});

function calculateTier(xp: number): string {
  if (xp >= 3000) return 'VOID';
  if (xp >= 1500) return 'PLATINUM';
  if (xp >= 600) return 'GOLD';
  if (xp >= 250) return 'SILVER';
  if (xp >= 100) return 'BRONZE';
  return 'NONE';
}

async function updateLeaderboard() {
  const users = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: 100, // Top 100
  });
  
  for (let i = 0; i < users.length; i++) {
    await prisma.leaderboardEntry.upsert({
      where: { userId: users[i].id },
      update: {
        rank: i + 1,
        xp: users[i].xp,
        tier: users[i].tier,
      },
      create: {
        userId: users[i].id,
        rank: i + 1,
        xp: users[i].xp,
        tier: users[i].tier,
      },
    });
  }
}

console.log('🔍 Indexer started, listening for events...');
```

### REST API Endpoints

**api/index.ts:**

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// GET /api/score/:address - Get user's XP and tier
app.get('/api/score/:address', async (req, res) => {
  const { address } = req.params;
  
  const user = await prisma.user.findUnique({
    where: { address: address.toLowerCase() },
  });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    address: user.address,
    xp: user.xp,
    lifetimeXP: user.lifetimeXP,
    tier: user.tier,
  });
});

// GET /api/leaderboards - Get top 100 users
app.get('/api/leaderboards', async (req, res) => {
  const entries = await prisma.leaderboardEntry.findMany({
    include: { user: true },
    orderBy: { rank: 'asc' },
    take: 100,
  });
  
  res.json(entries.map(entry => ({
    rank: entry.rank,
    address: entry.user.address,
    xp: entry.xp,
    tier: entry.tier,
  })));
});

// GET /api/quests/:address - Get user's completed quests
app.get('/api/quests/:address', async (req, res) => {
  const { address } = req.params;
  
  const user = await prisma.user.findUnique({
    where: { address: address.toLowerCase() },
    include: { quests: true },
  });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user.quests.filter(q => q.completed));
});

// GET /api/gigs - Get all open gigs
app.get('/api/gigs', async (req, res) => {
  const gigs = await prisma.gig.findMany({
    where: { status: 'OPEN' },
    include: { creator: true },
    orderBy: { createdAt: 'desc' },
  });
  
  res.json(gigs);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API server running on port ${PORT}`);
});
```

**Deployment Commands:**

```bash
# Setup database
npx prisma migrate dev --name init
npx prisma generate

# Start indexer (background process)
node indexer/index.js &

# Start API server
node api/index.js
```

**Day 3 Complete:** Indexer and API operational ✅

---

## NET PROTOCOL INTEGRATION

### Setup

**Install Net Protocol SDK:**

```bash
npm install @net-protocol/sdk
```

**Configure Net Protocol:**

**lib/netProtocol.ts:**

```typescript
import { NetProtocol } from '@net-protocol/sdk';

export const netProtocol = new NetProtocol({
  chainId: 84532, // Base Sepolia
  rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL!,
  contractAddress: process.env.NEXT_PUBLIC_NET_PROTOCOL_ADDRESS!,
});

export async function sendGlobalMessage(wallet: any, content: string) {
  const tx = await netProtocol.sendMessage({
    channel: 'global',
    content,
    signer: wallet,
  });
  
  return tx.wait();
}

export async function sendDM(wallet: any, recipientAddress: string, content: string) {
  const tx = await netProtocol.sendEncryptedMessage({
    recipient: recipientAddress,
    content,
    signer: wallet,
  });
  
  return tx.wait();
}

export async function subscribeToGlobalChat(callback: (message: any) => void) {
  return netProtocol.subscribe('global', callback);
}

export async function subscribeToDMs(address: string, callback: (message: any) => void) {
  return netProtocol.subscribeToAddress(address, callback);
}
```

### Frontend Integration

**Enable Real-Time Messaging:**

**hooks/useNetProtocolMessages.ts:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { subscribeToGlobalChat, sendGlobalMessage } from '@/lib/netProtocol';
import { useAccount, useSigner } from 'wagmi';

export function useNetProtocolMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const { address } = useAccount();
  const { data: signer } = useSigner();
  
  useEffect(() => {
    if (!address) return;
    
    const unsubscribe = subscribeToGlobalChat((message) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => unsubscribe();
  }, [address]);
  
  const sendMessage = async (content: string) => {
    if (!signer) throw new Error('No signer available');
    
    await sendGlobalMessage(signer, content);
  };
  
  return { messages, sendMessage };
}
```

**Update GlobalChatWindow:**

**hud/world/windows/GlobalChatWindow.tsx:**

```typescript
'use client';

import { useNetProtocolMessages } from '@/hooks/useNetProtocolMessages';
import { isDemoMode } from '@/config/voidConfig';
import { useDemoData } from '@/hooks/useDemoData';

export default function GlobalChatWindow() {
  const isDemo = isDemoMode();
  const demoData = useDemoData();
  const netMessages = useNetProtocolMessages();
  
  const messages = isDemo ? demoData.globalChatMessages : netMessages.messages;
  const sendMessage = isDemo 
    ? () => console.log('Demo mode: message not sent')
    : netMessages.sendMessage;
  
  // ... rest of component
}
```

**Day 4 Complete:** Net Protocol integrated ✅

---

## TESTNET UX GUARDRAILS

### Testnet Banner

**Add testnet detection:**

**lib/chainDetection.ts:**

```typescript
export function isTestnet(): boolean {
  return process.env.NEXT_PUBLIC_NETWORK === 'baseSepolia';
}

export function getNetworkName(): string {
  const network = process.env.NEXT_PUBLIC_NETWORK;
  
  if (network === 'baseSepolia') return 'Base Sepolia Testnet';
  if (network === 'baseMainnet') return 'Base Mainnet';
  
  return 'Unknown Network';
}
```

**Testnet Banner Component:**

**components/TestnetBanner.tsx:**

```typescript
'use client';

import { isTestnet, getNetworkName } from '@/lib/chainDetection';

export default function TestnetBanner() {
  if (!isTestnet()) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-2 text-center text-sm font-bold">
      ⚠️ {getNetworkName()} - Use testnet wallets only, not mainnet
      <a href="https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet" target="_blank" className="ml-4 underline">
        Get Testnet ETH
      </a>
    </div>
  );
}
```

### Transaction Confirmation UX

**Transaction Toast:**

**components/TransactionToast.tsx:**

```typescript
'use client';

import { useState } from 'react';

interface TransactionToastProps {
  txHash: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export default function TransactionToast({ txHash, status, message }: TransactionToastProps) {
  const icons = {
    pending: '⏳',
    success: '✅',
    error: '❌',
  };
  
  const colors = {
    pending: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
  };
  
  return (
    <div className={`${colors[status]} text-white px-4 py-3 rounded shadow-lg`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{icons[status]}</span>
        <div>
          <p className="font-bold">{message}</p>
          {txHash && (
            <a 
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank"
              className="text-sm underline"
            >
              View on Basescan
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Faucet Link

**Add to app layout:**

**app/layout.tsx:**

```typescript
import TestnetBanner from '@/components/TestnetBanner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TestnetBanner />
        {children}
      </body>
    </html>
  );
}
```

**Day 5 Complete:** Testnet UX guardrails added ✅

---

## BETA ACCESS PLAN

### Invite-Only Beta

**Goals:**
- 100+ testers in Week 5
- Gather feedback on UX, bugs, performance
- Test smart contracts under load
- Build community momentum

**Target Audience:**
1. Early supporters (Twitter followers, Discord members)
2. Base ecosystem developers
3. Web3 gaming communities
4. Crypto influencers (micro-influencers with 1K-10K followers)

**Invite Code System:**

**prisma/schema.prisma (add):**

```prisma
model InviteCode {
  id          String   @id @default(uuid())
  code        String   @unique
  maxUses     Int      @default(1)
  usedCount   Int      @default(0)
  createdBy   String?
  createdAt   DateTime @default(now())
  expiresAt   DateTime?
  
  uses        InviteUse[]
}

model InviteUse {
  id          String   @id @default(uuid())
  inviteId    String
  invite      InviteCode @relation(fields: [inviteId], references: [id])
  userId      String
  usedAt      DateTime @default(now())
}
```

**API Endpoint:**

```typescript
// POST /api/beta/redeem - Redeem invite code
app.post('/api/beta/redeem', async (req, res) => {
  const { code, address } = req.body;
  
  const invite = await prisma.inviteCode.findUnique({
    where: { code },
  });
  
  if (!invite) {
    return res.status(404).json({ error: 'Invalid invite code' });
  }
  
  if (invite.usedCount >= invite.maxUses) {
    return res.status(400).json({ error: 'Invite code fully used' });
  }
  
  if (invite.expiresAt && new Date() > invite.expiresAt) {
    return res.status(400).json({ error: 'Invite code expired' });
  }
  
  // Create user and mark invite as used
  const user = await prisma.user.upsert({
    where: { address: address.toLowerCase() },
    update: {},
    create: { address: address.toLowerCase() },
  });
  
  await prisma.inviteUse.create({
    data: {
      inviteId: invite.id,
      userId: user.id,
    },
  });
  
  await prisma.inviteCode.update({
    where: { id: invite.id },
    data: { usedCount: { increment: 1 } },
  });
  
  res.json({ success: true, user });
});
```

**Generate Invite Codes:**

```typescript
// scripts/generate-invite-codes.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateInviteCodes(count: number, maxUses: number = 1) {
  for (let i = 0; i < count; i++) {
    const code = `VOID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    await prisma.inviteCode.create({
      data: {
        code,
        maxUses,
      },
    });
    
    console.log(`Generated: ${code}`);
  }
}

generateInviteCodes(100, 1); // 100 single-use codes
```

**Distribution Strategy:**

1. **Twitter Campaign:**
   - Post: "VOID testnet beta is live! First 50 to reply get an invite code 🚀"
   - DM invite codes to responders
   
2. **Discord Giveaway:**
   - Create #beta-access channel
   - Drop 25 codes for active members
   
3. **Influencer Partnerships:**
   - Give 10 codes to each of 5 micro-influencers
   - Ask them to share with their community
   
4. **Base Ecosystem:**
   - Share 25 codes in Base Discord
   - Cross-promote with other Base projects

**Day 6 Complete:** Beta access system ready ✅

---

## MONITORING & OBSERVABILITY

### Metrics to Track

**Smart Contract Metrics:**
- Total users (unique addresses)
- Total XP distributed
- Total transactions
- Average gas cost
- Contract balance (VOID in escrow)

**Indexer Metrics:**
- Events processed
- Database size
- API response time
- Error rate

**Frontend Metrics:**
- Page load time
- Time to interactive
- Error rate (Sentry)
- User engagement (Mixpanel or Plausible)

### Setup Monitoring

**Sentry (Error Tracking):**

```bash
npm install @sentry/nextjs
```

**sentry.client.config.ts:**

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_NETWORK,
  tracesSampleRate: 0.1,
});
```

**Mixpanel (Analytics):**

```bash
npm install mixpanel-browser
```

**lib/analytics.ts:**

```typescript
import mixpanel from 'mixpanel-browser';

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!);

export function trackEvent(event: string, properties?: any) {
  mixpanel.track(event, properties);
}
```

**Day 7 Complete:** Monitoring setup ✅

---

## ROLLBACK PLAN

### If Critical Bug Found

**Step 1: Pause Contracts**

```solidity
// VoidScore.sol (add emergency pause)
function pause() external onlyOwner {
  _pause();
}

function unpause() external onlyOwner {
  _unpause();
}
```

**Step 2: Switch to Demo Mode**

```bash
# Update .env
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_USE_MOCK_DATA=true

# Redeploy frontend
vercel --prod
```

**Step 3: Notify Users**

- Post on Twitter: "VOID testnet temporarily paused for maintenance. ETA: 2 hours."
- Update Discord #announcements
- Add banner to website: "Testnet paused - your data is safe"

**Step 4: Fix Bug**

- Identify root cause
- Fix code
- Deploy patch contracts (if needed)
- Test thoroughly

**Step 5: Resume**

- Unpause contracts
- Switch back to live mode
- Notify users: "VOID testnet is back online!"

---

## PHASE 6 PREPARATION

### What's Next?

**Phase 6 Goals (Weeks 6-8):**
1. Public testnet beta (1,000+ users)
2. 3D world map navigation
3. Guild treasuries + governance
4. DeFi features (swap, stake, vault)
5. Bug bounty program ($10K pool)

**Phase 6 Prerequisites:**
- Phase 5 deployed successfully
- 100+ beta testers onboarded
- Zero critical bugs in production
- Smart contract audit scheduled

**Estimated Timeline:**
- Week 6: Public beta launch, 3D navigation
- Week 7: Guild features, DeFi features
- Week 8: Bug bounty, stress testing

---

## CONCLUSION

Phase 5 delivers a fully functional decentralized metaverse on Base Sepolia testnet. By the end of Week 5, VOID will have:

- ✅ 4 deployed and verified smart contracts
- ✅ Indexer backend syncing blockchain events
- ✅ Net Protocol real-time messaging
- ✅ Testnet UX guardrails for safety
- ✅ 100+ beta testers exploring the metaverse
- ✅ Monitoring and observability infrastructure

**Next Steps:** Execute Phase 5 deployment sequence, monitor metrics, gather feedback, and prepare for Phase 6 public beta.

---

**Document Version:** 1.0  
**Last Updated:** November 12, 2025  
**Author:** GitHub Copilot  
**Status:** ✅ READY TO EXECUTE
