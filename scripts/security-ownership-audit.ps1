# =============================================================================
# COMPREHENSIVE CONTRACT OWNERSHIP SECURITY AUDIT
# =============================================================================
# Purpose: Verify that NO contracts are controlled by the compromised wallet
# Date: November 16, 2025
# Old Wallet (COMPROMISED): 0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f
# New Wallet (SECURE): 0x8b288f5c273421FC3eD81Ef82D40C332452b6303
# =============================================================================

$ErrorActionPreference = "Continue"
$RPC_URL = "https://sepolia.base.org"
$OLD_WALLET = "0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f"
$NEW_WALLET = "0x8b288f5c273421FC3eD81Ef82D40C332452b6303"
$ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"

Write-Host "`n" -NoNewline
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       CONTRACT OWNERSHIP SECURITY AUDIT - BASE SEPOLIA        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# All contracts from baseSepolia.json + new burn contracts
$contracts = @{
    # ===== TOKENS =====
    "VOID Token" = "0x8de4043445939B0D0Cc7d6c752057707279D9893"
    "PSX Token" = "0x9E08A4291771d18ce9718A3Ce8adE6DC82113CC7"
    "CREATE Token" = "0x99908B6127f45A0D4730a42DE8b4b74D313F956D"
    "AGENCY Token" = "0xb270007B1D6EBbeF505612D8b3C779A536A7227b"
    "SIGNAL Token" = "0x29c4172C243860f906C9625c983aE93F1147504B"
    "USDC (Mock)" = "0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9"
    "WETH (Mock)" = "0x14553932F4f3de19d47B716875804e84e8AE4311"
    
    # ===== PHASE 8/9 CONTRACTS =====
    "VoidHookRouterV4" = "0x687E678aB2152d9e0952d42B0F872604533D25a9"
    "XPOracle" = "0x8D786454ca2e252cb905f597214dD78C89E3Ba14"
    "EscrowVault" = "0x1A9b3fE46A6e2A9669D6d53fB58D562b97071FB7"
    "xVOIDVault" = "0xab10B2B5E1b07447409BCa889d14F046bEFd8192"
    "MissionRegistry" = "0x7C6BF84fd111A262CCdfEC885ba8677b3F3EE9c7"
    "TokenExpansionOracle" = "0x2B0CDb539682364e801757437e9fb8624eD50779"
    "WorldLandTestnet" = "0xC4559144b784A8991924b1389a726d68C910A206"
    "VoidSwapTestnet" = "0x74bD32c493C9be6237733507b00592e6AB231e4F"
    
    # ===== NEW BURN SYSTEM (Nov 16, 2025) =====
    "VoidBurnUtility" = "0x74cab4eefe359473f19BCcc7Fbba2fe5e37182Ee"
    "DistrictAccessBurn" = "0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760"
    "LandUpgradeBurn" = "0xb8eFf99c68BAA1AbABecFdd3F9d1Ba7e2673Ef80"
    "CreatorToolsBurn" = "0xeD63e3C9cEa4df1325899594dCc2f5Da6Fd13aEe"
    "PrestigeBurn" = "0xD8D8004C8292e3c9aDE1d5981400fFB56c9589ce"
    "MiniAppBurnAccess" = "0x9D233e943200Bb85F26232679905038CBa52C1d4"
    "AIUtilityGovernor" = "0x6CadC07B981a2D91d627c8D64f30B81067e6101D"
}

$criticalIssues = @()
$warnings = @()
$secure = @()

Write-Host "Scanning $($contracts.Count) contracts..." -ForegroundColor Yellow
Write-Host ""

