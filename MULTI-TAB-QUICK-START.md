# PSX VOID Multi-Tab System — Quick Start

## What Was Built

✅ **MultiTabWindow** - 10-tab interface for complete economic system  
✅ **WalletTab** - VOID/xVOID staking with real contract integration  
✅ **SwapTab** - VOID ⇄ USDC exchange interface  
✅ **LandTab** - Land ownership & district economy  
🚧 **7 More Tabs** - Coming soon (Creator, DAO, AI, Missions, Analytics, Inventory, Settings)

---

## How to Use

### Open Multi-Tab Window

```typescript
// From any component with access to onOpenWindow:
onOpenWindow('MULTI_TAB', { defaultTab: 'wallet' });

// Available tabs:
'wallet' | 'swap' | 'land' | 'creator' | 'dao' | 'ai' | 
'missions' | 'analytics' | 'inventory' | 'settings'
```

### Test It Now

Add this button to `StartScreen.tsx` or `PlayerChipV2.tsx`:

```typescript
<button
  onClick={() => onOpenWindow('MULTI_TAB', { defaultTab: 'wallet' })}
  className="px-4 py-2 bg-void-purple/20 border border-void-purple rounded text-void-purple"
>
  Open Multi-Tab
</button>
```

---

## Features by Tab

### 💼 WALLET TAB
- ✅ Live VOID balance (contract)
- ✅ Live xVOID staked (contract)
- ✅ Claimable rewards (contract)
- ✅ Approve/Stake/Unstake/Claim actions
- ✅ XP level + progress bar
- ✅ Recent transaction links (Basescan)

### 💱 SWAP TAB
- ✅ VOID ⇄ USDC exchange
- ✅ Real-time quote calculation
- ✅ Fee breakdown (0.3%)
- ✅ Flip animation
- ✅ Route display
- ✅ Market insights

### 🌍 LAND TAB
- ✅ Current parcel info (x, z, ID)
- ✅ District assignment
- ✅ Economy metrics (tax, rent, bonuses)
- ✅ District ownership heatmap
- ✅ Top holders leaderboard
- ✅ Transfer/List actions

---

## Contract Integration

### Active Contracts (Base Sepolia)
```typescript
VOID: '0x8de4043445939B0D0Cc7d6c752057707279D9893'
xVOIDVault: '0xab10B2B5E1b07447409BCa889d14F046bEFd8192'
VoidSwapTestnet: '0x2F05...F9Fc' (placeholder)
WorldLandTestnet: '0x06b9...5d4d' (placeholder)
```

### Wallet Tab Calls
```typescript
// Read
VOID.balanceOf(address)           → Live balance
xVOIDVault.balanceOf(address)     → Staked amount
xVOIDVault.earned(address)        → Claimable rewards
VOID.allowance(owner, spender)    → Approval status

// Write
VOID.approve(vault, MAX_UINT)     → Enable staking
xVOIDVault.stake(amount)          → Stake VOID
xVOIDVault.withdraw(amount)       → Unstake xVOID
xVOIDVault.getReward()            → Claim rewards
```

---

## Mock Data (Fallback)

When wallet not connected, shows realistic mock data:

**Balances**:
- VOID: 10,492.30
- xVOID: 4,500.00
- USDC: 2,341.11

**Staking**:
- Claimable: 43.2 VOID
- APR: 12.5% + 1.8% XP Boost
- Next Claim: ~3h 12m

**XP System**:
- Level: 12 (Adept)
- Progress: 78%
- Daily Bonus: +0.2% yield

**Land**:
- Parcels Owned: 12
- Current: (20, 15) in DeFi District
- Tax: 0.2 VOID/hr
- Rent: +0.5 VOID/hr

**Economy**:
- VOID Price: 0.297 USDC
- Liquidity: 1.2M VOID / 400K USDC
- 24h Volume: 78.4K VOID

---

## Testing Steps

1. **Start server**: `npm run dev`

2. **Add test button** (temp):
   ```typescript
   // In StartScreen.tsx or PlayerChipV2.tsx:
   <button onClick={() => onOpenWindow('MULTI_TAB')}>
     💼 Open Wallet
   </button>
   ```

3. **Test flows**:
   - Click "WALLET" tab → See balances
   - Connect Privy → See real balances
   - Click "Approve VOID" → Approve
   - Enter amount → Click "Stake"
   - Switch to "SWAP" tab → Enter amount
   - Switch to "LAND" tab → See current parcel

4. **Verify**:
   - [ ] Tabs switch smoothly
   - [ ] Wallet shows balances
   - [ ] Swap calculates quote
   - [ ] Land shows district info
   - [ ] Coming soon tabs display
   - [ ] Window closes properly
   - [ ] No console errors

---

## Next Actions

### Immediate
1. Add multi-tab button to HUD dock
2. Test all 3 completed tabs
3. Verify contract calls work

### Phase 3 Complete
1. Build remaining 7 tabs
2. Connect swap to VoidSwapTestnet
3. Connect land to WorldLandTestnet
4. Add XPOracle integration
5. Wire MissionRegistry

---

## File Structure

```
hud/tabs/
├── WalletTab.tsx         ✅ Complete
├── SwapTab.tsx           ✅ Complete
├── LandTab.tsx           ✅ Complete
├── MultiTabWindow.tsx    ✅ Complete
├── CreatorTab.tsx        🚧 Coming soon
├── DAOTab.tsx            🚧 Coming soon
├── AITab.tsx             🚧 Coming soon
├── MissionsTab.tsx       🚧 Coming soon
├── AnalyticsTab.tsx      🚧 Coming soon
├── InventoryTab.tsx      🚧 Coming soon
└── SettingsTab.tsx       🚧 Coming soon
```

---

## Troubleshooting

**Window doesn't open**:
- Check `onOpenWindow` is passed as prop
- Verify `MULTI_TAB` in windowTypes.ts
- Check VoidHudApp imports MultiTabWindow

**Balances show 0**:
- Normal when wallet not connected (shows mock data instead)
- Connect Privy to see real balances
- Check contract addresses match Base Sepolia

**Approve button doesn't show**:
- Need to connect wallet first
- Check VOID allowance for xVOIDVault
- Try refreshing page

**Transaction stuck**:
- Check Basescan link in recent transactions
- Wallet may need confirmation
- Check gas settings

---

**Ready to test! Open the multi-tab window and explore the economic system.**

For full documentation, see: `MULTI-TAB-IMPLEMENTATION-COMPLETE.md`
