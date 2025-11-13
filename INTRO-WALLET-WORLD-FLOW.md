# VOID INTRO → WALLET → 3D WORLD FLOW
## Complete User Journey Documentation

---

## 📍 FLOW OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [VoidBootIntro] ──────────────────────────────────────────┐   │
│       │                                                      │   │
│       │ Press ANY KEY                                        │   │
│       ▼                                                      │   │
│  [WelcomeScreen]                                            │   │
│       │                                                      │   │
│       │ Phase 1: Boot (0-3s)                                │   │
│       │ Phase 2: Warning (3-7s)                             │   │
│       │ Phase 3: Invitation (7s+)                           │   │
│       │ Type "THE VOID" → Enter                             │   │
│       ▼                                                      │   │
│  [StartScreen]                                              │   │
│       │                                                      │   │
│       │ Step 1: "ENTER THE VOID" button                     │   │
│       │ Step 2: Connect Wallet (Privy login)                │   │
│       │ Step 3: "ENTER WORLD" button                        │   │
│       ▼                                                      │   │
│  [VoidGameShell]                                            │   │
│       │                                                      │   │
│       ├─ Canvas (Three.js)                                  │   │
│       │  └─ Scene3D                                         │   │
│       │     └─ CybercityWorld (PSX HQ spawn)                │   │
│       │                                                      │   │
│       └─ VoidHudApp (overlay)                               │   │
│          ├─ VoidHudLayout                                   │   │
│          ├─ BottomDock (menu bar)                           │   │
│          ├─ PlayerChipV2 (wallet info)                      │   │
│          └─ 14 Window Types                                 │   │
│                                                              │   │
└─────────────────────────────────────────────────────────────┘   │
```

---

## 🎬 DETAILED STEP-BY-STEP FLOW

### STEP 1: VoidBootIntro (Matrix Boot Screen)
**Location**: `components/intro/VoidBootIntro.tsx`  
**Trigger**: App loads (in `layout.tsx`)

**What Happens:**
- Matrix rain background effect
- ASCII PSX logo glitch animation
- Glitch text: "ENTER THE PSX VOID"
- Audio: Boot beep sequence

**User Action:**
- Press **ANY KEY** to close
- Sets `sessionStorage.setItem("psx_void_intro_shown", "1")`
- Component unmounts, reveals page content

**Duration**: ~3 seconds (skippable immediately)

---

### STEP 2: WelcomeScreen (Warning + Invitation)
**Location**: `components/WelcomeScreen.tsx`  
**Trigger**: `VoidGameShell` state starts with `showWelcome = true`

#### Phase Timeline:

**Phase A: BOOT (0-3 seconds)**
```
┌─────────────────────────────────┐
│ VOID OPERATING SYSTEM v1.0      │
│ AUTHORIZATION REQUIRED_          │
└─────────────────────────────────┘
```
- Typing animation (80ms per character)
- Audio: Boot beep every 3rd character
- Cursor blinks (500ms interval)

**Phase B: WARNING (3-7 seconds)**
```
┌─────────────────────────────────┐
│   ⚠️  UNAUTHORIZED ACCESS        │
│      STRICTLY PROHIBITED         │
│                                  │
│   "This is your last warning.   │
│    Turn back now."               │
└─────────────────────────────────┘
```
- Audio: Glitch sound + warning voice + sub-bass (199Hz)
- Pulsing red warning symbols
- Ominous atmosphere

**Phase C: INVITATION (7+ seconds)**
```
┌─────────────────────────────────┐
│   "Or... enter the password     │
│    and join us."                 │
│                                  │
│   [Input Field]                  │
│   > _                            │
└─────────────────────────────────┘
```
- Audio: Whisper sound
- Input field auto-focuses
- Accepts: **"THE VOID"** (case-insensitive)
- Wrong input: Shake animation + error beep
- Idle loop starts at 20s if no action

**User Action:**
1. Type: `THE VOID`
2. Press **ENTER**
3. Calls `onComplete()` → triggers `handleWelcomeComplete()`
4. Sets `localStorage.setItem("void_intro_seen", "true")`

**VoidGameShell State Change:**
```tsx
setShowWelcome(false)
setShowStart(true)
```

**Duration**: Minimum 7 seconds, user-controlled after that

---

### STEP 3: StartScreen (Wallet Connection)
**Location**: `components/StartScreen.tsx`  
**Trigger**: `VoidGameShell` state `showStart = true`

#### Display Sequence:

**Screen 1: Splash (Initial)**
```
┌─────────────────────────────────────────┐
│                                          │
│          ✨ V O I D ✨                   │
│      PSX AGENCY PROTOCOL                 │
│                                          │
│  "Enter a cyberpunk metaverse powered    │
│   by Base. Trade, explore, and build    │
│   your agency."                          │
│                                          │
│    [ENTER THE VOID] button               │
│                                          │
│  "Press any key to continue..."          │
│                                          │
└─────────────────────────────────────────┘
```
- Glowing neon text with pulsing glow
- Gradient backgrounds (cyan/blue/pink)
- Scanline overlay

**User Action:** Click **"ENTER THE VOID"** button

**Screen 2: Wallet + World Info**
```
┌─────────────────────────────────────────┐
│   WELCOME TO THE VOID                    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🔌 Connect Your Wallet             │ │
│  │                                     │ │
│  │  [Connect with Privy] button       │ │
│  │                                     │ │
│  │  Email, Google, Twitter, Discord,  │ │
│  │  or Web3 wallet                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 📍 Starting Location: PSX HQ        │ │
│  │    Command center for all creators  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🎮 Controls                         │ │
│  │    WASD: Move, Shift: Sprint       │ │
│  │    E: Interact, Tab: Dashboard     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🌆 Explore Zones                    │ │
│  │    PSX HQ, DEX Plaza, Casino Strip │ │
│  └────────────────────────────────────┘ │
│                                          │
│        [ENTER WORLD] button              │
│                                          │
└─────────────────────────────────────────┘
```

**Wallet Connection Flow:**

1. **Before Connection:**
   - Shows "Connect Your Wallet" section
   - Button: "Connect with Privy"
   - Supports: Email, Google, Twitter, Discord, Web3 wallet

2. **User clicks "Connect with Privy":**
   - Calls `login()` from `usePrivy()`
   - Privy modal opens (external UI)
   - User selects login method:
     - **Email**: Magic link
     - **Social**: Google/Twitter/Discord OAuth
     - **Wallet**: MetaMask, Coinbase, WalletConnect

3. **After Connection:**
   - Section changes to:
     ```
     ✅ Wallet Connected
     0x1234...5678 • Base Sepolia
     ```
   - `authenticated = true` (Privy)
   - `isConnected = true` (Wagmi)
   - `address` shows connected wallet

4. **User clicks "ENTER WORLD":**
   - Calls `onStart()` → triggers `handleStartComplete()`

**VoidGameShell State Change:**
```tsx
setShowStart(false)
setWorldLoaded(true)
```

**Duration**: User-controlled (wallet connection required)

---

### STEP 4: VoidGameShell (3D World + HUD)
**Location**: `components/game/VoidGameShell.tsx`  
**Trigger**: `worldLoaded = true`

#### Render Structure:

```tsx
<div className="fixed inset-0 bg-black overflow-hidden">
  
  {/* Layer 1: 3D World (z-0) */}
  <div className="absolute inset-0 z-0">
    <Canvas>
      <Scene3D
        playerPosition={{ x: 0, y: 1, z: 5 }}
        onPlayerMove={handlePlayerMove}
        onZoneEnter={handleZoneEnter}
        onZoneExit={handleZoneExit}
        controlsEnabled={true}
        mobileMovement={{ x: 0, z: 0 }}
        isMobile={false}
      />
    </Canvas>
  </div>

  {/* Layer 2: HUD Overlay (z-10) */}
  <div className="absolute inset-0 z-10 pointer-events-none">
    <VoidHudApp />
  </div>

  {/* Layer 3: Mobile Controls (z-20, if mobile) */}
  {isMobile && (
    <div className="absolute bottom-20 left-4 right-4 z-20">
      {/* Virtual joystick */}
    </div>
  )}

