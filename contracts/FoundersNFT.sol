// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title Founders NFT (4444 Collection)
 * @notice Genesis membership collection for the Agency Ecosystem
 * @dev Three-tier mint: Schizo List (free), Whitelist (discounted), Public
 */
contract FoundersNFT is ERC721Enumerable, Ownable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 4444;
    uint256 public constant SCHIZO_ALLOCATION = 444;
    uint256 public constant WHITELIST_ALLOCATION = 2000;
    uint256 public constant PUBLIC_ALLOCATION = 2000;
    
    uint256 public constant SCHIZO_MAX_PER_WALLET = 3;
    uint256 public constant WHITELIST_MAX_PER_WALLET = 5;
    uint256 public constant PUBLIC_MAX_PER_WALLET = 10;
    
    uint256 public schizoPrice = 0; // Free
    uint256 public whitelistPrice = 0.001 ether; // Base Sepolia testnet price
    uint256 public publicPrice = 0.002 ether; // Base Sepolia testnet price
    
    uint256 public schizoMinted;
    uint256 public whitelistMinted;
    uint256 public publicMinted;
    
    bytes32 public schizoMerkleRoot;
    bytes32 public whitelistMerkleRoot;
    
    bool public schizoMintActive;
    bool public whitelistMintActive;
    bool public publicMintActive;
    
    string private baseTokenURI;
    address public incubationVault;
    
    mapping(address => uint256) public schizoMintCount;
    mapping(address => uint256) public whitelistMintCount;
    mapping(address => uint256) public publicMintCount;
    
    event SchizoMint(address indexed minter, uint256 quantity);
    event WhitelistMint(address indexed minter, uint256 quantity);
    event PublicMint(address indexed minter, uint256 quantity);
    event RoyaltyPaid(address indexed vault, uint256 amount);
    
    constructor(
        string memory _baseTokenURI,
        address _incubationVault
    ) ERC721("Founders NFT", "FOUNDER") {
        baseTokenURI = _baseTokenURI;
        incubationVault = _incubationVault;
    }
    
    function setSchizoMerkleRoot(bytes32 _root) external onlyOwner {
        schizoMerkleRoot = _root;
    }
    
    function setWhitelistMerkleRoot(bytes32 _root) external onlyOwner {
        whitelistMerkleRoot = _root;
    }
    
    function setSchizoMintActive(bool _active) external onlyOwner {
        schizoMintActive = _active;
    }
    
    function setWhitelistMintActive(bool _active) external onlyOwner {
        whitelistMintActive = _active;
    }
    
    function setPublicMintActive(bool _active) external onlyOwner {
        publicMintActive = _active;
    }
    
    function schizoMint(uint256 quantity, bytes32[] calldata proof) external nonReentrant {
        require(schizoMintActive, "Schizo mint not active");
        require(schizoMinted + quantity <= SCHIZO_ALLOCATION, "Exceeds schizo allocation");
        require(schizoMintCount[msg.sender] + quantity <= SCHIZO_MAX_PER_WALLET, "Exceeds max per wallet");
        
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(proof, schizoMerkleRoot, leaf), "Invalid proof");
        
        schizoMintCount[msg.sender] += quantity;
        schizoMinted += quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(msg.sender, totalSupply() + 1);
        }
        
        emit SchizoMint(msg.sender, quantity);
    }
    
    function whitelistMint(uint256 quantity, bytes32[] calldata proof) external payable nonReentrant {
        require(whitelistMintActive, "Whitelist mint not active");
        require(whitelistMinted + quantity <= WHITELIST_ALLOCATION, "Exceeds whitelist allocation");
        require(whitelistMintCount[msg.sender] + quantity <= WHITELIST_MAX_PER_WALLET, "Exceeds max per wallet");
        require(msg.value >= whitelistPrice * quantity, "Insufficient payment");
        
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(proof, whitelistMerkleRoot, leaf), "Invalid proof");
        
        whitelistMintCount[msg.sender] += quantity;
        whitelistMinted += quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(msg.sender, totalSupply() + 1);
        }
        
        emit WhitelistMint(msg.sender, quantity);
    }
    
    function publicMint(uint256 quantity) external payable nonReentrant {
        require(publicMintActive, "Public mint not active");
        require(publicMinted + quantity <= PUBLIC_ALLOCATION, "Exceeds public allocation");
        require(publicMintCount[msg.sender] + quantity <= PUBLIC_MAX_PER_WALLET, "Exceeds max per wallet");
        require(msg.value >= publicPrice * quantity, "Insufficient payment");
        
        publicMintCount[msg.sender] += quantity;
        publicMinted += quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(msg.sender, totalSupply() + 1);
        }
        
        emit PublicMint(msg.sender, quantity);
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        
        (bool success, ) = incubationVault.call{value: balance}("");
        require(success, "Transfer failed");
        
        emit RoyaltyPaid(incubationVault, balance);
    }
    
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }
    
    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseTokenURI = _newBaseURI;
    }
}
