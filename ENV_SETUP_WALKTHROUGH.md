# .ENV FILE SETUP WALKTHROUGH

**Complete step-by-step guide to get every credential for your `.env` file**

---

## 📋 Overview

You need **4 key pieces of information** to deploy VOID contracts to Base Sepolia testnet:

1. ✅ **BASE_SEPOLIA_RPC_URL** - Free RPC endpoint (5 minutes)
2. ✅ **DEPLOYER_PRIVATE_KEY** - New testnet wallet (3 minutes)
3. ✅ **BASESCAN_API_KEY** - Free API key (5 minutes, optional)
4. ✅ **DATABASE_URL** - PostgreSQL connection (varies)

**Total time:** ~15 minutes for essentials

---

## 1️⃣ BASE_SEPOLIA_RPC_URL (5 minutes)

### What is it?
An RPC URL lets your deployment script talk to the Base Sepolia blockchain.

### Option A: Public RPC (Fastest - 30 seconds)

**Just copy this:**
```bash
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

✅ **Pros:** Instant, no signup  
⚠️ **Cons:** Slower, rate limited  
📌 **Best for:** Quick testing

---

### Option B: Alchemy RPC (Recommended - 5 minutes)

**Step 1: Create Alchemy Account**
1. Go to: https://www.alchemy.com
2. Click **"Sign Up"** (top right)
3. Use email or Google sign-in
4. Verify email if prompted

**Step 2: Create App**
1. Click **"Create new app"** button
2. Fill in:
   - **Name:** `VOID Testnet`
   - **Chain:** Base
   - **Network:** Base Sepolia (testnet)
3. Click **"Create app"**

**Step 3: Get API Key**
1. Click on your new app name
2. Click **"API Key"** button (top right)
3. Copy the **HTTPS URL** (looks like: `https://base-sepolia.g.alchemy.com/v2/abc123...`)

**Step 4: Add to .env**
```bash
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY_HERE
```

✅ **Pros:** Faster, reliable, analytics dashboard  
📌 **Best for:** Production deployment

---

### Option C: Infura RPC (Alternative - 5 minutes)

**Similar to Alchemy:**
1. Go to: https://www.infura.io
2. Sign up → Create project
3. Select **"Web3 API"** → **"Base Sepolia"**
4. Copy endpoint URL

```bash
BASE_SEPOLIA_RPC_URL=https://base-sepolia.infura.io/v3/YOUR_PROJECT_ID
```

---

## 2️⃣ DEPLOYER_PRIVATE_KEY (3 minutes)

### What is it?
A private key for a **new wallet** that will deploy your contracts. **Never use your real wallet!**

### ⚠️ CRITICAL SECURITY RULES

- ✅ Create a **brand new wallet** for testnet only
- ✅ This wallet should have **ZERO real money**
- ✅ Only use Base Sepolia testnet ETH (free)
- ❌ **NEVER** use your main wallet's private key
- ❌ **NEVER** commit `.env` to GitHub

---

### Step-by-Step: Create New Wallet

#### Option A: MetaMask (Recommended)

**Step 1: Create New Account**
1. Open MetaMask extension
2. Click account icon (top right)
3. Click **"Create Account"** or **"Add account"**
4. Name it: `VOID Testnet Deployer`
5. Click **"Create"**

**Step 2: Export Private Key**
1. Click the 3 dots next to account name
2. Click **"Account details"**
3. Click **"Show private key"**
4. Enter your MetaMask password
5. Click **"Confirm"**
6. Copy the private key (64 hex characters)

**Step 3: Add to .env (NO 0x PREFIX!)**
```bash
# ❌ WRONG - has 0x prefix
DEPLOYER_PRIVATE_KEY=0xabc123def456...

# ✅ CORRECT - no 0x prefix
DEPLOYER_PRIVATE_KEY=abc123def456...
```

**Step 4: Copy Wallet Address**
1. Click on account name to copy address
2. Keep this address handy - you'll need it to get testnet ETH

---

#### Option B: Create Wallet Programmatically

If you don't have MetaMask:

**Step 1: Run this command**
```bash
node -e "const { ethers } = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey.slice(2));"
```