foreach ($name in $contracts.Keys | Sort-Object) {
    $address = $contracts[$name]
    Write-Host "[$name]" -ForegroundColor White -NoNewline
    Write-Host " $address" -ForegroundColor Gray
    
    # Method 1: Check AccessControl hasRole (DEFAULT_ADMIN_ROLE)
    $oldHasRole = $null
    $newHasRole = $null
    try {
        $cmd1 = "cast call $address 'hasRole(bytes32,address)(bool)' $ADMIN_ROLE $OLD_WALLET --rpc-url $RPC_URL"
        $result = Invoke-Expression $cmd1 2>&1 | Out-String
        if ($result -match "true|0x0000000000000000000000000000000000000000000000000000000000000001") {
            $oldHasRole = $true
        } elseif ($result -match "false|0x0000000000000000000000000000000000000000000000000000000000000000") {
            $oldHasRole = $false
        }
        
        $cmd2 = "cast call $address 'hasRole(bytes32,address)(bool)' $ADMIN_ROLE $NEW_WALLET --rpc-url $RPC_URL"
        $result2 = Invoke-Expression $cmd2 2>&1 | Out-String
        if ($result2 -match "true|0x0000000000000000000000000000000000000000000000000000000000000001") {
            $newHasRole = $true
        } elseif ($result2 -match "false|0x0000000000000000000000000000000000000000000000000000000000000000") {
            $newHasRole = $false
        }
    } catch {
        # hasRole not available, try owner()
    }
    
    # Method 2: Check Ownable owner()
    $owner = $null
    if ($oldHasRole -eq $null) {
        try {
            $cmd3 = "cast call $address 'owner()(address)' --rpc-url $RPC_URL"
            $ownerResult = Invoke-Expression $cmd3 2>&1 | Out-String
            if ($ownerResult -match "(0x[a-fA-F0-9]{40})") {
                $owner = $matches[1]
            }
        } catch {
            # Neither hasRole nor owner available
        }
    }
    
    # Evaluate security status
    if ($oldHasRole -eq $true) {
        Write-Host "  ⛔ CRITICAL: Old compromised wallet HAS ADMIN ROLE" -ForegroundColor Red
        $criticalIssues += "$name ($address) - Old wallet has admin role"
    } elseif ($owner -eq $OLD_WALLET) {
        Write-Host "  ⛔ CRITICAL: Old compromised wallet IS OWNER" -ForegroundColor Red
        $criticalIssues += "$name ($address) - Old wallet is owner"
    } elseif ($newHasRole -eq $true) {
        Write-Host "  ✅ SECURE: New wallet has admin role" -ForegroundColor Green
        $secure += "$name ($address) - New wallet controls"
    } elseif ($owner -eq $NEW_WALLET) {
        Write-Host "  ✅ SECURE: New wallet is owner" -ForegroundColor Green
        $secure += "$name ($address) - New wallet controls"
    } elseif ($oldHasRole -eq $false -and $newHasRole -eq $false) {
        Write-Host "  ⚠️  WARNING: Neither wallet has admin role (check multisig/other owner)" -ForegroundColor Yellow
        $warnings += "$name ($address) - No wallet has admin"
    } elseif ($owner -ne $null -and $owner -ne $OLD_WALLET -and $owner -ne $NEW_WALLET) {
        Write-Host "  ⚠️  WARNING: Owned by third party: $owner" -ForegroundColor Yellow
        $warnings += "$name ($address) - Owner: $owner"
    } else {
        Write-Host "  ℹ️  INFO: No owner/admin detected (may use different pattern)" -ForegroundColor Cyan
    }
    
    Write-Host ""
}

# =============================================================================
# FINAL REPORT
# =============================================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                     SECURITY AUDIT SUMMARY                    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($criticalIssues.Count -gt 0) {
    Write-Host "⛔ CRITICAL SECURITY ISSUES FOUND: $($criticalIssues.Count)" -ForegroundColor Red
    Write-Host ""
    foreach ($issue in $criticalIssues) {
        Write-Host "  • $issue" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "ACTION REQUIRED: Transfer ownership or redeploy these contracts immediately!" -ForegroundColor Red
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  WARNINGS: $($warnings.Count)" -ForegroundColor Yellow
    Write-Host ""
    foreach ($warn in $warnings) {
        Write-Host "  • $warn" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($secure.Count -gt 0) {
    Write-Host "✅ SECURE CONTRACTS: $($secure.Count)" -ForegroundColor Green
    Write-Host ""
    foreach ($sec in $secure) {
        Write-Host "  • $sec" -ForegroundColor Green
    }
    Write-Host ""
}

Write-Host "Total Contracts Scanned: $($contracts.Count)" -ForegroundColor Cyan
Write-Host "  • Critical Issues: $($criticalIssues.Count)" -ForegroundColor $(if ($criticalIssues.Count -gt 0) {"Red"} else {"Green"})
Write-Host "  • Warnings: $($warnings.Count)" -ForegroundColor Yellow
Write-Host "  • Secure: $($secure.Count)" -ForegroundColor Green
Write-Host ""

# Export results to JSON
$auditReport = @{
    timestamp = Get-Date -Format "o"
    oldWallet = $OLD_WALLET
    newWallet = $NEW_WALLET
    criticalIssues = $criticalIssues
    warnings = $warnings
    secure = $secure
    totalScanned = $contracts.Count
}

$auditReport | ConvertTo-Json -Depth 3 | Out-File "security-audit-results.json" -Encoding UTF8
Write-Host "Detailed results exported to: security-audit-results.json" -ForegroundColor Cyan
Write-Host ""

# Exit code based on critical issues
if ($criticalIssues.Count -gt 0) {
    Write-Host "SECURITY STATUS: FAILED (Critical issues detected)" -ForegroundColor Red
    exit 1
} elseif ($warnings.Count -gt 0) {
    Write-Host "SECURITY STATUS: REVIEW NEEDED (Warnings present)" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "SECURITY STATUS: PASSED (All contracts secure)" -ForegroundColor Green
    exit 0
}
