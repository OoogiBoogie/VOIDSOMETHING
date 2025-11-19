# SEASONAL BURN SYSTEM - FRONTEND VALIDATION PROCEDURE

**Status:** POST-DEPLOYMENT  
**Network:** Base Sepolia (84532)  
**Validation Phase:** PRE-QA

---

## STEP 1: Browser Console Validation

Open browser console (F12) and run the following commands in sequence:

### 1.1 Import Validation Functions

```javascript
import { 
  areBurnContractsDeployedSeasonal, 
  logSeasonalContractStatus,
  getMissingSeasonalContracts,
  validateSeasonalABIs,
  isSeasonalSystemEnabled,
  SEASONAL_BURN_CONTRACTS
} from '@/config/burnContractsSeasonal';
```

### 1.2 Check Deployment Status

```javascript
// Should return true if all contracts configured
areBurnContractsDeployedSeasonal();
```

**Expected Output:**
```
✅ All 7 seasonal burn contracts are deployed and configured
true
```

**If FALSE:** Run diagnostics (see Step 1.3)

### 1.3 Full Contract Status Log

```javascript
logSeasonalContractStatus();
```

**Expected Output:**
```
═══════════════════════════════════════════════════════════════
SEASONAL BURN SYSTEM - CONTRACT STATUS
═══════════════════════════════════════════════════════════════

Network: Base Sepolia (Chain ID: 84532)
Deployment Block: 33790701
Season 0: ACTIVE (90 days)

✅ VoidBurnUtilitySeasonal
   Address: 0x977087456Dc0f52d28c529216Bab573C2EF293f3
   ABI Functions: [count]
   Verified: Pending

✅ XPRewardSystemSeasonal
   Address: 0x187008E91C7C0C0e8089a68099204A8afa41C90B
   ABI Functions: [count]
   Verified: Pending

✅ DistrictAccessBurnSeasonal
   Address: 0xbBa6f04577aE216A6FF5E536C310194711cE57Ae
   ABI Functions: [count]
   Verified: Pending

✅ LandUpgradeBurnSeasonal
   Address: 0xdA7b1b105835ebaA5e20DB4b8818977618D08716
   ABI Functions: [count]
   Verified: Pending

✅ CreatorToolsBurnSeasonal
   Address: 0x6DCDb3d400afAc09535D7B7A34dAa812e7ccE18a
   ABI Functions: [count]
   Verified: Pending

✅ PrestigeBurnSeasonal
   Address: 0xDd23059f8A33782275487b3AAE72851Cf539111B
   ABI Functions: [count]
   Verified: Pending

✅ MiniAppBurnAccessSeasonal
   Address: 0x6187BE555990D62E519d998001f0dF10a8055fd3
   ABI Functions: [count]
   Verified: Pending

✅ All contracts validated successfully

═══════════════════════════════════════════════════════════════
```

### 1.4 Check for Missing Contracts

```javascript
const missing = getMissingSeasonalContracts();
console.log('Missing contracts:', missing);
```

**Expected Output:**
```
Missing contracts: []
```

**If NOT EMPTY:** Fix the listed contracts before proceeding.

### 1.5 Validate ABIs

```javascript
const abiValidation = validateSeasonalABIs();
console.log('ABI Validation:', abiValidation);
```

**Expected Output:**
```
ABI Validation: { valid: true, errors: [] }
```

**If INVALID:** Check ABI files in `/contracts/abis/`

### 1.6 Check Feature Flag

```javascript
console.log('Seasonal system enabled:', isSeasonalSystemEnabled());
```

**Expected Output:**
```
Seasonal system enabled: true
```

**If FALSE:** Check `.env.local` for `NEXT_PUBLIC_ENABLE_SEASONAL_BURN_UI=true`

### 1.7 Inspect Contract Objects

```javascript
console.table(Object.entries(SEASONAL_BURN_CONTRACTS).map(([name, contract]) => ({
  Name: name,
  Address: contract.address,
  'ABI Size': contract.abi?.length || 0,
  Verified: contract.verified
})));
```

**Expected Output:** Table showing all 7 contracts with addresses and ABI counts.

---

## STEP 2: Hook Validation

### 2.1 Test useSeasonalBurn Hook

```javascript
import { useSeasonalBurn } from '@/hooks/useSeasonalBurn';

// In a React component:
function TestComponent() {
  const {
    currentSeasonId,
    currentSeason,
    userSeasonState,
    userLifetimeState,
    dailyXPCap,
    seasonalXPCap,
    loading,
    contracts
  } = useSeasonalBurn();
  
  console.log('Season ID:', currentSeasonId);
  console.log('Loading:', loading);
  console.log('Contracts:', contracts);
  
  return null;
}
```

**Expected Behavior:**
- `loading` starts as `true`, then becomes `false`
- `currentSeasonId` should be `0` (BigInt)
- `contracts` object contains all 7 addresses
- No console errors about undefined contracts

### 2.2 Test Contract Read Functions

```javascript
import { useContractRead } from 'wagmi';
import { SEASONAL_BURN_CONTRACTS } from '@/config/burnContractsSeasonal';

const { data: seasonId } = useContractRead({
  address: SEASONAL_BURN_CONTRACTS.VoidBurnUtilitySeasonal.address,
  abi: SEASONAL_BURN_CONTRACTS.VoidBurnUtilitySeasonal.abi,
  functionName: 'getCurrentSeasonId',
});

console.log('Current Season ID:', seasonId); // Should be 0n
```

**Expected Output:**
```
Current Season ID: 0n
```

### 2.3 Test Write Function Availability

