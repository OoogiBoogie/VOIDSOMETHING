# WEEK 4 QUICK START CARD
**For when you're ready to deploy** — Keep this handy

---

## 🚀 Fast Track to Deployment

### Step 1: Get Credentials (5 minutes)
```bash
# 1. Get RPC URL (Choose one):
#    - Alchemy: https://www.alchemy.com/ (recommended)
#    - Public: https://sepolia.base.org (slower)

# 2. Create wallet:
node -e "const {Wallet}=require('ethers');const w=Wallet.createRandom();console.log('Address:',w.address);console.log('Private Key:',w.privateKey);"

# 3. Fund wallet with 0.5 ETH:
#    https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

# 4. Get BaseScan API key (optional):
#    https://basescan.org/myapikey
```

### Step 2: Setup Environment (2 minutes)
```bash
# Create .env file
cp .env.example .env

# Edit .env (fill in your values):
# BASE_SEPOLIA_RPC_URL=your_rpc_url
# DEPLOYER_PRIVATE_KEY=your_private_key  # NO 0x prefix
# BASESCAN_API_KEY=your_api_key  # Optional
```

### Step 3: Install Dependencies (2 minutes)
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify dotenv
```

### Step 4: Deploy (30 minutes)
```bash
# Deploy all contracts
npx hardhat run scripts/deploy/deploy-week2-testnet.ts --network baseSepolia

# Verify on Basescan
npx hardhat run scripts/verify/verify-contracts.ts --network baseSepolia

# Update .env with addresses
node scripts/utils/update-env-addresses.js
```

---

## ✅ Quick Validation Checklist

Before deploying:
- [ ] `.env` file exists with 3 values
- [ ] Deployer wallet has ≥0.5 ETH on Base Sepolia
- [ ] `npx hardhat --version` works
- [ ] `.env` is in `.gitignore`

Test RPC connection:
```bash
node -e "require('dotenv').config();const {ethers}=require('ethers');new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL).getNetwork().then(n=>console.log('✅ Connected to',n.name,'Chain ID:',n.chainId))"
```

Check wallet balance:
```bash
node -e "require('dotenv').config();const {ethers}=require('ethers');const p=new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);const w=new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY,p);p.getBalance(w.address).then(b=>console.log('Address:',w.address,'Balance:',ethers.formatEther(b),'ETH'))"
```

---

## 📋 7-Day Schedule (After Deployment)

| Day | Task | Time | Status |
|-----|------|------|--------|
| 1 | Deploy contracts to Base Sepolia | 30 min | ⏸️ Pending .env |
| 2 | Connect HUD to live contracts | 45 min | Not started |
| 3 | Start AI telemetry daemon | 15 min | Not started |
| 4 | Migrate land grid (1,600 parcels) | 30 min | Not started |
| 5 | Run system heartbeat check | 20 min | Not started |
| 6 | Optimize HUD performance | 60 min | Not started |
| 7 | Complete Phase 1 review | 30 min | Not started |

**Total Time:** ~4 hours over 7 days

---

## 🔗 Key Files

**Read First:**
- `WEEK_4_PREREQUISITES.md` - What you need
- `WEEK_4_DEPLOYMENT_GUIDE.md` - Step-by-step guide

**Run When Ready:**
- `scripts/deploy/deploy-week2-testnet.ts` - Deploy
- `scripts/verify/verify-contracts.ts` - Verify
- `scripts/system/heartbeat.ts` - Health check

---

## 🆘 Common Issues

**"Insufficient funds"**
→ Get more ETH from faucet (need 0.5 ETH minimum)

**"Module not found: hardhat"**
→ Run: `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox`

**"Invalid private key"**
→ Ensure NO `0x` prefix in .env

**"Network connection failed"**
→ Test RPC manually (see validation above)

---

## 📞 Need Help?

1. Read `WEEK_4_DEPLOYMENT_GUIDE.md` (comprehensive troubleshooting)
2. Check `WEEK_4_PREREQUISITES.md` (validation steps)
3. Review `WEEK_3_VERIFICATION_COMPLETE.md` (context)

---

**Status:** Ready to deploy when credentials provided  
**Blocker:** Need `.env` file with RPC URL + private key + API key  
**Next:** User provides credentials → Execute Day 1 deployment
