<# 
  PSX VOID - Phase 3 Kickoff Script
  Usage (from repo root):

    .\scripts\Phase3-Kickoff.ps1

  What it does:
  - Checks Foundry (forge) availability
  - Runs coordinate validator (npm run validate:coords) if present
  - Runs economic invariant tests (forge test --match-contract EconomicInvariantsTest)
  - Starts Next.js dev server in a new window (npm run dev)
  - Optionally starts deployment monitor if scripts/Test-Deployment.ps1 exists
#>

param(
    [switch]$SkipTests
)

# Ensure we're in the repo root (parent of scripts folder)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
Set-Location $repoRoot

Write-Host "=== PSX VOID Phase 3 Kickoff ===" -ForegroundColor Cyan
Write-Host "Working directory: $repoRoot" -ForegroundColor DarkGray

# 1. Check Foundry (forge)
Write-Host "`n[1/5] Checking Foundry (forge)..." -ForegroundColor Yellow
$forgeCmd = Get-Command forge -ErrorAction SilentlyContinue
if (-not $forgeCmd) {
    Write-Warning "forge not found on PATH. Install Foundry from https://book.getfoundry.sh/ before running tests."
} else {
    $forgeVersion = forge --version
    Write-Host "Foundry OK: $forgeVersion" -ForegroundColor Green
}

# 2. Run coordinate validator
if (-not $SkipTests) {
    Write-Host "`n[2/5] Running coordinate validator (npm run validate:coords)..." -ForegroundColor Yellow

    $packageJsonPath = Join-Path (Get-Location) "package.json"
    if (Test-Path $packageJsonPath) {
        $pkgContent = Get-Content $packageJsonPath -Raw
        if ($pkgContent -match '"validate:coords"') {
            try {
                npm run validate:coords
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Coordinate validator PASSED." -ForegroundColor Green
                } else {
                    Write-Warning "Coordinate validator returned non-zero exit code: $LASTEXITCODE"
                }
            } catch {
                Write-Warning "Failed to run npm script validate:coords: $_"
            }
        } else {
            Write-Warning "No validate:coords script found in package.json. Skipping."
        }
    } else {
        Write-Warning "package.json not found in current directory. Skipping coordinate validation."
    }

    # 3. Run economic invariants tests
    Write-Host "`n[3/5] Running economic invariants tests (forge test --match-contract EconomicInvariantsTest)..." -ForegroundColor Yellow

    if ($forgeCmd) {
        try {
            forge test --match-contract EconomicInvariantsTest -vv
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Economic invariants tests PASSED." -ForegroundColor Green
            } else {
                Write-Warning "Economic invariants tests returned non-zero exit code: $LASTEXITCODE"
            }
        } catch {
            Write-Warning "Failed to run forge tests: $_"
        }
    } else {
        Write-Warning "Skipping forge tests because forge is not installed."
    }
} else {
    Write-Host "`n[2/5] Tests skipped due to -SkipTests flag." -ForegroundColor DarkYellow
}

# 4. Start dev server in new window
Write-Host "`n[4/5] Starting dev server (npm run dev) in a new window..." -ForegroundColor Yellow

# PowerShell-specific new window with correct working directory
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$repoRoot'; npm run dev" | Out-Null
Write-Host "Dev server command launched. Check the new window and visit http://localhost:3000" -ForegroundColor Green

# 5. Start deployment monitor if available
Write-Host "`n[5/5] Checking for deployment monitor script..." -ForegroundColor Yellow
$monitorScript = Join-Path $repoRoot "scripts\Test-Deployment.ps1"

if (Test-Path $monitorScript) {
    Write-Host "Found scripts\Test-Deployment.ps1, starting monitor in a new window..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$repoRoot'; . '.\scripts\Test-Deployment.ps1' -Monitor" | Out-Null
} else {
    Write-Warning "No scripts\Test-Deployment.ps1 found. Skipping monitor startup."
}

Write-Host "`n=== Phase 3 Kickoff Complete ===" -ForegroundColor Cyan
Write-Host "Next steps:"
Write-Host "  - Verify HUD + world load at http://localhost:3000" -ForegroundColor Gray
Write-Host "  - Use your E2E validation guide to test land, swap, staking, and missions." -ForegroundColor Gray
