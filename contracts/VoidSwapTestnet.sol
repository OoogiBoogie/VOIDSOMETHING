// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title VoidSwapTestnet
 * @notice TESTNET-ONLY simple AMM for VOID/USDC swaps with fee routing to VoidHookRouterV4
 * @dev Constant product (x*y=k) AMM with 0.3% fee
 * 
 * WARNING: THIS IS A TESTNET CONTRACT - NOT FOR MAINNET USE
 * 
 * Features:
 * - Simple constant-product AMM for VOID/USDC pair
 * - 0.3% swap fee routed to VoidHookRouterV4
 * - Owner can add/remove liquidity
 * - Slippage protection
 */
contract VoidSwapTestnet is Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    /// @notice VOID token address
    IERC20 public immutable voidToken;
    
    /// @notice USDC token address
    IERC20 public immutable usdcToken;
    
    /// @notice Fee router address (receives swap fees)
    address public immutable feeRouter;
    
    /// @notice Fee in basis points (30 = 0.3%)
    uint256 public constant FEE_BPS = 30;
    uint256 public constant BPS_DENOMINATOR = 10_000;
    
    /// @notice Reserve balances
    uint256 public reserveVoid;
    uint256 public reserveUsdc;
    
    /// @notice Total fees collected
    uint256 public totalFeesVoid;
    uint256 public totalFeesUsdc;
    
    // ============ Events ============
    
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );
    
    event LiquidityAdded(uint256 amountVoid, uint256 amountUsdc);
    event LiquidityRemoved(uint256 amountVoid, uint256 amountUsdc);
    event FeeRouted(address indexed feeRouter, address token, uint256 amount);
    
    // ============ Errors ============
    
    error InvalidToken();
    error InsufficientLiquidity();
    error InsufficientInputAmount();
    error InsufficientOutputAmount();
    error SlippageExceeded();
    error TransferFailed();
    error InvalidAmount();
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the swap contract
     * @param _voidToken VOID token address
     * @param _usdcToken USDC token address
     * @param _feeRouter VoidHookRouterV4 address
     */
    constructor(
        address _voidToken,
        address _usdcToken,
        address _feeRouter
    ) {
        if (_voidToken == address(0) || _usdcToken == address(0) || _feeRouter == address(0)) {
            revert InvalidToken();
        }
        
        voidToken = IERC20(_voidToken);
        usdcToken = IERC20(_usdcToken);
        feeRouter = _feeRouter;
    }
    
    // ============ Swap Functions ============
    
    /**
     * @notice Swap exact input tokens for output tokens
     * @param tokenIn Address of input token (VOID or USDC)
     * @param amountIn Amount of input tokens
     * @param minAmountOut Minimum amount of output tokens (slippage protection)
     * @return amountOut Amount of output tokens received
     */
    function swapExactIn(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert InsufficientInputAmount();
        
        // Determine which token is in/out
        bool isVoidIn = tokenIn == address(voidToken);
        if (!isVoidIn && tokenIn != address(usdcToken)) revert InvalidToken();
        
        // Get reserves
        (uint256 reserveIn, uint256 reserveOut) = isVoidIn
            ? (reserveVoid, reserveUsdc)
            : (reserveUsdc, reserveVoid);
        
        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();
        
        // Calculate fee
        uint256 fee = (amountIn * FEE_BPS) / BPS_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - fee;
        
        // Calculate output amount using constant product formula
        // amountOut = (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee)
        amountOut = getAmountOut(amountInAfterFee, reserveIn, reserveOut);
        
        // Check slippage
        if (amountOut < minAmountOut) revert SlippageExceeded();
        if (amountOut == 0) revert InsufficientOutputAmount();
        
        // Transfer input token from user
        IERC20 inputToken = isVoidIn ? voidToken : usdcToken;
        IERC20 outputToken = isVoidIn ? usdcToken : voidToken;
        
        bool success = inputToken.transferFrom(msg.sender, address(this), amountIn);
        if (!success) revert TransferFailed();
        
        // Update reserves (add input minus fee)
        if (isVoidIn) {
            reserveVoid += amountInAfterFee;
            reserveUsdc -= amountOut;
            totalFeesVoid += fee;
        } else {
            reserveUsdc += amountInAfterFee;
            reserveVoid -= amountOut;
            totalFeesUsdc += fee;
        }
        
        // Transfer output token to user
        success = outputToken.transfer(msg.sender, amountOut);
        if (!success) revert TransferFailed();
        
        emit Swap(
            msg.sender,
            tokenIn,
            address(outputToken),
            amountIn,
            amountOut,
            fee
        );
    }
    
    /**
     * @notice Get quote for exact input swap
     * @param tokenIn Input token address
     * @param amountIn Input amount
     * @return amountOut Expected output amount
     * @return fee Fee amount
     */
    function getQuote(address tokenIn, uint256 amountIn)
        external
        view
        returns (uint256 amountOut, uint256 fee)
    {
        if (amountIn == 0) return (0, 0);
        
        bool isVoidIn = tokenIn == address(voidToken);
        if (!isVoidIn && tokenIn != address(usdcToken)) return (0, 0);
        
        (uint256 reserveIn, uint256 reserveOut) = isVoidIn
            ? (reserveVoid, reserveUsdc)
            : (reserveUsdc, reserveVoid);
        
        if (reserveIn == 0 || reserveOut == 0) return (0, 0);
        
        fee = (amountIn * FEE_BPS) / BPS_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - fee;
        amountOut = getAmountOut(amountInAfterFee, reserveIn, reserveOut);
    }
    
    /**
     * @notice Calculate output amount using constant product formula
     * @param amountIn Input amount (after fee)
     * @param reserveIn Input token reserve
     * @param reserveOut Output token reserve
     * @return amountOut Output amount
     */
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256 amountOut) {
        if (amountIn == 0 || reserveIn == 0 || reserveOut == 0) return 0;
        
        // amountOut = (reserveOut * amountIn) / (reserveIn + amountIn)
        uint256 numerator = reserveOut * amountIn;
        uint256 denominator = reserveIn + amountIn;
        amountOut = numerator / denominator;
    }
    
    /**
     * @notice Get current price (VOID per USDC)
     * @return price VOID per USDC (scaled by 1e18)
     */
    function getPrice() external view returns (uint256 price) {
        if (reserveUsdc == 0) return 0;
        // price = reserveVoid / reserveUsdc (scaled)
        price = (reserveVoid * 1e18) / reserveUsdc;
    }
    
    // ============ Liquidity Functions (Owner Only) ============
    
    /**
     * @notice Add liquidity to the pool
     * @param amountVoid Amount of VOID to add
     * @param amountUsdc Amount of USDC to add
     */
    function addLiquidity(uint256 amountVoid, uint256 amountUsdc)
        external
        onlyOwner
    {
        if (amountVoid == 0 || amountUsdc == 0) revert InvalidAmount();
        
        // Transfer tokens from owner
        bool success = voidToken.transferFrom(msg.sender, address(this), amountVoid);
        if (!success) revert TransferFailed();
        
        success = usdcToken.transferFrom(msg.sender, address(this), amountUsdc);
        if (!success) revert TransferFailed();
        
        // Update reserves
        reserveVoid += amountVoid;
        reserveUsdc += amountUsdc;
        
        emit LiquidityAdded(amountVoid, amountUsdc);
    }
    
    /**
     * @notice Remove liquidity from the pool
     * @param amountVoid Amount of VOID to remove
     * @param amountUsdc Amount of USDC to remove
     */
    function removeLiquidity(uint256 amountVoid, uint256 amountUsdc)
        external
        onlyOwner
    {
        if (amountVoid > reserveVoid || amountUsdc > reserveUsdc) {
            revert InsufficientLiquidity();
        }
        
        // Update reserves
        reserveVoid -= amountVoid;
        reserveUsdc -= amountUsdc;
        
        // Transfer tokens to owner
        bool success = voidToken.transfer(msg.sender, amountVoid);
        if (!success) revert TransferFailed();
        
        success = usdcToken.transfer(msg.sender, amountUsdc);
        if (!success) revert TransferFailed();
        
        emit LiquidityRemoved(amountVoid, amountUsdc);
    }
    
    /**
     * @notice Route accumulated fees to VoidHookRouterV4
     */
    function routeFees() external {
        uint256 voidFees = totalFeesVoid;
        uint256 usdcFees = totalFeesUsdc;
        
        if (voidFees > 0) {
            totalFeesVoid = 0;
            bool success = voidToken.transfer(feeRouter, voidFees);
            if (!success) revert TransferFailed();
            emit FeeRouted(feeRouter, address(voidToken), voidFees);
        }
        
        if (usdcFees > 0) {
            totalFeesUsdc = 0;
            bool success = usdcToken.transfer(feeRouter, usdcFees);
            if (!success) revert TransferFailed();
            emit FeeRouted(feeRouter, address(usdcToken), usdcFees);
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get reserve balances
     */
    function getReserves() external view returns (uint256, uint256) {
        return (reserveVoid, reserveUsdc);
    }
    
    /**
     * @notice Get accumulated fees
     */
    function getAccumulatedFees() external view returns (uint256, uint256) {
        return (totalFeesVoid, totalFeesUsdc);
    }
}
