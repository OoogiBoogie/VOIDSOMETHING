#requires -Version 5.1
<#
.SYNOPSIS
PSX VOID - System Status Check (Read-Only)

.DESCRIPTION
One-shot health summary of the entire protocol:
- Chain ID validation
- RPC latency check
- Contract address verification
- Router balance snapshot
- Subgraph health
- UI availability

.PARAMETER Rpc
Base Sepolia RPC URL (default: from env or https://sepolia.base.org)

.PARAMETER Void
VOID token address

.PARAMETER Router
VoidHookRouterV4 address

.PARAMETER SubgraphUrl
Subgraph endpoint (optional)

.EXAMPLE
.\scripts\ops\status.ps1
.\scripts\ops\status.ps1 -Rpc https://sepolia.base.org -Verbose
#>

param(
    [string]$Rpc = $env:NEXT_PUBLIC_BASE_RPC_URL ?? "https://sepolia.base.org",
    [string]$Void = "0x8de4043445939B0D0Cc7d6c752057707279D9893",
    [string]$Usdc = "0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9",
    [string]$Router = "0x687E678aB2152d9e0952d42B0F872604533D25a9",
    [string]$XVoidVault = "0xab10B2B5E1b07447409BCa889d14F046bEFd8192",
    [string]$WorldLand = "0xC4559144b784A8991924b1389a726d68C910A206",
    [string]$SubgraphUrl = ""
)

$ErrorActionPreference = "Stop"

function ok($m) { Write-Host ("[✓]  " + $m) -ForegroundColor Green }
function warn($m) { Write-Host ("[⚠]  " + $m) -ForegroundColor Yellow }
function err($m) { Write-Host ("[✖]  " + $m) -ForegroundColor Red }
function info($m) { Write-Host ("[i]  " + $m) -ForegroundColor Cyan }

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PSX VOID - System Status Check" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$statusReport = @{
    timestamp = (Get-Date).ToString("o")
    checks = @{}
}

# ─────────────────────────────────────────────────────────────────────────────
# 1. Chain ID + RPC Latency
# ─────────────────────────────────────────────────────────────────────────────
info "Checking RPC: $Rpc"

try {
    $start = Get-Date
    $resp = Invoke-WebRequest -UseBasicParsing -Uri $Rpc -Method POST `
        -ContentType "application/json" `
        -Body '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' `
        -TimeoutSec 10
    $elapsed = ((Get-Date) - $start).TotalMilliseconds
    
    $json = $resp.Content | ConvertFrom-Json
    $chainId = $json.result
    
    if ($chainId -eq "0x14ad") {
        ok "Chain ID: 0x14ad (84532 - Base Sepolia)"
        ok ("RPC latency: {0:N0} ms" -f $elapsed)
        $statusReport.checks.rpc = @{ ok=$true; chainId=$chainId; latency=$elapsed }
    } else {
        err "Wrong chain ID: $chainId (expected 0x14ad)"
        $statusReport.checks.rpc = @{ ok=$false; chainId=$chainId; error="wrong_chain" }
    }
} catch {
    err "RPC unreachable: $_"
    $statusReport.checks.rpc = @{ ok=$false; error="unreachable" }
}

Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# 2. Contract Addresses (code verification)
# ─────────────────────────────────────────────────────────────────────────────
info "Verifying contract deployments..."

$contracts = @{
    "VOID Token" = $Void
    "USDC Token" = $Usdc
    "VoidHookRouterV4" = $Router
    "xVOIDVault" = $XVoidVault
    "WorldLandTestnet" = $WorldLand
}

foreach ($contract in $contracts.GetEnumerator()) {
    try {
        $code = cast code $contract.Value --rpc-url $Rpc 2>$null
        if ([string]::IsNullOrWhiteSpace($code) -or $code -eq "0x") {
            warn "$($contract.Key) has no code at $($contract.Value)"
            $statusReport.checks[$contract.Key] = @{ ok=$false; address=$contract.Value }
        } else {
            ok "$($contract.Key): $($contract.Value)"
            $statusReport.checks[$contract.Key] = @{ ok=$true; address=$contract.Value }
        }
    } catch {
        warn "$($contract.Key) verification skipped (cast not available)"
    }
}

Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# 3. Router VOID Balance
# ─────────────────────────────────────────────────────────────────────────────
info "Checking Router fee accumulation..."

try {
    $balHex = cast call $Void "balanceOf(address)(uint256)" $Router --rpc-url $Rpc 2>$null
    $balWei = [System.Numerics.BigInteger]::Parse($balHex.Replace('0x',''), "AllowHexSpecifier")
    $balVoid = [decimal]$balWei / [decimal]1e18
    
    ok ("Router VOID balance: {0:N6} VOID" -f $balVoid)
    $statusReport.checks.routerBalance = @{ ok=$true; void=$balVoid }
} catch {
    warn "Router balance check failed (cast not available or call reverted)"
    $statusReport.checks.routerBalance = @{ ok=$false }
}

Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# 4. Subgraph Health (if URL provided)
# ─────────────────────────────────────────────────────────────────────────────
if ($SubgraphUrl) {
    info "Checking subgraph: $SubgraphUrl"
    
    try {
        $query = @{
            query = "{ _meta { block { number } hasIndexingErrors } }"
        } | ConvertTo-Json
        
        $resp = Invoke-WebRequest -UseBasicParsing -Uri $SubgraphUrl -Method POST `
            -ContentType "application/json" -Body $query -TimeoutSec 10
        
        $data = ($resp.Content | ConvertFrom-Json).data._meta
        
        if ($data.hasIndexingErrors) {
            warn "Subgraph has indexing errors!"
            $statusReport.checks.subgraph = @{ ok=$false; errors=$true }
        } else {
            ok "Subgraph healthy, synced to block $($data.block.number)"
            $statusReport.checks.subgraph = @{ ok=$true; block=$data.block.number }
        }
    } catch {
        warn "Subgraph unreachable or query failed"
        $statusReport.checks.subgraph = @{ ok=$false }
    }
    
    Write-Host ""
}

# ─────────────────────────────────────────────────────────────────────────────
# 5. UI Availability
# ─────────────────────────────────────────────────────────────────────────────
info "Checking UI availability..."

try {
    $resp = Invoke-WebRequest "http://localhost:3000" -UseBasicParsing -TimeoutSec 4
    ok "UI responding at http://localhost:3000"
    $statusReport.checks.ui = @{ ok=$true; url="http://localhost:3000" }
} catch {
    warn "UI not running on http://localhost:3000"
    $statusReport.checks.ui = @{ ok=$false }
}

Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# 6. Current Block Height
# ─────────────────────────────────────────────────────────────────────────────
try {
    $blockNum = cast block-number --rpc-url $Rpc 2>$null
    ok "Current block: $blockNum"
    $statusReport.checks.blockHeight = @{ ok=$true; number=[int]$blockNum }
} catch {
    warn "Block height check skipped"
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Status Check Complete" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Export JSON report (optional)
$reportPath = "qa-reports/status-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
if (!(Test-Path "qa-reports")) { New-Item -ItemType Directory -Path "qa-reports" | Out-Null }
$statusReport | ConvertTo-Json -Depth 10 | Out-File $reportPath
info "Status report saved: $reportPath"
Write-Host ""
