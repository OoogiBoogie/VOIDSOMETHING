# VOID Contracts - Quick Deployment Guide

Your development environment has module resolution issues preventing Hardhat/Foundry from working.

## ✅ BEST OPTION: Use Remix IDE (Web-based, Zero Setup)

### Step 1: Go to Remix
Visit: https://remix.ethereum.org/

### Step 2: Create VoidHookRouterV4.sol
1. In Remix, create new file: `VoidHookRouterV4.sol`
2. Copy contents from: `C:\Users\rigof\Documents\000\contracts\VoidHookRouterV4.sol`

### Step 3: Create ERC20Mock.sol  
1. Create: `mocks/ERC20Mock.sol`
2. Copy from: `C:\Users\rigof\Documents\000\contracts\mocks\ERC20Mock.sol`

### Step 4: Install Dependencies
Remix will auto-import OpenZeppelin. If not:
1. Click `.deps` folder
2. Remix auto-downloads `@openzeppelin/contracts`

### Step 5: Compile
1. Click "Solidity Compiler" tab (left sidebar)
2. Select compiler version: `0.8.24`
3. Click "Compile VoidHookRouterV4.sol"
4. Click "Compile ERC20Mock.sol"

### Step 6: Connect Wallet
1. Click "Deploy & Run Transactions" tab
2. Environment: Select "Injected Provider - MetaMask"
3. MetaMask will prompt - connect your deployer wallet
4. Switch MetaMask to "Base Sepolia" network

### Step 7: Deploy ERC20Mock (VOID Test Token)
1. In "Contract" dropdown, select `ERC20Mock`
2. Constructor parameters:
   - name: `"VOID Test"`
   - symbol: `"VOID"`
   - initialSupply: `1000000000000000000000000` (1M tokens with 18 decimals)
3. Click "Deploy"
4. Confirm in MetaMask
5. **COPY THE DEPLOYED ADDRESS**

### Step 8: Deploy VoidHookRouterV4
1. In "Contract" dropdown, select `VoidHookRouterV4`
2. Constructor parameters (use your deployer address for all on testnet):
   - xVoidStakingPool_: `YOUR_DEPLOYER_ADDRESS`
   - psxTreasury_: `YOUR_DEPLOYER_ADDRESS`
   - createTreasury_: `YOUR_DEPLOYER_ADDRESS`
   - agencyWallet_: `YOUR_DEPLOYER_ADDRESS`
   - creatorGrantsVault_: `YOUR_DEPLOYER_ADDRESS`
   - securityReserve_: `YOUR_DEPLOYER_ADDRESS`
3. Click "Deploy"
4. Confirm in MetaMask
5. **COPY THE DEPLOYED ADDRESS**

### Step 9: Verify on Basescan (Optional but Recommended)
1. Get your Basescan API key from: https://basescan.org/myapikey
2. In Remix, right-click deployed contract
3. Select "Verify Contract"
4. Follow prompts

### Step 10: Update .env
Add to your `.env` file:
```
VOID_TOKEN_ADDRESS=<ERC20Mock_address>
VOID_HOOK_ROUTER_V4=<VoidHookRouterV4_address>
```

---

## Alternative: Fix Your Environment (More Complex)

If you want to fix the development environment instead:

### Option A: Remove "type": "module" from package.json
This will break your Next.js app but fix Hardhat.

### Option B: Create Isolated Hardhat Workspace
```powershell
# Outside current project
mkdir void-contracts-deploy
cd void-contracts-deploy
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
# Copy contracts folder
# Deploy with Hardhat
```

### Option C: Use Windows WSL + Foundry
```powershell
# Restart computer (WSL was just installed)
wsl --install Ubuntu
# After restart and Ubuntu setup:
wsl
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge install
forge build
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
```

---

## Recommended: Remix IDE (5 minutes, zero issues)

The Remix approach is fastest and most reliable. Just copy-paste contracts, click deploy.

Your wallet is ready (0.1 ETH on Base Sepolia ✅)

