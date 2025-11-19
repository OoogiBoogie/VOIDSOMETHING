// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/VoidHookRouterV4.sol";
import "../contracts/XPOracle.sol";
import "../contracts/EscrowVault.sol";
import "../contracts/xVOIDVault.sol";
import "../contracts/MissionRegistry.sol";
import "../contracts/TokenExpansionOracle.sol";
import "../contracts/WorldLandTestnet.sol";
import "../contracts/VoidSwapTestnet.sol";

/**
 * @title RedeployPhase8Contracts
 * @notice Redeploys all 8 Phase 8/9 contracts with new secure wallet
 * @dev This replaces contracts still controlled by compromised wallet
 * 
 * OLD (COMPROMISED) WALLET: 0xc3dc4c7E449a0a1dD85B00559a5f80d2B16D6e2f
 * NEW (SECURE) WALLET: 0x8b288f5c273421FC3eD81Ef82D40C332452b6303
 * 
 * Deploy Order:
 * 1. VoidHookRouterV4 (fee distribution router)
 * 2. XPOracle (XP tracking)
 * 3. EscrowVault (job payments)
 * 4. xVOIDVault (staking)
 * 5. MissionRegistry (missions)
 * 6. TokenExpansionOracle (land expansion)
 * 7. WorldLandTestnet (land NFT)
 * 8. VoidSwapTestnet (DEX)
 */
contract RedeployPhase8Contracts is Script {
    // ============ EXISTING TOKEN ADDRESSES (Base Sepolia) ============
    address constant VOID_TOKEN = 0x8de4043445939B0D0Cc7d6c752057707279D9893;
    address constant PSX_TOKEN = 0x9E08A4291771d18ce9718A3Ce8adE6DC82113CC7;
    address constant CREATE_TOKEN = 0x99908B6127f45A0D4730a42DE8b4b74D313F956D;
    address constant AGENCY_TOKEN = 0xb270007B1D6EBbeF505612D8b3C779A536A7227b;
    address constant SIGNAL_TOKEN = 0x29c4172C243860f906C9625c983aE93F1147504B;
    address constant USDC_TOKEN = 0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9;
    
    // ============ PLACEHOLDER ADDRESSES (to be updated) ============
    // These will be set to deployer initially, then can be updated
    address public xVoidStakingPool;  // Will be the deployed xVOIDVault
    address public psxTreasury;
    address public createTreasury;
    address public agencyTreasury;
    address public grantsVault;
    address public securityReserve;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== PHASE 8/9 CONTRACTS REDEPLOYMENT ===");
        console.log("Deployer (NEW SECURE WALLET):", deployer);
        console.log("Network: Base Sepolia");
        console.log("");
        
        // Set placeholder treasuries to deployer for initial deployment
        psxTreasury = deployer;
        createTreasury = deployer;
        agencyTreasury = deployer;
        grantsVault = deployer;
        securityReserve = deployer;
        
        vm.startBroadcast(deployerPrivateKey);
        
        // ============ 1. Deploy xVOIDVault (needed by router) ============
        console.log("1. Deploying xVOIDVault...");
        xVOIDVault vault = new xVOIDVault(VOID_TOKEN);
        xVoidStakingPool = address(vault);
        console.log("   Deployed at:", address(vault));
        console.log("");
        
        // ============ 2. Deploy VoidHookRouterV4 ============
        console.log("2. Deploying VoidHookRouterV4...");
        VoidHookRouterV4 router = new VoidHookRouterV4(
            xVoidStakingPool,
            psxTreasury,
            createTreasury,
            agencyTreasury,
            grantsVault,
            securityReserve
        );
        console.log("   Deployed at:", address(router));
        console.log("");
        
        // ============ 3. Deploy XPOracle ============
        console.log("3. Deploying XPOracle...");
        XPOracle xpOracle = new XPOracle(deployer, deployer);
        console.log("   Deployed at:", address(xpOracle));
        console.log("");
        
        // ============ 4. Deploy EscrowVault ============
        console.log("4. Deploying EscrowVault...");
        EscrowVault escrow = new EscrowVault(deployer, deployer, deployer);
        console.log("   Deployed at:", address(escrow));
        console.log("");
        
        // ============ 5. Deploy MissionRegistry ============
        console.log("5. Deploying MissionRegistry...");
        MissionRegistry missions = new MissionRegistry(
            deployer,        // admin
            deployer,        // missionAI
            deployer,        // verifier
            address(0)       // voidEmitter (not deployed yet)
        );
        console.log("   Deployed at:", address(missions));
        console.log("");
        
        // ============ 6. Deploy TokenExpansionOracle ============
        console.log("6. Deploying TokenExpansionOracle...");
        TokenExpansionOracle expansionOracle = new TokenExpansionOracle(
            deployer,        // admin
            deployer,        // oracle
            deployer,        // governance
            500_000 * 10**18,  // minVolume (500k USD)
            100,             // minHolders
            1_000 * 10**18   // minFeesPaid (1k USD)
        );
        console.log("   Deployed at:", address(expansionOracle));
        console.log("");
        
        // ============ 7. Deploy WorldLandTestnet ============
        console.log("7. Deploying WorldLandTestnet...");
        WorldLandTestnet land = new WorldLandTestnet(
            VOID_TOKEN,
            100 * 10**18  // 100 VOID per parcel
        );
        console.log("   Deployed at:", address(land));
        console.log("");
        
        // ============ 8. Deploy VoidSwapTestnet ============
        console.log("8. Deploying VoidSwapTestnet...");
        VoidSwapTestnet swap = new VoidSwapTestnet(
            VOID_TOKEN,
            USDC_TOKEN,
            address(router)  // Fee router
        );
        console.log("   Deployed at:", address(swap));
        console.log("");
        
        vm.stopBroadcast();
        
        // ============ DEPLOYMENT SUMMARY ============
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("");
        console.log("Add these to .env.local:");
        console.log("");
        console.log("# PHASE 8/9 CONTRACTS (Redeployed Nov 16, 2025)");
        console.log("NEXT_PUBLIC_VOID_HOOK_ROUTER=%s", address(router));
        console.log("NEXT_PUBLIC_XP_ORACLE=%s", address(xpOracle));
        console.log("NEXT_PUBLIC_ESCROW_VAULT=%s", address(escrow));
        console.log("NEXT_PUBLIC_XVOID_VAULT=%s", address(vault));
        console.log("NEXT_PUBLIC_MISSION_REGISTRY=%s", address(missions));
        console.log("NEXT_PUBLIC_TOKEN_EXPANSION_ORACLE=%s", address(expansionOracle));
        console.log("NEXT_PUBLIC_WORLD_LAND=%s", address(land));
        console.log("NEXT_PUBLIC_VOID_SWAP=%s", address(swap));
        console.log("");
        console.log("=== SECURITY VERIFICATION ===");
        console.log("All contracts deployed with deployer:", deployer);
        console.log("Run audit script to verify ownership:");
        console.log(".\\scripts\\audit-ownership.ps1");
        console.log("");
        console.log("=== NEXT STEPS ===");
        console.log("1. Update .env.local with new addresses above");
        console.log("2. Update deployments/baseSepolia.json");
        console.log("3. Run ownership audit to verify security");
        console.log("4. Update treasury addresses if needed");
        console.log("5. Restart dev server and test");
    }
}
