# PSX VOID - Operations Runbook

**Status:** Phase 3 Complete - Production Ready  
**Last Updated:** 2025-11-11  
**Chain:** Base Sepolia (84532)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Operations Scripts](#operations-scripts)
3. [Common Workflows](#common-workflows)
4. [Monitoring](#monitoring)
5. [Troubleshooting](#troubleshooting)
6. [Emergency Procedures](#emergency-procedures)
7. [Contact Information](#contact-information)

---

## Overview

This runbook covers **read-only operational scripts** for monitoring and validating the PSX VOID protocol. All scripts in `scripts/ops/` are safe to run in production environments and do not modify blockchain state.

**Key Principles:**
- All ops scripts are **read-only** (no state changes)
- Admin operations (pause/unpause, parameter changes) are in a **separate private repository**
- Scripts require `cast` (Foundry) to be installed and available in PATH
- All scripts respect `NEXT_PUBLIC_BASE_RPC_URL` environment variable

---

## Operations Scripts

### 📊 `status.ps1` - System Health Check

**Purpose:** One-shot health summary of the entire protocol

**What it checks:**
- ✅ Chain ID validation (must be 0x14ad / 84532)
- ✅ RPC latency measurement
- ✅ Contract deployment verification (code existence)
- ✅ Router VOID balance snapshot
- ✅ Subgraph health (if URL provided)
- ✅ UI availability (localhost:3000)
- ✅ Current block height

**Usage:**
```powershell
# Basic health check
.\scripts\ops\status.ps1

# With custom RPC
.\scripts\ops\status.ps1 -Rpc https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# With subgraph monitoring
.\scripts\ops\status.ps1 -SubgraphUrl https://api.thegraph.com/subgraphs/name/yourname/psx-void
```

**Output:**
- Console: Color-coded status messages (✓ = OK, ⚠ = Warning, ✖ = Error)
- JSON report: `qa-reports/status-YYYYMMDD-HHMMSS.json`

**When to run:**
- Before E2E testing sessions
- After deployments
- When investigating user reports
- As part of nightly CI jobs

---

### 🔍 `watch-events.ps1` - Live Event Monitor

**Purpose:** Tail on-chain events in real-time

**What it monitors:**
- 📤 VOID Transfer events
- 📤 USDC Transfer events
- 🏠 Land parcel Transfer events (NFT)

**Usage:**
```powershell
# Scan last 2000 blocks (default)
.\scripts\ops\watch-events.ps1

# Scan more blocks
.\scripts\ops\watch-events.ps1 -Lookback 10000

# Continuous monitoring (follow mode)
.\scripts\ops\watch-events.ps1 -Follow

# Custom RPC + follow
.\scripts\ops\watch-events.ps1 -Rpc https://... -Follow
```

**Output:**
- Console: Real-time event stream with color coding
- Updates every 15 seconds in follow mode

**When to run:**
- During E2E testing to verify events
- When investigating specific transactions
- For live monitoring during high-activity periods

**Tip:** Run in a separate PowerShell window during testing sessions

---

### 💰 `fee-audit.ps1` - Fee Routing Validation

**Purpose:** Verify 0.3% protocol fees are routing correctly to Router

**What it checks:**
- Current Router VOID balance
- Transfer events to Router address
- Block range analysis

**Usage:**
```powershell
# Audit last 10000 blocks (≈5.5 hours on Base Sepolia)
.\scripts\ops\fee-audit.ps1

# Longer lookback
.\scripts\ops\fee-audit.ps1 -Lookback 50000
```

**Limitations:**
- Does not decode Swap event data (simplified audit)
- For precise fee validation, use `Test-Conductor.ps1` with pre/post balance snapshots

**When to run:**
- Weekly fee reconciliation
- When investigating fee routing issues
- As part of financial reporting

---

### 🗺️ `land-snapshot.ps1` - Parcel Ownership Export

**Purpose:** Export land parcel ownership for analytics or QA

**What it exports:**
- Parcel coordinates (x, y)
- District assignment
- Current owner address
- Ownership status (owned/unowned)

**Usage:**
```powershell
# Export to both CSV and JSON (default)
.\scripts\ops\land-snapshot.ps1

# JSON only
.\scripts\ops\land-snapshot.ps1 -OutputFormat json

# CSV only
.\scripts\ops\land-snapshot.ps1 -OutputFormat csv
```

**Output:**
- CSV: `qa-reports/land-snapshot-YYYYMMDD-HHMMSS.csv`
- JSON: `qa-reports/land-snapshot-YYYYMMDD-HHMMSS.json`

**Current Status:**
- ⚠️ **Demo implementation** - currently checks sample parcels only
- Expand `$sampleParcels` array with full coordinate list from `coordinates.ts`

**When to run:**
- Before/after land sales events
- For analytics dashboard data refresh
- When investigating ownership disputes

---

### ⛽ `gas-watch.ps1` - Gas Price Monitor

**Purpose:** Monitor Base Sepolia gas prices and alert on high costs

**What it monitors:**
- Current base fee (in Gwei)
- Alerts when above threshold

**Usage:**
```powershell
# Single check (default threshold: 0.5 Gwei)
.\scripts\ops\gas-watch.ps1

# Continuous monitoring
.\scripts\ops\gas-watch.ps1 -Follow

# Custom threshold and poll interval
.\scripts\ops\gas-watch.ps1 -ThresholdGwei 1.0 -Follow -PollInterval 60
```

**Output:**
- ✓ Green: Normal gas prices
- ⚠ Yellow: Warning messages
- !!! Red: High gas alert

**When to run:**
- Before bulk operations (airdrops, migrations)
- During network congestion events
- As part of CI nightly jobs

---

### 📊 `graph-query.ps1` - Subgraph Query Helper

**Purpose:** Convenience wrapper for common GraphQL queries

**Pre-built query types:**
- `meta` - Subgraph sync status and block info
- `parcels` - First 10 land parcels
- `swaps` - Recent 10 swap transactions
- `transfers` - Recent 10 token transfers
- `custom` - Execute custom GraphQL query

**Usage:**
```powershell
# Check subgraph health
.\scripts\ops\graph-query.ps1 -SubgraphUrl https://api.thegraph.com/... -QueryType meta

# Get parcel data
.\scripts\ops\graph-query.ps1 -SubgraphUrl https://... -QueryType parcels

# Custom query
.\scripts\ops\graph-query.ps1 -SubgraphUrl https://... -QueryType custom -CustomQuery "{ parcels(first: 10) { id owner } }"
```

**When to run:**
- Validating subgraph deployment
- Debugging indexing issues
- Fetching data for analytics

---

## Common Workflows

### Pre-E2E Testing Session

```powershell
# 1. Health check
.\scripts\ops\status.ps1

# 2. Start event watcher (separate window)
.\scripts\ops\watch-events.ps1 -Follow

# 3. Check current gas
.\scripts\ops\gas-watch.ps1

# 4. Run Test Conductor (main testing script)
.\scripts\Test-Conductor.ps1 -WalletPrivKey 0x...
```

### Weekly Operations Review

```powershell
# 1. System status
.\scripts\ops\status.ps1

# 2. Fee audit (last week ≈ 100k blocks)
.\scripts\ops\fee-audit.ps1 -Lookback 100000

# 3. Land ownership snapshot
.\scripts\ops\land-snapshot.ps1

# 4. Subgraph health
.\scripts\ops\graph-query.ps1 -SubgraphUrl https://... -QueryType meta
```

### Incident Investigation

```powershell
# 1. System status (identify failing components)
.\scripts\ops\status.ps1

# 2. Watch recent events (identify suspicious activity)
.\scripts\ops\watch-events.ps1 -Lookback 20000

# 3. Check gas (network congestion?)
.\scripts\ops\gas-watch.ps1

# 4. Fee routing (exploit attempt?)
.\scripts\ops\fee-audit.ps1 -Lookback 50000
```

---

## Monitoring

### Recommended CI/CD Integration

**Nightly Jobs (GitHub Actions):**
```yaml
# .github/workflows/nightly-ops.yml
name: Nightly Operations

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily

jobs:
  health-check:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: foundry-rs/foundry-toolchain@v1
      
      - name: System status
        run: .\scripts\ops\status.ps1
      
      - name: Fee audit
        run: .\scripts\ops\fee-audit.ps1 -Lookback 20000
      
      - name: Land snapshot
        run: .\scripts\ops\land-snapshot.ps1
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: nightly-reports
          path: qa-reports/**
```

**Alerting Thresholds:**
- ❌ RPC unreachable → immediate alert
- ❌ Wrong chain ID → immediate alert
- ⚠️ Gas > 1 Gwei → warning (testnet usually <0.1)
- ⚠️ Subgraph >1000 blocks behind → warning

---

## Troubleshooting

### Script Fails with "cast: command not found"

**Solution:**
```powershell
# Install Foundry
.\install-foundry-windows.ps1

# Or manually
foundryup
```

### RPC Timeouts

**Symptoms:**
- Scripts hang or fail with timeout errors
- Slow response times (>5s latency)

**Solutions:**
1. Check RPC status: `.\scripts\ops\status.ps1`
2. Try fallback RPC: `.\scripts\ops\status.ps1 -Rpc https://base-sepolia.g.alchemy.com/...`
3. Increase timeout in script (edit `-TimeoutSec` parameter)

### No Events Found

**Symptoms:**
- `watch-events.ps1` shows no transfers
- `fee-audit.ps1` finds 0 events

**Possible causes:**
1. Low activity in the lookback period → increase `-Lookback`
2. Wrong contract addresses → verify in `.env.local`
3. RPC node doesn't support `eth_getLogs` → use different RPC

### Land Snapshot Shows All Unowned

**Symptoms:**
- All parcels report "unowned"

**Likely cause:**
- TokenId encoding mismatch
- Need to update `$sampleParcels` with real coordinates

**Solution:**
- Expand script to query Transfer events from WorldLandTestnet
- Or maintain an off-chain index of minted parcels

---

## Emergency Procedures

### RPC Outage

**Detection:** `status.ps1` shows RPC unreachable

**Immediate Actions:**
1. Test fallback RPC: `.\scripts\ops\status.ps1 -Rpc <fallback-url>`
2. Update `.env.local` with working RPC
3. Restart dev server
4. Communicate to users (expected downtime)

**See also:** `RUNBOOKS.md` - RPC Outage playbook

### High Gas Costs

**Detection:** `gas-watch.ps1` shows HIGH alert

**Actions:**
1. Alert users in UI (display gas warning)
2. Delay non-urgent transactions
3. Monitor until gas normalizes

**See also:** `RUNBOOKS.md` - High Gas Costs playbook

### Fee Routing Anomaly

**Detection:** `fee-audit.ps1` shows unexpected Router balance

**Immediate Actions:**
1. Run `Test-Conductor.ps1` to verify fee routing with fresh swap
2. Check recent events: `.\scripts\ops\watch-events.ps1 -Lookback 10000`
3. If confirmed exploit → escalate to security team
4. See `RUNBOOKS.md` - Critical Vulnerability playbook

---

## Contact Information

**Emergency Contacts:**

| Role | Contact | Availability | Purpose |
|------|---------|--------------|---------|
| **Lead Developer** | [Discord/Email] | 24/7 | Critical bugs, exploits |
| **Security Team** | [Email] | 24/7 | Vulnerability reports |
| **DevOps** | [Discord] | Business hours | CI/CD, infrastructure |
| **RPC Provider Support** | [Support URL] | 24/7 | RPC outages |
| **Subgraph Support** | [Discord] | Business hours | Indexing issues |

**Escalation Path:**
1. Run `status.ps1` to identify issue
2. Check `RUNBOOKS.md` for playbook
3. If critical (funds at risk, exploit) → Security Team (immediate)
4. If operational (RPC down, UI bug) → Lead Developer
5. If infrastructure (CI failing, gas high) → DevOps

---

## Additional Resources

- **Main Documentation:** `README.md`
- **Incident Playbooks:** `RUNBOOKS.md`
- **Governance:** `MULTISIG-MAP.md`
- **E2E Testing:** `Test-Conductor.ps1`
- **Deployment Guide:** `DEPLOYMENT-CHECKLIST.md`

---

**Document Version:** 1.0.0  
**Maintainer:** PSX VOID Core Team  
**Feedback:** Open an issue or PR with improvements
