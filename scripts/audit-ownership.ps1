# CONTRACT OWNERSHIP SECURITY AUDIT
# Old Wallet (COMPROMISED): 0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f  
# New Wallet (SECURE): 0x8b288f5c273421FC3eD81Ef82D40C332452b6303

$RPC = "https://sepolia.base.org"
$OLD = "0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f"
$NEW = "0x8b288f5c273421FC3eD81Ef82D40C332452b6303"
$ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"

Write-Host "`n=== CONTRACT OWNERSHIP SECURITY AUDIT ===" -ForegroundColor Cyan
Write-Host "Checking all Base Sepolia contracts...`n" -ForegroundColor Yellow

$critical = @()
$secure = @()
$warnings = @()

# All contracts
$contracts = @(
    @{Name="VOID Token"; Addr="0x8de4043445939B0D0Cc7d6c752057707279D9893"},
    @{Name="PSX Token"; Addr="0x9E08A4291771d18ce9718A3Ce8adE6DC82113CC7"},
    @{Name="CREATE Token"; Addr="0x99908B6127f45A0D4730a42DE8b4b74D313F956D"},
    @{Name="AGENCY Token"; Addr="0xb270007B1D6EBbeF505612D8b3C779A536A7227b"},
    @{Name="SIGNAL Token"; Addr="0x29c4172C243860f906C9625c983aE93F1147504B"},
    @{Name="VoidHookRouterV4 (NEW)"; Addr="0x5Af0681159512a803c150aF2FB59c62F11251683"},
    @{Name="XPOracle (NEW)"; Addr="0x2D4C5eE574F82a292bd9a79D14D1F4e239fcC205"},
    @{Name="EscrowVault (NEW)"; Addr="0x39755d949A56032f177F031DC9695Ca064C32CF4"},
    @{Name="xVOIDVault (NEW)"; Addr="0xaAA3F9d248bad4755387855774C3891Fb8Aacf47"},
    @{Name="MissionRegistry (NEW)"; Addr="0x32dFBaC3D6Bf98956e6A0c35Da054F05D8167172"},
    @{Name="TokenExpansionOracle (NEW)"; Addr="0xf2e437eF0538703b004783BA0Ec2e9D9AE283355"},
    @{Name="WorldLandTestnet (NEW)"; Addr="0x8a2CF5e1832a54A9d1Ae1c118b92a96Cab1e4E27"},
    @{Name="VoidSwapTestnet (NEW)"; Addr="0x3e590eb3fDEBf94E1c738C053E2FCa165370F4B3"},
    @{Name="VoidBurnUtility"; Addr="0x74cab4eefe359473f19BCcc7Fbba2fe5e37182Ee"},
    @{Name="DistrictAccessBurn"; Addr="0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760"},
    @{Name="LandUpgradeBurn"; Addr="0xb8eFf99c68BAA1AbABecFdd3F9d1Ba7e2673Ef80"},
    @{Name="CreatorToolsBurn"; Addr="0xeD63e3C9cEa4df1325899594dCc2f5Da6Fd13aEe"},
    @{Name="PrestigeBurn"; Addr="0xD8D8004C8292e3c9aDE1d5981400fFB56c9589ce"},
    @{Name="MiniAppBurnAccess"; Addr="0x9D233e943200Bb85F26232679905038CBa52C1d4"},
    @{Name="AIUtilityGovernor"; Addr="0x6CadC07B981a2D91d627c8D64f30B81067e6101D"}
)

foreach ($c in $contracts) {
    Write-Host "[$($c.Name)]" -NoNewline
    Write-Host " $($c.Addr)" -ForegroundColor Gray
    
    # Check hasRole
    $cmd = "cast call $($c.Addr) 'hasRole(bytes32,address)(bool)' $ROLE $OLD --rpc-url $RPC"
    $oldRole = Invoke-Expression $cmd 2>&1 | Out-String
    
    $cmd = "cast call $($c.Addr) 'hasRole(bytes32,address)(bool)' $ROLE $NEW --rpc-url $RPC"
    $newRole = Invoke-Expression $cmd 2>&1 | Out-String
    
    # Check owner
    $cmd = "cast call $($c.Addr) 'owner()(address)' --rpc-url $RPC"
    $owner = Invoke-Expression $cmd 2>&1 | Out-String
    
    # Evaluate
    if ($oldRole -match "true|0x0000000000000000000000000000000000000000000000000000000000000001") {
        Write-Host "  [!] CRITICAL: Old wallet has admin" -ForegroundColor Red
        $critical += $c.Name
    }
    elseif ($owner -match $OLD) {
        Write-Host "  [!] CRITICAL: Old wallet is owner" -ForegroundColor Red
        $critical += $c.Name
    }
    elseif ($newRole -match "true|0x0000000000000000000000000000000000000000000000000000000000000001") {
        Write-Host "  [+] SECURE: New wallet has admin" -ForegroundColor Green
        $secure += $c.Name
    }
    elseif ($owner -match $NEW) {
        Write-Host "  [+] SECURE: New wallet is owner" -ForegroundColor Green
        $secure += $c.Name
    }
    elseif ($owner -match "0x[a-fA-F0-9]{40}") {
        $third = ($owner -replace ".*?(0x[a-fA-F0-9]{40}).*", '$1')
        Write-Host "  [?] Third party owner: $third" -ForegroundColor Yellow
        $warnings += $c.Name
    }
    else {
        Write-Host "  [-] No owner/admin pattern detected" -ForegroundColor Cyan
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total: $($contracts.Count)" -ForegroundColor White
Write-Host "Critical: $($critical.Count)" -ForegroundColor $(if ($critical.Count -gt 0) {"Red"} else {"Green"})
Write-Host "Secure: $($secure.Count)" -ForegroundColor Green
Write-Host "Warnings: $($warnings.Count)" -ForegroundColor Yellow

if ($critical.Count -gt 0) {
    Write-Host "`n[!] CRITICAL ISSUES:" -ForegroundColor Red
    $critical | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "`nACTION REQUIRED: Transfer ownership or redeploy!" -ForegroundColor Red
}

@{
    timestamp = Get-Date -Format "o"
    critical = $critical
    secure = $secure
    warnings = $warnings
} | ConvertTo-Json | Out-File "security-audit-results.json"

Write-Host "`nResults saved to security-audit-results.json" -ForegroundColor Cyan
