# VOID Seasonal Burn System - Deployment Script
# Deploy all seasonal contracts in correct order

param(
    [Parameter(Mandatory=$false)]
    [string]$Network = "baseSepolia",
    
    [Parameter(Mandatory=$false)]
    [string]$VoidTokenAddress = "0x8de4043445939B0D0Cc7d6c752057707279D9893"
)

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "VOID SEASONAL BURN SYSTEM - DEPLOYMENT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Network: $Network" -ForegroundColor Yellow
Write-Host "VOID Token: $VoidTokenAddress" -ForegroundColor Yellow
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    exit 1
}

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

Write-Host "Step 1: Deploying VoidBurnUtilitySeasonal..." -ForegroundColor Green
Write-Host "  - Initializes Season 0 (90-day duration)" -ForegroundColor Gray
Write-Host "  - Daily credit cap: 6k VOID" -ForegroundColor Gray
Write-Host "  - Seasonal credit cap: 100k VOID" -ForegroundColor Gray
Write-Host ""

$deployCmd1 = "npx hardhat run scripts/deploy-seasonal/01-deploy-burn-utility.ts --network $Network"
Invoke-Expression $deployCmd1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy VoidBurnUtilitySeasonal" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Deploying XPRewardSystemSeasonal..." -ForegroundColor Green
Write-Host "  - Seasonal XP tracking" -ForegroundColor Gray
Write-Host "  - Lifetime level progression" -ForegroundColor Gray
Write-Host "  - Airdrop weight calculation" -ForegroundColor Gray
Write-Host ""

$deployCmd2 = "npx hardhat run scripts/deploy-seasonal/02-deploy-xp-system.ts --network $Network"
Invoke-Expression $deployCmd2

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy XPRewardSystemSeasonal" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Deploying Module Contracts..." -ForegroundColor Green
Write-Host ""

Write-Host "  3a: DistrictAccessBurnSeasonal..." -ForegroundColor Cyan
$deployCmd3a = "npx hardhat run scripts/deploy-seasonal/03a-deploy-district.ts --network $Network"
Invoke-Expression $deployCmd3a

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy DistrictAccessBurnSeasonal" -ForegroundColor Red
    exit 1
}

Write-Host "  3b: LandUpgradeBurnSeasonal..." -ForegroundColor Cyan
$deployCmd3b = "npx hardhat run scripts/deploy-seasonal/03b-deploy-land.ts --network $Network"
Invoke-Expression $deployCmd3b

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy LandUpgradeBurnSeasonal" -ForegroundColor Red
    exit 1
}

Write-Host "  3c: CreatorToolsBurnSeasonal..." -ForegroundColor Cyan
$deployCmd3c = "npx hardhat run scripts/deploy-seasonal/03c-deploy-creator.ts --network $Network"
Invoke-Expression $deployCmd3c

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy CreatorToolsBurnSeasonal" -ForegroundColor Red
    exit 1
}

Write-Host "  3d: PrestigeBurnSeasonal..." -ForegroundColor Cyan
$deployCmd3d = "npx hardhat run scripts/deploy-seasonal/03d-deploy-prestige.ts --network $Network"
Invoke-Expression $deployCmd3d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy PrestigeBurnSeasonal" -ForegroundColor Red
    exit 1
}

Write-Host "  3e: MiniAppBurnAccessSeasonal..." -ForegroundColor Cyan
$deployCmd3e = "npx hardhat run scripts/deploy-seasonal/03e-deploy-miniapp.ts --network $Network"
Invoke-Expression $deployCmd3e

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy MiniAppBurnAccessSeasonal" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 4: Configuring Roles..." -ForegroundColor Green
Write-Host "  - Granting BURN_MANAGER_ROLE to module contracts" -ForegroundColor Gray
Write-Host "  - Granting XP_MANAGER_ROLE to XP system" -ForegroundColor Gray
Write-Host ""

$configCmd = "npx hardhat run scripts/deploy-seasonal/04-configure-roles.ts --network $Network"
Invoke-Expression $configCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to configure roles" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployed Contracts:" -ForegroundColor Yellow
Write-Host "  - VoidBurnUtilitySeasonal" -ForegroundColor White
Write-Host "  - XPRewardSystemSeasonal" -ForegroundColor White
Write-Host "  - DistrictAccessBurnSeasonal" -ForegroundColor White
Write-Host "  - LandUpgradeBurnSeasonal" -ForegroundColor White
Write-Host "  - CreatorToolsBurnSeasonal" -ForegroundColor White
Write-Host "  - PrestigeBurnSeasonal" -ForegroundColor White
Write-Host "  - MiniAppBurnAccessSeasonal" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Verify contracts on BaseScan" -ForegroundColor Gray
Write-Host "  2. Update frontend with new contract addresses" -ForegroundColor Gray
Write-Host "  3. Run QA test suite (SEASONAL-QA-TEST-PLAN.md)" -ForegroundColor Gray
Write-Host "  4. Monitor Season 0 progress" -ForegroundColor Gray
Write-Host ""
Write-Host "Season 0 Info:" -ForegroundColor Yellow
Write-Host "  - Start: $(Get-Date)" -ForegroundColor Gray
Write-Host "  - End: $(Get-Date).AddDays(90)" -ForegroundColor Gray
Write-Host "  - Daily Cap: 6,000 VOID → XP" -ForegroundColor Gray
Write-Host "  - Season Cap: 100,000 VOID → XP" -ForegroundColor Gray
Write-Host ""
