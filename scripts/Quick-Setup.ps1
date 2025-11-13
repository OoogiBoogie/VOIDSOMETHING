# VOID Protocol - Quick Test Data Setup
# This script mints tokens and creates sample data for testing

$env:Path += ";C:\Users\rigof\.foundry\bin"
$env:FOUNDRY_DISABLE_NIGHTLY_WARNING = "true"

$RPC = "https://sepolia.base.org"
$DEPLOYER_KEY = "0xa94124fe7ef92901c2161a0bb19b5ff5c289c84efe9798f0f4b0fe97c9952442"
$DEPLOYER = "0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f"

# Load addresses
$d = Get-Content "deployments\baseSepolia.json" | ConvertFrom-Json

Write-Host "`n==== MINTING TEST TOKENS ====" -ForegroundColor Cyan

# Mint 1000 of each token
$amount = "1000000000000000000000"

Write-Host "Minting VOID..." -ForegroundColor Yellow
cast send $d.VOID "mint(address,uint256)" $DEPLOYER $amount --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] VOID minted" -ForegroundColor Green

Write-Host "Minting PSX..." -ForegroundColor Yellow
cast send $d.PSX "mint(address,uint256)" $DEPLOYER $amount --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] PSX minted" -ForegroundColor Green

Write-Host "Minting CREATE..." -ForegroundColor Yellow
cast send $d.CREATE "mint(address,uint256)" $DEPLOYER $amount --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] CREATE minted" -ForegroundColor Green

Write-Host "Minting SIGNAL..." -ForegroundColor Yellow
cast send $d.SIGNAL "mint(address,uint256)" $DEPLOYER $amount --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] SIGNAL minted" -ForegroundColor Green

Write-Host "Minting AGENCY..." -ForegroundColor Yellow
cast send $d.AGENCY "mint(address,uint256)" $DEPLOYER $amount --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] AGENCY minted" -ForegroundColor Green

Write-Host "Minting USDC..." -ForegroundColor Yellow
cast send $d.USDC "mint(address,uint256)" $DEPLOYER "10000000000" --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] USDC minted" -ForegroundColor Green

Write-Host "Minting WETH..." -ForegroundColor Yellow  
cast send $d.WETH "mint(address,uint256)" $DEPLOYER "10000000000000000000" --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] WETH minted" -ForegroundColor Green

Write-Host "`n==== CREATING MISSIONS ====" -ForegroundColor Cyan

Write-Host "Creating mission 1..." -ForegroundColor Yellow
cast send $d.MissionRegistry "createMission(string,uint256)" "Welcome to VOID" "100" --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] Mission 1 created (100 vXP)" -ForegroundColor Green

Write-Host "Creating mission 2..." -ForegroundColor Yellow
cast send $d.MissionRegistry "createMission(string,uint256)" "Stake VOID tokens" "250" --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] Mission 2 created (250 vXP)" -ForegroundColor Green

Write-Host "Creating mission 3..." -ForegroundColor Yellow
cast send $d.MissionRegistry "createMission(string,uint256)" "Join community" "150" --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] Mission 3 created (150 vXP)" -ForegroundColor Green

Write-Host "Creating mission 4..." -ForegroundColor Yellow
cast send $d.MissionRegistry "createMission(string,uint256)" "Create content" "500" --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] Mission 4 created (500 vXP)" -ForegroundColor Green

Write-Host "Creating mission 5..." -ForegroundColor Yellow
cast send $d.MissionRegistry "createMission(string,uint256)" "First token swap" "200" --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] Mission 5 created (200 vXP)" -ForegroundColor Green

Write-Host "`n==== STAKING VOID ====" -ForegroundColor Cyan

Write-Host "Approving VOID for staking..." -ForegroundColor Yellow
cast send $d.VOID "approve(address,uint256)" $d.xVOIDVault $amount --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] Approved" -ForegroundColor Green

Write-Host "Staking 100 VOID..." -ForegroundColor Yellow
cast send $d.xVOIDVault "stake(uint256)" "100000000000000000000" --rpc-url $RPC --private-key $DEPLOYER_KEY --legacy | Out-Null
Write-Host "[OK] 100 VOID staked" -ForegroundColor Green

Write-Host "`n==== SETUP COMPLETE! ====" -ForegroundColor Green
Write-Host "`nYou now have:" -ForegroundColor Cyan
Write-Host "  - 1000 VOID, PSX, CREATE, SIGNAL, AGENCY tokens" -ForegroundColor White
Write-Host "  - 10,000 USDC and 10 WETH" -ForegroundColor White
Write-Host "  - 5 active missions (total 1200 vXP available)" -ForegroundColor White
Write-Host "  - 100 VOID staked in xVOIDVault" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npm run dev" -ForegroundColor White
Write-Host "  2. Open: http://localhost:3000" -ForegroundColor White
Write-Host "  3. Connect MetaMask to Base Sepolia" -ForegroundColor White
Write-Host "  4. Import deployer key or use your own wallet" -ForegroundColor White
Write-Host "`nView your wallet: https://sepolia.basescan.org/address/$DEPLOYER`n" -ForegroundColor Cyan
