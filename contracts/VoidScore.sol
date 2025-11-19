// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoidMessaging.sol";
import "./VoidStorage.sol";

/**
 * @title VoidScore
 * @notice Reputation and economic scoring system for The Void metaverse
 * @dev Tracks user scores based on:
 *      - Messaging activity (global, zone, DM)
 *      - Profile completeness
 *      - Identity setup
 *      
 * SCORING LOGIC:
 * 
 * MESSAGE ACTIVITY (with daily caps):
 *   - Global message: +1 point (max 50/day)
 *   - Zone message: +2 points (max 100/day)
 *   - DM sent: +3 points (max 50/day)
 * 
 * IDENTITY COMPLETENESS (one-time bonuses):
 *   - Profile set: +100 points
 *   - Messaging settings configured: +50 points
 * 
 * TIER SYSTEM:
 *   - 0 (None):   0-99 points
 *   - 1 (Bronze): 100-499 points
 *   - 2 (Silver): 500-1999 points
 *   - 3 (Gold):   2000-4999 points
 *   - 4 (S-tier): 5000+ points
 * 
 * FUTURE EXTENSIBILITY:
 *   - Token-based multipliers (VOID/PSX holdings)
 *   - NFT ownership bonuses
 *   - Quest completion rewards
 *   - Land ownership benefits
 *   - DAO participation scores
 */
