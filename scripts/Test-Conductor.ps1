#requires -Version 5.1
<#
.SYNOPSIS
PSX VOID – E2E Test Conductor (Base Sepolia)

.DESCRIPTION
Guides a human tester through a full session:
- Sanity checks (Node/Foundry/Privy/WC/RPC)
- Launch dev server + open ops dashboard
- Run validators
- Execute swap → verify 0.3% fee routed to Router
- Stake/claim sanity
- World ↔ HUD sync checks
- Persist QA logs to qa-reports/*.jsonl

.PARAMETER RpcUrl
Base Sepolia RPC URL (primary). Defaults to https://sepolia.base.org

.PARAMETER RpcUrlFallback
Fallback RPC URL (Alchemy/Infura/etc). Optional.

.PARAMETER WalletPrivKey
Private key for cast actions (hex, 0x...). Optional; if omitted, you'll only run read-only checks.

.PARAMETER VoidToken
VOID token address (Base Sepolia)

.PARAMETER UsdcToken
USDC test token address (Base Sepolia)

.PARAMETER Router
VoidHookRouterV4 address (fee sink)

.PARAMETER XVoidVault
Staking vault address

.PARAMETER SwapAmount
Amount of VOID (decimal) to swap in the fee-routing proof. Default: 100

.EXAMPLE
.\scripts\Test-Conductor.ps1 -WalletPrivKey 0xabc... -RpcUrl https://sepolia.base.org -RpcUrlFallback https://base-sepolia.g.alchemy.com/v2/KEY
#>

param(
    [string]$RpcUrl = "https://sepolia.base.org",
    [string]$RpcUrlFallback = "",
    [string]$WalletPrivKey = "",
    [string]$VoidToken = "0x8de4043445939B0D0Cc7d6c752057707279D9893",
    [string]$UsdcToken = "0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9",
    [string]$Router = "0x687E678aB2152d9e0952d42B0F872604533D25a9",
    [string]$XVoidVault = "0xab10B2B5E1b07447409BCa889d14F046bEFd8192",
    [double]$SwapAmount = 100.0
)

$ErrorActionPreference = "Stop"

function Write-Head($t){ Write-Host "`n==== $t ====`n" -ForegroundColor Cyan }
function Write-Ok($t){ Write-Host "[OK] $t" -ForegroundColor Green }
function Write-Warn($t){ Write-Host "[WARN] $t" -ForegroundColor Yellow }
function Write-Err($t){ Write-Host "[ERR] $t" -ForegroundColor Red }

# -- Paths --------------------------------------------------------------------
$RepoRoot = (Get-Item -LiteralPath ".\").FullName
$QaDir = Join-Path $RepoRoot "qa-reports"
if (!(Test-Path $QaDir)) { New-Item -ItemType Directory -Path $QaDir | Out-Null }

$OpsDashboard = Join-Path $RepoRoot "ops-dashboard.html"
$Now = Get-Date
$RunId = $Now.ToString("yyyyMMdd-HHmmss")
$QaLog = Join-Path $QaDir ("qa-" + $RunId + ".jsonl")

function Add-QaLog([hashtable]$obj){
    $obj.ts = (Get-Date).ToString("o")
    $json = ($obj | ConvertTo-Json -Depth 10 -Compress)
    Add-Content -Path $QaLog -Value $json
}

# -- Sanity Checks ------------------------------------------------------------
Write-Head "Sanity Checks"

# Node
try {
    $nodev = node -v
    Write-Ok "Node present ($nodev)"
} catch {
    Write-Err "NodeJS not found in PATH"; exit 1
}

# Foundry
$HasCast = $true
try {
    $castv = cast --version
    Write-Ok "Foundry (cast) present ($castv)"
} catch {
    Write-Warn "Foundry/cast not found. Swap/escrow scripts will be read-only."
    $HasCast = $false
}
Add-QaLog @{type="cast"; available=$HasCast}

# Env vars
$envPath = Join-Path $RepoRoot ".env.local"
if (!(Test-Path $envPath)) {
    Write-Warn ".env.local not found. WalletConnect/Privy may fail."
    $envText = ""
} else {
    $envText = Get-Content $envPath -Raw
    if ($envText -notmatch "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID") {
        Write-Warn "WalletConnect project ID missing"
        $wc = $false
    } else {
        Write-Ok "WalletConnect project ID present"
        $wc = $true
    }
    if ($envText -notmatch "PRIVY_APP_ID") {
        Write-Warn "Privy app ID missing"
        $pri = $false
    } else {
        Write-Ok "Privy app ID present"
        $pri = $true
    }
    Add-QaLog @{type="auth-env"; walletconnect=$wc; privy=$pri}
}

# RPC reachability + Chain ID verification
Write-Host "Checking RPC: $RpcUrl"
try {
    $resp = Invoke-WebRequest -Uri $RpcUrl -Method POST -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 8
    $cid = $resp.Content
    if ($cid -match '"0x14a34"') {
        Write-Ok "Base Sepolia reachable (chainId 0x14a34 / 84532)"
        Add-QaLog @{type="chain"; ok=$true; cid="0x14a34"; rpc=$RpcUrl}
    } else {
        Write-Err "ChainId != Base Sepolia (0x14a34). Found: $cid"
        Add-QaLog @{type="chain"; ok=$false; cid=$cid; rpc=$RpcUrl}
        exit 1
    }
} catch {
    Write-Err "Primary RPC not reachable: $_"
    Add-QaLog @{type="chain"; ok=$false; err="$_"; rpc=$RpcUrl}
}

if ($RpcUrlFallback) {
    Write-Host "Checking fallback RPC: $RpcUrlFallback"
    try {
        $resp2 = Invoke-WebRequest -Uri $RpcUrlFallback -Method POST -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 8
        Write-Ok "Fallback RPC reachable"
        Add-QaLog @{type="rpc-fallback"; ok=$true; rpc=$RpcUrlFallback}
    } catch {
        Write-Warn "Fallback RPC unreachable"
        Add-QaLog @{type="rpc-fallback"; ok=$false; rpc=$RpcUrlFallback}
    }
}

Add-QaLog @{ type="sanity"; node=$nodev; cast=$castv; rpc=$RpcUrl; fallback=$RpcUrlFallback }

# -- Launch Dev Server + Ops Dashboard ----------------------------------------
Write-Head "Launch Dev Server + Ops Dashboard"

try {
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","npm run dev" -WorkingDirectory $RepoRoot | Out-Null
    Write-Ok "Dev server launching..."
} catch {
    Write-Err "Failed to start dev server: $_"
}

# Wait for UI to come up
Write-Host "Waiting for UI to respond on http://localhost:3000..."
Start-Sleep -Seconds 5

try {
    Invoke-WebRequest "http://localhost:3000" -UseBasicParsing -TimeoutSec 8 | Out-Null
    Write-Ok "App responding on http://localhost:3000"
    Add-QaLog @{type="ui-up"; ok=$true}
} catch {
    Write-Err "UI not responding on :3000"
    Add-QaLog @{type="ui-up"; ok=$false}
}

# Open specific tabs
Write-Host "Opening dashboard tabs (Swap, Wallet, Land)..."
Start-Process "http://localhost:3000/?open=dashboard`&tab=swap"
Start-Process "http://localhost:3000/?open=dashboard`&tab=wallet"
Start-Process "http://localhost:3000/?open=dashboard`&tab=land"

if (Test-Path $OpsDashboard) {
    try {
        Start-Process $OpsDashboard | Out-Null
        Write-Ok "Ops dashboard opened"
    } catch {
        Write-Warn "Could not open ops-dashboard.html automatically"
    }
} else {
    Write-Warn "ops-dashboard.html not found (optional)"
}

# -- Run Validators ------------------------------------------------------------
Write-Head "Run Validators"

try {
    npm run validate:coords | Out-Host
    Write-Ok "Coordinate validator ran"
    Add-QaLog @{ type="validator"; name="validate:coords"; result="ok" }
} catch {
    Write-Err "Coordinate validator failed"
    Add-QaLog @{ type="validator"; name="validate:coords"; result="fail"; err="exception" }
}

# -- Fee Routing Proof (Swap VOID->USDC) ---------------------------------------
Write-Head "Fee Routing Proof (0.3 percent)"

if (!$HasCast) {
    Write-Warn "Foundry/cast not available. Skipping on-chain balance checks."
} elseif (!$WalletPrivKey) {
    Write-Warn "No private key provided. Skipping on-chain write steps."
} else {
    # Helper: cast call for ERC20 balanceOf
    function Get-TokenBalance([string]$token, [string]$holder){
        $res = cast call $token "balanceOf(address)(uint256)" $holder --rpc-url $RpcUrl
        return [System.Numerics.BigInteger]::Parse($res.Replace("0x",""), "AllowHexSpecifier")
    }

    # Get router balance pre-swap
    try {
        $pre = Get-TokenBalance $VoidToken $Router
        Write-Host "Router VOID (pre): $pre wei"
        
        # Decode to human units (18 decimals)
        $preHuman = [decimal]$pre / [decimal](1e18)
        Write-Host ("Router VOID (pre): {0:N6} VOID" -f $preHuman)
    } catch {
        Write-Err "Failed to read router pre-balance: $_"
    }

    Write-Host ""
    Write-Host "==> MANUAL STEP:" -ForegroundColor Yellow
    Write-Host "Open app -> SWAP tab -> swap $SwapAmount VOID -> USDC (slippage approx 0.5 percent)."
    Write-Host ""
    $null = Read-Host "Press ENTER after the tx is mined"
    
    Start-Sleep -Seconds 6

    try {
        $post = Get-TokenBalance $VoidToken $Router
        Write-Host "Router VOID (post): $post wei"
        
        $delta = $post - $pre
        $deltaHuman = [decimal]$delta / [decimal](1e18)
        
        Write-Ok ("Router delta (VOID wei): " + $delta)
        Write-Host ("Router delta (VOID): {0:N6}" -f $deltaHuman) -ForegroundColor Cyan
        
        # Expected fee: 0.3 percent of swap amount
        $expectedFeeVOID = $SwapAmount * 0.003
        Write-Host ("Expected fee (0.3 percent of {0:N2} VOID): {1:N6} VOID" -f $SwapAmount, $expectedFeeVOID) -ForegroundColor Gray
        
        # Variance check
        $variance = [Math]::Abs($deltaHuman - $expectedFeeVOID)
        $variancePct = ($variance / $expectedFeeVOID) * 100
        
        if ($variancePct -le 1.0) {
            Write-Ok ("Fee routing VERIFIED! Variance: {0:N2}%" -f $variancePct)
        } else {
            Write-Warn ("Fee variance higher than expected: {0:N2}%" -f $variancePct)
        }
        
        Add-QaLog @{
            type="fee-proof";
            token=$VoidToken;
            router=$Router;
            pre="$pre";
            post="$post";
            delta="$delta";
            delta_void=$deltaHuman;
            nominal_input="$SwapAmount";
            expected_fee_bps=30;
            variance_pct=$variancePct
        }
    } catch {
        Write-Err "Failed to read router post-balance: $_"
    }
}

# -- Staking & XP APR Read -----------------------------------------------------
Write-Head "Staking & XP APR"

Write-Host "Open WALLET tab: verify:" -ForegroundColor Yellow
Write-Host "  - VOID.balance, xVOIDVault.balance, earned()"
Write-Host "  - APR = Base (12%) + XPOracle boost"
Write-Host ""
$ok = Read-Host "Did WALLET tab reflect live values? (y/n)"
Add-QaLog @{ type="staking-check"; ui_confirm=$ok }

# -- World <-> HUD Sync ----------------------------------------------------------
Write-Head "World <-> HUD Sync"

Write-Host "Walk across district boundary; open World Map Overlay & Land tab;" -ForegroundColor Yellow
Write-Host "ensure parcel/district/owner sync across all 3 views (mini-map, overlay, Land tab)."
Write-Host ""
$ok2 = Read-Host "Did all 3 views remain in sync? (y/n)"
Add-QaLog @{ type="world-sync"; ui_confirm=$ok2 }

# -- FPS/Perf ------------------------------------------------------------------
Write-Head "Performance"

Write-Host "Enable FPS badge in Settings (NEXT_PUBLIC_SHOW_FPS=1);" -ForegroundColor Yellow
Write-Host "walk around; target ≥60 FPS @1080p."
Write-Host ""
$fps = Read-Host "Observed FPS (rough): "
Add-QaLog @{ type="perf"; fps=$fps }

# -- Summary -------------------------------------------------------------------
Write-Head "Test Conductor Complete"

Write-Ok "QA log written: $QaLog"
Write-Host ""
Write-Host "Review all reports in: $QaDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Fill out E2E-RESULTS-TEMPLATE.md"
Write-Host "  2. Take screenshots of each tab"
Write-Host "  3. Save transaction hashes to artifacts"
Write-Host ""
Write-Ok "Phase 3 E2E testing session complete!"
