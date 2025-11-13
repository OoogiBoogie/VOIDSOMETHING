// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/VoidHookRouterV4.sol";
import "../contracts/mocks/ERC20Mock.sol";

/**
 * @title Economic Invariants Test Suite
 * @notice Critical tests for mainnet economic safety
 * @dev Tests MUST pass before deployment to Base mainnet
 */
contract EconomicInvariantsTest is Test {
    VoidHookRouterV4 public router;
    ERC20Mock public token;
    
    address constant CREATOR = address(0x1);
    address constant XVOID_STAKERS = address(0x2);
    address constant PSX_TREASURY = address(0x3);
    address constant CREATE_TREASURY = address(0x4);
    address constant AGENCY = address(0x5);
    address constant GRANTS = address(0x6);
    address constant SECURITY = address(0x7);
    address constant BUYER = address(0x8);

    function setUp() public {
        token = new ERC20Mock("USDC", "USDC", 1_000_000 * 1e6);
        
        router = new VoidHookRouterV4(
            XVOID_STAKERS,
            PSX_TREASURY,
            CREATE_TREASURY,
            AGENCY,
            GRANTS,
            SECURITY
        );
        
        token.transfer(BUYER, 100_000 * 1e6);
    }

    /// @notice INVARIANT: Fee weights MUST sum to exactly 10000 BPS (100%)
    function test_INVARIANT_FeeWeightsSum10000() public {
        uint256 total = router.CREATOR_SHARE_BPS() +
                        router.STAKER_SHARE_BPS() +
                        router.PSX_TREASURY_SHARE_BPS() +
                        router.CREATE_TREASURY_SHARE_BPS() +
                        router.AGENCY_SHARE_BPS() +
                        router.GRANTS_VAULT_SHARE_BPS() +
                        router.SECURITY_RESERVE_SHARE_BPS();
        
        assertEq(total, 10000, "CRITICAL: Fee split must be exactly 100%");
    }

    /// @notice INVARIANT: Fee distribution MUST match 40/20/10/10/10/5/5 split
    function test_INVARIANT_FeeDistributionExact() public {
        uint256 amount = 10_000 * 1e6; // $10,000 test
        
        vm.prank(BUYER);
        token.approve(address(router), amount);
        
        // Record balances
        uint256 creatorBefore = token.balanceOf(CREATOR);
        uint256 stakersBefore = token.balanceOf(XVOID_STAKERS);
        uint256 psxBefore = token.balanceOf(PSX_TREASURY);
        uint256 createBefore = token.balanceOf(CREATE_TREASURY);
        uint256 agencyBefore = token.balanceOf(AGENCY);
        uint256 grantsBefore = token.balanceOf(GRANTS);
        uint256 securityBefore = token.balanceOf(SECURITY);
        
        // Execute
        vm.prank(BUYER);
        router.routeFees(address(token), amount, CREATOR);
        
        // Verify EXACT distributions
        assertEq(token.balanceOf(CREATOR) - creatorBefore, 4000 * 1e6, "CRITICAL: Creator must get 40%");
        assertEq(token.balanceOf(XVOID_STAKERS) - stakersBefore, 2000 * 1e6, "CRITICAL: Stakers must get 20%");
        assertEq(token.balanceOf(PSX_TREASURY) - psxBefore, 1000 * 1e6, "CRITICAL: PSX must get 10%");
        assertEq(token.balanceOf(CREATE_TREASURY) - createBefore, 1000 * 1e6, "CRITICAL: CREATE must get 10%");
        assertEq(token.balanceOf(AGENCY) - agencyBefore, 1000 * 1e6, "CRITICAL: Agency must get 10%");
        assertEq(token.balanceOf(GRANTS) - grantsBefore, 500 * 1e6, "CRITICAL: Grants must get 5%");
        assertEq(token.balanceOf(SECURITY) - securityBefore, 500 * 1e6, "CRITICAL: Security must get 5%");
    }

    /// @notice INVARIANT: Total distributed MUST equal input (no loss/gain)
    function testFuzz_INVARIANT_NoFundsLostOrCreated(uint96 amount) public {
        vm.assume(amount > 1000 && amount < 1_000_000 * 1e6);
        
        token.mint(BUYER, amount);
        
        vm.prank(BUYER);
        token.approve(address(router), amount);
        
        uint256 routerBalanceBefore = token.balanceOf(address(router));
        uint256 totalBefore = token.balanceOf(CREATOR) +
                              token.balanceOf(XVOID_STAKERS) +
                              token.balanceOf(PSX_TREASURY) +
                              token.balanceOf(CREATE_TREASURY) +
                              token.balanceOf(AGENCY) +
                              token.balanceOf(GRANTS) +
                              token.balanceOf(SECURITY);
        
        vm.prank(BUYER);
        router.routeFees(address(token), amount, CREATOR);
        
        uint256 totalAfter = token.balanceOf(CREATOR) +
                             token.balanceOf(XVOID_STAKERS) +
                             token.balanceOf(PSX_TREASURY) +
                             token.balanceOf(CREATE_TREASURY) +
                             token.balanceOf(AGENCY) +
                             token.balanceOf(GRANTS) +
                             token.balanceOf(SECURITY);
        
        // Router should not hold any funds
        assertEq(token.balanceOf(address(router)), routerBalanceBefore, "Router must not hold funds");
        
        // Total distributed should equal input (allow 7 wei for rounding across 7 transfers)
        assertApproxEqAbs(totalAfter - totalBefore, amount, 7, "CRITICAL: Funds lost or created");
    }

    /// @notice INVARIANT: Router constants must match deployment requirements
    function test_INVARIANT_RouterConstants() public {
        assertEq(router.CREATOR_SHARE_BPS(), 4000, "Creator share must be 4000 BPS");
        assertEq(router.STAKER_SHARE_BPS(), 2000, "Staker share must be 2000 BPS");
        assertEq(router.PSX_TREASURY_SHARE_BPS(), 1000, "PSX share must be 1000 BPS");
        assertEq(router.CREATE_TREASURY_SHARE_BPS(), 1000, "CREATE share must be 1000 BPS");
        assertEq(router.AGENCY_SHARE_BPS(), 1000, "Agency share must be 1000 BPS");
        assertEq(router.GRANTS_VAULT_SHARE_BPS(), 500, "Grants share must be 500 BPS");
        assertEq(router.SECURITY_RESERVE_SHARE_BPS(), 500, "Security share must be 500 BPS");
    }

    /// @notice SAFETY: Zero amount must revert
    function test_SAFETY_ZeroAmountReverts() public {
        vm.prank(BUYER);
        vm.expectRevert(VoidHookRouterV4.InvalidAmount.selector);
        router.routeFees(address(token), 0, CREATOR);
    }

    /// @notice SAFETY: Zero creator address must revert
    function test_SAFETY_ZeroCreatorReverts() public {
        vm.prank(BUYER);
        vm.expectRevert(VoidHookRouterV4.ZeroAddress.selector);
        router.routeFees(address(token), 1000, address(0));
    }

    /// @notice SAFETY: Paused state must block routing
    function test_SAFETY_PausedBlocksRouting() public {
        router.grantRole(router.ADMIN_ROLE(), address(this));
        router.pause();
        
        vm.prank(BUYER);
        token.approve(address(router), 1000);
        
        vm.prank(BUYER);
        vm.expectRevert("Pausable: paused");
        router.routeFees(address(token), 1000, CREATOR);
    }
}