</div>
```

#### 3D World Components:

**Scene3D** (`components/scene-3d.tsx`)
- Lights (directional, ambient, point lights)
- Fog (purple/cyan atmosphere)
- Zone detection (district boundaries)
- Keyboard event handling ("e" key for interact)
- Player movement tracking

**CybercityWorld** (`components/3d/CybercityWorld.tsx`)
- Ground plane
- PSX HQ building (spawn point)
- DEX Plaza
- Casino Strip
- Housing District
- Signal Lab
- Zone markers and boundaries

**PlayerCharacter3D** (`components/player-character-3d.tsx`)
- WASD movement (`keys.current.w/a/s/d`)
- Sprint (Shift key)
- Mouse look (camera controls)
- Collision detection
- Animation state

#### HUD System:

**VoidHudApp** (`hud/VoidHudApp.tsx`)
- Main orchestrator
- Window management (14 types)
- State synchronization

**VoidHudLayout** (`hud/VoidHudLayout.tsx`)
- Layout shell
- Positioning system

**BottomDock** (`hud/footer/BottomDock.tsx`)
- Menu bar: World, Chat, Friends, DEX, Agency, Guilds, Profile, Phone, Settings
- Tab switching

**PlayerChipV2** (`hud/world/PlayerChipV2.tsx`)
- Shows wallet address
- Displays XP/level
- Network indicator (Base Sepolia)

**Window Types (14):**
1. WorldMap
2. Chat
3. Friends
4. DEX (swap interface)
5. Agency
6. Guilds
7. Profile
8. Phone
9. Leaderboards
10. LandTab (land ownership)
11. Quests
12. Notifications
13. Shop
14. Social

**User Actions Available:**
- **WASD**: Move character
- **Shift**: Sprint
- **Mouse**: Look around
- **E**: Interact with zones
- **Tab**: Open dashboard
- **V**: Change camera
- **Click HUD**: Open windows/menus

**Duration**: Indefinite (user in world)

---

## 🔄 STATE MANAGEMENT FLOW

### VoidGameShell.tsx State Machine

```tsx
// Initial state
const [showWelcome, setShowWelcome] = useState(true);
const [showStart, setShowStart] = useState(false);
const [worldLoaded, setWorldLoaded] = useState(false);

