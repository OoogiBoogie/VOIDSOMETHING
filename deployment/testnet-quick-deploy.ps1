# VOID TESTNET DEPLOYMENT SCRIPT
# Base Sepolia Deployment
# Run: .\deployment\testnet-quick-deploy.ps1

param([switch]$VerifyOnly = $false)

$ErrorActionPreference = "Stop"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "     VOID Protocol - Base Sepolia Testnet Deployment            " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Phase 5 - Testnet Launch" -ForegroundColor Green
Write-Host "Network: Base Sepolia (Chain ID: 84532)" -ForegroundColor Green
Write-Host "=================================================================`n" -ForegroundColor Cyan

# Check .env file
Write-Host "[1/8] Environment Check..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Action: Copy .env.example to .env and configure`n" -ForegroundColor Yellow
    exit 1
}
Write-Host "OK - .env file found`n" -ForegroundColor Green

# Load environment
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
}

# Check required variables
Write-Host "[2/8] Configuration Check..." -ForegroundColor Yellow
$required = @("BASE_SEPOLIA_RPC_URL", "DEPLOYER_PRIVATE_KEY", "BASESCAN_API_KEY")
$missing = $required | Where-Object { -not [System.Environment]::GetEnvironmentVariable($_) }

if ($missing) {
    Write-Host "ERROR: Missing variables: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "Action: Configure in .env file`n" -ForegroundColor Yellow
    exit 1
}
Write-Host "OK - All required variables set`n" -ForegroundColor Green

# Check Node.js
Write-Host "[3/8] Node.js Check..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "OK - Node.js $nodeVersion installed`n" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found`n" -ForegroundColor Red
    exit 1
}

# Check dependencies
Write-Host "[4/8] Dependencies Check..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "WARN - Installing dependencies..." -ForegroundColor Yellow
    npm install --silent
}
Write-Host "OK - Dependencies ready`n" -ForegroundColor Green

# Build check
Write-Host "[5/8] Build Check..." -ForegroundColor Yellow
Write-Host "Building Next.js app..." -ForegroundColor Gray
$buildOutput = npx next build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    $buildOutput | Select-Object -Last 10
    Write-Host "`n" -ForegroundColor Gray
    exit 1
}
Write-Host "OK - Build successful`n" -ForegroundColor Green

