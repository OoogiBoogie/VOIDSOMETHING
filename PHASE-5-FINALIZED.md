# PHASE 5 — FINALIZED IMPLEMENTATION GUIDE

**Status**: ✅ **READY FOR DEPLOYMENT**  
**Date**: November 14, 2025  
**Scope**: Phase 5.0-5A Complete + Net Protocol + Bypass Mode

---

## QUICK START

### Run Locally

```bash
npm install --legacy-peer-deps
cp .env.phase5 .env.local  # Fill in your values
npm run dev
```

### Deploy to Vercel (Sepolia)

```bash
# 1. Deploy contracts
./contracts/deployment/deploy-contracts.sh sepolia

# 2. Set environment variables in Vercel dashboard
NEXT_PUBLIC_CHAIN_ENV=sepolia
# ... (see Environment section below)

# 3. Deploy
vercel
```

---

## IMPLEMENTATION SUMMARY

### ✅ Phase 5.0 — Player Lifecycle
- **Files**: `world/lifecycle/*` (4 files)
- **Features**: 7 lifecycle stages, session tracking, idle detection
- **Integration**: Auto-wired to event bus

### ✅ Phase 5.1 — HUD Event Pipeline
- **Files**: `hud/pipeline/*` (5 files)
- **Features**: Event adapter, toast queue, map sync, React hooks
- **Integration**: Auto-converts world events to UI toasts/highlights

### ✅ Phase 5.2 — Global Player State
- **Files**: `state/player/*` (4 files)
- **Features**: Zustand store, 30+ actions, 20+ selectors, persistence
- **Integration**: Auto-synced via eventStateBridge

### ✅ Phase 5.3 — Interaction System
- **Files**: `world/interaction/*` (5 files)
- **Features**: Raycast detection, "Press E" system, proximity triggers
- **Integration**: Emits interaction events to analytics

### ✅ Phase 5.4 — World Events & Analytics
- **Files**: `world/eventStateBridge.ts`, `app/api/world-events/route.ts`
- **Features**: 24 event types, batch analytics, graceful error handling
- **Database**: `world_events`, `parcel_entries`, `district_entries`, `player_sessions`

### ✅ Phase 5A — Infrastructure
- **Contracts**: VoidWorldRegistry, ParcelOwnership, PlayerPositionOracle, VoidAirdropTracker
- **Deployment**: Foundry scripts for Sepolia + Mainnet
- **Database**: Postgres schema with indexes + materialized views

### ✅ Net Protocol Integration
- **File**: `lib/net/netClient.ts`
- **Rule**: Profiles ONLY on mainnet (Sepolia = chat + storage only)
- **Features**: Safe APIs, capability flags, React gatekeepers

### ✅ Bypass Mode
- **File**: `lib/bypass/bypassMode.ts`
- **Activation**: `?bypass=true`
- **Features**: Guest sessions, analytics tracking, 24h expiry

---

## CRITICAL DEPLOYMENT RULES

### 🚨 Net Protocol Profiles = Mainnet ONLY

**Base Sepolia**:
```typescript
NET_CAPABILITIES.chat = true       ✅
NET_CAPABILITIES.storage = true    ✅
NET_CAPABILITIES.profiles = false  ❌ (returns null)
```

**Base Mainnet**:
```typescript
NET_CAPABILITIES.chat = true       ✅
NET_CAPABILITIES.storage = true    ✅
NET_CAPABILITIES.profiles = true   ✅
```

**Code Enforcement**:
```typescript
import { hasProfilesEnabled, getProfileSafe } from '@/lib/net/netClient';

// Always check before using profiles
if (hasProfilesEnabled()) {
  const profile = await getProfileSafe(userId);
}
```

### 🔒 Wallet Connection Behavior

**NO Auto-Connect**:
- `createStorage({ storage: memoryStorage })`
- Session cleared on browser close
- User must explicitly reconnect each visit

**30-Min Idle Logout**:
- Activity tracked via mouse/keyboard/touch events
- Auto-disconnect after 30min idle
- Session saved to analytics before disconnect

### 🎮 Bypass Mode

**Enabled**: Set `NEXT_PUBLIC_ENABLE_BYPASS_MODE=true`

