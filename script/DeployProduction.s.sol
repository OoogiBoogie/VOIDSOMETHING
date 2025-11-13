// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/StdJson.sol";
import "../contracts/VoidHookRouterV4.sol";
import "../contracts/mocks/ERC20Mock.sol";
import "../contracts/XPOracle.sol";
import "../contracts/EscrowVault.sol";
import "../contracts/MissionRegistry.sol";
import "../contracts/TokenExpansionOracle.sol";
import "../contracts/xVOIDVault.sol";

/**
 * @title VOID Production Deployment Script
 * @notice Deploys all VOID ecosystem contracts with safety checks
 * @dev Reads config from deployments/config/{network}.json
 *      Validates all parameters before deployment
 *      Writes deployed addresses to deployments/{network}.json
 * 
 * Usage:
 *   Testnet:  forge script script/DeployProduction.s.sol --rpc-url base_sepolia --broadcast --verify
 *   Mainnet:  forge script script/DeployProduction.s.sol --rpc-url base_mainnet --broadcast --verify --slow
 */
contract DeployProduction is Script {
    using stdJson for string;

    // Config paths
    string constant CONFIG_DIR = "deployments/config/";
    string constant OUTPUT_DIR = "deployments/";

    // Deployment state
    struct DeployedAddresses {
        address USDC;
        address WETH;
        address VOID;
        address PSX;
        address CREATE;
        address SIGNAL;
        address AGENCY;
        address VoidHookRouterV4;
        address XPOracle;
        address EscrowVault;
        address xVOIDVault;
        address MissionRegistry;
        address TokenExpansionOracle;
    }

    DeployedAddresses public deployed;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("\n========================================");
        console.log("VOID PRODUCTION DEPLOYMENT");
        console.log("========================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Balance:", deployer.balance / 1e18, "ETH");
        console.log("");

        // Load network config
        string memory configFile = _getConfigPath();
        string memory config = vm.readFile(configFile);
        
        uint256 expectedChainId = abi.decode(vm.parseJson(config, ".chainId"), (uint256));
        require(block.chainid == expectedChainId, "CHAIN_ID_MISMATCH");

        console.log("Network:", abi.decode(vm.parseJson(config, ".network"), (string)));
        console.log("");

        // Pre-flight checks
        _runPreflightChecks(config, deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy tokens
        _deployTokens(config);

        // Deploy core infrastructure
        _deployCore(config);

        vm.stopBroadcast();

        // Save deployment artifacts
        _saveDeployment(config);

        console.log("\n========================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("========================================\n");
    }

    function _getConfigPath() internal view returns (string memory) {
        if (block.chainid == 84532) {
            return string.concat(CONFIG_DIR, "baseSepolia.json");
        } else if (block.chainid == 8453) {
            return string.concat(CONFIG_DIR, "baseMainnet.json");
        } else {
            revert("UNSUPPORTED_CHAIN");
        }
    }

    function _runPreflightChecks(string memory config, address deployer) internal view {
        console.log("Running pre-flight checks...");

        // Check deployer balance
        require(deployer.balance >= 0.1 ether, "INSUFFICIENT_BALANCE");
        console.log("  [OK] Deployer balance sufficient");

        // Validate fee model
        uint256 creatorBPS = abi.decode(vm.parseJson(config, ".feeModel.creatorShareBPS"), (uint256));
        uint256 stakerBPS = abi.decode(vm.parseJson(config, ".feeModel.stakerShareBPS"), (uint256));
        uint256 psxBPS = abi.decode(vm.parseJson(config, ".feeModel.psxTreasuryShareBPS"), (uint256));
        uint256 createBPS = abi.decode(vm.parseJson(config, ".feeModel.createTreasuryShareBPS"), (uint256));
        uint256 agencyBPS = abi.decode(vm.parseJson(config, ".feeModel.agencyShareBPS"), (uint256));
        uint256 grantsBPS = abi.decode(vm.parseJson(config, ".feeModel.grantsShareBPS"), (uint256));
        uint256 securityBPS = abi.decode(vm.parseJson(config, ".feeModel.securityShareBPS"), (uint256));
        
        uint256 totalBPS = creatorBPS + stakerBPS + psxBPS + createBPS + agencyBPS + grantsBPS + securityBPS;
        require(totalBPS == 10000, "FEE_SPLIT_MUST_EQUAL_10000_BPS");
        console.log("  [OK] Fee split = 10000 BPS (40/20/10/10/10/5/5)");

        // Validate APR bounds
        uint256 maxBoost = abi.decode(vm.parseJson(config, ".economicBounds.maxAPRBoostBPS"), (uint256));
        require(maxBoost == 2000, "MAX_APR_BOOST_MUST_BE_2000_BPS");
        console.log("  [OK] Max APR boost = 20%");

        // On mainnet: verify governance addresses are not EOAs
        if (block.chainid == 8453) {
            console.log("\n  Mainnet Safety Checks:");
            console.log("  WARNING: Verify all governance addresses are multi-sigs!");
            console.log("  (This script cannot verify contract code, manual check required)");
        }

        console.log("");
    }

    function _deployTokens(string memory config) internal {
        bool deployMocks = abi.decode(vm.parseJson(config, ".deploymentOptions.deployMockTokens"), (bool));

        if (deployMocks) {
            console.log("Deploying test tokens...");
            
            ERC20Mock usdcMock = new ERC20Mock("USD Coin Test", "USDC", 1_000_000 * 1e6);
            deployed.USDC = address(usdcMock);
            console.log("  USDC_Test:", deployed.USDC);

            ERC20Mock wethMock = new ERC20Mock("Wrapped Ether Test", "WETH", 1000 * 1e18);
            deployed.WETH = address(wethMock);
            console.log("  WETH_Test:", deployed.WETH);

            ERC20Mock voidMock = new ERC20Mock("VOID Test", "VOID", 20_000_000 * 1e18);
            deployed.VOID = address(voidMock);
            console.log("  VOID_Test:", deployed.VOID);

            ERC20Mock psxMock = new ERC20Mock("PSX Test", "PSX", 10_000_000 * 1e18);
            deployed.PSX = address(psxMock);
            console.log("  PSX_Test:", deployed.PSX);

            ERC20Mock createMock = new ERC20Mock("CREATE Test", "CREATE", 5_000_000 * 1e18);
            deployed.CREATE = address(createMock);
            console.log("  CREATE_Test:", deployed.CREATE);

            ERC20Mock signalMock = new ERC20Mock("SIGNAL Test", "SIGNAL", 1_000_000 * 1e18);
            deployed.SIGNAL = address(signalMock);
            console.log("  SIGNAL_Test:", deployed.SIGNAL);

            ERC20Mock agencyMock = new ERC20Mock("AGENCY Test", "AGENCY", 500_000 * 1e18);
            deployed.AGENCY = address(agencyMock);
            console.log("  AGENCY_Test:", deployed.AGENCY);

        } else {
            // Mainnet: use real token addresses
            deployed.USDC = abi.decode(vm.parseJson(config, ".externalTokens.USDC"), (address));
            deployed.WETH = abi.decode(vm.parseJson(config, ".externalTokens.WETH"), (address));
            console.log("Using mainnet token addresses:");
            console.log("  USDC:", deployed.USDC);
            console.log("  WETH:", deployed.WETH);
        }

        console.log("");
    }

    function _deployCore(string memory config) internal {
        console.log("Deploying core infrastructure...\n");

        // Get governance addresses from config
        address deployer = msg.sender;
        address xVoidStakingPool = _resolveAddress(config, ".governanceRoles.xVoidStakingPool");
        address psxTreasury = _resolveAddress(config, ".governanceRoles.psxTreasury");
        address createTreasury = _resolveAddress(config, ".governanceRoles.createTreasury");
        address agencyWallet = _resolveAddress(config, ".governanceRoles.agencyWallet");
        address creatorGrantsVault = _resolveAddress(config, ".governanceRoles.creatorGrantsVault");
        address securityReserve = _resolveAddress(config, ".governanceRoles.securityReserve");

        // Deploy VoidHookRouterV4
        console.log("Deploying VoidHookRouterV4...");
        VoidHookRouterV4 router = new VoidHookRouterV4(
            xVoidStakingPool,
            psxTreasury,
            createTreasury,
            agencyWallet,
            creatorGrantsVault,
            securityReserve
        );
        deployed.VoidHookRouterV4 = address(router);
        console.log("  VoidHookRouterV4:", deployed.VoidHookRouterV4);

        // Deploy XPOracle
        console.log("Deploying XPOracle...");
        XPOracle xpOracle = new XPOracle(deployer, deployer); // admin, updater
        deployed.XPOracle = address(xpOracle);
        console.log("  XPOracle:", deployed.XPOracle);

        // Deploy EscrowVault
        console.log("Deploying EscrowVault...");
        EscrowVault escrowVault = new EscrowVault(deployer, agencyWallet, deployer); // admin, agencyManager, dao
        deployed.EscrowVault = address(escrowVault);
        console.log("  EscrowVault:", deployed.EscrowVault);

        // Deploy xVOIDVault
        console.log("Deploying xVOIDVault...");
        xVOIDVault vault = new xVOIDVault(deployed.VOID);
        deployed.xVOIDVault = address(vault);
        console.log("  xVOIDVault:", deployed.xVOIDVault);

        // Deploy MissionRegistry
        console.log("Deploying MissionRegistry...");
        MissionRegistry missionRegistry = new MissionRegistry(
            deployer,              // admin
            deployer,              // missionAI (placeholder for now)
            deployer,              // verifier
            address(0)             // voidEmitter (deploy later)
        );
        deployed.MissionRegistry = address(missionRegistry);
        console.log("  MissionRegistry:", deployed.MissionRegistry);

        // Deploy TokenExpansionOracle
        console.log("Deploying TokenExpansionOracle...");
        TokenExpansionOracle expansionOracle = new TokenExpansionOracle(
            deployer,              // admin
            deployer,              // oracle
            deployer,              // governance
            500_000 * 1e18,        // minVolume7d ($500k)
            100,                   // minHolders
            1_000 * 1e18           // minFeesPaid ($1k)
        );
        deployed.TokenExpansionOracle = address(expansionOracle);
        console.log("  TokenExpansionOracle:", deployed.TokenExpansionOracle);

        console.log("");
    }

    function _resolveAddress(string memory config, string memory key) internal view returns (address) {
        string memory value = abi.decode(vm.parseJson(config, key), (string));
        
        // Check if it's an env var reference
        if (bytes(value)[0] == "$" && bytes(value)[1] == "{") {
            // Extract env var name
            string memory envVar = _extractEnvVar(value);
            return vm.envAddress(envVar);
        } else {
            return vm.parseAddress(value);
        }
    }

    function _extractEnvVar(string memory value) internal pure returns (string memory) {
        bytes memory b = bytes(value);
        bytes memory result = new bytes(b.length - 3); // Remove "${ }"
        for (uint i = 2; i < b.length - 1; i++) {
            result[i - 2] = b[i];
        }
        return string(result);
    }

    function _saveDeployment(string memory config) internal {
        string memory network = abi.decode(vm.parseJson(config, ".network"), (string));
        string memory outputPath = block.chainid == 84532 
            ? string.concat(OUTPUT_DIR, "baseSepolia.json")
            : string.concat(OUTPUT_DIR, "baseMainnet.json");

        string memory json = "deployment";
        vm.serializeString(json, "network", network);
        vm.serializeUint(json, "chainId", block.chainid);
        vm.serializeUint(json, "timestamp", block.timestamp);
        vm.serializeAddress(json, "USDC", deployed.USDC);
        vm.serializeAddress(json, "WETH", deployed.WETH);
        vm.serializeAddress(json, "VOID", deployed.VOID);
        vm.serializeAddress(json, "PSX", deployed.PSX);
        vm.serializeAddress(json, "CREATE", deployed.CREATE);
        vm.serializeAddress(json, "SIGNAL", deployed.SIGNAL);
        vm.serializeAddress(json, "AGENCY", deployed.AGENCY);
        vm.serializeAddress(json, "VoidHookRouterV4", deployed.VoidHookRouterV4);
        vm.serializeAddress(json, "XPOracle", deployed.XPOracle);
        vm.serializeAddress(json, "EscrowVault", deployed.EscrowVault);
        vm.serializeAddress(json, "xVOIDVault", deployed.xVOIDVault);
        vm.serializeAddress(json, "MissionRegistry", deployed.MissionRegistry);
        string memory finalJson = vm.serializeAddress(json, "TokenExpansionOracle", deployed.TokenExpansionOracle);

        vm.writeJson(finalJson, outputPath);
        console.log("Deployment saved to:", outputPath);
    }
}
