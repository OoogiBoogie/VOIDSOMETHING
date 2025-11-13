# PSX VOID - Developer E2E Testing Access Guide

**Audience:** New developers, QA testers, external auditors  
**Prerequisites:** Windows 10+, PowerShell 5.1+, Git, Node.js 18+

---

## 🎯 What is E2E Testing?

**End-to-End (E2E) testing** validates the entire PSX VOID application flow from user interactions to blockchain state changes. Our E2E system uses:

- **Test-Conductor.ps1** - Automated PowerShell script that guides you through testing
- **Ops Scripts** - Read-only monitoring tools (`scripts/ops/`)
- **QA Logging** - Automated JSONL reporting (`qa-reports/`)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone Repository

```powershell
# Clone the repo
git clone https://github.com/rigofelix2017-rgb/000.git
cd 000

# Install dependencies
npm install
```

### Step 2: Install Foundry (Required for E2E)

```powershell
# Run the provided installer
.\install-foundry-windows.ps1

# Verify installation
cast --version
# Expected: forge 0.2.0 (or newer)
```

### Step 3: Set Up Environment

```powershell
# Copy template
cp .env.local.example .env.local

# Edit .env.local with your values
notepad .env.local
```

**Required variables:**
```bash
# Get from https://dashboard.privy.io
PRIVY_APP_ID=clxxxxxxxxxxxxxxxxxxxxx

# Get from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID_HERE

# Network config
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org

# Optional: Fallback RPC for redundancy
NEXT_PUBLIC_BASE_RPC_URL_FALLBACK=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# Optional: Enable dev features
NEXT_PUBLIC_ENABLE_FPS=1
NEXT_PUBLIC_ENABLE_QA_LOGS=1
```

### Step 4: Get Test Funds

**Base Sepolia ETH:**
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Or use Alchemy faucet: https://sepoliafaucet.com

**Test VOID/USDC tokens:**
- Request from team lead, or
- Mint from contract (if you have minter role)

### Step 5: Run Your First E2E Test

```powershell
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run Test Conductor (replace with your private key)
.\scripts\Test-Conductor.ps1 -WalletPrivKey 0xYOUR_TESTNET_PRIVATE_KEY
```

**That's it!** The script will guide you through the rest.

---

## 📚 Documentation Map

### For First-Time Testers
1. **E2E-QUICK-START.md** ← Start here (you are here now)
2. **E2E-RESULTS-TEMPLATE.md** - Fill this out during testing
3. **scripts/Test-Conductor.ps1** - The main automation script

### For Operations/Monitoring
4. **scripts/ops/README.md** - Ops pack overview
5. **docs/OPS-RUNBOOK.md** - Complete operations guide
6. **docs/RUNBOOKS.md** - Incident response playbooks

### For Developers
7. **BUILDER-AI-PROMPT.md** - Next development tasks
8. **TESTING-GUIDE.md** - Comprehensive testing procedures
9. **DEPLOYMENT-CHECKLIST.md** - Deployment readiness

### For Governance/Admin
10. **docs/MULTISIG-MAP.md** - Protocol governance structure
11. **.ops-private-template/README-PRIVATE-OPS.md** - Admin operations setup

---

## 🛠️ Available Tools

### Test-Conductor.ps1 (Main E2E Script)

**Purpose:** Automated testing guide with manual verification steps

**Features:**
- ✅ Automated sanity checks (Node, Foundry, RPC, Chain ID)
- ✅ Environment validation (Privy, WalletConnect)
- ✅ Dev server launch + browser automation
- ✅ Fee routing proof (pre/post balance comparison)
- ✅ Staking APR verification (manual confirm)
- ✅ World sync check (manual confirm)
- ✅ FPS performance input
- ✅ JSONL logging (qa-reports/)

**Usage:**
```powershell
.\scripts\Test-Conductor.ps1 -WalletPrivKey 0x...

# With custom parameters
.\scripts\Test-Conductor.ps1 `
  -WalletPrivKey 0x... `
  -RpcUrl https://sepolia.base.org `
  -RpcUrlFallback https://base-sepolia.g.alchemy.com/v2/YOUR_KEY `
  -SwapAmount 50.0
```

**Duration:** 15-20 minutes (guided testing)

---

### Ops Scripts (Monitoring Tools)

All in `scripts/ops/` - Safe to run anytime (read-only)

#### status.ps1 - System Health Check
```powershell
.\scripts\ops\status.ps1

