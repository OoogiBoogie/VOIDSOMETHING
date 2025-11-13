// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title INet
 * @notice Interface for Net Protocol - cross-chain messaging backbone
 * @dev Net Protocol address: 0x00000000B24D62781dB359b07880a105cD0b64e6
 * 
 * Net Protocol provides decentralized, cross-chain messaging infrastructure.
 * Messages are stored on-chain and can be queried by topic, sender, or app.
 */
interface INet {
    /**
     * @notice Message struct returned by Net Protocol
     * @param sender Address that sent the message
     * @param text Human-readable text (shown in UI)
     * @param topic Message category/channel (e.g., "void:global")
     * @param data ABI-encoded payload with additional metadata
     * @param timestamp Block timestamp when message was sent
     * @param blockNumber Block number when message was sent
     */
    struct Message {
        address sender;
        string text;
        string topic;
        bytes data;
        uint256 timestamp;
        uint256 blockNumber;
    }

    /**
     * @notice Send a message via Net Protocol
     * @dev Called by apps to broadcast messages to topics
     * @param sender Address of the message sender (must be msg.sender in most cases)
     * @param text Human-readable message text
     * @param topic Message category/channel identifier
     * @param data ABI-encoded additional payload (struct, JSON, etc.)
     */
    function sendMessageViaApp(
        address sender,
        string calldata text,
        string calldata topic,
        bytes calldata data
    ) external;

    /**
     * @notice Get messages by topic
     * @param topic The topic to query
     * @param start Starting index (0 = oldest)
     * @param end Ending index (exclusive)
     * @return Array of messages in the topic
     */
    function getMessagesByTopic(
        string calldata topic,
        uint256 start,
        uint256 end
    ) external view returns (Message[] memory);

    /**
     * @notice Get total number of messages in a topic
     * @param topic The topic to query
     * @return Total message count
     */
    function getTopicMessageCount(string calldata topic) external view returns (uint256);

    /**
     * @notice Get messages by sender
     * @param sender Address to query
     * @param start Starting index
     * @param end Ending index (exclusive)
     * @return Array of messages from sender
     */
    function getMessagesBySender(
        address sender,
        uint256 start,
        uint256 end
    ) external view returns (Message[] memory);

    /**
     * @notice Get total number of messages sent by an address
     * @param sender Address to query
     * @return Total message count from sender
     */
    function getSenderMessageCount(address sender) external view returns (uint256);
}
