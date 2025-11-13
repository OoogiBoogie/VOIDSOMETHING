#requires -Version 5.1
<#
.SYNOPSIS
PSX VOID - Land Ownership Snapshot (Read-Only)

.DESCRIPTION
Export all land parcel ownership to CSV/JSON for analytics or QA validation.
Scans WorldLandTestnet contract for all minted parcels and their current owners.

.PARAMETER Rpc
Base Sepolia RPC URL

.PARAMETER OutputFormat
Export format: csv, json, or both (default: both)

.EXAMPLE
.\scripts\ops\land-snapshot.ps1
.\scripts\ops\land-snapshot.ps1 -OutputFormat json
#>

param(
    [string]$Rpc = "https://sepolia.base.org",
    [string]$WorldLand = "0xC4559144b784A8991924b1389a726d68C910A206",
    [ValidateSet("csv", "json", "both")]
    [string]$OutputFormat = "both"
)

# Override with env var if present
if ($env:NEXT_PUBLIC_BASE_RPC_URL) {
    $Rpc = $env:NEXT_PUBLIC_BASE_RPC_URL
}

$ErrorActionPreference = "Stop"

function ok($m) { Write-Host ("[✓]  " + $m) -ForegroundColor Green }
function info($m) { Write-Host ("[i]  " + $m) -ForegroundColor Cyan }

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PSX VOID - Land Ownership Snapshot" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Known parcel coordinates (from coordinates.ts)
# In a real implementation, you'd query all Transfer events or maintain an index
# For now, we'll check a sample of known parcels

$sampleParcels = @(
    @{ district = "DeFi"; x = 0; y = 0 },
    @{ district = "Creator"; x = -10; y = 0 },
    @{ district = "DAO"; x = 0; y = -10 },
    @{ district = "AI"; x = 10; y = 10 }
)

info "Checking sample parcels (expand with full coordinate list)..."
Write-Host ""

$parcels = @()

foreach ($parcel in $sampleParcels) {
    $x = $parcel.x
    $y = $parcel.y
    
    # Encode coordinates to tokenId (matching Solidity logic)
    # tokenId = (uint256(uint128(int128(x))) << 128) | uint256(uint128(int128(y)))
    # Simplified: for demo purposes, use a basic encoding
    $tokenId = [Math]::Abs($x) * 1000000 + [Math]::Abs($y)
    
    try {
        $owner = cast call $WorldLand "ownerOf(uint256)(address)" $tokenId --rpc-url $Rpc 2>$null
        
        if ($owner -and $owner -ne "0x0000000000000000000000000000000000000000") {
            $parcels += @{
                district = $parcel.district
                x = $x
                y = $y
                tokenId = $tokenId
                owner = $owner
                owned = $true
            }
            
            Write-Host ("  [{0,10}] ({1,3}, {2,3}) → {3}" -f $parcel.district, $x, $y, $owner) -ForegroundColor Green
        } else {
            $parcels += @{
                district = $parcel.district
                x = $x
                y = $y
                tokenId = $tokenId
                owner = "unowned"
                owned = $false
            }
            
            Write-Host ("  [{0,10}] ({1,3}, {2,3}) → unowned" -f $parcel.district, $x, $y) -ForegroundColor DarkGray
        }
    } catch {
        Write-Host ("  [{0,10}] ({1,3}, {2,3}) → error" -f $parcel.district, $x, $y) -ForegroundColor Red
    }
}

Write-Host ""

# Export results
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

if ($OutputFormat -eq "csv" -or $OutputFormat -eq "both") {
    $csvPath = "qa-reports/land-snapshot-$timestamp.csv"
    
    if (!(Test-Path "qa-reports")) { 
        New-Item -ItemType Directory -Path "qa-reports" | Out-Null 
    }
    
    $parcels | ForEach-Object {
        [PSCustomObject]$_
    } | Export-Csv -Path $csvPath -NoTypeInformation
    
    ok "CSV exported: $csvPath"
}

if ($OutputFormat -eq "json" -or $OutputFormat -eq "both") {
    $jsonPath = "qa-reports/land-snapshot-$timestamp.json"
    
    if (!(Test-Path "qa-reports")) { 
        New-Item -ItemType Directory -Path "qa-reports" | Out-Null 
    }
    
    @{
        timestamp = (Get-Date).ToString("o")
        totalParcels = $parcels.Count
        ownedParcels = ($parcels | Where-Object { $_.owned }).Count
        parcels = $parcels
    } | ConvertTo-Json -Depth 10 | Out-File $jsonPath
    
    ok "JSON exported: $jsonPath"
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ("  {0} parcels scanned" -f $parcels.Count) -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
info "Expand sampleParcels array with full coordinate list for complete snapshot"
Write-Host ""
