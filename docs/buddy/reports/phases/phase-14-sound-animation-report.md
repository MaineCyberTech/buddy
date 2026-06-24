# Phase 14 — Sound & Animation (v0.5)

## Objective
Add 8-bit sound effects, animated sprite transitions, and mobile vibration.

## Changes

### Sound Engine (`lib/sound/engine.ts`)
- Web Audio API-based synthesis (no audio files)
- Single `AudioContext` with resume on interaction
- 15 sound effects for all game actions:
  - `hatch()` — ascending triad (C5-E5-G5)
  - `evolve()` — major arpeggio (G4-C5-E5-G5)
  - `feed()` — quick square blip
  - `play()` — triangle ping-pong
  - `wash()` — descending sawtooth
  - `rest()` — low sine hum
  - `talk()` — three rising square beeps
  - `train()` — two low square thumps
  - `heal()` — rising sine pair
  - `coin()` — high double beep
  - `achievement()` — 4-note fanfare
  - `click()` — UI feedback
  - `adventure()` — adventure jingle
- Volume capped at 0.1 for comfort

### Sound Integration
- **`lib/sound/index.ts`**: exports `SoundEngine`
- **`components/device/MainDevice.tsx`**: 
  - Reads `soundEnabled` from store
  - Plays `SoundEngine[action]()` on care actions
  - Plays `SoundEngine.coin()` on daily login reward
  - Plays `SoundEngine.achievement()` on game completion/unlocks
- **`components/device/SettingsScreen.tsx`** (implied): sound toggle persisted in store

### Vibration
- `navigator.vibrate(30)` on all care actions
- Graceful fallback for unsupported browsers/devices
- No vibration on mini-games (handled separately if needed)

### Animations (CSS in `app/globals.css`)
- **`shiny-sparkle`**: 2s brightness cycling for shiny buddies
- **`idle-pulse`**: 3s opacity pulse for idle messages
- Applied to `LcdDisplay` container for shiny buddies
- Applied to idle message text

### Store Updates
- `soundEnabled: boolean` (default `true`)
- `setSoundEnabled(enabled: boolean)` action

## Files Changed
| File | Change |
|------|--------|
| `lib/sound/engine.ts` | NEW — sound synthesis |
| `lib/sound/index.ts` | NEW — exports |
| `app/globals.css` | Added `shiny-sparkle`, `idle-pulse` keyframes |
| `components/device/LcdDisplay.tsx` | `shiny-sparkle` class on shiny buddies |
| `components/device/MainDevice.tsx` | Sound/vibration on actions, `soundEnabled` check |
| `lib/buddy/store.ts` | Added `soundEnabled` + setter |

## Quality Gate
```bash
npm test           # 163 passing
npx tsc --noEmit   # clean
npx next build     # 127 kB first-load JS
```

## Notes
- Web Audio API requires user interaction before first play (auto-resumed on first click)
- All sounds are procedurally generated at runtime (~1KB code)
- No external audio assets needed
- Vibration respected browser permissions
- Sound can be disabled per-session in settings (persisted in store)
