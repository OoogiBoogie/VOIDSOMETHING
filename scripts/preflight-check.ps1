#!/usr/bin/env pwsh
<#
.SYNOPSIS
Pre-flight validation before E2E testing session.

.DESCRIPTION
Checks all prerequisites are met:
- .env.local has required vars
- Core contracts deployed on Base Sepolia
- Dev server dependencies installed
- TypeScript compiles without errors

.EXAMPLE
.\scripts\preflight-check.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "🚦 PSX VOID - Pre-Flight Validation" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Gray
Write-Host ""

$failures = @()

# 1. Check .env.local exists
Write-Host "📋 Checking environment configuration..." -ForegroundColor Yellow
if (-Not (Test-Path ".env.local")) {
    $failures += ".env.local not found"
    Write-Host "  ❌ .env.local missing" -ForegroundColor Red
} else {
    $envContent = Get-Content ".env.local" -Raw
    
    # Check required vars
    $requiredVars = @(
        "NEXT_PUBLIC_PRIVY_APP_ID",
        "NEXT_PUBLIC_BASE_RPC_URL",
        "NEXT_PUBLIC_CHAIN_ID",
        "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"
    )
    
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch $var) {
            $failures += "Missing env var: $var"
            Write-Host "  ❌ $var not set" -ForegroundColor Red
        } elseif ($envContent -match "$var=`"?demo-" -or $envContent -match "$var=`"?placeholder-" -or $envContent -match "$var=`"?ci-") {
            Write-Host "  ⚠️  $var uses placeholder value" -ForegroundColor Yellow
        } else {
            Write-Host "  ✅ $var configured" -ForegroundColor Green
        }
    }
}

Write-Host ""

# 2. Check Node modules
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
if (-Not (Test-Path "node_modules")) {
    $failures += "node_modules not found - run npm install"
    Write-Host "  ❌ Dependencies not installed" -ForegroundColor Red
} else {
    Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
}

Write-Host ""

# 3. Check contracts on Base Sepolia
Write-Host "🔗 Validating contract deployments..." -ForegroundColor Yellow

$rpc = "https://sepolia.base.org"
$contracts = @{
    "VOID" = "0x8de4043445939B0D0Cc7d6c752057707279D9893"
    "USDC" = "0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9"
    "xVOIDVault" = "0xab10B2B5E1b07447409BCa889d14F046bEFd8192"
    "XPOracle" = "0x8D786454ca2e252cb905f597214dD78C89E3Ba14"
    "VoidSwapTestnet" = "0x74bD32c493C9be6237733507b00592e6AB231e4F"
    "VoidHookRouterV4" = "0x687E678aB2152d9e0952d42B0F872604533D25a9"
    "WorldLandTestnet" = "0xC4559144b784A8991924b1389a726d68C910A206"
}

foreach ($contract in $contracts.GetEnumerator()) {
    try {
        # Check if contract has code
        $code = cast code $contract.Value --rpc-url $rpc 2>$null
        if ([string]::IsNullOrWhiteSpace($code) -or $code -eq "0x") {
            $failures += "$($contract.Key) not deployed"
            Write-Host "  ❌ $($contract.Key) has no code" -ForegroundColor Red
        } else {
            Write-Host "  ✅ $($contract.Key) deployed" -ForegroundColor Green
        }
    } catch {
        $failures += "$($contract.Key) validation failed"
        Write-Host "  ⚠️  $($contract.Key) check failed" -ForegroundColor Yellow
    }
}

Write-Host ""

# 4. TypeScript validation
Write-Host "🔍 Type checking core files..." -ForegroundColor Yellow

$coreFiles = @(
    "hud/tabs/WalletTab.tsx",
    "hud/tabs/SwapTab.tsx",
    "hud/tabs/LandTab.tsx",
    "lib/wagmiConfig.ts",
    "hooks/useChainGuard.ts"
)

$tscErrors = $false
foreach ($file in $coreFiles) {
    try {
        $result = npx tsc --noEmit --skipLibCheck $file 2>&1
        if ($LASTEXITCODE -ne 0) {
            $tscErrors = $true
            Write-Host "  ⚠️  $file has type errors" -ForegroundColor Yellow
        } else {
            Write-Host "  ✅ $file compiles" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️  $file check skipped" -ForegroundColor Yellow
    }
}

Write-Host ""

# 5. Check helper scripts exist
Write-Host "🛠️  Checking test utilities..." -ForegroundColor Yellow

$scripts = @(
    "scripts/test-fee-routing.ps1",
    "scripts/cast/Get-TokenBalance.ps1",
    "scripts/cast/Get-ParcelsOwnedBy.ps1",
    "scripts/qa-log.ts"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "  ✅ $script exists" -ForegroundColor Green
    } else {
        $failures += "Missing script: $script"
        Write-Host "  ❌ $script not found" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Gray

# Summary
if ($failures.Count -eq 0 -and -not $tscErrors) {
    Write-Host ""
    Write-Host "✅ PRE-FLIGHT COMPLETE - ALL SYSTEMS GO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to start E2E testing session." -ForegroundColor Cyan
    Write-Host "Run: npm run dev" -ForegroundColor Gray
    Write-Host ""
    exit 0
} else {
    Write-Host ""
    Write-Host "⚠️  PRE-FLIGHT WARNINGS DETECTED" -ForegroundColor Yellow
    Write-Host ""
    
    if ($failures.Count -gt 0) {
        Write-Host "Failures:" -ForegroundColor Red
        foreach ($failure in $failures) {
            Write-Host "  - $failure" -ForegroundColor Red
        }
    }
    
    if ($tscErrors) {
        Write-Host "  - TypeScript errors detected (may be non-blocking)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "You can proceed with E2E testing, but some features may not work." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
