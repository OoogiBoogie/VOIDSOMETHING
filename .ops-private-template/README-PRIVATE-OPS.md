# Private Operations Repository - Setup Guide

**⚠️ IMPORTANT: This directory/repository should be PRIVATE and NEVER committed to public git.**

---

## 🔒 Purpose

This directory contains **administrative operations** that can modify blockchain state or contain sensitive credentials. These scripts should be:

1. Stored in a **separate private repository** (e.g., `psx-void-ops-private`)
2. Accessible only to **authorized multisig signers and admins**
3. **Never included** in the public `psx-void` repository
4. Protected with **access controls** (GitHub private repo, encrypted storage, etc.)

---

## 📂 Directory Structure

```
psx-void-ops-private/
  admin/
    pause-protocol.ps1         # Emergency pause
    unpause-protocol.ps1       # Resume operations
    set-fee-params.ps1         # Adjust protocol fees (within bounds)
    set-apr-params.ps1         # Adjust staking APR (within bounds)
    rescue-tokens.ps1          # Emergency token recovery
    transfer-ownership.ps1     # Ownership transfers
    
  secrets/
    .env.admin                 # Admin private keys (NEVER commit)
    wallet-manager.ps1         # Key vault integration
    
  jobs/
    weekly-fee-recon.ps1       # Fee reconciliation report
    tvl-snapshot.ps1           # TVL tracking
    alert-webhook.ps1          # Discord/Slack alerts
    
  indexer/
    deploy-subgraph.ps1        # Subgraph deployment
    backup-db.ps1              # Database backups
    
  multisig/
    propose-tx.ps1             # Create multisig proposal
    sign-tx.ps1                # Sign pending proposal
    execute-tx.ps1             # Execute approved transaction
    
  README.md                    # This file
  .gitignore                   # Aggressive ignore (all keys, all .env files)
```

---

## ⚙️ Setup Instructions

### Option 1: Separate Private Repository (Recommended)

```powershell
# 1. Create new private repo on GitHub
# Name: psx-void-ops-private
# Visibility: Private
# Access: Restricted to admins/multisig signers only

# 2. Clone alongside main repo
cd C:\Users\rigof\Documents\
git clone https://github.com/yourusername/psx-void-ops-private.git

# 3. Set up secrets
cd psx-void-ops-private\secrets
cp .env.admin.example .env.admin
# Edit .env.admin with real admin keys (NEVER commit)

# 4. Link to main repo (optional - git submodule)
cd C:\Users\rigof\Documents\000
git submodule add https://github.com/yourusername/psx-void-ops-private.git ops-private
# CI can mount this submodule with restricted access
```

### Option 2: Local Directory Only (Simpler)

```powershell
# 1. Create directory outside main repo
cd C:\Users\rigof\Documents\
mkdir psx-void-ops-private

# 2. Copy template files (create from examples below)
# DO NOT initialize git in this directory

# 3. Secure with Windows permissions
icacls psx-void-ops-private /inheritance:r
icacls psx-void-ops-private /grant:r "${env:USERNAME}:(OI)(CI)F"
```

---

## 🔑 Secrets Management

### .env.admin Template

```bash
# admin/.env.admin - NEVER COMMIT THIS FILE

# Admin private key (for Owner role operations)
ADMIN_PRIVATE_KEY=0x...

# Multisig signer key (if using Safe/Gnosis)
MULTISIG_SIGNER_KEY=0x...

# RPC with higher rate limits (paid tier)
ADMIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_PREMIUM_KEY

# Alert webhooks
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Subgraph deployment
SUBGRAPH_DEPLOY_KEY=...
THE_GRAPH_ACCESS_TOKEN=...
```

### .gitignore (Aggressive)

```gitignore
# .gitignore for private ops repo

# ALL environment files
*.env
*.env.*
.env
.env.local
.env.admin
.env.production

# Private keys (any format)
*.key
*.pem
*.p12
*.pfx
private-keys/
secrets/

# Wallet files
keystore/
wallets/

# Logs with potential secrets
logs/
*.log
*.jsonl

# Backup files
backups/
*.bak
*.backup

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
```

---

## 🛠️ Example Admin Scripts

### admin/pause-protocol.ps1

```powershell
#requires -Version 5.1
<#
.SYNOPSIS
Emergency Protocol Pause (Write Operation)

.DESCRIPTION
⚠️ ADMIN ONLY - Pauses all protocol operations in emergency.
Requires Owner or Pause Guardian private key.

.EXAMPLE
.\admin\pause-protocol.ps1 -Contract VoidHookRouterV4
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("VoidHookRouterV4", "xVOIDVault", "WorldLandTestnet")]
    [string]$Contract,
    
    [string]$Rpc = $env:ADMIN_RPC_URL,
    [string]$PrivateKey = $env:ADMIN_PRIVATE_KEY
)

$ErrorActionPreference = "Stop"

# Contract addresses
$addresses = @{
    VoidHookRouterV4 = "0x687E678aB2152d9e0952d42B0F872604533D25a9"
    xVOIDVault = "0xab10B2B5E1b07447409BCa889d14F046bEFd8192"
    WorldLandTestnet = "0xC4559144b784A8991924b1389a726d68C910A206"
}

$target = $addresses[$Contract]

Write-Host "⚠️  EMERGENCY PAUSE - $Contract" -ForegroundColor Red
Write-Host "Address: $target" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Type 'PAUSE' to confirm"
if ($confirm -ne "PAUSE") {
    Write-Host "Aborted." -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "Executing pause()..." -ForegroundColor Yellow

cast send $target "pause()" --private-key $PrivateKey --rpc-url $Rpc

Write-Host ""
Write-Host "✓ Protocol paused" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy EMERGENCY_PAUSE banner in UI"
Write-Host "2. Alert users on Discord/Twitter"
Write-Host "3. Investigate root cause"
Write-Host "4. Deploy fix"
Write-Host "5. Run unpause-protocol.ps1"
Write-Host ""
```

