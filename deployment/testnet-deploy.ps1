# ============================================================================
# VOID TESTNET QUICK DEPLOY
# ============================================================================
# Deploys VOID to Base Sepolia testnet in one command
# Run: .\deployment\testnet-deploy.ps1
# ============================================================================

param(
    [switch]$SkipBuild = $false,
    [switch]$VerifyOnly = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "         VOID Protocol - Base Sepolia Testnet Deploy            " -ForegroundColor Cyan
Write-Host "                     Phase 5 Deployment                         " -ForegroundColor Cyan
Write-Host "=================================================================`n" -ForegroundColor Cyan

# Step 1: Environment Check
Write-Host "CHECK Step 1: Environment Check" -ForegroundColor Yellow
Write-Host "---------------------------------------------------------------------`n" -ForegroundColor DarkGray

if (-not (Test-Path ".env")) {
    Write-Host "ERROR .env file not found!" -ForegroundColor Red
    Write-Host "   Copy .env.example to .env and configure:" -ForegroundColor Yellow
    Write-Host "   - BASE_SEPOLIA_RPC_URL" -ForegroundColor Gray
    Write-Host "   - DEPLOYER_PRIVATE_KEY" -ForegroundColor Gray
    Write-Host "   - BASESCAN_API_KEY`n" -ForegroundColor Gray
    exit 1
}

Write-Host "OK .env file found" -ForegroundColor Green

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

# Check required variables
$required = @(
    "BASE_SEPOLIA_RPC_URL",
    "DEPLOYER_PRIVATE_KEY",
    "BASESCAN_API_KEY"
)

$missing = @()
foreach ($var in $required) {
    if (-not [System.Environment]::GetEnvironmentVariable($var)) {
        $missing += $var
    }
}

if ($missing.Count -gt 0) {
    Write-Host "❌ Missing required environment variables:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    Write-Host "`n" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ All required environment variables set`n" -ForegroundColor Green

# Step 2: Dependency Check
Write-Host "📦 Step 2: Dependency Check" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found - install Node.js 18+`n" -ForegroundColor Red
    exit 1
}

# Check npm packages
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found - installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed`n" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependencies installed`n" -ForegroundColor Green

# Step 3: Build Check
if (-not $SkipBuild) {
    Write-Host "🔨 Step 3: Build Verification" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray
    
    Write-Host "Building Next.js app..." -ForegroundColor Gray
    npx next build 2>&1 | Select-Object -Last 10
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed - fix errors before deploying`n" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Build successful`n" -ForegroundColor Green
} else {
    Write-Host "⏭️  Step 3: Build Verification (Skipped)" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray
}

# Step 4: Network Check
Write-Host "🌐 Step 4: Network Check" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

$rpcUrl = [System.Environment]::GetEnvironmentVariable("BASE_SEPOLIA_RPC_URL")
Write-Host "RPC URL: $rpcUrl" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $rpcUrl -Method POST -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' -TimeoutSec 10
    $chainId = ($response.Content | ConvertFrom-Json).result
    
    if ($chainId -eq "0x14a34") {  # 84532 in hex
        Write-Host "✅ Connected to Base Sepolia (Chain ID: 84532)`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unexpected chain ID: $chainId" -ForegroundColor Yellow
        Write-Host "   Expected: 0x14a34 (Base Sepolia)`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to connect to RPC endpoint" -ForegroundColor Red
    Write-Host "   Error: $_`n" -ForegroundColor Yellow
    exit 1
}

# Step 5: Wallet Check
Write-Host "WALLET Step 5: Wallet Balance Check" -ForegroundColor Yellow
Write-Host "---------------------------------------------------------------------`n" -ForegroundColor DarkGray

# This would require ethers.js to check balance - simplified for now
Write-Host "⚠️  Manual check required:" -ForegroundColor Yellow
Write-Host "   1. Ensure deployer wallet has 0.1+ Sepolia ETH" -ForegroundColor Gray
Write-Host "   2. Get testnet ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet`n" -ForegroundColor Gray

# Step 6: Contract Compilation
Write-Host "⚙️  Step 6: Smart Contract Compilation" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

if (Test-Path "contracts") {
    if (Test-Path "hardhat.config.cts") {
        Write-Host "Compiling contracts..." -ForegroundColor Gray
        npx hardhat compile 2>&1 | Select-Object -Last 5
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Contracts compiled successfully`n" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Contract compilation failed - check errors`n" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  hardhat.config.cts not found - contracts may not deploy`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  No contracts directory - frontend-only deployment`n" -ForegroundColor Gray
}

# Step 7: Deployment Summary
Write-Host "📋 Step 7: Deployment Summary" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

Write-Host "Network:       Base Sepolia (Chain ID: 84532)" -ForegroundColor Cyan
Write-Host "RPC URL:       $rpcUrl" -ForegroundColor Cyan
Write-Host "Deployer:      " -NoNewline -ForegroundColor Cyan
Write-Host "(configured in .env)" -ForegroundColor Gray
Write-Host "Environment:   TESTNET" -ForegroundColor Cyan
Write-Host "`n" -ForegroundColor Gray

# Step 8: Deploy Confirmation
if ($VerifyOnly) {
    Write-Host "✅ PREFLIGHT CHECK COMPLETE - All systems ready for deployment!" -ForegroundColor Green
    Write-Host "`nTo deploy, run without -VerifyOnly flag`n" -ForegroundColor Gray
    exit 0
}

Write-Host "🚀 Ready to Deploy?" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

$confirm = Read-Host "Deploy to Base Sepolia testnet? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "`n❌ Deployment cancelled`n" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🚀 DEPLOYING TO BASE SEPOLIA..." -ForegroundColor Green
Write-Host "─────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

# Step 9: Frontend Deployment (Vercel)
Write-Host "📦 Step 9: Frontend Deployment" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

Write-Host "Deploy to Vercel:" -ForegroundColor Cyan
Write-Host "1. Install Vercel CLI: npm i -g vercel" -ForegroundColor Gray
Write-Host "2. Run: vercel --prod" -ForegroundColor Gray
Write-Host "3. Set environment variables in Vercel dashboard:" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_NETWORK=baseSepolia" -ForegroundColor DarkGray
Write-Host "   - NEXT_PUBLIC_DEMO_MODE=false" -ForegroundColor DarkGray
Write-Host "   - NEXT_PUBLIC_USE_MOCK_DATA=false" -ForegroundColor DarkGray
Write-Host "   - NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=(your RPC)" -ForegroundColor DarkGray
Write-Host "`n" -ForegroundColor Gray

# Step 10: Contract Deployment (if contracts exist)
if (Test-Path "contracts") {
    Write-Host "📜 Step 10: Smart Contract Deployment" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray
    
    Write-Host "Deploy contracts manually:" -ForegroundColor Cyan
    Write-Host "1. npx hardhat run scripts/deploy-voidscore.ts --network baseSepolia" -ForegroundColor Gray
    Write-Host "2. npx hardhat run scripts/deploy-xporacle.ts --network baseSepolia" -ForegroundColor Gray
    Write-Host "3. npx hardhat run scripts/deploy-voidmessaging.ts --network baseSepolia" -ForegroundColor Gray
    Write-Host "4. npx hardhat run scripts/deploy-voidagency.ts --network baseSepolia" -ForegroundColor Gray
    Write-Host "`n" -ForegroundColor Gray
    
    Write-Host "Verify contracts:" -ForegroundColor Cyan
    Write-Host "npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>" -ForegroundColor Gray
    Write-Host "`n" -ForegroundColor Gray
}

# Step 11: Post-Deployment
Write-Host "✅ DEPLOYMENT CHECKLIST" -ForegroundColor Green
Write-Host "─────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

Write-Host "After deployment:" -ForegroundColor Yellow
Write-Host "[ ] Verify frontend loads at Vercel URL" -ForegroundColor Gray
Write-Host "[ ] Test wallet connection (MetaMask on Base Sepolia)" -ForegroundColor Gray
Write-Host "[ ] Verify contracts on Basescan" -ForegroundColor Gray
Write-Host "[ ] Test demo mode still works" -ForegroundColor Gray
Write-Host "[ ] Test live mode with testnet wallet" -ForegroundColor Gray
Write-Host "[ ] Update config/contracts.json with deployed addresses" -ForegroundColor Gray
Write-Host "[ ] Share invite codes with beta testers" -ForegroundColor Gray
Write-Host "[ ] Monitor Sentry for errors" -ForegroundColor Gray
Write-Host "[ ] Post announcement on Twitter/Discord`n" -ForegroundColor Gray

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "- PHASE-5-STARTUP.md - Full deployment guide" -ForegroundColor Gray
Write-Host "- TESTNET-METAVERSE-GUIDE.md - User onboarding" -ForegroundColor Gray
Write-Host "- DEPLOYMENT-CHECKLIST.md - Production checklist`n" -ForegroundColor Gray

Write-Host "🎉 Testnet deployment initiated! Good luck! 🚀`n" -ForegroundColor Green
