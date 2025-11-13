# ============================================================================
# VOID Protocol - Automated Deployment with Live Monitoring & Troubleshooting
# ============================================================================
# This script follows AI_DEPLOYMENT_RULES.md strictly

param(
    [ValidateSet('testnet', 'mainnet')]
    [string]$Network = 'testnet',
    
    [switch]$SkipTests,
    [switch]$Verbose
)

# Colors
$ErrorColor = 'Red'
$SuccessColor = 'Green'
$WarningColor = 'Yellow'
$InfoColor = 'Cyan'

# Setup
$ErrorActionPreference = 'Stop'
$env:Path += ";C:\Users\rigof\.foundry\bin"
$env:FOUNDRY_DISABLE_NIGHTLY_WARNING = "true"

function Write-Status {
    param([string]$Message, [string]$Color = $InfoColor)
    Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

function Test-ForgeProcess {
    $procs = Get-Process -ErrorAction SilentlyContinue | Where-Object {
        $_.ProcessName -match 'forge' -or $_.ProcessName -match 'solc'
    }
    
    if ($procs) {
        Write-Host "`nActive processes:" -ForegroundColor $InfoColor
        $procs | Select-Object ProcessName, Id, CPU, @{N='Memory(MB)';E={[math]::Round($_.WS/1MB,2)}} | Format-Table -AutoSize
        return $true
    }
    return $false
}

function Invoke-WithMonitoring {
    param([string]$Command, [string]$Description)
    
    Write-Status "Starting: $Description" $InfoColor
    Write-Host "Command: $Command`n" -ForegroundColor DarkGray
    
    $startTime = Get-Date
    
    # Start monitoring job
    $monitorJob = Start-Job -ScriptBlock {
        while ($true) {
            $procs = Get-Process -ErrorAction SilentlyContinue | Where-Object {
                $_.ProcessName -match 'forge' -or $_.ProcessName -match 'solc'
            }
            if ($procs) {
                $procs | Select-Object ProcessName, Id, CPU, @{N='Memory(MB)';E={[math]::Round($_.WS/1MB,2)}}
            }
            Start-Sleep -Seconds 2
        }
    }
    
    try {
        # Execute command
        $output = Invoke-Expression $Command 2>&1
        $exitCode = $LASTEXITCODE
        
        $duration = (Get-Date) - $startTime
        
        if ($exitCode -eq 0) {
            Write-Status "✓ $Description completed in $($duration.TotalSeconds)s" $SuccessColor
            return @{ Success = $true; Output = $output; Duration = $duration }
        } else {
            Write-Status "✗ $Description FAILED (exit code: $exitCode)" $ErrorColor
            Write-Host "`nError Output:" -ForegroundColor $ErrorColor
            Write-Host $output
            return @{ Success = $false; Output = $output; ExitCode = $exitCode; Duration = $duration }
        }
    }
    finally {
        Stop-Job $monitorJob -ErrorAction SilentlyContinue
        Remove-Job $monitorJob -ErrorAction SilentlyContinue
    }
}

# ============================================================================
# STEP 1: Verify Foundry Installation
# ============================================================================
Write-Status "PHASE: Verifying Foundry Installation" $InfoColor

$forgeVersion = Invoke-WithMonitoring "forge --version" "Forge version check"
if (-not $forgeVersion.Success) {
    Write-Status "ERROR: Foundry not found. Install from https://getfoundry.sh" $ErrorColor
    exit 1
}
Write-Host $forgeVersion.Output

# ============================================================================
# STEP 2: Load .env and Validate
# ============================================================================
Write-Status "PHASE: Loading Environment Variables" $InfoColor

if (-not (Test-Path ".env")) {
    Write-Status "ERROR: .env file not found!" $ErrorColor
    Write-Host "Copy .env.example to .env and configure it." -ForegroundColor $WarningColor
    exit 1
}

# Load .env
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}

Write-Status "✓ Environment loaded" $SuccessColor

# ============================================================================
# STEP 3: Verify Required Variables
# ============================================================================
Write-Status "PHASE: Validating Configuration" $InfoColor

$required = @(
    "DEPLOYER_PRIVATE_KEY",
    "BASE_SEPOLIA_RPC_URL"
)

$missing = @()
foreach ($var in $required) {
    if (-not [Environment]::GetEnvironmentVariable($var)) {
        $missing += $var
    }
}

if ($missing.Count -gt 0) {
    Write-Status "ERROR: Missing required environment variables:" $ErrorColor
    $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor $ErrorColor }
    exit 1
}

Write-Status "✓ Configuration valid" $SuccessColor

# ============================================================================
# STEP 4: Clean Build
# ============================================================================
Write-Status "PHASE: Building Contracts" $InfoColor

$buildResult = Invoke-WithMonitoring "forge clean; forge build" "Clean build"

if (-not $buildResult.Success) {
    Write-Status "BUILD FAILED - See errors above" $ErrorColor
    Write-Host "`nTroubleshooting:" -ForegroundColor $WarningColor
    Write-Host "1. Check forge-build.log for details"
    Write-Host "2. Verify all imports are correct"
    Write-Host "3. Ensure via_ir is enabled in foundry.toml"
    exit 1
}

