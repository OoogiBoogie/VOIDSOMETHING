# TESTNET DEPLOYMENT QUICK REFERENCE

**Date:** November 12, 2025  
**Target:** Base Sepolia (Chain ID: 84532)  
**Status:** ✅ READY (7/7 checks passed)

---

## PREFLIGHT COMPLETE ✅

Your VOID deployment passed all readiness checks:
- ✅ Environment configured (.env file)
- ✅ Node.js v22.20.0 installed
- ✅ Dependencies installed (node_modules)
- ✅ Build successful (.next folder)
- ✅ Smart contracts configured (hardhat.config.cts)
- ✅ Documentation complete (PHASE-5-STARTUP.md)
- ✅ Demo protection active (lib/demoIntegrity.ts)

---

## DEPLOYMENT COMMANDS

### 1. Get Testnet ETH
```
https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
```
Minimum: 0.1 Sepolia ETH in deployer wallet

### 2. Deploy Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

**Required Environment Variables in Vercel:**
- `NEXT_PUBLIC_NETWORK=baseSepolia`
- `NEXT_PUBLIC_DEMO_MODE=false`
- `NEXT_PUBLIC_USE_MOCK_DATA=false`
- `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org`

### 3. Deploy Smart Contracts (Optional)
```bash
# Deploy VoidScore (ERC-20 + XP tracking)
npx hardhat run scripts/deploy-voidscore.ts --network baseSepolia

# Deploy XPOracle (off-chain XP bridge)
npx hardhat run scripts/deploy-xporacle.ts --network baseSepolia

# Deploy VoidMessaging (Net Protocol)
npx hardhat run scripts/deploy-voidmessaging.ts --network baseSepolia

# Deploy VoidAgency (gig marketplace)
npx hardhat run scripts/deploy-voidagency.ts --network baseSepolia
```

### 4. Verify Contracts
```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## POST-DEPLOYMENT CHECKLIST

**Frontend:**
- [ ] Verify site loads at Vercel URL
- [ ] Test demo mode (should still work)
- [ ] Connect MetaMask to Base Sepolia
- [ ] Test wallet connection
- [ ] Test live mode features

**Smart Contracts:**
- [ ] Verify contracts on Basescan
- [ ] Update `config/contracts.json` with addresses
- [ ] Test contract interactions

**Monitoring:**
- [ ] Check Vercel deployment logs
- [ ] Monitor Sentry for errors (if configured)
- [ ] Test on mobile devices

**Community:**
- [ ] Share invite codes with beta testers
- [ ] Post announcement on Twitter/Discord
- [ ] Update README with testnet URL

---

## TROUBLESHOOTING

**Build fails:**
```bash
# Clean build
npm run build
```

**Contract deployment fails:**
- Check wallet has enough Sepolia ETH
- Verify RPC URL in .env
- Check hardhat.config.cts network settings

**Frontend won't connect to wallet:**
- Ensure MetaMask is on Base Sepolia network
- Add Base Sepolia network to MetaMask:
  - Network Name: Base Sepolia
  - RPC URL: https://sepolia.base.org
  - Chain ID: 84532
  - Currency: ETH

**Demo mode not working:**
- Check `NEXT_PUBLIC_DEMO_MODE=true` for demo
- Check demo integrity: `lib/demoIntegrity.ts` exists
- Verify checksum matches: '2a7f9c3e'

---

## DOCUMENTATION

**Phase 5 Guide:**
- `PHASE-5-STARTUP.md` - Full deployment sequence

**Phase 4.6 Deliverables:**
- `DEMO-SCRIPT-SUITE.md` - 4 demo scripts (30s/2min/7min/15min)
- `PHASE-4.6-VERIFICATION.md` - Regression report (0 bugs)

**System Scripts:**
- `npm run void:verify` - Run system self-check
- `npm run demo:build` - Build demo freeze version

---

## NETWORK DETAILS

**Base Sepolia:**
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- Faucet: https://www.coinbase.com/faucets

**Gas Costs (Estimated):**
- Transaction: ~$0.001
- Contract deployment: ~$0.01-0.05
- Contract interaction: ~$0.002

---

## SUPPORT

**Issues?** Check:
1. `.env` file configured correctly
2. Wallet has Sepolia ETH
3. RPC endpoint responding
4. Build successful (`npm run build`)

**Documentation:**
- PHASE-5-STARTUP.md (comprehensive guide)
- TESTNET-METAVERSE-GUIDE.md (user onboarding)
- DEPLOYMENT-CHECKLIST.md (production checklist)

---

**Status:** ✅ READY FOR TESTNET DEPLOYMENT  
**Last Check:** November 12, 2025  
**Readiness Score:** 7/7 (100%)

🚀 **You're ready to deploy!**
