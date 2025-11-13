# VOID Metaverse E2E Validation Script

This guide is a hand-off for testers to verify world ↔ HUD sync, land ownership flows, swaps + fees, theme consistency, and full user journeys on Base Sepolia.

Prereqs
- Wallet connected to Base Sepolia (Chain ID 84532)
- Test ETH and VOID/USDC balances
- Dev server running: http://localhost:3000
- Optional: Foundry cast installed for on-chain checks

Contracts (Base Sepolia)
- VoidHookRouterV4: 0x687E678aB2152d9e0952d42B0F872604533D25a9
- VOID (test): 0x8de4043445939B0D0Cc7d6c752057707279D9893
- USDC (test): see TESTING-NOW.md or .env
- WorldLandTestnet: 0xC4559144b784A8991924b1389a726d68C910A206

Key UI components (for debugging)
- MiniMap: hud/world/MiniMap.tsx
- LandGridWindow: hud/world/LandGridWindow.tsx
- WorldMapOverlay: hud/world/WorldMapOverlay.tsx
- WorldCoords (parcel mapping): world/WorldCoords.ts
- SwapWindow: hud/defi/SwapWindow.tsx
- Swap hook: hooks/useSwap.ts
- Land buy hook: hooks/useWorldLand.ts

1) World ↔ HUD Sync Check
Goal: Mini-map, land grid, and map overlay always agree on location and district.

How to test
1. Open client, log in, go to WORLD hub.
2. Walk forward; then walk diagonally to cross parcel edges quickly.
3. Press M to open WorldMapOverlay and compare markers.

Verify while moving
- Mini-map: active dot moves smoothly as you cross parcel boundaries.
- LandGridWindow: current parcel has glow/outline.
- WorldMapOverlay: player marker is on the same cell highlighted in LandGridWindow.
- No teleporting/off-by-one when crossing edges; highlight is exactly one tile where you are.
- District label in HUD (DEFI/CREATOR/DAO/AI) matches overlay color/region at each quadrant.

If desync happens
- Suspect world/WorldCoords.ts: worldToParcel, parcelIdToCoords, getDistrict.
- Or the move event timing: services/events/worldEvents.ts (PLAYER_MOVED, PARCEL_ENTERED) publishers/consumers; check where onPlayerMove is dispatched.

Pass criteria
- All three views agree for straight and diagonal motion; district boundaries always match; no off-by-one at edges (0 and 39).

2) Land Ownership Flow (End-to-End)
Goal: HUD Buy → WorldLandTestnet → HUD refresh remains consistent.

A. Find an unowned parcel
- Open LandGridWindow.
- Look for faint-purple available cell.
- Stand avatar in that cell (or click to select).
Expect details panel:
- Owner: None
- Status: Available

B. Buy parcel via HUD
- Click Buy Parcel.
- If allowance is 0, an Approve VOID step appears; after confirmation, button changes to Buy Parcel.
- Confirm transaction calls WorldLandTestnet.buyParcel(parcelId) on Base Sepolia.

C. Verify it really worked
Do all three checks:
- HUD: Same cell renders as “Owned by you” with teal fill. Overlay shows the same ownership style.
- On-chain with cast:
  powershell
  cast call 0xC4559144b784A8991924b1389a726d68C910A206 "getParcelsOwnedBy(address)(uint256[])" <YOUR_ADDRESS> --rpc-url https://sepolia.base.org

  Returned array includes the parcelId you bought.
- Hard refresh the dapp; LandGridWindow should persist ownership (no lost state).

D. Negative cases
- Try to buy the same parcel again: HUD blocks with disabled button or a clear error.
- Try buying with not enough VOID: clean “insufficient balance” state before sending a tx.

Notes for debugging
- hooks/useWorldLand.ts: approve + buy flow
- services/world/useParcels.ts: available/owned states and refetch

Pass criteria
- Successful buy, ownership persists across refresh, negatives handled gracefully.

3) Swap Flow (VOID ⇄ USDC) + Fee Routing
Goal: Verify swap UX and that a 0.3% fee accrues to the router address over time.

A. Prepare balances
- Ensure your address has VOID and USDC (mint via token contracts if needed).
- Open DEFI hub → SwapWindow.
- You should see token selectors, amount input, quote area.

B. Quote behavior
- Select VOID → USDC.
- Type 100 VOID.
Expect
- fetchQuote() runs and shows estimated USDC out.
- Fee info notes 0.3% protocol fee; if slippage guard is implemented, minOut is visible.

C. Execute swap
- If allowance < amount: Approve VOID first; then Swap.
- After swap: VOID decreases, USDC increases; success message with Basescan link (optional).

D. Verify fee went to router (aggregate view)
- If fee is tracked in VOID or USDC, query router/fee sink address balance over multiple swaps.
  powershell
  cast call 0x8de4043445939B0D0Cc7d6c752057707279D9893 "balanceOf(address)(uint256)" 0x687E678aB2152d9e0952d42B0F872604533D25a9 --rpc-url https://sepolia.base.org

- Expect non-zero and roughly 0.3% of traded volume accrued over many swaps, depending on implementation.
- Later, call distributeFees() if exposed to validate split (40/20/10/10/10/5/5).

Pass criteria
- Quotes return; swap executes with allowance flow; balances update; router accrues fees over time.

4) Theme Consistency Pass
Goal: Neon HUD theme is coherent across hubs and windows.

Walk hubs: WORLD, DEFI, CREATOR, DAO, AI OPS.
Check visually
- No raw hexes: colors come from CSS vars/theme tokens.
- New components (LandGridWindow, SwapWindow, WorldMapOverlay) share panel radius, border, blur, glow.
- Buttons in SwapWindow match other action buttons.
- Map overlay chrome matches HUD chrome.

If a screen looks like a different app, replace inline styles with theme vars (`ui/theme/voidTheme`).

Pass criteria
- Consistent theme across all hubs and windows; no off-brand colors.

5) Logical Paths for Metaverse Testing
Use these three flows when demoing or simulating journeys.

Path A – “DeFi Runner”
- Spawn in WORLD → check DEFI missions (if wired) → DEFI hub → SwapWindow swap VOID↔USDC → Stake VOID (xVOIDVault) and see emissions panel react → watch mini-map and emissions HUD while walking back into WORLD.

Path B – “Land Baron”
- Spawn → open WorldMapOverlay → scan districts → walk there with map following → use LandGridWindow to inspect, buy, and verify ownership in HUD + on-chain.

Path C – “Quest Grinder”
- Create a mission via Mission UI or CLI → complete it to earn vXP (XPOracle) → open DEFI hub to see APR boost → stake VOID and confirm boost → swap tokens to simulate protocol usage.

Appendix: Useful scripts (Windows PowerShell)
- scripts/cast/Get-ParcelsOwnedBy.ps1 -Address <YOUR_ADDRESS>
- scripts/cast/Get-TokenBalance.ps1 -Token 0xTOKEN -Holder 0xHOLDER
- npm run validate:coords (validates worldToParcel edge cases)

Troubleshooting quick hits
- Desync: check world/WorldCoords.ts and event timing in services/events/worldEvents.ts
- Land buy UX: hooks/useWorldLand.ts and services/world/useParcels.ts
- Swap UX: hooks/useSwap.ts and hud/defi/SwapWindow.tsx; verify .env addresses
- Theme: ui/theme/voidTheme and remove inline hard-coded colors
