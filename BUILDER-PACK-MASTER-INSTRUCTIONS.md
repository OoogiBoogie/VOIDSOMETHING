# PSX VOID – Builder Pack (Phase 3 Master Instructions)

This document is for **AI builders and developers** working on the PSX VOID metaverse.

It describes:

- The **current testnet state**
- **What already exists** (do not rebuild)
- **What to build next** (Phase 3)
- **Non-negotiable economic + safety rules**
- **Commands** to run for validation

---

## 0. Environment & Theme

- **Chain:** Base Sepolia (testnet)
- **Chain ID:** `84532`
- **RPC URL (example):** `https://sepolia.base.org`
- **UI Stack:** Next.js / React, TypeScript, Tailwind + custom CSS
- **World:** Three.js (or React-Three-Fiber style 3D scene)
- **Theme:** Neon cyber / VOID
  - Primary: **purple / magenta**
  - Accent: **teal / cyan**
  - Dark glass panels, glow, gradients
- **Theme source of truth:** `voidTheme.ts` (CSS variables).  
  **Rule:** No new hard-coded hex colors in HUD or panels; always use theme variables.

---

## 1. On-Chain Contracts (READ-ONLY – DO NOT REDEPLOY)

These are already live on **Base Sepolia** and must be treated as **existing infrastructure**.

### Core Economic & System Contracts

- `VoidHookRouterV4` – fee router  
  `0x687E678aB2152d9e0952d42B0F872604533D25a9`
- `XPOracle` – vXP tracking + APR boost (capped at 20%)  
  `0x8D786454ca2e252cb905f597214dD78C89E3Ba14`
- `MissionRegistry` – missions/quests, vXP rewards  
  `0x7C6BF84fd111A262CCdfEC885ba8677b3F3EE9c7`
- `EscrowVault` – payment escrow / work-for-hire  
  `0x1A9b3fE46A6e2A9669D6d53fB58D562b97071FB7`
- `xVOIDVault` – staking vault for VOID  
  `0xab10B2B5E1b07447409BCa889d14F046bEFd8192`
- `TokenExpansionOracle` – emission / expansion controller  
  `0x2B0CDb539682364e801757437e9fb8624eD50779`

### Test Tokens

- `VOID` – main protocol token  
  `0x8de4043445939B0D0Cc7d6c752057707279D9893`
- `PSX` – governance token  
  `0x9E08A4291771d18ce9718A3Ce8adE6DC82113CC7`
- `CREATE` – creator/brand token  
  `0x99908B6127f45A0D4730a42DE8b4b74D313F956D`
- `SIGNAL` – reputation / signal token  
  `0x29c4172C243860f906C9625c983aE93F1147504B`
- `AGENCY` – agency / ops token  
  `0xb270007B1D6EBbeF505612D8b3C779A536A7227b`
- `USDC (test)` – 6-decimal stablecoin  
  `0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9`
- `WETH (test)` – wrapped ETH  
  `0x14553932F4f3de19d47B716875804e84e8AE4311`

### World & DeFi Testnet Additions

- `WorldLandTestnet` – land / parcel NFT system  
  `0xC4559144b784A8991924b1389a726d68C910A206`
- `VoidSwapTestnet` – AMM swap contract (VOID/USDC, fees to router)  
  `0x74bD32c493C9be6237733507b00592e6AB231e4F`

**Do not redeploy or replace these contracts.**  
Use them from the front-end via hooks/ABIs.

---

## 2. Existing Frontend & World Integration (TREATED AS DONE)

These components and utilities **already exist** (or should be assumed to exist) and are **stable foundations**.

Do not rebuild them; you may extend or integrate with them.

### 2.1 Coordinate & Event Systems

- `world/WorldCoords.ts`
  - `worldToParcel(pos)` – world (x, z) → parcel info `{ parcelId, gx, gz }`
  - `parcelToWorldCenter(parcelId)` – parcel ID → world center position
  - 40×40 grid, WORLD_SIZE ≈ 2000 units, quadrant/district logic.

- `services/events/worldEvents.ts`
  - Typed event bus for:
    - `PLAYER_MOVED`
    - `PARCEL_ENTERED`
    - `PARCEL_EXITED`
    - `HUB_CHANGED`
  - Exports:
    - `subscribeWorldEvents(listener)`
    - `publishWorldEvent(event)`
    - Optional React-style hook (`useWorldEvent`) if implemented.

