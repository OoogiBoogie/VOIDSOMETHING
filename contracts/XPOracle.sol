// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title XPOracle
 * @notice v1: Trusted oracle for off-chain vXP (Virtual Experience Points)
 * @dev Future v2: Merkle snapshot + proof system for decentralization
 * 
 * vXP affects:
 * - Governance voting power (×0.2 multiplier)
 * - Vault APR boosts (up to +20%)
 * - Mission eligibility
 * 
 * Indexer calculates vXP from all hub activities, submits hourly updates
 */
contract XPOracle is AccessControl {
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");
    
    // User vXP scores
    mapping(address => uint256) public xpScores;
    
    // Last update timestamp per user
    mapping(address => uint256) public lastUpdate;
    
    // Last update block per user (for debugging)
    mapping(address => uint256) public lastUpdateBlock;
    
    // Global stats
    uint256 public totalXP;
    uint256 public totalUsers;
    
    // Constants
    uint256 public constant VOTING_WEIGHT_MULTIPLIER = 20; // 0.2x = 20/100
    uint256 public constant MAX_APR_BOOST_BPS = 2000;     // +20% max boost
    uint256 public constant XP_PER_BOOST_BPS = 1;         // 1 vXP = 1 basis point boost
    
    event XPUpdated(address indexed user, uint256 oldScore, uint256 newScore, uint256 timestamp);
    event BatchXPUpdated(uint256 userCount, uint256 totalXPAdded, uint256 timestamp);
    
    constructor(address admin, address updater) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPDATER_ROLE, updater);
    }
    
    /**
     * @notice Set vXP for a single user
     * @param user User address
     * @param score New vXP score
     */
    function setXP(address user, uint256 score) external onlyRole(UPDATER_ROLE) {
        uint256 oldScore = xpScores[user];
        
        if (oldScore == 0 && score > 0) {
            totalUsers++;
        } else if (oldScore > 0 && score == 0) {
            totalUsers--;
        }
        
        totalXP = totalXP - oldScore + score;
        xpScores[user] = score;
        lastUpdate[user] = block.timestamp;
        lastUpdateBlock[user] = block.number;
        
        emit XPUpdated(user, oldScore, score, block.timestamp);
    }
    
    /**
     * @notice Batch set vXP for multiple users (gas efficient)
     * @param users Array of user addresses
     * @param scores Array of vXP scores
     */
    function setXPBatch(
        address[] calldata users,
        uint256[] calldata scores
    ) external onlyRole(UPDATER_ROLE) {
        require(users.length == scores.length, "XPOracle: length mismatch");
        
        uint256 xpAdded = 0;
        
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            uint256 score = scores[i];
            uint256 oldScore = xpScores[user];
            
            if (oldScore == 0 && score > 0) {
                totalUsers++;
            } else if (oldScore > 0 && score == 0) {
                totalUsers--;
            }
            
            xpAdded += (score > oldScore) ? (score - oldScore) : 0;
            totalXP = totalXP - oldScore + score;
            xpScores[user] = score;
            lastUpdate[user] = block.timestamp;
            lastUpdateBlock[user] = block.number;
        }
        
        emit BatchXPUpdated(users.length, xpAdded, block.timestamp);
    }
    
    /**
     * @notice Get user's vXP score
     * @param user User address
     * @return User's current vXP
     */
    function getXP(address user) external view returns (uint256) {
        return xpScores[user];
    }
    
    /**
     * @notice Calculate voting power contribution from vXP
     * @param user User address
     * @return Voting power (vXP × 0.2)
     */
    function getVotingWeight(address user) external view returns (uint256) {
        return (xpScores[user] * VOTING_WEIGHT_MULTIPLIER) / 100;
    }
    
    /**
     * @notice Calculate vault APR boost from vXP
     * @param user User address
     * @return Boost in basis points (max 2000 = +20%)
     */
    function getAPRBoost(address user) external view returns (uint256) {
        uint256 userXP = xpScores[user];
        uint256 boost = userXP * XP_PER_BOOST_BPS;
        
        // Cap at max boost
        if (boost > MAX_APR_BOOST_BPS) {
            return MAX_APR_BOOST_BPS;
        }
        
        return boost;
    }
    
    /**
     * @notice Get multiple users' vXP in one call
     * @param users Array of user addresses
     * @return Array of vXP scores
     */
    function getXPBatch(address[] calldata users) external view returns (uint256[] memory) {
        uint256[] memory scores = new uint256[](users.length);
        for (uint256 i = 0; i < users.length; i++) {
            scores[i] = xpScores[users[i]];
        }
        return scores;
    }
    
    /**
     * @notice Get oracle stats
     * @return totalXP_ Total vXP across all users
     * @return totalUsers_ Number of users with vXP > 0
     * @return avgXP Average vXP per user
     */
    function getStats() external view returns (
        uint256 totalXP_,
        uint256 totalUsers_,
        uint256 avgXP
    ) {
        totalXP_ = totalXP;
        totalUsers_ = totalUsers;
        avgXP = totalUsers > 0 ? totalXP / totalUsers : 0;
    }
    
    /**
     * @notice Check if oracle data is stale for a user
     * @param user User address
     * @param maxAge Maximum acceptable age in seconds
     * @return True if last update is older than maxAge
     */
    function isStale(address user, uint256 maxAge) external view returns (bool) {
        if (lastUpdate[user] == 0) return true;
        return (block.timestamp - lastUpdate[user]) > maxAge;
    }
}
