# 🚀 VOID METAVERSE TESTNET - DEPLOYMENT & TESTING GUIDE

**Network:** Base Sepolia  
**Date:** November 11, 2025  
**Status:** Ready for Deployment

---

## 📋 OVERVIEW

This guide covers deploying and testing the new testnet-only features:
- **WorldLandTestnet**: 40×40 land grid (1600 parcels) for purchase with VOID
- **VoidSwapTestnet**: Simple AMM for VOID/USDC swaps with fee routing

These contracts integrate with existing deployed contracts on Base Sepolia.

---

## 🔧 STEP 1: DEPLOY CONTRACTS

### Prerequisites

Ensure `.env` has:
```bash
DEPLOYER_PRIVATE_KEY=0xa94124fe7ef92901c2161a0bb19b5ff5c289c84efe9798f0f4b0fe97c9952442
DEPLOYER_ADDRESS=0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

### Deploy Command

```powershell
# Add Foundry to PATH
$env:Path += ";C:\Users\rigof\.foundry\bin"

# Deploy testnet addons
forge script script/DeployTestnetAddons.s.sol `
  --rpc-url https://sepolia.base.org `
  --broadcast `
  -vvv
```

### Expected Output

```
[1/4] Deploying WorldLandTestnet...
  WorldLandTestnet deployed: 0x...
  Price per parcel: 100 VOID
  Total parcels: 1600 (40x40 grid)

[2/4] Deploying VoidSwapTestnet...
  VoidSwapTestnet deployed: 0x...
  Fee: 0.3% routed to VoidHookRouterV4

[3/4] Adding initial liquidity to swap...
  Added liquidity:
    VOID: 10000
    USDC: 50000
  Initial price: 1 USDC = 0.2 VOID

[4/4] Deployment Summary
WorldLandTestnet: 0x...
VoidSwapTestnet: 0x...
```

---

## 📝 STEP 2: UPDATE CONFIGURATION

### Update `.env`

Add the deployed addresses to `.env`:

```bash
# Testnet Addons
NEXT_PUBLIC_WORLD_LAND_ADDRESS=0x... # From deployment output
NEXT_PUBLIC_VOID_SWAP_ADDRESS=0x...  # From deployment output
```

### Update `deployments/baseSepolia.json`

Add to the existing JSON:

```json
{
  "voidHookRouter": "0x687E678aB2152d9e0952d42B0F872604533D25a9",
  "xpOracle": "0x8D786454ca2e252cb905f597214dD78C89E3Ba14",
  "escrowVault": "0x1A9b3fE46A6e2A9669D6d53fB58D562b97071FB7",
  "xVoidVault": "0xab10B2B5E1b07447409BCa889d14F046bEFd8192",
  "missionRegistry": "0x7C6BF84fd111A262CCdfEC885ba8677b3F3EE9c7",
  "tokenExpansionOracle": "0x2B0CDb539682364e801757437e9fb8624eD50779",
  
  "worldLand": "0x...",  // NEW
  "voidSwap": "0x...",   // NEW
  
  "tokens": {
    "VOID": "0x8de4043445939B0D0Cc7d6c752057707279D9893",
    "USDC": "0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9",
    "PSX": "0x9E08A4291771d18ce9718A3Ce8adE6DC82113CC7",
    "CREATE": "0x99908B6127f45A0D4730a42DE8b4b74D313F956D",
    "SIGNAL": "0x29c4172C243860f906C9625c983aE93F1147504B",
    "AGENCY": "0xb270007B1D6EBbeF505612D8b3C779A536A7227b",
    "WETH": "0x14553932F4f3de19d47B716875804e84e8AE4311"
  }
}
```

---

## 🎮 STEP 3: TEST WORKFLOWS

### Test Path 1: Land Purchase (WORLD Hub)

**Objective:** Buy a land parcel and verify ownership

**Steps:**

1. **Connect Wallet**
   - Open http://localhost:3000
   - Click "Connect Wallet" (top-right)
   - Connect to MetaMask with Base Sepolia network
   - Ensure wallet has testnet ETH (for gas) and VOID tokens

2. **Navigate to WORLD Hub**
   - Click "WORLD" in top navigation
   - Open "Land" panel from left rail

