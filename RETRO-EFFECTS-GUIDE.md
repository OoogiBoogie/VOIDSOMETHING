# VOID Retro Effects - Quick Start Guide

## 🎮 What This Does

Adds optional **PS1/CRT/Xbox 360/Y2K aesthetic** to your HUD without breaking anything:
- **Dithered textures** (pixel patterns)
- **CRT scanlines** and noise
- **Chromatic aberration** (RGB color split)
- **Xbox blade animations** (smooth slides)
- **Chrome borders** and Y2K gloss
- **Glitch effects** (flicker, jitter, VHS distortion)

**Your hub switching logic is 100% preserved** - this just adds visual effects on top.

---

## 🚀 3-Step Setup

### Step 1: Wrap your app with the provider

In `app/layout.tsx` (or wherever your providers are):

```tsx
import { RetroEffectsProvider } from '@/contexts/RetroEffectsContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RetroEffectsProvider>
          {children}
        </RetroEffectsProvider>
      </body>
    </html>
  );
}
```

### Step 2: Add the CRT overlay (optional)

In your main HUD file (e.g., `VoidHudApp.tsx`):

```tsx
import { CRTOverlay, ChromaticAberrationOverlay, VHSGlitchOverlay } from '@/components/effects/CRTOverlay';
import { useRetroEffects } from '@/contexts/RetroEffectsContext';

export default function VoidHudApp() {
  const { config } = useRetroEffects();
  
  return (
    <>
      {/* Your existing HUD */}
      <YourHudContent />
      
      {/* Add overlays */}
      <CRTOverlay 
        enabled={config.enabled && config.crtOverlay}
        intensity={config.intensity}
        showScanlines={config.scanlines}
        showNoise={config.noise}
        showVignette={config.vignette}
      />
      <ChromaticAberrationOverlay enabled={config.enabled && config.chromaticAberration} />
      <VHSGlitchOverlay enabled={config.enabled && config.vhsGlitch} />
    </>
  );
}
```

### Step 3: Toggle it on

Somewhere in your HUD (like the header or settings panel):

```tsx
import { useRetroEffects } from '@/contexts/RetroEffectsContext';

export function RetroToggleButton() {
  const { config, toggleRetro } = useRetroEffects();
  
  return (
    <button onClick={toggleRetro}>
      {config.enabled ? '📺 Retro Mode: ON' : '🖥️ Retro Mode: OFF'}
    </button>
  );
}
```

---

## 🎨 How to Apply Effects to Components

### Method 1: Use CSS classes directly

```tsx
// Dithered panel with chrome border
<div className="xbox-rounded chrome-border dither-light">
  My Panel
</div>

// Glitchy text
<h1 className="chromatic-text glitch-flicker">
  VOID CORE
</h1>

// Button with Xbox hover effect
<button className="xbox-rounded-sm chrome-border retro-button-hover">
  Click Me
</button>
```

### Method 2: Use the `useRetroStyle` hook (auto-disabled when retro off)

```tsx
import { useRetroStyle } from '@/contexts/RetroEffectsContext';

export function MyWindow() {
  const retro = useRetroStyle();
  
  return (
    <div className={`base-window-classes ${retro.window()}`}>
      <h2 className={retro.text()}>Window Title</h2>
      <div className={retro.panel()}>
        Panel content
      </div>
      <button className={retro.button()}>
        Action
      </button>
    </div>
  );
}
```

### Method 3: Conditional classes with `useRetroClass`

```tsx
import { useRetroClass } from '@/contexts/RetroEffectsContext';

export function MyComponent() {
  const retroClass = useRetroClass('dither-medium', 'scanlines');
  
  return (
    <div className={`my-base-styles ${retroClass}`}>
      {/* Retro classes only applied if enabled */}
    </div>
  );
}
```

---

## 📦 Available CSS Classes

### Dither Patterns
- `dither-light` - subtle pixel texture (3%)
- `dither-medium` - moderate texture (6%)
- `dither-heavy` - heavy dither (10%)

### CRT Effects
- `scanlines` - horizontal CRT scanlines
- `scanlines-subtle` - lighter scanlines
- `crt-noise` - animated static noise

### Chrome Borders (Xbox 360 style)
- `chrome-border` - thin metallic border
- `chrome-border-thick` - thick chrome border
- `chrome-glow-green` - green glow (WORLD hub)
- `chrome-glow-cyan` - cyan glow (CREATOR hub)
- `chrome-glow-purple` - purple glow (DEFI hub)

### Rounded Corners (Xbox blade style)
- `xbox-rounded-sm` - 8px radius
- `xbox-rounded` - 12px radius
- `xbox-rounded-lg` - 16px radius

### Y2K Effects
- `y2k-gloss` - glossy gradient overlay
- `y2k-metallic` - metallic gradient

### Chromatic Aberration (RGB split)
- `chromatic-text` - RGB split on text
- `chromatic-border` - RGB split on borders
- `chromatic-glow` - RGB glow effect

### Glitch Animations
- `glitch-jitter` - horizontal shake
- `glitch-flicker` - opacity flicker
- `glitch-rgb-shift` - animated RGB split
- `vhs-distort` - VHS tracking error

