# 🎮 VOID METAVERSE - TESTING GUIDE

## 🚀 YOUR SERVER IS LIVE!

**Local URL:** http://localhost:3000  
**Network URL:** http://192.168.56.1:3000

---

## ✅ What's Already Set Up

### 1. Deployed Contracts (Base Sepolia)
- ✅ VoidHookRouterV4: `0x687E678aB2152d9e0952d42B0F872604533D25a9`
- ✅ XPOracle: `0x8D786454ca2e252cb905f597214dD78C89E3Ba14`
- ✅ MissionRegistry: `0x7C6BF84fd111A262CCdfEC885ba8677b3F3EE9c7`
- ✅ EscrowVault: `0x1A9b3fE46A6e2A9669D6d53fB58D562b97071FB7`
- ✅ xVOIDVault: `0xab10B2B5E1b07447409BCa889d14F046bEFd8192`

### 2. Test Tokens Minted
- ✅ VOID, PSX, CREATE, SIGNAL, AGENCY
- ✅ USDC and WETH for swaps
- ✅ Tokens sent to: `0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f`

### 3. Test Data Created
- ✅ 5 missions available (some may have failed - can create more via UI)
- ✅ VOID approved for staking
- ✅ 100 VOID staked (if transaction succeeded)

---

## 🎯 How to Test the Metaverse

For a complete end-to-end checklist including world ↔ HUD sync, land purchases, swaps + fee routing, and theme consistency, see: `VOID-E2E-VALIDATION.md`.

### Step 1: Connect Your Wallet

1. **Open:** http://localhost:3000
2. **Install MetaMask** (if not installed): https://metamask.io
3. **Add Base Sepolia Network** to MetaMask:
   - Network Name: `Base Sepolia`
   - RPC URL: `https://sepolia.base.org`
   - Chain ID: `84532`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.basescan.org`

### Step 2: Import Test Wallet (Option A)

**Use the deployer wallet with test tokens:**

1. Click MetaMask → Import Account
2. Paste private key: `0xa94124fe7ef92901c2161a0bb19b5ff5c289c84efe9798f0f4b0fe97c9952442`
3. ⚠️ **TESTNET ONLY** - Never use this key on mainnet!

**Your wallet address:** `0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f`

### Step 2: Use Your Own Wallet (Option B)

**Get test ETH & tokens:**

1. Use your own MetaMask wallet
2. Get Base Sepolia ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
3. Mint tokens via Basescan (see below)

---

## 🧪 What You Can Test

### 1. **Mission System** 🎯

**Test Flow:**
- View available missions
- Complete a mission
- Earn vXP (experience points)
- Check your vXP balance in XPOracle

**Manual Test via Basescan:**
```
1. Go to: https://sepolia.basescan.org/address/0x7C6BF84fd111A262CCdfEC885ba8677b3F3EE9c7
2. Click "Contract" → "Write Contract"
3. Connect wallet
4. Call "createMission()" with:
   - description: "Test Mission"
   - vxpReward: 100
5. Call "completeMission()" with missionId: 0
6. Check vXP increased in XPOracle
```

### 2. **Staking System** 💰

**Test Flow:**
- Stake VOID tokens in xVOIDVault
- Earn APR boost based on your vXP
- Unstake tokens
- Check rewards

**Manual Test via Basescan:**
```
1. Approve VOID for staking:
   - VOID contract: https://sepolia.basescan.org/address/0x8de4043445939B0D0Cc7d6c752057707279D9893
   - Call "approve()" with:
     - spender: 0xab10B2B5E1b07447409BCa889d14F046bEFd8192
     - amount: 100000000000000000000 (100 tokens)

2. Stake tokens:
   - xVOIDVault: https://sepolia.basescan.org/address/0xab10B2B5E1b07447409BCa889d14F046bEFd8192
   - Call "stake()" with:
     - amount: 100000000000000000000
   
3. Check your staked balance:
   - Call "totalStakedVOID()" to see total
```

### 3. **Escrow System** 📦

**Test Flow:**
- Create an escrow with tokens
- Release funds to beneficiary
- Cancel escrow (if authorized)

**Manual Test via Basescan:**
```
1. Approve VOID for escrow:
   - VOID: https://sepolia.basescan.org/address/0x8de4043445939B0D0Cc7d6c752057707279D9893
   - approve() to: 0x1A9b3fE46A6e2A9669D6d53fB58D562b97071FB7

2. Create escrow:
   - EscrowVault: https://sepolia.basescan.org/address/0x1A9b3fE46A6e2A9669D6d53fB58D562b97071FB7
   - Call "createEscrow()" with:
     - beneficiary: (any address)
     - token: 0x8de4043445939B0D0Cc7d6c752057707279D9893
     - amount: 50000000000000000000 (50 VOID)

3. Release escrow:
   - Call "releaseEscrow()" with escrowId: 0
```

### 4. **Fee Distribution** 💸

**Test Flow:**
- Trigger fee distribution
- Verify 7 recipients get correct percentages:
  - Creator: 40%
  - Staker: 20%
  - PSX Treasury: 10%
  - CREATE Treasury: 10%
  - Agency: 10%
  - Grants: 5%
  - Security: 5%

**Manual Test via Basescan:**
```
1. Send ETH to router:
   - Router: https://sepolia.basescan.org/address/0x687E678aB2152d9e0952d42B0F872604533D25a9
   - Send 1 ETH (or any amount)

2. Call distributeFees() (if available)

