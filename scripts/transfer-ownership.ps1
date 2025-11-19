# =============================================================================
# TRANSFER OWNERSHIP TO NEW SECURE WALLET
# =============================================================================
# This script transfers admin/owner rights from old compromised wallet to new wallet
# Old Wallet: 0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f (COMPROMISED)
# New Wallet: 0x8b288f5c273421FC3eD81Ef82D40C332452b6303 (SECURE)
# =============================================================================

$RPC = "https://sepolia.base.org"
$NEW_WALLET = "0x8b288f5c273421FC3eD81Ef82D40C332452b6303"
$DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"

Write-Host "`n=== OWNERSHIP TRANSFER PROCESS ===" -ForegroundColor Cyan
Write-Host "New Wallet: $NEW_WALLET" -ForegroundColor Green
Write-Host ""

# Contracts that need ownership transfer (AccessControl pattern)
$accessControlContracts = @(
    @{Name="VoidHookRouterV4"; Addr="0x687E678aB2152d9e0952d42B0F872604533D25a9"},
    @{Name="XPOracle"; Addr="0x8D786454ca2e252cb905f597214dD78C89E3Ba14"},
    @{Name="EscrowVault"; Addr="0x1A9b3fE46A6e2A9669D6d53fB58D562b97071FB7"},
    @{Name="MissionRegistry"; Addr="0x7C6BF84fd111A262CCdfEC885ba8677b3F3EE9c7"},
    @{Name="TokenExpansionOracle"; Addr="0x2B0CDb539682364e801757437e9fb8624eD50779"}
)

# Contracts that use Ownable pattern
$ownableContracts = @(
    @{Name="xVOIDVault"; Addr="0xab10B2B5E1b07447409BCa889d14F046bEFd8192"},
    @{Name="WorldLandTestnet"; Addr="0xC4559144b784A8991924b1389a726d68C910A206"},
    @{Name="VoidSwapTestnet"; Addr="0x74bD32c493C9be6237733507b00592e6AB231e4F"}
)

Write-Host "=== STEP 1: Transfer AccessControl Admin Roles ===" -ForegroundColor Yellow
Write-Host ""

foreach ($c in $accessControlContracts) {
    Write-Host "[$($c.Name)]" -ForegroundColor White
    Write-Host "  Address: $($c.Addr)" -ForegroundColor Gray
    
    # Grant admin role to new wallet
    Write-Host "  Granting admin role to new wallet..." -ForegroundColor Cyan
    $cmd = "cast send $($c.Addr) 'grantRole(bytes32,address)' $DEFAULT_ADMIN_ROLE $NEW_WALLET --rpc-url $RPC --private-key `$env:DEPLOYER_PRIVATE_KEY"
    Write-Host "  Command: $cmd" -ForegroundColor DarkGray
    
    $result = Invoke-Expression $cmd 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  SUCCESS: Admin role granted" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: Failed to grant role" -ForegroundColor Red
        Write-Host "  $result" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== STEP 2: Transfer Ownable Ownership ===" -ForegroundColor Yellow
Write-Host ""

foreach ($c in $ownableContracts) {
    Write-Host "[$($c.Name)]" -ForegroundColor White
    Write-Host "  Address: $($c.Addr)" -ForegroundColor Gray
    
    # Transfer ownership to new wallet
    Write-Host "  Transferring ownership to new wallet..." -ForegroundColor Cyan
    $cmd = "cast send $($c.Addr) 'transferOwnership(address)' $NEW_WALLET --rpc-url $RPC --private-key `$env:DEPLOYER_PRIVATE_KEY"
    Write-Host "  Command: $cmd" -ForegroundColor DarkGray
    
    $result = Invoke-Expression $cmd 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  SUCCESS: Ownership transferred" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: Failed to transfer" -ForegroundColor Red
        Write-Host "  $result" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== STEP 3: Verification ===" -ForegroundColor Yellow
Write-Host "Running ownership audit to verify changes..." -ForegroundColor Cyan
Write-Host ""

.\scripts\audit-ownership.ps1

Write-Host "`n=== OWNERSHIP TRANSFER COMPLETE ===" -ForegroundColor Green
Write-Host "Check the audit results above to verify all transfers succeeded." -ForegroundColor White
