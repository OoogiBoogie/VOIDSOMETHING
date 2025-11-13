# Fix 403 Errors (Optional - Not Blocking)

The 403 errors you're seeing are **NOT blocking wallet connection** - they're just noisy warnings.

## Issues

### 1. WalletConnect "demo-project-id" (403 from api.web3modal.org)
**Error**: `Failed to fetch remote project configuration`
**Cause**: Using demo project ID instead of real one
**Impact**: ⚠️ Low - WalletConnect works but can't fetch remote config

**Fix**:
1. Go to https://cloud.walletconnect.com
2. Create free account
3. Create new project
4. Copy Project ID
5. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_real_project_id_here
   ```

### 2. Base Sepolia RPC Rate Limiting (403 from sepolia.base.org)
**Error**: `POST https://sepolia.base.org/ 403 (Forbidden)`
**Cause**: Public RPC endpoint is rate-limited
**Impact**: ⚠️ Medium - Can slow down wallet queries but fallbacks work

**Fix Option A - Alchemy (Recommended)**:
1. Go to https://www.alchemy.com
2. Create free account
3. Create Base Sepolia app
4. Copy HTTP URL
5. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_BASE_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   ```

**Fix Option B - QuickNode**:
1. Go to https://www.quicknode.com
2. Create free account (300M requests/month)
3. Create Base Sepolia endpoint
4. Copy HTTP URL
5. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_BASE_RPC_URL=https://your-endpoint.base-sepolia.quiknode.pro/YOUR_TOKEN/
   ```

**Fix Option C - Use Coinbase RPC (Free)**:
```bash
# In .env.local
NEXT_PUBLIC_BASE_RPC_URL=https://base-sepolia-rpc.publicnode.com
```

## Current Status

✅ **Wallet connection working** - Privy authenticated
✅ **User can enter world** - Connection successful
⚠️ **403 errors are warnings** - Fallbacks handle them
⚠️ **WalletConnect noisy** - Works despite errors

## Recommended Action

**For development**: Leave as-is (works fine)
**For production**: Get real WalletConnect Project ID + Alchemy RPC

The app **works perfectly** with current setup - these are just optimization warnings!
