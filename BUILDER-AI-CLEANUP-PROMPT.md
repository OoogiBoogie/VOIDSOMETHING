# PSX VOID – Cleanup + Unify Intro + Network Fix

## Context

- **Stack**: Next.js 16 + React 19 + wagmi + Privy + Three.js
- **Network**: Base Sepolia testnet (Chain ID 84532)
- **Architecture**: HUD-based 3D metaverse with wallet integration
- **Intro Flow**: VoidBootIntro (Matrix-style boot sequence) mounted in layout.tsx
- **Wallet Provider**: Privy for authentication, wagmi for Web3 interactions

## Tasks

### 1. Network Configuration (wagmi)

**File**: `lib/wagmiConfig.ts`

Configure wagmi to use **Base Sepolia** as the active chain:

```typescript
import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected, metaMask, coinbaseWallet, walletConnect } from "wagmi/connectors";

// Set to false when moving to mainnet
const USE_TESTNET = true;
const activeChain = USE_TESTNET ? baseSepolia : base;

const wagmiConfig = createConfig({
  chains: [activeChain],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "PSX VOID Metaverse",
      preference: "smartWalletOnly",
    }),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
      metadata: {
        name: "PSX VOID Metaverse",
        description: "On-chain creator economy and metaverse on Base",
        url: "https://psx.void.city",
        icons: ["https://psx.void.city/icon.png"],
      },
    }),
  ],
  transports: {
    [activeChain.id]: http(
      process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org"
    ),
  },
  ssr: true,
});

export { wagmiConfig };
```

**Requirements**:
- Import `baseSepolia` from `wagmi/chains`
- Add `USE_TESTNET` flag (set to `true` for testnet)
- Use `activeChain` variable to switch between Sepolia and mainnet
- Read RPC URL from `NEXT_PUBLIC_BASE_RPC_URL` env var, fallback to Sepolia RPC
- Ensure all contract reads/writes use this config

---

### 2. Delete Backup Page Files

**Action**: Delete these 4 files from `app/` directory:

```
app/page-backup-before-new-hud.tsx
app/page-before-hud-test.tsx
app/page-before-hud32.tsx
app/page-before-hud41.tsx
```

**Reason**: These are dead code that may be accidentally imported or cause confusion.

**Verification**: Ensure no imports reference these files anywhere in the codebase.

---

### 3. Unify Intro Flow (Option A: Keep VoidBootIntro Only)

**Goal**: Single cinematic intro experience (no double/triple intro screens)

#### Current Problem:
- **System 1** (layout.tsx): `<VoidBootIntro />` (Matrix boot, sessionStorage)
- **System 2** (page.tsx): PhotosensitivityWarning → WelcomeScreen → WalletConnectionModal (localStorage)
- **Result**: Users see 4 screens sequentially = confusing UX

#### Solution:
Keep `<VoidBootIntro />` in `app/layout.tsx` as the **only** intro sequence. Remove the old multi-step intro flow from `app/page.tsx`.

#### File: `app/layout.tsx`
**Keep this structure** (should already exist):

```tsx
import { VoidBootIntro } from "@/components/intro/VoidBootIntro";
import { PrivyProviderWrapper } from "@/components/providers/privy-provider";
import { Web3Provider } from "@/components/Web3Provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <PrivyProviderWrapper>
            <VoidBootIntro />
            {children}
          </PrivyProviderWrapper>
        </Web3Provider>
      </body>
    </html>
  );
}
```

#### File: `app/page.tsx`

**Remove these imports**:
```typescript
import { PhotosensitivityWarning } from "@/components/PhotosensitivityWarning"
import { WelcomeScreen } from "@/components/WelcomeScreen"
import { WalletConnectionModal } from "@/components/wallet/wallet-connection-modal"
```

**Remove these state variables**:
```typescript
const [warningAccepted, setWarningAccepted] = useState<boolean | null>(null)
const [introComplete, setIntroComplete] = useState<boolean | null>(null)
const [walletConnected, setWalletConnected] = useState<boolean | null>(null)
```

