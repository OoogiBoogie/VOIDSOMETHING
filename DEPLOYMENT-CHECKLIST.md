# VOID Protocol Deployment Checklist

## Core Toolchain
- **Foundry is canonical** - Use `forge build` and `forge test` for all compilation/testing
- Always run `forge build` and `forge test` before any deployment
- Never deploy without passing tests

## Economic Invariants (NON-NEGOTIABLE)
- **Fee Split**: 40/20/10/10/10/5/5 (Creator/Stakers/PSX/CREATE/Agency/Grants/Security)
  - MUST sum to exactly 10000 BPS (100%)
  - Constructor enforces this, validated in tests
- **APR Boost Cap**: Maximum 2000 BPS (20%)
  - Hard cap in xVOIDVault
  - No boost can exceed 20% under any circumstances

## Deployment Process
1. Use `script/DeployProduction.s.sol` for all deployments
2. Network config auto-loaded from `deployments/config/{network}.json`
3. Write addresses to `deployments/{network}.json` after deployment
4. Verify all contracts on block explorer

## Pre-Mainnet Blockers (REQUIRED)
- [ ] All tests pass (`forge test`)
- [ ] Multi-sig addresses provided and non-zero (all 8 governance roles)
- [ ] Preflight checks pass (fee split, APR cap, deployer balance)
- [ ] Economic audit complete (fee routing, emission bounds, APR cap)

## Phase Scoping
**Phase 1 (Launch-Critical):**
- VoidHookRouterV4 (fee distribution)
- XPOracle (vXP reputation)
- EscrowVault (Agency job payments)
- xVOIDVault (staking with APR boost)
- MissionRegistry (mission rewards)
- TokenExpansionOracle (supply tracking)

**Phase 2+ (Post-Launch):**
- Cosmetics system
- Advanced AI features
- Expansion mechanics
- Additional hub integrations

**DO NOT block core launch on Phase 2+ features**

## Safety Rules
- **NEVER relax economic invariants without explicit human approval**
- **NEVER deploy to mainnet without multi-sig addresses**
- **NEVER skip tests or preflight checks**
- All governance roles MUST use multi-sig wallets on mainnet
- Deployer EOA acceptable only for testnet

## Quick Commands
```bash
# Build
forge build

# Test
forge test -vv

# Deploy to Base Sepolia (testnet)
make deploy-testnet

# Deploy to Base Mainnet (ONLY after all checks)
make deploy-mainnet
```

## File Locations
- Deployment script: `script/DeployProduction.s.sol`
- Testnet config: `deployments/config/baseSepolia.json`
- Mainnet config: `deployments/config/baseMainnet.json`
- Test suite: `test/EconomicInvariants.t.sol`
- Environment: `.env` (copy from `.env.example`)
