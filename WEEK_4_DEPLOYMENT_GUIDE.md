# WEEK 4 DEPLOYMENT GUIDE — Phase 1 Completion
**Status:** Ready for Execution  
**Last Updated:** November 10, 2025  
**Objective:** Deploy all Week 1-2 contracts to Base Sepolia and complete full system integration

---

## Prerequisites Checklist

### Environment Setup
- [ ] Node.js installed (v18+ recommended)
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] VS Code or preferred IDE
- [ ] Base Sepolia RPC access (Alchemy, Infura, or public)
- [ ] BaseScan API key (for verification - optional but recommended)

### Wallet Setup
- [ ] Deployer wallet created (NEW wallet for testnet only)
- [ ] Private key secured (NEVER commit to git)
- [ ] Wallet funded with ~0.5 ETH on Base Sepolia
  - Get from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
  - Or: https://www.alchemy.com/faucets/base-sepolia

### Dependencies Installation
```bash
# Install Hardhat and development dependencies
npm install --save-dev \
  hardhat \
  @nomicfoundation/hardhat-toolbox \
  @nomicfoundation/hardhat-verify \
  @nomicfoundation/hardhat-ethers \
  @typechain/hardhat \
  @typechain/ethers-v6 \
  dotenv

# Install Hardhat plugins
npm install --save-dev \
  @nomiclabs/hardhat-ethers \
  @nomiclabs/hardhat-etherscan \
  chai \
  @types/chai
```

---

## Day 1: Contract Deployment

### Step 1: Environment Configuration

1. **Copy environment template:**
```bash
cp .env.example .env
```

2. **Edit .env file with your values:**
```bash
# Required fields:
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
# Or use Alchemy: https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY

DEPLOYER_PRIVATE_KEY=your_private_key_here  # NO 0x prefix

BASESCAN_API_KEY=your_basescan_api_key_here  # Optional but recommended
```

3. **Verify .env is in .gitignore:**
```bash
# Check .gitignore includes:
.env
.env.local
*.env
```

---

### Step 2: Pre-Deployment Validation

**Check deployer wallet balance:**
```bash
# Create balance check script
node -e "
const ethers = require('ethers');
require('dotenv').config();
const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
provider.getBalance(wallet.address).then(balance => {
  console.log('Deployer Address:', wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH');
  if (balance < ethers.parseEther('0.3')) {
    console.log('⚠️  WARNING: Low balance. Need at least 0.5 ETH for deployment.');
  } else {
    console.log('✅ Sufficient balance for deployment.');
  }
});
"
```

**Expected Output:**
```
Deployer Address: 0x...
Balance: 0.8 ETH
✅ Sufficient balance for deployment.
```

---

### Step 3: Deploy Contracts

**Run deployment script:**
```bash
npx hardhat run scripts/deploy/deploy-week2-testnet.ts --network baseSepolia
```

**Expected Timeline:**
- ERC20 Mocks (7 tokens): ~5 minutes
- Week 1 Contracts (4 contracts): ~8 minutes
- Week 2 Infrastructure (6 contracts): ~12 minutes
- Multi-sig Setup: ~2 minutes
- **Total: ~30 minutes**

**Expected Gas Cost:**
- Tokens: ~0.08 ETH
- Week 1: ~0.12 ETH
- Week 2: ~0.18 ETH
- **Total: ~0.38 ETH**

---

### Step 4: Verify Deployment Output

**Check for generated files:**
```bash
# Should create:
deployments/baseSepolia/deployed_addresses.json
deployments/baseSepolia/deployment_summary.txt
deployments/baseSepolia/deployment_log_YYYYMMDD_HHMMSS.txt
```