# Network check
Write-Host "[6/8] Network Check..." -ForegroundColor Yellow
$rpcUrl = [System.Environment]::GetEnvironmentVariable("BASE_SEPOLIA_RPC_URL")
try {
    $response = Invoke-WebRequest -Uri $rpcUrl -Method POST -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' -TimeoutSec 10
    $chainId = ($response.Content | ConvertFrom-Json).result
    if ($chainId -eq "0x14a34") {
        Write-Host "OK - Connected to Base Sepolia (84532)`n" -ForegroundColor Green
    } else {
        Write-Host "WARN - Chain ID mismatch: $chainId`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Cannot connect to RPC`n" -ForegroundColor Red
    exit 1
}

# Wallet check
Write-Host "[7/8] Wallet Check..." -ForegroundColor Yellow
Write-Host "ACTION REQUIRED:" -ForegroundColor Cyan
Write-Host "  1. Ensure deployer wallet has 0.1+ Sepolia ETH" -ForegroundColor Gray
Write-Host "  2. Get testnet ETH: https://www.coinbase.com/faucets" -ForegroundColor Gray
Write-Host "`n" -ForegroundColor Gray

# Summary
Write-Host "[8/8] Deployment Summary" -ForegroundColor Yellow
Write-Host "---------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Network:     Base Sepolia (84532)" -ForegroundColor Cyan
Write-Host "RPC:         $rpcUrl" -ForegroundColor Cyan
Write-Host "Environment: TESTNET" -ForegroundColor Cyan
Write-Host "Status:      Ready for deployment" -ForegroundColor Green
Write-Host "---------------------------------------------------------------------`n" -ForegroundColor DarkGray

if ($VerifyOnly) {
    Write-Host "PREFLIGHT CHECK COMPLETE!" -ForegroundColor Green
    Write-Host "Run without -VerifyOnly to deploy`n" -ForegroundColor Gray
    exit 0
}

# Deployment confirmation
$confirm = Read-Host "Deploy to Base Sepolia? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "`nDeployment cancelled`n" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host "                DEPLOYING TO BASE SEPOLIA                        " -ForegroundColor Green
Write-Host "=================================================================`n" -ForegroundColor Green

# Frontend deployment instructions
Write-Host "FRONTEND DEPLOYMENT (Vercel):" -ForegroundColor Cyan
Write-Host "---------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "1. Install Vercel CLI:" -ForegroundColor Yellow
Write-Host "   npm i -g vercel`n" -ForegroundColor Gray
Write-Host "2. Deploy:" -ForegroundColor Yellow
Write-Host "   vercel --prod`n" -ForegroundColor Gray
Write-Host "3. Set environment variables in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_NETWORK=baseSepolia" -ForegroundColor Gray
Write-Host "   NEXT_PUBLIC_DEMO_MODE=false" -ForegroundColor Gray
Write-Host "   NEXT_PUBLIC_USE_MOCK_DATA=false" -ForegroundColor Gray
Write-Host "   NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=(your RPC URL)" -ForegroundColor Gray
Write-Host "---------------------------------------------------------------------`n" -ForegroundColor DarkGray

# Contract deployment instructions
if (Test-Path "contracts") {
    Write-Host "CONTRACT DEPLOYMENT:" -ForegroundColor Cyan
    Write-Host "---------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "1. Deploy contracts:" -ForegroundColor Yellow
    Write-Host "   npx hardhat run scripts/deploy-voidscore.ts --network baseSepolia" -ForegroundColor Gray
    Write-Host "   npx hardhat run scripts/deploy-xporacle.ts --network baseSepolia" -ForegroundColor Gray
    Write-Host "   npx hardhat run scripts/deploy-voidmessaging.ts --network baseSepolia" -ForegroundColor Gray
    Write-Host "   npx hardhat run scripts/deploy-voidagency.ts --network baseSepolia`n" -ForegroundColor Gray
    Write-Host "2. Verify contracts:" -ForegroundColor Yellow
    Write-Host "   npx hardhat verify --network baseSepolia <ADDRESS> <ARGS>" -ForegroundColor Gray
    Write-Host "---------------------------------------------------------------------`n" -ForegroundColor DarkGray
}

# Post-deployment checklist
Write-Host "POST-DEPLOYMENT CHECKLIST:" -ForegroundColor Cyan
Write-Host "---------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[ ] Verify frontend loads at Vercel URL" -ForegroundColor Gray
Write-Host "[ ] Test wallet connection (MetaMask on Base Sepolia)" -ForegroundColor Gray
Write-Host "[ ] Verify contracts on Basescan" -ForegroundColor Gray
Write-Host "[ ] Test demo mode still works" -ForegroundColor Gray
Write-Host "[ ] Test live mode with testnet wallet" -ForegroundColor Gray
Write-Host "[ ] Update config/contracts.json with addresses" -ForegroundColor Gray
Write-Host "[ ] Share invite codes with beta testers" -ForegroundColor Gray
Write-Host "[ ] Monitor for errors" -ForegroundColor Gray
Write-Host "[ ] Post announcement on Twitter/Discord" -ForegroundColor Gray
Write-Host "---------------------------------------------------------------------`n" -ForegroundColor DarkGray

Write-Host "DOCUMENTATION:" -ForegroundColor Cyan
Write-Host "  PHASE-5-STARTUP.md - Full deployment guide" -ForegroundColor Gray
Write-Host "  TESTNET-METAVERSE-GUIDE.md - User onboarding" -ForegroundColor Gray
Write-Host "  DEPLOYMENT-CHECKLIST.md - Production checklist`n" -ForegroundColor Gray

Write-Host "Testnet deployment ready! Good luck!" -ForegroundColor Green
Write-Host "=================================================================`n" -ForegroundColor Cyan
