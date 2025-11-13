# PSX VOID Operations Pack - README

**Version:** 1.0.0  
**Status:** Production Ready  
**Chain:** Base Sepolia (84532)

---

## 📦 What's Included

This operations pack provides **read-only monitoring and validation scripts** for the PSX VOID protocol. All scripts are safe to run in production and do not modify blockchain state.

### Scripts (`scripts/ops/`)

| Script | Purpose | Safety |
|--------|---------|--------|
| **status.ps1** | System health check | ✅ Read-only |
| **watch-events.ps1** | Live event monitoring | ✅ Read-only |
| **fee-audit.ps1** | Fee routing validation | ✅ Read-only |
| **land-snapshot.ps1** | Parcel ownership export | ✅ Read-only |
| **gas-watch.ps1** | Gas price monitoring | ✅ Read-only |
| **graph-query.ps1** | Subgraph query helper | ✅ Read-only |

### Documentation (`docs/`)

- **OPS-RUNBOOK.md** - Complete operations guide
- **MULTISIG-MAP.md** - Governance structure
- **RUNBOOKS.md** - Incident response playbooks

---

## 🚀 Quick Start

### Prerequisites

```powershell
# 1. Install Foundry (includes 'cast' CLI)
.\install-foundry-windows.ps1

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your RPC URL and credentials

# 3. Verify installation
cast --version
```

### Run Your First Health Check

```powershell
# System status (one-shot)
.\scripts\ops\status.ps1

# Expected output:
# [✓] Chain ID: 0x14ad (84532 - Base Sepolia)
# [✓] RPC latency: 145 ms
# [✓] Router VOID balance: 123.456789 VOID
# [✓] UI responding at http://localhost:3000
```

---

## 📊 Common Workflows

### Pre-Testing Session

```powershell
# 1. Health check
.\scripts\ops\status.ps1

# 2. Start event monitor (separate window)
.\scripts\ops\watch-events.ps1 -Follow

# 3. Run E2E tests
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

# 4. Subgraph health (if deployed)
.\scripts\ops\graph-query.ps1 -SubgraphUrl https://... -QueryType meta
```

### Incident Investigation

```powershell
# 1. System status (identify failing components)
.\scripts\ops\status.ps1

# 2. Watch recent events (30 minutes ≈ 900 blocks)
.\scripts\ops\watch-events.ps1 -Lookback 5000

# 3. Check gas (network congestion?)
.\scripts\ops\gas-watch.ps1

# 4. Consult incident playbooks
# See docs/RUNBOOKS.md for detailed procedures
```

---

## 🔒 Security & Hygiene

### What's Safe to Share (Public Repo)

✅ All scripts in `scripts/ops/` (read-only)  
✅ All documentation in `docs/`  
✅ `.env.local.example` (template only)  
✅ Test-Conductor.ps1 (QA automation)  
✅ CI/CD workflows (`.github/workflows/`)

### What Stays Private (Never Commit)

❌ `.env.local` (real credentials)  
❌ Private keys  
❌ Admin/multisig keys  
❌ RPC API keys with billing  
❌ Write operations (pause/unpause scripts)

### Recommended Setup

**Main repo (public):**
```
psx-void/
  scripts/ops/      # Read-only monitoring
  scripts/qa/       # Test automation
  docs/             # Public documentation
```

**Private ops repo (restricted):**
```
psx-void-ops/
  admin/            # Write operations (pause, params)
  secrets/          # Key vault plumbing
  jobs/             # Scheduled CI jobs
  indexer/          # Subgraph deployment
```

Link them with git submodules if needed.

---

## 📚 Script Reference

### status.ps1 - System Health Check

**Purpose:** One-shot health summary of the entire protocol

**Usage:**
```powershell
.\scripts\ops\status.ps1
.\scripts\ops\status.ps1 -Rpc https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
.\scripts\ops\status.ps1 -SubgraphUrl https://api.thegraph.com/...
```

**Checks:**
- Chain ID validation (must be 0x14ad)
- RPC latency measurement
- Contract deployments verified
- Router VOID balance
- Subgraph health (if URL provided)
- UI availability
- Current block height

**Output:** JSON report saved to `qa-reports/status-YYYYMMDD-HHMMSS.json`

---

### watch-events.ps1 - Live Event Monitor

**Purpose:** Tail on-chain events in real-time

**Usage:**
```powershell
.\scripts\ops\watch-events.ps1                    # Last 2000 blocks
.\scripts\ops\watch-events.ps1 -Lookback 10000    # Longer history
.\scripts\ops\watch-events.ps1 -Follow            # Continuous monitoring
```

**Monitors:**
- VOID Transfer events
- USDC Transfer events
- Land parcel Transfer events (NFT)

**Tip:** Run in separate PowerShell window during testing

---

### fee-audit.ps1 - Fee Routing Validation

