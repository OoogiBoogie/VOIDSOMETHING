// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IStorage.sol";

/**
 * @title VoidStorage
 * @notice Decentralized storage for The Void metaverse user data using Net Storage
 * @dev Provides versioned, permanent storage for profiles, settings, and config
 * 
 * FRONTEND INTEGRATION GUIDE:
 * 
 * 1. USER PROFILES:
 *    - Set: Call setProfile(profileJson) with JSON string like:
 *      {"avatarId":"123","displayName":"VoidUser","bio":"...","links":["https://..."]}
 *    - Get: Call getProfile(userAddress) returns (text, profileJson)
 *    - History: Call getProfileVersion(userAddress, versionIndex) for older versions
 * 
 * 2. MESSAGING SETTINGS:
 *    - Set: Call setMessagingSettings(settingsJson) with JSON like:
 *      {"notifications":true,"mutedUsers":["0x..."],"dmPrivacy":"friends"}
 *    - Get: Call getMessagingSettings(userAddress)
 * 
 * 3. GLOBAL CONFIG (Admin Only):
 *    - Set: Call setGlobalMessagingConfig(configJson) - owner only
 *    - Get: Call getGlobalMessagingConfig()
 * 
 * All data is versioned - historical writes are never deleted.
 * Users own their data; only they can update their profile/settings.
 */