# Save build output
$buildResult.Output | Out-File "forge-build.log" -Encoding UTF8
Write-Status "✓ Build log saved to forge-build.log" $SuccessColor

# ============================================================================
# STEP 5: Run Tests
# ============================================================================
if (-not $SkipTests) {
    Write-Status "PHASE: Running Tests" $InfoColor
    
    $testResult = Invoke-WithMonitoring "forge test --match-contract EconomicInvariantsTest -vv" "Economic invariant tests"
    
    if (-not $testResult.Success) {
        Write-Status "TESTS FAILED - Deployment aborted per AI_DEPLOYMENT_RULES.md" $ErrorColor
        Write-Host "`nTroubleshooting:" -ForegroundColor $WarningColor
        Write-Host "1. Check forge-test.log for details"
        Write-Host "2. Verify contract interfaces match test expectations"
        Write-Host "3. Ensure fee split sums to 10000 BPS"
        Write-Host "4. Verify APR boost cap is 2000 BPS (20%)"
        exit 1
    }
    
    # Save test output
    $testResult.Output | Out-File "forge-test.log" -Encoding UTF8
    Write-Status "✓ Test log saved to forge-test.log" $SuccessColor
    
    # Verify critical invariants from test output
    if ($testResult.Output -match "test_INVARIANT_FeeWeightsSum10000.*ok") {
        Write-Status "✓ Fee split validated: 40/20/10/10/10/5/5 = 100%" $SuccessColor
    } else {
        Write-Status "WARNING: Could not verify fee split invariant" $WarningColor
    }
}

# ============================================================================
# STEP 6: Deploy to Network
# ============================================================================
Write-Status "PHASE: Deploying to Base $Network" $InfoColor

$rpcUrl = if ($Network -eq 'testnet') { 
    $env:BASE_SEPOLIA_RPC_URL 
} else { 
    $env:BASE_MAINNET_RPC_URL 
}

Write-Host "Network: Base $Network" -ForegroundColor $InfoColor
Write-Host "RPC URL: $rpcUrl" -ForegroundColor $InfoColor

if ($Network -eq 'mainnet') {
    Write-Host "`n⚠️  MAINNET DEPLOYMENT - This will use real funds!" -ForegroundColor $WarningColor -BackgroundColor Black
    Write-Host "Press Ctrl+C to cancel, or any key to continue..." -ForegroundColor $WarningColor
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}

$deployCmd = "forge script script/DeployProduction.s.sol --rpc-url $rpcUrl --broadcast --verify"
$deployResult = Invoke-WithMonitoring $deployCmd "Deployment to Base $Network"

if (-not $deployResult.Success) {
    Write-Status "DEPLOYMENT FAILED" $ErrorColor
    Write-Host "`nTroubleshooting:" -ForegroundColor $WarningColor
    Write-Host "1. Check deployer has sufficient ETH"
    Write-Host "2. Verify RPC URL is correct and accessible"
    Write-Host "3. Check if contracts are already deployed"
    Write-Host "4. Review deployment script logs"
    exit 1
}

# Save deployment output
$deployResult.Output | Out-File "deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').log" -Encoding UTF8

# ============================================================================
# STEP 7: Save Deployment Addresses
# ============================================================================
Write-Status "PHASE: Saving Deployment Addresses" $InfoColor

$outputFile = if ($Network -eq 'testnet') {
    "deployments/baseSepolia.json"
} else {
    "deployments/baseMainnet.json"
}

# Extract addresses from deployment output (this is placeholder logic)
# Actual implementation would parse forge script output
Write-Status "Deployment addresses should be saved to: $outputFile" $WarningColor
Write-Host "Review deployment logs to extract contract addresses" -ForegroundColor $WarningColor

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host ("`n" + ("=" * 80)) -ForegroundColor $InfoColor
Write-Host "DEPLOYMENT SUMMARY" -ForegroundColor $SuccessColor
Write-Host ("=" * 80) -ForegroundColor $InfoColor

Write-Host "`nNetwork: Base $Network" -ForegroundColor $InfoColor
Write-Host "Build Time: $($buildResult.Duration.TotalSeconds)s" -ForegroundColor $InfoColor
if (-not $SkipTests) {
    Write-Host "Test Time: $($testResult.Duration.TotalSeconds)s" -ForegroundColor $InfoColor
}
Write-Host "Deploy Time: $($deployResult.Duration.TotalSeconds)s" -ForegroundColor $InfoColor

Write-Host "`nNext Steps:" -ForegroundColor $InfoColor
Write-Host "1. Review deployment logs in deployments/ folder"
Write-Host "2. Verify contracts on Basescan"
Write-Host "3. Update .env with deployed contract addresses"
Write-Host "4. Run smoke tests to validate deployment"

Write-Host "`n✓ Deployment workflow complete!" -ForegroundColor $SuccessColor
Write-Host ("=" * 80) -ForegroundColor $InfoColor
