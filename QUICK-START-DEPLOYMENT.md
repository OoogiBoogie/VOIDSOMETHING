# 🚀 Quick Start: Deploy VOID Burn System

**Time to Production:** 30-60 minutes  
**Prerequisites:** Hardhat setup, deployer wallet with testnet ETH

---

## 1️⃣ Compile Contracts (5 min)

```bash
# Compile all Solidity contracts
npx hardhat compile

# Verify compilation succeeded
ls artifacts/contracts/burn/*/
```

**Expected output:**
```
VoidBurnUtility.sol/
DistrictAccessBurn.sol/
LandUpgradeBurn.sol/
CreatorToolsBurn.sol/
PrestigeBurn.sol/
MiniAppBurnAccess.sol/
AIUtilityGovernor.sol/
```

---

## 2️⃣ Extract ABIs (2 min)

**Option A: PowerShell (manual copy)**
```powershell
mkdir contracts/abis -Force
Copy-Item "artifacts/contracts/burn/VoidBurnUtility.sol/VoidBurnUtility.json" "contracts/abis/"
Copy-Item "artifacts/contracts/burn/DistrictAccessBurn.sol/DistrictAccessBurn.json" "contracts/abis/"
Copy-Item "artifacts/contracts/burn/LandUpgradeBurn.sol/LandUpgradeBurn.json" "contracts/abis/"
Copy-Item "artifacts/contracts/burn/CreatorToolsBurn.sol/CreatorToolsBurn.json" "contracts/abis/"
Copy-Item "artifacts/contracts/burn/PrestigeBurn.sol/PrestigeBurn.json" "contracts/abis/"
Copy-Item "artifacts/contracts/burn/MiniAppBurnAccess.sol/MiniAppBurnAccess.json" "contracts/abis/"
Copy-Item "artifacts/contracts/burn/AIUtilityGovernor.sol/AIUtilityGovernor.json" "contracts/abis/"
```

**Option B: Node.js script** (see `docs/CONTRACT_ABI_SETUP.md`)

**Verify ABIs exist:**
```bash
ls contracts/abis/
# Should show 7 JSON files
```

---

## 3️⃣ Setup Deployer Wallet (5 min)

**Create `.env` file:**
```bash
# Deployer private key (DO NOT COMMIT!)
DEPLOYER_PRIVATE_KEY=0x...

# Base Sepolia RPC (optional, uses public RPC by default)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Basescan API key for verification
BASESCAN_API_KEY=your_api_key_here
```

**Fund deployer wallet:**
- Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- Request 0.05 ETH (minimum 0.01 ETH required)
- Wait for confirmation

---

## 4️⃣ Deploy to Base Sepolia (10 min)

```bash
npx hardhat run scripts/deploy-burn-system-enhanced.ts --network baseSepolia
```

**Expected output:**
```
🔍 Pre-Deployment Checks
========================
Deployer: 0x123...
Balance: 0.05 ETH
✅ Balance check passed
Network: base-sepolia (Chain ID: 84532)
✅ Network check passed
✅ VOID token verified

1️⃣  ✅ VoidBurnUtility: 0xABC...
2️⃣  ✅ DistrictAccessBurn: 0xDEF...
3️⃣  ✅ LandUpgradeBurn: 0xGHI...
4️⃣  ✅ CreatorToolsBurn: 0xJKL...
5️⃣  ✅ PrestigeBurn: 0xMNO...
6️⃣  ✅ MiniAppBurnAccess: 0xPQR...
7️⃣  ✅ AIUtilityGovernor: 0xSTU...

🔐 Granting Roles
=================
✅ All roles granted and verified!

💾 Deployment summary saved to: deployments/burn-deployment-base-sepolia-*.json
```

**⚠️ Save deployment addresses!** Copy from output or `deployments/*.json` file.

---

## 5️⃣ Verify Contracts (10 min)

**Copy verification commands from deployment output:**
```bash
# Example (use YOUR actual addresses):
npx hardhat verify --network baseSepolia 0xABC... 0x8de...
npx hardhat verify --network baseSepolia 0xDEF... 0xABC...
# ... (7 total commands)
```