- `player-character-3d.tsx` (or similar)
  - Calls `worldToParcel` and `publishWorldEvent` on movement.
  - Tracks `lastParcelId` to fire enter/exit events precisely.

### 2.2 HUD Windows

- `hud/world/LandGridWindow.tsx`
  - Renders **40×40 land grid**.
  - Uses `useParcels()` / `useWorldLand()` hook(s).
  - Highlights:
    - Current player parcel
    - Owned vs unowned parcels
    - District coloring.

- `hud/defi/SwapWindow.tsx`
  - VOID ↔ USDC swap UI.
  - Uses `useSwap().fetchQuote()` and `useSwap().swap()`.
  - Shows fee (0.3%), price impact, slippage, pending state.

- `hud/world/WorldMapOverlay.tsx`
  - Full-screen overlay map.
  - Shows all parcels + player position (pulsing dot).
  - ESC/M key to close/open.
  - District legend.

### 2.3 Validation Scripts (Assumed)

- `npm run validate:coords` – validates world ↔ grid ↔ parcel mapping (edge cases, round trip).
- Possibly helper PowerShell scripts in `scripts/cast/` for on-chain checks.

---

## 3. Non-Negotiable Rules (DO NOT BREAK)

These rules are **hard constraints**. Builder AIs and devs must not violate them.

1. **Fee Split Is Locked**

   - `VoidHookRouterV4` fee shares **must remain**:
     - Creators: **40%**
     - xVOID Stakers: **20%**
     - PSX Treasury: **10%**
     - CREATE Treasury: **10%**
     - Agency: **10%**
     - Grants vault: **5%**
     - Security reserve: **5%**
   - Their sum must **always** equal `10000` BPS in any simulation or display.
   - Do NOT change this logic on-chain or in code.

2. **APR Boost Cap**

   - `XPOracle` APR boost must be capped at **2000 BPS (20%)**.
   - Any UI that shows APR must:
     - Show base APR + boost, but never > base + 20%.
   - Do not change this cap.

3. **Network Safety**

   - Operate on **Base Sepolia** only unless explicitly told otherwise.
   - Do not auto-deploy to Base mainnet.
   - Any deploy script must require explicit confirmation flags.

4. **Theme Integrity**

   - Use **theme variables** from `voidTheme.ts` or global CSS variables.
   - No new literal colors like `#8f3bff` inline in JSX.
   - Keep neon/cyber aesthetic consistent with existing HUD.

5. **Cosmetics & Personal Data**

   - Cosmetics / avatar styling remain **separate** from protocol economics unless explicitly unlock conditions are met.
   - Do not introduce **real-world personal data** or names into contracts or logs.

---

## 4. Phase 3 – What Needs to Be Built

Phase 3 focuses on **playable economics and creator systems**, not redoing what's already in place.

### Module 1 – Staking Rewards & Emissions (DeFi Core)

Goal: Turn xVOIDVault into a **real reward engine** driven by emissions + vXP/APR.

Tasks:

1. **Vault Reward Logic**
   - Implement reward accrual in `xVOIDVault` if not already present.
   - Rewards token: use `VOID` (testnet version).
   - Core flows:
     - `stake(amount)`
     - `unstake(amount)`
     - `claimRewards()`
   - Emission rate should respect limits from `TokenExpansionOracle`.

2. **APR + Emissions UI**
   - Extend `HUD` with:
     - Current base APR
     - vXP boost %
     - Effective APR
     - Estimated daily/weekly rewards.
   - Integrate with `SwapWindow` + `Land` if needed for display.

3. **Validation**
   - Foundry tests:
     - Rewards accrue over time.
     - Boost never exceeds cap.
     - No reward inflation beyond configured emission bounds.

---

### Module 2 – Land Economy v2 (Market, Not Just Purchase)

Goal: Evolve land from "you can buy a parcel" into a **simple market**.

Tasks:

1. **On-Chain Land Market (Optional/Upgradeable)**
   - If not already present, introduce `LandMarketTestnet` (or similar) with:
     - List parcel for sale: price in USDC or VOID.
     - Cancel listing.
     - Buy listed parcel.
   - Only **owner** can list.
   - Ownership remains in `WorldLandTestnet`.

2. **HUD Integration**
   - New window: `hud/world/LandMarketWindow.tsx`
     - Tabs:
       - **My Parcels** – show owned parcels + "List for X token".
       - **For Sale** – all active listings.
     - Use the 40×40 grid as an entry point:
       - Clicking on a parcel shows buy/list info.
   - Respect theme.