**Validate deployed_addresses.json structure:**
```json
{
  "network": "baseSepolia",
  "chainId": 84532,
  "deployer": "0x...",
  "deployedAt": "2025-11-10T...",
  "tokens": {
    "PSX": "0x...",
    "CREATE": "0x...",
    "VOID": "0x...",
    "SIGNAL": "0x...",
    "AGENCY": "0x...",
    "USDC_Test": "0x...",
    "WETH_Test": "0x..."
  },
  "week1": {
    "XPOracle": "0x...",
    "MissionRegistry": "0x...",
    "EscrowVault": "0x...",
    "TokenExpansionOracle": "0x..."
  },
  "week2": {
    "VoidHookRouterV4": "0x...",
    "VoidRegistry": "0x...",
    "PolicyManager": "0x...",
    "VoidEmitter": "0x...",
    "VoidTreasury": "0x...",
    "VoidVaultFactory": "0x...",
    "SKUFactory": "0x...",
    "LandRegistry": "0x..."
  },
  "multisigs": {
    "xVoidStakingPool": "0x...",
    "psxTreasury": "0x...",
    "createTreasury": "0x...",
    "agencyWallet": "0x...",
    "creatorGrantsVault": "0x...",
    "securityReserve": "0x..."
  }
}
```

---

### Step 5: Contract Verification on BaseScan

**Run verification script:**
```bash
npx hardhat run scripts/verify/verify-contracts.ts --network baseSepolia
```

**Expected Output:**
```
🔍 VOID CONTRACT VERIFICATION SCRIPT

📂 Loading deployed addresses from:
   deployments/baseSepolia/deployed_addresses.json

✅ Found 25 contracts to verify

Verifying Tokens...
✅ PSX_Test verified: https://sepolia.basescan.org/address/0x...#code
✅ CREATE_Test verified: https://sepolia.basescan.org/address/0x...#code
...

Verifying Week 1 Contracts...
✅ XPOracle verified
✅ MissionRegistry verified
...

Verifying Week 2 Contracts...
✅ VoidHookRouterV4 verified
✅ SKUFactory verified
...

📊 Verification Summary:
   Total: 25 contracts
   Verified: 25 ✅
   Failed: 0 ❌
   Success Rate: 100%

📄 Results saved to: deployments/baseSepolia/VERIFIED_ADDRESSES.json
```

---

### Step 6: Fee Distribution Validation

**Test fee routing:**
```bash
npx hardhat run scripts/validate/test-fee-distribution.ts --network baseSepolia
```

**Expected Output:**
```
🧪 VOID FEE DISTRIBUTION TEST

Router Address: 0x...
Test Token: USDC_Test (0x...)

Creating test SKU with 100 USDC purchase...
✅ SKU created: #1

Simulating 100 USDC purchase...
✅ Purchase complete

📊 Fee Distribution Results:

Creator Wallet: 40.00 USDC (40%) ✅
xVOID Staking Pool: 20.00 USDC (20%) ✅
PSX Treasury: 10.00 USDC (10%) ✅
CREATE Treasury: 10.00 USDC (10%) ✅
Agency Wallet: 10.00 USDC (10%) ✅
Creator Grants: 5.00 USDC (5%) ✅
Security Reserve: 5.00 USDC (5%) ✅

Total Distributed: 100.00 USDC
Fee Model: 40/20/10/10/10/5/5 ✅ APPROVED

✅ All fee distributions match expected splits!
```

---

### Step 7: Update .env with Deployed Addresses

**Automatically update .env (or manually):**
```bash
# Create update script
node scripts/utils/update-env-addresses.js
```

**Or manually copy from deployed_addresses.json to .env:**
```bash
# Update these lines in .env:
NEXT_PUBLIC_XP_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_MISSION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_VOID_HOOK_ROUTER_V4_ADDRESS=0x...
# ... etc for all contracts
```

---

## Day 2: HUD Integration with Live Contracts

### Step 1: Create Contract Address Constants

