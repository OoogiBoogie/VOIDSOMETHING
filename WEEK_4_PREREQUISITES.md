# WEEK 4 — PHASE 1 DEPLOYMENT PREREQUISITES
**Status:** Ready for User Action  
**Created:** November 10, 2025  
**Objective:** Complete checklist before executing Week 4 deployment

---

## CRITICAL: What You Need Before Starting

### 1. Environment Credentials (REQUIRED)

You need to provide **3 critical values** in a `.env` file:

```bash
# Create .env file from template:
cp .env.example .env

# Edit .env and fill in these values:
BASE_SEPOLIA_RPC_URL=<your_rpc_url>
DEPLOYER_PRIVATE_KEY=<your_private_key>
BASESCAN_API_KEY=<your_api_key>  # Optional but recommended
```

#### A. Base Sepolia RPC URL

**Option 1: Public RPC (Free, but slower)**
```
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

**Option 2: Alchemy (Recommended)**
1. Sign up at https://www.alchemy.com/
2. Create new app → Select "Base Sepolia"
3. Copy HTTPS URL
```
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

**Option 3: Infura**
1. Sign up at https://www.infura.io/
2. Create new project
3. Select "Base Sepolia" network
```
BASE_SEPOLIA_RPC_URL=https://base-sepolia.infura.io/v3/YOUR_PROJECT_ID
```

---

#### B. Deployer Private Key

**⚠️ CRITICAL SECURITY WARNINGS:**
- **NEVER use your main wallet** - Create a NEW wallet for testnet only
- **NEVER commit this to git** - Verify `.env` is in `.gitignore`
- **This wallet will deploy all contracts** - It becomes the owner

**How to get a private key:**

**Option 1: MetaMask**
1. Open MetaMask → Click account icon → Account Details
2. Click "Show private key"
3. Enter password
4. **Copy private key WITHOUT the 0x prefix**
```
DEPLOYER_PRIVATE_KEY=abc123def456...  # NO 0x prefix
```

**Option 2: Create new wallet with ethers.js**
```bash
node -e "const {Wallet} = require('ethers'); const w = Wallet.createRandom(); console.log('Address:', w.address); console.log('Private Key:', w.privateKey);"
```

---

#### C. BaseScan API Key (Optional)

Used for contract verification on BaseScan.

1. Go to https://basescan.org/myapikey
2. Sign up / Login
3. Create new API key
4. Copy key
```
BASESCAN_API_KEY=YOUR_API_KEY_HERE
```

**If skipped:** Contracts will deploy but won't auto-verify (you can verify manually later).

---

### 2. Fund Deployer Wallet (~0.5 ETH on Base Sepolia)

**Get Base Sepolia ETH from faucets:**

**Option 1: Coinbase Faucet (Easiest)**
1. Go to: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Connect wallet with your deployer address
3. Request ETH (usually get 0.5 ETH per 24 hours)

**Option 2: Alchemy Faucet**
1. Go to: https://www.alchemy.com/faucets/base-sepolia
2. Sign in with Alchemy account
3. Enter deployer address
4. Request ETH

**Option 3: Base Sepolia Bridge (from Sepolia ETH)**
1. Get Sepolia ETH from: https://sepoliafaucet.com/
2. Bridge to Base Sepolia: https://bridge.base.org/

**Verify you have funds:**
```bash
# Check balance after getting from faucet
node -e "
const {ethers} = require('ethers');
require('dotenv').config();
const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
provider.getBalance(wallet.address).then(balance => {
  console.log('Deployer Address:', wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH');
  if (balance < ethers.parseEther('0.3')) {
    console.log('⚠️ WARNING: Need at least 0.5 ETH for deployment');
  } else {
    console.log('✅ Sufficient balance');
  }
});
"
```

**Expected Output:**
```
Deployer Address: 0xYourAddressHere
Balance: 0.8 ETH
✅ Sufficient balance
```

---

### 3. Install Hardhat Dependencies

The project uses Hardhat for contract deployment but it's not installed yet.

**Install required packages:**
```bash
npm install --save-dev \
  hardhat \
  @nomicfoundation/hardhat-toolbox \
  @nomicfoundation/hardhat-verify \
  @nomicfoundation/hardhat-ethers \
  @typechain/hardhat \
  @typechain/ethers-v6 \
  dotenv
```

**Expected time:** ~2 minutes  
**Expected output:** No errors, `package.json` and `package-lock.json` updated

**Verify installation:**
```bash
npx hardhat --version
```

**Expected output:**
```
2.19.0  # (or later)
```

---

### 4. Validate .gitignore

**Ensure `.env` is NOT committed to git:**

```bash
# Check if .env is in .gitignore
cat .gitignore | grep ".env"
```

**Expected output:**
```
.env
.env.local
*.env
```

**If not present, add to .gitignore:**
```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.env" >> .gitignore
```

**Verify .env is not tracked:**
```bash
git status --ignored
```

**Should see:** `.env` listed under "Ignored files"

---

## DEPLOYMENT DECISION TREE

### Question 1: Do you want to deploy contracts NOW?

**YES → Proceed to Day 1 of Week 4 deployment**
- Estimated time: 7 days (30-45 minutes per day)
- Cost: ~0.38 ETH on Base Sepolia (free from faucets)
- Outcome: Full Phase 1 testnet build operational

**NO → Alternative paths:**

**Option A: Skip deployment, continue with Week 4 HUD work**
- You can build HUD components using mock contract data
- Deployment can happen later (contracts are ready)
- Cosmetics remain locked regardless

