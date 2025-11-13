# PSX VOID - Fee Routing E2E Test (Base Sepolia)
# Proves 0.3% swap fee accrues to VoidHookRouterV4

# ========================================
# CONFIGURATION
# ========================================
$RPC = "https://sepolia.base.org"
$KEY = $env:PRIVATE_KEY  # Set as environment variable: $env:PRIVATE_KEY = "0x..."
$ME = $env:MY_ADDRESS     # Your wallet address

# Contract addresses (Base Sepolia)
$ROUTER = "0x687E678aB2152d9e0952d42B0F872604533D25a9"
$SWAP = "0x74bD32c493C9be6237733507b00592e6AB231e4F"
$VOID = "0x8de4043445939B0D0Cc7d6c752057707279D9893"
$USDC = "0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9"

# ========================================
# SAFETY CHECKS
# ========================================
if (-not $KEY) {
    Write-Host "❌ ERROR: Set PRIVATE_KEY environment variable" -ForegroundColor Red
    Write-Host "Example: `$env:PRIVATE_KEY = '0x...'" -ForegroundColor Yellow
    exit 1
}

if (-not $ME) {
    Write-Host "❌ ERROR: Set MY_ADDRESS environment variable" -ForegroundColor Red
    Write-Host "Example: `$env:MY_ADDRESS = '0x...'" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🔍 PSX VOID Fee Routing E2E Test" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Network: Base Sepolia (84532)" -ForegroundColor Gray
Write-Host "Your Address: $ME" -ForegroundColor Gray
Write-Host "`n"

# ========================================
# STEP 0: Mint test tokens (if needed)
# ========================================
Write-Host "📦 STEP 0: Ensure test tokens..." -ForegroundColor Yellow

# Check VOID balance
$voidBalance = cast call $VOID "balanceOf(address)(uint256)" $ME --rpc-url $RPC
Write-Host "   VOID balance: $voidBalance" -ForegroundColor Gray

if ([bigint]$voidBalance -lt 100000000000000000000) {
    Write-Host "   Minting 1000 VOID..." -ForegroundColor Gray
    cast send $VOID "mint(address,uint256)" $ME "1000000000000000000000" --rpc-url $RPC --private-key $KEY | Out-Null
    Write-Host "   ✅ VOID minted" -ForegroundColor Green
}

# Check USDC balance
$usdcBalance = cast call $USDC "balanceOf(address)(uint256)" $ME --rpc-url $RPC
Write-Host "   USDC balance: $usdcBalance" -ForegroundColor Gray

if ([bigint]$usdcBalance -lt 1000000000) {
    Write-Host "   Minting 1000 USDC..." -ForegroundColor Gray
    cast send $USDC "mint(address,uint256)" $ME "1000000000" --rpc-url $RPC --private-key $KEY | Out-Null
    Write-Host "   ✅ USDC minted" -ForegroundColor Green
}

Write-Host ""

# ========================================
# STEP 1: Approve VOID to Swap contract
# ========================================
Write-Host "✅ STEP 1: Approve VOID to Swap..." -ForegroundColor Yellow

$allowance = cast call $VOID "allowance(address,address)(uint256)" $ME $SWAP --rpc-url $RPC

if ([bigint]$allowance -lt 10000000000000000000) {
    Write-Host "   Approving unlimited VOID to Swap..." -ForegroundColor Gray
    cast send $VOID "approve(address,uint256)" $SWAP "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" --rpc-url $RPC --private-key $KEY | Out-Null
    Write-Host "   ✅ Approval complete" -ForegroundColor Green
} else {
    Write-Host "   ✅ Already approved" -ForegroundColor Green
}

Write-Host ""

# ========================================
# STEP 2: Snapshot Router VOID before swap
# ========================================
Write-Host "📸 STEP 2: Snapshot Router balance..." -ForegroundColor Yellow

$routerBefore = cast call $VOID "balanceOf(address)(uint256)" $ROUTER --rpc-url $RPC
Write-Host "   Router VOID before: $routerBefore" -ForegroundColor Gray

Write-Host ""

# ========================================
# STEP 3: Execute swap (10 VOID → USDC)
# ========================================
Write-Host "💱 STEP 3: Execute swap..." -ForegroundColor Yellow

$amountIn = "10000000000000000000" # 10 VOID (18 decimals)
$deadline = [int]([double]::Parse((Get-Date -UFormat %s))) + 600  # now + 10 minutes

Write-Host "   Amount in: 10 VOID" -ForegroundColor Gray
Write-Host "   Fetching quote..." -ForegroundColor Gray

# Try Shape B first (newer ABI)
try {
    $quote = cast call $SWAP "getQuote(uint256,address,address)(uint256)" $amountIn $VOID $USDC --rpc-url $RPC
    Write-Host "   Quote (Shape B): $quote" -ForegroundColor Gray
} catch {
    # Fallback to Shape A
    Write-Host "   Shape B failed, trying Shape A..." -ForegroundColor Gray
    $quote = cast call $SWAP "getQuote(address,uint256)(uint256)" $VOID $amountIn --rpc-url $RPC
    Write-Host "   Quote (Shape A): $quote" -ForegroundColor Gray
}

# Calculate minOut with 0.5% slippage
$minOut = [string]([bigint]$quote * 995 / 1000)
Write-Host "   Min out (0.5% slippage): $minOut" -ForegroundColor Gray

Write-Host "   Executing swap..." -ForegroundColor Gray

# Try swap (Shape B signature: swap(tokenIn, tokenOut, amountIn, minOut, deadline))
try {
    $txHash = cast send $SWAP "swap(address,address,uint256,uint256,uint256)" $VOID $USDC $amountIn $minOut $deadline --rpc-url $RPC --private-key $KEY
    Write-Host "   ✅ Swap complete" -ForegroundColor Green
    Write-Host "   Tx: https://sepolia.basescan.org/tx/$txHash" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Swap failed: $_" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 5  # Wait for tx to finalize

Write-Host ""

# ========================================
# STEP 4: Verify fee accrual
# ========================================
Write-Host "🔍 STEP 4: Verify fee accrual..." -ForegroundColor Yellow

$routerAfter = cast call $VOID "balanceOf(address)(uint256)" $ROUTER --rpc-url $RPC
Write-Host "   Router VOID after: $routerAfter" -ForegroundColor Gray

$delta = [bigint]$routerAfter - [bigint]$routerBefore
$expectedFee = [bigint]$amountIn * 3 / 1000  # 0.3% of input

Write-Host "`n📊 RESULTS:" -ForegroundColor Cyan
Write-Host "   Expected fee (0.3%): $expectedFee wei" -ForegroundColor Gray
Write-Host "   Actual accrual:       $delta wei" -ForegroundColor Gray

$tolerance = $expectedFee / 10  # 10% tolerance for rounding
$diff = if ($delta -gt $expectedFee) { $delta - $expectedFee } else { $expectedFee - $delta }

if ($diff -le $tolerance) {
    Write-Host "`n   ✅ FEE ROUTING VERIFIED!" -ForegroundColor Green
    Write-Host "   Router received ~0.3% of swap input" -ForegroundColor Green
    
    # Log to QA reports
    $reportDir = "qa-reports"
    if (-not (Test-Path $reportDir)) {
        New-Item -ItemType Directory -Path $reportDir | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $logEntry = @{
        timestamp = $timestamp
        event = "fee_routing_e2e"
        network = "base-sepolia"
        amountIn = $amountIn
        expectedFee = $expectedFee.ToString()
        actualAccrual = $delta.ToString()
        routerAddress = $ROUTER
        txHash = $txHash
        status = "PASS"
    } | ConvertTo-Json -Compress
    
    $logFile = "$reportDir/$(Get-Date -Format 'yyyy-MM-dd').jsonl"
    Add-Content -Path $logFile -Value $logEntry
    
    Write-Host "`n   📝 Logged to: $logFile" -ForegroundColor Cyan
} else {
    Write-Host "`n   ❌ FEE ROUTING MISMATCH!" -ForegroundColor Red
    Write-Host "   Expected: $expectedFee" -ForegroundColor Red
    Write-Host "   Got:      $delta" -ForegroundColor Red
    Write-Host "   Diff:     $diff (tolerance: $tolerance)" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ E2E Test Complete!`n" -ForegroundColor Green
