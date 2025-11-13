#requires -Version 5.1
<#
.SYNOPSIS
PSX VOID - Live Event Watcher (Read-Only)

.DESCRIPTION
Tail recent on-chain events from key contracts:
- VOID/USDC Transfer events
- Land parcel Transfer events
- Swap events (if available)

Polls blocks in real-time and prints events as they occur.

.PARAMETER Rpc
Base Sepolia RPC URL

.PARAMETER Lookback
Number of blocks to scan backwards (default: 2000)

.PARAMETER Follow
If set, continuously poll for new events

.EXAMPLE
.\scripts\ops\watch-events.ps1
.\scripts\ops\watch-events.ps1 -Lookback 5000 -Follow
#>

param(
    [string]$Rpc = "https://sepolia.base.org",
    [string]$Void = "0x8de4043445939B0D0Cc7d6c752057707279D9893",
    [string]$Usdc = "0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9",
    [string]$WorldLand = "0xC4559144b784A8991924b1389a726d68C910A206",
    [int]$Lookback = 2000,
    [switch]$Follow
)

# Override with env var if present
if ($env:NEXT_PUBLIC_BASE_RPC_URL) {
    $Rpc = $env:NEXT_PUBLIC_BASE_RPC_URL
}

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PSX VOID - Event Watcher" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# keccak256("Transfer(address,address,uint256)")
$transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

function Watch-Events {
    param([int]$fromBlock, [int]$toBlock)
    
    Write-Host "Scanning blocks $fromBlock → $toBlock" -ForegroundColor Gray
    Write-Host ""
    
    # VOID Transfers
    Write-Host "─── VOID Transfers ───" -ForegroundColor Yellow
    try {
        $logs = cast logs --rpc-url $Rpc --address $Void `
            --from-block $fromBlock --to-block $toBlock `
            --topic $transferTopic 2>$null
        
        if ($logs) {
            $logs | ForEach-Object { Write-Host $_ -ForegroundColor Green }
        } else {
            Write-Host "  (no transfers)" -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "  (error fetching logs)" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # USDC Transfers
    Write-Host "─── USDC Transfers ───" -ForegroundColor Yellow
    try {
        $logs = cast logs --rpc-url $Rpc --address $Usdc `
            --from-block $fromBlock --to-block $toBlock `
            --topic $transferTopic 2>$null
        
        if ($logs) {
            $logs | ForEach-Object { Write-Host $_ -ForegroundColor Green }
        } else {
            Write-Host "  (no transfers)" -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "  (error fetching logs)" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Land Transfers (NFT)
    Write-Host "─── Land Parcel Transfers ───" -ForegroundColor Yellow
    try {
        $logs = cast logs --rpc-url $Rpc --address $WorldLand `
            --from-block $fromBlock --to-block $toBlock `
            --topic $transferTopic 2>$null
        
        if ($logs) {
            $logs | ForEach-Object { Write-Host $_ -ForegroundColor Magenta }
        } else {
            Write-Host "  (no transfers)" -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "  (error fetching logs)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
}

# Initial scan
try {
    $latest = [int](cast block-number --rpc-url $Rpc)
    $from = $latest - $Lookback
    
    Watch-Events -fromBlock $from -toBlock $latest
    
    if ($Follow) {
        Write-Host "Following new blocks (Ctrl+C to stop)..." -ForegroundColor Cyan
        Write-Host ""
        
        $lastBlock = $latest
        
        while ($true) {
            Start-Sleep -Seconds 15
            
            $current = [int](cast block-number --rpc-url $Rpc)
            
            if ($current -gt $lastBlock) {
                $from = $lastBlock + 1
                $to = $current
                
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] New blocks: $from → $to" -ForegroundColor Cyan
                Watch-Events -fromBlock $from -toBlock $to
                
                $lastBlock = $current
            }
        }
    }
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Event Watch Complete" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