**Remove these useEffect blocks**:
```typescript
useEffect(() => {
  const introSeen = localStorage.getItem("void_intro_seen")
  if (introSeen === "true") {
    setIntroComplete(true)
  } else if (introComplete === null) {
    setIntroComplete(false)
  }
}, [introComplete])

useEffect(() => {
  const warningSeen = localStorage.getItem("void_warning_accepted")
  if (warningSeen === "true") {
    setWarningAccepted(true)
  } else if (warningAccepted === null) {
    setWarningAccepted(false)
  }
}, [warningAccepted])

useEffect(() => {
  const walletSeen = localStorage.getItem("void_wallet_connected")
  if (walletSeen === "true") {
    setWalletConnected(true)
  } else if (walletConnected === null) {
    setWalletConnected(false)
  }
}, [walletConnected])
```

**Remove this conditional rendering chain**:
```tsx
{warningAccepted === false && (
  <PhotosensitivityWarning
    onAccept={() => {
      localStorage.setItem("void_warning_accepted", "true")
      setWarningAccepted(true)
    }}
  />
)}

{warningAccepted === true && introComplete === false && (
  <WelcomeScreen onComplete={() => setIntroComplete(true)} />
)}

{introComplete === true && walletConnected === false && (
  <WalletConnectionModal
    isOpen={true}
    onClose={() => {}}
    onConnected={(address, method) => {
      localStorage.setItem("void_wallet_connected", "true")
      setWalletConnected(true)
    }}
    onSkip={() => {
      localStorage.setItem("void_wallet_skipped", "true")
      setWalletConnected(true)
    }}
  />
)}

{introComplete === true && walletConnected === true && !userProfile && <UserProfileSetup ... />}
```

**Replace with**:
```tsx
{!userProfile && <UserProfileSetup onComplete={handleProfileComplete} />}

<AnimatePresence>
  {!gameStarted && userProfile && (
    <StartScreen 
      onStart={() => {
        setGameStarted(true)
        setInputMode('WORLD')
      }} 
    />
  )}
</AnimatePresence>
```

**Update resetIntro() function**:
```typescript
useEffect(() => {
  (window as any).resetIntro = () => {
    sessionStorage.removeItem("void_boot_intro_seen")
    setGameStarted(false)
    console.log("🔄 Intro reset! Boot intro will appear on next refresh.")
  }
  console.log("💡 TIP: Type resetIntro() in console to restart intro sequence")
}, [])
```

**Update Shift+R keyboard shortcut**:
```typescript
// RESET INTRO: Shift+R to clear intro and see it again
if ((e.key === "r" || e.key === "R") && e.shiftKey) {
  e.preventDefault()
  sessionStorage.removeItem("void_boot_intro_seen")
  setGameStarted(false)
  console.log("🔄 Intro reset! Boot intro will appear on next refresh.")
}
```

#### Optional: Photosensitivity Warning
If you want to preserve a photosensitivity warning:
- **Option A**: Add warning text to VoidBootIntro component (recommended)
- **Option B**: Keep PhotosensitivityWarning but integrate it into VoidBootIntro flow (not as separate modal chain)

---

### 4. Wallet State: Privy as Single Source of Truth

**Goal**: No localStorage wallet state, only Privy's `authenticated` state.

#### File: `app/page.tsx`

**Remove**:
```typescript
const [walletConnected, setWalletConnected] = useState<boolean | null>(null)

useEffect(() => {
  const walletSeen = localStorage.getItem("void_wallet_connected")
  setWalletConnected(walletSeen === "true")
}, [walletConnected])
```

**No replacement needed** - VoidBootIntro already dismisses after user interaction, and Privy manages authentication state internally.

#### File: `components/wallet/wallet-connection-modal.tsx`

**Keep using Privy**:
```typescript
import { usePrivy } from "@privy-io/react-auth";

export function WalletConnectionModal({ isOpen, onClose, onConnected, onSkip }) {
  const { authenticated, login } = usePrivy();

  useEffect(() => {
    if (authenticated) {
      // Auto-close modal when Privy says authenticated
      const wallets = useWallets();
      onConnected(wallets[0]?.address || "", "privy");
    }
  }, [authenticated]);

  // Privy button handler
  const handlePrivyConnect = async () => {
    await login();
  };

  // ...rest of component
}
```

