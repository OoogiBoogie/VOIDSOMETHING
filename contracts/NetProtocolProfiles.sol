// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title NetProtocolProfiles
/// @notice On-chain core profile / progress storage for the VOID universe.
/// @dev Stores only compact, critical data. Rich data is stored off-chain and
///      referenced via `dataHash` (e.g. IPFS / Arweave CID truncated / hashed).
contract NetProtocolProfiles {
    // ------------------------------------------------------------------------
    // Types
    // ------------------------------------------------------------------------

    struct ProfileCore {
        // timestamps
        uint64 createdAt;   // first write
        uint64 updatedAt;   // last write

        // zone / world coords (int32 is plenty for grid-based worlds)
        int32 zoneX;
        int32 zoneY;

        int32 posX;
        int32 posY;
        int32 posZ;

        // scene / shard
        uint32 sceneId;

        // progress
        uint32 level;
        uint64 xp;

        // hash / pointer to rich off-chain data (inventory, quests, etc.)
        // recommended: keccak256 of a JSON blob, or a hash of an IPFS CID
        bytes32 dataHash;
    }

    // ------------------------------------------------------------------------
    // Storage
    // ------------------------------------------------------------------------

    mapping(address => ProfileCore) private _profiles;

    address public owner;

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------

    event ProfileUpserted(address indexed user, ProfileCore core);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

    // ------------------------------------------------------------------------
    // Modifiers
    // ------------------------------------------------------------------------

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------

    constructor() {
        owner = msg.sender;
    }

    // ------------------------------------------------------------------------
    // Admin
    // ------------------------------------------------------------------------

    /// @notice Transfer contract ownership (optional, for admin/admin UIs).
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }

    // ------------------------------------------------------------------------
    // View functions
    // ------------------------------------------------------------------------

    /// @notice Returns the profile for a given wallet.
    /// @dev If `createdAt == 0` the profile has never been initialized.
    function getProfile(address user) external view returns (ProfileCore memory) {
        return _profiles[user];
    }

    /// @notice Returns true if the profile has been initialized.
    function hasProfile(address user) external view returns (bool) {
        return _profiles[user].createdAt != 0;
    }

    // ------------------------------------------------------------------------
    // Mutating functions
    // ------------------------------------------------------------------------

    /// @notice Upserts the caller's profile with the provided core data.
    /// @dev Frontend should:
    ///      1) call getProfile()
    ///      2) merge existing with new changes
    ///      3) call upsertProfile(mergedCore)
    function upsertProfile(ProfileCore calldata core) external {
        address user = msg.sender;
        ProfileCore storage existing = _profiles[user];

        // initialize `createdAt` if first time
        if (existing.createdAt == 0) {
            existing.createdAt = uint64(block.timestamp);
        }

        // NOTE: we always override all other fields; caller is expected to send
        // the full merged struct, not a partial delta.
        existing.updatedAt = uint64(block.timestamp);

        existing.zoneX = core.zoneX;
        existing.zoneY = core.zoneY;
        existing.posX = core.posX;
        existing.posY = core.posY;
        existing.posZ = core.posZ;
        existing.sceneId = core.sceneId;
        existing.level = core.level;
        existing.xp = core.xp;
        existing.dataHash = core.dataHash;

        emit ProfileUpserted(user, existing);
    }

    /// @notice Owner-only override to update profiles (optional admin use).
    /// @dev Useful for migrations or manual corrections.
    function adminUpsertProfile(
        address user,
        ProfileCore calldata core
    ) external onlyOwner {
        require(user != address(0), "Zero user");

        ProfileCore storage existing = _profiles[user];

        if (existing.createdAt == 0) {
            existing.createdAt = uint64(block.timestamp);
        }

        existing.updatedAt = uint64(block.timestamp);

        existing.zoneX = core.zoneX;
        existing.zoneY = core.zoneY;
        existing.posX = core.posX;
        existing.posY = core.posY;
        existing.posZ = core.posZ;
        existing.sceneId = core.sceneId;
        existing.level = core.level;
        existing.xp = core.xp;
        existing.dataHash = core.dataHash;

        emit ProfileUpserted(user, existing);
    }
}
