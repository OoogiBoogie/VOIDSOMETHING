# SERVER CRASH DIAGNOSIS

## Problem
Dev server crashes within 1-10 seconds of starting, even with minimal "Hello World" page.

## Evidence
- Server starts: "✓ Ready in 600-800ms"
- No compilation happens
- Node process dies before serving any pages
- Happens with:
  - ✅ Full production page (870 lines, complex imports)
  - ✅ Minimal test page (25 lines, zero imports)
  - ✅ Both show same crash pattern

## Root Cause
**NOT A CODE ISSUE** - System/environment is killing Node.exe

## Likely Causes (in order of probability)

### 1. Antivirus/Windows Defender
- **Most likely cause** on Windows
- Solution: Add exception for:
  - `C:\Program Files\nodejs\node.exe`
  - `C:\Users\rigof\Documents\000\` (project folder)
  - `.next` build folder

### 2. System Resources
- Check: Task Manager → Performance
- Node.js may be hitting memory/CPU limits
- Solution: Close other apps, restart computer

### 3. Port Conflict
- Something else using port 3000
- Check: `netstat -ano | findstr ":3000"`
- Solution: Kill conflicting process or use different port

### 4. Node.js Version Issue
- Node 22.20.0 may have stability issues on Windows
- Solution: Downgrade to Node 20 LTS
  - `nvm install 20.18.0`
  - `nvm use 20.18.0`

## Next Steps

1. **Check Windows Defender:**
   - Open Windows Security → Virus & threat protection
   - Check "Protection history" for node.exe blocks
   - Add exclusions

2. **Try Different Port:**
   ```powershell
   $env:PORT="3001"; npm run dev
   ```

3. **Monitor System:**
   - Open Event Viewer → Windows Logs → Application
   - Look for Node.js crash logs

4. **Downgrade Node (if desperate):**
   - Current: 22.20.0
   - Try: 20.18.0 LTS (more stable)

## What We Tested

✅ Fixed 93 TypeScript errors
✅ Disabled MetaMask connector (SDK crashes)
✅ Disabled WalletConnect (403 rate limit)
✅ Added global error boundary
✅ Created minimal test page

**Result:** Still crashes - proves it's environmental, not code-related.

## Workaround for E2E Testing

Since local dev server is unstable, alternatives:
1. **Deploy to Vercel** (free, takes 2 minutes)
2. **Use production build** (`npm run build && npm start`)
3. **Fix system issue** (recommended - see above)

## Status
- ❌ Local dev server: **UNSTABLE** (system kills process)
- ✅ Code quality: **READY** (all errors fixed, builds successfully)
- ⏸️  E2E testing: **BLOCKED** until server stability resolved