contract VoidStorage {
    // ============ IMMUTABLE STATE ============

    /// @notice Net Storage contract for permanent key-value storage
    IStorage public immutable storageContract;

    /// @notice Contract owner for admin functions
    address public immutable owner;

    // ============ STORAGE KEYS ============

    /// @notice Key for user profile data
    /// @dev Scoped per user via operator parameter
    bytes32 public constant KEY_PROFILE = keccak256(abi.encodePacked("void:profile"));

    /// @notice Key for user messaging settings
    /// @dev Scoped per user via operator parameter
    bytes32 public constant KEY_MESSAGING_SETTINGS = keccak256(abi.encodePacked("void:settings:messaging"));

    /// @notice Key for global messaging configuration
    /// @dev Single global config, operator = owner
    bytes32 public constant KEY_GLOBAL_MESSAGING_CONFIG = keccak256(abi.encodePacked("void:config:messaging"));

    // ============ EVENTS ============

    /**
     * @notice Emitted when user updates their profile
     * @param user User address
     * @param version New version index
     */
    event ProfileUpdated(address indexed user, uint256 version);

    /**
     * @notice Emitted when user updates messaging settings
     * @param user User address
     * @param version New version index
     */
    event MessagingSettingsUpdated(address indexed user, uint256 version);

    /**
     * @notice Emitted when admin updates global config
     * @param version New version index
     */
    event GlobalConfigUpdated(uint256 version);

    // ============ ERRORS ============

    error StorageAddressZero();
    error OnlyOwner();
    error EmptyData();

    // ============ MODIFIERS ============

    /**
     * @notice Restrict function to contract owner
     */
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    // ============ CONSTRUCTOR ============

    /**
     * @notice Initialize VoidStorage with Net Storage reference
     * @param _storage Address of Net Storage contract (chain-specific)
     */
    constructor(address _storage) {
        if (_storage == address(0)) revert StorageAddressZero();
        storageContract = IStorage(_storage);
        owner = msg.sender;
    }

    // ============ USER PROFILE FUNCTIONS ============

    /**
     * @notice Set user profile data
     * @dev Stores JSON string with avatar, display name, bio, links, etc.
     *      Creates new version in storage history
     *      Only callable by the user themselves (msg.sender = profile owner)
     * 
     * Example JSON format:
     * {
     *   "avatarId": "123",
     *   "displayName": "VoidExplorer",
     *   "bio": "Metaverse builder and DeFi enthusiast",
     *   "links": ["https://twitter.com/...", "https://github.com/..."],
     *   "customFields": {"favoriteZone": "creator-hub"}
     * }
     * 
     * @param profileJson JSON-encoded profile data
     */
    function setProfile(string calldata profileJson) external {
        if (bytes(profileJson).length == 0) revert EmptyData();

        // Store with msg.sender as operator (user owns their profile)
        storageContract.put(
            KEY_PROFILE,
            profileJson,
            "" // No binary data, JSON is sufficient
        );

        uint256 version = storageContract.getTotalWrites(KEY_PROFILE, msg.sender);
        emit ProfileUpdated(msg.sender, version);
    }

    /**
     * @notice Get user's latest profile data
     * @param user Address of user to query
     * @return text Profile JSON string (latest version)
     * @return data Binary data (typically empty for profiles)
     */
    function getProfile(address user) 
        external 
        view 
        returns (string memory text, bytes memory data) 
    {
        return storageContract.get(KEY_PROFILE, user);
    }

    /**
     * @notice Get specific version of user profile
     * @dev Allows viewing historical profile changes
     * @param user Address of user to query
     * @param versionIndex Version index (0 = first profile, totalWrites-1 = latest)
     * @return text Profile JSON at that version
     * @return data Binary data at that version
     */
    function getProfileVersion(address user, uint256 versionIndex)
        external
        view
        returns (string memory text, bytes memory data)
    {
        return storageContract.getValueAtIndex(KEY_PROFILE, user, versionIndex);
    }

    /**
     * @notice Get total number of profile updates for a user
     * @param user Address to query
     * @return Total profile versions stored
     */
    function getProfileVersionCount(address user) external view returns (uint256) {
        return storageContract.getTotalWrites(KEY_PROFILE, user);
    }

    // ============ MESSAGING SETTINGS FUNCTIONS ============

    /**
     * @notice Set user messaging preferences and privacy settings
     * @dev Stores JSON string with notification prefs, muted users, DM privacy, etc.
     *      Only callable by the user themselves
     * 
     * Example JSON format:
     * {
     *   "notifications": true,
     *   "notifyOnDM": true,
     *   "notifyOnMention": true,
     *   "mutedUsers": ["0x1234...", "0x5678..."],
     *   "dmPrivacy": "everyone" | "friends" | "nobody",
     *   "showOnlineStatus": true
     * }
     * 
     * @param settingsJson JSON-encoded settings data
     */
    function setMessagingSettings(string calldata settingsJson) external {
        if (bytes(settingsJson).length == 0) revert EmptyData();

        storageContract.put(
            KEY_MESSAGING_SETTINGS,
            settingsJson,
            ""
        );

        uint256 version = storageContract.getTotalWrites(KEY_MESSAGING_SETTINGS, msg.sender);
        emit MessagingSettingsUpdated(msg.sender, version);
    }

    /**
     * @notice Get user's latest messaging settings
     * @param user Address of user to query
     * @return text Settings JSON string (latest version)
     * @return data Binary data (typically empty)
     */
    function getMessagingSettings(address user)
        external
        view
        returns (string memory text, bytes memory data)
    {
        return storageContract.get(KEY_MESSAGING_SETTINGS, user);
    }

    /**
     * @notice Get specific version of messaging settings
     * @param user Address of user to query
     * @param versionIndex Version index
     * @return text Settings JSON at that version
     * @return data Binary data at that version
     */
    function getMessagingSettingsVersion(address user, uint256 versionIndex)
        external
        view
        returns (string memory text, bytes memory data)
    {
        return storageContract.getValueAtIndex(KEY_MESSAGING_SETTINGS, user, versionIndex);
    }

    /**
     * @notice Get total number of setting updates for a user
     * @param user Address to query
     * @return Total setting versions stored
     */
    function getMessagingSettingsVersionCount(address user) external view returns (uint256) {
        return storageContract.getTotalWrites(KEY_MESSAGING_SETTINGS, user);
    }

    // ============ GLOBAL CONFIG FUNCTIONS (ADMIN ONLY) ============

    /**
     * @notice Set global messaging configuration (admin only)
     * @dev Stores app-wide rules, rate limits, feature flags, etc.
     *      Only callable by contract owner
     * 
     * Example JSON format:
     * {
     *   "globalRateLimit": "10 messages per minute",
     *   "dmRateLimit": "5 messages per minute per user",
     *   "maxMessageLength": 1000,
     *   "allowedFeatures": ["global", "zone", "dm"],
     *   "moderators": ["0xABC...", "0xDEF..."],
     *   "bannedWords": ["spam", "scam"]
     * }
     * 
     * @param configJson JSON-encoded global configuration
     */
    function setGlobalMessagingConfig(string calldata configJson) external onlyOwner {
        if (bytes(configJson).length == 0) revert EmptyData();

        storageContract.put(
            KEY_GLOBAL_MESSAGING_CONFIG,
            configJson,
            ""
        );

        uint256 version = storageContract.getTotalWrites(KEY_GLOBAL_MESSAGING_CONFIG, owner);
        emit GlobalConfigUpdated(version);
    }

    /**
     * @notice Get latest global messaging configuration
     * @return text Config JSON string (latest version)
     * @return data Binary data (typically empty)
     */
    function getGlobalMessagingConfig()
        external
        view
        returns (string memory text, bytes memory data)
    {
        return storageContract.get(KEY_GLOBAL_MESSAGING_CONFIG, owner);
    }

    /**
     * @notice Get specific version of global config
     * @param versionIndex Version index
     * @return text Config JSON at that version
     * @return data Binary data at that version
     */
    function getGlobalMessagingConfigVersion(uint256 versionIndex)
        external
        view
        returns (string memory text, bytes memory data)
    {
        return storageContract.getValueAtIndex(KEY_GLOBAL_MESSAGING_CONFIG, owner, versionIndex);
    }

    /**
     * @notice Get total number of global config updates
     * @return Total config versions stored
     */
    function getGlobalMessagingConfigVersionCount() external view returns (uint256) {
        return storageContract.getTotalWrites(KEY_GLOBAL_MESSAGING_CONFIG, owner);
    }

    // ============ BATCH READ HELPERS ============

    /**
     * @notice Get profile and settings for a user in one call
     * @dev Saves gas for frontend by batching reads
     * @param user Address to query
     * @return profileText Latest profile JSON
     * @return settingsText Latest messaging settings JSON
     */
    function getUserData(address user)
        external
        view
        returns (string memory profileText, string memory settingsText)
    {
        (profileText, ) = storageContract.get(KEY_PROFILE, user);
        (settingsText, ) = storageContract.get(KEY_MESSAGING_SETTINGS, user);
    }

    /**
     * @notice Check if user has set up profile and settings
     * @param user Address to query
     * @return hasProfile True if user has written profile data
     * @return hasSettings True if user has written messaging settings
     */
    function hasUserData(address user)
        external
        view
        returns (bool hasProfile, bool hasSettings)
    {
        hasProfile = storageContract.getTotalWrites(KEY_PROFILE, user) > 0;
        hasSettings = storageContract.getTotalWrites(KEY_MESSAGING_SETTINGS, user) > 0;
    }
}
