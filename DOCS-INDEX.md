# 📚 E2E Testing & Operations - Documentation Index

**Quick Navigation for Developers, Testers, and Operators**

---

## 🚀 Getting Started (Pick Your Path)

### 👨‍💻 I'm New - Where Do I Start?
→ **[START-HERE-E2E.md](./START-HERE-E2E.md)** (5-minute quick start)

### 🧪 I Want to Test Now
→ **[E2E-QUICK-START.md](./E2E-QUICK-START.md)** (testing procedures)

### 📖 I Need Full Setup Guide
→ **[DEV-E2E-ACCESS-GUIDE.md](./DEV-E2E-ACCESS-GUIDE.md)** (comprehensive)

---

## 🧪 Testing

### E2E Testing
| Document | Purpose | Duration |
|----------|---------|----------|
| **[START-HERE-E2E.md](./START-HERE-E2E.md)** | Quick start (3 commands) | 5 min |
| **[E2E-QUICK-START.md](./E2E-QUICK-START.md)** | Detailed procedures | 15 min read |
| **[DEV-E2E-ACCESS-GUIDE.md](./DEV-E2E-ACCESS-GUIDE.md)** | Full developer guide | 30 min read |
| **[TEST-CONDUCTOR-RESULTS.md](./TEST-CONDUCTOR-RESULTS.md)** | Simple results template | Fill during test |
| **[E2E-RESULTS-TEMPLATE.md](./E2E-RESULTS-TEMPLATE.md)** | Detailed results template | Fill during test |

### Test Conductor Script
| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `scripts/Test-Conductor.ps1` | PowerShell | 300+ | Automated E2E testing guide |

**Run with:**
```powershell
.\scripts\Test-Conductor.ps1 -WalletPrivKey 0xYOUR_TESTNET_KEY
```

---

## 🔧 Operations & Monitoring

### Operations Scripts (Read-Only)
| Script | Purpose | Usage |
|--------|---------|-------|
| `scripts/ops/status.ps1` | System health check | `.\scripts\ops\status.ps1` |
| `scripts/ops/watch-events.ps1` | Live event monitor | `.\scripts\ops\watch-events.ps1 -Follow` |
| `scripts/ops/fee-audit.ps1` | Fee routing validation | `.\scripts\ops\fee-audit.ps1` |
| `scripts/ops/land-snapshot.ps1` | Parcel ownership export | `.\scripts\ops\land-snapshot.ps1` |
| `scripts/ops/gas-watch.ps1` | Gas price monitor | `.\scripts\ops\gas-watch.ps1 -Follow` |
| `scripts/ops/graph-query.ps1` | Subgraph query helper | `.\scripts\ops\graph-query.ps1 -SubgraphUrl ...` |

### Operations Documentation
| Document | Purpose | Size |
|----------|---------|------|
| **[scripts/ops/README.md](./scripts/ops/README.md)** | Ops pack overview | 400+ lines |
| **[docs/OPS-RUNBOOK.md](./docs/OPS-RUNBOOK.md)** | Complete operations guide | 600+ lines |
| **[docs/RUNBOOKS.md](./docs/RUNBOOKS.md)** | Incident response playbooks | 8 playbooks |

---

## 🔒 Security & Governance

### Admin Operations (Private Repo)
| Document | Purpose | Audience |
|----------|---------|----------|
| **[.ops-private-template/README-PRIVATE-OPS.md](./.ops-private-template/README-PRIVATE-OPS.md)** | Admin operations setup | Admins only |
| **[docs/MULTISIG-MAP.md](./docs/MULTISIG-MAP.md)** | Governance structure | All |

**⚠️ Admin scripts (pause, unpause, set params) belong in a PRIVATE repository**

---

## 📊 Project Status & Planning

### Current Phase
| Document | Purpose |
|----------|---------|
| **[E2E-INFRASTRUCTURE-COMPLETE.md](./E2E-INFRASTRUCTURE-COMPLETE.md)** | Infrastructure completion summary |
| **[PHASE-3-COMPLETE-SUMMARY.md](./PHASE-3-COMPLETE-SUMMARY.md)** | Phase 3 deliverables |
| **[BUILDER-AI-PROMPT.md](./BUILDER-AI-PROMPT.md)** | Next development tasks |

### Deployment
| Document | Purpose |
|----------|---------|
| **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** | Pre-deployment validation |
| **[CHANGELOG.md](./CHANGELOG.md)** | Version history |

---

## 🐛 Troubleshooting

### Common Issues
| Issue | Solution Document |
|-------|-------------------|
| "cast: command not found" | [DEV-E2E-ACCESS-GUIDE.md](./DEV-E2E-ACCESS-GUIDE.md) - Troubleshooting |
| RPC timeouts | [docs/RUNBOOKS.md](./docs/RUNBOOKS.md) - RPC Outage |
| Chain ID mismatch | [docs/RUNBOOKS.md](./docs/RUNBOOKS.md) - Chain Mismatch |
| Swap transaction fails | [DEV-E2E-ACCESS-GUIDE.md](./DEV-E2E-ACCESS-GUIDE.md) - Troubleshooting |
| High gas costs | [docs/RUNBOOKS.md](./docs/RUNBOOKS.md) - High Gas Costs |
| Critical vulnerability | [docs/RUNBOOKS.md](./docs/RUNBOOKS.md) - Critical Vulnerability |

