# Welcome Screen Audio System

## Audio Timing Table

| Time | Phase | Event | Sound | Description |
|------|-------|-------|-------|-------------|
| 0s | BOOT | Start typing | `INTRO_BOOT_BEEP` | CRT-style beep every 3 characters |
| 0-3s | BOOT | Background | Digital hum | Low-level electrical ambience |
| 3s | WARNING | Phase transition | `INTRO_GLITCH` | Glitch pop + tape distortion |
| 3s | WARNING | Voice | `INTRO_WARNING_VOICE` | "WARNING: Once entered, there is no return" |
| 3s | WARNING | Sub-bass | `INTRO_SUB_BASS` | 199Hz sine wave drone (30% volume) |
| 3-7s | WARNING | Ambient | Sub-bass fade-in | Ramp from 0 to 0.3 gain over 2s |
| 7s | INVITATION | Voice | `INTRO_WHISPER` | Stereo whispers: "see... release... awaken..." |
| 7-12s | INVITATION | Loop | Breathing | Subtle oscillation in sub-bass |
| 12s+ | IDLE | Whisper | `INTRO_WHISPER` | "You can still turn back..." (repeating) |
| ENTER | ENTRY | Impact | `INTRO_METALLIC_SLAM` | Massive bass drop + metallic impact |
| ENTER | ENTRY | Sweep | `INTRO_WHITE_NOISE_SWEEP` | Upward synth crescendo |
| ENTER+2s | COMPLETE | Fade out | All audio stops | Transition to main game |

## Audio Layer Stack

```
┌─────────────────────────────────────────┐
│ Layer 1: Sub-Bass Drone (199 Hz)       │ ← Web Audio API oscillator
├─────────────────────────────────────────┤
│ Layer 2: Glitch FX & Pops              │ ← AudioEvents system
├─────────────────────────────────────────┤
│ Layer 3: Processed Voice Samples       │ ← AudioEvents system
├─────────────────────────────────────────┤
│ Layer 4: Transition Impacts            │ ← AudioEvents system
└─────────────────────────────────────────┘
```

## Audio Files Needed

Create these audio files in `public/audio/intro/`:

### Core Sounds
- `boot-beep.mp3` - Short CRT-style beep (50ms, 800Hz tone)
- `glitch-pop.mp3` - Digital glitch sound (150ms)
- `warning-voice.mp3` - "WARNING: Once entered, there is no return"
- `whisper-loop.mp3` - "see... release... awaken..." with stereo drift
- `metallic-slam.mp3` - Heavy bass impact (kick + metal hit)
- `white-noise-sweep.mp3` - Upward synth riser (2s duration)
- `idle-whisper.mp3` - "You can still turn back..."

### Ambient (Optional)
- `electrical-hum.mp3` - Constant low-level background hum
- `tape-hiss.mp3` - Analog tape texture

## Audio Configuration

Add to `features/audio/audioConfig.ts`:

\`\`\`typescript
// Welcome Screen sounds
{
  event: AudioEvents.INTRO_BOOT_BEEP,
  src: "/audio/intro/boot-beep.mp3",
  volume: 0.4,
  category: "ui"
},
{
  event: AudioEvents.INTRO_GLITCH,
  src: "/audio/intro/glitch-pop.mp3",
  volume: 0.6,
  category: "ui"
},
{
  event: AudioEvents.INTRO_WARNING_VOICE,
  src: "/audio/intro/warning-voice.mp3",
  volume: 0.8,
  category: "ui"
},
{
  event: AudioEvents.INTRO_WHISPER,
  src: "/audio/intro/whisper-loop.mp3",
  volume: 0.5,
  loop: true,
  category: "ambient"
},
{
  event: AudioEvents.INTRO_METALLIC_SLAM,
  src: "/audio/intro/metallic-slam.mp3",
  volume: 1.0,
  category: "ui"
},
{
  event: AudioEvents.INTRO_WHITE_NOISE_SWEEP,
  src: "/audio/intro/white-noise-sweep.mp3",
  volume: 0.7,
  category: "ambient"
}
\`\`\`

## Web Audio API Integration

The sub-bass drone (199 Hz) is generated using the Web Audio API for precise frequency control:

\`\`\`typescript
// Create oscillator
oscillator = audioContext.createOscillator()
gainNode = audioContext.createGain()

oscillator.type = "sine"
oscillator.frequency.value = 199 // Hz

// Fade in over 2 seconds
gainNode.gain.setValueAtTime(0, audioContext.currentTime)
gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 2)

oscillator.connect(gainNode)
gainNode.connect(audioContext.destination)
oscillator.start()
\`\`\`

## Sound Design Tips

### Boot Beep
- Pure 800Hz sine wave
- 50ms duration
- Sharp attack, no release
- Slight digital distortion

### Glitch Pop
- Layer white noise burst + pitch bend
- RGB-style chromatic aberration in frequency
- 100-200ms duration

### Warning Voice
- Process with:
  - Pitch shift (-3 semitones)
  - Heavy reverb (cathedral preset)
  - Slight ring modulation
  - Stereo widening

### Whisper Loop
- Record "see... release... awaken..." with ~2s spacing
- Add:
  - Auto-pan (slow L→R drift)
  - Reverb tail
  - Slight delay
  - High-pass filter (remove <200Hz)

### Metallic Slam
- Layer:
  - 808 sub-bass kick
  - Metal plate impact
  - Reverse reverb swell
- Use sidechain compression for punch

### White Noise Sweep
- Start: 200Hz low-pass
- End: Full spectrum white noise
- Add:
  - Pitch riser (2 octaves up)
  - Reverb automation (dry→100% wet)
  - Volume swell (exponential curve)

## Volume Mixing Guide

```
Sub-Bass Drone:    30%  (0.3 gain) - Felt, not heard
Boot Beep:         40%  (0.4 gain) - Subtle clicks
Glitch FX:         60%  (0.6 gain) - Present but not jarring
Warning Voice:     80%  (0.8 gain) - Clear and commanding
Whisper:           50%  (0.5 gain) - Background texture
Metallic Slam:     100% (1.0 gain) - Maximum impact
White Noise Sweep: 70%  (0.7 gain) - Crescendo builds
```

## Testing Checklist

- [ ] Boot beeps play every 3 characters
- [ ] Sub-bass fades in smoothly at 3s
- [ ] Warning voice is clear and intimidating
- [ ] Whispers pan left/right subtly
- [ ] Idle whisper loops after 20s of no input
- [ ] Metallic slam has physical impact
- [ ] White noise sweep builds tension
- [ ] All audio stops cleanly on complete
- [ ] No audio clicks or pops during transitions
- [ ] Works on mobile (Web Audio API compatibility)
