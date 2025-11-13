# E2E Testing Session - Quick Start Guide

**Version:** 1.0.0  
**Duration:** 60-90 minutes  
**Chain:** Base Sepolia (84532)

---

## 🚀 Before You Start

### Prerequisites Checklist

```powershell
# 1. Verify Node.js (v18+)
node --version

# 2. Verify Foundry (cast CLI)
cast --version

# 3. Verify environment setup
cat .env.local
# Must have:
# - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (get from cloud.walletconnect.com)
# - NEXT_PUBLIC_BASE_RPC_URL
# - PRIVY_APP_ID

# 4. Verify you have Base Sepolia ETH + test tokens
# Get ETH: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
# Get VOID/USDC: [Request from team]
```

### Get Your Private Key

**⚠️ TESTNET ONLY - Never use mainnet keys!**

```powershell
# From MetaMask:
# Settings → Security & Privacy → Show Private Key
# Copy the 0x... string

# Or generate a new test wallet:
cast wallet new
# Save the private key for this session
```

---

## 🎯 Quick Start - 3 Commands

### 1. Start Dev Server

```powershell
# Terminal 1
npm run dev

# Wait for:
# ✓ Ready in 3.5s
# ○ Local:   http://localhost:3000
```

### 2. Run Test Conductor

```powershell
# Terminal 2
.\scripts\Test-Conductor.ps1 -WalletPrivKey 0xYOUR_PRIVATE_KEY_HERE

# The script will:
# ✓ Validate environment (Node, Foundry, RPC, Chain ID)
# ✓ Launch dev server (if not running)
# ✓ Open browser tabs automatically
# ✓ Guide you through manual testing steps
# ✓ Verify fee routing automatically
# ✓ Log all results to qa-reports/
```

### 3. Review Results

```powershell
# Check the latest QA report
cat qa-reports/qa-*.jsonl | Select-Object -Last 1 | ConvertFrom-Json | ConvertTo-Json

# View in browser
Start-Process "ops-dashboard.html"
```

---

## 📝 Test Conductor Flow

### Phase 1: Automated Sanity Checks (2-3 min)

The script automatically validates:
- ✅ Node.js version ≥18
- ✅ Foundry (`cast`) available
- ✅ Environment variables (Privy, WalletConnect, RPC)
- ✅ RPC reachability (primary + fallback)
- ✅ Chain ID === 0x14ad (84532)
- ✅ UI responding at localhost:3000
- ✅ Coordinate validator runs successfully

**You do:** Watch for green ✓ checkmarks. If red ✖ appears, fix the issue.

---

### Phase 2: Fee Routing Proof (5-10 min)

**Script does:**
1. Opens browser tabs: Swap, Wallet, Land
2. Takes Router VOID balance snapshot (pre-swap)
3. **Prompts you:** "Execute swap in UI (100 VOID → USDC), then press Enter"

**You do:**
1. Go to Swap tab in browser
2. Enter: 100 VOID → USDC
3. Click "Swap" button
4. Approve MetaMask transaction
5. Wait for confirmation (green toast)
6. **Press Enter in PowerShell**

**Script continues:**
7. Takes Router VOID balance snapshot (post-swap)
8. Calculates delta: `post - pre`
9. Converts to human-readable (wei → VOID with 6 decimals)
10. Verifies delta ≈ 0.3 VOID (0.3% of 100)
11. Logs result to JSONL

**Expected output:**
```
[✓] Router delta (VOID): 0.300000
[✓] Variance: 0.0% (expected 0.3%)
```

---

### Phase 3: Staking APR Verification (3-5 min)

**Script prompts:** "Check WalletTab: Staking APR shows 12% + XPOracle boost? (y/n)"

**You do:**
1. Go to Wallet tab in browser
2. Check "Stake VOID" section
3. Verify: "Base APR: 12%" displayed
4. Verify: "XP Boost: +X%" displayed (if applicable)
5. Type `y` in PowerShell if correct, `n` if not

**Script logs:** Staking verification result

---

### Phase 4: World ↔ HUD Sync Check (2-3 min)

**Script prompts:** "Open World Map, click parcel → HUD updates within 3s? (y/n)"

**You do:**
1. Go to Land tab in browser
2. Click "View World Map" button
3. Click any parcel in the 3D world
4. Watch HUD "Current Parcel" panel
5. Verify: Panel updates within 3 seconds
6. Type `y` in PowerShell if synced, `n` if delayed/broken

**Script logs:** World sync result

---

### Phase 5: FPS Performance Check (1-2 min)

**Script prompts:** "Enter current FPS (check badge or press F12):"

**You do:**
1. Look at FPS badge in bottom-right corner (if enabled)
2. Or press F12 → Console → check FPS logs
3. Type the FPS number (e.g., `60`)

**Script logs:** FPS performance result

**Acceptance criteria:** ≥60 FPS at 1080p (≥55 acceptable, <30 fail)

---

### Phase 6: Final Report (1 min)

**Script generates:**
- Console summary (all checks passed/failed)
- JSONL log file: `qa-reports/qa-YYYYMMDD-HHMMSS.jsonl`
- Opens ops-dashboard.html (if available)

**You do:**
- Review summary
- If any ✖ failures → investigate and re-run
- If all ✓ pass → E2E testing complete!

---

## 🛠️ Advanced Usage

### Custom Parameters

```powershell
# Use fallback RPC
.\scripts\Test-Conductor.ps1 `
  -WalletPrivKey 0x... `
  -RpcUrlFallback https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# Custom swap amount (default 100 VOID)
.\scripts\Test-Conductor.ps1 `
  -WalletPrivKey 0x... `
  -SwapAmount 50.0

# Skip coordinate validation (faster)
# (Not recommended - edit script to comment out coordinate check)
```

