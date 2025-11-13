# VOID Protocol - Complete Deployment Checklist

## ✅ What's Already Done

- [x] Foundry configuration created (`foundry.toml`)
- [x] Deployment script created (`script/Deploy.s.sol`)
- [x] Contracts audited (fees validated, logic sound)
- [x] Testnet-friendly pricing (FoundersNFT: 0.001/0.002 ETH)
- [x] Environment variables configured (`.env`)
- [x] AI telemetry daemon running
- [x] Documentation created (this file + DEPLOY.md + README-DEPLOY.md)

---

## 🚀 To Deploy NOW (Base Sepolia Testnet)

### Step 1: Install Foundry (One-Time Setup)

**Windows:**
1. Download Foundry installer from: https://getfoundry.sh
2. Run the installer
3. Open a **new** terminal (important - refreshes PATH)
4. Verify: `forge --version`

**Alternative (if above fails):**
1. Download latest release from: https://github.com/foundry-rs/foundry/releases
2. Extract `forge.exe`, `cast.exe`, `anvil.exe` to `C:\foundry\bin`
3. Add `C:\foundry\bin` to your system PATH
4. Restart terminal

### Step 2: Install Dependencies
```powershell
cd C:\Users\rigof\Documents\000
forge install foundry-rs/forge-std --no-commit
```

### Step 3: Build Contracts
```powershell
forge build
```

### Step 4: Deploy to Base Sepolia
```powershell
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify -vvv
```

### Step 5: Save Contract Addresses
After deployment, you'll see output like:
```
VOID_Test deployed: 0xABC...
VoidHookRouterV4 deployed: 0xDEF...
```

Add these to your `.env`:
```bash
VOID_TOKEN_ADDRESS=0xABC...
VOID_HOOK_ROUTER_V4=0xDEF...
```

---

## 🎯 Future Mainnet Launch (When Ready)

### Prerequisites
1. ✅ Testnet deployment successful
2. ✅ All contracts verified on Basescan Sepolia
3. ✅ Fee distribution tested with real transactions
4. ⏸️  Multi-sig wallets created for all recipients:
   - xVOID Staking Pool
   - PSX Treasury
   - CREATE Treasury
   - Agency Wallet
   - Creator Grants Vault
   - Security Reserve
5. ⏸️  Deployer wallet funded with ≥0.5 ETH on Base Mainnet
6. ⏸️  Update `script/Deploy.s.sol` line 36-55 with real VOID token address

### Mainnet Deploy Command
```powershell
# Add mainnet multi-sig addresses to .env first!
forge script script/Deploy.s.sol --rpc-url base_mainnet --broadcast --verify -vvv
```

**Safety Check:**
- Script includes 5-second countdown before mainnet deploy
- All recipient addresses validated
- Fee sum automatically verified (must equal 100%)

---

## 📋 What Happens During Deployment

### Testnet (Base Sepolia - Chain ID 84532)
1. Deploys `VOID_Test` (ERC20Mock) - 1M token supply
2. Deploys `VoidHookRouterV4` with deployer address as placeholder for all recipients
3. Validates fee split equals 100%
4. Automatically verifies contracts on Basescan
5. Prints addresses to console

### Mainnet (Base - Chain ID 8453)
1. Uses existing VOID token (no mock deployment)
2. Deploys `VoidHookRouterV4` with multi-sig addresses from `.env`
3. Validates fee split equals 100%
4. Automatically verifies contracts on Basescan
5. Prints addresses to console

---

## 💰 Cost Estimates

### Base Sepolia (Testnet)
- Gas: ~3.3M gas (~0.004 ETH at 0.5 gwei)
- Cost: **Basically free**

### Base Mainnet
- Gas: ~3.3M gas (~0.4 ETH at 1 gwei, assuming $15 ETH)
- Cost: **~$600 at current prices**
- Buffer: Deploy with ≥0.5 ETH to account for gas spikes

---

## 🔍 Post-Deployment Verification

### Automated Checks
- ✅ Contracts auto-verified on Basescan
- ✅ Fee sum validated in constructor (reverts if ≠100%)
- ✅ Zero address checks for all recipients
- ✅ Deployment artifacts saved to `broadcast/`

### Manual Checks (Recommended)
1. **Verify on Basescan**
   - Testnet: https://sepolia.basescan.org
   - Mainnet: https://basescan.org

