#requires -Version 5.1
<#
.SYNOPSIS
PSX VOID - Gas Price Monitor (Read-Only)

.DESCRIPTION
Poll Base Sepolia gas prices and alert when above threshold.
Useful for monitoring network congestion and optimizing transaction timing.

.PARAMETER Rpc
Base Sepolia RPC URL

.PARAMETER ThresholdGwei
Alert threshold in Gwei (default: 0.5 Gwei)

.PARAMETER PollInterval
Seconds between polls (default: 30)

.PARAMETER Follow
If set, continuously monitor (default: single check)

.EXAMPLE
.\scripts\ops\gas-watch.ps1
.\scripts\ops\gas-watch.ps1 -ThresholdGwei 1.0 -Follow -PollInterval 60
#>

param(
    [string]$Rpc = "https://sepolia.base.org",
    [decimal]$ThresholdGwei = 0.5,
    [int]$PollInterval = 30,
    [switch]$Follow
)

# Override with env var if present
if ($env:NEXT_PUBLIC_BASE_RPC_URL) {
    $Rpc = $env:NEXT_PUBLIC_BASE_RPC_URL
}

$ErrorActionPreference = "Stop"

function ok($m) { Write-Host ("[✓]  " + $m) -ForegroundColor Green }
function warn($m) { Write-Host ("[⚠]  " + $m) -ForegroundColor Yellow }
function alert($m) { Write-Host ("[!!!] " + $m) -ForegroundColor Red }
function info($m) { Write-Host ("[i]  " + $m) -ForegroundColor Cyan }

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PSX VOID - Gas Price Monitor" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

info "Monitoring RPC: $Rpc"
info ("Alert threshold: {0:N2} Gwei" -f $ThresholdGwei)
Write-Host ""

function Get-GasPrice {
    try {
        $gasPriceHex = cast gas-price --rpc-url $Rpc
        $gasPriceWei = [System.Numerics.BigInteger]::Parse($gasPriceHex.Replace('0x',''), "AllowHexSpecifier")
        $gasPriceGwei = [decimal]$gasPriceWei / [decimal]1e9
        
        return $gasPriceGwei
    } catch {
        return $null
    }
}

do {
    $timestamp = Get-Date -Format "HH:mm:ss"
    $gasPrice = Get-GasPrice
    
    if ($null -eq $gasPrice) {
        warn "[$timestamp] Unable to fetch gas price"
    } else {
        if ($gasPrice -ge $ThresholdGwei) {
            alert ("[$timestamp] HIGH GAS: {0:N4} Gwei (threshold: {1:N2})" -f $gasPrice, $ThresholdGwei)
        } else {
            ok ("[$timestamp] Gas: {0:N4} Gwei" -f $gasPrice)
        }
    }
    
    if ($Follow) {
        Start-Sleep -Seconds $PollInterval
    }
    
} while ($Follow)

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Gas Monitor Complete" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
