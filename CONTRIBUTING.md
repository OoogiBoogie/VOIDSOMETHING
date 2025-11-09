# VOID Metaverse - Contributor Guide

## 🏗️ Project Structure

This project uses a **feature-based architecture** for clarity and maintainability:

```
src/
├── app/                      # Next.js routing
│   ├── page.tsx             # Main entry
│   └── demo/                # Demo showcase
│
├── features/                # Feature modules
│   ├── world/              # 3D world & rendering
│   │   └── components/
│   │       ├── WorldCanvas.tsx
│   │       ├── WorldScene.tsx
│   │       └── GlowingLetters.tsx
│   │
│   ├── wallet/             # Web3 wallet integration
│   │   └── components/
│   │       └── WalletConnectButton.tsx
│   │
│   ├── audio/              # Centralized audio system
│   │   ├── audioEvents.ts      # Event definitions
│   │   ├── audioConfig.ts      # File paths & volumes
│   │   ├── useAudioEngine.ts   # Audio controller
│   │   └── AudioProvider.tsx   # Context wrapper
│   │
│   └── ui/                 # Reusable UI components
│       ├── chrome-panel.tsx
│       ├── xbox-blade-nav.tsx
│       └── crt-overlay.tsx
│
├── shared/                 # Shared utilities
│   ├── config/
│   │   └── chains.ts          # Base chain config
│   ├── lib/
│   │   └── web3Client.ts      # wagmi setup
│   └── hooks/
│
├── components/             # Legacy components (being migrated)
├── lib/                    # Legacy lib (being migrated)
└── public/
    └── audio/              # Sound files
        ├── ui/
        ├── world/
        ├── web3/
        └── ambience/
```

---

## 🎨 Design System

### Color Palette
- **Opium Red**: `#ff0032` - Primary accent, errors
- **Carti Purple**: `#7b00ff` - Secondary accent
- **Toxic Teal**: `#00f0ff` - Info, highlights
- **Xbox Green**: `#9ccc00` - Success, blade nav

### Typography
- **Headers**: Uppercase, Orbitron/Inter font
- **Body**: Monospace (font-mono)
- **UI Labels**: Uppercase with `tracking-wider`

---

## 🔊 Audio System

### How to Use

```typescript
import { useAudio } from "@/features/audio/AudioProvider";
import { AudioEvents } from "@/features/audio/audioEvents";

function MyComponent() {
  const { play } = useAudio();

  const handleClick = () => {
    play(AudioEvents.UI_CLICK);
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### Adding New Sounds

1. Add event to `features/audio/audioEvents.ts`:
```typescript
export const AudioEvents = {
  // ... existing events
  MY_NEW_EVENT: "my.newEvent",
} as const;
```

2. Add config to `features/audio/audioConfig.ts`:
```typescript
[AudioEvents.MY_NEW_EVENT]: {
  src: "/audio/ui/my_sound.mp3",
  volume: 0.7,
  category: "ui",
},
```

3. Place audio file in `/public/audio/{category}/`

4. Use in component:
```typescript
play(AudioEvents.MY_NEW_EVENT);
```

### Audio Categories
- `ui` - Buttons, panels, toggles
- `world` - 3D interactions, teleports, footsteps
- `web3` - Wallet, transactions
- `ambient` - Background loops
- `social` - Messages, notifications

---

## 🌍 3D World (React Three Fiber)

### Creating 3D Components

```typescript
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export function MyMesh() {
  const meshRef = useRef();

  // Animation loop
  useFrame(({ clock }) => {
    meshRef.current.rotation.y = clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ff0032" />
    </mesh>
  );
}
```

### Key Libraries
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Helper components (Text3D, OrbitControls, etc.)
- **@react-three/postprocessing** - Post-processing effects (Bloom, etc.)

### ⚠️ No Babylon.js
This project uses **React Three Fiber only**. All Babylon.js code has been removed.

---

## 💰 Web3 Integration (Base Chain)

### Using wagmi v2

```typescript
import { useAccount, useConnect, useDisconnect } from "wagmi";

function MyWalletComponent() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button onClick={() => disconnect()}>
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  return (
    <button onClick={() => connect({ connector: connectors[0] })}>
      Connect Wallet
    </button>
  );
}
```

### Chain Configuration
- **Mainnet**: Base (Chain ID: 8453)
- **Testnet**: Base Sepolia (Chain ID: 84532)
- Toggle via `NEXT_PUBLIC_USE_TESTNET=true`

### Contract Addresses
Add to `shared/config/chains.ts` or environment variables.

---

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Demo Page
Navigate to `/demo` to see all new features in action.

---

## 📁 Where to Add Features

### Adding a new 3D object
`features/world/components/MyObject.tsx`

### Adding wallet functionality
`features/wallet/components/` or `features/wallet/hooks/`

### Adding UI components
`features/ui/components/` (if generic) or `components/ui/` (shadcn)

### Adding audio events
1. `features/audio/audioEvents.ts` - Define event
2. `features/audio/audioConfig.ts` - Configure file
3. `/public/audio/{category}/` - Place file

### Adding Web3 hooks
`shared/hooks/` or feature-specific hooks folder

---

## 🎯 Best Practices

### Component Structure
```typescript
/**
 * Component description
 * Key features and usage notes
 */

"use client"; // if using client-side hooks

import { ... } from "...";

interface MyComponentProps {
  prop1: string;
  prop2?: number;
}

export function MyComponent({ prop1, prop2 = 0 }: MyComponentProps) {
  // Component logic
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### File Naming
- **Components**: PascalCase (`WorldCanvas.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAudioEngine.ts`)
- **Utilities**: camelCase (`audioConfig.ts`)
- **Types**: PascalCase or camelCase (`AudioEventKey`)

### Imports
```typescript
// External libraries first
import { useState } from "react";
import { useFrame } from "@react-three/fiber";

// Internal imports with aliases
import { useAudio } from "@/features/audio/AudioProvider";
import { AudioEvents } from "@/features/audio/audioEvents";

// Types last
import type { MyType } from "./types";
```

---

## 🐛 Common Issues

### Audio not playing
- Check browser autoplay policy
- Ensure `AudioProvider` wraps your app
- Verify file path in `audioConfig.ts`

### 3D scene not rendering
- Check `Canvas` component is present
- Verify imports from `@react-three/fiber`
- Check browser console for WebGL errors

### Wallet not connecting
- Verify `WagmiProvider` wraps your app
- Check `QueryClientProvider` is present
- Ensure correct chain ID

---

## 📚 Resources

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Drei Components](https://github.com/pmndrs/drei)
- [wagmi Documentation](https://wagmi.sh)
- [Base Chain Docs](https://docs.base.org)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes following structure above
3. Test thoroughly
4. Commit: `git commit -m "feat: description"`
5. Push and create PR

---

## 📝 License

All rights reserved - VOID Metaverse 2025
