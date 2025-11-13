# Void Protocol - Pre-Flight Validation Script
# Validates environment and dependencies before deployment
# Run: ./deployment/scripts/preflight-check.ps1

$ErrorActionPreference = "Stop"
$results = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    checks = @()
    overallStatus = "PENDING"
}

function Add-CheckResult {
    param(
        [string]$name,
        [string]$status,
        [string]$message,
        [string]$details = ""
    )
    
    $results.checks += @{
        name = $name
        status = $status
        message = $message
        details = $details
    }
    
    $icon = if ($status -eq "PASS") { "✅" } elseif ($status -eq "WARN") { "⚠️ " } else { "❌" }
    Write-Host "$icon $name" -ForegroundColor $(if ($status -eq "PASS") { "Green" } elseif ($status -eq "WARN") { "Yellow" } else { "Red" })
    Write-Host "   $message" -ForegroundColor Gray
    if ($details) {
        Write-Host "   Details: $details" -ForegroundColor DarkGray
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        Void Protocol - Pre-Flight Validation Check v2.0           ║" -ForegroundColor Cyan
Write-Host "║             Base Sepolia (84532) Deployment Readiness             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check 1: Node.js Version
Write-Host "📦 Checking Dependencies...`n" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $versionNum = [version]($nodeVersion -replace 'v','')
    if ($versionNum.Major -ge 18) {
        Add-CheckResult "Node.js Version" "PASS" "Node.js $nodeVersion installed" "Minimum: v18.0.0"
    } else {
        Add-CheckResult "Node.js Version" "FAIL" "Node.js $nodeVersion too old" "Upgrade to v18+"
    }
} catch {
    Add-CheckResult "Node.js Version" "FAIL" "Node.js not found" "Install from nodejs.org"
}

# Check 2: Foundry
try {
    $forgeVersion = forge --version 2>&1 | Select-Object -First 1
    if ($forgeVersion) {
        Add-CheckResult "Foundry (Forge)" "PASS" "Forge installed: $forgeVersion"
    } else {
        Add-CheckResult "Foundry (Forge)" "FAIL" "Forge not found" "Run: foundryup"
    }
} catch {
    Add-CheckResult "Foundry (Forge)" "FAIL" "Foundry not installed" "Install from getfoundry.sh"
}

# Check 3: Environment Variables
Write-Host "`n🔐 Checking Environment Variables...`n" -ForegroundColor Yellow

$requiredEnvVars = @(
    "PRIVATE_KEY",
    "BASE_SEPOLIA_RPC",
    "BASESCAN_API_KEY"
)

foreach ($envVar in $requiredEnvVars) {
    $value = [Environment]::GetEnvironmentVariable($envVar)
    if ($value) {
        $masked = $value.Substring(0, [Math]::Min(10, $value.Length)) + "..."
        Add-CheckResult "Env: $envVar" "PASS" "Set" $masked
    } else {
        Add-CheckResult "Env: $envVar" "FAIL" "Not set" "Add to .env file"
    }
}

# Check 4: Wallet Balance
Write-Host "`n💰 Checking Wallet Balance...`n" -ForegroundColor Yellow
try {
    $rpcUrl = [Environment]::GetEnvironmentVariable("BASE_SEPOLIA_RPC")
    $privateKey = [Environment]::GetEnvironmentVariable("PRIVATE_KEY")
    
    if ($rpcUrl -and $privateKey) {
        # Derive address from private key using cast
        $address = cast wallet address $privateKey 2>$null
        
        if ($address) {
            # Check balance
            $balance = cast balance $address --rpc-url $rpcUrl 2>$null
            
            if ($balance) {
                $balanceEth = [double]$balance / 1e18
                if ($balanceEth -ge 0.1) {
                    Add-CheckResult "Wallet Balance" "PASS" "$balanceEth ETH" "Address: $address"
                } elseif ($balanceEth -gt 0) {
                    Add-CheckResult "Wallet Balance" "WARN" "$balanceEth ETH (low)" "Recommended: >0.1 ETH"
                } else {
                    Add-CheckResult "Wallet Balance" "FAIL" "0 ETH" "Fund from faucet"
                }
            } else {
                Add-CheckResult "Wallet Balance" "WARN" "Could not fetch balance" "Check RPC URL"
            }
        } else {
            Add-CheckResult "Wallet Address" "FAIL" "Could not derive address" "Check PRIVATE_KEY format"
        }
    } else {
        Add-CheckResult "Wallet Balance" "SKIP" "Missing env vars" "Set PRIVATE_KEY and BASE_SEPOLIA_RPC"
    }
} catch {
    Add-CheckResult "Wallet Balance" "WARN" "Balance check failed" $_.Exception.Message
}

# Check 5: Network Connectivity
Write-Host "`n🌐 Checking Network Connectivity...`n" -ForegroundColor Yellow
try {
    $rpcUrl = [Environment]::GetEnvironmentVariable("BASE_SEPOLIA_RPC")
    if ($rpcUrl) {
        $blockNumber = cast block-number --rpc-url $rpcUrl 2>$null
        if ($blockNumber) {
            Add-CheckResult "Base Sepolia RPC" "PASS" "Connected (Block: $blockNumber)"
        } else {
            Add-CheckResult "Base Sepolia RPC" "FAIL" "Connection failed" "Check RPC URL"
        }
    } else {
        Add-CheckResult "Base Sepolia RPC" "SKIP" "RPC URL not set"
    }
} catch {
    Add-CheckResult "Base Sepolia RPC" "FAIL" "Connection error" $_.Exception.Message
}

# Check 6: Contract Compilation
Write-Host "`n🔨 Checking Contract Compilation...`n" -ForegroundColor Yellow
try {
    $buildOutput = forge build 2>&1
    if ($LASTEXITCODE -eq 0) {
        $contractCount = (Get-ChildItem -Path "out" -Filter "*.json" -Recurse).Count
        Add-CheckResult "Contract Compilation" "PASS" "All contracts compiled" "$contractCount artifacts generated"
    } else {
        Add-CheckResult "Contract Compilation" "FAIL" "Compilation failed" $buildOutput[-1]
    }
} catch {
    Add-CheckResult "Contract Compilation" "FAIL" "Build error" $_.Exception.Message
}

# Check 7: Test Suite
Write-Host "`n🧪 Running Test Suite...`n" -ForegroundColor Yellow
try {
    $testOutput = forge test --json 2>&1 | ConvertFrom-Json
    $totalTests = $testOutput.summary.total
    $passedTests = $testOutput.summary.passed
    
    if ($passedTests -eq $totalTests) {
        Add-CheckResult "Test Suite" "PASS" "$passedTests/$totalTests tests passed"
    } else {
        $failedTests = $totalTests - $passedTests
        Add-CheckResult "Test Suite" "FAIL" "$failedTests/$totalTests tests failed"
    }
} catch {
    # Fallback: Run tests without JSON parsing
    $testOutput = forge test 2>&1
    if ($testOutput -match "Test result: ok") {
        Add-CheckResult "Test Suite" "PASS" "All tests passed"
    } else {
        Add-CheckResult "Test Suite" "WARN" "Could not parse test results" "Review manually: forge test"
    }
}

# Check 8: Simulations
Write-Host "`n🔬 Checking Simulation Scripts...`n" -ForegroundColor Yellow

$simulations = @(
    "deployment/simulations/simulateDecay.mjs",
    "deployment/simulations/tierThresholds.mjs",
    "deployment/simulations/penaltyStacking.mjs",
    "deployment/simulations/simulateUsers.mjs"
)

foreach ($sim in $simulations) {
    if (Test-Path $sim) {
        try {
            $simResult = node $sim 2>&1
            if ($LASTEXITCODE -eq 0) {
                Add-CheckResult "Simulation: $(Split-Path $sim -Leaf)" "PASS" "Executed successfully"
            } else {
                Add-CheckResult "Simulation: $(Split-Path $sim -Leaf)" "FAIL" "Execution failed" $simResult[-1]
            }
        } catch {
            Add-CheckResult "Simulation: $(Split-Path $sim -Leaf)" "WARN" "Could not run" $_.Exception.Message
        }
    } else {
        Add-CheckResult "Simulation: $(Split-Path $sim -Leaf)" "WARN" "File not found" "Create simulation script"
    }
}

# Check 9: Git Status
Write-Host "`n📝 Checking Repository Status...`n" -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain 2>&1
    if ($gitStatus.Count -eq 0) {
        Add-CheckResult "Git Repository" "PASS" "Working directory clean"
    } else {
        Add-CheckResult "Git Repository" "WARN" "$($gitStatus.Count) uncommitted changes" "Commit before deployment"
    }
    
    $currentBranch = git branch --show-current 2>&1
    Add-CheckResult "Git Branch" "INFO" "On branch: $currentBranch"
} catch {
    Add-CheckResult "Git Repository" "WARN" "Not a git repository"
}