3. **View Land Grid**
   - See 40×40 grid with 1600 parcels
   - Parcels color-coded by district:
     - **Purple** = DeFi District (bottom-left quadrant)
     - **Teal** = Creator Quarter (bottom-right)
     - **Pink** = DAO Plaza (top-left)
     - **Blue** = AI Nexus (top-right)

4. **Select a Parcel**
   - Click any green/available parcel
   - Panel on right shows parcel details:
     - Parcel ID (0-1599)
     - Coordinates (X, Z)
     - District name
     - Price (100 VOID)
     - Status (Available)

5. **Buy Parcel**
   - Click "Buy Parcel" button
   - MetaMask prompts:
     1. **First TX:** Approve 100 VOID to WorldLandTestnet
     2. **Second TX:** Purchase parcel
   - Wait for confirmations (~2-5 seconds on Sepolia)

6. **Verify Ownership**
   - Parcel now shows **teal glow** (owned by you)
   - "My Parcels" list shows parcel ID
   - Check on Basescan: `https://sepolia.basescan.org/address/WORLD_LAND_ADDRESS`

**Expected Result:**
- ✅ Parcel purchased
- ✅ VOID deducted from wallet
- ✅ NFT minted (ERC721)
- ✅ Parcel shows as "owned" in grid

---

### Test Path 2: VOID ↔ USDC Swap (DEFI Hub)

**Objective:** Swap tokens and verify fees route to VoidHookRouterV4

**Steps:**

1. **Navigate to DEFI Hub**
   - Click "DEFI" in top navigation
   - Open "Swap" panel

2. **Configure Swap**
   - **From:** VOID
   - **To:** USDC
   - **Amount:** 100 VOID
   - See live quote update (e.g., "~20 USDC")
   - See fee: 0.3 VOID
   - See price impact: < 1%

3. **Execute Swap**
   - Click "Swap" button
   - MetaMask prompts:
     1. **First TX (if needed):** Approve VOID to VoidSwapTestnet
     2. **Second TX:** Execute swap
   - Wait for confirmation

4. **Verify Results**
   - VOID balance decreased by ~100
   - USDC balance increased by ~20
   - Notification: "Swapped 100 VOID for 20 USDC! 🎉"

5. **Verify Fee Routing**
   - Check VoidHookRouterV4 on Basescan
   - Should have received 0.3 VOID as fee
   - Optionally, call `distributeFees()` to split to 7 recipients

**Expected Result:**
- ✅ Swap executed successfully
- ✅ Tokens transferred
- ✅ 0.3% fee collected
- ✅ Fee sent to VoidHookRouterV4

---

### Test Path 3: Mission → vXP → Staking (WORLD/DEFI)

**Objective:** Complete full protocol loop: earn vXP, get APR boost, stake VOID

**Steps:**

1. **Create Mission (WORLD Hub)**
   ```powershell
   # Via terminal (or UI if available)
   $env:Path += ";C:\Users\rigof\.foundry\bin"
   $RPC = "https://sepolia.base.org"
   $KEY = "0xa94124fe7ef92901c2161a0bb19b5ff5c289c84efe9798f0f4b0fe97c9952442"
   
   cast send 0x7C6BF84fd111A262CCdfEC885ba8677b3F3EE9c7 \
     "createMission(string,uint256)" \
     "Complete First Swap" "100" \
     --rpc-url $RPC --private-key $KEY
   ```

2. **Complete Mission**
   ```powershell
   cast send 0x7C6BF84fd111A262CCdfEC885ba8677b3F3EE9c7 \
     "completeMission(uint256)" "0" \
     --rpc-url $RPC --private-key $KEY
   ```

3. **Check vXP Balance**
   ```powershell
   cast call 0x8D786454ca2e252cb905f597214dD78C89E3Ba14 \
     "getXP(address)(uint256)" \
     "0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f" \
     --rpc-url $RPC
   ```
   - Should return `100` (100 vXP earned)

4. **Check APR Boost**
   ```powershell
   cast call 0x8D786454ca2e252cb905f597214dD78C89E3Ba14 \
     "getAPRBoost(address)(uint256)" \
     "0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f" \
     --rpc-url $RPC
   ```
   - Should return boost percentage (e.g., 50 BPS = 0.5%)

5. **Stake VOID (DEFI Hub)**
   - Navigate to DEFI → Staking panel
   - Enter amount: 100 VOID
   - Click "Stake"
   - Approve + Stake transactions
   - See staked balance + APR with boost