**Option B: Review Week 3 completion first**
- Read `WEEK_3_VERIFICATION_COMPLETE.md` for full context
- Understand what's been built so far
- Make informed decision on deployment timing

**Option C: Jump to Phase 2 planning**
- Review cosmetics spec (`COSMETICS_CREATOR_FLYWHEEL_SPEC_v1.0.md`)
- Plan creator onboarding strategy
- Design mission expansion roadmap

---

## PRE-DEPLOYMENT VALIDATION CHECKLIST

Before running any deployment commands, verify:

- [ ] `.env` file created with all 3 values (RPC URL, private key, API key)
- [ ] Deployer wallet funded with ≥0.5 ETH on Base Sepolia
- [ ] Hardhat dependencies installed (`npx hardhat --version` works)
- [ ] `.gitignore` contains `.env` (NEVER commit private keys)
- [ ] `hardhat.config.ts` file exists (created in Week 4 prep)
- [ ] `scripts/deploy/deploy-week2-testnet.ts` exists (Week 2 script)
- [ ] `contracts/` folder contains all Week 1-2 contracts (Week 2 build)
- [ ] Node.js v18+ installed (`node -v`)
- [ ] npm v8+ installed (`npm -v`)

**All checked? Ready to deploy!**

Run final validation:
```bash
# Test RPC connection
node -e "
const {ethers} = require('ethers');
require('dotenv').config();
const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
provider.getNetwork().then(network => {
  console.log('✅ RPC Connected');
  console.log('   Network:', network.name);
  console.log('   Chain ID:', network.chainId);
  if (network.chainId !== 84532n) {
    console.log('⚠️  WARNING: Not Base Sepolia (expected chain ID 84532)');
  }
}).catch(err => {
  console.log('❌ RPC Connection Failed:', err.message);
});
"
```

**Expected output:**
```
✅ RPC Connected
   Network: base-sepolia
   Chain ID: 84532
```

---

## NEXT STEPS

### If prerequisites complete:

**1. Review deployment guide:**
```bash
cat WEEK_4_DEPLOYMENT_GUIDE.md
```

**2. Start Day 1 deployment:**
```bash
npx hardhat run scripts/deploy/deploy-week2-testnet.ts --network baseSepolia
```

**3. Follow 7-day schedule:**
- Day 1: Deploy contracts (~30 min)
- Day 2: HUD integration (~45 min)
- Day 3: AI telemetry validation (~15 min)
- Day 4: Land grid migration (~30 min)
- Day 5: System heartbeat (~20 min)
- Day 6: HUD optimization (~60 min)
- Day 7: Phase 1 completion review (~30 min)

---

### If prerequisites incomplete:

**Missing RPC URL?**
- Sign up for Alchemy (recommended): https://www.alchemy.com/
- Or use public RPC: `https://sepolia.base.org`

**Missing private key?**
- Create new wallet (MetaMask or ethers.js)
- NEVER use your main wallet for testnet

**Missing Base Sepolia ETH?**
- Visit faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- Wait 24h if daily limit reached

**Hardhat install failed?**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

---

## TROUBLESHOOTING

### "Module not found: hardhat"

**Fix:**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### "Insufficient funds for gas"

**Fix:**
```bash
# Get more Base Sepolia ETH from faucet (need 0.5 ETH minimum)
# Check balance: node -e "..." (see script above)
```

### "Invalid private key"

**Fix:**
```bash
# Ensure private key has NO 0x prefix in .env
# Example: DEPLOYER_PRIVATE_KEY=abc123def456...
```

### "Network connection failed"

**Fix:**
```bash
# Test RPC manually:
curl https://sepolia.base.org -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# If fails, try Alchemy/Infura RPC instead
```

---

## ESTIMATED COSTS

### Base Sepolia Testnet (FREE):
- ERC20 Mocks (7 tokens): ~0.08 ETH
- Week 1 Contracts: ~0.12 ETH
- Week 2 Contracts: ~0.18 ETH
- **Total: ~0.38 ETH** (get from free faucets)

### Time Investment:
- Prerequisites setup: 30-60 minutes (one-time)
- Week 4 execution: 7 days × 15-60 min = ~4 hours total
- HUD testing: Ongoing during Week 4

---

## SUPPORT RESOURCES

**Documentation:**
- Week 4 Deployment Guide: `WEEK_4_DEPLOYMENT_GUIDE.md`
- Week 3 Completion Report: `WEEK_3_VERIFICATION_COMPLETE.md`
- Week 2 Simulation Build: `WEEK_2_SIMULATION_BUILD_COMPLETE.md`
- Hardhat Config: `hardhat.config.ts`

**Scripts:**
- Deployment: `scripts/deploy/deploy-week2-testnet.ts`
- Verification: `scripts/verify/verify-contracts.ts`
- Fee validation: `scripts/validate/test-fee-distribution.ts`
- Heartbeat check: `scripts/system/heartbeat.ts`
- Update .env: `scripts/utils/update-env-addresses.js`

**External Resources:**
- Base Sepolia Explorer: https://sepolia.basescan.org/
- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- Alchemy RPC: https://www.alchemy.com/
- Hardhat Docs: https://hardhat.org/docs

---

**Status:** Awaiting user decision on deployment timing  
**Next Action:** User provides .env credentials OR defers deployment  
**Blockers:** None (all infrastructure ready, awaiting credentials)