**Step 2: Save both outputs**
- **Address:** `0x...` (for getting testnet ETH)
- **Private Key:** `abc123...` (for .env file, **without 0x**)

**Step 3: Add to .env**
```bash
DEPLOYER_PRIVATE_KEY=abc123def456...
```

---

### Fund Your Deployer Wallet (Required!)

**You need ~0.5 ETH on Base Sepolia to deploy contracts.**

**Step 1: Get Testnet ETH**
1. Go to: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Paste your deployer wallet address
3. Click **"Request"**
4. Wait ~30 seconds

**Step 2: Verify Balance**
```bash
# Add MetaMask network manually if needed:
Network Name: Base Sepolia
RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency Symbol: ETH
Block Explorer: https://sepolia.basescan.org
```

**Step 3: Check Balance in MetaMask**
- Switch to Base Sepolia network
- Should show ~0.5 ETH

---

## 3️⃣ BASESCAN_API_KEY (5 minutes, Optional)

### What is it?
Lets you verify contracts on Basescan block explorer (makes contracts readable on blockchain).

### Is it required?
- ⚠️ **Optional but recommended**
- ✅ Without it: Contracts deploy but aren't verified
- ✅ With it: Contracts are verified and readable on Basescan

---

### Step-by-Step: Get API Key

**Step 1: Create Basescan Account**
1. Go to: https://basescan.org
2. Click **"Sign In"** (top right)
3. Click **"Click to sign up"**
4. Enter email and password
5. Verify email

**Step 2: Create API Key**
1. After login, go to: https://basescan.org/myapikey
2. Click **"Add"** button
3. Fill in:
   - **AppName:** `VOID Testnet`
4. Click **"Create New API Key"**
5. Copy the API key (looks like: `ABC123DEF456...`)

**Step 3: Add to .env**
```bash
BASESCAN_API_KEY=ABC123DEF456...
```

**If you skip this:**
- Just leave it blank or comment it out:
```bash
# BASESCAN_API_KEY=
```

---

## 4️⃣ DATABASE_URL (Varies)

### What is it?
PostgreSQL database connection string for land grid data (1,600 parcels).

### Options (Pick One)

---

### Option A: Supabase (Easiest - 10 minutes)

**Step 1: Create Supabase Account**
1. Go to: https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub or email

**Step 2: Create Project**
1. Click **"New Project"**
2. Fill in:
   - **Name:** `void-testnet`
   - **Database Password:** (create strong password, save it!)
   - **Region:** Choose closest to you
   - **Plan:** Free tier
3. Click **"Create new project"**
4. Wait ~2 minutes for setup

**Step 3: Get Connection String**
1. Click **"Settings"** (left sidebar)
2. Click **"Database"**
3. Scroll to **"Connection string"**
4. Select **"URI"** tab
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your actual password

**Example:**
```bash
DATABASE_URL=postgresql://postgres.abcdefgh:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

### Option B: Local PostgreSQL (If installed)

**If you have PostgreSQL installed locally:**

```bash
DATABASE_URL=postgresql://localhost:5432/void_testnet
```

**Create database:**
```bash
psql -U postgres -c "CREATE DATABASE void_testnet;"
```

---

### Option C: Skip Database (For Now)

**If you just want to deploy contracts first:**

```bash
# DATABASE_URL=  # Leave commented out
```

⚠️ **Note:** You won't be able to use land grid features until you set this up.

---

## 📝 Complete .env File Example

Here's what your final `.env` file should look like:

```bash
# ============================================================================
# VOID TESTNET DEPLOYMENT ENVIRONMENT VARIABLES
# ============================================================================

# 1. Base Sepolia RPC URL (choose one option)
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/abc123...
# OR
# BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# 2. Deployer wallet private key (NO 0x prefix!)
DEPLOYER_PRIVATE_KEY=abc123def456789...

# 3. Basescan API key (optional, for contract verification)
BASESCAN_API_KEY=ABC123DEF456...

# 4. Database URL (optional, for land grid)
DATABASE_URL=postgresql://postgres.xyz:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# ============================================================================
# CONTRACT ADDRESSES (Auto-filled after deployment - leave blank)
# ============================================================================