### admin/set-fee-params.ps1

```powershell
#requires -Version 5.1
<#
.SYNOPSIS
Adjust Protocol Fee Parameters (Write Operation)

.DESCRIPTION
⚠️ ADMIN ONLY - Adjusts swap fee percentage (within safe bounds).
Requires FeeManager or Owner private key.

.EXAMPLE
.\admin\set-fee-params.ps1 -NewFeeBps 25  # 0.25%
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateRange(10, 50)]  # 0.1% to 0.5%
    [int]$NewFeeBps,
    
    [string]$Rpc = $env:ADMIN_RPC_URL,
    [string]$PrivateKey = $env:ADMIN_PRIVATE_KEY
)

$ErrorActionPreference = "Stop"

$router = "0x687E678aB2152d9e0952d42B0F872604533D25a9"

Write-Host "Fee Parameter Change" -ForegroundColor Cyan
Write-Host ""
Write-Host ("Current Fee: 0.30% (30 bps)" -ForegroundColor Gray)
Write-Host ("New Fee:     {0:N2}% ({1} bps)" -f ($NewFeeBps / 100), $NewFeeBps) -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Type 'CONFIRM' to proceed"
if ($confirm -ne "CONFIRM") {
    Write-Host "Aborted." -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "Executing setFee($NewFeeBps)..." -ForegroundColor Yellow

cast send $router "setFee(uint16)" $NewFeeBps --private-key $PrivateKey --rpc-url $Rpc

Write-Host ""
Write-Host "✓ Fee updated" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update documentation (README.md, CHANGELOG.md)"
Write-Host "2. Announce to community"
Write-Host "3. Monitor fee accrual with fee-audit.ps1"
Write-Host ""
```

---

## 🚨 Emergency Procedures

### RPC Outage

**If public RPC is down:**

```powershell
# Use premium admin RPC
$env:ADMIN_RPC_URL = "https://base-sepolia.g.alchemy.com/v2/YOUR_KEY"

# Test connectivity
.\admin\test-rpc.ps1

# Update main app .env.local with emergency RPC
# Deploy updated config
```

### Critical Vulnerability

**If exploit detected:**

```powershell
# 1. PAUSE immediately (< 5 min)
.\admin\pause-protocol.ps1 -Contract VoidHookRouterV4
.\admin\pause-protocol.ps1 -Contract xVOIDVault
.\admin\pause-protocol.ps1 -Contract WorldLandTestnet

# 2. Deploy emergency UI banner
# See main repo: components/EmergencyBanner.tsx

# 3. Alert team
.\admin\send-alert.ps1 -Message "CRITICAL: Protocol paused due to exploit" -Severity critical

# 4. Investigate + patch
# Deploy fix to testnet first

# 5. Resume (after validation)
.\admin\unpause-protocol.ps1 -Contract VoidHookRouterV4
# ... etc
```

---

## 📊 Scheduled Jobs

### CI/CD Integration (Private Repo)

```yaml
# .github/workflows/weekly-recon.yml (in private repo)
name: Weekly Fee Reconciliation

on:
  schedule:
    - cron: '0 0 * * 0'  # Sundays at midnight UTC

jobs:
  fee-recon:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: foundry-rs/foundry-toolchain@v1
      
      - name: Fee reconciliation
        run: .\jobs\weekly-fee-recon.ps1
        env:
          ADMIN_RPC_URL: ${{ secrets.ADMIN_RPC_URL }}
      
      - name: Send report
        run: .\jobs\send-report.ps1 -Report fee-recon
        env:
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: weekly-recon
          path: reports/**
```

---

## 🔐 Access Control

**Who should have access:**
- ✅ Multisig signers (Owner, FeeManager, etc.)
- ✅ Lead developer (for emergency response)
- ✅ Security team (for incident response)
- ✅ DevOps (for CI/CD jobs)

**Who should NOT have access:**
- ❌ Public contributors
- ❌ Community members
- ❌ Third-party integrators
- ❌ Anyone without explicit admin responsibilities

**GitHub Private Repo Settings:**
1. Create as **Private** repository
2. Restrict access to specific users/teams
3. Enable **branch protection** on main branch
4. Require **reviews** for all PRs (even from admins)
5. Enable **audit log** tracking

---

## 📝 Logging & Audit Trail

All admin operations should log:
- Timestamp
- Operator (address)
- Action performed
- Parameters
- Transaction hash

**Example logging function:**

```powershell
function Log-AdminAction {
    param($action, $params, $txHash)
    
    $entry = @{
        timestamp = (Get-Date).ToString("o")
        operator = (cast wallet address --private-key $env:ADMIN_PRIVATE_KEY)
        action = $action
        params = $params
        txHash = $txHash
    }
    
    $entry | ConvertTo-Json | Out-File -Append "logs/admin-$(Get-Date -Format 'yyyyMM').jsonl"
}
```

---

## 🆘 Support

**Emergency Contact:**
- Lead Developer: [24/7 Phone/Discord]
- Security Team: [security@psx-void.io]
- Multisig Signers: See `docs/MULTISIG-MAP.md`

**Documentation:**
- Main repo: `docs/RUNBOOKS.md` (incident response)
- Main repo: `docs/MULTISIG-MAP.md` (governance)
- This file: Private ops setup

---

**⚠️ REMINDER: Keep this directory/repository PRIVATE and SECURE ⚠️**
