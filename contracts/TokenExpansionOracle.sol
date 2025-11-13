// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TokenExpansionOracle
 * @notice Tracks token economic activity for conditional land expansion
 * @dev Monitors volume, holders, fees to unlock expansion rights
 * 
 * Flow:
 * 1. Indexer tracks swap volumes, holder counts, fees per token
 * 2. Writes to updateStats() daily
 * 3. EmissionAI/GovernanceAI checks criteria
 * 4. If met, proposes expansion to DAO
 * 5. DAO approves → markExpansionUnlocked() → WorldLand mints new parcels
 * 
 * This prevents spam land minting while allowing organic growth
 */
contract TokenExpansionOracle is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    struct TokenStats {
        uint256 rollingVolume7d;     // Last 7 days trading volume (USD)
        uint256 uniqueHolders;        // Number of unique holder addresses
        uint256 feesPaidTotal;        // Total fees paid to protocol
        uint256 lastUpdate;           // Timestamp of last stats update
        bool expansionUnlocked;       // True if DAO approved expansion
        uint256 expansionUnlockedAt;  // Timestamp when unlocked
    }
    
    // Expansion criteria (can be updated by governance)
    struct ExpansionCriteria {
        uint256 minVolume7d;         // Min 7-day volume (e.g., $500k)
        uint256 minHolders;          // Min unique holders (e.g., 100)
        uint256 minFeesPaid;         // Min total fees (e.g., $1k)
        bool enabled;                // True if criteria are active
    }
    
    // Token stats
    mapping(address => TokenStats) public tokenStats;
    
    // Expansion criteria
    ExpansionCriteria public criteria;
    
    // Track unlocked tokens
    address[] public unlockedTokens;
    mapping(address => bool) public isUnlocked;
    
    // Stats
    uint256 public totalTokensTracked;
    uint256 public totalExpansionsUnlocked;
    
    event StatsUpdated(
        address indexed token,
        uint256 volume7d,
        uint256 holders,
        uint256 feesPaid
    );
    event CriteriaUpdated(
        uint256 minVolume,
        uint256 minHolders,
        uint256 minFeesPaid
    );
    event ExpansionUnlocked(
        address indexed token,
        uint256 volume7d,
        uint256 holders,
        uint256 feesPaid
    );
    
    constructor(
        address admin,
        address oracle,
        address governance,
        uint256 minVolume,
        uint256 minHolders,
        uint256 minFeesPaid
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ORACLE_ROLE, oracle);
        _grantRole(GOVERNANCE_ROLE, governance);
        
        criteria = ExpansionCriteria({
            minVolume7d: minVolume,
            minHolders: minHolders,
            minFeesPaid: minFeesPaid,
            enabled: true
        });
    }
    
    /**
     * @notice Update token stats (indexer/oracle only)
     * @param token Token address
     * @param stats New stats
     */
    function updateStats(address token, TokenStats calldata stats) 
        external 
        onlyRole(ORACLE_ROLE) 
    {
        TokenStats storage current = tokenStats[token];
        
        // First time tracking this token
        if (current.lastUpdate == 0) {
            totalTokensTracked++;
        }
        
        current.rollingVolume7d = stats.rollingVolume7d;
        current.uniqueHolders = stats.uniqueHolders;
        current.feesPaidTotal = stats.feesPaidTotal;
        current.lastUpdate = block.timestamp;
        
        emit StatsUpdated(
            token,
            stats.rollingVolume7d,
            stats.uniqueHolders,
            stats.feesPaidTotal
        );
    }
    
    /**
     * @notice Batch update stats (gas efficient)
     * @param tokens Array of token addresses
     * @param stats Array of stats
     */
    function updateStatsBatch(
        address[] calldata tokens,
        TokenStats[] calldata stats
    ) external onlyRole(ORACLE_ROLE) {
        require(tokens.length == stats.length, "TokenExpansionOracle: length mismatch");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            TokenStats storage current = tokenStats[tokens[i]];
            
            if (current.lastUpdate == 0) {
                totalTokensTracked++;
            }
            
            current.rollingVolume7d = stats[i].rollingVolume7d;
            current.uniqueHolders = stats[i].uniqueHolders;
            current.feesPaidTotal = stats[i].feesPaidTotal;
            current.lastUpdate = block.timestamp;
        }
    }
    
    /**
     * @notice Check if token meets expansion criteria
     * @param token Token address
     * @return meets True if criteria met
     */
    function checkExpansionCriteria(address token) external view returns (bool) {
        if (!criteria.enabled) return false;
        
        TokenStats storage stats = tokenStats[token];
        
        return (
            stats.rollingVolume7d >= criteria.minVolume7d &&
            stats.uniqueHolders >= criteria.minHolders &&
            stats.feesPaidTotal >= criteria.minFeesPaid
        );
    }
    
    /**
     * @notice Mark expansion as unlocked (DAO/Governance only)
     * @param token Token address
     */
    function markExpansionUnlocked(address token) external onlyRole(GOVERNANCE_ROLE) {
        TokenStats storage stats = tokenStats[token];
        require(!stats.expansionUnlocked, "TokenExpansionOracle: already unlocked");
        require(
            stats.rollingVolume7d >= criteria.minVolume7d &&
            stats.uniqueHolders >= criteria.minHolders &&
            stats.feesPaidTotal >= criteria.minFeesPaid,
            "TokenExpansionOracle: criteria not met"
        );
        
        stats.expansionUnlocked = true;
        stats.expansionUnlockedAt = block.timestamp;
        
        if (!isUnlocked[token]) {
            unlockedTokens.push(token);
            isUnlocked[token] = true;
            totalExpansionsUnlocked++;
        }
        
        emit ExpansionUnlocked(
            token,
            stats.rollingVolume7d,
            stats.uniqueHolders,
            stats.feesPaidTotal
        );
    }
    
    /**
     * @notice Update expansion criteria (governance only)
     * @param minVolume Min 7-day volume
     * @param minHolders Min unique holders
     * @param minFeesPaid Min total fees
     */
    function updateCriteria(
        uint256 minVolume,
        uint256 minHolders,
        uint256 minFeesPaid
    ) external onlyRole(GOVERNANCE_ROLE) {
        criteria.minVolume7d = minVolume;
        criteria.minHolders = minHolders;
        criteria.minFeesPaid = minFeesPaid;
        
        emit CriteriaUpdated(minVolume, minHolders, minFeesPaid);
    }
    
    /**
     * @notice Enable/disable expansion criteria
     * @param enabled True to enable
     */
    function setCriteriaEnabled(bool enabled) external onlyRole(GOVERNANCE_ROLE) {
        criteria.enabled = enabled;
    }
    
    /**
     * @notice Get token stats
     * @param token Token address
     * @return stats TokenStats struct
     */
    function getStats(address token) external view returns (TokenStats memory) {
        return tokenStats[token];
    }
    
    /**
     * @notice Get tokens eligible for expansion
     * @return eligible Array of token addresses meeting criteria
     */
    function getEligibleTokens() external view returns (address[] memory) {
        // Count eligible tokens
        uint256 eligibleCount = 0;
        address[] memory allTokens = new address[](totalTokensTracked);
        
        // This is inefficient - in production, maintain a separate array
        // For now, just return empty array (indexer should track this)
        address[] memory eligible = new address[](0);
        return eligible;
    }
    
    /**
     * @notice Get all unlocked tokens
     * @return Array of unlocked token addresses
     */
    function getUnlockedTokens() external view returns (address[] memory) {
        return unlockedTokens;
    }
    
    /**
     * @notice Check if stats are stale
     * @param token Token address
     * @param maxAge Max acceptable age in seconds
     * @return True if stale
     */
    function isStale(address token, uint256 maxAge) external view returns (bool) {
        TokenStats storage stats = tokenStats[token];
        if (stats.lastUpdate == 0) return true;
        return (block.timestamp - stats.lastUpdate) > maxAge;
    }
}
