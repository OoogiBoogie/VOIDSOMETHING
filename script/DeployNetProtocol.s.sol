// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/NetProtocolProfiles.sol";

/**
 * Foundry deployment script for NetProtocolProfiles
 * 
 * Usage:
 *   forge script script/DeployNetProtocol.s.sol:DeployNetProtocol \
 *     --rpc-url $BASE_SEPOLIA_RPC \
 *     --private-key $DEPLOYER_KEY \
 *     --broadcast --verify
 * 
 * Or just:
 *   make deploy-net-protocol
 */
contract DeployNetProtocol is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy contract
        NetProtocolProfiles netProtocol = new NetProtocolProfiles();
        
        console.log("NetProtocolProfiles deployed to:", address(netProtocol));
        console.log("Add to .env.local:");
        console.log("NEXT_PUBLIC_NET_PROTOCOL_ADDRESS=%s", address(netProtocol));
        
        vm.stopBroadcast();
    }
}