# Checks:
# - Chain ID (must be 84532)
# - RPC latency
# - Contract deployments
# - Router VOID balance
# - UI availability
# - Subgraph health (if URL provided)
```

#### watch-events.ps1 - Live Event Monitor
```powershell
# Scan last 2000 blocks
.\scripts\ops\watch-events.ps1

# Continuous monitoring
.\scripts\ops\watch-events.ps1 -Follow

# Monitor VOID/USDC/Land Transfer events in real-time
```

#### fee-audit.ps1 - Fee Routing Validation
```powershell
.\scripts\ops\fee-audit.ps1

# Validates 0.3% fees route to Router
# Analyzes last 10k blocks (≈5.5 hours)
```

#### gas-watch.ps1 - Gas Price Monitor
```powershell
.\scripts\ops\gas-watch.ps1 -Follow

# Alerts when gas > 0.5 Gwei (testnet)
# Useful before bulk operations
```

#### land-snapshot.ps1 - Parcel Ownership Export
```powershell
.\scripts\ops\land-snapshot.ps1

# Exports all parcel ownership to CSV/JSON
# Useful for analytics
```

#### graph-query.ps1 - Subgraph Helper
```powershell
.\scripts\ops\graph-query.ps1 `
  -SubgraphUrl https://api.thegraph.com/... `
  -QueryType meta

# Pre-built queries: meta, parcels, swaps, transfers, custom
```

---

## 📊 Understanding QA Logs

Every test session creates: `qa-reports/qa-YYYYMMDD-HHMMSS.jsonl`

**Format:** JSON Lines (one object per line)

**Sample log:**
```json
{"type":"sanity-check","component":"node","ok":true,"version":"v20.10.0","timestamp":"2025-11-11T10:30:00Z"}
{"type":"rpc-check","url":"https://sepolia.base.org","ok":true,"chainId":"0x14ad","latency":145,"timestamp":"2025-11-11T10:30:02Z"}
{"type":"fee-proof","delta_void":0.3,"variance_pct":0.0,"router_pre":123.456789,"router_post":123.756789,"timestamp":"2025-11-11T10:35:00Z"}
{"type":"fps-check","fps":60,"acceptable":true,"timestamp":"2025-11-11T10:40:00Z"}
```

**Parse logs:**
```powershell
# Read latest log
$log = Get-Content qa-reports/qa-*.jsonl -Tail 10 | ConvertFrom-Json

# Check if all tests passed
$failures = $log | Where-Object { $_.ok -eq $false }
if ($failures.Count -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "✖ $($failures.Count) tests failed" -ForegroundColor Red
    $failures | Format-Table
}
```

---

## 🔒 Security Best Practices

### DO ✅
- Use **testnet-only** private keys
- Store `.env.local` in `.gitignore` (already configured)
- Generate new test wallets for each session (if paranoid)
- Request test VOID/USDC from team leads
- Review transaction details before signing in MetaMask

### DON'T ❌
- Never commit private keys to git
- Never use mainnet keys for testing
- Never share your `.env.local` file
- Never run Test-Conductor.ps1 with mainnet RPC
- Never send real ETH to test contracts

### Wallet Setup

**Option 1: MetaMask Test Wallet**
```
1. Create new MetaMask account ("Test Account")
2. Switch to Base Sepolia network
3. Get private key: Settings → Security & Privacy → Show Private Key
4. Use this key ONLY for testnet
```

**Option 2: Generate Fresh Wallet**
```powershell
# Generate new test wallet
cast wallet new

# Output:
# Successfully created new keypair.
# Address:     0x1234...
# Private key: 0xabcd...

# Save private key for this session
# Fund with testnet ETH + tokens
```

---

## 🧪 Testing Workflows

### Pre-Deployment Testing

**Goal:** Validate all features before mainnet deployment

```powershell
# 1. System health check
.\scripts\ops\status.ps1

# 2. Run full E2E test
.\scripts\Test-Conductor.ps1 -WalletPrivKey 0x...

# 3. Review results
cat qa-reports/qa-*.jsonl | Select-Object -Last 1

# 4. Fill out results template
# Edit E2E-RESULTS-TEMPLATE.md

# 5. Create GitHub issue if failures found
```

---

### Weekly Regression Testing

**Goal:** Ensure no new bugs introduced

```powershell
# 1. Pull latest code
git pull origin main
npm install

# 2. Run E2E suite
.\scripts\Test-Conductor.ps1 -WalletPrivKey 0x...

# 3. Compare with previous week's results
# Check qa-reports/ for trends

