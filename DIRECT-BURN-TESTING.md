# VOID Burn System - Direct Contract Testing (No UI Required)

Since the UI navigation for burn windows isn't fully wired yet, we can test the burn contracts directly using Cast commands.

## Test T1.2: Unlock District 2 (Direct Contract Call)

### Step 1: Check Current District Status

```powershell
# Check if District 2 is unlocked
cast call 0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760 "isDistrictUnlocked(address,uint256)(bool)" 0x8b288f5c273421FC3eD81Ef82D40C332452b6303 2 --rpc-url https://sepolia.base.org
```

**Expected:** `false` (District 2 not yet unlocked)

### Step 2: Check Unlock Price

```powershell
# Get unlock cost for District 2
cast call 0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760 "getUnlockPrice(uint256)(uint256)" 2 --rpc-url https://sepolia.base.org
```

**Expected:** `50000000000000000000000` (50,000 VOID in wei)

### Step 3: Approve VOID Spending

```powershell
$privKey = Get-Content .env | Select-String "^DEPLOYER_PRIVATE_KEY=" | ForEach-Object { $_ -replace "^DEPLOYER_PRIVATE_KEY=", "" } | Select-Object -First 1

# Approve DistrictAccessBurn contract to spend 50,000 VOID
cast send 0x8de4043445939B0D0Cc7d6c752057707279D9893 "approve(address,uint256)" 0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760 50000000000000000000000 --rpc-url https://sepolia.base.org --private-key $privKey
```

**Expected:** Transaction succeeds, approval granted

### Step 4: Unlock District 2

```powershell
# Call unlockDistrict function
cast send 0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760 "unlockDistrict(uint256)" 2 --rpc-url https://sepolia.base.org --private-key $privKey
```

**Expected:** 
- Transaction succeeds
- 50,000 VOID burned
- District 2 unlocked for wallet

### Step 5: Verify District Unlocked

```powershell
# Check if District 2 is now unlocked
cast call 0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760 "isDistrictUnlocked(address,uint256)(bool)" 0x8b288f5c273421FC3eD81Ef82D40C332452b6303 2 --rpc-url https://sepolia.base.org
```

**Expected:** `true` (District 2 now unlocked)

### Step 6: Verify VOID Balance Reduced

```powershell
# Check updated VOID balance
cast call 0x8de4043445939B0D0Cc7d6c752057707279D9893 "balanceOf(address)(uint256)" 0x8b288f5c273421FC3eD81Ef82D40C332452b6303 --rpc-url https://sepolia.base.org
```

**Expected:** `950000000000000000000000` (950,000 VOID remaining = 1M - 50k)

---

## Quick Test All Districts

```powershell
# Unlock Districts 2, 3, 4, 5 sequentially

# District 2: 50,000 VOID
cast send 0x8de4043445939B0D0Cc7d6c752057707279D9893 "approve(address,uint256)" 0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760 50000000000000000000000 --rpc-url https://sepolia.base.org --private-key $privKey
cast send 0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760 "unlockDistrict(uint256)" 2 --rpc-url https://sepolia.base.org --private-key $privKey

# District 3: 150,000 VOID
cast send 0x8de4043445939B0D0Cc7d6c752057707279D9893 "approve(address,uint256)" 0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760 150000000000000000000000 --rpc-url https://sepolia.base.org --private-key $privKey
cast send 0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760 "unlockDistrict(uint256)" 3 --rpc-url https://sepolia.base.org --private-key $privKey

# District 4: 400,000 VOID
cast send 0x8de4043445939B0D0Cc7d6c752057707279D9893 "approve(address,uint256)" 0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760 400000000000000000000000 --rpc-url https://sepolia.base.org --private-key $privKey
cast send 0x8Cd71532B1f3fbF7676004FA21Cd489c7C642760 "unlockDistrict(uint256)" 4 --rpc-url https://sepolia.base.org --private-key $privKey

# District 5: NOT ENOUGH VOID (would need 1M more)
```

---

## Summary

**✅ T1.1 COMPLETE:** Wallet connected, 1M VOID balance verified  
**⏳ T1.2 READY:** Can test district unlock via Cast commands above  
**📝 UI Note:** Burn UI windows exist but navigation not wired - testing directly via contracts instead
