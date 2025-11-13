# PSX VOID – AI Execution Protocol
**Date:** November 2025  
**Scope:** Phase 3 autonomous development and QA operations  
**Applies To:** All AI and human-assisted agents executing within the PSX VOID ecosystem  

---

## 🧭 1. Purpose
This protocol defines how AI builders and contributors execute, verify, and govern the PSX VOID metaverse.  
It merges the functions of:  
- Phase-3 Build Plan  
- Tracker and QA Validation Suite  
- Project Governance and Permissions  

---

## 🏗️ 2. System Architecture Overview
**Network:** Base Sepolia (Testnet → Mainnet readiness)  

**Core Contracts (Immutable)**
| Contract | Address |
|-----------|----------|
| WorldLandTestnet | 0xC4559144b784A8991924b1389a726d68C910A206 |
| VoidSwapTestnet  | 0x74bD32c493C9be6237733507b00592e6AB231e4F |
| VoidHookRouterV4 | 0x687E678aB2152d9e0952d42B0F872604533D25a9 |
| VOID  | 0x8de4043445939B0D0Cc7d6c752057707279D9893 |
| USDC  | 0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9 |

**Immutable Constants**
- Fee split = 40 / 20 / 10 / 10 / 10 / 5 / 5  
- Max APR boost = 20 %  
- Theme: `voidTheme.ts` variables only (no hard-coded hex)

---

## ⚙️ 3. Execution Order
All AI agents follow this strict build sequence:

| Priority | Module | Output |
|-----------|---------|---------|
| 1️⃣ | **Reward Distribution UI** | `hud/defi/RewardsWindow.tsx`, `useRewards.ts` |
| 2️⃣ | **Land Economy V2** | `WorldLandV2.sol`, `LandMarketWindow.tsx` |
| 3️⃣ | **Creator Launch Pad** | `TokenLaunchPadTestnet.sol`, `TokenLaunchWindow.tsx` |
| 4️⃣ | **Governance Module** | `VoidDAO.sol`, `GovernanceWindow.tsx` |
| 5️⃣ | **Social / Audio / Achievements** | Chat server, audio assets, `AchievementRegistry.sol` |

Each module → commit → validate → record in Tracker.

---

## 🧑‍💻 4. AI Permission Tiers
| Tier | Role | Capabilities |
|------|------|--------------|
| **Core-AI (PSX Lead)** | Merge approvals, deploy mainnet, finalize audits | Full access |
| **Dev-AI** | Write UI / Solidity code, run local tests, propose PRs | Write + Test |
| **QA-AI** | Execute validators, update tracker, verify E2E | Read + Report |

---

## 🧩 5. Operational Workflow

### 1. Initialize
```bash
git pull origin main
npm install
npm run validate:coords
```

### 2. Implement
Follow module from Section 3; use existing contracts only.

### 3. Validate
```bash
npm run validate:coords
./scripts/cast/Get-ParcelsOwnedBy.ps1 -Address 0xYOUR_ADDRESS
./scripts/cast/Get-TokenBalance.ps1 -Token 0xVOID -Holder 0xROUTER
```

### 4. QA Flow
Execute `VOID-E2E-VALIDATION.md` flows 1-5; update `PHASE-3-TRACKER.md`.

### 5. Approval Gate
All tests ✅ → tag commit `phase3-<module>`.

---

## 🧪 6. Validation Matrix
| Check | Command / Action | Expected Result |
|-------|-----------------|-----------------|
| Coordinate System | `npm run validate:coords` | All edge cases PASS |
| Land Buy Flow | HUD buy → cast verify | Parcel owner updated |
| Swap Flow | VOID ⇄ USDC → fee check | 0.3% fee to Router |
| Rewards Claim | Claim TX → balance verify | VOID credited ≤ 20% cap |
| Governance | Create / Vote / Execute | Events emit + state sync |
| Theme Audit | Visual inspection | Only CSS vars used |

---

## 🔒 7. Safety & Compliance

**Immutable Enforcement:** Never modify fee splits, APR caps, or theme constants.

**Testnet First:** All new deployments on Base Sepolia until audit PASS.

**No Key Exposure:** Private keys via `.env` only.

**Code Review:** ESLint + Solhint + Prettier pre-merge checks.

**Audit Trail:** All merges reference validation hash in `VOID-E2E-VALIDATION.md`.

---

## 📊 8. Embedded Progress Tracker
| Module | Dev Status | QA Status | Notes |
|--------|-----------|-----------|-------|
| Rewards System | ☐ | ☐ | |
| Land Economy V2 | ☐ | ☐ | |
| Creator Launch Pad | ☐ | ☐ | |
| Governance Shell | ☐ | ☐ | |
| Social / Audio / Achievements | ☐ | ☐ | |

---

## ⚡ 9. Automation Hooks

Upon module completion:
1. Auto-run validators
2. Append QA summary → `PHASE-3-TRACKER.md`
3. Send update to PSX Dev Logs (Webhook ready)

---

## 🏁 10. Mainnet Readiness Checklist
| Category | Requirement |
|----------|-------------|
| Multi-sig wallets | Verified across governance set |
| Emission parameters | Oracle ≤ 20% APR |
| Fee split | 10000 BPS sum intact |
| Frontend sync | All HUD panels responsive |
| Security audit | Static + dynamic PASS |
| Final E2E Run | All 5 flows ✅ |

---

## 💾 11. Deployment Commands
```bash
forge build
make deploy-testnet
forge verify-contract --chain base_sepolia <address> <Contract>
```

---

## 📚 12. Reference Index

- **PHASE-3-PLAN.md** → Architecture & milestones
- **PHASE-3-TRACKER.md** → Task status sheet
- **VOID-E2E-VALIDATION.md** → QA flows
- **TESTING-NOW.md** → Quick commands
- **PHASE-2-VALIDATION-COMPLETE.md** → Historical audit trail

---

## ✅ 13. Phase-3 Completion Criteria

- [ ] All five modules deployed on Base Sepolia
- [ ] 100% validation pass rate
- [ ] No theme violations
- [ ] Mainnet Checklist signed
- [ ] Documentation hash committed to repo

---

**End of Protocol — Authorized for Autonomous Execution**  
*PSX Protocol Core Network*