**File:** `lib/contracts/addresses.ts`
```typescript
import { Address } from 'viem';

export const CONTRACTS = {
  // Week 1
  XP_ORACLE: process.env.NEXT_PUBLIC_XP_ORACLE_ADDRESS as Address,
  MISSION_REGISTRY: process.env.NEXT_PUBLIC_MISSION_REGISTRY_ADDRESS as Address,
  ESCROW_VAULT: process.env.NEXT_PUBLIC_ESCROW_VAULT_ADDRESS as Address,
  
  // Week 2
  VOID_HOOK_ROUTER: process.env.NEXT_PUBLIC_VOID_HOOK_ROUTER_V4_ADDRESS as Address,
  SKU_FACTORY: process.env.NEXT_PUBLIC_SKU_FACTORY_ADDRESS as Address,
  VOID_EMITTER: process.env.NEXT_PUBLIC_VOID_EMITTER_ADDRESS as Address,
  LAND_REGISTRY: process.env.NEXT_PUBLIC_LAND_REGISTRY_ADDRESS as Address,
  VAULT_FACTORY: process.env.NEXT_PUBLIC_VOID_VAULT_FACTORY_ADDRESS as Address,
  
  // Tokens
  PSX: process.env.NEXT_PUBLIC_PSX_TOKEN_ADDRESS as Address,
  CREATE: process.env.NEXT_PUBLIC_CREATE_TOKEN_ADDRESS as Address,
  VOID: process.env.NEXT_PUBLIC_VOID_TOKEN_ADDRESS as Address,
  SIGNAL: process.env.NEXT_PUBLIC_SIGNAL_TOKEN_ADDRESS as Address,
  USDC: process.env.NEXT_PUBLIC_USDC_TEST_ADDRESS as Address,
};

// Validation helper
export function validateContractAddresses(): boolean {
  const missing: string[] = [];
  
  Object.entries(CONTRACTS).forEach(([key, value]) => {
    if (!value || value === '0x' || value === '') {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing contract addresses:', missing);
    return false;
  }
  
  console.log('✅ All contract addresses configured');
  return true;
}
```

---

### Step 2: Update HUD Components with Live Contract Calls

**Components to Update:**

#### A. Player Stats → XPOracle
**File:** `hud/header/PlayerChipV2.tsx`
```typescript
// Before (mock):
const xp = 6750;
const rank = "Gold";

// After (live):
import { CONTRACTS } from '@/lib/contracts/addresses';
import { useReadContract } from 'wagmi';

const { data: xpData } = useReadContract({
  address: CONTRACTS.XP_ORACLE,
  abi: XPOracleABI,
  functionName: 'getXP',
  args: [userAddress],
  watch: true, // Real-time updates
});

const xp = xpData ? Number(xpData) : 0;
const rank = getRankFromXP(xp);
```

#### B. Parcel Info → LandRegistry
**File:** `hud/rails/left/ParcelInfoPanel.tsx`
```typescript
// Before (mock):
const parcelOwner = "0x...";

// After (live):
const { data: parcelData } = useReadContract({
  address: CONTRACTS.LAND_REGISTRY,
  abi: LandRegistryABI,
  functionName: 'getParcelInfo',
  args: [parcelId],
});

const parcelOwner = parcelData?.owner;
const parcelDistrict = parcelData?.district;
```

#### C. Mission Panels → MissionRegistry
**File:** `hud/rails/left/WorldMissionsPanel.tsx`
```typescript
// Before (mock array):
const missions = MOCK_MISSIONS;

// After (live):
const { data: activeMissionIds } = useReadContract({
  address: CONTRACTS.MISSION_REGISTRY,
  abi: MissionRegistryABI,
  functionName: 'getActiveMissions',
  args: [HubType.WORLD],
});

const { data: missionsData } = useReadContracts({
  contracts: activeMissionIds?.map(id => ({
    address: CONTRACTS.MISSION_REGISTRY,
    abi: MissionRegistryABI,
    functionName: 'getMission',
    args: [id],
  })) || [],
});
```

#### D. Creator Royalties → VoidHookRouter
**File:** `hud/creator/CreatorEarningsPanel.tsx`
```typescript
// Before (mock):
const royalties = "$1,250";

// After (live):
const { data: creatorStats } = useReadContract({
  address: CONTRACTS.VOID_HOOK_ROUTER,
  abi: VoidHookRouterABI,
  functionName: 'getCreatorEarnings',
  args: [creatorAddress],
});

const royalties = creatorStats ? formatUSDC(creatorStats.totalEarned) : "$0";
```

---

### Step 3: Test Hub Switching

**Checklist:**
- [ ] WORLD hub loads without errors
- [ ] DEFI hub displays vault data
- [ ] CREATOR hub shows royalty stats
- [ ] AI_OPS hub loads telemetry
- [ ] GOVERNANCE hub (if implemented) loads proposals
- [ ] No console errors during hub transitions
- [ ] Hub state persists after navigation

