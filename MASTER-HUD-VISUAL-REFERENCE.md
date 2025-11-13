# PSX-VOID HUD SYSTEM - VISUAL REFERENCE

## ROAM MODE LAYOUT (3D Exploration)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────┐                    ┌───────────────┐      │
│  │ 🌀 VOID         │                    │  MINI-MAP     │      │
│  ├─────────────────┤                    │  ┌─────────┐  │      │
│  │ ┌───┐  @Knight │                    │  │ ●  · · ·│  │      │
│  │ │PFP│  Level 12 │                    │  │·  YOU  ·│  │      │
│  │ │📷 │  2450 XP  │                    │  │ · ··  · │  │      │
│  │ └───┘           │                    │  │  ·   ·  │  │      │
│  │ ━━━━━━━━ 81%   │                    │  └─────────┘  │      │
│  └─────────────────┘                    │  🔔²  ⚙️      │      │
│                                         └───────────────┘      │
│                                                                 │
│                                                                 │
│                                                                 │
│                    ╔═══════════════════════╗                   │
│                    ║                       ║                   │
│                    ║   CENTER  CLEAR       ║                   │
│                    ║                       ║                   │
│                    ║   50-60% of screen    ║                   │
│                    ║                       ║                   │
│                    ║   NO UI ELEMENTS      ║                   │
│                    ║                       ║                   │
│                    ╚═══════════════════════╝                   │
│                                                                 │
│                                                                 │
│                                                                 │
│  ┌────────────────────────────────────┐      ┌──────────┐     │
│  │ [PROX³] [GLOBAL¹⁴²]  👥 12 nearby  │      │   📱    │     │
│  ├────────────────────────────────────┤      │  LITE   │     │
│  │ 👤 Knight: yo what's up            │      ├──────────┤     │
│  │ 🎮 Void: check casino              │      │   🤝    │     │
│  │ 🏗️ Builder: just minted!           │      │ Interact│     │
│  ├────────────────────────────────────┤      ├──────────┤     │
│  │ 💬 [Type...] [💸] [😀] [↗️]        │      │   👋    │     │
│  └────────────────────────────────────┘      │  Emote  │     │
│                                               └──────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### Measurements (1920x1080 screen):
- **Left margin**: 236px (top-left) to 416px (bottom-left)
- **Right margin**: 152px (top-right) to 64px (bottom-right)
- **Clear center**: 1,532px width (79.8%) ✅
- **Top margin**: 16px
- **Bottom margin**: 16px

---

## LITE MODE LAYOUT (Phone UI on PC)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│        3D World (Blurred 30%, 10px blur)                        │
│                                                                 │
│                   ╔══════════════════╗                          │
│                   ║ VOID    [🌐] [X]║  ← Phone bezel           │
│                   ╟──────────────────╢                          │
│                   ║                  ║                          │
│                   ║  🏠 HOME         ║                          │
│                   ║                  ║                          │
│                   ║  ┌────────────┐  ║                          │
│                   ║  │ Dashboard  │  ║                          │
│                   ║  │            │  ║                          │
│                   ║  │ Balances:  │  ║                          │
│                   ║  │ 💎 125 VOID│  ║                          │
│                   ║  │ 🎮 50K PSX │  ║                          │
│                   ║  │            │  ║                          │
│                   ║  │ Daily Tasks│  ║                          │
│                   ║  │ ━━━━ 60%   │  ║                          │
│                   ║  └────────────┘  ║                          │
│                   ║                  ║                          │
│                   ╟──────────────────╢                          │
│                   ║ 🏠 🗺️ 💬 👤 ⚙️  ║  ← Bottom nav            │
│                   ╚══════════════════╝                          │
│                         420x746px (9:16)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## MODE COMPARISON

| Feature | ROAM Mode | LITE Mode (PC) | LITE Mode (Mobile) |
|---------|-----------|----------------|-------------------|
| **Purpose** | 3D exploration | Management/social | Management/social |
| **Center** | ✅ CLEAR (50-60%) | Covered by phone panel | Covered by app UI |
| **Chat** | Bottom-left cluster | 💬 CHAT tab | 💬 CHAT tab |
| **Map** | Top-right mini-map | 🗺️ LAND tab | 🗺️ LAND tab |
| **Profile** | Top-left mini-profile | 👤 YOU tab | 👤 YOU tab |
| **Switching** | TAB key / 📱 button | [X] close button | 🌍 WORLD tab |
| **Controls** | ✅ Enabled (WASD) | ❌ Disabled | ❌ Disabled |
| **Background** | 3D world visible | 3D world blurred | 3D world hidden |

---

## CHAT CLUSTER STATES

### Collapsed (Default)
```
┌────────────────────────────────────┐
│ [PROX³] [GLOBAL]  👥 12 nearby     │
├────────────────────────────────────┤
│ 👤 Knight: yo what's up            │
│ 🎮 Void: check casino              │
│ 🏗️ Builder: just minted!           │
├────────────────────────────────────┤
│ 💬 [Type...] [💸] [😀] [↗️]        │
└────────────────────────────────────┘
Height: ~180px
```

### Expanded (Click ↗️)
```
┌────────────────────────────────────┐
│ [PROX³] [GLOBAL]  👥 12 nearby     │
├────────────────────────────────────┤
│ ↑ [Load More]                      │
│                                    │
│ 👤 OldUser: message from an hour ago│
│ 🎮 Player: older message           │
│ ...                                │
│ 👤 Knight: yo what's up            │
│ 🎮 Void: check casino              │
│ 🏗️ Builder: just minted!           │
│ 👤 You: hello everyone             │ ← Your message
│                                    │
│ ↓ [Jump to Bottom]                 │
├────────────────────────────────────┤
│ 💬 [Type...] [💸] [😀] [↗️]        │
└────────────────────────────────────┘
Height: ~400px
```