### Xbox Blade Animations
- `blade-slide-in-right` - slide in from right
- `blade-slide-in-left` - slide in from left
- `blade-slide-out-right` - slide out to right

### Achievement Effects
- `xbox-achievement-glow` - green glow pulse (for XP popups)

### Button Hovers
- `retro-button-hover` - Xbox-style lift on hover

### Misc
- `pixelated` - pixelated image rendering (PS1 style)

---

## 🎛️ Customization Examples

### Example 1: Add retro to VoidWindowShell

```tsx
import { useRetroStyle } from '@/contexts/RetroEffectsContext';

export function VoidWindowShell({ children }) {
  const retro = useRetroStyle();
  
  return (
    <div className={`
      base-window-styles
      ${retro.apply('xbox-rounded', 'chrome-border-thick', 'dither-light', 'scanlines-subtle')}
    `}>
      {children}
    </div>
  );
}
```

### Example 2: XP popup with achievement glow

```tsx
export function XPGainToast({ amount }) {
  const retro = useRetroStyle();
  
  return (
    <div className={retro.achievement()}>
      <span className={retro.textGlitch()}>+{amount} XP</span>
    </div>
  );
}
```

### Example 3: Hub-specific chrome glow

Keep your hub switching logic, just add chrome on top:

```tsx
export function HubPanel({ hubMode }) {
  const theme = HUB_THEME[hubMode]; // Your existing hub theme
  const retro = useRetroStyle();
  
  const chromeClass = 
    hubMode === 'WORLD' ? 'chrome-glow-green' :
    hubMode === 'CREATOR' ? 'chrome-glow-cyan' :
    hubMode === 'DEFI' ? 'chrome-glow-purple' : '';
  
  return (
    <div className={`
      ${theme.accent} ${theme.accentBorder}
      ${retro.apply('xbox-rounded', chromeClass, 'dither-light')}
    `}>
      {/* Your hub still controls colors, retro just adds texture */}
    </div>
  );
}
```

---

## 🔧 Settings Panel Example

Add a retro settings panel to your HUD:

```tsx
import { useRetroEffects } from '@/contexts/RetroEffectsContext';

export function RetroSettingsPanel() {
  const { config, toggleRetro, toggleEffect, setIntensity } = useRetroEffects();
  
  return (
    <div className="settings-panel">
      <h3>Retro Aesthetic</h3>
      
      {/* Master toggle */}
      <button onClick={toggleRetro}>
        Retro Mode: {config.enabled ? 'ON' : 'OFF'}
      </button>
      
      {config.enabled && (
        <>
          {/* Intensity */}
          <select value={config.intensity} onChange={e => setIntensity(e.target.value as any)}>
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="heavy">Heavy</option>
          </select>
          
          {/* Individual effects */}
          <label>
            <input type="checkbox" checked={config.scanlines} onChange={() => toggleEffect('scanlines')} />
            Scanlines
          </label>
          <label>
            <input type="checkbox" checked={config.noise} onChange={() => toggleEffect('noise')} />
            CRT Noise
          </label>
          <label>
            <input type="checkbox" checked={config.vignette} onChange={() => toggleEffect('vignette')} />
            Vignette
          </label>
          <label>
            <input type="checkbox" checked={config.chromaticAberration} onChange={() => toggleEffect('chromaticAberration')} />
            Chromatic Aberration
          </label>
          <label>
            <input type="checkbox" checked={config.vhsGlitch} onChange={() => toggleEffect('vhsGlitch')} />
            VHS Glitches
          </label>
        </>
      )}
    </div>
  );
}
```

---

## ✅ What's Preserved

✅ **All hub theming** - WORLD, CREATOR, DEFI, DAO, AGENCY, AI_OPS  
✅ **Hub colors** - signal-green, cyber-cyan, void-purple, etc.  
✅ **Hub switching logic** - `setHubMode()` still works  
✅ **All window types** - District, Land, Map, etc.  
✅ **All animations** - retro just adds to them  
✅ **Seasonal burn system** - completely untouched  

## 🎯 Start Small

**Recommended first steps:**

1. Add provider to layout ✅
2. Add retro toggle button to header ✅
3. Enable it and see the CRT overlay ✅
4. Pick ONE component (like `VoidWindowShell`)
5. Add `${retro.window()}` to its className
6. Check it looks good
7. Gradually add to more components

**No rush - you can apply these effects one component at a time.**

---

## 🐛 Troubleshooting

**Effects not showing up?**
- Make sure `RetroEffectsProvider` wraps your app
- Check that retro mode is toggled ON
- Verify CSS file is imported in `globals.css`

**Performance issues?**
- Reduce intensity to 'light'
- Disable `noise` (canvas animation is most expensive)
- Disable `vhsGlitch`

**Overlays blocking clicks?**
- All overlays have `pointer-events: none` - if clicks blocked, it's something else

**Want to remove it?**
- Just toggle retro mode OFF - everything reverts to normal
- Or remove the CSS import from `globals.css`

---

## 📁 Files Created

```
styles/retro-effects.css          - All CSS classes
components/effects/CRTOverlay.tsx - Canvas overlays
contexts/RetroEffectsContext.tsx  - Toggle system
```

**That's it! Hub logic preserved, effects are optional, apply gradually.** 🎮