**Test Script:**
```typescript
// test/hud-integration.test.ts
describe('HUD Live Contract Integration', () => {
  it('should load player XP from XPOracle', async () => {
    const xp = await getPlayerXP(testAddress);
    expect(xp).toBeGreaterThanOrEqual(0);
  });
  
  it('should load active missions from MissionRegistry', async () => {
    const missions = await getActiveMissions(HubType.WORLD);
    expect(missions).toBeDefined();
  });
  
  it('should load parcel info from LandRegistry', async () => {
    const parcel = await getParcelInfo(0); // Parcel #0
    expect(parcel.owner).toBeDefined();
  });
});
```

---

### Step 4: Event Timing Optimization

**Create event aggregation service:**

**File:** `lib/contracts/event-aggregator.ts`
```typescript
/**
 * Aggregates contract events to reduce individual API calls
 * Batch queries every 5 seconds instead of per-component
 */

export class ContractEventAggregator {
  private static instance: ContractEventAggregator;
  private eventCache: Map<string, any> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new ContractEventAggregator();
    }
    return this.instance;
  }
  
  start() {
    // Batch fetch every 5 seconds
    this.updateInterval = setInterval(() => {
      this.fetchAllEvents();
    }, 5000);
  }
  
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
  
  async fetchAllEvents() {
    // Batch query:
    // - XPOracle XPUpdated events
    // - MissionRegistry MissionCompleted events
    // - VoidEmitter ActionLogged events
    // - VoidHookRouter FeeDistributed events
    
    // Cache results for components to read
  }
  
  getEvent(key: string) {
    return this.eventCache.get(key);
  }
}
```

---

## Day 3: AI Telemetry Daemon Validation

### Step 1: Start Telemetry Service

```bash
# Start daemon in background
node scripts/ai-telemetry.js daemon &

# Or use PM2 for production-like monitoring:
npm install -g pm2
pm2 start scripts/ai-telemetry.js --name void-telemetry -- daemon
pm2 logs void-telemetry
```

---

### Step 2: Monitor Telemetry Output

**Check logs directory:**
```bash
# Should see new files every 60 seconds:
ls -la logs/ai/telemetry/

# Expected files:
mission_telemetry.json       # Updated every 60s
emission_telemetry.json      # Updated every 60s
vault_telemetry.json         # Updated every 60s
aggregated_telemetry.json    # Updated every 60s
```

**Sample aggregated_telemetry.json:**
```json
{
  "timestamp": "2025-11-10T14:23:45.123Z",
  "systemHealth": "ALL_HEALTHY",
  "uptime": 900,
  "cycleCount": 15,
  "services": {
    "missionAI": {
      "status": "ONLINE",
      "activeMissions": 9,
      "completionRate": 0.42
    },
    "emissionAI": {
      "status": "ONLINE",
      "treasuryBalance": 75000,
      "status": "HEALTHY",
      "runway": 15
    },
    "vaultAI": {
      "status": "ONLINE",
      "totalVaults": 4,
      "systemHealth": "HEALTHY"
    }
  },
  "errors": []
}
```

---

### Step 3: Validate 15-Minute Run

**After 15 minutes, check:**
```bash
# Should have 15 cycles (1 per minute)
cat logs/ai/telemetry/aggregated_telemetry.json | jq '.cycleCount'
# Expected: 15

# Check for errors
cat logs/ai/telemetry/aggregated_telemetry.json | jq '.errors'
# Expected: []
```

---

## Day 4: Land Grid Migration (1,600 Parcels)

### Step 1: Database Setup

**Create migration file:**
```sql
-- migrations/001_land_grid_setup.sql

CREATE TABLE IF NOT EXISTS land_parcels (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER UNIQUE NOT NULL,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  owner_address VARCHAR(42) DEFAULT '0x0000000000000000000000000000000000000000',
  district VARCHAR(20) DEFAULT 'UNASSIGNED',
  price_usdc DECIMAL(18, 6) DEFAULT 0,
  is_listed BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX idx_grid_coords ON land_parcels(grid_x, grid_y);
CREATE INDEX idx_owner ON land_parcels(owner_address);
CREATE INDEX idx_district ON land_parcels(district);

-- Insert 1,600 parcels (40x40 grid)
INSERT INTO land_parcels (parcel_id, grid_x, grid_y, district)
SELECT 
  (y * 40 + x) AS parcel_id,
  x AS grid_x,
  y AS grid_y,
  CASE
    WHEN x < 10 AND y < 10 THEN 'DEFI_DISTRICT'
    WHEN x >= 30 AND y < 10 THEN 'CREATOR_QUARTER'
    WHEN x < 10 AND y >= 30 THEN 'GOVERNANCE_PLAZA'
    WHEN x >= 15 AND x < 25 AND y >= 15 AND y < 25 THEN 'CENTRAL_HUB'
    ELSE 'WORLD_LANDS'
  END AS district
FROM 
  generate_series(0, 39) AS x,
  generate_series(0, 39) AS y;
```

