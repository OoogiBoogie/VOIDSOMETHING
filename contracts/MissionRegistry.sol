// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title IVoidEmitter
 * @notice Interface for VoidEmitter integration
 */
interface IVoidEmitter {
    function logAction(string calldata actionType, uint256 magnitude) external;
}

/**
 * @title MissionRegistry
 * @notice On-chain registry of missions across all hubs
 * @dev MissionAI creates missions, users complete them for vXP + SIGNAL rewards
 * 
 * Hubs: WORLD, CREATOR, DEFI, DAO, AGENCY, AI_OPS
 * Difficulty: easy, medium, hard (affects rewards)
 * Rewards: vXP, SIGNAL, VOID (distributed via VoidEmitter)
 */
contract MissionRegistry is AccessControl {
    bytes32 public constant MISSION_AI_ROLE = keccak256("MISSION_AI_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // VoidEmitter integration for reward distribution
    IVoidEmitter public voidEmitter;
    
    enum HubType { WORLD, CREATOR, DEFI, DAO, AGENCY, AI_OPS }
    enum Difficulty { EASY, MEDIUM, HARD }
    enum MissionStatus { ACTIVE, PAUSED, COMPLETED, EXPIRED }
    
    struct RewardConfig {
        uint256 vxpAmount;      // vXP reward
        uint256 signalAmount;   // SIGNAL reward
        uint256 voidAmount;     // VOID reward (optional)
    }
    
    struct Mission {
        uint256 id;
        HubType hub;
        Difficulty difficulty;
        RewardConfig rewards;
        bool isActive;
        uint256 maxCompletions;      // 0 = unlimited
        uint256 currentCompletions;
        uint256 createdAt;
        uint256 expiresAt;           // 0 = never expires
        string metadataURI;          // IPFS/URL for mission details
    }
    
    // Mission storage
    mapping(uint256 => Mission) public missions;
    uint256 public missionCount;
    
    // User completions
    mapping(address => mapping(uint256 => bool)) public hasCompleted;
    mapping(address => uint256) public userCompletionCount;
    
    // Hub mission lists
    mapping(HubType => uint256[]) public hubMissions;
    
    // Stats
    uint256 public totalCompletions;
    uint256 public totalVXPAwarded;
    uint256 public totalSIGNALAwarded;
    
    event MissionCreated(
        uint256 indexed missionId,
        HubType hub,
        Difficulty difficulty,
        uint256 vxpReward,
        uint256 signalReward
    );
    event MissionCompleted(
        uint256 indexed missionId,
        address indexed user,
        uint256 vxpEarned,
        uint256 signalEarned,
        uint256 timestamp
    );
    event MissionStatusChanged(uint256 indexed missionId, bool isActive);
    
    constructor(address admin, address missionAI, address verifier, address _voidEmitter) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MISSION_AI_ROLE, missionAI);
        _grantRole(VERIFIER_ROLE, verifier);
        voidEmitter = IVoidEmitter(_voidEmitter);
    }
    
    /**
     * @notice Update VoidEmitter address
     * @param _voidEmitter New VoidEmitter address
     */
    function setVoidEmitter(address _voidEmitter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_voidEmitter != address(0), "MissionRegistry: zero address");
        voidEmitter = IVoidEmitter(_voidEmitter);
    }
    
    /**
     * @notice Create new mission (MissionAI only)
     * @param hub Hub type
     * @param difficulty Mission difficulty
     * @param rewards Reward amounts
     * @param maxCompletions Max times mission can be completed (0 = unlimited)
     * @param expiresAt Expiration timestamp (0 = never)
     * @param metadataURI IPFS URI with mission details
     * @return missionId
     */
    function createMission(
        HubType hub,
        Difficulty difficulty,
        RewardConfig calldata rewards,
        uint256 maxCompletions,
        uint256 expiresAt,
        string calldata metadataURI
    ) external onlyRole(MISSION_AI_ROLE) returns (uint256) {
        require(rewards.vxpAmount > 0, "MissionRegistry: vXP reward required");
        
        uint256 missionId = missionCount++;
        
        missions[missionId] = Mission({
            id: missionId,
            hub: hub,
            difficulty: difficulty,
            rewards: rewards,
            isActive: true,
            maxCompletions: maxCompletions,
            currentCompletions: 0,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            metadataURI: metadataURI
        });
        
        hubMissions[hub].push(missionId);
        
        emit MissionCreated(
            missionId,
            hub,
            difficulty,
            rewards.vxpAmount,
            rewards.signalAmount
        );
        
        return missionId;
    }
    
    /**
     * @notice Complete mission
     * @param missionId Mission to complete
     * @param user User completing mission
     * @param proof Optional proof of completion (hash)
     * @return vxpEarned Amount of vXP awarded
     */
    function completeMission(
        uint256 missionId,
        address user,
        bytes32 proof
    ) external onlyRole(VERIFIER_ROLE) returns (uint256 vxpEarned) {
        Mission storage mission = missions[missionId];
        
        require(mission.isActive, "MissionRegistry: mission not active");
        require(!hasCompleted[user][missionId], "MissionRegistry: already completed");
        require(
            mission.expiresAt == 0 || block.timestamp <= mission.expiresAt,
            "MissionRegistry: mission expired"
        );
        require(
            mission.maxCompletions == 0 || mission.currentCompletions < mission.maxCompletions,
            "MissionRegistry: max completions reached"
        );
        
        // Mark as completed
        hasCompleted[user][missionId] = true;
        mission.currentCompletions++;
        userCompletionCount[user]++;
        totalCompletions++;
        
        // Update stats
        totalVXPAwarded += mission.rewards.vxpAmount;
        totalSIGNALAwarded += mission.rewards.signalAmount;
        
        // Log action to VoidEmitter for vXP/SIGNAL reward distribution
        // Action format: "mission_completed_WORLD", "mission_completed_CREATOR", etc.
        string memory actionType = string(abi.encodePacked(
            "mission_completed_",
            _hubToString(mission.hub)
        ));
        voidEmitter.logAction(actionType, mission.rewards.vxpAmount + mission.rewards.signalAmount);
        
        emit MissionCompleted(
            missionId,
            user,
            mission.rewards.vxpAmount,
            mission.rewards.signalAmount,
            block.timestamp
        );
        
        return mission.rewards.vxpAmount;
    }
    
    /**
     * @notice Convert HubType enum to string
     * @param hub Hub type
     * @return Hub name as string
     */
    function _hubToString(HubType hub) internal pure returns (string memory) {
        if (hub == HubType.WORLD) return "WORLD";
        if (hub == HubType.CREATOR) return "CREATOR";
        if (hub == HubType.DEFI) return "DEFI";
        if (hub == HubType.DAO) return "DAO";
        if (hub == HubType.AGENCY) return "AGENCY";
        return "AI_OPS";
    }
    
    /**
     * @notice Toggle mission active status
     * @param missionId Mission ID
     * @param isActive New status
     */
    function setMissionStatus(uint256 missionId, bool isActive) 
        external 
        onlyRole(MISSION_AI_ROLE) 
    {
        missions[missionId].isActive = isActive;
        emit MissionStatusChanged(missionId, isActive);
    }
    
    /**
     * @notice Get mission details
     * @param missionId Mission ID
     * @return mission Mission struct
     */
    function getMission(uint256 missionId) external view returns (Mission memory) {
        return missions[missionId];
    }
    
    /**
     * @notice Get all missions for a hub
     * @param hub Hub type
     * @return missionIds Array of mission IDs
     */
    function getMissionsByHub(HubType hub) external view returns (uint256[] memory) {
        return hubMissions[hub];
    }
    
    /**
     * @notice Get active missions for a hub
     * @param hub Hub type
     * @return activeMissions Array of active mission IDs
     */
    function getActiveMissionsByHub(HubType hub) external view returns (uint256[] memory) {
        uint256[] memory allMissions = hubMissions[hub];
        uint256 activeCount = 0;
        
        // Count active missions
        for (uint256 i = 0; i < allMissions.length; i++) {
            if (missions[allMissions[i]].isActive && 
                (missions[allMissions[i]].expiresAt == 0 || 
                 block.timestamp <= missions[allMissions[i]].expiresAt)) {
                activeCount++;
            }
        }
        
        // Build active array
        uint256[] memory active = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allMissions.length; i++) {
            if (missions[allMissions[i]].isActive && 
                (missions[allMissions[i]].expiresAt == 0 || 
                 block.timestamp <= missions[allMissions[i]].expiresAt)) {
                active[index++] = allMissions[i];
            }
        }
        
        return active;
    }
    
    /**
     * @notice Check if user can complete mission
     * @param missionId Mission ID
     * @param user User address
     * @return eligible True if user can complete
     * @return reason Reason if not eligible
     */
    function canComplete(uint256 missionId, address user) 
        external 
        view 
        returns (bool eligible, string memory reason) 
    {
        Mission storage mission = missions[missionId];
        
        if (!mission.isActive) {
            return (false, "Mission not active");
        }
        if (hasCompleted[user][missionId]) {
            return (false, "Already completed");
        }
        if (mission.expiresAt != 0 && block.timestamp > mission.expiresAt) {
            return (false, "Mission expired");
        }
        if (mission.maxCompletions != 0 && mission.currentCompletions >= mission.maxCompletions) {
            return (false, "Max completions reached");
        }
        
        return (true, "");
    }
    
    /**
     * @notice Get user mission stats
     * @param user User address
     * @return completions Total missions completed
     * @return vxpEarned Total vXP earned (estimate, needs indexer for accuracy)
     */
    function getUserStats(address user) external view returns (
        uint256 completions,
        uint256 vxpEarned
    ) {
        completions = userCompletionCount[user];
        // Note: vxpEarned requires off-chain indexing for accuracy
        // This is a placeholder
        vxpEarned = 0;
    }
}
