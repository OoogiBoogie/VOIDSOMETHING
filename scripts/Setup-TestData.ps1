# ============================================================================
# VOID PROTOCOL - TEST DATA SETUP SCRIPT
# ============================================================================
# This script populates your deployed contracts with test data so you can
# fully experience the metaverse with missions, tokens, and interactions.
# ============================================================================

param(
    [switch]$All,
    [switch]$Tokens,
    [switch]$Missions,
    [switch]$Escrows,
    [switch]$Stakes,
    [switch]$Help
)

# Colors
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"
$ErrorColor = "Red"

function Write-Status {
    param($Message, $Color = $InfoColor)
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

# Load deployment addresses
$deploymentPath = "deployments/baseSepolia.json"
if (!(Test-Path $deploymentPath)) {
    Write-Status "ERROR: Deployment file not found at $deploymentPath" $ErrorColor
    exit 1
}

$deployment = Get-Content $deploymentPath | ConvertFrom-Json
$RPC_URL = "https://sepolia.base.org"

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($key -eq "DEPLOYER_PRIVATE_KEY") {
                $env:DEPLOYER_KEY = $value
            }
            if ($key -eq "DEPLOYER_ADDRESS") {
                $env:DEPLOYER_ADDR = $value
            }
        }
    }
}

if (!$env:DEPLOYER_KEY) {
    Write-Status "ERROR: DEPLOYER_PRIVATE_KEY not found in .env" $ErrorColor
    exit 1
}

# Setup Foundry
$env:Path += ";C:\Users\rigof\.foundry\bin"
$env:FOUNDRY_DISABLE_NIGHTLY_WARNING = "true"

# ============================================================================
# FUNCTION: Mint Test Tokens
# ============================================================================
function Setup-TestTokens {
    Write-Status "`n=== MINTING TEST TOKENS ===" $InfoColor
    Write-Status "This gives you tokens to test staking, swaps, and fees`n" $WarningColor
    
    $amount = "1000000000000000000000" # 1000 tokens (18 decimals)
    
    # Mint VOID
    Write-Host "Minting 1000 VOID tokens..." -ForegroundColor $InfoColor
    cast send $($deployment.VOID) "mint(address,uint256)" $env:DEPLOYER_ADDR $amount `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Mint PSX
    Write-Host "Minting 1000 PSX tokens..." -ForegroundColor $InfoColor
    cast send $($deployment.PSX) "mint(address,uint256)" $env:DEPLOYER_ADDR $amount `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Mint CREATE
    Write-Host "Minting 1000 CREATE tokens..." -ForegroundColor $InfoColor
    cast send $($deployment.CREATE) "mint(address,uint256)" $env:DEPLOYER_ADDR $amount `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Mint SIGNAL
    Write-Host "Minting 1000 SIGNAL tokens..." -ForegroundColor $InfoColor
    cast send $($deployment.SIGNAL) "mint(address,uint256)" $env:DEPLOYER_ADDR $amount `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Mint AGENCY
    Write-Host "Minting 1000 AGENCY tokens..." -ForegroundColor $InfoColor
    cast send $($deployment.AGENCY) "mint(address,uint256)" $env:DEPLOYER_ADDR $amount `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Mint USDC (for swaps)
    Write-Host "Minting 10,000 USDC (test stablecoin)..." -ForegroundColor $InfoColor
    $usdcAmount = "10000000000" # 10,000 USDC (6 decimals)
    cast send $($deployment.USDC) "mint(address,uint256)" $env:DEPLOYER_ADDR $usdcAmount `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Mint WETH (for swaps)
    Write-Host "Minting 10 WETH..." -ForegroundColor $InfoColor
    $wethAmount = "10000000000000000000" # 10 WETH (18 decimals)
    cast send $($deployment.WETH) "mint(address,uint256)" $env:DEPLOYER_ADDR $wethAmount `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    Write-Status "`n[OK] $SuccessColor
    Write-Status "View your tokens on Basescan:" $InfoColor
    Write-Status "  https://sepolia.basescan.org/address/$env:DEPLOYER_ADDR" $InfoColor
}