**Run migration:**
```bash
# Using PostgreSQL
psql $DATABASE_URL -f migrations/001_land_grid_setup.sql

# Or using Supabase CLI
supabase db push
```

---

### Step 2: Verify Parcel Data

**Query test parcels:**
```sql
-- Check corner parcels
SELECT * FROM land_parcels WHERE parcel_id IN (0, 39, 1560, 1599);

-- Check district distribution
SELECT district, COUNT(*) FROM land_parcels GROUP BY district;

-- Expected output:
-- DEFI_DISTRICT: 100 (10x10)
-- CREATOR_QUARTER: 100 (10x10)
-- GOVERNANCE_PLAZA: 100 (10x10)
-- CENTRAL_HUB: 100 (10x10)
-- WORLD_LANDS: 1200 (remaining)
```

---

### Step 3: Test WORLD Hub Parcel Display

**Update ParcelInfoPanel to read from DB:**
```typescript
// hud/rails/left/ParcelInfoPanel.tsx
import { useParcelInfo } from '@/hooks/useParcelInfo';

export function ParcelInfoPanel({ parcelId }: { parcelId: number }) {
  const { data: parcel, isLoading } = useParcelInfo(parcelId);
  
  if (isLoading) return <LoadingSkeleton />;
  
  return (
    <div className="parcel-info">
      <h3>Parcel #{parcel.parcel_id}</h3>
      <p>Coordinates: ({parcel.grid_x}, {parcel.grid_y})</p>
      <p>District: {parcel.district}</p>
      <p>Owner: {parcel.owner_address}</p>
      {parcel.is_listed && <p>Price: {parcel.price_usdc} USDC</p>}
    </div>
  );
}
```

**Test in browser:**
- [ ] Open WORLD hub
- [ ] Click on different parcels
- [ ] Verify coordinates display correctly
- [ ] Check district labels match
- [ ] Note any missing data or visual bugs

---

## Day 5: System Heartbeat and Stability Check

### Create Heartbeat Script

