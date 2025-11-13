# VOID TESTNET DEPLOYMENT - FINAL CHECK
# Quick verification before deploying to Base Sepolia
# Run: .\deployment\testnet-ready.ps1

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  VOID TESTNET DEPLOYMENT - READINESS CHECK" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Target: Base Sepolia (Chain ID 84532)`n" -ForegroundColor Green

$checks = @()

# Check 1: .env file
Write-Host "[1/7] .env Configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  OK - .env file exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "  ERROR - .env file missing!" -ForegroundColor Red
    Write-Host "  Action: Copy .env.example to .env" -ForegroundColor Yellow
    $checks += $false
}

# Check 2: Node.js
Write-Host "`n[2/7] Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  OK - $nodeVersion" -ForegroundColor Green
    $checks += $true
} catch {
    Write-Host "  ERROR - Node.js not installed" -ForegroundColor Red
    $checks += $false
}

# Check 3: Dependencies
Write-Host "`n[3/7] Dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  OK - node_modules exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "  WARN - Run: npm install" -ForegroundColor Yellow
    $checks += $false
}

# Check 4: Build
Write-Host "`n[4/7] Build..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Write-Host "  OK - Build exists (.next folder)" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "  WARN - Run: npm run build" -ForegroundColor Yellow
    $checks += $false
}

# Check 5: Hardhat config (if contracts exist)
Write-Host "`n[5/7] Smart Contracts..." -ForegroundColor Yellow
if (Test-Path "contracts") {
    if (Test-Path "hardhat.config.cts") {
        Write-Host "  OK - Hardhat configured" -ForegroundColor Green
        $checks += $true
    } else {
        Write-Host "  WARN - hardhat.config.cts missing" -ForegroundColor Yellow
        $checks += $false
    }
} else {
    Write-Host "  SKIP - No contracts directory" -ForegroundColor Gray
    $checks += $true
}

# Check 6: Documentation
Write-Host "`n[6/7] Documentation..." -ForegroundColor Yellow
if (Test-Path "PHASE-5-STARTUP.md") {
    Write-Host "  OK - PHASE-5-STARTUP.md exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "  WARN - Missing deployment guide" -ForegroundColor Yellow
    $checks += $false
}

# Check 7: Demo integrity
Write-Host "`n[7/7] Demo System..." -ForegroundColor Yellow
if (Test-Path "lib/demoIntegrity.ts") {
    Write-Host "  OK - Demo protection active" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "  WARN - Demo integrity missing" -ForegroundColor Yellow
    $checks += $false
}

# Summary
$passedChecks = ($checks | Where-Object { $_ -eq $true }).Count
$totalChecks = $checks.Count
$percentage = [math]::Round(($passedChecks / $totalChecks) * 100)

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  READINESS SCORE: $passedChecks/$totalChecks ($percentage%)" -ForegroundColor $(if ($percentage -ge 80) { "Green" } elseif ($percentage -ge 60) { "Yellow" } else { "Red" })
Write-Host "=================================================================`n" -ForegroundColor Cyan

if ($percentage -ge 80) {
    Write-Host "STATUS: READY FOR DEPLOYMENT" -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Cyan
    Write-Host "  1. Ensure wallet has 0.1+ Sepolia ETH" -ForegroundColor Gray
    Write-Host "     Get ETH: https://www.coinbase.com/faucets" -ForegroundColor Gray
    Write-Host "  2. Deploy frontend to Vercel:" -ForegroundColor Gray
    Write-Host "     npm i -g vercel && vercel --prod" -ForegroundColor Gray
    Write-Host "  3. Deploy contracts (if needed):" -ForegroundColor Gray
    Write-Host "     npx hardhat run scripts/deploy-*.ts --network baseSepolia" -ForegroundColor Gray
    Write-Host "  4. Read PHASE-5-STARTUP.md for full guide`n" -ForegroundColor Gray
} elseif ($percentage -ge 60) {
    Write-Host "STATUS: MOSTLY READY (warnings present)" -ForegroundColor Yellow
    Write-Host "Action: Fix warnings above before deploying`n" -ForegroundColor Yellow
} else {
    Write-Host "STATUS: NOT READY" -ForegroundColor Red
    Write-Host "Action: Fix errors above before deploying`n" -ForegroundColor Red
}

Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  PHASE-5-STARTUP.md - Full deployment guide" -ForegroundColor Gray
Write-Host "  DEMO-SCRIPT-SUITE.md - Demo scripts" -ForegroundColor Gray
Write-Host "  PHASE-4.6-VERIFICATION.md - Regression report`n" -ForegroundColor Gray