NEXT_PUBLIC_XP_ORACLE_ADDRESS=
NEXT_PUBLIC_MISSION_REGISTRY_ADDRESS=
NEXT_PUBLIC_ESCROW_VAULT_ADDRESS=
# ... (will be filled automatically by deployment script)
```

---

## ✅ Verification Checklist

**Before deploying, verify:**

- [ ] `.env` file exists in project root (`C:\Users\rigof\Documents\000\.env`)
- [ ] `BASE_SEPOLIA_RPC_URL` is set (test with curl below)
- [ ] `DEPLOYER_PRIVATE_KEY` has **no `0x` prefix**
- [ ] Deployer wallet has **≥0.5 ETH on Base Sepolia**
- [ ] `BASESCAN_API_KEY` is set (or commented out)
- [ ] `DATABASE_URL` is set (or commented out)
- [ ] `.env` is in `.gitignore` (never commit!)

---

## 🧪 Test Your Configuration

### Test 1: RPC Connection
```bash
curl -X POST $env:BASE_SEPOLIA_RPC_URL -H "Content-Type: application/json" -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}'
```

**Expected:** Returns a hex block number (e.g., `"result":"0x123456"`)

---

### Test 2: Wallet Balance
```bash
node -e "const { ethers } = require('ethers'); const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL); const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider); wallet.address.then(addr => console.log('Address:', addr)); provider.getBalance(wallet.address).then(bal => console.log('Balance:', ethers.formatEther(bal), 'ETH'));"
```

**Expected:** Shows your address and balance (~0.5 ETH)

---

### Test 3: Database Connection
```bash
psql "$env:DATABASE_URL" -c "SELECT version();"
```

**Expected:** Shows PostgreSQL version

---

### Test 4: Run Orchestrator Pre-Flight Check
```bash
node scripts/orchestrator/deployment-orchestrator.js check
```

**Expected:** All checks pass ✅

---

## 🚨 Common Issues & Fixes

### Issue: "Invalid private key"
**Fix:** Make sure you removed the `0x` prefix
```bash
# ❌ WRONG
DEPLOYER_PRIVATE_KEY=0xabc123...

# ✅ CORRECT
DEPLOYER_PRIVATE_KEY=abc123...
```

---

### Issue: "Insufficient funds"
**Fix:** Get more testnet ETH
1. Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Paste your deployer address
3. Wait 30 seconds

---

### Issue: "RPC connection failed"
**Fix:** Verify RPC URL format
```bash
# Test manually
curl -X POST https://sepolia.base.org -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

### Issue: "Database connection failed"
**Fix:** Check DATABASE_URL format
```bash
# Supabase format:
postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# Make sure password doesn't have special chars that need escaping
```

---

## 📚 Quick Reference Card

**Copy this for easy reference:**

```
┌─────────────────────────────────────────────────────────────┐
│ VOID TESTNET DEPLOYMENT CREDENTIALS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 1. RPC URL                                                   │
│    Get from: alchemy.com or use https://sepolia.base.org    │
│    Time: 5 min                                               │
│                                                              │
│ 2. PRIVATE KEY                                               │
│    Create: New MetaMask account → Export private key        │
│    Remove: 0x prefix!                                        │
│    Time: 3 min                                               │
│                                                              │
│ 3. TESTNET ETH                                               │
│    Get from: coinbase.com/faucets/base-ethereum-sepolia     │
│    Amount: 0.5 ETH (free)                                    │
│    Time: 2 min                                               │
│                                                              │
│ 4. BASESCAN KEY (optional)                                   │
│    Get from: basescan.org/myapikey                          │
│    Time: 5 min                                               │
│                                                              │
│ 5. DATABASE (optional)                                       │
│    Get from: supabase.com → New project                     │
│    Time: 10 min                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Next Steps

**After your `.env` file is complete:**

1. **Verify setup:**
   ```bash
   node scripts/orchestrator/deployment-orchestrator.js check
   ```

2. **If all checks pass:**
   ```bash
   node scripts/orchestrator/deployment-orchestrator.js deploy
   ```

3. **Follow QUICK_START_DEPLOYMENT.md** for remaining steps

---

**Need help?** Re-read the section for the credential giving you trouble, or check the "Common Issues" section.

**Ready to deploy?** Run the pre-flight check above!
