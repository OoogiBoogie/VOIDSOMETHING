// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/utility-burn/VoidBurnUtility.sol";
import "../contracts/utility-burn/DistrictAccessBurn.sol";
import "../contracts/utility-burn/LandUpgradeBurn.sol";
import "../contracts/utility-burn/CreatorToolsBurn.sol";
import "../contracts/utility-burn/PrestigeBurn.sol";
import "../contracts/utility-burn/MiniAppBurnAccess.sol";
import "../contracts/utility-burn/AIUtilityGovernor.sol";

contract DeployBurnSystem is Script {
    // VOID token on Base Sepolia
    address constant VOID_TOKEN = 0x8de4043445939B0D0Cc7d6c752057707279D9893;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("VOID BURN SYSTEM DEPLOYMENT");
        console.log("===========================================");
        console.log("Deployer:", deployer);
        console.log("VOID Token:", VOID_TOKEN);
        console.log("");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy VoidBurnUtility (core burn engine)
        console.log("1. Deploying VoidBurnUtility...");
        VoidBurnUtility burnUtility = new VoidBurnUtility(VOID_TOKEN);
        console.log("   Deployed at:", address(burnUtility));
        console.log("");
        
        // 2. Deploy DistrictAccessBurn
        console.log("2. Deploying DistrictAccessBurn...");
        DistrictAccessBurn districtBurn = new DistrictAccessBurn(address(burnUtility));
        console.log("   Deployed at:", address(districtBurn));
        console.log("");
        
        // 3. Deploy LandUpgradeBurn
        console.log("3. Deploying LandUpgradeBurn...");
        LandUpgradeBurn landBurn = new LandUpgradeBurn(address(burnUtility));
        console.log("   Deployed at:", address(landBurn));
        console.log("");
        
        // 4. Deploy CreatorToolsBurn
        console.log("4. Deploying CreatorToolsBurn...");
        CreatorToolsBurn creatorBurn = new CreatorToolsBurn(address(burnUtility));
        console.log("   Deployed at:", address(creatorBurn));
        console.log("");
        
        // 5. Deploy PrestigeBurn
        console.log("5. Deploying PrestigeBurn...");
        PrestigeBurn prestigeBurn = new PrestigeBurn(address(burnUtility));
        console.log("   Deployed at:", address(prestigeBurn));
        console.log("");
        
        // 6. Deploy MiniAppBurnAccess
        console.log("6. Deploying MiniAppBurnAccess...");
        MiniAppBurnAccess miniAppBurn = new MiniAppBurnAccess(address(burnUtility));
        console.log("   Deployed at:", address(miniAppBurn));
        console.log("");
        
        // 7. Deploy AIUtilityGovernor
        console.log("7. Deploying AIUtilityGovernor...");
        AIUtilityGovernor governor = new AIUtilityGovernor(
            address(burnUtility),
            address(districtBurn),
            address(landBurn),
            address(creatorBurn),
            address(prestigeBurn),
            address(miniAppBurn)
        );
        console.log("   Deployed at:", address(governor));
        console.log("");
        
        // Grant BURN_MANAGER_ROLE to specialized contracts
        console.log("8. Granting BURN_MANAGER_ROLE to specialized contracts...");
        bytes32 BURN_MANAGER_ROLE = keccak256("BURN_MANAGER_ROLE");
        burnUtility.grantRole(BURN_MANAGER_ROLE, address(districtBurn));
        burnUtility.grantRole(BURN_MANAGER_ROLE, address(landBurn));
        burnUtility.grantRole(BURN_MANAGER_ROLE, address(creatorBurn));
        burnUtility.grantRole(BURN_MANAGER_ROLE, address(prestigeBurn));
        burnUtility.grantRole(BURN_MANAGER_ROLE, address(miniAppBurn));
        console.log("   Roles granted successfully");
        console.log("");
        
        // Grant GOVERNOR_ROLE to AIUtilityGovernor
        console.log("9. Granting GOVERNOR_ROLE to AIUtilityGovernor...");
        bytes32 GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
        burnUtility.grantRole(GOVERNOR_ROLE, address(governor));
        console.log("   Role granted successfully");
        console.log("");
        
        vm.stopBroadcast();
        
        // Print deployment summary
        console.log("===========================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("===========================================");
        console.log("");
        console.log("Add these to your .env.local file:");
        console.log("");
        console.log("NEXT_PUBLIC_VOID_BURN_UTILITY=%s", address(burnUtility));
        console.log("NEXT_PUBLIC_DISTRICT_ACCESS_BURN=%s", address(districtBurn));
        console.log("NEXT_PUBLIC_LAND_UPGRADE_BURN=%s", address(landBurn));
        console.log("NEXT_PUBLIC_CREATOR_TOOLS_BURN=%s", address(creatorBurn));
        console.log("NEXT_PUBLIC_PRESTIGE_BURN=%s", address(prestigeBurn));
        console.log("NEXT_PUBLIC_MINIAPP_BURN_ACCESS=%s", address(miniAppBurn));
        console.log("NEXT_PUBLIC_AI_UTILITY_GOVERNOR=%s", address(governor));
        console.log("");
        console.log("===========================================");
    }
}
