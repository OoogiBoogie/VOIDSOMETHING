# Contract ABI Setup Guide

## Overview
The burn system frontend integration requires contract ABIs to be available in the `contracts/abis/` directory. These are generated from Hardhat compilation.

## Current Status
❌ **ABIs not yet generated** - TypeScript errors in `config/burnContracts.ts` are expected until ABIs exist

## Steps to Generate ABIs

### 1. Ensure Burn Contracts Exist
Check that Solidity source files are present:
```bash
ls contracts/burn/
```

Expected files:
- `VoidBurnUtility.sol`
- `DistrictAccessBurn.sol`
- `LandUpgradeBurn.sol`
- `CreatorToolsBurn.sol`
- `PrestigeBurn.sol`
- `MiniAppBurnAccess.sol`
- `AIUtilityGovernor.sol`

### 2. Compile Contracts
```bash
npx hardhat compile
```

This generates artifacts in `artifacts/contracts/burn/`

### 3. Create ABI Directory
```bash
mkdir -p contracts/abis
```

### 4. Extract ABIs from Artifacts

**Option A: Manual Copy (PowerShell)**
```powershell
# Copy each ABI file
Copy-Item "artifacts/contracts/burn/VoidBurnUtility.sol/VoidBurnUtility.json" "contracts/abis/VoidBurnUtility.json"
Copy-Item "artifacts/contracts/burn/DistrictAccessBurn.sol/DistrictAccessBurn.json" "contracts/abis/DistrictAccessBurn.json"
Copy-Item "artifacts/contracts/burn/LandUpgradeBurn.sol/LandUpgradeBurn.json" "contracts/abis/LandUpgradeBurn.json"
Copy-Item "artifacts/contracts/burn/CreatorToolsBurn.sol/CreatorToolsBurn.json" "contracts/abis/CreatorToolsBurn.json"
Copy-Item "artifacts/contracts/burn/PrestigeBurn.sol/PrestigeBurn.json" "contracts/abis/PrestigeBurn.json"
Copy-Item "artifacts/contracts/burn/MiniAppBurnAccess.sol/MiniAppBurnAccess.json" "contracts/abis/MiniAppBurnAccess.json"
Copy-Item "artifacts/contracts/burn/AIUtilityGovernor.sol/AIUtilityGovernor.json" "contracts/abis/AIUtilityGovernor.json"
```

**Option B: Node.js Script**
Create `scripts/extract-abis.js`:
```javascript
const fs = require('fs');
const path = require('path');

const contracts = [
  'VoidBurnUtility',
  'DistrictAccessBurn',
  'LandUpgradeBurn',
  'CreatorToolsBurn',
  'PrestigeBurn',
  'MiniAppBurnAccess',
  'AIUtilityGovernor'
];

const artifactsDir = 'artifacts/contracts/burn';
const outputDir = 'contracts/abis';

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

contracts.forEach(name => {
  const artifactPath = path.join(artifactsDir, `${name}.sol`, `${name}.json`);
  const outputPath = path.join(outputDir, `${name}.json`);
  
  if (fs.existsSync(artifactPath)) {
    fs.copyFileSync(artifactPath, outputPath);
    console.log(`✅ Copied ${name}.json`);
  } else {
    console.error(`❌ Not found: ${artifactPath}`);
  }
});

console.log('\n✅ ABI extraction complete!');
```

Run with:
```bash
node scripts/extract-abis.js
```

### 5. Verify ABIs Exist
```bash
ls contracts/abis/
```

Should show:
```
VoidBurnUtility.json
DistrictAccessBurn.json
LandUpgradeBurn.json
CreatorToolsBurn.json
PrestigeBurn.json
MiniAppBurnAccess.json
AIUtilityGovernor.json
```

### 6. Verify TypeScript Errors Resolved
After ABIs are copied, restart TypeScript server in VS Code:
- Press `Ctrl+Shift+P`
- Type "TypeScript: Restart TS Server"
- Wait for recheck

**Expected result:** ✅ No more import errors in `config/burnContracts.ts`

## Troubleshooting

### Error: "Cannot find module '@/contracts/abis/...'"
**Cause:** ABIs not yet generated or copied to `contracts/abis/`
**Solution:** Follow steps 1-5 above

### Error: Hardhat compile fails
**Cause:** Missing Solidity source files
**Solution:** Ensure burn contracts exist in `contracts/burn/`

### Error: Artifact path not found
**Cause:** Contract name mismatch or compilation issue
**Solution:** 
1. Check artifact exists: `ls artifacts/contracts/burn/*/`
2. Verify contract name matches filename
3. Re-run `npx hardhat compile`

## Integration with Deployment

The deployment workflow should be:
1. ✅ Write Solidity contracts (`contracts/burn/*.sol`)
2. ✅ Compile contracts (`npx hardhat compile`)
3. ✅ Extract ABIs (manual copy or script)
4. ✅ Deploy contracts (`npx hardhat run scripts/deploy-burn-system-enhanced.ts --network baseSepolia`)
5. ✅ Update `.env.local` with deployed addresses
6. ✅ Enable feature flag (`NEXT_PUBLIC_ENABLE_BURN_UI=true`)
7. ✅ Test frontend integration

## Next Steps After ABI Setup

Once ABIs are in place:
1. Verify `config/burnContracts.ts` has no TypeScript errors
2. Test contract config: `areBurnContractsDeployed()` should return `false` (until deployed)
3. Proceed with deployment to Base Sepolia
4. After deployment, update env vars and test again
