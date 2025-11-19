# Deploy all 4 updated burn contracts
# Usage: .\deploy-burn-contracts.ps1

Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "       BURN CONTRACTS DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Configuration
$voidBurnUtility = "0xD925f913E2636f19D0D434B3caCDd05b6659c7bc"
$rpcUrl = "https://sepolia.base.org"

# Prompt for private key securely
Write-Host "****************************************************************:" -ForegroundColor Yellow
$secureKey = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
$privKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

if (-not $privKey) {
    Write-Host "Error: No private key provided" -ForegroundColor Red
    exit 1
}

Write-Host "`nDeploying to Base Sepolia..." -ForegroundColor Green
Write-Host "VoidBurnUtility: $voidBurnUtility`n" -ForegroundColor Gray

# Deploy LandUpgradeBurn
Write-Host "[1/4] Deploying LandUpgradeBurn..." -ForegroundColor Yellow
$land = forge create contracts/utility-burn/LandUpgradeBurn.sol:LandUpgradeBurn `
    --rpc-url $rpcUrl `
    --private-key $privKey `
    --constructor-args $voidBurnUtility `
    --legacy 2>&1

$landAddr = ($land | Select-String "Deployed to:" | ForEach-Object { $_ -replace ".*: ", "" }).Trim()
Write-Host "✓ LandUpgradeBurn: $landAddr" -ForegroundColor Green

# Deploy CreatorToolsBurn
Write-Host "`n[2/4] Deploying CreatorToolsBurn..." -ForegroundColor Yellow
$creator = forge create contracts/utility-burn/CreatorToolsBurn.sol:CreatorToolsBurn `
    --rpc-url $rpcUrl `
    --private-key $privKey `
    --constructor-args $voidBurnUtility `
    --legacy 2>&1

$creatorAddr = ($creator | Select-String "Deployed to:" | ForEach-Object { $_ -replace ".*: ", "" }).Trim()
Write-Host "✓ CreatorToolsBurn: $creatorAddr" -ForegroundColor Green

# Deploy PrestigeBurn
Write-Host "`n[3/4] Deploying PrestigeBurn..." -ForegroundColor Yellow
$prestige = forge create contracts/utility-burn/PrestigeBurn.sol:PrestigeBurn `
    --rpc-url $rpcUrl `
    --private-key $privKey `
    --constructor-args $voidBurnUtility `
    --legacy 2>&1

$prestigeAddr = ($prestige | Select-String "Deployed to:" | ForEach-Object { $_ -replace ".*: ", "" }).Trim()
Write-Host "✓ PrestigeBurn: $prestigeAddr" -ForegroundColor Green

# Deploy MiniAppBurnAccess
Write-Host "`n[4/4] Deploying MiniAppBurnAccess..." -ForegroundColor Yellow
$miniapp = forge create contracts/utility-burn/MiniAppBurnAccess.sol:MiniAppBurnAccess `
    --rpc-url $rpcUrl `
    --private-key $privKey `
    --constructor-args $voidBurnUtility `
    --legacy 2>&1

$miniappAddr = ($miniapp | Select-String "Deployed to:" | ForEach-Object { $_ -replace ".*: ", "" }).Trim()
Write-Host "✓ MiniAppBurnAccess: $miniappAddr" -ForegroundColor Green

# Summary
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "       DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Deployed Addresses:" -ForegroundColor Yellow
Write-Host "VoidBurnUtility:     $voidBurnUtility" -ForegroundColor White
Write-Host "DistrictAccessBurn:  0xFd27bb738c82F58c0714E5e9a4d8F7c7e8abe841" -ForegroundColor White
Write-Host "LandUpgradeBurn:     $landAddr" -ForegroundColor White
Write-Host "CreatorToolsBurn:    $creatorAddr" -ForegroundColor White
Write-Host "PrestigeBurn:        $prestigeAddr" -ForegroundColor White
Write-Host "MiniAppBurnAccess:   $miniappAddr" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Update .env.local with new addresses" -ForegroundColor Gray
Write-Host "2. Grant BURN_MANAGER_ROLE to each contract" -ForegroundColor Gray
Write-Host "3. Continue QA testing with T2-T5 suites" -ForegroundColor Gray

# Clear private key from memory
$privKey = $null