### Run Individual Ops Scripts

```powershell
# System health check only
.\scripts\ops\status.ps1

# Watch live events (separate window)
.\scripts\ops\watch-events.ps1 -Follow

# Check gas prices
.\scripts\ops\gas-watch.ps1

# Audit fees (last 10k blocks)
.\scripts\ops\fee-audit.ps1
```

---

## 🐛 Troubleshooting

### "cast: command not found"

```powershell
# Install Foundry
.\install-foundry-windows.ps1

# Or manually
foundryup
```

### "RPC unreachable"

```powershell
# Test RPC directly
curl -X POST https://sepolia.base.org `
  -H "Content-Type: application/json" `
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Expected: {"jsonrpc":"2.0","id":1,"result":"0x14ad"}

# If fails, use fallback RPC:
.\scripts\Test-Conductor.ps1 `
  -WalletPrivKey 0x... `
  -RpcUrlFallback https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```

### "Chain ID mismatch"

```powershell
# Check .env.local
cat .env.local | Select-String "CHAIN_ID"

# Must be:
# NEXT_PUBLIC_CHAIN_ID=84532

# If wrong, fix and restart dev server
```

### "Swap transaction fails"

**Common causes:**
1. Insufficient balance → Check Wallet tab
2. Insufficient approval → Script should auto-approve, but verify
3. Slippage too low → Increase in UI (Settings)
4. Gas too low → MetaMask should auto-estimate

**Debug:**
```powershell
# Check balances
cast call 0x8de4043445939B0D0Cc7d6c752057707279D9893 `
  "balanceOf(address)(uint256)" YOUR_ADDRESS --rpc-url https://sepolia.base.org

# Check allowance
cast call 0x8de4043445939B0D0Cc7d6c752057707279D9893 `
  "allowance(address,address)(uint256)" YOUR_ADDRESS 0x687E678aB2152d9e0952d42B0F872604533D25a9 `
  --rpc-url https://sepolia.base.org
```

### "UI not responding"

```powershell
# Check dev server
curl http://localhost:3000

# Restart dev server
# Ctrl+C in Terminal 1, then:
npm run dev

# Wait for "✓ Ready" message
```

---

## 📊 What Gets Logged

Each test session creates: `qa-reports/qa-YYYYMMDD-HHMMSS.jsonl`

**Format:** One JSON object per line (JSONL)

**Sample entries:**
```json
{"type":"sanity-check","component":"node","ok":true,"version":"v20.10.0","timestamp":"2025-11-11T10:30:00Z"}
{"type":"sanity-check","component":"cast","ok":true,"version":"0.2.0","timestamp":"2025-11-11T10:30:01Z"}
{"type":"rpc-check","url":"https://sepolia.base.org","ok":true,"chainId":"0x14ad","latency":145,"timestamp":"2025-11-11T10:30:02Z"}
{"type":"fee-proof","delta_void":0.3,"variance_pct":0.0,"router_pre":123.456789,"router_post":123.756789,"timestamp":"2025-11-11T10:35:00Z"}
{"type":"staking-check","ok":true,"apr_displayed":12,"boost_visible":true,"timestamp":"2025-11-11T10:37:00Z"}
{"type":"world-sync","ok":true,"sync_time_ms":1500,"timestamp":"2025-11-11T10:39:00Z"}
{"type":"fps-check","fps":60,"acceptable":true,"timestamp":"2025-11-11T10:40:00Z"}
```

**Use for:**
- CI/CD validation (parse JSONL, fail if any `ok: false`)
- Analytics (track FPS trends, fee accuracy)
- Debugging (exact timestamps, parameters)

---

## ✅ Success Criteria

**All must pass:**
- ✅ Chain ID === 84532 (Base Sepolia)
- ✅ RPC reachable (primary or fallback)
- ✅ UI loads within 5 seconds
- ✅ Swap executes successfully
- ✅ Fee routing: 0.3% ± 0.01% accrues to Router
- ✅ Staking APR displays correctly (12% + boost)
- ✅ World → HUD sync ≤3 seconds
- ✅ FPS ≥55 at 1080p

**If any fail:**
1. Check error message in console
2. Consult `docs/RUNBOOKS.md` for incident playbook
3. Re-run after fix
4. Document issue in QA report

---

## 📞 Support

**Documentation:**
- **Test-Conductor.ps1** - Full automation script
- **docs/OPS-RUNBOOK.md** - Operations guide
- **docs/RUNBOOKS.md** - Incident response
- **TESTING-GUIDE.md** - Detailed testing procedures

**Emergency Contacts:**
- Lead Developer: [Discord/Email] (24/7)
- QA Team: [Discord] (Business hours)

**Common Issues:**
- See `docs/OPS-RUNBOOK.md` - Troubleshooting section
- See `docs/RUNBOOKS.md` - RPC Outage, Chain Mismatch playbooks

---

## 🎯 Next Steps

**After successful E2E:**
1. ✅ Mark "Execute E2E Testing Session" complete in todo list
2. ✅ Document any issues found
3. ✅ Run Builder AI hardening tasks (see `BUILDER-AI-PROMPT.md`)
4. ✅ Prepare for mainnet deployment (see `DEPLOYMENT-CHECKLIST.md`)

**Failed E2E:**
1. ❌ Review JSONL logs
2. ❌ Fix identified issues
3. ❌ Re-run Test-Conductor.ps1
4. ❌ Do not proceed to mainnet until all pass

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-11  
**Maintainer:** PSX VOID QA Team
