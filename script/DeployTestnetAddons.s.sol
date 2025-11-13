// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/WorldLandTestnet.sol";
import "../contracts/VoidSwapTestnet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeployTestnetAddons
 * @notice Deploy WorldLandTestnet and VoidSwapTestnet to Base Sepolia
 * @dev Run with: forge script script/DeployTestnetAddons.s.sol --rpc-url https://sepolia.base.org --broadcast -vvv
 */
contract DeployTestnetAddons is Script {
    // Existing deployed addresses (from .env or baseSepolia.json)
    address constant VOID_TOKEN = 0x8de4043445939B0D0Cc7d6c752057707279D9893;
    address constant USDC_TOKEN = 0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9;
    address constant VOID_HOOK_ROUTER = 0x687E678aB2152d9e0952d42B0F872604533D25a9;
    
    // Land pricing (100 VOID per parcel = 100e18)
    uint256 constant PARCEL_PRICE = 100 ether;
    
    // Swap initial liquidity
    uint256 constant INITIAL_VOID_LIQUIDITY = 10_000 ether;  // 10,000 VOID
    uint256 constant INITIAL_USDC_LIQUIDITY = 50_000e6;      // 50,000 USDC (6 decimals)
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("\n========================================");
        console.log("VOID TESTNET ADDONS DEPLOYMENT");
        console.log("========================================\n");
        console.log("Deployer:", deployer);
        console.log("Network: Base Sepolia (84532)");
        console.log("VOID Token:", VOID_TOKEN);
        console.log("USDC Token:", USDC_TOKEN);
        console.log("Fee Router:", VOID_HOOK_ROUTER);
        console.log("");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // ============ 1. Deploy WorldLandTestnet ============
        
        console.log("[1/4] Deploying WorldLandTestnet...");
        WorldLandTestnet land = new WorldLandTestnet(
            VOID_TOKEN,
            PARCEL_PRICE
        );
        console.log("  WorldLandTestnet deployed:", address(land));
        console.log("  Price per parcel:", PARCEL_PRICE / 1e18, "VOID");
        console.log("  Total parcels: 1600 (40x40 grid)");
        console.log("");
        
        // ============ 2. Deploy VoidSwapTestnet ============
        
        console.log("[2/4] Deploying VoidSwapTestnet...");
        VoidSwapTestnet swap = new VoidSwapTestnet(
            VOID_TOKEN,
            USDC_TOKEN,
            VOID_HOOK_ROUTER
        );
        console.log("  VoidSwapTestnet deployed:", address(swap));
        console.log("  Fee: 0.3% routed to VoidHookRouterV4");
        console.log("");
        
        // ============ 3. Add Initial Liquidity ============
        
        console.log("[3/4] Adding initial liquidity to swap...");
        
        // Mint liquidity tokens to deployer
        (bool successVoid,) = VOID_TOKEN.call(
            abi.encodeWithSignature("mint(address,uint256)", deployer, INITIAL_VOID_LIQUIDITY)
        );
        
        (bool successUsdc,) = USDC_TOKEN.call(
            abi.encodeWithSignature("mint(address,uint256)", deployer, INITIAL_USDC_LIQUIDITY)
        );
        
        if (successVoid && successUsdc) {
            console.log("  Minted liquidity tokens");
            
            // Approve swap contract
            IERC20(VOID_TOKEN).approve(address(swap), INITIAL_VOID_LIQUIDITY);
            IERC20(USDC_TOKEN).approve(address(swap), INITIAL_USDC_LIQUIDITY);
            console.log("  Approved swap contract");
            
            // Add liquidity
            swap.addLiquidity(INITIAL_VOID_LIQUIDITY, INITIAL_USDC_LIQUIDITY);
            console.log("  Added liquidity:");
            console.log("    VOID:", INITIAL_VOID_LIQUIDITY / 1e18);
            console.log("    USDC:", INITIAL_USDC_LIQUIDITY / 1e6);
            
            uint256 price = swap.getPrice();
            console.log("  Initial price: 1 USDC =", price / 1e18, "VOID");
        } else {
            console.log("  WARNING: Could not mint liquidity tokens (check mint permissions)");
        }
        console.log("");
        
        // ============ 4. Summary ============
        
        console.log("[4/4] Deployment Summary");
        console.log("========================================");
        console.log("");
        console.log("WorldLandTestnet:", address(land));
        console.log("VoidSwapTestnet:", address(swap));
        console.log("");
        console.log("Update .env with:");
        console.log("NEXT_PUBLIC_WORLD_LAND_ADDRESS=", address(land));
        console.log("NEXT_PUBLIC_VOID_SWAP_ADDRESS=", address(swap));
        console.log("");
        console.log("Update deployments/baseSepolia.json:");
        console.log('{');
        console.log('  "worldLand": "', address(land), '",');
        console.log('  "voidSwap": "', address(swap), '"');
        console.log('}');
        console.log("");
        console.log("Basescan links:");
        console.log("  Land:", string.concat("https://sepolia.basescan.org/address/", _addressToString(address(land))));
        console.log("  Swap:", string.concat("https://sepolia.basescan.org/address/", _addressToString(address(swap))));
        console.log("");
        console.log("========================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("========================================\n");
        
        vm.stopBroadcast();
    }
    
    // Helper to convert address to string
    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes20 value = bytes20(_addr);
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i] & 0x0f)];
        }
        return string(str);
    }
}