3. Check each recipient got correct percentage
```

### 5. **Token Operations** 🪙

**Test Flow:**
- Mint more test tokens
- Transfer tokens
- Approve tokens for contracts
- Check balances

**Mint More Tokens:**
```
Each token contract has a mint() function:
- VOID: https://sepolia.basescan.org/address/0x8de4043445939B0D0Cc7d6c752057707279D9893
- PSX: https://sepolia.basescan.org/address/0x9E08A4291771d18ce9718A3Ce8adE6DC82113CC7
- CREATE: https://sepolia.basescan.org/address/0x99908B6127f45A0D4730a42DE8b4b74D313F956D

Call mint() with:
- to: YOUR_ADDRESS
- amount: 1000000000000000000000 (1000 tokens)
```

---

## 📊 Check Your Stats

### View Your Tokens
https://sepolia.basescan.org/address/0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f#tokentxns

### Check Contract State

**Total vXP in System:**
```powershell
cast call 0x8D786454ca2e252cb905f597214dD78C89E3Ba14 "totalXP()(uint256)" --rpc-url https://sepolia.base.org
```

**Your vXP:**
```powershell
cast call 0x8D786454ca2e252cb905f597214dD78C89E3Ba14 "getXP(address)(uint256)" YOUR_ADDRESS --rpc-url https://sepolia.base.org
```

**Mission Count:**
```powershell
cast call 0x7C6BF84fd111A262CCdfEC885ba8677b3F3EE9c7 "missionCount()(uint256)" --rpc-url https://sepolia.base.org
```

**Total Staked VOID:**
```powershell
cast call 0xab10B2B5E1b07447409BCa889d14F046bEFd8192 "totalStakedVOID()(uint256)" --rpc-url https://sepolia.base.org
```

---

## 🎮 Frontend Testing Checklist

Once your UI loads at http://localhost:3000, test:

- [ ] **Homepage** - Does it load?
- [ ] **Connect Wallet** - Can you connect MetaMask?
- [ ] **View Missions** - Do missions display?
- [ ] **Complete Mission** - Can you earn vXP?
- [ ] **Stake VOID** - Can you stake tokens?
- [ ] **Check Balance** - Do token balances show correctly?
- [ ] **View Stats** - Do contract stats display?
- [ ] **Create Escrow** - Can you lock funds?
- [ ] **3D World** - Does the metaverse render?
- [ ] **Chat/Social** - Do social features work?

---

## 🔧 Useful Commands

### Monitor Contracts in Real-Time
```powershell
.\scripts\Test-Deployment.ps1 -Monitor
```

Validate world/parcel mapping edge cases (Windows PowerShell):
```powershell
npm run validate:coords
```

Check land ownership for your address on Base Sepolia:
```powershell
./scripts/cast/Get-ParcelsOwnedBy.ps1 -Address <YOUR_ADDRESS>
```

Check token balance for router or any holder:
```powershell
./scripts/cast/Get-TokenBalance.ps1 -Token 0x8de4043445939B0D0Cc7d6c752057707279D9893 -Holder 0x687E678aB2152d9e0952d42B0F872604533D25a9 -Decimals 18
```

### Run Smoke Tests
```powershell
.\scripts\Test-Deployment.ps1 -SmokeTest
```

### Mint More Test Tokens
```powershell
.\scripts\Quick-Setup.ps1
```

### Check Transaction on Basescan
```
https://sepolia.basescan.org/tx/TRANSACTION_HASH
```

---

## 🐛 Troubleshooting

### "Network not supported"
- Make sure MetaMask is on Base Sepolia (Chain ID: 84532)
- Check RPC: https://sepolia.base.org

### "Insufficient funds"
- Get Base Sepolia ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- Or use deployer wallet (has test tokens)

### "Transaction reverted"
- Check you approved tokens first
- Verify you have enough balance
- Check transaction on Basescan for details

### "Contract not found"
- Verify you're on Base Sepolia network
- Check .env has correct addresses
- Restart dev server: Ctrl+C, then `npm run dev`

### Frontend not loading
- Check: http://localhost:3000
- Clear browser cache
- Check console for errors (F12)
- Restart server: Ctrl+C, then `npm run dev`

---

## 📝 Test Data Summary

**Your Test Wallet:** `0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f`

**Available Tokens:**
- VOID: ~1000 (some used for staking)
- PSX: 1000
- CREATE: 1000
- SIGNAL: 1000
- AGENCY: 1000
- USDC: 10,000
- WETH: 10

**Deployed Features:**
- ✅ Missions (create, complete, earn vXP)
- ✅ Staking (stake VOID, earn APR boost)
- ✅ Escrow (lock funds, release to beneficiary)
- ✅ Fee Router (40/20/10/10/10/5/5 distribution)
- ✅ XP Oracle (track experience, calculate boosts)

**What to Test:**
1. Complete missions and earn vXP
2. Stake VOID and check APR boost
3. Create and release escrows
4. Mint more tokens as needed
5. Explore the 3D metaverse UI
6. Test social/chat features
7. Verify economic invariants (fee splits, caps)

---

## 🎉 You're Ready to Test!

1. **Open:** http://localhost:3000
2. **Connect:** MetaMask to Base Sepolia
3. **Import:** Deployer key or use your own wallet
4. **Explore:** The VOID metaverse!

**Need more test data?** Run: `.\scripts\Quick-Setup.ps1`

**Monitor contracts:** Run: `.\scripts\Test-Deployment.ps1 -Monitor`

**View on Basescan:** https://sepolia.basescan.org/address/0x687E678aB2152d9e0952d42B0F872604533D25a9

Happy testing! 🚀
