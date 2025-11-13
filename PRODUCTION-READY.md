# PRODUCTION SERVER - QUICK REFERENCE

## Server Info
- URL: http://localhost:3000
- Build ID: 4WNZNgONt3NzXcsWnc8Ex
- Environment: production
- Status: RUNNING

## Health Check Checklist (Manual - Do Now)
- [ ] Home page loads without hydration errors
- [ ] DevTools Console: no red errors after idle
- [ ] Navigate to HUD  tabs render, no infinite spinners
- [ ] Network tab: no failed requests (except expected 404s)

## E2E Testing Commands

### Pre-flight Sanity Check (2 minutes)
```powershell
.\scripts\preflight-check.ps1
```

### Full E2E Test Conductor (with wallet)
```powershell
.\scripts\Test-Conductor.ps1 -WalletPrivKey 0xYOUR_PRIVATE_KEY
```

### What Gets Tested
- Single intro path (VoidBootIntro  profile  start)
- Chain guard: Base Sepolia (84532) enforced
- Swap: VOIDUSDC routes 0.3% to Router
- Staking: APR = base + XPOracle boost
- Land: ownerOf matches HUD grid & overlay
- Perf: FPS badge  60 @ 1080p
- QA logs: saved to qa-reports/

## Mobile Testing (Same LAN)
1. Ensure NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set
2. Open http://YOUR_LOCAL_IP:3000 from phone
3. Test WalletConnect + Coinbase Wallet
4. Verify LITE (landscape) + ROAM (portrait) modes

## Troubleshooting

### MetaMask SDK SSR warnings
- SAFE TO IGNORE (client code is properly fenced)

### Page tries to prerender wagmi/privy
Add to page.tsx:
```typescript
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
```

And ensure file starts with:
```typescript
"use client"
```

## Rollback Artifact
Create backup of working build:
```powershell
Compress-Archive -Path .next -DestinationPath .\.next-backup.zip
```

## CI Validation (Local)
```powershell
npm ci && npm run typecheck && npm run lint && npm run validate:coords
```

---
Generated: 2025-11-12 00:18:39
