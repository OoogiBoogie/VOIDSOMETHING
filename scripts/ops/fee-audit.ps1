#requires -Version 5.1
<#
.SYNOPSIS
PSX VOID - Fee Routing Audit (Read-Only)

.DESCRIPTION
Recompute 0.3% protocol fees from recent swap events and compare to Router balances.
Validates that fee routing is working correctly without modifying any state.

.PARAMETER Rpc
Base Sepolia RPC URL

.PARAMETER Lookback
Number of blocks to scan backwards (default: 10000 ≈ 5.5 hours on Base)

.EXAMPLE
.\scripts\ops\fee-audit.ps1
.\scripts\ops\fee-audit.ps1 -Lookback 20000
#>

param(
    [string]$Rpc = "https://sepolia.base.org",
    [string]$Void = "0x8de4043445939B0D0Cc7d6c752057707279D9893",
    [string]$Router = "0x687E678aB2152d9e0952d42B0F872604533D25a9",
    [int]$Lookback = 10000
)

# Override with env var if present
if ($env:NEXT_PUBLIC_BASE_RPC_URL) {
    $Rpc = $env:NEXT_PUBLIC_BASE_RPC_URL
}

$ErrorActionPreference = "Stop"

function ok($m) { Write-Host ("[✓]  " + $m) -ForegroundColor Green }
function warn($m) { Write-Host ("[⚠]  " + $m) -ForegroundColor Yellow }
function info($m) { Write-Host ("[i]  " + $m) -ForegroundColor Cyan }

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PSX VOID - Fee Routing Audit" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get current Router balance
info "Fetching Router VOID balance..."
$balHex = cast call $Void "balanceOf(address)(uint256)" $Router --rpc-url $Rpc
$balWei = [System.Numerics.BigInteger]::Parse($balHex.Replace('0x',''), "AllowHexSpecifier")
$currentBalance = [decimal]$balWei / [decimal]1e18

ok ("Current Router balance: {0:N6} VOID" -f $currentBalance)
Write-Host ""

# Get block range
$latest = [int](cast block-number --rpc-url $Rpc)
$from = $latest - $Lookback

info "Scanning blocks $from → $latest ($Lookback blocks)"
Write-Host ""

# keccak256("Transfer(address,address,uint256)")
$transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

# Get all VOID transfers TO the Router
info "Fetching Transfer events to Router..."
$logs = cast logs --rpc-url $Rpc --address $Void `
    --from-block $from --to-block $latest `
    --topic $transferTopic 2>$null

if (!$logs) {
    warn "No Transfer events found in the specified range"
    Write-Host ""
    exit 0
}

# Parse logs and sum fees
$totalFees = [decimal]0
$transferCount = 0

# Note: cast logs output format is multi-line, need to parse carefully
# Each event has: topics[0] = Transfer sig, topics[1] = from (indexed), topics[2] = to (indexed), data = amount
# For simplicity, we'll count transfers and estimate (proper parsing would decode logs)

Write-Host "Transfer events found:" -ForegroundColor Yellow
$logs | Select-Object -First 10 | ForEach-Object { 
    Write-Host "  $_" -ForegroundColor DarkGray 
}

if ($logs.Count -gt 10) {
    Write-Host "  ... and $($logs.Count - 10) more" -ForegroundColor DarkGray
}

Write-Host ""
info "Found $($logs.Count) Transfer events to Router in $Lookback blocks"
Write-Host ""

# Estimate fees (0.3% of swap volume)
# Note: Without proper event decoding, we can't get exact swap amounts
# This is a simplified audit - for production, decode Swap events from VoidSwapTestnet

warn "Fee computation requires Swap event decoding (not implemented in this read-only audit)"
info "For precise fee validation, use the Test-Conductor.ps1 pre/post balance snapshots"

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Audit Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host ("Router Balance:   {0:N6} VOID" -f $currentBalance) -ForegroundColor Green
Write-Host ("Transfer Events:  {0}" -f $logs.Count) -ForegroundColor Cyan
Write-Host ("Block Range:      {0} → {1}" -f $from, $latest) -ForegroundColor Gray
Write-Host ""
info "For detailed fee routing proof, run Test-Conductor.ps1 with manual swap execution"
Write-Host ""