**URL**: `https://void.game/?bypass=true`

**Behavior**:
- Creates guest session (wallet = `0xBYPASS{uuid}`)
- All events tagged with `loginMethod: "bypass"`
- Session stored in `sessionStorage` (24h expiry)
- Analytics tracks separately

---

## ENVIRONMENT CONFIGURATION

### Required Variables

```bash
# Chain (CRITICAL!)
NEXT_PUBLIC_CHAIN_ENV=sepolia  # or mainnet

# RPC
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# Database (Supabase)
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Net Protocol
NEXT_PUBLIC_NET_PROTOCOL_API_KEY=...

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...

# Contracts (Sepolia — fill after deployment)
NEXT_PUBLIC_WORLD_REGISTRY_SEPOLIA=0x...
NEXT_PUBLIC_PARCEL_OWNERSHIP_SEPOLIA=0x...
NEXT_PUBLIC_PLAYER_ORACLE_SEPOLIA=0x...
NEXT_PUBLIC_AIRDROP_TRACKER_SEPOLIA=0x...

# Contracts (Mainnet — fill after deployment)
NEXT_PUBLIC_WORLD_REGISTRY_MAINNET=0x...
NEXT_PUBLIC_PARCEL_OWNERSHIP_MAINNET=0x...
NEXT_PUBLIC_PLAYER_ORACLE_MAINNET=0x...
NEXT_PUBLIC_AIRDROP_TRACKER_MAINNET=0x...

# Feature Flags
NEXT_PUBLIC_ENABLE_BYPASS_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Vercel Configuration

**Preview (Staging)**:
- Environment: Sepolia
- Database: Staging Postgres
- Contracts: Sepolia addresses

**Production (Mainnet)**:
- Environment: Mainnet
- Database: Production Postgres
- Contracts: Mainnet addresses
- ✅ Net Protocol profiles ENABLED

---

## INTEGRATION CHECKLIST

### In `VoidGameShell.tsx`

```typescript
import { eventStateBridge } from '@/world/eventStateBridge';
import { hudEventAdapter } from '@/hud/pipeline';
import { interactionManager } from '@/world/interaction';
import { usePlayerState } from '@/state/player';

export function VoidGameShell() {
  const { address } = useAccount();
  const updatePosition = usePlayerState((s) => s.updatePosition);
  
  useEffect(() => {
    if (address) {
      // Start all Phase 5 systems
      eventStateBridge.start();
      hudEventAdapter.start();
      interactionManager.start(address);
    }
    
    return () => {
      eventStateBridge.stop();
      hudEventAdapter.stop();
      interactionManager.stop();
    };
  }, [address]);
  
  // Update position in animation loop
  useFrame(() => {
    const pos = playerRef.current.position;
    updatePosition({ x: pos.x, y: pos.y, z: pos.z });
    interactionManager.updatePlayerPosition(pos);
  });
  
  // ... rest of component
}
```

### In Wallet Provider

```typescript
import { playerLifecycleManager } from '@/world/lifecycle';
import { usePlayerState } from '@/state/player';

function WalletProvider() {
  const { address, isConnected } = useAccount();
  const connect = usePlayerState((s) => s.connect);
  
  useEffect(() => {
    if (isConnected && address) {
      lifecycleManager.onWalletConnect(address, 'wallet');
      connect(address);
    }
  }, [isConnected, address]);
  
  // ... rest
}
```

---

## DATABASE SETUP

### Run Migration

```bash
psql -U postgres -d void_db -f db/migrations/001_phase_5a_schema.sql
```

### Verify Tables

```sql
-- Check tables created
\dt

-- Should see:
-- world_events
-- parcel_entries
-- district_entries
-- player_sessions
-- beta_users
-- player_activity_summary (materialized view)
```

### Test Analytics

```sql
-- Insert test event
INSERT INTO world_events (event_type, timestamp, wallet_address, payload)
VALUES ('TEST', NOW(), '0x123', '{"test": true}'::jsonb);

-- Query
SELECT * FROM world_events LIMIT 5;
```

---

## CONTRACT DEPLOYMENT

### Prerequisites

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify
forge --version
```

### Deploy to Sepolia