# ============================================================================
# FUNCTION: Create Test Missions
# ============================================================================
function Setup-TestMissions {
    Write-Status "`n=== CREATING TEST MISSIONS ===" $InfoColor
    Write-Status "This creates sample missions you can complete to earn vXP`n" $WarningColor
    
    # Mission 1: Welcome Quest
    Write-Host "Creating Mission 1: Welcome to VOID..." -ForegroundColor $InfoColor
    $missionId1 = cast send $($deployment.MissionRegistry) `
        "createMission(string,uint256)" `
        "Welcome to VOID Protocol" `
        "100" `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY 2>&1 | Select-String "transactionHash" | ForEach-Object { $_.Line }
    Write-Status "[OK] $SuccessColor
    
    # Mission 2: First Stake
    Write-Host "Creating Mission 2: Stake VOID..." -ForegroundColor $InfoColor
    cast send $($deployment.MissionRegistry) `
        "createMission(string,uint256)" `
        "Stake your first VOID tokens" `
        "250" `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Mission 3: Social Quest
    Write-Host "Creating Mission 3: Join Community..." -ForegroundColor $InfoColor
    cast send $($deployment.MissionRegistry) `
        "createMission(string,uint256)" `
        "Join VOID community channels" `
        "150" `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Mission 4: Creator Quest
    Write-Host "Creating Mission 4: Create Content..." -ForegroundColor $InfoColor
    cast send $($deployment.MissionRegistry) `
        "createMission(string,uint256)" `
        "Submit your first creation" `
        "500" `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Mission 5: Trading Quest
    Write-Host "Creating Mission 5: First Swap..." -ForegroundColor $InfoColor
    cast send $($deployment.MissionRegistry) `
        "createMission(string,uint256)" `
        "Complete your first token swap" `
        "200" `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Check mission count
    $missionCount = cast call $($deployment.MissionRegistry) "missionCount()(uint256)" --rpc-url $RPC_URL
    Write-Status "`n[OK] $SuccessColor
    Write-Status "View missions on Basescan:" $InfoColor
    Write-Status "  https://sepolia.basescan.org/address/$($deployment.MissionRegistry)" $InfoColor
}

# ============================================================================
# FUNCTION: Create Test Escrows
# ============================================================================
function Setup-TestEscrows {
    Write-Status "`n=== CREATING TEST ESCROWS ===" $InfoColor
    Write-Status "This creates sample escrows to test the escrow system`n" $WarningColor
    
    # Approve tokens for escrow
    Write-Host "Approving VOID for escrow..." -ForegroundColor $InfoColor
    $approveAmount = "1000000000000000000000" # 1000 tokens
    cast send $($deployment.VOID) "approve(address,uint256)" $($deployment.EscrowVault) $approveAmount `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    
    # Create escrow 1: Payment for services
    Write-Host "Creating Escrow 1: Service payment..." -ForegroundColor $InfoColor
    $escrowAmount = "100000000000000000000" # 100 VOID
    cast send $($deployment.EscrowVault) `
        "createEscrow(address,address,uint256)" `
        "0x0000000000000000000000000000000000000001" `
        $($deployment.VOID) `
        $escrowAmount `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Create escrow 2: Creator payment
    Write-Host "Creating Escrow 2: Creator payment..." -ForegroundColor $InfoColor
    cast send $($deployment.EscrowVault) `
        "createEscrow(address,address,uint256)" `
        "0x0000000000000000000000000000000000000002" `
        $($deployment.VOID) `
        $escrowAmount `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Check escrow count
    $escrowCount = cast call $($deployment.EscrowVault) "escrowCount()(uint256)" --rpc-url $RPC_URL
    Write-Status "`n[OK] $SuccessColor
    Write-Status "View escrows on Basescan:" $InfoColor
    Write-Status "  https://sepolia.basescan.org/address/$($deployment.EscrowVault)" $InfoColor
}

