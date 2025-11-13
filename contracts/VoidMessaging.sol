// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/INet.sol";

/**
 * @title VoidMessaging
 * @notice On-chain messaging system for The Void metaverse using Net Protocol
 * @dev Provides global chat, zone chat, and direct messaging with persistent on-chain storage
 * 
 * FRONTEND INTEGRATION GUIDE:
 * 
 * 1. GLOBAL CHAT:
 *    - Send: Call sendGlobalMessage(text)
 *    - Read: Call getLatestGlobalMessages(20) to get last 20 messages
 * 
 * 2. ZONE CHAT:
 *    - Send: Call sendZoneMessage(zoneId, text) where zoneId = "district-1", etc.
 *    - Read: Call getLatestZoneMessages(zoneId, 20)
 * 
 * 3. DIRECT MESSAGES:
 *    - Send: Call sendDM(recipientAddress, text)
 *      The contract auto-generates conversationId from both addresses
 *    - Read: Call getConversationMessages(otherUserAddress, 0, 50)
 *      Uses same conversationId logic to retrieve DM thread
 * 
 * 4. USER MESSAGE HISTORY:
 *    - Call getUserMessageCount(userAddress) to get total
 *    - Call getUserMessages(userAddress, start, end) for pagination
 * 
 * All messages are permanently stored on-chain via Net Protocol.
 * Events are emitted for easy indexing and real-time updates.
 */