```bash
# Set .env variables
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=0x...  # YOUR PRIVATE KEY (funded with Base Sepolia ETH)
BASESCAN_API_KEY=...

# Deploy
chmod +x contracts/deployment/deploy-contracts.sh
./contracts/deployment/deploy-contracts.sh sepolia
```

### Verify Deployment

Check `deployments/sepolia-addresses.json`:
```json
{
  "network": "sepolia",
  "chainId": 84532,
  "contracts": {
    "worldRegistry": "0x...",
    "parcelOwnership": "0x...",
    "playerOracle": "0x...",
    "airdropTracker": "0x..."
  }
}
```

### Update .env

```bash
NEXT_PUBLIC_WORLD_REGISTRY_SEPOLIA=0x...  # from deployment output
NEXT_PUBLIC_PARCEL_OWNERSHIP_SEPOLIA=0x...
NEXT_PUBLIC_PLAYER_ORACLE_SEPOLIA=0x...
NEXT_PUBLIC_AIRDROP_TRACKER_SEPOLIA=0x...
```

---

## TESTING

### 1. Local Testing

```bash
npm run dev
```

**Check**:
- ✅ Wallet connects (no auto-reconnect)
- ✅ Move around → see parcel toasts
- ✅ Visit `http://localhost:3000/?bypass=true` → guest mode indicator
- ✅ Check browser console for lifecycle events

### 2. Analytics Verification

```sql
-- Check events logged
SELECT event_type, COUNT(*) 
FROM world_events 
GROUP BY event_type;

-- Check parcel visits
SELECT wallet_address, parcel_x, parcel_z, is_first_visit 
FROM parcel_entries 
ORDER BY timestamp DESC 
LIMIT 10;

-- Check sessions
SELECT wallet_address, started_at, ended_at, duration_seconds 
FROM player_sessions 
ORDER BY started_at DESC 
LIMIT 10;
```

### 3. Net Protocol Testing

**On Sepolia**:
```typescript
import { NET_CAPABILITIES } from '@/lib/net/netClient';
console.log(NET_CAPABILITIES.profiles); // Should be false
```

**On Mainnet** (after mainnet deployment):
```typescript
console.log(NET_CAPABILITIES.profiles); // Should be true
```

---

## TROUBLESHOOTING

### Events not saving to DB

```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/world_events \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Check API endpoint
curl -X POST http://localhost:3000/api/world-events \
  -H "Content-Type: application/json" \
  -d '{"events":[{"type":"TEST","timestamp":1234567890}]}'
```

### Profiles not working on Sepolia

✅ **This is expected!** Profiles are mainnet-only. Check:
```typescript
import { hasProfilesEnabled } from '@/lib/net/netClient';
console.log('Profiles enabled?', hasProfilesEnabled()); // false on Sepolia
```

### Bypass mode not activating

1. Check `.env`: `NEXT_PUBLIC_ENABLE_BYPASS_MODE=true`
2. Check URL: `?bypass=true`
3. Check console: Look for `[BypassMode]` logs

---

## PHASE 6 READINESS

Phase 5 prepares the foundation for:

✅ **XP System**: `usePlayerState` has `addXP(amount)`, `level` already tracked  
✅ **Achievements**: `usePlayerState` has `unlockAchievement(id)`, storage ready  
✅ **Social Features**: Session tracking, player activity summary view  
✅ **Advanced Interactions**: Raycast + proximity systems ready for complex mechanics  

**Next**: Implement achievement definitions, XP curves, and social UI.

---

## FILES CREATED (35+)

```
world/
├── lifecycle/ (4 files)
├── interaction/ (5 files)
├── events/ (eventTypes, eventPayloads updated)
└── eventStateBridge.ts

hud/
└── pipeline/ (5 files)

state/
└── player/ (4 files)

lib/
├── net/
│   └── netClient.ts
└── bypass/
    └── bypassMode.ts

app/api/
└── world-events/
    └── route.ts (enhanced)

contracts/deployment/
├── contracts.config.ts
└── deploy-contracts.sh

db/migrations/
└── 001_phase_5a_schema.sql

.env.phase5
PHASE-5-FINALIZED.md (this file)
```

---

**✅ PHASE 5 IMPLEMENTATION COMPLETE**

All systems tested, documented, and ready for deployment.
