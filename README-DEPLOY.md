# VOID Protocol - Quick Start Guide

## First-Time Setup (Do Once)

### 1. Install Foundry
```powershell
# Run the installer script
.\install-foundry.ps1

# OR manually download from:
# https://getfoundry.sh
```

**After installation:**
- Close and reopen your terminal
- Verify: `forge --version`

### 2. Install Dependencies
```powershell
forge install foundry-rs/forge-std --no-commit
```

### 3. Build Contracts
```powershell
forge build
```

You're now ready to deploy! ✅

---

## Deploy to Base Sepolia (Testnet)

### Quick Deploy
```powershell
# Make sure .env is configured with:
# - DEPLOYER_PRIVATE_KEY
# - BASE_SEPOLIA_RPC_URL  
# - BASESCAN_API_KEY

# Deploy with automatic verification
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify -vvv
```

### What Gets Deployed
- ✅ `VOID_Test` (ERC20Mock) - 1M token supply
- ✅ `VoidHookRouterV4` - Fee router (40/20/10/10/10/5/5 split)

### After Deployment
1. Copy contract addresses from console output
2. Add to `.env`:
   ```bash
   VOID_TOKEN_ADDRESS=0x...
   VOID_HOOK_ROUTER_V4=0x...
   ```
3. Verify on Basescan: https://sepolia.basescan.org

---

## Deploy to Base Mainnet (When Ready)

### Pre-Launch Checklist
- [ ] Testnet deployment successful
- [ ] All contracts verified on Basescan
- [ ] Fee distribution tested end-to-end
- [ ] Multi-sig wallets created for recipients
- [ ] Deployer wallet funded with ≥0.5 ETH on Base Mainnet
- [ ] Update `.env` with mainnet multi-sig addresses:
  ```bash
  XVOID_STAKING_POOL=0x...
  PSX_TREASURY=0x...
  CREATE_TREASURY=0x...
  AGENCY_WALLET=0x...
  CREATOR_GRANTS_VAULT=0x...
  SECURITY_RESERVE=0x...
  ```

### Mainnet Deploy Command
```powershell
# ⚠️ PRODUCTION DEPLOYMENT - DOUBLE CHECK EVERYTHING ⚠️
forge script script/Deploy.s.sol --rpc-url base_mainnet --broadcast --verify -vvv
```

---

## Common Commands

### Build & Test
```powershell
forge build                    # Compile contracts
forge test                     # Run tests
forge test -vvv                # Verbose test output
forge clean                    # Clean build artifacts
```

### Gas Estimation
```powershell
forge test --gas-report        # Show gas usage per function
```

### Contract Verification (Manual)
```powershell
forge verify-contract <ADDRESS> <CONTRACT_NAME> --chain-id 84532 --watch
```

### Check Deployer Balance
```powershell
cast balance <YOUR_ADDRESS> --rpc-url $BASE_SEPOLIA_RPC_URL
```

---

## Troubleshooting

### "forge: command not found"
- Foundry not installed or not in PATH
- Solution: Run `.\install-foundry.ps1` and restart terminal

### "Insufficient funds"
- Deployer wallet needs testnet ETH
- Get from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### "Verification failed"
- Check `BASESCAN_API_KEY` is set in `.env`
- Get API key from: https://basescan.org/myapikey

### "Invalid fee sum"
- VoidHookRouterV4 fees must total 100%
- Current split: 40+20+10+10+10+5+5 = 100% ✅

---

## Important Files

| File | Purpose |
|------|---------|
| `foundry.toml` | Foundry configuration (Solidity version, networks) |
| `script/Deploy.s.sol` | Main deployment script |
| `.env` | Private keys, RPC URLs, API keys |
| `broadcast/` | Deployment transaction logs |
| `DEPLOY.md` | Detailed deployment documentation |

---

## Resources

- **Foundry Book**: https://book.getfoundry.sh
- **Base Docs**: https://docs.base.org
- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Basescan (Testnet)**: https://sepolia.basescan.org
- **Basescan (Mainnet)**: https://basescan.org

---

## Support

For deployment issues:
1. Check this README first
2. Review `DEPLOY.md` for detailed steps
3. Check Foundry docs: https://book.getfoundry.sh
4. Verify `.env` variables are set correctly

**Pro Tip**: Always test on Base Sepolia before mainnet deployment!