contract VoidMessaging {
    // ============ IMMUTABLE STATE ============

    /// @notice Net Protocol contract for cross-chain messaging
    INet public immutable net;

    /// @notice Storage contract address (reserved for future use)
    address public immutable storageContract;

    // ============ CONSTANTS ============

    /// @notice Message type identifiers
    uint8 public constant MESSAGE_TYPE_GLOBAL = 0;
    uint8 public constant MESSAGE_TYPE_DM = 1;
    uint8 public constant MESSAGE_TYPE_ZONE = 2;
    uint8 public constant MESSAGE_TYPE_SYSTEM = 3;

    /// @notice Topic prefixes for Net Protocol
    string public constant TOPIC_GLOBAL = "void:global";
    string public constant TOPIC_ZONE_PREFIX = "void:zone:";
    string public constant TOPIC_DM = "void:dm";

    /// @notice Anti-spam rate limiting (seconds between messages)
    uint256 public constant GLOBAL_MESSAGE_COOLDOWN = 5;  // 5 seconds
    uint256 public constant ZONE_MESSAGE_COOLDOWN = 3;    // 3 seconds
    uint256 public constant DM_COOLDOWN = 2;              // 2 seconds

    /// @notice Daily message caps per type
    uint256 public constant MAX_GLOBAL_PER_DAY = 100;
    uint256 public constant MAX_ZONE_PER_DAY = 200;
    uint256 public constant MAX_DM_PER_DAY = 100;

    /// @notice Seconds per day for daily reset
    uint256 private constant SECONDS_PER_DAY = 86400;

    // ============ STRUCTS ============

    /**
     * @notice Message payload structure
     * @dev ABI-encoded into Net Protocol's data field
     * @param from Sender address
     * @param to Recipient address (address(0) for public messages)
     * @param messageType 0=global, 1=DM, 2=zone, 3=system
     * @param content UTF-8 encoded text or JSON blob
     * @param conversationId Stable ID for grouping related messages (DMs, zone threads)
     */
    struct VoidMessagePayload {
        address from;
        address to;
        uint8 messageType;
        bytes content;
        bytes32 conversationId;
    }

    /**
     * @notice Simplified message struct for frontend consumption
     * @dev Decoded from Net Protocol Message + VoidMessagePayload
     */
    struct VoidMessage {
        address from;
        address to;
        uint8 messageType;
        string text;
        bytes32 conversationId;
        uint256 timestamp;
        uint256 blockNumber;
    }

    // ============ EVENTS ============

    /**
     * @notice Emitted when any message is sent
     * @dev Indexed fields allow efficient filtering by from/to/conversationId
     * @param from Sender address
     * @param to Recipient (address(0) for public)
     * @param conversationId Conversation/thread identifier
     * @param messageType 0=global, 1=DM, 2=zone, 3=system
     * @param topic Net Protocol topic string
     * @param text Human-readable message text
     */
    event VoidMessageSent(
        address indexed from,
        address indexed to,
        bytes32 indexed conversationId,
        uint8 messageType,
        string topic,
        string text
    );

    /**
     * @notice Emitted when user is blocked
     * @param blocker User doing the blocking
     * @param blocked User being blocked
     */
    event UserBlocked(address indexed blocker, address indexed blocked);

    /**
     * @notice Emitted when user is unblocked
     * @param blocker User doing the unblocking
     * @param unblocked User being unblocked
     */
    event UserUnblocked(address indexed blocker, address indexed unblocked);

    // ============ STATE (ANTI-SPAM) ============

    /// @notice Track last message timestamp per user per type
    mapping(address => uint256) public lastGlobalMessage;
    mapping(address => uint256) public lastZoneMessage;
    mapping(address => uint256) public lastDMTimestamp;

    /// @notice Daily message counters: user => day => messageType => count
    /// @dev messageType: 0=global, 2=zone, 1=DM
    mapping(address => mapping(uint256 => mapping(uint8 => uint256))) public dailyMessageCount;

    /// @notice Block list: blocker => blocked => isBlocked
    mapping(address => mapping(address => bool)) public blockedUsers;

    // ============ ERRORS ============

    error EmptyMessage();
    error InvalidRecipient();
    error NetAddressZero();
    error RateLimited(uint256 cooldownRemaining);
    error DailyCapReached(uint8 messageType, uint256 cap);
    error UserIsBlocked();

    // ============ CONSTRUCTOR ============

    /**
     * @notice Initialize VoidMessaging with Net Protocol reference
     * @param _net Address of Net Protocol contract (chain-specific)
     * @param _storage Address of Net Storage contract (optional, for future use)
     */
    constructor(address _net, address _storage) {
        if (_net == address(0)) revert NetAddressZero();
        net = INet(_net);
        storageContract = _storage;
    }

    // ============ PUBLIC MESSAGING FUNCTIONS ============

    /**
     * @notice Send a global chat message visible to all users
     * @dev Topic: "void:global", no recipient, conversationId = 0
     * @param text Message content (must be non-empty)
     */
    function sendGlobalMessage(string calldata text) external {
        if (bytes(text).length == 0) revert EmptyMessage();

        // Anti-spam: Rate limiting
        if (block.timestamp < lastGlobalMessage[msg.sender] + GLOBAL_MESSAGE_COOLDOWN) {
            uint256 remaining = (lastGlobalMessage[msg.sender] + GLOBAL_MESSAGE_COOLDOWN) - block.timestamp;
            revert RateLimited(remaining);
        }

        // Anti-spam: Daily cap
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        uint256 todayCount = dailyMessageCount[msg.sender][currentDay][MESSAGE_TYPE_GLOBAL];
        if (todayCount >= MAX_GLOBAL_PER_DAY) {
            revert DailyCapReached(MESSAGE_TYPE_GLOBAL, MAX_GLOBAL_PER_DAY);
        }

        // Update anti-spam trackers
        lastGlobalMessage[msg.sender] = block.timestamp;
        dailyMessageCount[msg.sender][currentDay][MESSAGE_TYPE_GLOBAL] = todayCount + 1;

        VoidMessagePayload memory payload = VoidMessagePayload({
            from: msg.sender,
            to: address(0),
            messageType: MESSAGE_TYPE_GLOBAL,
            content: bytes(text),
            conversationId: bytes32(0)
        });

        bytes memory encodedPayload = abi.encode(payload);

        net.sendMessageViaApp(
            msg.sender,
            text,
            TOPIC_GLOBAL,
            encodedPayload
        );

        emit VoidMessageSent(
            msg.sender,
            address(0),
            bytes32(0),
            MESSAGE_TYPE_GLOBAL,
            TOPIC_GLOBAL,
            text
        );
    }

    /**
     * @notice Send a message to a specific zone/district
     * @dev Topic: "void:zone:{zoneId}", conversationId derived from zoneId
     * @param zoneId Zone identifier (e.g., "district-1", "creator-hub")
     * @param text Message content (must be non-empty)
     */
    function sendZoneMessage(string calldata zoneId, string calldata text) external {
        if (bytes(text).length == 0) revert EmptyMessage();

        // Anti-spam: Rate limiting
        if (block.timestamp < lastZoneMessage[msg.sender] + ZONE_MESSAGE_COOLDOWN) {
            uint256 remaining = (lastZoneMessage[msg.sender] + ZONE_MESSAGE_COOLDOWN) - block.timestamp;
            revert RateLimited(remaining);
        }

        // Anti-spam: Daily cap
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        uint256 todayCount = dailyMessageCount[msg.sender][currentDay][MESSAGE_TYPE_ZONE];
        if (todayCount >= MAX_ZONE_PER_DAY) {
            revert DailyCapReached(MESSAGE_TYPE_ZONE, MAX_ZONE_PER_DAY);
        }

        // Update anti-spam trackers
        lastZoneMessage[msg.sender] = block.timestamp;
        dailyMessageCount[msg.sender][currentDay][MESSAGE_TYPE_ZONE] = todayCount + 1;

        string memory topic = string.concat(TOPIC_ZONE_PREFIX, zoneId);
        bytes32 conversationId = keccak256(abi.encodePacked("zone", zoneId));

        VoidMessagePayload memory payload = VoidMessagePayload({
            from: msg.sender,
            to: address(0),
            messageType: MESSAGE_TYPE_ZONE,
            content: bytes(text),
            conversationId: conversationId
        });

        bytes memory encodedPayload = abi.encode(payload);

        net.sendMessageViaApp(
            msg.sender,
            text,
            topic,
            encodedPayload
        );

        emit VoidMessageSent(
            msg.sender,
            address(0),
            conversationId,
            MESSAGE_TYPE_ZONE,
            topic,
            text
        );
    }

    /**
     * @notice Send a direct message to another user
     * @dev Topic: "void:dm", conversationId is deterministic based on both addresses
     * @param to Recipient address (cannot be address(0) or msg.sender)
     * @param text Message content (must be non-empty)
     */
    function sendDM(address to, string calldata text) external {
        if (bytes(text).length == 0) revert EmptyMessage();
        if (to == address(0) || to == msg.sender) revert InvalidRecipient();

        // Anti-spam: Check if sender is blocked by recipient
        if (blockedUsers[to][msg.sender]) revert UserIsBlocked();

        // Anti-spam: Rate limiting
        if (block.timestamp < lastDMTimestamp[msg.sender] + DM_COOLDOWN) {
            uint256 remaining = (lastDMTimestamp[msg.sender] + DM_COOLDOWN) - block.timestamp;
            revert RateLimited(remaining);
        }

        // Anti-spam: Daily cap
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        uint256 todayCount = dailyMessageCount[msg.sender][currentDay][MESSAGE_TYPE_DM];
        if (todayCount >= MAX_DM_PER_DAY) {
            revert DailyCapReached(MESSAGE_TYPE_DM, MAX_DM_PER_DAY);
        }

        // Update anti-spam trackers
        lastDMTimestamp[msg.sender] = block.timestamp;
        dailyMessageCount[msg.sender][currentDay][MESSAGE_TYPE_DM] = todayCount + 1;

        // Generate stable conversation ID regardless of sender order
        bytes32 conversationId = _getConversationId(msg.sender, to);

        VoidMessagePayload memory payload = VoidMessagePayload({
            from: msg.sender,
            to: to,
            messageType: MESSAGE_TYPE_DM,
            content: bytes(text),
            conversationId: conversationId
        });

        bytes memory encodedPayload = abi.encode(payload);

        net.sendMessageViaApp(
            msg.sender,
            text,
            TOPIC_DM,
            encodedPayload
        );

        emit VoidMessageSent(
            msg.sender,
            to,
            conversationId,
            MESSAGE_TYPE_DM,
            TOPIC_DM,
            text
        );
    }

    // ============ BLOCK/MUTE FUNCTIONS ============

    /**
     * @notice Block a user from sending you DMs
     * @param user Address to block
     */
    function blockUser(address user) external {
        if (user == address(0) || user == msg.sender) revert InvalidRecipient();
        
        blockedUsers[msg.sender][user] = true;
        emit UserBlocked(msg.sender, user);
    }

    /**
     * @notice Unblock a previously blocked user
     * @param user Address to unblock
     */
    function unblockUser(address user) external {
        if (user == address(0)) revert InvalidRecipient();
        
        blockedUsers[msg.sender][user] = false;
        emit UserUnblocked(msg.sender, user);
    }

    /**
     * @notice Check if a user is blocked
     * @param blocker User who may have blocked
     * @param blocked User who may be blocked
     * @return True if blocked
     */
    function isBlocked(address blocker, address blocked) external view returns (bool) {
        return blockedUsers[blocker][blocked];
    }

    // ============ VIEW FUNCTIONS FOR FRONTEND ============

    /**
     * @notice Get latest global chat messages
     * @dev Queries Net Protocol topic "void:global"
     * @param count Number of recent messages to retrieve (recommend ≤ 50 for gas)
     * @return Array of decoded VoidMessage structs
     */
    function getLatestGlobalMessages(uint256 count) external view returns (VoidMessage[] memory) {
        uint256 total = net.getTopicMessageCount(TOPIC_GLOBAL);
        if (total == 0) return new VoidMessage[](0);

        uint256 start = total > count ? total - count : 0;
        INet.Message[] memory rawMessages = net.getMessagesByTopic(TOPIC_GLOBAL, start, total);

        return _decodeMessages(rawMessages);
    }

    /**
     * @notice Get latest zone chat messages
     * @dev Queries Net Protocol topic "void:zone:{zoneId}"
     * @param zoneId Zone identifier
     * @param count Number of recent messages to retrieve
     * @return Array of decoded VoidMessage structs
     */
    function getLatestZoneMessages(string calldata zoneId, uint256 count) 
        external 
        view 
        returns (VoidMessage[] memory) 
    {
        string memory topic = string.concat(TOPIC_ZONE_PREFIX, zoneId);
        uint256 total = net.getTopicMessageCount(topic);
        if (total == 0) return new VoidMessage[](0);

        uint256 start = total > count ? total - count : 0;
        INet.Message[] memory rawMessages = net.getMessagesByTopic(topic, start, total);

        return _decodeMessages(rawMessages);
    }

    /**
     * @notice Get messages for a DM conversation between two users
     * @dev Frontend should call this with the other user's address
     *      Contract derives conversationId and filters DM topic for matching messages
     * @param otherUser The other participant in the conversation
     * @param start Starting message index (for pagination)
     * @param end Ending message index (exclusive)
     * @return Array of VoidMessage structs in the conversation
     */
    function getConversationMessages(address otherUser, uint256 start, uint256 end)
        external
        view
        returns (VoidMessage[] memory)
    {
        bytes32 conversationId = _getConversationId(msg.sender, otherUser);
        
        // Get all DM messages in range
        INet.Message[] memory rawMessages = net.getMessagesByTopic(TOPIC_DM, start, end);
        
        // Filter for this specific conversation
        return _filterByConversationId(rawMessages, conversationId);
    }

    /**
     * @notice Get all messages sent by a specific user (across all types)
     * @param user User address to query
     * @param start Starting index
     * @param end Ending index (exclusive)
     * @return Array of VoidMessage structs
     */
    function getUserMessages(address user, uint256 start, uint256 end)
        external
        view
        returns (VoidMessage[] memory)
    {
        INet.Message[] memory rawMessages = net.getMessagesBySender(user, start, end);
        return _decodeMessages(rawMessages);
    }

    /**
     * @notice Get total message count for a user
     * @param user User address to query
     * @return Total messages sent by user
     */
    function getUserMessageCount(address user) external view returns (uint256) {
        return net.getSenderMessageCount(user);
    }

    /**
     * @notice Get total global chat message count
     * @return Total messages in global chat
     */
    function getGlobalMessageCount() external view returns (uint256) {
        return net.getTopicMessageCount(TOPIC_GLOBAL);
    }

    /**
     * @notice Get total zone chat message count
     * @param zoneId Zone identifier
     * @return Total messages in zone chat
     */
    function getZoneMessageCount(string calldata zoneId) external view returns (uint256) {
        string memory topic = string.concat(TOPIC_ZONE_PREFIX, zoneId);
        return net.getTopicMessageCount(topic);
    }

    /**
     * @notice Get remaining messages for today
     * @param user User to query
     * @return globalRemaining Global messages remaining
     * @return zoneRemaining Zone messages remaining
     * @return dmRemaining DMs remaining
     */
    function getRemainingDailyQuota(address user)
        external
        view
        returns (uint256 globalRemaining, uint256 zoneRemaining, uint256 dmRemaining)
    {
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        
        uint256 globalUsed = dailyMessageCount[user][currentDay][MESSAGE_TYPE_GLOBAL];
        uint256 zoneUsed = dailyMessageCount[user][currentDay][MESSAGE_TYPE_ZONE];
        uint256 dmUsed = dailyMessageCount[user][currentDay][MESSAGE_TYPE_DM];

        globalRemaining = globalUsed >= MAX_GLOBAL_PER_DAY ? 0 : MAX_GLOBAL_PER_DAY - globalUsed;
        zoneRemaining = zoneUsed >= MAX_ZONE_PER_DAY ? 0 : MAX_ZONE_PER_DAY - zoneUsed;
        dmRemaining = dmUsed >= MAX_DM_PER_DAY ? 0 : MAX_DM_PER_DAY - dmUsed;
    }

    /**
     * @notice Get cooldown remaining for user
     * @param user User to query
     * @param messageType 0=global, 1=DM, 2=zone
     * @return secondsRemaining Seconds until user can send next message
     */
    function getCooldownRemaining(address user, uint8 messageType)
        external
        view
        returns (uint256 secondsRemaining)
    {
        uint256 lastTimestamp;
        uint256 cooldown;

        if (messageType == MESSAGE_TYPE_GLOBAL) {
            lastTimestamp = lastGlobalMessage[user];
            cooldown = GLOBAL_MESSAGE_COOLDOWN;
        } else if (messageType == MESSAGE_TYPE_DM) {
            lastTimestamp = lastDMTimestamp[user];
            cooldown = DM_COOLDOWN;
        } else if (messageType == MESSAGE_TYPE_ZONE) {
            lastTimestamp = lastZoneMessage[user];
            cooldown = ZONE_MESSAGE_COOLDOWN;
        } else {
            return 0;
        }

        if (block.timestamp >= lastTimestamp + cooldown) {
            return 0;
        }

        return (lastTimestamp + cooldown) - block.timestamp;
    }

    // ============ INTERNAL HELPER FUNCTIONS ============

    /**
     * @notice Generate deterministic conversation ID for two users
     * @dev Always returns same ID regardless of address order (min, max)
     *      This ensures both participants query the same conversation thread
     * @param addr1 First participant address
     * @param addr2 Second participant address
     * @return Stable conversation identifier
     */
    function _getConversationId(address addr1, address addr2) internal pure returns (bytes32) {
        (address min, address max) = addr1 < addr2 ? (addr1, addr2) : (addr2, addr1);
        return keccak256(abi.encodePacked(min, max));
    }

    /**
     * @notice Decode Net Protocol messages into VoidMessage structs
     * @dev Extracts VoidMessagePayload from data field and combines with Net metadata
     * @param rawMessages Array of Net Protocol Message structs
     * @return Array of decoded VoidMessage structs
     */
    function _decodeMessages(INet.Message[] memory rawMessages) 
        internal 
        pure 
        returns (VoidMessage[] memory) 
    {
        VoidMessage[] memory messages = new VoidMessage[](rawMessages.length);

        for (uint256 i = 0; i < rawMessages.length; i++) {
            // Decode the VoidMessagePayload from data field
            VoidMessagePayload memory payload = abi.decode(
                rawMessages[i].data,
                (VoidMessagePayload)
            );

            messages[i] = VoidMessage({
                from: payload.from,
                to: payload.to,
                messageType: payload.messageType,
                text: rawMessages[i].text,
                conversationId: payload.conversationId,
                timestamp: rawMessages[i].timestamp,
                blockNumber: rawMessages[i].blockNumber
            });
        }

        return messages;
    }

    /**
     * @notice Filter messages by conversation ID
     * @dev Used for DM queries to isolate specific conversation threads
     * @param rawMessages Array of Net Protocol messages
     * @param conversationId Target conversation ID to filter for
     * @return Filtered array of VoidMessage structs
     */
    function _filterByConversationId(
        INet.Message[] memory rawMessages,
        bytes32 conversationId
    ) internal pure returns (VoidMessage[] memory) {
        // First pass: count matching messages
        uint256 matchCount = 0;
        for (uint256 i = 0; i < rawMessages.length; i++) {
            VoidMessagePayload memory payload = abi.decode(
                rawMessages[i].data,
                (VoidMessagePayload)
            );
            if (payload.conversationId == conversationId) {
                matchCount++;
            }
        }

        // Second pass: build filtered array
        VoidMessage[] memory filtered = new VoidMessage[](matchCount);
        uint256 index = 0;

        for (uint256 i = 0; i < rawMessages.length; i++) {
            VoidMessagePayload memory payload = abi.decode(
                rawMessages[i].data,
                (VoidMessagePayload)
            );

            if (payload.conversationId == conversationId) {
                filtered[index] = VoidMessage({
                    from: payload.from,
                    to: payload.to,
                    messageType: payload.messageType,
                    text: rawMessages[i].text,
                    conversationId: payload.conversationId,
                    timestamp: rawMessages[i].timestamp,
                    blockNumber: rawMessages[i].blockNumber
                });
                index++;
            }
        }

        return filtered;
    }

    /**
     * @notice Generate conversation ID for two addresses (public helper for frontend)
     * @dev Frontend can call this to precompute conversationId before querying
     * @param addr1 First address
     * @param addr2 Second address
     * @return Conversation identifier
     */
    function getConversationId(address addr1, address addr2) external pure returns (bytes32) {
        return _getConversationId(addr1, addr2);
    }
}
