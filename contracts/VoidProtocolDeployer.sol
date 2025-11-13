// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidMessaging.sol";
import "./VoidStorage.sol";

/**
 * @title VoidProtocolDeployer
 * @notice Deployment script for The Void messaging and storage contracts
 * @dev Deploy this contract, then call deployAll() to deploy both systems
 */
contract VoidProtocolDeployer {
    // Net Protocol addresses (per chain)
    address public constant NET_PROTOCOL_SEPOLIA = 0x00000000B24D62781dB359b07880a105cD0b64e6;
    address public constant NET_STORAGE_SEPOLIA = 0x00000000DB40fcB9f4466330982372e27Fd7Bbf5;

    // Deployed contract addresses
    VoidMessaging public messaging;
    VoidStorage public voidStorage;

    // Events
    event ContractsDeployed(
        address messagingAddress,
        address storageAddress,
        address netProtocol,
        address netStorage
    );

    /**
     * @notice Deploy both VoidMessaging and VoidStorage contracts
     * @dev Deploys to Sepolia testnet using hardcoded Net Protocol addresses
     * @return messagingAddr Address of deployed VoidMessaging contract
     * @return storageAddr Address of deployed VoidStorage contract
     */
    function deployAll() external returns (address messagingAddr, address storageAddr) {
        // Deploy VoidMessaging
        messaging = new VoidMessaging(
            NET_PROTOCOL_SEPOLIA,
            NET_STORAGE_SEPOLIA
        );

        // Deploy VoidStorage
        voidStorage = new VoidStorage(NET_STORAGE_SEPOLIA);

        messagingAddr = address(messaging);
        storageAddr = address(voidStorage);

        emit ContractsDeployed(
            messagingAddr,
            storageAddr,
            NET_PROTOCOL_SEPOLIA,
            NET_STORAGE_SEPOLIA
        );

        return (messagingAddr, storageAddr);
    }

    /**
     * @notice Get deployed contract addresses
     * @return messagingAddr VoidMessaging address
     * @return storageAddr VoidStorage address
     */
    function getDeployedAddresses() 
        external 
        view 
        returns (address messagingAddr, address storageAddr) 
    {
        return (address(messaging), address(voidStorage));
    }
}
