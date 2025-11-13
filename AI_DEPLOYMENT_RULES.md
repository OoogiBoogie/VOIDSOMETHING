# 🧩 VOID Mainnet Handoff — Developer AI Instructions

**Primary Toolchain:** Foundry  
**Goal:** Prepare, validate, and deploy VOID ecosystem to Base mainnet safely and reproducibly.

---

## 🔧 1. Tooling & Build Rules

**Use Foundry as the canonical tool.**

Commands to run before any deployment:
```bash
forge build
forge test -vv
```

If either fails → **stop, log errors, and request human intervention.**

Hardhat may exist but is for testing only.

---

## 🧱 2. Repository Structure to Expect

- `contracts/` — Solidity source files
  - **Must include:** `VoidHookRouterV4.sol`, `xVOIDVault.sol`, `XPOracle.sol`, `MissionRegistry.sol`, `EscrowVault.sol`, `TokenExpansionOracle.sol`
- `script/DeployProduction.s.sol` — main deployment script
- `test/` — Foundry tests covering all invariants
- `foundry.toml` — configuration root

---

## 🌐 3. Environment Variables Required

Set in `.env` or the runtime shell:

```bash
BASE_SEPOLIA_RPC_URL=
BASE_MAINNET_RPC_URL=
DEPLOYER_PRIVATE_KEY=
USDC_BASE_MAINNET=
WETH_BASE_MAINNET=

ROUTER_ADMIN_MSIG=
TREASURY_PSX_MSIG=
TREASURY_CREATE_MSIG=
AGENCY_OPS_MSIG=
GRANTS_VAULT_MSIG=
SECURITY_RESERVE_MSIG=
PAUSE_GUARDIAN_MSIG=
XVOID_STAKING_POOL_MSIG=
```

**Rules:**
- **Testnet** → can use deployer address for all.
- **Mainnet** → must use multisig or DAO-controlled contracts.
- **Abort deployment if any required address is `0x0` or missing.**

---

## 💰 4. Immutable Economic Invariants

Keep the following untouched unless explicitly re-authorized:

| Recipient         | Share | Purpose              |
|-------------------|-------|----------------------|
| Creator           | 40%   | Royalties            |
| xVOID Vault       | 20%   | Staker yield         |
| PSX Treasury      | 10%   | Protocol treasury    |
| CREATE Treasury   | 10%   | Partner treasury     |
| Agency Ops        | 10%   | Operations fund      |
| Creator Grants    | 5%    | Creator grants vault |
| Security Reserve  | 5%    | System buffer        |

**Total = 10,000 bps (100%)**

**APR boost cap = 2,000 bps (20%)**

The AI must validate these invariants after every build and deploy.

---

## 🧪 5. Tests That Must Always Pass

Run with `forge test -vv` and confirm all pass:

- `VoidHookRouterV4.t.sol` → 10000bps fee sum, fuzz distribution
- `xVOIDVault.t.sol` → APR boost ≤ 20%, staking flow correct
- `MissionRegistry.t.sol` → no duplicate claims
- `EscrowVault.t.sol` → milestone escrow lifecycle correct

**Abort deploy if any fail.**

---

## 🚀 6. Deployment Flow

### Testnet (Base Sepolia):
```bash
forge script script/DeployProduction.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast
```
Save outputs to `deployments/baseSepolia.json`

### Mainnet (Base):
1. Run all tests.
2. Verify preflight:
   - All multisigs set.
   - Fee weights = 10000.
   - No placeholder addresses.
3. Deploy:
```bash
forge script script/DeployProduction.s.sol \
  --rpc-url $BASE_MAINNET_RPC_URL \
  --broadcast \
  --verify
```
4. Save results → `deployments/baseMainnet.json`

---

## 🧩 7. Phase Boundaries

**Phase 1 (Mainnet Launch):**
- Tokens, Vaults, Router, Oracle, EscrowVault, MissionRegistry.

**Phase 2 (Post-Launch):**
- Cosmetics, TokenExpansionOracle, AI mission automation, Uniswap V4 hooks.

**Do not delay core mainnet launch for Phase 2 features.**

---

## ⚠️ 8. Safety Rules

- Never deploy to mainnet if any multisig or parameter missing.
- Never modify economic ratios or APR caps without human authorization.
- Never use testnet addresses on mainnet.
- Always produce:
  - `deployments/*.json`
  - `DEPLOY_LOG.md`
  - Post-deploy verification results.

---

## ✅ 9. End Condition

System is considered **mainnet-ready** when:

- ✅ `forge build` and `forge test` pass.
- ✅ Fee router verified with 40/20/10/10/10/5/5 split.
- ✅ Multisig governance configured.
- ✅ Preflight checks pass.
- ✅ Deployment logged and verified on Basescan.

