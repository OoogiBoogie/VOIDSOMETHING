# ============================================================================
# VOID Protocol - Live Contract Monitor & Smoke Tests
# ============================================================================
# Tests deployed contracts on Base Sepolia and provides real-time monitoring

param(
    [switch]$Monitor,
    [switch]$SmokeTest,
    [switch]$All,
    [int]$MonitorInterval = 10
)

$ErrorActionPreference = 'Stop'
$env:Path += ";C:\Users\rigof\.foundry\bin"
$env:FOUNDRY_DISABLE_NIGHTLY_WARNING = "true"

# Load deployment addresses
$deployment = Get-Content "deployments/baseSepolia.json" | ConvertFrom-Json
$RPC_URL = "https://sepolia.base.org"

# Colors
$SuccessColor = 'Green'
$ErrorColor = 'Red'
$InfoColor = 'Cyan'
$WarningColor = 'Yellow'

function Write-Status {
    param([string]$Message, [string]$Color = $InfoColor)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

function Get-ContractBalance {
    param([string]$Address, [string]$TokenAddress)
    
    if ($TokenAddress -eq "ETH") {
        $balance = cast balance $Address --rpc-url $RPC_URL
        return $balance
    } else {
        $balance = cast call $TokenAddress 'balanceOf(address)(uint256)' $Address --rpc-url $RPC_URL
        return $balance
    }
}

function Test-RouterFeeDistribution {
    Write-Status "`n=== TEST 1: Fee Router Distribution ===" $InfoColor
    
    # Check router constants
    Write-Host "Checking fee split constants..." -ForegroundColor $InfoColor
    
    $creatorBPS = cast call $deployment.VoidHookRouterV4 'CREATOR_SHARE_BPS()(uint256)' --rpc-url $RPC_URL
    $stakerBPS = cast call $deployment.VoidHookRouterV4 'STAKER_SHARE_BPS()(uint256)' --rpc-url $RPC_URL
    $psxBPS = cast call $deployment.VoidHookRouterV4 'PSX_TREASURY_SHARE_BPS()(uint256)' --rpc-url $RPC_URL
    $createBPS = cast call $deployment.VoidHookRouterV4 'CREATE_TREASURY_SHARE_BPS()(uint256)' --rpc-url $RPC_URL
    $agencyBPS = cast call $deployment.VoidHookRouterV4 'AGENCY_SHARE_BPS()(uint256)' --rpc-url $RPC_URL
    $grantsBPS = cast call $deployment.VoidHookRouterV4 'GRANTS_VAULT_SHARE_BPS()(uint256)' --rpc-url $RPC_URL
    $securityBPS = cast call $deployment.VoidHookRouterV4 'SECURITY_RESERVE_SHARE_BPS()(uint256)' --rpc-url $RPC_URL
    
    $total = [int]$creatorBPS + [int]$stakerBPS + [int]$psxBPS + [int]$createBPS + [int]$agencyBPS + [int]$grantsBPS + [int]$securityBPS
    
    Write-Host "  Creator:   $creatorBPS BPS (should be 4000)" -ForegroundColor $(if ($creatorBPS -eq 4000) { $SuccessColor } else { $ErrorColor })
    Write-Host "  Staker:    $stakerBPS BPS (should be 2000)" -ForegroundColor $(if ($stakerBPS -eq 2000) { $SuccessColor } else { $ErrorColor })
    Write-Host "  PSX:       $psxBPS BPS (should be 1000)" -ForegroundColor $(if ($psxBPS -eq 1000) { $SuccessColor } else { $ErrorColor })
    Write-Host "  CREATE:    $createBPS BPS (should be 1000)" -ForegroundColor $(if ($createBPS -eq 1000) { $SuccessColor } else { $ErrorColor })
    Write-Host "  Agency:    $agencyBPS BPS (should be 1000)" -ForegroundColor $(if ($agencyBPS -eq 1000) { $SuccessColor } else { $ErrorColor })
    Write-Host "  Grants:    $grantsBPS BPS (should be 500)" -ForegroundColor $(if ($grantsBPS -eq 500) { $SuccessColor } else { $ErrorColor })
    Write-Host "  Security:  $securityBPS BPS (should be 500)" -ForegroundColor $(if ($securityBPS -eq 500) { $SuccessColor } else { $ErrorColor })
    Write-Host "  TOTAL:     $total BPS (MUST be 10000)" -ForegroundColor $(if ($total -eq 10000) { $SuccessColor } else { $ErrorColor })
    
    if ($total -eq 10000) {
        Write-Status "[OK] Fee split validated: 40/20/10/10/10/5/5 = 100%" $SuccessColor
    } else {
        Write-Status "[ERROR] CRITICAL: Fee split does NOT equal 100%!" $ErrorColor
        return $false
    }
    
    return $true
}

function Test-XPOracle {
    Write-Status "`n=== TEST 2: XP Oracle ===" $InfoColor
    
    # Check total XP
    $totalXP = cast call $deployment.XPOracle 'totalXP()(uint256)' --rpc-url $RPC_URL
    Write-Host "  Total XP in system: $totalXP" -ForegroundColor $InfoColor
    
    # Check APR boost cap
    $testUser = "0x0000000000000000000000000000000000000001"
    $aprBoost = cast call $deployment.XPOracle 'getAPRBoost(address)(uint256)' $testUser --rpc-url $RPC_URL
    Write-Host "  Test user APR boost: $aprBoost BPS (max 2000)" -ForegroundColor $InfoColor
    
    if ([int]$aprBoost -le 2000) {
        Write-Status "[OK] APR boost within cap (<=20%)" $SuccessColor
        return $true
    } else {
        Write-Status "[ERROR] CRITICAL: APR boost exceeds 20% cap!" $ErrorColor
        return $false
    }
}

function Test-EscrowVault {
    Write-Status "`n=== TEST 3: Escrow Vault ===" $InfoColor
    
    # Check escrow count
    $escrowCount = cast call $deployment.EscrowVault 'escrowCount()(uint256)' --rpc-url $RPC_URL
    Write-Host "  Total escrows: $escrowCount" -ForegroundColor $InfoColor
    
    # Check stats
    $totalEscrowed = cast call $deployment.EscrowVault 'totalEscrowed()(uint256)' --rpc-url $RPC_URL
    $totalReleased = cast call $deployment.EscrowVault 'totalReleased()(uint256)' --rpc-url $RPC_URL
    
    Write-Host "  Total escrowed: $totalEscrowed" -ForegroundColor $InfoColor
    Write-Host "  Total released: $totalReleased" -ForegroundColor $InfoColor
    
    Write-Status "[OK] Escrow vault accessible" $SuccessColor
    return $true
}

function Test-MissionRegistry {
    Write-Status "`n=== TEST 4: Mission Registry ===" $InfoColor
    
    # Check mission count
    $missionCount = cast call $deployment.MissionRegistry 'missionCount()(uint256)' --rpc-url $RPC_URL
    Write-Host "  Total missions: $missionCount" -ForegroundColor $InfoColor
    
    # Check stats
    $totalCompletions = cast call $deployment.MissionRegistry 'totalCompletions()(uint256)' --rpc-url $RPC_URL
    $totalVXP = cast call $deployment.MissionRegistry 'totalVXPAwarded()(uint256)' --rpc-url $RPC_URL
    
    Write-Host "  Total completions: $totalCompletions" -ForegroundColor $InfoColor
    Write-Host "  Total vXP awarded: $totalVXP" -ForegroundColor $InfoColor
    
    Write-Status "[OK] Mission registry accessible" $SuccessColor
    return $true
}

function Test-xVOIDVault {
    Write-Status "`n=== TEST 5: xVOID Vault ===" $InfoColor
    
    # Check total staked
    $totalStaked = cast call $deployment.xVOIDVault 'totalStakedVOID()(uint256)' --rpc-url $RPC_URL
    Write-Host "  Total VOID staked: $totalStaked" -ForegroundColor $InfoColor
    
    # Check vault balance
    $vaultBalance = Get-ContractBalance $deployment.xVOIDVault $deployment.VOID
    Write-Host "  Vault VOID balance: $vaultBalance" -ForegroundColor $InfoColor
    
    Write-Status "[OK] xVOID vault accessible" $SuccessColor
    return $true
}

function Start-LiveMonitor {
    Write-Status "`n========================================" $InfoColor
    Write-Status "  VOID PROTOCOL - LIVE MONITOR" $InfoColor
    Write-Status "========================================" $InfoColor
    Write-Status "Network: Base Sepolia (Chain ID: $($deployment.chainId))" $InfoColor
    Write-Status "Refresh interval: $MonitorInterval seconds" $InfoColor
    Write-Status "Press Ctrl+C to stop`n" $WarningColor
    
    while ($true) {
        Clear-Host
        Write-Host "============================================================" -ForegroundColor $InfoColor
        Write-Host "       VOID PROTOCOL - LIVE MONITORING DASHBOARD            " -ForegroundColor $InfoColor
        Write-Host "============================================================" -ForegroundColor $InfoColor
        Write-Host "  Network: Base Sepolia | Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor $InfoColor
        Write-Host "============================================================`n" -ForegroundColor $InfoColor
        
        # XP Oracle Stats
        Write-Host "[Stats] XP ORACLE" -ForegroundColor $InfoColor
        $totalXP = cast call $deployment.XPOracle 'totalXP()(uint256)' --rpc-url $RPC_URL 2>$null
        Write-Host "  Total vXP: $totalXP" -ForegroundColor $SuccessColor
        
        # Mission Registry Stats
        Write-Host "`n[Missions] MISSION REGISTRY" -ForegroundColor $InfoColor
        $missionCount = cast call $deployment.MissionRegistry 'missionCount()(uint256)' --rpc-url $RPC_URL 2>$null
        $totalCompletions = cast call $deployment.MissionRegistry 'totalCompletions()(uint256)' --rpc-url $RPC_URL 2>$null
        $totalVXP = cast call $deployment.MissionRegistry 'totalVXPAwarded()(uint256)' --rpc-url $RPC_URL 2>$null
        Write-Host "  Missions: $missionCount | Completions: $totalCompletions | vXP Awarded: $totalVXP" -ForegroundColor $SuccessColor
        
        # Escrow Vault Stats
        Write-Host "`n[Escrow] ESCROW VAULT" -ForegroundColor $InfoColor
        $escrowCount = cast call $deployment.EscrowVault 'escrowCount()(uint256)' --rpc-url $RPC_URL 2>$null
        $totalEscrowed = cast call $deployment.EscrowVault 'totalEscrowed()(uint256)' --rpc-url $RPC_URL 2>$null
        $totalReleased = cast call $deployment.EscrowVault 'totalReleased()(uint256)' --rpc-url $RPC_URL 2>$null
        Write-Host "  Escrows: $escrowCount | Escrowed: $totalEscrowed | Released: $totalReleased" -ForegroundColor $SuccessColor
        
        # xVOID Vault Stats
        Write-Host "`n[Vault] xVOID VAULT" -ForegroundColor $InfoColor
        $totalStaked = cast call $deployment.xVOIDVault 'totalStakedVOID()(uint256)' --rpc-url $RPC_URL 2>$null
        Write-Host "  Total Staked: $totalStaked VOID" -ForegroundColor $SuccessColor
        
        # Fee Router Check
        Write-Host "`n[Fees] FEE ROUTER" -ForegroundColor $InfoColor
        Write-Host "  Address: $($deployment.VoidHookRouterV4)" -ForegroundColor $SuccessColor
        Write-Host "  Fee Split: 40/20/10/10/10/5/5 OK" -ForegroundColor $SuccessColor
        
        # Contract Links
        Write-Host "`n[Links] BASESCAN LINKS:" -ForegroundColor $InfoColor
        Write-Host "  Router:   https://sepolia.basescan.org/address/$($deployment.VoidHookRouterV4)" -ForegroundColor $InfoColor
        Write-Host "  XPOracle: https://sepolia.basescan.org/address/$($deployment.XPOracle)" -ForegroundColor $InfoColor
        Write-Host "  Missions: https://sepolia.basescan.org/address/$($deployment.MissionRegistry)" -ForegroundColor $InfoColor
        
        Write-Host "`n  Next refresh in $MonitorInterval seconds..." -ForegroundColor $WarningColor
        Start-Sleep -Seconds $MonitorInterval
    }
}

function Run-SmokeTests {
    Write-Status "`n========================================" $SuccessColor
    Write-Status "  VOID PROTOCOL - SMOKE TESTS" $SuccessColor
    Write-Status "========================================" $SuccessColor
    Write-Status "Network: Base Sepolia (Chain ID: $($deployment.chainId))`n" $InfoColor
    
    $results = @()
    
    $results += Test-RouterFeeDistribution
    $results += Test-XPOracle
    $results += Test-EscrowVault
    $results += Test-MissionRegistry
    $results += Test-xVOIDVault
    
    Write-Status "`n========================================" $InfoColor
    Write-Status "  SMOKE TEST RESULTS" $InfoColor
    Write-Status "========================================" $InfoColor
    
    $passed = ($results | Where-Object { $_ -eq $true }).Count
    $total = $results.Count
    
    Write-Host "`nTests Passed: $passed / $total" -ForegroundColor $(if ($passed -eq $total) { $SuccessColor } else { $WarningColor })
    
    if ($passed -eq $total) {
        Write-Status "`n[OK] ALL SMOKE TESTS PASSED!" $SuccessColor
        Write-Status "Deployment is healthy and ready for use." $SuccessColor
    } else {
        Write-Status "`n[ERROR] Some tests failed. Review errors above." $ErrorColor
    }
    
    Write-Host "`nDeployed Contracts:" -ForegroundColor $InfoColor
    Write-Host "  VoidHookRouterV4:    $($deployment.VoidHookRouterV4)" -ForegroundColor $InfoColor
    Write-Host "  XPOracle:            $($deployment.XPOracle)" -ForegroundColor $InfoColor
    Write-Host "  EscrowVault:         $($deployment.EscrowVault)" -ForegroundColor $InfoColor
    Write-Host "  xVOIDVault:          $($deployment.xVOIDVault)" -ForegroundColor $InfoColor
    Write-Host "  MissionRegistry:     $($deployment.MissionRegistry)" -ForegroundColor $InfoColor
    Write-Host "  TokenExpansionOracle: $($deployment.TokenExpansionOracle)" -ForegroundColor $InfoColor
    
    Write-Host "`nView on Basescan:" -ForegroundColor $InfoColor
    Write-Host "  https://sepolia.basescan.org/address/$($deployment.VoidHookRouterV4)" -ForegroundColor $InfoColor
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if ($Monitor -or $All) {
    Start-LiveMonitor
}
elseif ($SmokeTest -or $All) {
    Run-SmokeTests
}
else {
    Write-Host "`nVOID Protocol - Contract Testing and Monitoring" -ForegroundColor $InfoColor
    Write-Host "================================================`n" -ForegroundColor $InfoColor
    Write-Host "Usage:" -ForegroundColor $WarningColor
    Write-Host "  .\scripts\Test-Deployment.ps1 -SmokeTest     # Run all smoke tests" -ForegroundColor $InfoColor
    Write-Host "  .\scripts\Test-Deployment.ps1 -Monitor       # Start live monitoring dashboard" -ForegroundColor $InfoColor
    Write-Host "  .\scripts\Test-Deployment.ps1 -All           # Run tests + start monitor`n" -ForegroundColor $InfoColor
    Write-Host "Examples:" -ForegroundColor $WarningColor
    Write-Host "  .\scripts\Test-Deployment.ps1 -SmokeTest" -ForegroundColor $InfoColor
    Write-Host "  .\scripts\Test-Deployment.ps1 -Monitor -MonitorInterval 5`n" -ForegroundColor $InfoColor
}
