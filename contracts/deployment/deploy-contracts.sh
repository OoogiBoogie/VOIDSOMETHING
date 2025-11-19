#!/usr/bin/env node

/**
 * PHASE 5A — CONTRACT DEPLOYMENT SCRIPT (Foundry)
 * 
 * Deploys all Phase 5 contracts to Base Sepolia or Base Mainnet.
 * 
 * Prerequisites:
 * - Foundry installed (foundryup)
 * - .env configured with PRIVATE_KEY and RPC URLs
 * - Funded deployer wallet
 * 
 * Usage:
 *   ./deploy-contracts.sh sepolia
 *   ./deploy-contracts.sh mainnet
 */

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ "$#" -ne 1 ]; then
    echo -e "${RED}Usage: $0 <sepolia|mainnet>${NC}"
    exit 1
fi

NETWORK=$1

# Validate network
if [ "$NETWORK" != "sepolia" ] && [ "$NETWORK" != "mainnet" ]; then
    echo -e "${RED}Invalid network: $NETWORK (must be 'sepolia' or 'mainnet')${NC}"
    exit 1
fi

# Load environment variables
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

source .env

# Set RPC and chain ID
if [ "$NETWORK" == "sepolia" ]; then
    RPC_URL=$BASE_SEPOLIA_RPC_URL
    CHAIN_ID=84532
    ETHERSCAN_API_KEY=$BASESCAN_API_KEY
else
    RPC_URL=$BASE_MAINNET_RPC_URL
    CHAIN_ID=8453
    ETHERSCAN_API_KEY=$BASESCAN_API_KEY
fi

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Deploying to: $NETWORK${NC}"
echo -e "${YELLOW}Chain ID: $CHAIN_ID${NC}"
echo -e "${YELLOW}RPC: ${RPC_URL:0:30}...${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check Foundry installation
if ! command -v forge &> /dev/null; then
    echo -e "${RED}Foundry not found. Install with: curl -L https://foundry.paradigm.xyz | bash${NC}"
    exit 1
fi

# Build contracts
echo -e "${GREEN}Building contracts...${NC}"
forge build

# Deploy VoidWorldRegistry
echo -e "${GREEN}Deploying VoidWorldRegistry...${NC}"
WORLD_REGISTRY=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --verify \
    src/VoidWorldRegistry.sol:VoidWorldRegistry \
    | grep "Deployed to:" | awk '{print $3}')

echo -e "${GREEN}✅ VoidWorldRegistry: $WORLD_REGISTRY${NC}"

# Deploy ParcelOwnership
echo -e "${GREEN}Deploying ParcelOwnership...${NC}"
PARCEL_OWNERSHIP=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --verify \
    --constructor-args $WORLD_REGISTRY \
    src/ParcelOwnership.sol:ParcelOwnership \
    | grep "Deployed to:" | awk '{print $3}')

echo -e "${GREEN}✅ ParcelOwnership: $PARCEL_OWNERSHIP${NC}"

# Deploy PlayerPositionOracle
echo -e "${GREEN}Deploying PlayerPositionOracle...${NC}"
PLAYER_ORACLE=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --verify \
    --constructor-args $WORLD_REGISTRY \
    src/PlayerPositionOracle.sol:PlayerPositionOracle \
    | grep "Deployed to:" | awk '{print $3}')

echo -e "${GREEN}✅ PlayerPositionOracle: $PLAYER_ORACLE${NC}"

# Deploy VoidAirdropTracker
echo -e "${GREEN}Deploying VoidAirdropTracker...${NC}"
AIRDROP_TRACKER=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --verify \
    --constructor-args $WORLD_REGISTRY \
    src/VoidAirdropTracker.sol:VoidAirdropTracker \
    | grep "Deployed to:" | awk '{print $3}')

echo -e "${GREEN}✅ VoidAirdropTracker: $AIRDROP_TRACKER${NC}"

# Save addresses to file
OUTPUT_FILE="deployments/${NETWORK}-addresses.json"
mkdir -p deployments

cat > $OUTPUT_FILE <<EOF
{
  "network": "$NETWORK",
  "chainId": $CHAIN_ID,
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "contracts": {
    "worldRegistry": "$WORLD_REGISTRY",
    "parcelOwnership": "$PARCEL_OWNERSHIP",
    "playerOracle": "$PLAYER_ORACLE",
    "airdropTracker": "$AIRDROP_TRACKER"
  }
}
EOF

echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}Addresses saved to: $OUTPUT_FILE${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Update .env.$NETWORK with these addresses"
echo -e "2. Update contracts/deployment/contracts.config.ts"
echo -e "3. Test contract interactions"
echo ""