**Purpose:** Verify 0.3% protocol fees route correctly to Router

**Usage:**
```powershell
.\scripts\ops\fee-audit.ps1                    # Last 10k blocks
.\scripts\ops\fee-audit.ps1 -Lookback 50000    # Longer audit
```

**Note:** Simplified read-only audit. For precise fee validation, use Test-Conductor.ps1 with pre/post balance snapshots.

---

### land-snapshot.ps1 - Parcel Ownership Export

**Purpose:** Export land ownership for analytics or QA

**Usage:**
```powershell
.\scripts\ops\land-snapshot.ps1                       # CSV + JSON
.\scripts\ops\land-snapshot.ps1 -OutputFormat csv     # CSV only
.\scripts\ops\land-snapshot.ps1 -OutputFormat json    # JSON only
```

**Output:** `qa-reports/land-snapshot-YYYYMMDD-HHMMSS.{csv,json}`

**Status:** Currently checks sample parcels. Expand `$sampleParcels` for full coverage.

---

### gas-watch.ps1 - Gas Price Monitor

**Purpose:** Monitor Base Sepolia gas prices and alert on high costs

**Usage:**
```powershell
.\scripts\ops\gas-watch.ps1                                      # Single check
.\scripts\ops\gas-watch.ps1 -Follow                              # Continuous
.\scripts\ops\gas-watch.ps1 -ThresholdGwei 1.0 -PollInterval 60  # Custom
```

**Default threshold:** 0.5 Gwei (Base Sepolia usually <0.1)

---

### graph-query.ps1 - Subgraph Query Helper

**Purpose:** Convenience wrapper for common GraphQL queries

**Usage:**
```powershell
# Check subgraph health
.\scripts\ops\graph-query.ps1 -SubgraphUrl https://... -QueryType meta

# Get parcel data
.\scripts\ops\graph-query.ps1 -SubgraphUrl https://... -QueryType parcels

# Custom query
.\scripts\ops\graph-query.ps1 -SubgraphUrl https://... -QueryType custom `
  -CustomQuery "{ parcels(first: 10) { id owner } }"
```

**Pre-built queries:** meta, parcels, swaps, transfers, custom

---

## 🔧 CI/CD Integration

### GitHub Actions Example

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
      
      - name: Upload reports
        uses: actions/upload-artifact@v4
        with:
          name: nightly-reports
          path: qa-reports/**
```

---

## 🆘 Troubleshooting

### "cast: command not found"

**Solution:**
```powershell
# Install Foundry
.\install-foundry-windows.ps1

# Or manually
foundryup
```

### RPC Timeouts

**Solutions:**
1. Check RPC status: `.\scripts\ops\status.ps1`
2. Try fallback RPC: `.\scripts\ops\status.ps1 -Rpc https://...`
3. Increase timeout in script (edit `-TimeoutSec`)

### No Events Found

**Possible causes:**
1. Low activity → increase `-Lookback`
2. Wrong addresses → verify `.env.local`
3. RPC doesn't support `eth_getLogs` → use different RPC

---

## 📞 Support

**Documentation:**
- **OPS-RUNBOOK.md** - Complete operations guide
- **RUNBOOKS.md** - Incident response playbooks
- **MULTISIG-MAP.md** - Governance structure

**Emergency Contacts:**
- Lead Developer: [Discord/Email] (24/7)
- Security Team: [Email] (24/7)
- DevOps: [Discord] (Business hours)

**Escalation:** See `docs/OPS-RUNBOOK.md` - Contact Information

---

## 🛠️ Development

### Adding New Scripts

1. Create script in `scripts/ops/`
2. Follow PowerShell best practices:
   - `#requires -Version 5.1`
   - Read-only operations only
   - Respect env vars (`NEXT_PUBLIC_BASE_RPC_URL`)
   - Color-coded output (ok/warn/err functions)
3. Document in `OPS-RUNBOOK.md`
4. Add to this README

### Testing Scripts

```powershell
# 1. Test with mainnet RPC
.\scripts\ops\status.ps1 -Rpc https://sepolia.base.org

# 2. Test error handling (invalid RPC)
.\scripts\ops\status.ps1 -Rpc https://invalid.url

# 3. Verify JSON output
cat qa-reports/status-*.json
```

---

## 📄 License

Same as main PSX VOID repository.

---

## 🎯 Roadmap

**v1.1.0 (Next Release):**
- [ ] Enhanced land-snapshot with full coordinate coverage
- [ ] fee-audit with Swap event decoding
- [ ] TVL tracking script
- [ ] Automated alerting (Discord/Slack webhooks)

**v1.2.0 (Future):**
- [ ] Dashboard web UI (ops-dashboard.html enhancements)
- [ ] Historical trend analysis
- [ ] Automated anomaly detection

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-11  
**Maintainer:** PSX VOID Core Team