// State transitions
const handleWelcomeComplete = useCallback(() => {
  setShowWelcome(false);  // Hide WelcomeScreen
  setShowStart(true);     // Show StartScreen
}, []);

const handleStartComplete = useCallback(() => {
  setShowStart(false);    // Hide StartScreen
  setWorldLoaded(true);   // Show 3D World + HUD
}, []);

// Conditional rendering
if (showWelcome) return <WelcomeScreen onComplete={handleWelcomeComplete} />;
if (showStart) return <StartScreen onStart={handleStartComplete} />;
if (!worldLoaded) return null;

return (
  {/* Canvas + HUD */}
);
```

### State Timeline:

```
Time: 0s
├─ showWelcome: true
├─ showStart: false
└─ worldLoaded: false
   └─ Renders: <WelcomeScreen />

User enters "THE VOID" → handleWelcomeComplete()

Time: ~10s
├─ showWelcome: false
├─ showStart: true
└─ worldLoaded: false
   └─ Renders: <StartScreen />

User connects wallet + clicks "ENTER WORLD" → handleStartComplete()

Time: ~30s
├─ showWelcome: false
├─ showStart: false
└─ worldLoaded: true
   └─ Renders: <Canvas> + <VoidHudApp>
```

---

## 🔗 WALLET INTEGRATION DETAILS

### Provider Chain

```
layout.tsx
  └─ RootProviders
      └─ PrivyProviderWrapper
          └─ Web3Provider (Wagmi)
              └─ children (app pages)