**File:** `scripts/system/heartbeat.ts`
```typescript
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

interface ServiceHealth {
  name: string;
  endpoint: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  responseTime: number;
  lastCheck: string;
  error?: string;
}

interface HeartbeatReport {
  timestamp: string;
  overallHealth: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  services: ServiceHealth[];
  uptime24h: number; // percentage
}

async function checkContractHealth(
  address: string,
  abi: any[],
  functionName: string,
  provider: ethers.Provider
): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const contract = new ethers.Contract(address, abi, provider);
    await contract[functionName]();
    
    return {
      name: functionName,
      endpoint: address,
      status: 'UP',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      name: functionName,
      endpoint: address,
      status: 'DOWN',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: error.message,
    };
  }
}

async function runHeartbeat(): Promise<HeartbeatReport> {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
  const deployed = JSON.parse(
    fs.readFileSync('deployments/baseSepolia/deployed_addresses.json', 'utf-8')
  );
  
  const services: ServiceHealth[] = [];
  
  // Check XPOracle
  services.push(await checkContractHealth(
    deployed.week1.XPOracle,
    ['function getXP(address) view returns (uint256)'],
    'getXP',
    provider
  ));
  
  // Check MissionRegistry
  services.push(await checkContractHealth(
    deployed.week1.MissionRegistry,
    ['function getActiveMissions(uint8) view returns (uint256[])'],
    'getActiveMissions',
    provider
  ));
  
  // Check VoidHookRouter
  services.push(await checkContractHealth(
    deployed.week2.VoidHookRouterV4,
    ['function getFeeProfile(address) view returns (tuple)'],
    'getFeeProfile',
    provider
  ));
  
  // Check LandRegistry
  services.push(await checkContractHealth(
    deployed.week2.LandRegistry,
    ['function getParcelInfo(uint256) view returns (tuple)'],
    'getParcelInfo',
    provider
  ));
  
  // Check AI telemetry files
  const telemetryPath = 'logs/ai/telemetry/aggregated_telemetry.json';
  if (fs.existsSync(telemetryPath)) {
    const telemetry = JSON.parse(fs.readFileSync(telemetryPath, 'utf-8'));
    const age = Date.now() - new Date(telemetry.timestamp).getTime();
    
    services.push({
      name: 'AI Telemetry',
      endpoint: telemetryPath,
      status: age < 120000 ? 'UP' : 'DEGRADED', // 2 minutes max age
      responseTime: age,
      lastCheck: new Date().toISOString(),
    });
  }
  
  // Check database connectivity
  // (Add your DB check here)
  
  // Calculate overall health
  const downServices = services.filter(s => s.status === 'DOWN').length;
  const degradedServices = services.filter(s => s.status === 'DEGRADED').length;
  
  let overallHealth: 'HEALTHY' | 'DEGRADED' | 'DOWN' = 'HEALTHY';
  if (downServices > 0) overallHealth = 'DOWN';
  else if (degradedServices > 0) overallHealth = 'DEGRADED';
  
  // Calculate 24h uptime (simplified - would need historical data)
  const uptime24h = ((services.length - downServices) / services.length) * 100;
  
  return {
    timestamp: new Date().toISOString(),
    overallHealth,
    services,
    uptime24h,
  };
}

async function main() {
  console.log('🩺 Running system heartbeat...\n');
  
  const report = await runHeartbeat();
  
  console.log(`System Health: ${report.overallHealth}`);
  console.log(`24h Uptime: ${report.uptime24h.toFixed(2)}%\n`);
  
  console.log('Service Status:');
  report.services.forEach(service => {
    const icon = service.status === 'UP' ? '✅' : service.status === 'DEGRADED' ? '⚠️' : '❌';
    console.log(`${icon} ${service.name}: ${service.responseTime}ms`);
    if (service.error) {
      console.log(`   Error: ${service.error}`);
    }
  });
  
  // Save report
  const reportPath = path.join('logs', 'system', `heartbeat_${new Date().toISOString().split('T')[0]}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Report saved: ${reportPath}`);
  
  // Exit with error code if system unhealthy
  process.exit(report.overallHealth === 'DOWN' ? 1 : 0);
}

main();
```

**Run heartbeat:**
```bash
npx ts-node scripts/system/heartbeat.ts
```

**Expected output:**
```
🩺 Running system heartbeat...

System Health: HEALTHY
24h Uptime: 100.00%

Service Status:
✅ getXP: 245ms
✅ getActiveMissions: 312ms
✅ getFeeProfile: 198ms
✅ getParcelInfo: 276ms
✅ AI Telemetry: 1523ms

📄 Report saved: logs/system/heartbeat_2025-11-10.json
```

---

## Day 6: HUD Optimization Pass

### Performance Targets
- CPU usage: ≤30% during normal operation
- Memory: <500MB
- FPS: ≥30fps in 3D world
- Hub transition: <500ms

### Optimization Checklist

#### A. Reduce Re-renders
```typescript
// Use React.memo for expensive components
export const PlayerChipV2 = React.memo(({ userId }: PlayerChipProps) => {
  // Only re-render when userId changes
});

// Use useMemo for derived data
const rankProgress = useMemo(() => {
  return calculateRankProgress(xp);
}, [xp]);

// Use useCallback for event handlers
const handleMissionClick = useCallback((missionId: number) => {
  openMissionDetails(missionId);
}, []);
```

#### B. Lazy Load Heavy Components
```typescript
// Lazy load 3D components
const WorldGrid3D = lazy(() => import('@/components/world/WorldGrid3D'));

// Lazy load panel windows
const CreatorDashboard = lazy(() => import('@/hud/creator/CreatorDashboardWindow'));
```