**Expected Result:**
- ✅ Mission completed
- ✅ 100 vXP awarded
- ✅ APR boost applied
- ✅ VOID staked with boosted rewards

---

## 🧪 VERIFICATION CHECKLIST

After all tests:

- [ ] **Land Contract**
  - [ ] 1+ parcels sold
  - [ ] NFTs minted to buyers
  - [ ] VOID collected in contract
  - [ ] Grid UI shows ownership correctly

- [ ] **Swap Contract**
  - [ ] Swaps execute in both directions (VOID→USDC, USDC→VOID)
  - [ ] Fees accumulate in swap contract
  - [ ] Fees can be routed to VoidHookRouterV4
  - [ ] Quote system accurate

- [ ] **Integration**
  - [ ] All contracts interact correctly
  - [ ] HUD updates reflect on-chain state
  - [ ] Theme consistent across all hubs
  - [ ] No console errors (except missing audio/icons)

---

## 🎨 THEME VERIFICATION

**Check Visual Consistency:**

1. **Top Bar**
   - Gradient: purple → teal → purple
   - No hard-coded colors

2. **Panels**
   - Background: `rgba(2, 4, 20, 0.92)`
   - Border: `#1b2138`
   - Consistent across WORLD, DEFI, CREATOR, DAO, AI OPS

3. **Buttons**
   - Primary: purple→teal gradient with glow
   - Rounded (`border-radius: 999px`)
   - Hover state with enhanced glow

4. **Text**
   - Primary: `#f5f7ff`
   - Secondary: `#9ea3c7`
   - Muted: `#3a3f5c`

5. **No Light Theme Leaks**
   - All screens use dark theme
   - No white backgrounds
   - No light-mode components

---

## 🐛 TROUBLESHOOTING

### Issue: "Contract not deployed"

**Solution:** Check `.env` has correct addresses from deployment output.

### Issue: "Insufficient VOID balance"

**Solution:** Mint test tokens:
```powershell
cast send 0x8de4043445939B0D0Cc7d6c752057707279D9893 \
  "mint(address,uint256)" \
  "YOUR_WALLET_ADDRESS" \
  "1000000000000000000000" \
  --rpc-url https://sepolia.base.org \
  --private-key $KEY
```

### Issue: "Swap fails with 'Insufficient liquidity'"

**Solution:** Check swap contract reserves:
```powershell
cast call VOID_SWAP_ADDRESS "getReserves()(uint256,uint256)" --rpc-url https://sepolia.base.org
```

If empty, re-run deployment script or add liquidity manually.

### Issue: "Land parcel already sold"

**Solution:** Select a different parcel. Check availability:
```powershell
cast call WORLD_LAND_ADDRESS "isAvailable(uint256)(bool)" "PARCEL_ID" --rpc-url https://sepolia.base.org
```

---

## 📊 MONITORING

Monitor live contract stats:

```powershell
.\scripts\Test-Deployment.ps1 -Monitor
```

This shows:
- Total vXP in system
- Missions created/completed
- Escrows active
- Staked VOID
- Fee router status

Add custom monitoring for new contracts:
- Total land parcels sold
- Swap volume
- Fees collected

---

## 🎯 SUCCESS CRITERIA

Testnet MVP is ready when:

1. ✅ User can buy land parcel via UI
2. ✅ User can swap VOID ↔ USDC via UI
3. ✅ Fees from swaps route to VoidHookRouterV4
4. ✅ All HUD screens use unified neon theme
5. ✅ No broken UI elements (excluding missing audio/icons)
6. ✅ 3D world + HUD state stay in sync
7. ✅ Wallet connection works smoothly
8. ✅ Transactions confirm on Base Sepolia

---

## 🚀 NEXT STEPS

After successful testnet deployment:

1. **Phase 1: Polish**
   - Add missing audio files
   - Create icons/favicons
   - Improve 3D land visualization (markers, labels)

2. **Phase 2: Features**
   - Building placement on land
   - Creator marketplace integration
   - Governance/DAO voting

3. **Phase 3: Mainnet**
   - Full economic audit
   - Security review
   - Mainnet deployment (use `AI_DEPLOYMENT_RULES.md`)

---

**TESTNET SANDBOX COMPLETE** ✅  
All contracts, hooks, and UI ready for Base Sepolia testing.
