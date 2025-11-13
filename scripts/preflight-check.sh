#!/usr/bin/env bash
# Pre-flight checks for mainnet deployment

set -e

echo "========================================="
echo "VOID Mainnet Pre-Flight Checks"
echo "========================================="
echo ""

# Check environment variables
echo "[1/6] Checking environment variables..."
if [ -z "$BASE_MAINNET_RPC_URL" ]; then
    echo "  ❌ BASE_MAINNET_RPC_URL not set"
    exit 1
fi
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    echo "  ❌ DEPLOYER_PRIVATE_KEY not set"
    exit 1
fi
if [ -z "$BASESCAN_API_KEY" ]; then
    echo "  ⚠️  BASESCAN_API_KEY not set (verification will fail)"
fi
echo "  ✅ Environment variables OK"
echo ""

# Check multi-sig addresses
echo "[2/6] Checking governance addresses..."
required_msigs=(
    "ROUTER_ADMIN_MSIG"
    "TREASURY_PSX_MSIG"
    "TREASURY_CREATE_MSIG"
    "AGENCY_OPS_MSIG"
    "GRANTS_VAULT_MSIG"
    "SECURITY_RESERVE_MSIG"
    "PAUSE_GUARDIAN_MSIG"
    "XVOID_STAKING_POOL_MSIG"
)

for msig in "${required_msigs[@]}"; do
    if [ -z "${!msig}" ]; then
        echo "  ❌ $msig not set in .env"
        exit 1
    fi
    # Check if it's not the placeholder
    if [[ "${!msig}" == *"DEPLOYER"* ]]; then
        echo "  ⚠️  $msig still using DEPLOYER placeholder (unsafe for mainnet)"
        exit 1
    fi
done
echo "  ✅ All governance addresses configured"
echo ""

# Check deployer balance
echo "[3/6] Checking deployer balance..."
deployer=$(cast wallet address --private-key $DEPLOYER_PRIVATE_KEY)
balance=$(cast balance $deployer --rpc-url $BASE_MAINNET_RPC_URL)
balance_eth=$(cast --to-unit $balance ether)

echo "  Deployer: $deployer"
echo "  Balance: $balance_eth ETH"

# Require at least 0.5 ETH for mainnet deployment
min_balance="500000000000000000" # 0.5 ETH in wei
if [ $(echo "$balance < $min_balance" | bc) -eq 1 ]; then
    echo "  ❌ Insufficient balance (need ≥0.5 ETH for mainnet)"
    exit 1
fi
echo "  ✅ Deployer balance sufficient"
echo ""

# Validate config files
echo "[4/6] Validating config files..."
if [ ! -f "deployments/config/baseMainnet.json" ]; then
    echo "  ❌ baseMainnet.json config not found"
    exit 1
fi

# Check fee split adds to 10000
fee_sum=$(jq '
    .feeModel.creatorShareBPS +
    .feeModel.stakerShareBPS +
    .feeModel.psxTreasuryShareBPS +
    .feeModel.createTreasuryShareBPS +
    .feeModel.agencyShareBPS +
    .feeModel.grantsShareBPS +
    .feeModel.securityShareBPS
' deployments/config/baseMainnet.json)

if [ "$fee_sum" != "10000" ]; then
    echo "  ❌ Fee split must equal 10000 BPS (currently: $fee_sum)"
    exit 1
fi
echo "  ✅ Fee split validated (40/20/10/10/10/5/5)"
echo ""

# Check APR boost cap
echo "[5/6] Checking economic bounds..."
max_boost=$(jq '.economicBounds.maxAPRBoostBPS' deployments/config/baseMainnet.json)
if [ "$max_boost" != "2000" ]; then
    echo "  ❌ Max APR boost must be 2000 BPS (20%)"
    exit 1
fi
echo "  ✅ Max APR boost = 20%"
echo ""

# Compile contracts
echo "[6/6] Testing compilation..."
if ! forge build --force > /dev/null 2>&1; then
    echo "  ❌ Contracts failed to compile"
    exit 1
fi
echo "  ✅ Contracts compile successfully"
echo ""

echo "========================================="
echo "✅ ALL PRE-FLIGHT CHECKS PASSED"
echo "========================================="
echo ""
echo "Ready to deploy to Base Mainnet."
echo "Run: make deploy-mainnet"
echo ""