#### C. Debounce Frequent Updates
```typescript
// Debounce parcel hover updates
const debouncedParcelHover = useMemo(
  () => debounce((parcelId: number) => {
    setHoveredParcel(parcelId);
  }, 100),
  []
);
```

#### D. Optimize Event Listeners
```typescript
// Use event aggregation instead of individual listeners
const eventAggregator = ContractEventAggregator.getInstance();
eventAggregator.start();

// Components read from cache instead of direct RPC calls
const xpUpdates = eventAggregator.getEvent('xp_updates');
```

---

### Measure Performance

**Create benchmark script:**
```typescript
// scripts/benchmark/hud-performance.ts
import { performance } from 'perf_hooks';

async function measureHubSwitch() {
  const start = performance.now();
  // Switch from WORLD to DEFI hub
  await switchHub(HubType.DEFI);
  const end = performance.now();
  
  console.log(`Hub switch time: ${end - start}ms`);
  return end - start;
}

async function measureComponentRender() {
  const start = performance.now();
  // Render PlayerChipV2
  render(<PlayerChipV2 userId="0x..." />);
  const end = performance.now();
  
  console.log(`Component render time: ${end - start}ms`);
  return end - start;
}

// Run benchmarks
measureHubSwitch();
measureComponentRender();
```

---

## Day 7: Phase 1 Completion Review

### Final Validation Checklist

#### Contracts ✅
- [ ] All 25 contracts deployed to Base Sepolia
- [ ] All contracts verified on BaseScan
- [ ] Fee distribution tested (40/20/10/10/10/5/5)
- [ ] No contract errors in 24h monitoring

#### HUD ✅
- [ ] Player stats read from XPOracle
- [ ] Missions load from MissionRegistry
- [ ] Parcels display from LandRegistry
- [ ] Creator royalties from VoidHookRouter
- [ ] Hub switching <500ms
- [ ] CPU usage ≤30%
- [ ] No console errors during normal operation

#### AI Telemetry ✅
- [ ] Daemon running continuously
- [ ] JSON logs updating every 60s
- [ ] All 3 services reporting HEALTHY
- [ ] No errors in 15-minute test
- [ ] Aggregated telemetry accurate

#### Land Grid ✅
- [ ] 1,600 parcels in database
- [ ] District assignments correct
- [ ] Parcel queries fast (<100ms)
- [ ] WORLD hub displays parcel info
- [ ] No missing texture errors

#### System Health ✅
- [ ] Heartbeat script passing
- [ ] All services <500ms response
- [ ] 24h uptime ≥95%
- [ ] No critical errors logged

#### Cosmetics 🔒
- [ ] All cosmetic UI shows "LOCKED" badges
- [ ] No cosmetic purchases possible
- [ ] Specification remains documentation-only
- [ ] Phase 2 gate enforced

---

### Export Final Build Artifacts

```bash
# Create Phase 1 completion package
mkdir -p phase1-complete

# Copy deployment artifacts
cp deployments/baseSepolia/deployed_addresses.json phase1-complete/
cp deployments/baseSepolia/VERIFIED_ADDRESSES.json phase1-complete/

# Copy telemetry summary
cp logs/ai/telemetry/aggregated_telemetry.json phase1-complete/telemetry_snapshot.json

# Copy heartbeat report
cp logs/system/heartbeat_$(date +%Y-%m-%d).json phase1-complete/

# Copy environment template (NO PRIVATE KEYS)
cp .env.example phase1-complete/

# Create database snapshot
pg_dump $DATABASE_URL > phase1-complete/land_grid_snapshot.sql

# Create archive
tar -czf phase1-complete-$(date +%Y%m%d).tar.gz phase1-complete/

echo "✅ Phase 1 complete package created"
```

---

### Mark Build as Phase 1 Complete

**If all checklists pass, create completion marker:**

