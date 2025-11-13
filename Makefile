# VOID Protocol Deployment Makefile
# Simplifies testnet/mainnet deployment with Foundry

.PHONY: help install build test deploy-testnet deploy-mainnet verify clean

# Default target
help:
	@echo "VOID Protocol Deployment Commands"
	@echo "=================================="
	@echo ""
	@echo "Setup:"
	@echo "  make install        Install Foundry dependencies"
	@echo "  make build          Compile contracts"
	@echo "  make test           Run tests"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy-testnet Deploy to Base Sepolia (testnet)"
	@echo "  make deploy-mainnet Deploy to Base Mainnet (PRODUCTION)"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean          Clean build artifacts"
	@echo ""

# Install Foundry dependencies
install:
	@echo "Installing Foundry dependencies..."
	forge install foundry-rs/forge-std --no-commit

# Build contracts
build:
	@echo "Compiling contracts..."
	forge build

# Run tests
test:
	@echo "Running tests..."
	forge test -vv

# Deploy to Base Sepolia (testnet)
deploy-testnet:
	@echo "========================================="
	@echo "Deploying to Base Sepolia (Testnet)"
	@echo "========================================="
	forge script script/DeployProduction.s.sol \
		--rpc-url base_sepolia \
		--broadcast \
		--verify \
		-vvv

# Deploy to Base Mainnet (PRODUCTION)
deploy-mainnet:
	@echo "⚠️  DEPLOYING TO MAINNET ⚠️"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
	@sleep 5
	@echo ""
	@echo "Deployer: $$(cast wallet address --private-key $$DEPLOYER_PRIVATE_KEY)"
	@echo "Balance: $$(cast balance $$(cast wallet address --private-key $$DEPLOYER_PRIVATE_KEY) --rpc-url $$BASE_MAINNET_RPC_URL) wei"
	@echo ""
	forge script script/Deploy.s.sol \
		--rpc-url base_mainnet \
		--broadcast \
		--verify \
		-vvvv

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	forge clean
	rm -rf broadcast cache out

# Quick deploy (testnet, no verification)
deploy-quick:
	@echo "Quick deploy to Base Sepolia (no verification)..."
	forge script script/Deploy.s.sol \
		--rpc-url base_sepolia \
		--broadcast