---

## MINI-PROFILE STATES

### Normal (Hover Off)
```
┌───────────────┐
│ ┌───┐         │
│ │PFP│ @Knight │
│ │📷 │ Level 12│
│ └───┘ 🟢      │
│ ━━━━━━━ 81%  │
└───────────────┘
```

### Hover (Glow + Scale 1.02x)
```
┌───────────────┐  ← Cyan glow
│ ┌───┐         │     (0 0 20px cyan)
│ │PFP│ @Knight │
│ │📷 │ Level 12│  ← Username turns cyan
│ └───┘ 🟢      │
│ ━━━━━━━ 81%  │
└───────────────┘
```

### Click → Opens Full Profile in LITE Mode

---

## ACTION BUTTON STATES

### LITE Mode Button (Primary)
```
Normal:
┌──────┐
│  📱  │  ← Gradient purple → pink
└──────┘     Pulsing glow

Hover:
┌──────┐
│  📱  │  ← Scale 1.1x
└──────┘     Stronger glow
             Tooltip appears

Active (Pressed):
┌──────┐
│  📱  │  ← Scale 0.95x
└──────┘     Sound: "click"
             Opens LITE mode
```

### Interact Button (Context-Sensitive)
```
Hidden (Default):
  (Not rendered)

Near Interactive Object:
┌──────────────┐
│      🤝      │  ← Scale from 0 → 1
│   Interact   │     Cyan border glow
└──────────────┘     Label: "Enter Casino"

Hover:
┌──────────────┐
│      🤝      │  ← Scale 1.1x
│ Enter Casino │     Brighter glow
└──────────────┘
```

---

## PFP SIZES ACROSS APP

| Context | Size | Border | Usage |
|---------|------|--------|-------|
| **Mini-Profile (ROAM)** | 64x64px | 2px, level-color | Top-left cluster |
| **Full Profile (LITE)** | 200x200px | None | YOU tab header |
| **Chat Messages** | 32x32px | None | Next to message text |
| **User Card (Popup)** | 80x80px | 2px, level-color | Click username |
| **Active Users List** | 48x48px | Status overlay | LITE chat sidebar |
| **Tipping Modal** | 64x64px | 2px, level-color | Recipient display |
| **Mini-Map (Optional)** | 20x20px circular | None | Player markers |

---

## COLOR PALETTE

### Brand Colors (VOID Signature)
- **Primary Gradient**: `#7b00ff` → `#ff0032` (Purple → Pink)
- **Accent**: `#00ffff` (Cyan)
- **Background**: `#000000` (Pure black)
- **Panels**: `rgba(0, 0, 0, 0.8)` (Black 80% + backdrop blur)

### Level Colors
- **Levels 1-10**: `#FFD700` (Gold)
- **Levels 11-20**: `#E5E4E2` (Platinum)
- **Levels 21+**: `#B9F2FF` (Diamond)

### Status Colors
- **Online**: `#00ff88` (Green)
- **Away**: `#ffaa00` (Amber)
- **DND**: `#ff4444` (Red)
- **In Voice**: `#00aaff` (Blue)

### UI Colors
- **Text Primary**: `rgba(255, 255, 255, 0.9)` (White 90%)
- **Text Secondary**: `rgba(255, 255, 255, 0.6)` (White 60%)
- **Text Tertiary**: `rgba(255, 255, 255, 0.4)` (White 40%)
- **Border**: `rgba(255, 255, 255, 0.2)` (White 20%)
- **Border Hover**: `rgba(0, 255, 255, 0.5)` (Cyan 50%)

---

## ANIMATION TIMINGS

| Action | Duration | Easing | Details |
|--------|----------|--------|---------|
| **Button hover** | 200ms | ease-out | Scale 1.05x + glow |
| **Button click** | 100ms | ease-in | Scale 0.98x + sound |
| **Tab switch** | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Underline animation |
| **Chat expand** | 300ms | ease-out | Height: 180px → 400px |
| **LITE open** | 400ms | spring | Slide from right + blur |
| **LITE close** | 300ms | ease-out | Slide to right + un-blur |
| **XP bar fill** | 1000ms | ease-out | Width 0 → percentage |
| **Message appear** | 200ms | ease-out | Fade + Y offset |
| **Confetti** | 1500ms | ease-out | 50 particles, VOID colors |

---

## KEYBOARD SHORTCUTS

| Key | Action | Context |
|-----|--------|---------|
| **TAB** | Toggle ROAM ↔ LITE | Global |
| **ESC** | Close LITE mode | LITE mode only |
| **ENTER** | Focus chat input | ROAM mode |
| **SHIFT+ENTER** | Send message | Chat focused |
| **ESC** (chat) | Unfocus chat | Chat focused |
| **WASD** | Move character | ROAM mode only |
| **SPACE** | Jump | ROAM mode only |
| **E** | Interact | Near object (ROAM) |

---

## RESPONSIVE BREAKPOINTS

### Desktop (1920x1080)
- All clusters at full size
- LITE mode = 420x746px phone panel
- Mini-map = 120x120px

### Laptop (1440x900)
- Clusters slightly smaller
- LITE mode = 380x676px
- Mini-map = 100x100px

### Tablet (1024x768)
- Compact clusters
- LITE mode = 350x622px
- Mini-map = 90x90px

### Mobile (390x844)
- ROAM HUD: Scaled down proportionally
- LITE mode: Full-screen native app UI
- Mini-map: 80x80px

---

**End of Visual Reference**
