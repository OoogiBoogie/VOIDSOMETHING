# Character Select System Integration Guide

## Overview

The Character Select System provides a AAA-quality character selection experience with:
- **PSX Operative** (default, green accent)
- **Miggles** (placeholder, orange accent)

## Flow

```
WALLET CONNECT
   ↓
PSX INTRO PANEL
   ↓
CHARACTER SELECT (/onboarding/character-select)
   ↓
ENTER VOID → spawn model (/world)
```

## Components

### 1. CharacterSelectWindow.tsx
Main UI component with:
- CRT/Glitch/Y2K/Xbox aesthetic
- Rotating 3D preview
- Character cards with hover states
- Enter Void button

### 2. RotatingModelPreview.tsx
3D model preview with:
- React Three Fiber canvas
- Slow rotation
- Glitch effects on character switch
- Loading states
- Placeholder for Miggles

### 3. State Management
```typescript
// Zustand store
useCharacterSelectState()

// Actions
selectCharacter(id: 'psx' | 'miggles')
confirmSelection()
triggerGlitch(intensity: number)
```

### 4. Net Protocol Storage
```typescript
// Save selection
await saveCharacterSelection('psx')

// Load selection
const character = await loadCharacterSelection()

// Check if selected
const hasSelected = await hasSelectedCharacter()
```

## Integration with Void World

### In VoidGameShell or World Init:

```typescript
import { spawnPlayerInWorld } from '@/lib/world/spawnPlayer';

// On world load
useEffect(() => {
  spawnPlayerInWorld(worldScene).then((config) => {
    console.log('Spawned:', config.characterId);
  });
}, []);
```

### Using the Hook:

```typescript
import { useCharacterModel } from '@/hooks/useCharacterModel';

function MyComponent() {
  const { characterId, modelPath, accentColor } = useCharacterModel();
  
  // Use in 3D scene
  return <PlayerCharacter modelPath={modelPath} />;
}
```

### HUD Accent Color:

```typescript
import { useHUDAccentColor } from '@/hooks/useCharacterModel';

function MyHUD() {
  const accentColor = useHUDAccentColor();
  // PSX = #00FF9A, Miggles = #F79625
  
  return (
    <div style={{ borderColor: accentColor }}>
      HUD Content
    </div>
  );
}
```

## Routes

```
/onboarding/character-select  → Character selection screen
/world                        → Main void world (spawns selected character)
```

## Models Required

Place these in `/public/models/`:

```
psxModel.glb              → PSX Operative model
migglesPlaceholder.glb    → Miggles placeholder (or will use wireframe cube)
```

## CSS Variables

The system sets these CSS variables for HUD theming:

```css
--hud-accent-color: #00FF9A  /* PSX green or Miggles orange */
--hud-glow-color: rgba(0, 255, 154, 0.25)  /* Glow effect */
```

Use in your HUD components:

```css
.hud-element {
  border-color: var(--hud-accent-color);
  box-shadow: 0 0 20px var(--hud-glow-color);
}
```

## Testing

1. Navigate to `/onboarding/character-select`
2. Select PSX or Miggles
3. Click "ENTER VOID"
4. Character is saved to Net Protocol
5. `/world` route loads correct model
6. HUD uses correct accent color

## Net Protocol Storage

**Key:** `void.characterSelected`

**Values:** `"psx"` | `"miggles"`

**Fallback:** Uses localStorage if Net Protocol unavailable

## Production Checklist

- [ ] Add PSX model to `/public/models/psxModel.glb`
- [ ] Add Miggles model or use placeholder wireframe
- [ ] Update routing in app to include character select after intro
- [ ] Test Net Protocol storage
- [ ] Test localStorage fallback
- [ ] Verify HUD accent color changes
- [ ] Verify 3D model loads in world
- [ ] Test glitch effects
- [ ] Test mobile responsiveness

## Future Enhancements

- Add more characters
- Character stats/abilities
- Unlock conditions
- Character customization
- Animation previews
- Voice lines
- Character lore screens
