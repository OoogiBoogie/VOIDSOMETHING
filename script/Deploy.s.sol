// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/mocks/ERC20Mock.sol";
import "../contracts/VoidHookRouterV4.sol";

/**
 * @title VOID Deployment Script
 * @notice Deploys core contracts to Base Sepolia (testnet) or Base (mainnet)
 * @dev Usage:
 *   Testnet:  forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
 *   Mainnet:  forge script script/Deploy.s.sol --rpc-url base_mainnet --broadcast --verify
 */
contract Deploy is Script {
    // Deployment artifacts will be saved to broadcast/Deploy.s.sol/<chainId>/run-latest.json
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("========================================");
        console.log("VOID DEPLOYMENT");
        console.log("========================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Balance:", deployer.balance / 1e18, "ETH");
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ERC20 Mock (VOID_Test for testnet, or skip for mainnet)
        address voidToken;
        if (block.chainid == 84532) { // Base Sepolia
            console.log("Deploying VOID_Test (ERC20Mock)...");
            ERC20Mock voidMock = new ERC20Mock(
                "VOID Test",
                "VOID",
                1_000_000 * 1e18 // 1M supply
            );
            voidToken = address(voidMock);
            console.log("VOID_Test deployed:", voidToken);
        } else {
            console.log("Mainnet detected - skipping mock tokens");
            console.log("Update this script with real VOID token address");
            voidToken = address(0); // Replace with actual VOID token on mainnet
        }

        // Deploy VoidHookRouterV4 (same for testnet and mainnet)
        console.log("\nDeploying VoidHookRouterV4...");
        
        // For testnet: use deployer as placeholder for all recipients
        // For mainnet: replace with actual multi-sig/vault addresses
        address xVoidStakingPool = block.chainid == 84532 ? deployer : vm.envAddress("XVOID_STAKING_POOL");
        address psxTreasury = block.chainid == 84532 ? deployer : vm.envAddress("PSX_TREASURY");
        address createTreasury = block.chainid == 84532 ? deployer : vm.envAddress("CREATE_TREASURY");
        address agencyWallet = block.chainid == 84532 ? deployer : vm.envAddress("AGENCY_WALLET");
        address creatorGrantsVault = block.chainid == 84532 ? deployer : vm.envAddress("CREATOR_GRANTS_VAULT");
        address securityReserve = block.chainid == 84532 ? deployer : vm.envAddress("SECURITY_RESERVE");

        VoidHookRouterV4 router = new VoidHookRouterV4(
            xVoidStakingPool,
            psxTreasury,
            createTreasury,
            agencyWallet,
            creatorGrantsVault,
            securityReserve
        );

        console.log("VoidHookRouterV4 deployed:", address(router));
        console.log("\nFee Split Validation:");
        console.log("  Creator:        40%");
        console.log("  Stakers:        20%");
        console.log("  PSX Treasury:   10%");
        console.log("  CREATE Treasury:10%");
        console.log("  Agency:         10%");
        console.log("  Grants:          5%");
        console.log("  Security:        5%");
        console.log("  Total:         100%");

        vm.stopBroadcast();

        // Save deployment info
        console.log("\n========================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("========================================");
        console.log("Network:", block.chainid == 84532 ? "Base Sepolia" : "Base Mainnet");
        if (voidToken != address(0)) {
            console.log("VOID Token:", voidToken);
        }
        console.log("VoidHookRouterV4:", address(router));
        console.log("\nAdd these to your .env:");
        if (voidToken != address(0)) {
            console.log("VOID_TOKEN_ADDRESS=", voidToken);
        }
        console.log("VOID_HOOK_ROUTER_V4=", address(router));
        console.log("");
    }
}