# ============================================================================
# FUNCTION: Stake Test Tokens
# ============================================================================
function Setup-TestStakes {
    Write-Status "`n=== STAKING TEST TOKENS ===" $InfoColor
    Write-Status "This stakes VOID to test the staking system and APR boosts`n" $WarningColor
    
    # Approve VOID for staking
    Write-Host "Approving VOID for staking..." -ForegroundColor $InfoColor
    $approveAmount = "1000000000000000000000" # 1000 tokens
    cast send $($deployment.VOID) "approve(address,uint256)" $($deployment.xVOIDVault) $approveAmount `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    
    # Stake tokens
    Write-Host "Staking 100 VOID tokens..." -ForegroundColor $InfoColor
    $stakeAmount = "100000000000000000000" # 100 VOID
    cast send $($deployment.xVOIDVault) `
        "stake(uint256)" `
        $stakeAmount `
        --rpc-url $RPC_URL --private-key $env:DEPLOYER_KEY | Out-Null
    Write-Status "[OK] $SuccessColor
    
    # Check staked balance
    $totalStaked = cast call $($deployment.xVOIDVault) "totalStakedVOID()(uint256)" --rpc-url $RPC_URL
    Write-Status "`n[OK] $SuccessColor
    Write-Status "View vault on Basescan:" $InfoColor
    Write-Status "  https://sepolia.basescan.org/address/$($deployment.xVOIDVault)" $InfoColor
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if ($Help) {
    Write-Host "`nVOID Protocol - Test Data Setup" -ForegroundColor $InfoColor
    Write-Host "================================`n" -ForegroundColor $InfoColor
    Write-Host "Usage:" -ForegroundColor $WarningColor
    Write-Host "  .\scripts\Setup-TestData.ps1 -All          # Setup everything" -ForegroundColor $InfoColor
    Write-Host "  .\scripts\Setup-TestData.ps1 -Tokens       # Mint test tokens only" -ForegroundColor $InfoColor
    Write-Host "  .\scripts\Setup-TestData.ps1 -Missions     # Create missions only" -ForegroundColor $InfoColor
    Write-Host "  .\scripts\Setup-TestData.ps1 -Escrows      # Create escrows only" -ForegroundColor $InfoColor
    Write-Host "  .\scripts\Setup-TestData.ps1 -Stakes       # Stake tokens only`n" -ForegroundColor $InfoColor
    Write-Host "Examples:" -ForegroundColor $WarningColor
    Write-Host "  .\scripts\Setup-TestData.ps1 -All`n" -ForegroundColor $InfoColor
    exit 0
}

Write-Status "`n============================================================" $InfoColor
Write-Status "  VOID PROTOCOL - TEST DATA SETUP" $InfoColor
Write-Status "============================================================" $InfoColor
Write-Status "Network: Base Sepolia (Chain ID: $($deployment.chainId))" $InfoColor
Write-Status "Deployer: $env:DEPLOYER_ADDR`n" $InfoColor

if ($All -or $Tokens) {
    Setup-TestTokens
}

if ($All -or $Missions) {
    Setup-TestMissions
}

if ($All -or $Escrows) {
    Setup-TestEscrows
}

if ($All -or $Stakes) {
    Setup-TestStakes
}

if (!$All -and !$Tokens -and !$Missions -and !$Escrows -and !$Stakes) {
    Write-Status "No options specified. Use -Help for usage information." $WarningColor
    Write-Status "Quick start: .\scripts\Setup-TestData.ps1 -All" $InfoColor
    exit 0
}

Write-Status "`n============================================================" $SuccessColor
Write-Status "  TEST DATA SETUP COMPLETE!" $SuccessColor
Write-Status "============================================================" $SuccessColor
Write-Status "`nYour wallet now has:" $InfoColor
Write-Status "  [OK] $InfoColor
Write-Status "  [OK] $InfoColor
Write-Status "  [OK] $InfoColor
Write-Status "  [OK] $InfoColor
Write-Status "`nNext steps:" $WarningColor
Write-Status "  1. Run: npm run dev" $InfoColor
Write-Status "  2. Open: http://localhost:3000" $InfoColor
Write-Status "  3. Connect your MetaMask to Base Sepolia" $InfoColor
Write-Status "  4. Import private key: $env:DEPLOYER_KEY" $InfoColor
Write-Status "  5. Explore the metaverse!`n" $InfoColor

Write-Status "Your wallet: https://sepolia.basescan.org/address/$env:DEPLOYER_ADDR" $InfoColor