**Check on Basescan:**
1. Go to [Basescan Sepolia](https://sepolia.basescan.org/)
2. Search for each contract address
3. Verify ✅ green checkmark on "Contract" tab

---

## 6️⃣ Frontend Integration (5 min)

**Update `.env.local`:**
```bash
# Copy addresses from deployment output
NEXT_PUBLIC_VOID_TOKEN=0x8de4043445939B0D0Cc7d6c752057707279D9893
NEXT_PUBLIC_VOID_BURN_UTILITY=0xABC...
NEXT_PUBLIC_DISTRICT_ACCESS_BURN=0xDEF...
NEXT_PUBLIC_LAND_UPGRADE_BURN=0xGHI...
NEXT_PUBLIC_CREATOR_TOOLS_BURN=0xJKL...
NEXT_PUBLIC_PRESTIGE_BURN=0xMNO...
NEXT_PUBLIC_MINIAPP_BURN_ACCESS=0xPQR...
NEXT_PUBLIC_AI_UTILITY_GOVERNOR=0xSTU...
```

**Verify contract config:**
```bash
# Restart dev server to load new env vars
npm run dev
```

Check browser console:
```typescript
import { areBurnContractsDeployed, logBurnContractStatus } from '@/config/burnContracts';
areBurnContractsDeployed(); // Should return true
logBurnContractStatus();    // Should show all 7 contracts loaded
```

---

## 7️⃣ Test Feature Flag (5 min)

### Test 1: Feature Flag Disabled (Default)

**Config:** `config/voidConfig.ts`
```typescript
export const ENABLE_BURN_UI = false;
```

**Expected:**
- ✅ App loads normally
- ✅ No burn windows in HUD
- ✅ No console errors

### Test 2: Feature Flag Enabled

**Config:** `config/voidConfig.ts`
```typescript
export const ENABLE_BURN_UI = true;
```

**Restart dev server:**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

**Expected:**
- ✅ Burn windows appear in HUD (4 windows if all enabled)
- ✅ Windows show correct contract data
- ✅ Fee queries work (check Network tab)

---

## 8️⃣ E2E Testing (10 min)

### Test District Unlock Flow

1. Open "District Access" burn window
2. Select a district (e.g., "DEFI")
3. Click "Check Fee" → Should show fee (e.g., "100 VOID")
4. Connect wallet with VOID tokens
5. Approve VOID spending (if needed)
6. Click "Unlock District" → Confirm transaction
7. Verify on Basescan: Transaction succeeded
8. Verify state: District now unlocked

### Test Land Upgrade Flow

1. Open "Land Upgrade" burn window
2. Enter parcel ID
3. Select upgrade tier
4. Click "Upgrade Land" → Confirm transaction
5. Verify on Basescan

### Test Creator Tools

1. Open "Creator Tools" burn window
2. Click "Unlock Creator Tools"
3. Confirm transaction
4. Verify creator tools are accessible

### Test Prestige

1. Open "Prestige" burn window
2. Review prestige requirements
3. Click "Prestige" → Confirm transaction
4. Verify prestige level increased

---

## ✅ Deployment Checklist

**Pre-Deployment:**
- [ ] Contracts compiled (`npx hardhat compile`)
- [ ] ABIs extracted to `contracts/abis/`
- [ ] `.env` configured with deployer private key
- [ ] Deployer wallet has ≥0.01 ETH on Base Sepolia
- [ ] VOID token address confirmed

**Deployment:**
- [ ] Contracts deployed successfully (all 7)
- [ ] Roles granted and verified
- [ ] Deployment summary JSON saved
- [ ] Contracts verified on Basescan

**Frontend:**
- [ ] `.env.local` updated with contract addresses
- [ ] `areBurnContractsDeployed()` returns `true`
- [ ] Feature flag disabled test passed
- [ ] Feature flag enabled test passed
- [ ] All 4 burn flows tested

**Documentation:**
- [ ] Deployment addresses recorded
- [ ] Gas costs documented
- [ ] Team notified

---

## 🆘 Troubleshooting

### Error: "Insufficient balance"
**Solution:** Get more testnet ETH from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

### Error: "VOID token not found"
**Solution:** Verify VOID token address in `scripts/deploy-burn-system-enhanced.ts` line 29

### Error: "Cannot find module '@/contracts/abis/...'"
**Solution:** Extract ABIs (Step 2 above)

### Error: "areBurnContractsDeployed() returns false"
**Solution:** 
1. Check `.env.local` has all 7 contract addresses
2. Restart dev server to reload env vars
3. Verify env var names match exactly (NEXT_PUBLIC_...)

### Transactions Fail: "Insufficient allowance"
**Solution:** 
1. Approve VOID spending first
2. Use VOID token contract → `approve(burnContractAddress, maxAmount)`

---

## 📚 Full Documentation

For detailed information, see:
- **Deployment Guide:** `docs/VOID_BURN_SYSTEM_DEPLOYMENT_GUIDE.md`
- **ABI Setup:** `docs/CONTRACT_ABI_SETUP.md`
- **Infrastructure Summary:** `DEPLOYMENT-QA-INFRASTRUCTURE-COMPLETE.md`

---

## 🎯 Next Steps After Testnet

1. **Security Audit:** Review contracts, test edge cases
2. **Mainnet Deployment:** Update addresses, deploy to Base mainnet
3. **Production Launch:** Deploy frontend, monitor transactions

---

**Status:** Ready for deployment  
**Estimated Time:** 30-60 minutes  
**Last Updated:** Phase 8/9 completion
