// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EscrowVault
 * @notice Milestone-based payment escrow for Agency jobs
 * @dev Holds job funds safely, releases based on milestone completion
 * 
 * Flow:
 * 1. Client creates job → funds escrow
 * 2. Worker completes milestones → agency/DAO marks complete
 * 3. Payment released to worker
 * 4. Disputes handled by DAO
 */
contract EscrowVault is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    bytes32 public constant AGENCY_ROLE = keccak256("AGENCY_ROLE");
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");
    
    enum EscrowStatus { FUNDED, ACTIVE, DISPUTED, COMPLETED, CANCELLED }
    
    struct Milestone {
        string description;
        uint256 payoutAmount;
        bool completed;
        bool paid;
        uint256 completedAt;
    }
    
    struct JobEscrow {
        uint256 jobId;
        address client;
        address worker;
        address paymentToken;     // PSX, CREATE, USDC, AGENCY, VOID
        uint256 totalBudget;
        uint256 totalPaid;
        EscrowStatus status;
        Milestone[] milestones;
        uint256 createdAt;
        uint256 disputedAt;
        address disputeInitiator;  // Track who initiated dispute
        string metadataURI;        // IPFS link to job details
    }
    
    // Escrow storage
    mapping(uint256 => JobEscrow) public escrows;
    uint256 public escrowCount;
    
    // User escrows
    mapping(address => uint256[]) public clientEscrows;
    mapping(address => uint256[]) public workerEscrows;
    
    // Stats
    uint256 public totalEscrowed;
    uint256 public totalReleased;
    uint256 public totalDisputed;
    
    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed jobId,
        address indexed client,
        address worker,
        address token,
        uint256 totalBudget
    );
    event EscrowFunded(uint256 indexed escrowId, uint256 amount);
    event MilestoneCompleted(
        uint256 indexed escrowId,
        uint256 milestoneIndex,
        address completedBy
    );
    event PaymentReleased(
        uint256 indexed escrowId,
        uint256 milestoneIndex,
        address indexed worker,
        uint256 amount
    );
    event EscrowDisputed(uint256 indexed escrowId, address initiator);
    event DisputeResolved(
        uint256 indexed escrowId,
        uint256 clientRefund,
        uint256 workerPayout
    );
    event EscrowCancelled(uint256 indexed escrowId, uint256 refundAmount);
    
    constructor(address admin, address agencyManager, address dao) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(AGENCY_ROLE, agencyManager);
        _grantRole(DAO_ROLE, dao);
    }
    
    /**
     * @notice Create job escrow
     * @param jobId Job ID from JobBoard
     * @param client Client address (job poster)
     * @param worker Worker address
     * @param paymentToken Token for payment (PSX, CREATE, USDC, etc)
     * @param totalBudget Total job budget
     * @param milestoneDescriptions Array of milestone descriptions
     * @param milestonePayouts Array of payout amounts per milestone
     * @param metadataURI IPFS URI with job details
     * @return escrowId
     */
    function createEscrow(
        uint256 jobId,
        address client,
        address worker,
        address paymentToken,
        uint256 totalBudget,
        string[] calldata milestoneDescriptions,
        uint256[] calldata milestonePayouts,
        string calldata metadataURI
    ) external onlyRole(AGENCY_ROLE) returns (uint256) {
        require(client != address(0) && worker != address(0), "EscrowVault: invalid addresses");
        require(
            milestoneDescriptions.length == milestonePayouts.length,
            "EscrowVault: milestone length mismatch"
        );
        require(milestoneDescriptions.length > 0, "EscrowVault: no milestones");
        
        // Verify payout sum = total budget
        uint256 sum = 0;
        for (uint256 i = 0; i < milestonePayouts.length; i++) {
            sum += milestonePayouts[i];
        }
        require(sum == totalBudget, "EscrowVault: milestone payouts != total budget");
        
        uint256 escrowId = escrowCount++;
        JobEscrow storage escrow = escrows[escrowId];
        
        escrow.jobId = jobId;
        escrow.client = client;
        escrow.worker = worker;
        escrow.paymentToken = paymentToken;
        escrow.totalBudget = totalBudget;
        escrow.totalPaid = 0;
        escrow.status = EscrowStatus.FUNDED;
        escrow.createdAt = block.timestamp;
        escrow.metadataURI = metadataURI;
        
        // Create milestones
        for (uint256 i = 0; i < milestoneDescriptions.length; i++) {
            escrow.milestones.push(Milestone({
                description: milestoneDescriptions[i],
                payoutAmount: milestonePayouts[i],
                completed: false,
                paid: false,
                completedAt: 0
            }));
        }
        
        clientEscrows[client].push(escrowId);
        workerEscrows[worker].push(escrowId);
        
        emit EscrowCreated(escrowId, jobId, client, worker, paymentToken, totalBudget);
        
        return escrowId;
    }
    
    /**
     * @notice Fund escrow (client deposits tokens)
     * @param escrowId Escrow ID
     */
    function fundEscrow(uint256 escrowId) external nonReentrant {
        JobEscrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.client, "EscrowVault: only client can fund");
        require(escrow.status == EscrowStatus.FUNDED, "EscrowVault: invalid status");
        
        IERC20 token = IERC20(escrow.paymentToken);
        token.safeTransferFrom(msg.sender, address(this), escrow.totalBudget);
        
        escrow.status = EscrowStatus.ACTIVE;
        totalEscrowed += escrow.totalBudget;
        
        emit EscrowFunded(escrowId, escrow.totalBudget);
    }
    
    /**
     * @notice Mark milestone as complete
     * @param escrowId Escrow ID
     * @param milestoneIndex Milestone index
     */
    function markMilestoneComplete(uint256 escrowId, uint256 milestoneIndex) 
        external 
    {
        JobEscrow storage escrow = escrows[escrowId];
        require(
            hasRole(AGENCY_ROLE, msg.sender) || msg.sender == escrow.client,
            "EscrowVault: unauthorized"
        );
        require(escrow.status == EscrowStatus.ACTIVE, "EscrowVault: not active");
        require(milestoneIndex < escrow.milestones.length, "EscrowVault: invalid milestone");
        
        Milestone storage milestone = escrow.milestones[milestoneIndex];
        require(!milestone.completed, "EscrowVault: already completed");
        
        milestone.completed = true;
        milestone.completedAt = block.timestamp;
        
        emit MilestoneCompleted(escrowId, milestoneIndex, msg.sender);
    }
    
    /**
     * @notice Release payment for completed milestone
     * @param escrowId Escrow ID
     * @param milestoneIndex Milestone index
     */
    function releasePayment(uint256 escrowId, uint256 milestoneIndex) 
        external 
        nonReentrant 
    {
        JobEscrow storage escrow = escrows[escrowId];
        require(
            hasRole(AGENCY_ROLE, msg.sender) || msg.sender == escrow.client,
            "EscrowVault: unauthorized"
        );
        require(escrow.status == EscrowStatus.ACTIVE, "EscrowVault: not active");
        require(milestoneIndex < escrow.milestones.length, "EscrowVault: invalid milestone");
        
        Milestone storage milestone = escrow.milestones[milestoneIndex];
        require(milestone.completed, "EscrowVault: milestone not completed");
        require(!milestone.paid, "EscrowVault: already paid");
        
        milestone.paid = true;
        escrow.totalPaid += milestone.payoutAmount;
        
        IERC20 token = IERC20(escrow.paymentToken);
        token.safeTransfer(escrow.worker, milestone.payoutAmount);
        
        totalReleased += milestone.payoutAmount;
        
        emit PaymentReleased(escrowId, milestoneIndex, escrow.worker, milestone.payoutAmount);
        
        // If all milestones paid, mark escrow as completed
        bool allPaid = true;
        for (uint256 i = 0; i < escrow.milestones.length; i++) {
            if (!escrow.milestones[i].paid) {
                allPaid = false;
                break;
            }
        }
        if (allPaid) {
            escrow.status = EscrowStatus.COMPLETED;
        }
    }
    
    /**
     * @notice Initiate dispute
     * @param escrowId Escrow ID
     */
    function initiateDispute(uint256 escrowId) external {
        JobEscrow storage escrow = escrows[escrowId];
        require(
            msg.sender == escrow.client || msg.sender == escrow.worker,
            "EscrowVault: not authorized"
        );
        require(escrow.status == EscrowStatus.ACTIVE, "EscrowVault: not active");
        
        // Anti-spam: prevent double-disputes by same party
        require(
            escrow.disputedAt == 0 || escrow.disputeInitiator != msg.sender,
            "EscrowVault: already disputed by you"
        );
        
        escrow.status = EscrowStatus.DISPUTED;
        escrow.disputedAt = block.timestamp;
        escrow.disputeInitiator = msg.sender;
        totalDisputed++;
        
        emit EscrowDisputed(escrowId, msg.sender);
    }
    
    /**
     * @notice Resolve dispute (DAO only)
     * @param escrowId Escrow ID
     * @param clientRefund Amount to refund client
     * @param workerPayout Amount to pay worker
     */
    function resolveDispute(
        uint256 escrowId,
        uint256 clientRefund,
        uint256 workerPayout
    ) external onlyRole(DAO_ROLE) nonReentrant {
        JobEscrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.DISPUTED, "EscrowVault: not disputed");
        
        uint256 remaining = escrow.totalBudget - escrow.totalPaid;
        require(clientRefund + workerPayout <= remaining, "EscrowVault: exceeds remaining balance");
        
        IERC20 token = IERC20(escrow.paymentToken);
        
        if (clientRefund > 0) {
            token.safeTransfer(escrow.client, clientRefund);
        }
        if (workerPayout > 0) {
            token.safeTransfer(escrow.worker, workerPayout);
            totalReleased += workerPayout;
        }
        
        escrow.totalPaid += (clientRefund + workerPayout);
        escrow.status = EscrowStatus.COMPLETED;
        
        emit DisputeResolved(escrowId, clientRefund, workerPayout);
    }
    
    /**
     * @notice Cancel escrow (before worker accepts)
     * @param escrowId Escrow ID
     */
    function cancelEscrow(uint256 escrowId) external nonReentrant {
        JobEscrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.client, "EscrowVault: only client can cancel");
        require(escrow.status == EscrowStatus.ACTIVE, "EscrowVault: not active");
        require(escrow.totalPaid == 0, "EscrowVault: payments already made");
        
        escrow.status = EscrowStatus.CANCELLED;
        
        IERC20 token = IERC20(escrow.paymentToken);
        token.safeTransfer(escrow.client, escrow.totalBudget);
        
        emit EscrowCancelled(escrowId, escrow.totalBudget);
    }
    
    /**
     * @notice Get escrow details
     * @param escrowId Escrow ID
     * @return jobId Job ID
     * @return client Client address
     * @return worker Worker address
     * @return paymentToken Payment token address
     * @return totalBudget Total budget
     * @return totalPaid Total paid
     * @return status Escrow status
     * @return milestoneCount Milestone count
     */
    function getEscrow(uint256 escrowId) external view returns (
        uint256 jobId,
        address client,
        address worker,
        address paymentToken,
        uint256 totalBudget,
        uint256 totalPaid,
        EscrowStatus status,
        uint256 milestoneCount
    ) {
        JobEscrow storage escrow = escrows[escrowId];
        return (
            escrow.jobId,
            escrow.client,
            escrow.worker,
            escrow.paymentToken,
            escrow.totalBudget,
            escrow.totalPaid,
            escrow.status,
            escrow.milestones.length
        );
    }
    
    /**
     * @notice Get milestone details
     * @param escrowId Escrow ID
     * @param milestoneIndex Milestone index
     * @return milestone Milestone struct
     */
    function getMilestone(uint256 escrowId, uint256 milestoneIndex) 
        external 
        view 
        returns (Milestone memory) 
    {
        return escrows[escrowId].milestones[milestoneIndex];
    }
    
    /**
     * @notice Get escrows by client
     * @param client Client address
     * @return Array of escrow IDs
     */
    function getClientEscrows(address client) external view returns (uint256[] memory) {
        return clientEscrows[client];
    }
    
    /**
     * @notice Get escrows by worker
     * @param worker Worker address
     * @return Array of escrow IDs
     */
    function getWorkerEscrows(address worker) external view returns (uint256[] memory) {
        return workerEscrows[worker];
    }
}