```bash
# Create marker file
echo "{
  \"phase\": 1,
  \"status\": \"COMPLETE\",
  \"completedAt\": \"$(date -Iseconds)\",
  \"contracts\": {
    \"deployed\": 25,
    \"verified\": 25,
    \"network\": \"Base Sepolia\",
    \"feeModel\": \"40/20/10/10/10/5/5\"
  },
  \"hud\": {
    \"version\": \"v1.0\",
    \"hubsImplemented\": [\"WORLD\", \"DEFI\", \"CREATOR\", \"AI_OPS\"],
    \"liveContractIntegration\": true
  },
  \"ai\": {
    \"telemetryVersion\": \"v1.0\",
    \"services\": [\"MissionAI\", \"EmissionAI\", \"VaultAI\"],
    \"updateInterval\": 60
  },
  \"land\": {
    \"gridSize\": 40,
    \"totalParcels\": 1600,
    \"districtsImplemented\": 5
  },
  \"cosmetics\": {
    \"status\": \"LOCKED\",
    \"unlockConditions\": {
      \"hud\": \"STABLE\",
      \"contracts\": \"DEPLOYED\",
      \"ai\": \"RESPONSIVE\"
    }
  },
  \"readyForPhase2\": true
}" > PHASE_1_COMPLETE.json

cat PHASE_1_COMPLETE.json
```

**Expected Output:**
```json
{
  "phase": 1,
  "status": "COMPLETE",
  "completedAt": "2025-11-10T18:00:00Z",
  "contracts": {
    "deployed": 25,
    "verified": 25,
    "network": "Base Sepolia",
    "feeModel": "40/20/10/10/10/5/5"
  },
  "hud": {
    "version": "v1.0",
    "hubsImplemented": ["WORLD", "DEFI", "CREATOR", "AI_OPS"],
    "liveContractIntegration": true
  },
  "ai": {
    "telemetryVersion": "v1.0",
    "services": ["MissionAI", "EmissionAI", "VaultAI"],
    "updateInterval": 60
  },
  "land": {
    "gridSize": 40,
    "totalParcels": 1600,
    "districtsImplemented": 5
  },
  "cosmetics": {
    "status": "LOCKED",
    "unlockConditions": {
      "hud": "STABLE",
      "contracts": "DEPLOYED",
      "ai": "RESPONSIVE"
    }
  },
  "readyForPhase2": true
}
```

---

## Troubleshooting

### Deployment Failures

**"Insufficient funds"**
```bash
# Check deployer balance
node -e "..."  # (from Step 2 above)

# Fund wallet with Base Sepolia ETH
# Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
```

**"Contract creation code storage out of gas"**
```bash
# Increase gas limit in hardhat.config.ts:
gas: 10000000

# Or disable optimizer:
optimizer: { enabled: false }
```

**"Nonce too low"**
```bash
# Reset deployer nonce manually:
npx hardhat run scripts/utils/reset-nonce.ts --network baseSepolia
```

---

### HUD Integration Issues

**"Contract function doesn't exist"**
- Verify ABI matches deployed contract
- Check contract address is correct
- Ensure contract verified on BaseScan

**"Call revert exception"**
- Check function parameters match types
- Verify contract has required permissions
- Test function on BaseScan first

**"Too many RPC requests"**
- Implement event aggregation (see Day 2 Step 4)
- Use caching for static data
- Batch multicall requests

---

### Telemetry Issues

**"JSON files not updating"**
```bash
# Check daemon is running:
ps aux | grep ai-telemetry

# Restart daemon:
pkill -f ai-telemetry
node scripts/ai-telemetry.js daemon &
```

**"Permission denied writing to logs/"**
```bash
# Create logs directories:
mkdir -p logs/ai/telemetry logs/treasury logs/system

# Fix permissions:
chmod -R 755 logs/
```

---

## Next Steps After Phase 1

Once all Day 1-7 checklists pass:

1. **Phase 2 Unlock Decision**
   - Review cosmetics spec one final time
   - Approve Phase 2 cosmetics implementation
   - Set timeline for creator onboarding

2. **Mission Expansion**
   - Deploy MissionAI mission generation
   - Add cosmetic-linked missions
   - Test mission rewards distribution

3. **Creator Onboarding**
   - Invite first 10 creators
   - Test SKU creation flow
   - Validate royalty payments

4. **Mainnet Preparation**
   - Security audit contracts
   - Deploy to Base mainnet
   - Migrate testnet data

---

**Document Version:** 1.0  
**Status:** Ready for Execution  
**Estimated Completion:** 7 days  
**Dependencies:** Hardhat, Base Sepolia RPC, funded wallet (~0.5 ETH)
