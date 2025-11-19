# VOID Burn System - Deployment Guide

**Version:** 1.0  
**Target Networks:** Base Sepolia (testnet) → Base Mainnet  
**Last Updated:** Phase 9 completion

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Testnet Deployment (Base Sepolia)](#testnet-deployment-base-sepolia)
4. [Contract Verification](#contract-verification)
5. [Frontend Integration](#frontend-integration)
6. [Feature Flag Testing](#feature-flag-testing)
7. [Mainnet Deployment](#mainnet-deployment)
8. [Post-Deployment Checklist](#post-deployment-checklist)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The VOID Burn System consists of **7 smart contracts** deployed in a specific order with role-based access control:

### Core Contract
- **VoidBurnUtility**: Central burn mechanism with role management

### Feature Modules (depend on VoidBurnUtility)
- **DistrictAccessBurn**: Unlock premium districts
- **LandUpgradeBurn**: Upgrade land parcels
- **CreatorToolsBurn**: Access creator cosmetic tools
- **PrestigeBurn**: Prestige/rebirth mechanics
- **MiniAppBurnAccess**: Unlock mini-apps

### Governance
- **AIUtilityGovernor**: Dynamic fee adjustment AI (manages all modules)

### Dependency Graph
```
VoidBurnUtility (core)
  ├── DistrictAccessBurn ──┐
  ├── LandUpgradeBurn ─────┤
  ├── CreatorToolsBurn ────┤──> AIUtilityGovernor
  ├── PrestigeBurn ────────┤
  └── MiniAppBurnAccess ───┘
```

---

## Prerequisites

### 1. Environment Setup

Create `.env` file in project root:

```bash
# Deployer wallet (MUST have ETH for gas)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# RPC URL (optional, defaults to public RPC)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Basescan API key for contract verification
BASESCAN_API_KEY=your_basescan_api_key
```

### 2. Deployer Wallet Requirements

**Base Sepolia (testnet):**
- Minimum: **0.01 ETH** (recommended: 0.02 ETH)
- Get testnet ETH: [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

**Base Mainnet:**
- Minimum: **0.05 ETH** (recommended: 0.1 ETH for safety margin)
- Higher gas costs on mainnet

### 3. Contract Dependencies

Ensure VOID token is already deployed:
- **Base Sepolia:** `0x8de4043445939B0D0Cc7d6c752057707279D9893`
- **Base Mainnet:** Update `VOID_TOKEN` constant in deployment script

### 4. Build Contracts

```bash
# Compile all Solidity contracts
npx hardhat compile

# Verify compilation succeeded
ls -la artifacts/contracts/burn/*.sol/*.json
```

---

## Testnet Deployment (Base Sepolia)

### Step 1: Pre-Deployment Checks

Run the enhanced deployment script with safety checks:

```bash
npx hardhat run scripts/deploy-burn-system-enhanced.ts --network baseSepolia
```

The script will automatically verify:
- ✅ Deployer wallet has sufficient ETH balance (≥0.01 ETH)
- ✅ Network is correct (Base Sepolia chain ID: 84532)
- ✅ VOID token contract exists at specified address

### Step 2: Monitor Deployment

The deployment will proceed in order:

```
1️⃣  VoidBurnUtility
2️⃣  DistrictAccessBurn
3️⃣  LandUpgradeBurn
4️⃣  CreatorToolsBurn
5️⃣  PrestigeBurn
6️⃣  MiniAppBurnAccess
7️⃣  AIUtilityGovernor
```

**Expected output:**
```
🔍 Pre-Deployment Checks
========================
Deployer: 0x123...
Balance: 0.02 ETH
✅ Balance check passed
Network: base-sepolia (Chain ID: 84532)
✅ Network check passed
Verifying VOID token at 0x8de...
✅ VOID token verified

1️⃣  ✅ VoidBurnUtility: 0xABC...
2️⃣  ✅ DistrictAccessBurn: 0xDEF...
...
```

### Step 3: Role Granting

The script automatically grants roles:

**BURN_MANAGER_ROLE** (to all feature modules):
- DistrictAccessBurn
- LandUpgradeBurn
- CreatorToolsBurn
- PrestigeBurn
- MiniAppBurnAccess

**GOVERNOR_ROLE** (to AI Governor in each module):
- AIUtilityGovernor → DistrictAccessBurn
- AIUtilityGovernor → LandUpgradeBurn
- AIUtilityGovernor → CreatorToolsBurn
- AIUtilityGovernor → PrestigeBurn

### Step 4: Save Deployment Artifacts

The script creates:
- **`deployments/burn-deployment-base-sepolia-<timestamp>.json`**

Contains:
```json
{
  "network": "base-sepolia",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "voidToken": "0x8de...",
  "contracts": {
    "VoidBurnUtility": "0xABC...",
    "DistrictAccessBurn": "0xDEF...",
    ...
  },
  "envTemplate": {
    "NEXT_PUBLIC_VOID_BURN_UTILITY": "0xABC...",
    ...
  }
}
```

---

## Contract Verification

### Automated Verification

Copy the verification commands from deployment output:

```bash
# Example (use YOUR actual addresses):
npx hardhat verify --network baseSepolia 0xABC... 0x8de...
npx hardhat verify --network baseSepolia 0xDEF... 0xABC...
npx hardhat verify --network baseSepolia 0xGHI... 0xABC...
npx hardhat verify --network baseSepolia 0xJKL... 0xABC...
npx hardhat verify --network baseSepolia 0xMNO... 0xABC...
npx hardhat verify --network baseSepolia 0xPQR... 0xABC...
npx hardhat verify --network baseSepolia 0xSTU... 0xABC... 0xDEF... 0xGHI... 0xJKL... 0xMNO...
```

### Verify on Basescan

Check contracts are verified:
1. Go to [Basescan Sepolia](https://sepolia.basescan.org/)
2. Search for each contract address
3. Verify "Contract" tab shows green checkmark
4. Check "Read Contract" and "Write Contract" tabs are available

---

## Frontend Integration

### Step 1: Update Environment Variables

Add to `.env.local`:

```bash
# Copy from deployment output or deployments/*.json file
NEXT_PUBLIC_VOID_BURN_UTILITY=0xABC...
NEXT_PUBLIC_DISTRICT_ACCESS_BURN=0xDEF...
NEXT_PUBLIC_LAND_UPGRADE_BURN=0xGHI...
NEXT_PUBLIC_CREATOR_TOOLS_BURN=0xJKL...
NEXT_PUBLIC_PRESTIGE_BURN=0xMNO...
NEXT_PUBLIC_MINIAPP_BURN_ACCESS=0xPQR...
NEXT_PUBLIC_AI_UTILITY_GOVERNOR=0xSTU...
```

### Step 2: Verify Contract Config

The type-safe contract config in `config/burnContracts.ts` will automatically load these addresses:

```typescript
import { BURN_CONTRACTS, areBurnContractsDeployed } from '@/config/burnContracts';

// Check if all contracts are configured
const allDeployed = areBurnContractsDeployed();
console.log('Burn contracts deployed:', allDeployed);

// Use in wagmi hooks
const { data } = useReadContract({
  address: BURN_CONTRACTS.districtAccess.address,
  abi: BURN_CONTRACTS.districtAccess.abi,
  functionName: 'getDistrictUnlockFee',
  args: ['DEFI']
});
```

### Step 3: Verify ABIs

Ensure contract ABIs are generated:

```bash
# After hardhat compile, ABIs should exist at:
ls -la contracts/abis/
# Should see:
# - VoidBurnUtility.json
# - DistrictAccessBurn.json
# - LandUpgradeBurn.json
# - CreatorToolsBurn.json
# - PrestigeBurn.json
# - MiniAppBurnAccess.json
# - AIUtilityGovernor.json
```

If ABIs don't exist, run:
```bash
npx hardhat compile
```

---

## Feature Flag Testing

### Phase 1: Disabled State (Default)

**Config:** `config/voidConfig.ts`
```typescript
export const ENABLE_BURN_UI = false;
```

**Verify:**
1. Start dev server: `npm run dev`
2. Open app in browser
3. Burn windows should NOT appear in HUD
4. No burn-related imports should load (check Network tab)

**Expected behavior:**
- ✅ App loads normally
- ✅ No burn UI visible
- ✅ No console errors related to missing contract addresses

### Phase 2: Enabled State (Post-Deployment)

**Config:** `config/voidConfig.ts`
```typescript
export const ENABLE_BURN_UI = true;
```

**Verify:**
1. Restart dev server
2. Open app in browser
3. Check HUD for burn windows:
   - 🔥 District Access (if `BURN_WINDOWS.districtAccess.enabled`)
   - 🏗️ Land Upgrade (if `BURN_WINDOWS.landUpgrade.enabled`)
   - 🎨 Creator Tools (if `BURN_WINDOWS.creatorTools.enabled`)
   - ⭐ Prestige (if `BURN_WINDOWS.prestige.enabled`)

**Test contract interaction:**
1. Connect wallet (must have VOID tokens)
2. Open "District Access" burn window
3. Click "Unlock District" → View fee
4. Attempt burn transaction (testnet)
5. Verify transaction on Basescan

---

## Mainnet Deployment

### Preparation Checklist

- [ ] All contracts verified on Base Sepolia
- [ ] Frontend tested with testnet deployment
- [ ] All burn flows tested (district, land, creator, prestige)
- [ ] AI Governor fee adjustments tested
- [ ] Security audit completed (if applicable)
- [ ] VOID token mainnet address confirmed
- [ ] Deployer wallet has ≥0.1 ETH on Base Mainnet

### Deployment Steps

1. **Update deployment script:**

```typescript
// scripts/deploy-burn-system-enhanced.ts
const VOID_TOKEN = "0x<MAINNET_VOID_TOKEN_ADDRESS>";
```

2. **Update hardhat config:**

Ensure `hardhat.config.cts` has mainnet config:
```typescript
networks: {
  base: {
    url: process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org",
    accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
    chainId: 8453
  }
}
```

3. **Deploy to mainnet:**

```bash
npx hardhat run scripts/deploy-burn-system-enhanced.ts --network base
```

4. **Verify contracts:**

Use verification commands from output (replace `baseSepolia` with `base`).

5. **Update production environment:**

Copy addresses to production `.env`:
```bash
# Production .env
NEXT_PUBLIC_VOID_BURN_UTILITY=0x<MAINNET_ADDRESS>
NEXT_PUBLIC_DISTRICT_ACCESS_BURN=0x<MAINNET_ADDRESS>
# ... etc
```

6. **Deploy frontend:**

```bash
# Vercel/production deployment
npm run build
# Verify build includes correct contract addresses
```

---

## Post-Deployment Checklist

### Smart Contracts
- [ ] All 7 contracts deployed successfully
- [ ] All contracts verified on Basescan
- [ ] BURN_MANAGER_ROLE granted to all 5 modules
- [ ] GOVERNOR_ROLE granted to AI Governor in 4 modules
- [ ] Deployment summary JSON saved
- [ ] Contract addresses documented

### Frontend
- [ ] All env vars updated in `.env.local` / production
- [ ] Contract ABIs present in `contracts/abis/`
- [ ] `burnContracts.ts` config verified
- [ ] `areBurnContractsDeployed()` returns `true`
- [ ] Feature flag `ENABLE_BURN_UI` set correctly
- [ ] Build succeeds with no TypeScript errors

### Testing
- [ ] District unlock flow tested
- [ ] Land upgrade flow tested
- [ ] Creator tools unlock tested
- [ ] Prestige burn tested
- [ ] AI Governor fee queries tested
- [ ] Transaction confirmations work
- [ ] Basescan links correct

### Documentation
- [ ] Deployment addresses recorded
- [ ] Deployment timestamp documented
- [ ] Gas costs noted
- [ ] Team notified of deployment

---

## Troubleshooting

### Deployment Failed: Insufficient Balance

**Error:**
```
❌ Insufficient balance! Need at least 0.01 ETH, have 0.005 ETH
```

**Solution:**
- Get more testnet ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- For mainnet: Send ETH to deployer wallet

---

### Role Grant Failed

**Error:**
```
❌ Failed to grant BURN_MANAGER_ROLE: execution reverted
```

**Solution:**
1. Check deployer has DEFAULT_ADMIN_ROLE in VoidBurnUtility
2. Verify contract addresses are correct
3. Re-run role granting manually:

```typescript
const voidBurnUtility = await ethers.getContractAt("VoidBurnUtility", "0xABC...");
const BURN_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURN_MANAGER_ROLE"));
await voidBurnUtility.grantRole(BURN_MANAGER_ROLE, "0xDEF...");
```

---

### Contract Verification Failed

**Error:**
```
Error: Already verified
```

**Solution:**
- Contract is already verified, skip this step

**Error:**
```
Error: Constructor arguments mismatch
```

**Solution:**
- Double-check constructor arguments match deployment
- Use exact same compiler version as deployment

---

### Frontend: "Contract address undefined"

**Error:**
```
Error: Contract address is undefined
```

**Solution:**
1. Verify `.env.local` has all `NEXT_PUBLIC_*` variables
2. Restart dev server to reload env vars
3. Check `burnContracts.ts` for correct env var names
4. Verify `areBurnContractsDeployed()` returns `true`

---

### Burn Transaction Fails: "Insufficient allowance"

**Error:**
```
Error: ERC20: insufficient allowance
```

**Solution:**
1. User must approve VOID spending first:
```typescript
const { writeContract } = useWriteContract();
await writeContract({
  address: VOID_TOKEN_ADDRESS,
  abi: erc20Abi,
  functionName: 'approve',
  args: [BURN_CONTRACTS.core.address, maxUint256]
});
```

2. Verify approval succeeded before calling burn function

---

### Burn Transaction Fails: "Only BURN_MANAGER"

**Error:**
```
Error: Only BURN_MANAGER_ROLE can call this function
```

**Solution:**
- Feature module doesn't have BURN_MANAGER_ROLE
- Re-run role granting step in deployment script
- Manually grant role using Basescan's "Write Contract" tab

---

## Support

**Documentation:**
- Phase 9 spec: `PHASE-9-BURN-SYSTEM-SPEC.md`
- Contract docs: `contracts/burn/README.md`
- Hook docs: `hooks/burn/README.md`

**Testing:**
- E2E tests: `tests/e2e/burn-system.spec.ts`
- Contract tests: `test/burn/*.test.ts`

**Contact:**
- GitHub Issues: [repo]/issues
- Discord: #void-development

---

**End of Deployment Guide**