3. **Validation**
   - Scripted flows:
     - List → Buy → Ownership transfer.
     - Cancel → listing removed.
   - On-chain verification using cast or PowerShell helpers.

---

### Module 3 – Creator Tools & Token Launchpad

Goal: Give creators a **way to launch simple tokens** and link them into VOID.

Tasks:

1. **Token Launchpad Contract (Testnet)**
   - `TokenLaunchPadTestnet.sol` (factory for simple ERC20s).
   - Functions:
     - `launchSimpleToken(name, symbol, initialSupply)` – mints full supply to creator.
   - Emit events to index later.

2. **HUD Window**
   - `hud/defi/TokenLaunchWindow.tsx`:
     - Form: name, symbol, initial supply.
     - Display deployed address on success.
     - Button to add to MetaMask (wallet_addEthereumChain / wallet_watchAsset).

3. **Economic Constraints**
   - Charge a small **launch fee** (in VOID or USDC) that routes through `VoidHookRouterV4` so it respects the 40/20/10/10/10/5/5 split.
   - Do not implement complex bonding curves here; keep it simple.

---

### Module 4 – Governance Shell

Goal: Implement a basic **DAO shell** on testnet for PSX-style voting.

Tasks:

1. **DAO Contract**
   - `VoidDAOTestnet.sol` or similar.
   - Base features:
     - Create proposal (text + on-chain action payload placeholder).
     - Vote with PSX or staked VOID power.
     - Close proposal after a period.
   - No need for full timelocked execution initially; can be "off-chain advisory + logged".

2. **HUD Window**
   - `hud/governance/GovernanceWindow.tsx`:
     - Proposal list.
     - Details view with vote breakdown.
     - Buttons to vote for/against/abstain.

3. **Link to Economics**
   - DAO can vote on:
     - Emission rate configs.
     - Treasury spend proposals (off-chain execution but logged on-chain).

---

### Module 5 – Social & Presence (Lightweight)

Goal: Minimum viable "you are not alone" feeling.

Tasks:

1. **Presence Service (Backend or Mock)**
   - Simple WebSocket or polling service to broadcast:
     - Player position (coarse).
     - Current hub (WORLD/DEFI/CREATOR/DAO).
   - For builder AIs, assume a service file like `services/social/presenceClient.ts`.

2. **HUD Social Rail**
   - Friend list + party placeholder UI.
   - Show "online" indicator for test identities.

3. **Future-Ready**
   - Do not store personal data.
   - Keep everything mockable in dev.

---

## 5. Testing & Validation Commands

These commands are safe to assume (or should be created if missing).

### Coordinate Validator

```bash
npm run validate:coords
```

- Confirms world ↔ grid ↔ parcel mapping.
- Edge cases: corners, boundaries, round trip.

### Economic Invariants (Foundry)

```bash
forge test --match-contract EconomicInvariantsTest -vv
```

- Confirms:
  - Fee split = 40/20/10/10/10/5/5.
  - APR boost cap = 20%.
  - Emission bounds respected.

### Dev Server (HUD + World)

```bash
npm run dev
```

- Should launch HUD + 3D world at http://localhost:3000.

### Optional Cast Examples (Base Sepolia)

```bash
# Check owned parcels
cast call 0xC4559144b784A8991924b1389a726d68C910A206 \
  "getParcelsOwnedBy(address)(uint256[])" \
  0xYOUR_ADDRESS \
  --rpc-url https://sepolia.base.org

# Check VOID balance of router (fees)
cast call 0x8de4043445939B0D0Cc7d6c752057707279D9893 \
  "balanceOf(address)(uint256)" \
  0x687E678aB2152d9e0952d42B0F872604533D25a9 \
  --rpc-url https://sepolia.base.org
```

---

## 6. How an AI Builder Should Use This

1. **Read this document once.**
2. **Do NOT touch on-chain invariants** (fee split, APR cap).
3. **Focus initial work on:**
   - Staking rewards + emissions (Module 1)
   - Land Economy v2 (Module 2)
   - Creator Launchpad (Module 3)
4. **Use the validation commands above after each major change.**
5. **Keep everything on Base Sepolia unless explicitly instructed otherwise.**

---

**End of Builder Pack Master Instructions**  
_Use this as your single source of truth for PSX VOID Phase 3 development._
