// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IStorage
 * @notice Interface for Net Storage - decentralized key-value store
 * @dev Net Storage address (example): 0x00000000DB40fcB9f4466330982372e27Fd7Bbf5
 * 
 * Net Storage provides permanent, versioned key-value storage.
 * Each write creates a new version - historical data is never overwritten.
 * Storage is scoped by (key, operator) pairs.
 */
interface IStorage {
    /**
     * @notice Write data to storage
     * @dev Creates a new version at the next index for this (key, operator) pair
     * @param key Storage key identifier (typically keccak256 hash)
     * @param text Human-readable description or primary data
     * @param data ABI-encoded binary data (optional, can be empty)
     */
    function put(
        bytes32 key,
        string memory text,
        bytes memory data
    ) external;

    /**
     * @notice Read latest data from storage
     * @dev Returns the most recent write for (key, operator)
     * @param key Storage key identifier
     * @param operator Address whose data to read
     * @return text Human-readable data
     * @return data Binary data blob
     */
    function get(
        bytes32 key,
        address operator
    ) external view returns (string memory text, bytes memory data);

    /**
     * @notice Read specific version from storage history
     * @dev Index 0 = first write, index (total-1) = latest write
     * @param key Storage key identifier
     * @param operator Address whose data to read
     * @param index Version index to retrieve
     * @return text Human-readable data at that version
     * @return data Binary data at that version
     */
    function getValueAtIndex(
        bytes32 key,
        address operator,
        uint256 index
    ) external view returns (string memory text, bytes memory data);

    /**
     * @notice Get total number of writes for a (key, operator) pair
     * @dev Use this to know valid index range: [0, totalWrites)
     * @param key Storage key identifier
     * @param operator Address whose data to count
     * @return Total number of versions stored
     */
    function getTotalWrites(
        bytes32 key,
        address operator
    ) external view returns (uint256);
}