---

## 🤖 Quick Reference for AI Agents

**Before any deployment:**
```bash
$env:Path += ";C:\Users\rigof\.foundry\bin"  # Windows PowerShell
forge build && forge test -vv
```

**Checklist:**
- [ ] All tests passing
- [ ] Fee split = 40/20/10/10/10/5/5
- [ ] APR boost cap = 20%
- [ ] Multisigs configured (mainnet only)
- [ ] No `address(0)` in production config
- [ ] Deployment script outputs to `deployments/*.json`

**Deploy command:**
```bash
forge script script/DeployProduction.s.sol \
  --rpc-url <RPC_URL> \
  --broadcast \
  --verify
```

**Never compromise on:**
1. Economic invariants (fee splits, APR caps)
2. Security (multisigs, access control)
3. Testing (all tests must pass)
4. Verification (always verify on block explorer)

---

# 🚀 OPERATIONAL INSTRUCTIONS (QUICK START)

## Objective:
Deploy and maintain the VOID ecosystem safely across Base Sepolia (testnet) and Base mainnet using the rules above.

## 🔧 TOOLCHAIN

**Primary: Foundry**

Run these before any deployment:
```bash
forge build
forge test -vv
```

**Abort on any failed test or compiler error.**

Hardhat is optional (for integration tests only).

## 🧱 ENVIRONMENT (.env)

The following variables must exist:
```bash
BASE_SEPOLIA_RPC_URL=
BASE_MAINNET_RPC_URL=
DEPLOYER_PRIVATE_KEY=

USDC_BASE_MAINNET=
WETH_BASE_MAINNET=

ROUTER_ADMIN_MSIG=
TREASURY_PSX_MSIG=
TREASURY_CREATE_MSIG=
AGENCY_OPS_MSIG=
GRANTS_VAULT_MSIG=
SECURITY_RESERVE_MSIG=
PAUSE_GUARDIAN_MSIG=
XVOID_STAKING_POOL_MSIG=
```

- On **testnet**, you can reuse the deployer address for all roles.
- On **mainnet**, abort if any of the above addresses are `0x0` or EOAs.

## 💰 ECONOMIC INVARIANTS (DO NOT CHANGE)

| Recipient         | % | Purpose           |
|-------------------|---|-------------------|
| Creator           | 40| Royalties         |
| xVOID Stakers     | 20| Yield             |
| PSX Treasury      | 10| Treasury          |
| CREATE Treasury   | 10| Partner Treasury  |
| Agency Ops        | 10| Operations        |
| Creator Grants    | 5 | Grants            |
| Security Reserve  | 5 | Buffer            |

**Sum: 10,000 bps**  
**APR boost cap: 2,000 bps (20%)**

Always validate these after deploy.

## 🧪 MANDATORY TESTS

Run:
```bash
forge test -vv
```

Must include and pass:
- `VoidHookRouterV4.t.sol` → fee routing = 10000 bps
- `xVOIDVault.t.sol` → APR boost ≤ 20%
- `MissionRegistry.t.sol` → no duplicate claims
- `EscrowVault.t.sol` → proper milestone flow

**Abort deployment if any fail.**

## 🚀 DEPLOYMENT FLOW

### Testnet (Base Sepolia):
```bash
forge script script/DeployProduction.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast
```
→ Save results in `deployments/baseSepolia.json`

### Mainnet (Base):
1. Ensure all multisig addresses and RPCs set.
2. Confirm tests pass.
3. Verify invariants: fee = 10000 bps, APR ≤ 2000 bps.
4. Deploy:
```bash
forge script script/DeployProduction.s.sol \
  --rpc-url $BASE_MAINNET_RPC_URL \
  --broadcast \
  --verify
```
→ Save to `deployments/baseMainnet.json`

## 🧩 PHASES

**Phase 1 – Mainnet Launch:**  
Tokens, Vaults, Router, Oracle, MissionRegistry, EscrowVault.

**Phase 2 – Post-Launch:**  
Cosmetics, TokenExpansionOracle, Uniswap V4 Hooks, AI Mission Automation.  
→ Skip these until Phase 1 is stable.

## ⚠️ SAFETY RULES

- Never modify the fee split or APR cap without explicit human approval.
- Never deploy to mainnet with testnet placeholders.
- Always write deployment logs and verification output.
- Run preflight checks before broadcasting transactions.

## ✅ SUCCESS CRITERIA

Deployment is complete only when:

- ✅ `forge build` and `forge test` both pass.
- ✅ Fee router verified (40/20/10/10/10/5/5).
- ✅ Multisig governance live.
- ✅ JSON deployment logs saved.
- ✅ Basescan verification succeeded.

---

**That's it. This document is the single source of truth for all AI agents working on VOID deployment.**