**Remove** any `localStorage.setItem("void_wallet_connected", "true")` calls.

---

### 5. Privy Provider Configuration

**File**: `components/providers/privy-provider.tsx`

**Ensure this robust configuration**:

```typescript
"use client";

import React, { Suspense } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { base, baseSepolia } from "viem/chains";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

// Set to false when moving to mainnet
const USE_TESTNET = true;
const defaultChain = USE_TESTNET ? baseSepolia : base;

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  // Fail-safe: if no Privy app ID, don't crash the app
  if (!privyAppId || privyAppId === "YOUR_PRIVY_APP_ID_HERE") {
    if (typeof window !== "undefined") {
      console.warn(
        "[PSX VOID] Privy disabled: missing NEXT_PUBLIC_PRIVY_APP_ID. " +
          "Set it in .env.local to enable wallet auth."
      );
    }
    return <>{children}</>;
  }

  return (
    <Suspense fallback={<>{children}</>}>
      <PrivyProvider
        appId={privyAppId}
        config={{
          defaultChain,
          supportedChains: [baseSepolia, base],
          loginMethods: ["email", "google", "twitter", "discord", "wallet"],
          appearance: {
            theme: "dark",
            accentColor: "#a855ff", // VOID purple
            logo: "/icon-dark-32x32.png",
          },
          embeddedWallets: {
            createOnLogin: "users-without-wallets" as const,
          },
          externalWallets: {
            coinbaseWallet: { enabled: true },
            walletConnect: { enabled: true },
            eip6963: { enabled: true },
          },
        }}
      >
        {children}
      </PrivyProvider>
    </Suspense>
  );
}
```

**Key Points**:
- Read `NEXT_PUBLIC_PRIVY_APP_ID` from env
- If missing or placeholder, log warning and return children directly (fail-safe)
- Configure `defaultChain = baseSepolia` for testnet
- Support both Sepolia and mainnet in `supportedChains`
- Enable external wallets: Coinbase Wallet, WalletConnect, EIP-6963

---

## Constraints

- ❌ **Do NOT** change contract addresses or fee splits
- ❌ **Do NOT** add new intro modals (use VoidBootIntro only)
- ✅ **Keep** visual style consistent with neon/cyber HUD theme
- ✅ **Preserve** all existing HUD functionality (W/C/D/G navigation)
- ✅ **Ensure** no breaking changes to contracts or HUD layout

---

## Deliverables

1. ✅ Updated `lib/wagmiConfig.ts` using Base Sepolia with USE_TESTNET flag
2. ✅ Cleaned `app/page.tsx` with no legacy intro/wallet state
3. ✅ Updated `components/providers/privy-provider.tsx` with testnet-safe config
4. ✅ Deleted 4 backup page files from `app/` directory
5. ✅ Single unified intro flow (VoidBootIntro only, no double screens)
6. ✅ Privy as single source of truth for wallet authentication

---

## Verification Commands

After applying changes:

```bash
# Clear all storage
sessionStorage.clear()
localStorage.clear()

# Refresh app
# Should see: VoidBootIntro → UserProfileSetup → StartScreen → Game
# Should NOT see: PhotosensitivityWarning, WelcomeScreen, WalletConnectionModal

# Test wallet connection
# Click Privy button in VoidBootIntro or profile setup
# Should authenticate and proceed without localStorage flags

# Test intro reset
resetIntro() # in browser console
# or press Shift+R
# Refresh page to see VoidBootIntro again
```

---

## Environment Variables Required

```env
NEXT_PUBLIC_PRIVY_APP_ID=cmhuzn78p003jib0cqs67hz07
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo-project-id
```

---

## Success Criteria

✅ **Network**: wagmi points to Base Sepolia (chain ID 84532)  
✅ **Intro**: Only VoidBootIntro shows, no duplicate screens  
✅ **Wallet**: Privy manages authentication, no localStorage desync  
✅ **Clean Code**: No backup files, no dead imports  
✅ **HUD**: All existing functionality works (W/C/D/G, hubs, XP, inventory)  
✅ **No Crashes**: App doesn't crash on missing Privy ID or env vars

---

**From here, you can focus on the fun stuff: land, swaps, cosmetics, and vibes.** 🟣💚