```javascript
import { useContractWrite } from 'wagmi';

const { write } = useContractWrite({
  address: SEASONAL_BURN_CONTRACTS.DistrictAccessBurnSeasonal.address,
  abi: SEASONAL_BURN_CONTRACTS.DistrictAccessBurnSeasonal.abi,
  functionName: 'unlockDistrict',
});

console.log('Write function available:', typeof write === 'function');
```

**Expected Output:**
```
Write function available: true
```

---

## STEP 3: Network Validation

### 3.1 Check Chain ID

```javascript
import { useNetwork } from 'wagmi';

const { chain } = useNetwork();
console.log('Connected to:', chain?.id);
console.log('Expected: 84532 (Base Sepolia)');
```

**Expected Output:**
```
Connected to: 84532
Expected: 84532 (Base Sepolia)
```

### 3.2 Verify Contract Code Exists

```javascript
import { usePublicClient } from 'wagmi';

const publicClient = usePublicClient();

const code = await publicClient.getBytecode({
  address: '0x977087456Dc0f52d28c529216Bab573C2EF293f3'
});

console.log('Contract has code:', code && code.length > 2);
```

**Expected Output:**
```
Contract has code: true
```

---

## STEP 4: Environment Variable Validation

### 4.1 Check All Seasonal Variables

```javascript
const seasonalEnvVars = {
  VOID_BURN_UTILITY_SEASONAL: process.env.NEXT_PUBLIC_VOID_BURN_UTILITY_SEASONAL,
  XP_REWARD_SYSTEM_SEASONAL: process.env.NEXT_PUBLIC_XP_REWARD_SYSTEM_SEASONAL,
  DISTRICT_ACCESS_BURN_SEASONAL: process.env.NEXT_PUBLIC_DISTRICT_ACCESS_BURN_SEASONAL,
  LAND_UPGRADE_BURN_SEASONAL: process.env.NEXT_PUBLIC_LAND_UPGRADE_BURN_SEASONAL,
  CREATOR_TOOLS_BURN_SEASONAL: process.env.NEXT_PUBLIC_CREATOR_TOOLS_BURN_SEASONAL,
  PRESTIGE_BURN_SEASONAL: process.env.NEXT_PUBLIC_PRESTIGE_BURN_SEASONAL,
  MINIAPP_BURN_ACCESS_SEASONAL: process.env.NEXT_PUBLIC_MINIAPP_BURN_ACCESS_SEASONAL,
  ENABLE_SEASONAL_BURN_UI: process.env.NEXT_PUBLIC_ENABLE_SEASONAL_BURN_UI,
  CURRENT_SEASON_ID: process.env.NEXT_PUBLIC_CURRENT_SEASON_ID,
};

console.table(seasonalEnvVars);
```

**Expected Output:** Table with all 9 environment variables populated.

---

## STEP 5: React DevTools Validation

### 5.1 Check Hook State in DevTools

1. Open React DevTools
2. Find component using `useSeasonalBurn`
3. Inspect hooks state
4. Verify:
   - `currentSeasonId`: 0n
   - `loading`: false
   - `currentSeason`: Object with config
   - `userSeasonState`: null or Object
   - `contracts`: Object with 7 addresses

---

## VALIDATION CHECKLIST

Run through this checklist and mark each item:

- [ ] `areBurnContractsDeployedSeasonal()` returns `true`
- [ ] `logSeasonalContractStatus()` shows all ✅
- [ ] `getMissingSeasonalContracts()` returns `[]`
- [ ] `validateSeasonalABIs()` returns `{ valid: true, errors: [] }`
- [ ] `isSeasonalSystemEnabled()` returns `true`
- [ ] All 7 contract addresses are non-zero
- [ ] All 7 ABIs are loaded (length > 0)
- [ ] `useSeasonalBurn` hook loads without errors
- [ ] `currentSeasonId` reads as `0n` from contract
- [ ] Write functions (e.g., `unlockDistrict`) are available
- [ ] Connected to Base Sepolia (chain ID 84532)
- [ ] Contract bytecode exists on-chain
- [ ] All 9 environment variables are set
- [ ] React DevTools shows correct hook state

---

## TROUBLESHOOTING

### Issue: areBurnContractsDeployedSeasonal() returns false

**Fix:**
1. Run `getMissingSeasonalContracts()` to identify issue
2. Check `.env.local` for missing variables
3. Verify ABI files exist in `/contracts/abis/`
4. Restart Next.js dev server after .env changes

### Issue: ABIs not loading

**Fix:**
1. Check that ABI files exist:
   - `contracts/abis/VoidBurnUtilitySeasonal.json`
   - `contracts/abis/XPRewardSystemSeasonal.json`
   - etc. (all 7 files)
2. Verify JSON is valid (use JSON validator)
3. Check import paths in `burnContractsSeasonal.ts`

### Issue: useSeasonalBurn returns loading: true forever

**Fix:**
1. Check network connection (Base Sepolia RPC)
2. Verify wallet connected
3. Check contract addresses are correct
4. Inspect browser console for errors

### Issue: Write functions not available

**Fix:**
1. Verify wallet connected
2. Check wallet has ETH for gas
3. Verify contract ABIs include write functions
4. Check ABI function names match (case-sensitive)

---

## SUCCESS CRITERIA

✅ **ALL VALIDATIONS PASS** → Ready for HUD Integration  
⚠️ **1-2 WARNINGS** → Review and fix before proceeding  
❌ **3+ ERRORS** → STOP - Fix wiring issues first

---

**Next Phase:** HUD Integration (after validation passes)