---

## 📖 Documentation by Role

### For New Developers
1. **[START-HERE-E2E.md](./START-HERE-E2E.md)** - Quick start
2. **[DEV-E2E-ACCESS-GUIDE.md](./DEV-E2E-ACCESS-GUIDE.md)** - Full setup
3. **[E2E-QUICK-START.md](./E2E-QUICK-START.md)** - Testing procedures

### For QA Testers
1. **[E2E-QUICK-START.md](./E2E-QUICK-START.md)** - Testing guide
2. **[TEST-CONDUCTOR-RESULTS.md](./TEST-CONDUCTOR-RESULTS.md)** - Results template
3. `scripts/Test-Conductor.ps1` - Automation script

### For DevOps/SRE
1. **[scripts/ops/README.md](./scripts/ops/README.md)** - Ops overview
2. **[docs/OPS-RUNBOOK.md](./docs/OPS-RUNBOOK.md)** - Operations guide
3. **[docs/RUNBOOKS.md](./docs/RUNBOOKS.md)** - Incident response

### For Admins/Multisig Signers
1. **[docs/MULTISIG-MAP.md](./docs/MULTISIG-MAP.md)** - Governance
2. **[.ops-private-template/README-PRIVATE-OPS.md](./.ops-private-template/README-PRIVATE-OPS.md)** - Admin setup
3. **[docs/RUNBOOKS.md](./docs/RUNBOOKS.md)** - Emergency procedures

### For Auditors
1. **[DEV-E2E-ACCESS-GUIDE.md](./DEV-E2E-ACCESS-GUIDE.md)** - Setup
2. `scripts/ops/*` - Monitoring scripts
3. **[docs/MULTISIG-MAP.md](./docs/MULTISIG-MAP.md)** - Access control

---

## 🎯 Common Workflows

### Pre-Testing Session
```powershell
# 1. Health check
.\scripts\ops\status.ps1

# 2. Start event monitor
.\scripts\ops\watch-events.ps1 -Follow

# 3. Run Test Conductor
.\scripts\Test-Conductor.ps1 -WalletPrivKey 0x...
```

**Documentation:** [E2E-QUICK-START.md](./E2E-QUICK-START.md) - Common Workflows

### Weekly Operations Review
```powershell
# 1. System status
.\scripts\ops\status.ps1

# 2. Fee audit
.\scripts\ops\fee-audit.ps1 -Lookback 100000

# 3. Land snapshot
.\scripts\ops\land-snapshot.ps1
```

**Documentation:** [docs/OPS-RUNBOOK.md](./docs/OPS-RUNBOOK.md) - Common Workflows

### Incident Investigation
```powershell
# 1. System status
.\scripts\ops\status.ps1

# 2. Watch events
.\scripts\ops\watch-events.ps1 -Lookback 5000

# 3. Check gas
.\scripts\ops\gas-watch.ps1
```

**Documentation:** [docs/RUNBOOKS.md](./docs/RUNBOOKS.md) - 8 Incident Playbooks

---

## 📞 Getting Help

### Documentation First
1. Search this index for your topic
2. Check relevant documentation
3. Try troubleshooting section

### Contact Channels
- **Discord:** #testing channel (general questions)
- **GitHub Issues:** Bug reports, feature requests
- **Email:** team-lead@psx-void.io (urgent/private)

### Escalation
1. Check docs (this index)
2. Ask in Discord
3. Create GitHub issue
4. For critical → alert lead developer (24/7)

**See:** [docs/OPS-RUNBOOK.md](./docs/OPS-RUNBOOK.md) - Contact Information

---

## 🔄 Document Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| All E2E & Ops docs | 1.0.0 | 2025-11-11 |

---

## ✅ Quick Checklist

**Before your first test:**
- [ ] Read [START-HERE-E2E.md](./START-HERE-E2E.md)
- [ ] Install Foundry: `.\install-foundry-windows.ps1`
- [ ] Configure `.env.local` from template
- [ ] Get test funds (Base Sepolia ETH + VOID + USDC)
- [ ] Run Test Conductor: `.\scripts\Test-Conductor.ps1 -WalletPrivKey 0x...`

**For regular testing:**
- [ ] Review [E2E-QUICK-START.md](./E2E-QUICK-START.md)
- [ ] Use [TEST-CONDUCTOR-RESULTS.md](./TEST-CONDUCTOR-RESULTS.md) template
- [ ] Check QA logs in `qa-reports/`

**For operations:**
- [ ] Bookmark [docs/OPS-RUNBOOK.md](./docs/OPS-RUNBOOK.md)
- [ ] Review [docs/RUNBOOKS.md](./docs/RUNBOOKS.md) incident playbooks
- [ ] Test all scripts in `scripts/ops/`

---

**Last Updated:** 2025-11-11  
**Maintainer:** PSX VOID Core Team  
**Feedback:** Open a PR to improve this index!
