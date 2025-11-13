// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WorldLandTestnet
 * @notice TESTNET-ONLY contract for VOID world land parcels (40×40 grid = 1600 parcels)
 * @dev Simple ERC721 implementation for Base Sepolia testing
 * 
 * WARNING: THIS IS A TESTNET CONTRACT - NOT FOR MAINNET USE
 * 
 * Features:
 * - 1600 land parcels (parcelId 0-1599)
 * - Fixed price in VOID tokens
 * - Simple purchase mechanism
 * - Owner can withdraw accumulated funds
 */
contract WorldLandTestnet is ERC721, Ownable {
    // ============ State Variables ============
    
    /// @notice Payment token (VOID)
    IERC20 public immutable paymentToken;
    
    /// @notice Price per parcel in payment token (e.g., 100 VOID)
    uint256 public pricePerParcel;
    
    /// @notice Total parcels in the grid (40×40)
    uint256 public constant TOTAL_PARCELS = 1600;
    
    /// @notice Grid dimensions
    uint256 public constant GRID_SIZE = 40;
    
    /// @notice Mapping of parcelId to whether it's been sold
    mapping(uint256 => bool) public parcelSold;
    
    /// @notice Counter for total parcels sold
    uint256 public totalSold;
    
    // ============ Events ============
    
    event ParcelPurchased(
        address indexed buyer,
        uint256 indexed parcelId,
        uint256 price,
        uint256 x,
        uint256 z
    );
    
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    event FundsWithdrawn(address indexed to, uint256 amount);
    
    // ============ Errors ============
    
    error InvalidParcelId();
    error ParcelAlreadySold();
    error PaymentFailed();
    error WithdrawalFailed();
    error InvalidPrice();
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the land contract
     * @param _paymentToken Address of VOID token
     * @param _pricePerParcel Initial price per parcel
     */
    constructor(
        address _paymentToken,
        uint256 _pricePerParcel
    ) ERC721("VOID Land", "VLAND") {
        if (_paymentToken == address(0)) revert InvalidPrice();
        if (_pricePerParcel == 0) revert InvalidPrice();
        
        paymentToken = IERC20(_paymentToken);
        pricePerParcel = _pricePerParcel;
    }
    
    // ============ Public Functions ============
    
    /**
     * @notice Purchase a land parcel
     * @param parcelId The parcel to purchase (0-1599)
     * @dev User must have approved this contract to spend pricePerParcel tokens
     */
    function buyParcel(uint256 parcelId) external {
        // Validate parcel ID
        if (parcelId >= TOTAL_PARCELS) revert InvalidParcelId();
        
        // Check if already sold
        if (parcelSold[parcelId]) revert ParcelAlreadySold();
        
        // Mark as sold
        parcelSold[parcelId] = true;
        totalSold++;
        
        // Transfer payment from buyer to this contract
        bool success = paymentToken.transferFrom(
            msg.sender,
            address(this),
            pricePerParcel
        );
        if (!success) revert PaymentFailed();
        
        // Mint NFT to buyer
        _safeMint(msg.sender, parcelId);
        
        // Calculate coordinates
        (uint256 x, uint256 z) = parcelIdToCoords(parcelId);
        
        // Emit event
        emit ParcelPurchased(msg.sender, parcelId, pricePerParcel, x, z);
    }
    
    /**
     * @notice Batch purchase multiple parcels
     * @param parcelIds Array of parcel IDs to purchase
     */
    function buyParcels(uint256[] calldata parcelIds) external {
        uint256 totalCost = pricePerParcel * parcelIds.length;
        
        // Transfer all tokens at once
        bool success = paymentToken.transferFrom(
            msg.sender,
            address(this),
            totalCost
        );
        if (!success) revert PaymentFailed();
        
        // Mint all parcels
        for (uint256 i = 0; i < parcelIds.length; i++) {
            uint256 parcelId = parcelIds[i];
            
            if (parcelId >= TOTAL_PARCELS) revert InvalidParcelId();
            if (parcelSold[parcelId]) revert ParcelAlreadySold();
            
            parcelSold[parcelId] = true;
            totalSold++;
            
            _safeMint(msg.sender, parcelId);
            
            (uint256 x, uint256 z) = parcelIdToCoords(parcelId);
            emit ParcelPurchased(msg.sender, parcelId, pricePerParcel, x, z);
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Convert parcel ID to grid coordinates
     * @param parcelId The parcel ID (0-1599)
     * @return x X coordinate (0-39)
     * @return z Z coordinate (0-39)
     */
    function parcelIdToCoords(uint256 parcelId)
        public
        pure
        returns (uint256 x, uint256 z)
    {
        x = parcelId % GRID_SIZE;
        z = parcelId / GRID_SIZE;
    }
    
    /**
     * @notice Convert grid coordinates to parcel ID
     * @param x X coordinate (0-39)
     * @param z Z coordinate (0-39)
     * @return parcelId The parcel ID
     */
    function coordsToParcelId(uint256 x, uint256 z)
        public
        pure
        returns (uint256)
    {
        return z * GRID_SIZE + x;
    }
    
    /**
     * @notice Check if a parcel is available for purchase
     * @param parcelId The parcel ID to check
     * @return available True if available, false if sold
     */
    function isAvailable(uint256 parcelId) external view returns (bool) {
        if (parcelId >= TOTAL_PARCELS) return false;
        return !parcelSold[parcelId];
    }
    
    /**
     * @notice Get owner of parcel (returns zero address if not minted)
     * @param parcelId The parcel ID
     * @return owner The owner address (or zero address if unminted)
     */
    function getParcelOwner(uint256 parcelId) external view returns (address) {
        if (parcelId >= TOTAL_PARCELS) return address(0);
        if (!parcelSold[parcelId]) return address(0);
        return ownerOf(parcelId);
    }
    
    /**
     * @notice Get all parcels owned by an address
     * @param owner The address to query
     * @return ownedParcels Array of parcel IDs owned by the address
     */
    function getParcelsOwnedBy(address owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 balance = balanceOf(owner);
        uint256[] memory ownedParcels = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 i = 0; i < TOTAL_PARCELS && index < balance; i++) {
            if (parcelSold[i] && ownerOf(i) == owner) {
                ownedParcels[index] = i;
                index++;
            }
        }
        
        return ownedParcels;
    }
    
    /**
     * @notice Get total parcels sold
     */
    function getTotalSold() external view returns (uint256) {
        return totalSold;
    }
    
    /**
     * @notice Get total parcels available
     */
    function getTotalAvailable() external view returns (uint256) {
        return TOTAL_PARCELS - totalSold;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update price per parcel (owner only)
     * @param newPrice New price in payment token
     */
    function setPrice(uint256 newPrice) external onlyOwner {
        if (newPrice == 0) revert InvalidPrice();
        
        uint256 oldPrice = pricePerParcel;
        pricePerParcel = newPrice;
        
        emit PriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @notice Withdraw accumulated funds (owner only)
     * @param to Address to send funds to
     */
    function withdrawFunds(address to) external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        
        bool success = paymentToken.transfer(to, balance);
        if (!success) revert WithdrawalFailed();
        
        emit FundsWithdrawn(to, balance);
    }
    
    // ============ Metadata ============
    
    /**
     * @notice Override tokenURI to provide metadata
     * @dev In production, this would point to IPFS/API with parcel metadata
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        (uint256 x, uint256 z) = parcelIdToCoords(tokenId);
        
        // For testnet, return simple metadata
        // In production, replace with proper metadata URI
        return string(
            abi.encodePacked(
                "https://api.void.world/land/",
                _toString(tokenId),
                "?x=",
                _toString(x),
                "&z=",
                _toString(z)
            )
        );
    }
    
    /**
     * @notice Helper to convert uint to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
