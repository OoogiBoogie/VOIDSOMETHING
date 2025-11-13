// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title VoidHookRouterV4
 * @notice Centralized fee distribution router for VOID ecosystem
 * @dev Week 1 Economic Revision - Finalized Fee Split:
 *      - 40% Creator (royalties)
 *      - 20% xVOID Stakers (APR yield)
 *      - 10% PSX Treasury (buybacks/liquidity)
 *      - 10% CREATE Treasury (creator ecosystem)
 *      - 10% Agency / Network Operations
 *      - 5%  Creator Grants Vault
 *      - 5%  Security / Infrastructure Reserve
 * 
 * Governance Hierarchy:
 * - L1: Users (activity)
 * - L2: Creators + Stakers (direct beneficiaries)
 * - L3: PSX + CREATE Treasuries (equal governance power)
 * - L4: Agency + Grants + Security (operations + renewal)
 */
contract VoidHookRouterV4 is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AI_ROLE = keccak256("AI_ROLE"); // For Phase 2 dynamic adjustments
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // ============ FEE CONSTANTS (BASIS POINTS) ============
    uint256 public constant FEE_DENOMINATOR = 10000; // 100.00%
    
    // Finalized Week 1 Fee Split (sum = 10000 bps = 100%)
    uint256 public constant CREATOR_SHARE_BPS = 4000;      // 40.00%
    uint256 public constant STAKER_SHARE_BPS = 2000;       // 20.00%
    uint256 public constant PSX_TREASURY_SHARE_BPS = 1000; // 10.00%
    uint256 public constant CREATE_TREASURY_SHARE_BPS = 1000; // 10.00%
    uint256 public constant AGENCY_SHARE_BPS = 1000;       // 10.00%
    uint256 public constant GRANTS_VAULT_SHARE_BPS = 500;  // 5.00%
    uint256 public constant SECURITY_RESERVE_SHARE_BPS = 500; // 5.00%

    // ============ RECIPIENT ADDRESSES ============
    address public xVoidStakingPool;      // 20% → xVOID stakers (APR yield)
    address public psxTreasury;           // 10% → PSX Treasury (buybacks/liquidity)
    address public createTreasury;        // 10% → CREATE Treasury (creator ecosystem)
    address public agencyWallet;          // 10% → Agency / Network Operations
    address public creatorGrantsVault;    // 5%  → Creator Grants Vault (onboarding)
    address public securityReserve;       // 5%  → Security / Infrastructure Reserve

    // ============ DYNAMIC FEE WEIGHTS (PHASE 2 PLACEHOLDER) ============
    // Phase 2: EmissionAI can modulate shares based on 7-day rolling volume
    // For now, these are unused but reserved for future governance
    struct DynamicFeeWeights {
        uint256 creatorShareBps;
        uint256 stakerShareBps;
        uint256 treasuryShareBps; // Combined PSX + CREATE
        uint256 agencyShareBps;
        uint256 lastUpdated;
        bool enabled; // Default: false (use constants above)
    }
    DynamicFeeWeights public dynamicWeights;

    // ============ EVENTS ============
    event FeeDistributed(
        address indexed recipient,
        uint256 amount,
        string category
    );

    event FeeRoutingExecuted(
        address indexed token,
        uint256 totalAmount,
        address indexed creator,
        uint256 creatorAmount,
        uint256 stakerAmount,
        uint256 psxAmount,
        uint256 createAmount,
        uint256 agencyAmount,
        uint256 grantsAmount,
        uint256 securityAmount
    );

    event RecipientUpdated(
        string recipientType,
        address oldAddress,
        address newAddress
    );

    event DynamicWeightsUpdated(
        uint256 newVolume7d,
        uint256 creatorShareBps,
        uint256 stakerShareBps,
        uint256 treasuryShareBps,
        uint256 agencyShareBps
    );

    // ============ ERRORS ============
    error InvalidRecipient();
    error InvalidAmount();
    error InvalidFeeSum();
    error ZeroAddress();
    error TransferFailed();

    // ============ CONSTRUCTOR ============
    constructor(
        address _xVoidStakingPool,
        address _psxTreasury,
        address _createTreasury,
        address _agencyWallet,
        address _creatorGrantsVault,
        address _securityReserve
    ) {
        if (
            _xVoidStakingPool == address(0) ||
            _psxTreasury == address(0) ||
            _createTreasury == address(0) ||
            _agencyWallet == address(0) ||
            _creatorGrantsVault == address(0) ||
            _securityReserve == address(0)
        ) revert ZeroAddress();

        xVoidStakingPool = _xVoidStakingPool;
        psxTreasury = _psxTreasury;
        createTreasury = _createTreasury;
        agencyWallet = _agencyWallet;
        creatorGrantsVault = _creatorGrantsVault;
        securityReserve = _securityReserve;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        // Validate fee sum = 100%
        uint256 totalBps = CREATOR_SHARE_BPS +
            STAKER_SHARE_BPS +
            PSX_TREASURY_SHARE_BPS +
            CREATE_TREASURY_SHARE_BPS +
            AGENCY_SHARE_BPS +
            GRANTS_VAULT_SHARE_BPS +
            SECURITY_RESERVE_SHARE_BPS;

        if (totalBps != FEE_DENOMINATOR) revert InvalidFeeSum();

        // Initialize dynamic weights (disabled by default)
        dynamicWeights = DynamicFeeWeights({
            creatorShareBps: CREATOR_SHARE_BPS,
            stakerShareBps: STAKER_SHARE_BPS,
            treasuryShareBps: PSX_TREASURY_SHARE_BPS + CREATE_TREASURY_SHARE_BPS,
            agencyShareBps: AGENCY_SHARE_BPS,
            lastUpdated: block.timestamp,
            enabled: false
        });
    }

    // ============ MAIN FEE ROUTING ============
    /**
     * @notice Routes fees from SKU purchases to all ecosystem participants
     * @param token Payment token (USDC, VOID, PSX, etc.)
     * @param totalAmount Total payment amount received
     * @param creator Creator wallet (receives 40% royalties)
     */
    function routeFees(
        address token,
        uint256 totalAmount,
        address creator
    ) external nonReentrant whenNotPaused {
        if (totalAmount == 0) revert InvalidAmount();
        if (creator == address(0)) revert ZeroAddress();

        IERC20 paymentToken = IERC20(token);

        // Calculate shares (using constants for Week 1)
        uint256 creatorAmount = (totalAmount * CREATOR_SHARE_BPS) / FEE_DENOMINATOR;
        uint256 stakerAmount = (totalAmount * STAKER_SHARE_BPS) / FEE_DENOMINATOR;
        uint256 psxAmount = (totalAmount * PSX_TREASURY_SHARE_BPS) / FEE_DENOMINATOR;
        uint256 createAmount = (totalAmount * CREATE_TREASURY_SHARE_BPS) / FEE_DENOMINATOR;
        uint256 agencyAmount = (totalAmount * AGENCY_SHARE_BPS) / FEE_DENOMINATOR;
        uint256 grantsAmount = (totalAmount * GRANTS_VAULT_SHARE_BPS) / FEE_DENOMINATOR;
        uint256 securityAmount = (totalAmount * SECURITY_RESERVE_SHARE_BPS) / FEE_DENOMINATOR;

        // Distribute fees
        paymentToken.safeTransferFrom(msg.sender, creator, creatorAmount);
        emit FeeDistributed(creator, creatorAmount, "CREATOR_ROYALTY");

        paymentToken.safeTransferFrom(msg.sender, xVoidStakingPool, stakerAmount);
        emit FeeDistributed(xVoidStakingPool, stakerAmount, "XVOID_STAKER_YIELD");

        paymentToken.safeTransferFrom(msg.sender, psxTreasury, psxAmount);
        emit FeeDistributed(psxTreasury, psxAmount, "PSX_TREASURY");

        paymentToken.safeTransferFrom(msg.sender, createTreasury, createAmount);
        emit FeeDistributed(createTreasury, createAmount, "CREATE_TREASURY");

        paymentToken.safeTransferFrom(msg.sender, agencyWallet, agencyAmount);
        emit FeeDistributed(agencyWallet, agencyAmount, "AGENCY_OPERATIONS");

        paymentToken.safeTransferFrom(msg.sender, creatorGrantsVault, grantsAmount);
        emit FeeDistributed(creatorGrantsVault, grantsAmount, "CREATOR_GRANTS");

        paymentToken.safeTransferFrom(msg.sender, securityReserve, securityAmount);
        emit FeeDistributed(securityReserve, securityAmount, "SECURITY_RESERVE");

        emit FeeRoutingExecuted(
            token,
            totalAmount,
            creator,
            creatorAmount,
            stakerAmount,
            psxAmount,
            createAmount,
            agencyAmount,
            grantsAmount,
            securityAmount
        );
    }

    // ============ PHASE 2: DYNAMIC FEE ELASTICITY (PLACEHOLDER) ============
    /**
     * @notice Adjust fee weights based on 7-day rolling volume (EmissionAI)
     * @dev Phase 2 only - currently disabled
     * @param newVolume7d Rolling 7-day volume in USD
     * @custom:ai-role Only callable by EmissionAI service
     */
    function adjustFeeWeights(uint256 newVolume7d) external onlyRole(AI_ROLE) {
        // PLACEHOLDER FOR PHASE 2
        // Logic will be:
        // - If volume < threshold: boost creator share to 45%
        // - If volume > high threshold: reduce creator share to 35%, boost stakers
        // - Agency share always protected at 10% minimum
        // - Treasuries (PSX + CREATE) maintain combined 20% minimum
        
        // For now: log event but don't change weights
        emit DynamicWeightsUpdated(
            newVolume7d,
            dynamicWeights.creatorShareBps,
            dynamicWeights.stakerShareBps,
            dynamicWeights.treasuryShareBps,
            dynamicWeights.agencyShareBps
        );

        dynamicWeights.lastUpdated = block.timestamp;
    }

    // ============ ADMIN FUNCTIONS ============
    function updateXVoidStakingPool(address _new) external onlyRole(ADMIN_ROLE) {
        if (_new == address(0)) revert ZeroAddress();
        emit RecipientUpdated("xVoidStakingPool", xVoidStakingPool, _new);
        xVoidStakingPool = _new;
    }

    function updatePSXTreasury(address _new) external onlyRole(ADMIN_ROLE) {
        if (_new == address(0)) revert ZeroAddress();
        emit RecipientUpdated("psxTreasury", psxTreasury, _new);
        psxTreasury = _new;
    }

    function updateCREATETreasury(address _new) external onlyRole(ADMIN_ROLE) {
        if (_new == address(0)) revert ZeroAddress();
        emit RecipientUpdated("createTreasury", createTreasury, _new);
        createTreasury = _new;
    }

    function updateAgencyWallet(address _new) external onlyRole(ADMIN_ROLE) {
        if (_new == address(0)) revert ZeroAddress();
        emit RecipientUpdated("agencyWallet", agencyWallet, _new);
        agencyWallet = _new;
    }

    function updateCreatorGrantsVault(address _new) external onlyRole(ADMIN_ROLE) {
        if (_new == address(0)) revert ZeroAddress();
        emit RecipientUpdated("creatorGrantsVault", creatorGrantsVault, _new);
        creatorGrantsVault = _new;
    }

    function updateSecurityReserve(address _new) external onlyRole(ADMIN_ROLE) {
        if (_new == address(0)) revert ZeroAddress();
        emit RecipientUpdated("securityReserve", securityReserve, _new);
        securityReserve = _new;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // ============ VIEW FUNCTIONS ============
    function getFeeBreakdown(uint256 totalAmount) external pure returns (
        uint256 creator,
        uint256 stakers,
        uint256 psx,
        uint256 create,
        uint256 agency,
        uint256 grants,
        uint256 security
    ) {
        creator = (totalAmount * CREATOR_SHARE_BPS) / FEE_DENOMINATOR;
        stakers = (totalAmount * STAKER_SHARE_BPS) / FEE_DENOMINATOR;
        psx = (totalAmount * PSX_TREASURY_SHARE_BPS) / FEE_DENOMINATOR;
        create = (totalAmount * CREATE_TREASURY_SHARE_BPS) / FEE_DENOMINATOR;
        agency = (totalAmount * AGENCY_SHARE_BPS) / FEE_DENOMINATOR;
        grants = (totalAmount * GRANTS_VAULT_SHARE_BPS) / FEE_DENOMINATOR;
        security = (totalAmount * SECURITY_RESERVE_SHARE_BPS) / FEE_DENOMINATOR;
    }

    function validateFeeSum() external pure returns (bool) {
        uint256 totalBps = CREATOR_SHARE_BPS +
            STAKER_SHARE_BPS +
            PSX_TREASURY_SHARE_BPS +
            CREATE_TREASURY_SHARE_BPS +
            AGENCY_SHARE_BPS +
            GRANTS_VAULT_SHARE_BPS +
            SECURITY_RESERVE_SHARE_BPS;
        return totalBps == FEE_DENOMINATOR;
    }
}
