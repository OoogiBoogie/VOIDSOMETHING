# PSX VOID - Multisig Map

**Network:** Base Sepolia (testnet) / Base Mainnet (production)  
**Status:** Testnet deployment complete, mainnet addresses TBD  
**Last Updated:** November 11, 2025

---

## Core Protocol Roles

### Owner (Admin)
**Responsibilities:** Protocol upgrades, fee adjustments, emergency pause  
**Testnet:** `0x0000000000000000000000000000000000000000` (EOA - REPLACE)  
**Mainnet:** `TBD` (Multisig 3/5)

### Fee Manager
**Responsibilities:** Adjust protocol fee parameters (within bounds)  
**Testnet:** `0x0000000000000000000000000000000000000000` (REPLACE)  
**Mainnet:** `TBD` (Multisig 2/3)

### Treasury
**Responsibilities:** Collect protocol fees, manage reserves  
**Testnet:** `0x687E678aB2152d9e0952d42B0F872604533D25a9` (VoidHookRouterV4)  
**Mainnet:** `TBD` (Multisig 4/7 + Timelock)

---

## Land System Roles

### Land Admin
**Responsibilities:** District configuration, parcel minting, metadata updates  
**Testnet:** `0x0000000000000000000000000000000000000000` (REPLACE)  
**Mainnet:** `TBD` (Multisig 3/5)

### District Manager (DeFi)
**Responsibilities:** DeFi district parcel management  
**Testnet:** `0x0000000000000000000000000000000000000000` (REPLACE)  
**Mainnet:** `TBD`

### District Manager (Creator)
**Responsibilities:** Creator district parcel management  
**Testnet:** `0x0000000000000000000000000000000000000000` (REPLACE)  
**Mainnet:** `TBD`

### District Manager (DAO)
**Responsibilities:** DAO district parcel management  
**Testnet:** `0x0000000000000000000000000000000000000000` (REPLACE)  
**Mainnet:** `TBD`

### District Manager (AI)
**Responsibilities:** AI district parcel management  
**Testnet:** `0x0000000000000000000000000000000000000000` (REPLACE)  
**Mainnet:** `TBD`

---

## Staking & XP Roles

### XP Oracle Admin
**Responsibilities:** Update XP boost multipliers, manage XP accrual  
**Testnet:** `0x0000000000000000000000000000000000000000` (REPLACE)  
**Mainnet:** `TBD` (Multisig 2/3)

### Vault Manager
**Responsibilities:** Adjust staking parameters (APR caps, lock periods)  
**Testnet:** `0x0000000000000000000000000000000000000000` (REPLACE)  
**Mainnet:** `TBD` (Multisig 3/5)

---

## Swap & Liquidity Roles

### Swap Admin
**Responsibilities:** Update swap fee tiers, manage liquidity incentives  
**Testnet:** `0x0000000000000000000000000000000000000000` (REPLACE)  
**Mainnet:** `TBD` (Multisig 2/3)

### Router Admin
**Responsibilities:** Fee routing configuration, whitelist management  
**Testnet:** `0x0000000000000000000000000000000000000000` (REPLACE)  
**Mainnet:** `TBD` (Multisig 3/5)

---

## Emergency Roles

### Pause Guardian
**Responsibilities:** Emergency pause for all protocol functions  
**Testnet:** `0x0000000000000000000000000000000000000000` (REPLACE)  
**Mainnet:** `TBD` (Multisig 2/5 with fast execution)

### Recovery Admin
**Responsibilities:** Recover stuck funds, emergency migrations  
**Testnet:** `0x0000000000000000000000000000000000000000` (REPLACE)  
**Mainnet:** `TBD` (Multisig 4/7 + 7-day timelock)

---

## Contract Addresses (Base Sepolia)

