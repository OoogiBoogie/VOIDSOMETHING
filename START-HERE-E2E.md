# 🚀 START HERE - E2E Testing

**Welcome, developer!** This guide gets you testing in **5 minutes**.

---

## ⚡ Quick Start (3 Commands)

### 1. Install Foundry
```powershell
.\install-foundry-windows.ps1
cast --version  # Verify
```

### 2. Configure Environment
```powershell
cp .env.local.example .env.local
notepad .env.local  # Add your Privy + WalletConnect IDs
```

### 3. Run Test Conductor
```powershell
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run E2E tests (replace with your testnet private key)
.\scripts\Test-Conductor.ps1 -WalletPrivKey 0xYOUR_TESTNET_KEY
```

**That's it!** The script guides you through the rest.

---

## 📚 Documentation

**Pick your path:**

### 👨‍💻 I'm a new developer
→ Read **[DEV-E2E-ACCESS-GUIDE.md](./DEV-E2E-ACCESS-GUIDE.md)** (comprehensive setup)

### 🧪 I'm ready to test now
→ Read **[E2E-QUICK-START.md](./E2E-QUICK-START.md)** (testing procedures)

### 📊 I need to log results
→ Use **[TEST-CONDUCTOR-RESULTS.md](./TEST-CONDUCTOR-RESULTS.md)** (simple template)  
→ Or **[E2E-RESULTS-TEMPLATE.md](./E2E-RESULTS-TEMPLATE.md)** (detailed template)

### 🔧 I need monitoring tools
→ Read **[scripts/ops/README.md](./scripts/ops/README.md)** (ops pack)  
→ Read **[docs/OPS-RUNBOOK.md](./docs/OPS-RUNBOOK.md)** (operations guide)

### 🚨 Something broke
→ Check **[docs/RUNBOOKS.md](./docs/RUNBOOKS.md)** (incident response)

---

## 🛠️ What You'll Test

The Test Conductor validates:

1. **Sanity Checks** (automated)
   - Node.js, Foundry, RPC, Chain ID

2. **Fee Routing** (semi-automated)
   - You: Execute swap in UI
   - Script: Verifies 0.3% fee accrual

3. **Staking APR** (manual confirm)
   - You: Check if 12% APR displays
   - Script: Logs result

4. **World Sync** (manual confirm)
   - You: Click parcel, check HUD updates
   - Script: Logs result

5. **FPS Performance** (manual input)
   - You: Report current FPS
   - Script: Logs result

**Duration:** 15-20 minutes

---

## ✅ Success Criteria

All must pass:
- ✅ Chain ID === 84532 (Base Sepolia)
- ✅ RPC reachable
- ✅ Swap executes + 0.3% fee routes correctly
- ✅ Staking APR = 12% + boost
- ✅ World → HUD sync ≤3s
- ✅ FPS ≥55

---

## 🎯 After Testing

**If all pass:**
1. Mark todo complete
2. Proceed to hardening tasks ([BUILDER-AI-PROMPT.md](./BUILDER-AI-PROMPT.md))

**If any fail:**
1. Document in results template
2. Create GitHub issue
3. Fix issues
4. Re-run Test Conductor

---

## 📞 Need Help?

- **Discord:** #testing channel
- **GitHub Issues:** [Bug reports]
- **Docs:** See links above

---

## 🔐 Security Note

**⚠️ TESTNET ONLY**
- Never use mainnet private keys
- Generate new test wallet if needed: `cast wallet new`
- Get test ETH: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

---

**Ready?** → Run `.\scripts\Test-Conductor.ps1 -WalletPrivKey 0x...`

**Version:** 1.0.0 | **Date:** 2025-11-11
