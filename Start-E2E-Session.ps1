#!/usr/bin/env pwsh
<#
.SYNOPSIS
Quick-start E2E testing session.

.DESCRIPTION
Runs pre-flight checks and starts dev server for E2E testing.

.EXAMPLE
.\Start-E2E-Session.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🚀 PSX VOID - E2E Testing Quick Start" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Gray
Write-Host ""

# Step 1: Pre-flight checks
Write-Host "1️⃣  Running pre-flight validation..." -ForegroundColor Yellow
Write-Host ""

try {
    & .\scripts\preflight-check.ps1
    $preflightStatus = $LASTEXITCODE
} catch {
    Write-Host "⚠️  Pre-flight check failed, but continuing..." -ForegroundColor Yellow
    $preflightStatus = 1
}

Write-Host ""

# Step 2: Instructions
Write-Host "2️⃣  E2E Testing Instructions" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 Full Guide: E2E-TESTING-SESSION.md" -ForegroundColor Cyan
Write-Host "📝 Results Template: E2E-RESULTS-TEMPLATE.md" -ForegroundColor Cyan
Write-Host ""

# Step 3: Environment reminder
Write-Host "3️⃣  Environment Check" -ForegroundColor Yellow
Write-Host ""

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    Write-Host "Current Configuration:" -ForegroundColor Gray
    
    if ($envContent -match "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo-project-id") {
        Write-Host "  ⚠️  WalletConnect: Using demo-project-id" -ForegroundColor Yellow
        Write-Host "     Get real ID from: https://cloud.walletconnect.com" -ForegroundColor Gray
    } else {
        Write-Host "  ✅ WalletConnect: Configured" -ForegroundColor Green
    }
    
    if ($envContent -match "NEXT_PUBLIC_CHAIN_ID=84532") {
        Write-Host "  ✅ Chain: Base Sepolia (84532)" -ForegroundColor Green
    }
    
    if ($envContent -match "NEXT_PUBLIC_PRIVY_APP_ID=cmhuzn78p003jib0cqs67hz07") {
        Write-Host "  ✅ Privy: Configured" -ForegroundColor Green
    }
}

Write-Host ""

# Step 4: Helper commands
Write-Host "4️⃣  Useful Commands" -ForegroundColor Yellow
Write-Host ""
Write-Host "Start dev server:" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run fee routing test:" -ForegroundColor Gray
Write-Host "  `$env:PRIVATE_KEY = '0xYourKey'" -ForegroundColor Cyan
Write-Host "  `$env:MY_ADDRESS = '0xYourAddress'" -ForegroundColor Cyan
Write-Host "  .\scripts\test-fee-routing.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check token balance:" -ForegroundColor Gray
Write-Host "  .\scripts\cast\Get-TokenBalance.ps1 -Token <addr> -Holder <addr>" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check owned parcels:" -ForegroundColor Gray
Write-Host "  .\scripts\cast\Get-ParcelsOwnedBy.ps1 -Address <your_addr>" -ForegroundColor Cyan
Write-Host ""

# Step 5: Enable FPS badge
Write-Host "5️⃣  Optional: Enable FPS Badge" -ForegroundColor Yellow
Write-Host ""
Write-Host "Add to .env.local:" -ForegroundColor Gray
Write-Host "  NEXT_PUBLIC_SHOW_FPS=1" -ForegroundColor Cyan
Write-Host ""

# Step 6: Ready prompt
Write-Host "======================================" -ForegroundColor Gray
Write-Host ""

if ($preflightStatus -eq 0) {
    Write-Host "✅ All pre-flight checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Ready to start E2E testing." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: npm run dev" -ForegroundColor Gray
    Write-Host "  2. Open browser: http://localhost:3000" -ForegroundColor Gray
    Write-Host "  3. Follow: E2E-TESTING-SESSION.md" -ForegroundColor Gray
    Write-Host "  4. Fill out: E2E-RESULTS-TEMPLATE.md" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "⚠️  Pre-flight warnings detected." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can proceed with testing, but:" -ForegroundColor Gray
    Write-Host "  - Some features may not work as expected" -ForegroundColor Gray
    Write-Host "  - Fix critical issues before production deployment" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Continue? [Y/n]: " -NoNewline -ForegroundColor Yellow
    $continue = Read-Host
    
    if ($continue -eq "" -or $continue -eq "Y" -or $continue -eq "y") {
        Write-Host ""
        Write-Host "Proceeding with E2E testing..." -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Aborted. Fix pre-flight issues and try again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Happy testing! 🧪" -ForegroundColor Cyan
Write-Host ""