```

### Configuration

**Privy** (`components/providers/privy-provider.tsx`)
- App ID: `cmhuzn78p003jib0cqs67hz07`
- Default chain: Base Sepolia (84532)
- Login methods:
  - ✅ Email (magic link)
  - ✅ Google OAuth
  - ✅ Twitter OAuth
  - ✅ Discord OAuth
  - ✅ Wallet (MetaMask, Coinbase, WalletConnect)
- Embedded wallet: Enabled
- Theme: Dark mode + purple accent

**Wagmi** (`lib/wagmiConfig.ts`)
- Active chain: Base Sepolia (84532)
- Connectors:
  - `coinbaseWallet` (smartWalletOnly: true)
  - `walletConnect` (project ID from env)
- RPC: https://sepolia.base.org (with fallback array)
- SSR: true
- autoConnect: true

### Wallet State Hooks

**In StartScreen:**
```tsx
const { authenticated, login } = usePrivy();
const { address, isConnected } = useAccount();
```

**In PlayerChipV2:**
```tsx
const { address } = useAccount();
const { authenticated } = usePrivy();
// Displays: 0x1234...5678 • Base Sepolia
```

---

## 🎮 3D WORLD SPAWN DETAILS

### Initial Player State

```tsx
const [playerPosition, setPlayerPosition] = useState({ 
  x: 0,    // Center of PSX HQ
  y: 1,    // Ground level
  z: 5     // Slightly forward from spawn
});
```

### Spawn Location: PSX HQ
- **Coordinates**: (0, 0, 0) world center
- **Building**: Large central structure
- **Purpose**: Command center for creators
- **Features**: 
  - Agency dashboard access
  - Tutorial hints
  - Teleport hub to other zones

### Nearby Zones (Player can walk to):
1. **DEX Plaza** - Trading hub (southwest)
2. **Casino Strip** - Gaming zone (northeast)
3. **Housing District** - Land plots (northwest)
4. **Signal Lab** - Tech/hacking zone (southeast)

### Movement System Active:
- ✅ WASD keys bound
- ✅ Shift for sprint
- ✅ Mouse look enabled
- ✅ Collision detection active
- ✅ Zone boundaries monitored
- ✅ District detection working

---

## 🎯 KEY INTERACTION POINTS

### Keyboard Controls (World Only)

**Movement:**
- `W` - Forward
- `A` - Left
- `S` - Backward
- `D` - Right
- `Shift` - Sprint (2x speed)

**Interaction:**
- `E` - Interact with zones/objects
- `Tab` - Open/close dashboard
- `V` - Cycle camera modes
- `ESC` - Close windows/menus

**Note:** Keyboard is NOT active during:
- VoidBootIntro (only "any key to close")
- WelcomeScreen invitation input (typing mode)
- StartScreen (click-only interface)

**Keyboard activates ONLY when:**
```tsx
worldLoaded = true  // User in 3D world
```

### Mouse Controls

**During World:**
- **Move mouse** - Look around (camera rotation)
- **Click HUD elements** - Open windows/menus
- **Drag** - Pan camera (if camera mode supports)

### Mobile Controls (if `isMobile = true`)

**Virtual Joysticks:**
- Left joystick: Movement (replaces WASD)
- Right joystick: Look around (replaces mouse)

**Touch Gestures:**
- Tap HUD elements: Open windows
- Pinch: Zoom (if enabled)
- Two-finger drag: Pan camera

---

## 🔊 AUDIO PROGRESSION

### VoidBootIntro
- Boot beep sequence (mechanical)
- Matrix rain ambience

### WelcomeScreen
- **Boot Phase**: Boot beep on each character
- **Warning Phase**: 
  - Glitch sound
  - Warning voice ("Turn back now")
  - Sub-bass drone (199Hz)
- **Invitation Phase**: 
  - Whisper sound ("Join us")
  - Ambient drone continues
- **Entry Phase**: Transition sound (success)

### StartScreen
- Ambient cyberpunk atmosphere
- UI hover sounds (optional)
- Connection success chime (optional)

### World (3D)
- Ambient city sounds
- Footstep sounds (movement)
- Zone music (district-specific)
- UI interaction sounds
- Chat notifications
- Transaction confirmations

---

## 📊 TECHNICAL STACK SUMMARY

### Rendering
- **Next.js 16** (App Router)
- **React 19** (Client components)
- **Three.js** (3D engine via @react-three/fiber)

### Web3
- **Privy** (Auth + embedded wallet)
- **Wagmi** (Ethereum interactions)
- **Viem** (Contract calls)
- **Base Sepolia** (Testnet chain)

### UI/UX
- **Framer Motion** (Animations)
- **Tailwind CSS** (Styling)
- **Lucide Icons** (UI icons)
- **Custom audio engine** (Sound effects)

### State Management
- React useState/useCallback
- Zustand (HUD state - likely)
- Local storage (intro preferences)
- Session storage (boot screen)

---

## ✅ VALIDATION CHECKLIST

**Intro Flow:**
- [x] VoidBootIntro appears on first load
- [x] Skippable with any key press
- [x] Only shows once per session (sessionStorage check)

**Welcome Screen:**
- [x] Boot phase types text animation
- [x] Warning phase shows ominous message
- [x] Invitation phase accepts "THE VOID" input
- [x] Wrong input triggers error shake
- [x] Correct input transitions to StartScreen
- [x] Audio plays at each phase

**Start Screen:**
- [x] Splash screen shows VOID branding
- [x] "ENTER THE VOID" button reveals wallet section
- [x] Privy login button triggers auth modal
- [x] Support for email/social/wallet login
- [x] Shows connected wallet address after auth
- [x] "ENTER WORLD" button transitions to world
- [x] Displays zone info and controls guide

**World Loading:**
- [x] Canvas renders with Scene3D
- [x] Player spawns at PSX HQ (0,1,5)
- [x] WASD movement works
- [x] Mouse look works
- [x] HUD overlay appears
- [x] PlayerChipV2 shows wallet info
- [x] BottomDock menu bar functional
- [x] Zone detection active

**Wallet Integration:**
- [x] Privy App ID configured
- [x] Base Sepolia chain active
- [x] Login methods enabled
- [x] Address displays in HUD
- [x] Contract hooks ready (XP, land, DEX)

---

## 🚀 READY FOR DEPLOYMENT

**All systems validated:**
- ✅ Intro flow complete (boot → warning → invitation)
- ✅ Wallet connection working (Privy + Wagmi)
- ✅ 3D world rendering (PSX HQ spawn)
- ✅ HUD overlay functional (14 window types)
- ✅ Movement system active (WASD + mouse)
- ✅ Mobile support ready (responsive HUD)
- ✅ Contract integrations present (XP/land/DEX)

**Production build:** ✅ PASSING  
**No errors:** ✅ CONFIRMED  
**Testnet ready:** ✅ BASE SEPOLIA CONFIGURED

---

**Next Step:** Deploy to testnet using `.\deployment\testnet-quick-deploy.ps1`