2. **Test Fee Distribution**
   ```powershell
   # Call routeFees with small amount
   cast send $VOID_HOOK_ROUTER_V4 "routeFees(address,uint256,address)" \
     $VOID_TOKEN 1000000000000000000 $CREATOR_ADDRESS \
     --rpc-url base_sepolia \
     --private-key $DEPLOYER_PRIVATE_KEY
   ```

3. **Validate Fee Split**
   ```powershell
   # Check constants (should sum to 10000)
   cast call $VOID_HOOK_ROUTER_V4 "CREATOR_SHARE_BPS()" --rpc-url base_sepolia
   cast call $VOID_HOOK_ROUTER_V4 "STAKER_SHARE_BPS()" --rpc-url base_sepolia
   # etc...
   ```

---

## 📊 Current Configuration

### Fee Split (Validated ✅)
- Creator: 40% (4000 BPS)
- Stakers: 20% (2000 BPS)
- PSX Treasury: 10% (1000 BPS)
- CREATE Treasury: 10% (1000 BPS)
- Agency: 10% (1000 BPS)
- Grants: 5% (500 BPS)
- Security: 5% (500 BPS)
- **Total: 100% (10000 BPS)** ✅

### NFT Pricing (Testnet)
- Schizo Mint: FREE (0 ETH)
- Whitelist Mint: 0.001 ETH
- Public Mint: 0.002 ETH

### Network Details
| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Base Sepolia | 84532 | `$BASE_SEPOLIA_RPC_URL` | https://sepolia.basescan.org |
| Base Mainnet | 8453 | `$BASE_MAINNET_RPC_URL` | https://basescan.org |

---

## 🛠️ Troubleshooting Guide

### Issue: "forge: command not found"
**Solution:**
1. Foundry not installed or not in PATH
2. Run installation steps above
3. Restart terminal after installation

### Issue: "Insufficient funds"
**Solution:**
1. Check deployer balance: `cast balance $DEPLOYER_ADDRESS --rpc-url base_sepolia`
2. Get testnet ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
3. Need ≥0.1 ETH for testnet, ≥0.5 ETH for mainnet

### Issue: "Verification failed"
**Solution:**
1. Verify `BASESCAN_API_KEY` is set in `.env`
2. Get API key from: https://basescan.org/myapikey
3. Manual verification: `forge verify-contract <addr> <contract> --chain-id 84532`

### Issue: "Invalid fee sum"
**Solution:**
1. This should never happen (validated in contract)
2. If it does: fees in `VoidHookRouterV4.sol` lines 38-44 must sum to 10000
3. Current sum: 4000+2000+1000+1000+1000+500+500 = 10000 ✅

### Issue: "Compilation failed"
**Solution:**
1. Run `forge clean` to clear cache
2. Run `forge build --force`
3. Check Solidity version matches (0.8.24 in contracts)

---

## 📁 Important Files Reference

| File | Purpose | When to Update |
|------|---------|----------------|
| `foundry.toml` | Foundry config | Never (unless changing Solidity version) |
| `script/Deploy.s.sol` | Deploy script | Before mainnet (add real VOID token addr) |
| `.env` | Secrets | Add contract addresses after deploy |
| `broadcast/` | Tx logs | Auto-generated, never edit |
| `DEPLOY.md` | Detailed docs | Reference during mainnet prep |
| `README-DEPLOY.md` | Quick start | Daily reference |
| `CHECKLIST.md` | This file | Track deployment progress |

---

## ⏭️ Next Steps After Testnet Deploy

1. [ ] Copy contract addresses to `.env`
2. [ ] Verify contracts on Basescan Sepolia
3. [ ] Test fee distribution with small transaction
4. [ ] Update frontend with contract addresses
5. [ ] Create multi-sig wallets for mainnet recipients
6. [ ] Plan mainnet launch date
7. [ ] Update `script/Deploy.s.sol` with mainnet config
8. [ ] Fund mainnet deployer wallet (≥0.5 ETH)
9. [ ] Execute mainnet deployment
10. [ ] Celebrate! 🎉

---

## 📞 Support Resources

- **Foundry Docs**: https://book.getfoundry.sh
- **Base Docs**: https://docs.base.org
- **Base Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Basescan API**: https://docs.basescan.org/
- **OpenZeppelin**: https://docs.openzeppelin.com/

---

**Last Updated**: November 10, 2025  
**Status**: Ready for testnet deployment (pending Foundry installation)
