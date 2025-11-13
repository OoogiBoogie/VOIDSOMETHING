# VOID – Phase 3 Plan
**Date:** November 2025  
**Network:** Base Sepolia (Testnet → Mainnet prep)  
**Status:** Planning / Implementation Ready  

---

## 🎯 Phase 3 Objectives
Phase 3 extends VOID from "functional testnet world" → "economically complete metaverse."  
Core goals:

| Category | Objective | Outcome |
|-----------|------------|----------|
| **Rewards & Economy** | Implement reward distribution & emissions logic via xVOIDVault + TokenExpansionOracle | Real yield & incentive cycle |
| **Land Economy** | Add parcel yield, taxes, resale listings | Active secondary market |
| **Creator Tools** | Launch Pad for custom ERC20 creator tokens | On-chain creator economy |
| **Governance** | PSX-based proposal & voting UI | Decentralized decision layer |
| **Polish / Social** | Persistent chat, audio pipeline, achievements | Engagement + immersion |

---

## 🧩 Module Breakdown

### 1. Reward Distribution UI + Backend
**Scope:** Connect `xVOIDVault` and `TokenExpansionOracle` to deliver claimable rewards.

**Tasks**
- Implement `claimRewards()` contract call.
- Create `hud/defi/RewardsWindow.tsx`:
  - Shows earned, claimable, total VOID.
  - Displays APR boost from XPOracle.
  - Includes "Claim Rewards" button → on-chain TX.
- Integrate with existing theme and DEFI hub panel.

**Deliverables**
- `RewardsWindow.tsx` (≈ 300 lines)
- Hook `useRewards()` → fetch emission data + claim
- Updated tests `xVOIDVault.t.sol` for reward math

**Success Criteria**
✅ Claimable balance matches expected emissions  
✅ APR boost applied (≤ 20%)  
✅ TX verified on Base Sepolia  

---

### 2. Land Economy V2
**Scope:** Evolve WorldLandTestnet → V2 with yield, tax, and marketplace mechanics.

**Tasks**
- Add yield per district (% of protocol fees).
- Implement parcel tax (decay if unpaid).
- Add listing/resale marketplace:
  - `listParcel(parcelId, price)`
  - `buyListedParcel(parcelId)`
- Create `hud/world/LandMarketWindow.tsx`:
  - Lists active sales.
  - Allows buy/sell with VOID.

**Deliverables**
- `contracts/WorldLandV2.sol`
- `LandMarketWindow.tsx`
- Hooks: `useLandMarket()`

**Success Criteria**
✅ Buy/sell round-trip works  
✅ Fee splits route to VoidHookRouterV4  
✅ HUD updates ownership real-time  

---

### 3. Creator Launch Pad
**Scope:** Empower users to mint their own tokens via UI wizard.

**Tasks**
- Deploy `TokenLaunchPadTestnet.sol`
- Build `hud/defi/TokenLaunchWindow.tsx`
  - Inputs: name, symbol, supply.
  - Button: "Launch Token".
  - On success → show deployed address.
- Add "Add to MetaMask" utility.

**Deliverables**
- Contract + UI + ABI integration.

**Success Criteria**
✅ ERC20 deployed & verified  
✅ Event emitted `TokenLaunched(address)`  
✅ Theme coherent with DEFI hub  

---

### 4. Governance / DAO Shell
**Scope:** Introduce PSX-based proposal and voting framework.

**Tasks**
- Deploy `VoidDAO.sol`
  - Functions: `createProposal`, `vote`, `execute`
  - Timelock mechanism
- UI: `hud/dao/GovernanceWindow.tsx`
  - Proposal list, vote buttons, status badges.
- Integrate with PSX token balances.

**Deliverables**
- Governance contract + ABI.
- Full UI panel within DAO hub.

**Success Criteria**
✅ Proposal creation works (PSX holders only)  
✅ Vote counts on-chain  
✅ UI mirrors on-chain state  

---

### 5. Social / Audio / Achievements
**Scope:** Add immersion and community features.

**Tasks**
- **Chat Persistence:** Socket server + DB for messages.
- **Audio Pipeline:** Load UI/world sound effects.
- **Achievements:** Deploy `AchievementRegistry.sol` + Badge NFT logic.
- **HUD:** `hud/social/ChatWindow.tsx`, `hud/profile/Achievements.tsx`.

**Success Criteria**
✅ Messages persist across sessions  
✅ Badges mint correctly after criteria met  
✅ Audio events trigger without lag  

---

## 🗓️ Milestones

| Week | Focus | Deliverables |
|------|--------|--------------|
| **W1–2** | Reward Distribution + Emission audit | `RewardsWindow`, oracle validation |
| **W3–4** | Land Economy V2 prototype | Marketplace contracts + HUD |
| **W5** | Creator Launch Pad | Contract + UI deployment |
| **W6** | Governance Module | DAO contract + interface |
| **W7–8** | Social / Audio / Achievements | Chat server, NFT badges, sound integration |
| **W9** | Integrated QA Cycle | Run VOID-E2E-VALIDATION + new modules |
| **W10** | Mainnet Readiness Checklist | Verify multi-sig addresses + deploy script |

---

## ⚙️ Dependencies
- Foundry / Forge toolchain for solidity tests.  
- React + Three.js frontend.  
- Base Sepolia RPC for testnet.  
- Node 18+ for cast helpers + socket server.  

---

## 🧾 QA Plan
Each new module extends the existing VOID-E2E-VALIDATION matrix:

| Module | New Test Flows | Tools |
|---------|----------------|-------|
| Rewards | Claim → Verify → Balance Update | `cast`, Basescan |
| Land V2 | List → Buy → Ownership Refresh | HUD + contract call |
| Launch Pad | Deploy → MetaMask → Transfer | UI + contract event |
| DAO | Create → Vote → Execute | `cast`, UI snapshot |
| Social | Send → Persist → Reload | Socket logs |

---

## 🧠 Notes for AI Builders
When you hand this to an autonomous agent:

> "Read **PHASE-3-PLAN.md** and implement each section in order.  
> Respect existing contracts on Base Sepolia.  
> Do not alter fee splits or theme constants.  
> Focus on Reward Distribution and Land Economy first."

---

## 🔒 Success Criteria for Phase 3 Sign-off
✅ Rewards system live on Base Sepolia  
✅ Land marketplace transactions verified  
✅ Creator Launch Pad deploys ERC20 successfully  
✅ Governance UI + on-chain state in sync  
✅ Social / audio layer stable across sessions  
✅ All tests passing in VOID-E2E-VALIDATION suite  

---

*Prepared for Phase 3 execution — VOID Protocol Core Team / Rigoberto Felix Lead Coordinator*