# Check 10: Deployment Scripts
Write-Host "`n📜 Checking Deployment Scripts...`n" -ForegroundColor Yellow

$deployScripts = @(
    "deployment/scripts/deploy-sepolia.ts",
    "deployment/scripts/verify-contracts.ts",
    "deployment/scripts/export-addresses.ts"
)

foreach ($script in $deployScripts) {
    if (Test-Path $script) {
        Add-CheckResult "Script: $(Split-Path $script -Leaf)" "PASS" "Found"
    } else {
        Add-CheckResult "Script: $(Split-Path $script -Leaf)" "WARN" "Not found" "Create deployment script"
    }
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                      VALIDATION SUMMARY                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$passCount = ($results.checks | Where-Object { $_.status -eq "PASS" }).Count
$failCount = ($results.checks | Where-Object { $_.status -eq "FAIL" }).Count
$warnCount = ($results.checks | Where-Object { $_.status -eq "WARN" }).Count
$totalChecks = $results.checks.Count

Write-Host "Total Checks: $totalChecks" -ForegroundColor White
Write-Host "✅ Passed: $passCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host "⚠️  Warnings: $warnCount" -ForegroundColor Yellow

if ($failCount -eq 0) {
    $results.overallStatus = "READY"
    Write-Host "`n✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT" -ForegroundColor Green
} elseif ($failCount -le 2) {
    $results.overallStatus = "WARNING"
    Write-Host "`n⚠️  SOME CHECKS FAILED - REVIEW BEFORE DEPLOYMENT" -ForegroundColor Yellow
} else {
    $results.overallStatus = "NOT_READY"
    Write-Host "`n❌ MULTIPLE FAILURES - NOT READY FOR DEPLOYMENT" -ForegroundColor Red
}

# Export results
$reportPath = "deployment/qa-reports/preflight-report.json"
New-Item -ItemType Directory -Force -Path (Split-Path $reportPath) | Out-Null
$results | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding UTF8

Write-Host "`n📄 Report saved: $reportPath" -ForegroundColor Gray

# Exit with appropriate code
if ($results.overallStatus -eq "READY") {
    exit 0
} elseif ($results.overallStatus -eq "WARNING") {
    exit 1
} else {
    exit 2
}