contract VoidScore {
    // ============ IMMUTABLE REFERENCES ============

    /// @notice VoidMessaging contract for event integration
    VoidMessaging public immutable messaging;

    /// @notice VoidStorage contract for profile checks
    VoidStorage public immutable voidStorage;

    // ============ CONSTANTS ============

    /// @notice Daily reset timestamp (Unix epoch % 1 day)
    uint256 private constant SECONDS_PER_DAY = 86400;

    /// @notice Message type point values
    uint256 public constant POINTS_GLOBAL_MESSAGE = 1;
    uint256 public constant POINTS_ZONE_MESSAGE = 2;
    uint256 public constant POINTS_DM = 3;

    /// @notice Daily caps per message type
    uint256 public constant DAILY_CAP_GLOBAL = 50;
    uint256 public constant DAILY_CAP_ZONE = 100;
    uint256 public constant DAILY_CAP_DM = 50;

    /// @notice Identity completion bonuses
    uint256 public constant BONUS_PROFILE_SET = 100;
    uint256 public constant BONUS_SETTINGS_SET = 50;

    /// @notice Tier thresholds
    uint256 public constant TIER_BRONZE = 100;
    uint256 public constant TIER_SILVER = 500;
    uint256 public constant TIER_GOLD = 2000;
    uint256 public constant TIER_S = 5000;

    // ============ STATE ============

    /// @notice User total scores
    mapping(address => uint256) public scores;

    /// @notice Daily activity tracking: user => day => messageType => count
    /// @dev messageType: 0=global, 1=DM, 2=zone
    mapping(address => mapping(uint256 => mapping(uint8 => uint256))) public dailyActivity;

    /// @notice Track if user has claimed identity bonuses
    mapping(address => bool) public profileBonusClaimed;
    mapping(address => bool) public settingsBonusClaimed;

    // ============ EVENTS ============

    /**
     * @notice Emitted when user score changes
     * @param user User address
     * @param newScore Updated total score
     * @param reason Human-readable reason for score change
     * @param pointsAdded Amount of points added
     */
    event ScoreUpdated(
        address indexed user,
        uint256 newScore,
        string reason,
        uint256 pointsAdded
    );

    /**
     * @notice Emitted when user reaches new tier
     * @param user User address
     * @param tier New tier level (0-4)
     * @param score Current score
     */
    event TierReached(address indexed user, uint8 tier, uint256 score);

    // ============ ERRORS ============

    error ZeroAddress();
    error DailyCapReached(uint8 messageType, uint256 cap);
    error InvalidMessageType();

    // ============ CONSTRUCTOR ============

    /**
     * @notice Initialize VoidScore with contract references
     * @param _messaging VoidMessaging contract address
     * @param _storage VoidStorage contract address
     */
    constructor(address _messaging, address _storage) {
        if (_messaging == address(0) || _storage == address(0)) revert ZeroAddress();
        
        messaging = VoidMessaging(_messaging);
        voidStorage = VoidStorage(_storage);
    }

    // ============ CORE SCORING FUNCTIONS ============

    /**
     * @notice Record message activity and update score
     * @dev Called by VoidMessaging contract or users can call directly after sending messages
     * @param user User who sent the message
     * @param messageType 0=global, 1=DM, 2=zone
     */
    function recordMessage(address user, uint8 messageType) external {
        if (messageType > 2) revert InvalidMessageType();

        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        uint256 dailyCount = dailyActivity[user][currentDay][messageType];

        // Check daily caps
        uint256 cap;
        uint256 points;

        if (messageType == 0) {
            // Global message
            cap = DAILY_CAP_GLOBAL;
            points = POINTS_GLOBAL_MESSAGE;
        } else if (messageType == 1) {
            // DM
            cap = DAILY_CAP_DM;
            points = POINTS_DM;
        } else {
            // Zone message
            cap = DAILY_CAP_ZONE;
            points = POINTS_ZONE_MESSAGE;
        }

        if (dailyCount >= cap) revert DailyCapReached(messageType, cap);

        // Update daily activity
        dailyActivity[user][currentDay][messageType] = dailyCount + 1;

        // Add points to score
        uint256 oldScore = scores[user];
        uint256 newScore = oldScore + points;
        scores[user] = newScore;

        // Check for tier upgrade
        uint8 oldTier = _calculateTier(oldScore);
        uint8 newTier = _calculateTier(newScore);

        string memory reason;
        if (messageType == 0) {
            reason = "global_message";
        } else if (messageType == 1) {
            reason = "direct_message";
        } else {
            reason = "zone_message";
        }

        emit ScoreUpdated(user, newScore, reason, points);

        if (newTier > oldTier) {
            emit TierReached(user, newTier, newScore);
        }
    }

    /**
     * @notice Claim profile completion bonus
     * @dev Users call this after setting their profile
     */
    function claimProfileBonus() external {
        if (profileBonusClaimed[msg.sender]) return; // Already claimed

        // Verify user has actually set a profile
        (string memory profileText, ) = voidStorage.getProfile(msg.sender);
        if (bytes(profileText).length == 0) revert("Profile not set");

        profileBonusClaimed[msg.sender] = true;

        uint256 oldScore = scores[msg.sender];
        uint256 newScore = oldScore + BONUS_PROFILE_SET;
        scores[msg.sender] = newScore;

        uint8 oldTier = _calculateTier(oldScore);
        uint8 newTier = _calculateTier(newScore);

        emit ScoreUpdated(msg.sender, newScore, "profile_bonus", BONUS_PROFILE_SET);

        if (newTier > oldTier) {
            emit TierReached(msg.sender, newTier, newScore);
        }
    }

    /**
     * @notice Claim messaging settings bonus
     * @dev Users call this after configuring their settings
     */
    function claimSettingsBonus() external {
        if (settingsBonusClaimed[msg.sender]) return; // Already claimed

        // Verify user has actually set settings
        (string memory settingsText, ) = voidStorage.getMessagingSettings(msg.sender);
        if (bytes(settingsText).length == 0) revert("Settings not configured");

        settingsBonusClaimed[msg.sender] = true;

        uint256 oldScore = scores[msg.sender];
        uint256 newScore = oldScore + BONUS_SETTINGS_SET;
        scores[msg.sender] = newScore;

        uint8 oldTier = _calculateTier(oldScore);
        uint8 newTier = _calculateTier(newScore);

        emit ScoreUpdated(msg.sender, newScore, "settings_bonus", BONUS_SETTINGS_SET);

        if (newTier > oldTier) {
            emit TierReached(msg.sender, newTier, newScore);
        }
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Get user's total score
     * @param user User address
     * @return Total score
     */
    function getScore(address user) external view returns (uint256) {
        return scores[user];
    }

    /**
     * @notice Get user's tier
     * @param user User address
     * @return Tier level (0-4)
     */
    function getTier(address user) external view returns (uint8) {
        return _calculateTier(scores[user]);
    }

    /**
     * @notice Get user's daily activity counts
     * @param user User address
     * @param day Day index (block.timestamp / 86400)
     * @return globalCount Number of global messages sent today
     * @return dmCount Number of DMs sent today
     * @return zoneCount Number of zone messages sent today
     */
    function getDailyActivity(address user, uint256 day) 
        external 
        view 
        returns (uint256 globalCount, uint256 dmCount, uint256 zoneCount) 
    {
        globalCount = dailyActivity[user][day][0];
        dmCount = dailyActivity[user][day][1];
        zoneCount = dailyActivity[user][day][2];
    }

    /**
     * @notice Get user's today activity counts
     * @param user User address
     * @return globalCount Number of global messages sent today
     * @return dmCount Number of DMs sent today
     * @return zoneCount Number of zone messages sent today
     */
    function getTodayActivity(address user) 
        external 
        view 
        returns (uint256 globalCount, uint256 dmCount, uint256 zoneCount) 
    {
        uint256 today = block.timestamp / SECONDS_PER_DAY;
        globalCount = dailyActivity[user][today][0];
        dmCount = dailyActivity[user][today][1];
        zoneCount = dailyActivity[user][today][2];
    }

    /**
     * @notice Check if user has remaining daily quota
     * @param user User address
     * @param messageType 0=global, 1=DM, 2=zone
     * @return remaining Number of messages remaining today
     */
    function getRemainingDailyQuota(address user, uint8 messageType) 
        external 
        view 
        returns (uint256 remaining) 
    {
        uint256 today = block.timestamp / SECONDS_PER_DAY;
        uint256 used = dailyActivity[user][today][messageType];

        uint256 cap;
        if (messageType == 0) {
            cap = DAILY_CAP_GLOBAL;
        } else if (messageType == 1) {
            cap = DAILY_CAP_DM;
        } else if (messageType == 2) {
            cap = DAILY_CAP_ZONE;
        } else {
            return 0;
        }

        return used >= cap ? 0 : cap - used;
    }

    /**
     * @notice Get full user scoring data
     * @param user User address
     * @return score Total score
     * @return tier Current tier (0-4)
     * @return profileBonusClaimedVal Has claimed profile bonus
     * @return settingsBonusClaimedVal Has claimed settings bonus
     * @return globalRemaining Global messages remaining today
     * @return dmRemaining DMs remaining today
     * @return zoneRemaining Zone messages remaining today
     */
    function getUserScoringData(address user)
        external
        view
        returns (
            uint256 score,
            uint8 tier,
            bool profileBonusClaimedVal,
            bool settingsBonusClaimedVal,
            uint256 globalRemaining,
            uint256 dmRemaining,
            uint256 zoneRemaining
        )
    {
        score = scores[user];
        tier = _calculateTier(score);
        profileBonusClaimedVal = profileBonusClaimed[user];
        settingsBonusClaimedVal = settingsBonusClaimed[user];

        uint256 today = block.timestamp / SECONDS_PER_DAY;
        uint256 globalUsed = dailyActivity[user][today][0];
        uint256 dmUsed = dailyActivity[user][today][1];
        uint256 zoneUsed = dailyActivity[user][today][2];

        globalRemaining = globalUsed >= DAILY_CAP_GLOBAL ? 0 : DAILY_CAP_GLOBAL - globalUsed;
        dmRemaining = dmUsed >= DAILY_CAP_DM ? 0 : DAILY_CAP_DM - dmUsed;
        zoneRemaining = zoneUsed >= DAILY_CAP_ZONE ? 0 : DAILY_CAP_ZONE - zoneUsed;
    }

    // ============ INTERNAL HELPERS ============

    /**
     * @notice Calculate tier from score
     * @param score User's total score
     * @return tier Tier level (0-4)
     */
    function _calculateTier(uint256 score) internal pure returns (uint8 tier) {
        if (score < TIER_BRONZE) return 0; // None
        if (score < TIER_SILVER) return 1; // Bronze
        if (score < TIER_GOLD) return 2;   // Silver
        if (score < TIER_S) return 3;      // Gold
        return 4;                           // S-tier
    }

    // ============ ADMINISTRATIVE FUNCTIONS (Future Use) ============

    /**
     * @notice Get tier name for display
     * @param tier Tier level (0-4)
     * @return name Tier name string
     */
    function getTierName(uint8 tier) external pure returns (string memory name) {
        if (tier == 0) return "None";
        if (tier == 1) return "Bronze";
        if (tier == 2) return "Silver";
        if (tier == 3) return "Gold";
        if (tier == 4) return "S-tier";
        return "Unknown";
    }

    /**
     * @notice Get tier requirements
     * @param tier Tier level (1-4)
     * @return minScore Minimum score required
     */
    function getTierRequirement(uint8 tier) external pure returns (uint256 minScore) {
        if (tier == 1) return TIER_BRONZE;
        if (tier == 2) return TIER_SILVER;
        if (tier == 3) return TIER_GOLD;
        if (tier == 4) return TIER_S;
        return 0;
    }
}