# 4. Document any degradation (FPS, latency, etc.)
```

---

### Bug Investigation

**Goal:** Reproduce and diagnose user-reported issues

```powershell
# 1. Start event watcher (separate window)
.\scripts\ops\watch-events.ps1 -Follow

# 2. Attempt to reproduce bug in UI
npm run dev
# Manually execute the problematic flow

# 3. Check console logs + events
# Watch for errors, unexpected events

# 4. Create detailed bug report
# Use E2E-RESULTS-TEMPLATE.md - Issue section
```

---

## 🐛 Common Issues & Solutions

### Issue: "cast: command not found"

**Cause:** Foundry not installed or not in PATH

**Solution:**
```powershell
# Run installer
.\install-foundry-windows.ps1

# Or manually
# Download from https://getfoundry.sh
foundryup

# Verify
cast --version
```

---

### Issue: "RPC unreachable"

**Cause:** RPC endpoint down or network issue

**Solution:**
```powershell
# Test RPC manually
curl -X POST https://sepolia.base.org `
  -H "Content-Type: application/json" `
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Expected: {"jsonrpc":"2.0","id":1,"result":"0x14ad"}

# If fails, use fallback RPC
.\scripts\Test-Conductor.ps1 `
  -WalletPrivKey 0x... `
  -RpcUrlFallback https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```

---

### Issue: "Chain ID mismatch"

**Cause:** Wrong network configured

**Solution:**
```powershell
# Check .env.local
cat .env.local | Select-String "CHAIN_ID"

# Must be: NEXT_PUBLIC_CHAIN_ID=84532

# If wrong, fix and restart
npm run dev
```

---

### Issue: "Swap fails with 'insufficient balance'"

**Cause:** Not enough VOID or gas

**Solution:**
```powershell
# Check balances
cast call 0x8de4043445939B0D0Cc7d6c752057707279D9893 `
  "balanceOf(address)(uint256)" YOUR_ADDRESS `
  --rpc-url https://sepolia.base.org

# Get more test VOID from team or faucet
# Get Base Sepolia ETH from faucet
```

---

### Issue: "UI not loading"

**Cause:** Dev server not running or port conflict

**Solution:**
```powershell
# Check if dev server is running
curl http://localhost:3000

# If fails, start dev server
npm run dev

# If port conflict, kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev
```

---

## 📞 Getting Help

### Documentation
- **E2E-QUICK-START.md** - This guide
- **docs/OPS-RUNBOOK.md** - Operations procedures
- **docs/RUNBOOKS.md** - Incident response
- **README.md** - Project overview

### Contact
- **Discord:** [Team Channel] - General questions
- **GitHub Issues:** [Bug reports, feature requests]
- **Email:** [team-lead@psx-void.io] - Urgent/private issues

### Escalation
1. Check documentation first (OPS-RUNBOOK.md, RUNBOOKS.md)
2. Search GitHub issues for similar problems
3. Ask in Discord #testing channel
4. Create GitHub issue with full details
5. For critical bugs → alert lead developer immediately

---

## ✅ Success Checklist

After your first E2E test, you should have:

- [ ] Installed all prerequisites (Node, Foundry, dependencies)
- [ ] Configured `.env.local` with valid credentials
- [ ] Funded test wallet with Base Sepolia ETH + VOID + USDC
- [ ] Run `.\scripts\Test-Conductor.ps1` successfully
- [ ] All automated checks passed (green ✓)
- [ ] Executed manual swap and verified fee routing
- [ ] Confirmed staking APR displays correctly
- [ ] Verified world sync works
- [ ] Measured FPS ≥55
- [ ] Reviewed JSONL log in `qa-reports/`
- [ ] Filled out `E2E-RESULTS-TEMPLATE.md`
- [ ] No critical issues found (or documented if found)

**If all checked:** 🎉 You're ready to contribute to QA testing!

---

## 🚀 Next Steps

### For Testers
1. Run weekly E2E tests on `develop` branch
2. Document results in `E2E-RESULTS-TEMPLATE.md`
3. Create GitHub issues for bugs
4. Assist with regression testing before releases

### For Developers
1. Read `BUILDER-AI-PROMPT.md` for hardening tasks
2. Implement fixes for any issues found
3. Re-run E2E tests to verify fixes
4. Update `CHANGELOG.md` with changes

### For Auditors
1. Review contract code in `contracts/`
2. Run E2E tests to understand user flows
3. Use ops scripts to monitor on-chain activity
4. Document findings in security report

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-11  
**Maintainer:** PSX VOID QA Team  

**Feedback:** Open a PR or issue to improve this guide!
