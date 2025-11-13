// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseHook} from "@uniswap/v4-core/contracts/BaseHook.sol";
import {Hooks} from "@uniswap/v4-core/contracts/libraries/Hooks.sol";
import {IPoolManager} from "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/contracts/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/contracts/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/contracts/types/BalanceDelta.sol";

/**
 * @title VOID Ecosystem Hook
 * @notice Uniswap V4 hook that captures 0.20% fee on all VOID-paired swaps
 * @dev Distributes fees automatically to ecosystem participants
 */
contract VOIDEcosystemHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    address public immutable feeDistributor;
    address public immutable voidToken;
    
    uint256 public constant FEE_BPS = 20; // 0.20%
    uint256 public totalFeesCollected;
    
    mapping(PoolId => bool) public isVOIDPool;
    
    event FeeCollected(PoolId indexed poolId, uint256 amount);
    event FeesForwarded(address indexed distributor, uint256 amount);
    
    constructor(
        IPoolManager _poolManager,
        address _feeDistributor,
        address _voidToken
    ) BaseHook(_poolManager) {
        feeDistributor = _feeDistributor;
        voidToken = _voidToken;
    }
    
    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: true,
            beforeModifyPosition: false,
            afterModifyPosition: false,
            beforeSwap: false,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false
        });
    }
    
    function afterInitialize(
        address,
        PoolKey calldata key,
        uint160,
        int24,
        bytes calldata
    ) external override returns (bytes4) {
        // Check if pool contains VOID token
        if (address(key.currency0) == voidToken || address(key.currency1) == voidToken) {
            isVOIDPool[key.toId()] = true;
        }
        return BaseHook.afterInitialize.selector;
    }
    
    function afterSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata,
        BalanceDelta delta,
        bytes calldata
    ) external override returns (bytes4) {
        PoolId poolId = key.toId();
        
        // Only collect fees on VOID pools
        if (!isVOIDPool[poolId]) {
            return BaseHook.afterSwap.selector;
        }
        
        // Calculate fee (0.20% of swap amount)
        uint256 swapAmount = uint256(int256(delta.amount0() > 0 ? delta.amount0() : -delta.amount0()));
        uint256 fee = (swapAmount * FEE_BPS) / 10000;
        
        if (fee > 0) {
            totalFeesCollected += fee;
            emit FeeCollected(poolId, fee);
            
            // Forward fees to distributor periodically
            if (totalFeesCollected >= 1 ether) {
                _forwardFees();
            }
        }
        
        return BaseHook.afterSwap.selector;
    }
    
    function _forwardFees() internal {
        uint256 amount = totalFeesCollected;
        totalFeesCollected = 0;
        
        (bool success, ) = feeDistributor.call{value: amount}("");
        require(success, "Fee transfer failed");
        
        emit FeesForwarded(feeDistributor, amount);
    }
    
    function manualForwardFees() external {
        require(totalFeesCollected > 0, "No fees to forward");
        _forwardFees();
    }
}