| Contract | Address | Role |
|----------|---------|------|
| VOID Token | `0x8de4043445939B0D0Cc7d6c752057707279D9893` | ERC20 |
| USDC Token | `0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9` | ERC20 |
| xVOIDVault | `0xab10B2B5E1b07447409BCa889d14F046bEFd8192` | Staking |
| XPOracle | `0x8D786454ca2e252cb905f597214dD78C89E3Ba14` | XP/APR |
| VoidSwapTestnet | `0x74bD32c493C9be6237733507b00592e6AB231e4F` | Swap |
| VoidHookRouterV4 | `0x687E678aB2152d9e0952d42B0F872604533D25a9` | Fee Router |
| WorldLandTestnet | `0xC4559144b784A8991924b1389a726d68C910A206` | Land NFT |

---

## Mainnet Addresses (TBD)

**Status:** Awaiting final security audits and governance setup.

**Multisig Provider:** Safe (Gnosis Safe)  
**Timelock Duration:** 7 days (production upgrades), 2 days (parameter changes)

---

## Access Control Matrix

| Role | Owner | FeeManager | Treasury | LandAdmin | XPOracle | Vault | Pause |
|------|-------|------------|----------|-----------|----------|-------|-------|
| Upgrade contracts | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Adjust fees (±50%) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Withdraw treasury | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mint parcels | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Update XP boost | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Change APR caps | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Emergency pause | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Setup Instructions (Mainnet Prep)

### 1. Create Multisigs
```bash
# Use Safe (Gnosis Safe) UI
# https://app.safe.global/new-safe

# Recommended signers: 5-7 core team members
# Threshold: 3/5 for most ops, 4/7 for critical ops
```

### 2. Transfer Ownership
```bash
# Example: Transfer VOID token ownership
cast send $VOID_TOKEN "transferOwnership(address)" $MULTISIG_OWNER \
  --rpc-url $MAINNET_RPC \
  --private-key $DEPLOYER_KEY

# Repeat for all contracts
```

### 3. Configure Timelock
```bash
# Deploy Timelock contract
forge create Timelock \
  --rpc-url $MAINNET_RPC \
  --private-key $DEPLOYER_KEY \
  --constructor-args $MIN_DELAY $MULTISIG_OWNER

# Set Timelock as owner for critical contracts
```

### 4. Verify All Roles
```bash
# Check each contract's owner/admin
cast call $CONTRACT "owner()(address)" --rpc-url $MAINNET_RPC

# Expected: All should point to multisig addresses
```

---

## HUD Integration

**Status:** Read-only display in Settings tab  
**Location:** `hud/tabs/SettingsTab.tsx`

**Features:**
- Display all multisig addresses
- Show signer count + threshold
- Link to Safe UI for each multisig
- Show last transaction timestamp
- Emergency contact info

**Implementation:**
```typescript
import { MULTISIG_MAP } from '@/lib/multisigs';

// Display in Settings > Security section
<div>
  <h3>Protocol Multisigs</h3>
  {MULTISIG_MAP.map(sig => (
    <div key={sig.name}>
      <span>{sig.name}: </span>
      <a href={`https://app.safe.global/base:${sig.address}`}>
        {sig.address}
      </a>
      <span> ({sig.threshold}/{sig.signers})</span>
    </div>
  ))}
</div>
```

---

## Emergency Procedures

### Scenario: Critical Vulnerability Found

1. **Pause Guardian** executes emergency pause (2/5 multisig, <30min)
2. **Owner** coordinates with security team
3. **Recovery Admin** prepares migration plan (if needed)
4. **Treasury** secures protocol funds
5. Public disclosure after fix deployed

### Scenario: RPC Outage

1. **No multisig action required** (client-side fallback)
2. Users automatically switch to backup RPC
3. Monitor dashboard for service restoration

### Scenario: Fee Parameter Adjustment

1. **Fee Manager** proposes new fee tier
2. **Owner** reviews + approves (3/5 multisig)
3. Execute via Timelock (2-day delay)
4. Announce in Discord/Twitter before execution

---

**Note:** All testnet addresses are placeholders. Replace with real multisig addresses before mainnet deployment.
