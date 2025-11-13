# VOID Protocol Deployment Guide

## Quick Start

### Prerequisites
1. **Install Foundry**: https://getfoundry.sh
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Install Dependencies**:
   ```bash
   make install
   ```

3. **Configure `.env`** (already set up):
   - `DEPLOYER_PRIVATE_KEY` - Your deployment wallet private key
   - `BASE_SEPOLIA_RPC_URL` - Base Sepolia RPC endpoint
   - `BASE_MAINNET_RPC_URL` - Base Mainnet RPC endpoint (for later)
   - `BASESCAN_API_KEY` - Basescan API key for verification

---

## Testnet Deployment (Base Sepolia)

### 1. Build & Test
```bash
make build
make test
```

### 2. Deploy to Testnet
```bash
make deploy-testnet
```

**What gets deployed:**
- ✅ `ERC20Mock` (VOID_Test) - 1M supply
- ✅ `VoidHookRouterV4` - Fee router with 40/20/10/10/10/5/5 split

**Output:**
- Contract addresses printed to console
- Deployment artifacts saved to `broadcast/Deploy.s.sol/84532/run-latest.json`
- Contracts automatically verified on Basescan

### 3. Copy Addresses to `.env`
After deployment, add these to your `.env`:
```bash
VOID_TOKEN_ADDRESS=0x...
VOID_HOOK_ROUTER_V4=0x...
```

---

## Mainnet Deployment (Base)

### Pre-Launch Checklist

#### 1. **Audit Contracts** ✅
- [x] VoidHookRouterV4 fee split validated (40/20/10/10/10/5/5 = 100%)
- [x] FoundersNFT prices set correctly
- [ ] External audit completed (if required)
- [ ] Community review period completed

#### 2. **Update Multi-Sig Addresses**
Before mainnet deploy, add these to `.env`:
```bash
# Mainnet recipient addresses (REQUIRED)
XVOID_STAKING_POOL=0x...      # xVOID staking contract
PSX_TREASURY=0x...             # PSX DAO multi-sig
CREATE_TREASURY=0x...          # CREATE DAO multi-sig
AGENCY_WALLET=0x...            # Agency operations wallet
CREATOR_GRANTS_VAULT=0x...     # Creator grants contract
SECURITY_RESERVE=0x...         # Security multi-sig
```

**⚠️ CRITICAL**: Never use a single EOA for mainnet recipients. Use multi-sig wallets (Safe, etc.).

#### 3. **Fund Deployer Wallet**
- Minimum: **0.5 ETH** on Base Mainnet
- Recommended: **1.0 ETH** (buffer for gas spikes)

#### 4. **Update Deploy Script for Mainnet**
Edit `script/Deploy.s.sol` line 36-55 to use **real VOID token address** instead of deploying a mock.

#### 5. **Test on Sepolia First**
```bash
make deploy-testnet
# Verify all contracts on Basescan
# Test fee distribution end-to-end
```

### Mainnet Deploy Command
```bash
make deploy-mainnet
```

**Safety Features:**
- 5-second countdown to cancel
- Automatic Basescan verification
- Verbose output for debugging

### Post-Deploy Verification
1. **Check Basescan** - All contracts verified
2. **Validate Fee Split** - Call `validateFeeSum()` on router
3. **Test Small Transaction** - Route fees with minimal amount
4. **Update Frontend** - Add contract addresses to app `.env`

---

## Gas Estimates

### Base Sepolia (Testnet)
- ERC20Mock: ~800k gas (~$0.001 at 0.5 gwei)
- VoidHookRouterV4: ~2.5M gas (~$0.003 at 0.5 gwei)
- **Total: ~0.004 ETH**

### Base Mainnet
- ERC20Mock: ~800k gas (~$0.10 at 1 gwei, $15 ETH)
- VoidHookRouterV4: ~2.5M gas (~$0.30 at 1 gwei, $15 ETH)
- **Total: ~0.4 ETH** (includes buffer)

---

## Troubleshooting

### "Insufficient funds"
- Check deployer balance: `cast balance <address> --rpc-url base_sepolia`
- Get testnet ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### "Verification failed"
- Check `BASESCAN_API_KEY` in `.env`
- Manually verify: `forge verify-contract <address> <contract> --chain-id 84532`

### "Invalid fee sum"
- Fee constants in `VoidHookRouterV4.sol` must sum to 10000 BPS
- Currently: 4000+2000+1000+1000+1000+500+500 = 10000 ✅

---

## Quick Reference

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Base Sepolia | 84532 | `$BASE_SEPOLIA_RPC_URL` | https://sepolia.basescan.org |
| Base Mainnet | 8453 | `$BASE_MAINNET_RPC_URL` | https://basescan.org |

### Deployment Artifacts
- **Foundry**: `broadcast/Deploy.s.sol/<chainId>/run-latest.json`
- **Addresses**: Copy to `.env` after each deploy

---

## Support

- Foundry Docs: https://book.getfoundry.sh
- Base Docs: https://docs.base.org
- Basescan: https://basescan.org
