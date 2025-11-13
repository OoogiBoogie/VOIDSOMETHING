// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20Mock
 * @notice Simple ERC20 mock for testnet deployments
 * @dev Mints initial supply to deployer, allows anyone to mint (testnet only!)
 */
contract ERC20Mock is ERC20 {
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _decimals = 18;
        _mint(msg.sender, initialSupply);
    }
    
    /**
     * @notice Mint tokens (testnet only - anyone can mint!)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
