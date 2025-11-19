// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/utility-burn/VoidBurnUtilitySeasonal.sol";
import "../contracts/rewards/XPRewardSystemSeasonal.sol";
import "../contracts/utility-burn/DistrictAccessBurnSeasonal.sol";
import "../contracts/utility-burn/LandUpgradeBurnSeasonal.sol";
import "../contracts/utility-burn/CreatorToolsBurnSeasonal.sol";
import "../contracts/utility-burn/PrestigeBurnSeasonal.sol";
import "../contracts/utility-burn/MiniAppBurnAccessSeasonal.sol";

contract DeploySeasonalBurnSystem is Script {
    address constant VOID_TOKEN = 0x8de4043445939B0D0Cc7d6c752057707279D9893; // Base Sepolia

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        console.log("\n=================================================================");
        console.log("VOID SEASONAL BURN SYSTEM - DEPLOYMENT");
        console.log("=================================================================\n");
        
        vm.startBroadcast(deployerPrivateKey);

        address deployer = vm.addr(deployerPrivateKey);
        console.log("Deploying with account:", deployer);
        console.log("Account balance:", deployer.balance / 1e18, "ETH");
        console.log("");

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 1: Deploy VoidBurnUtilitySeasonal
        // ═══════════════════════════════════════════════════════════════════════════

        console.log("Step 1: Deploying VoidBurnUtilitySeasonal...");
        console.log("  - Initializes Season 0 (90-day duration)");
        console.log("  - Daily credit cap: 6k VOID");
        console.log("  - Seasonal credit cap: 100k VOID\n");

        VoidBurnUtilitySeasonal burnUtility = new VoidBurnUtilitySeasonal(VOID_TOKEN);
        console.log("  VoidBurnUtilitySeasonal deployed to:", address(burnUtility));

        console.log("\n  Season 0 auto-initialized (90 days, 6k daily cap, 100k season cap)");

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 2: Deploy XPRewardSystemSeasonal
        // ═══════════════════════════════════════════════════════════════════════════

        console.log("\n\nStep 2: Deploying XPRewardSystemSeasonal...");
        console.log("  - Seasonal XP tracking");
        console.log("  - Lifetime level progression");
        console.log("  - Airdrop weight calculation\n");

        XPRewardSystemSeasonal xpSystem = new XPRewardSystemSeasonal(address(burnUtility));
        console.log("  XPRewardSystemSeasonal deployed to:", address(xpSystem));

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 3: Deploy Module Contracts
        // ═══════════════════════════════════════════════════════════════════════════

        console.log("\n\nStep 3: Deploying Module Contracts...\n");

        console.log("  3a: DistrictAccessBurnSeasonal...");
        DistrictAccessBurnSeasonal districtAccess = new DistrictAccessBurnSeasonal(address(burnUtility));
        console.log("      Deployed to:", address(districtAccess));

        console.log("\n  3b: LandUpgradeBurnSeasonal...");
        LandUpgradeBurnSeasonal landUpgrade = new LandUpgradeBurnSeasonal(address(burnUtility));
        console.log("      Deployed to:", address(landUpgrade));

        console.log("\n  3c: CreatorToolsBurnSeasonal...");
        CreatorToolsBurnSeasonal creatorTools = new CreatorToolsBurnSeasonal(address(burnUtility));
        console.log("      Deployed to:", address(creatorTools));

        console.log("\n  3d: PrestigeBurnSeasonal...");
        PrestigeBurnSeasonal prestige = new PrestigeBurnSeasonal(address(burnUtility));
        console.log("      Deployed to:", address(prestige));

        console.log("\n  3e: MiniAppBurnAccessSeasonal...");
        MiniAppBurnAccessSeasonal miniAppAccess = new MiniAppBurnAccessSeasonal(address(burnUtility));
        console.log("      Deployed to:", address(miniAppAccess));

        // ═══════════════════════════════════════════════════════════════════════════
        // STEP 4: Configure Roles
        // ═══════════════════════════════════════════════════════════════════════════

        console.log("\n\nStep 4: Configuring Roles...\n");

        bytes32 BURN_MANAGER_ROLE = burnUtility.BURN_MANAGER_ROLE();

        console.log("  Granting BURN_MANAGER_ROLE to DistrictAccessBurnSeasonal...");
        burnUtility.grantRole(BURN_MANAGER_ROLE, address(districtAccess));

        console.log("  Granting BURN_MANAGER_ROLE to LandUpgradeBurnSeasonal...");
        burnUtility.grantRole(BURN_MANAGER_ROLE, address(landUpgrade));

        console.log("  Granting BURN_MANAGER_ROLE to CreatorToolsBurnSeasonal...");
        burnUtility.grantRole(BURN_MANAGER_ROLE, address(creatorTools));

        console.log("  Granting BURN_MANAGER_ROLE to PrestigeBurnSeasonal...");
        burnUtility.grantRole(BURN_MANAGER_ROLE, address(prestige));

        console.log("  Granting BURN_MANAGER_ROLE to MiniAppBurnAccessSeasonal...");
        burnUtility.grantRole(BURN_MANAGER_ROLE, address(miniAppAccess));

        console.log("\n  All modules granted BURN_MANAGER_ROLE");

        vm.stopBroadcast();

        // ═══════════════════════════════════════════════════════════════════════════
        // DEPLOYMENT SUMMARY
        // ═══════════════════════════════════════════════════════════════════════════

        console.log("\n\n=================================================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("=================================================================\n");

        console.log("Contract Addresses:\n");
        console.log("Core:");
        console.log("  VoidBurnUtilitySeasonal:    ", address(burnUtility));
        console.log("  XPRewardSystemSeasonal:     ", address(xpSystem));
        console.log("\nModules:");
        console.log("  DistrictAccessBurnSeasonal: ", address(districtAccess));
        console.log("  LandUpgradeBurnSeasonal:    ", address(landUpgrade));
        console.log("  CreatorToolsBurnSeasonal:   ", address(creatorTools));
        console.log("  PrestigeBurnSeasonal:       ", address(prestige));
        console.log("  MiniAppBurnAccessSeasonal:  ", address(miniAppAccess));

        console.log("\n\nNext Steps:");
        console.log("  1. Update hooks/useSeasonalBurn.ts with deployed addresses");
        console.log("  2. Run QA test suite (48 test cases)");
        console.log("  3. Verify contracts on Basescan");
        console.log("  4. Test frontend integration");
        console.log("\n=================================================================\n");
    }
}
