# Phase 10 — Polish & Roadmap

## Objective

Add final UX polish, documentation, and release readiness for v0.1.0.

## Changes

### Hatch Polish
- **`components/hatch/HatchFlow.tsx`**: Reveal step now shows personality name, description, peak stat, and dump stat
- Hatch memory is recorded as first entry in progression memories

### Idle Personality Messages
- **`components/device/MainDevice.tsx`**: Cycles through `personality.idleLines` every 15–30s on main tab
- Subtle `idle-pulse` CSS animation on message text

### Shiny Sparkle
- **`app/globals.css`**: `shiny-sparkle` keyframe animation (brightness cycling)
- **`components/device/LcdDisplay.tsx`**: Shiny buddies get the CSS class on the LCD display container; rarity text uses gold glow

### Memory Album
- **`components/device/MemoryAlbum.tsx`**: New component displaying all memories in reverse chronological order
- Accessible from profile tab via "Memory Album" button
- Supports 5 types (hatch, evolution, adventure, milestone, achievement)

### Silent Mode
- **`components/device/SettingsScreen.tsx`**: Checkbox toggle stored in localStorage (`buddy-silent-mode`)
- **`components/device/MainDevice.tsx`**: Checks key before rendering popup messages

### Care Journal
- **`components/device/MainDevice.tsx`**: Tracks last 10 actions with action type, icon, and relative timestamp
- Shown in profile tab below buddy details

### Tests
- **`lib/polish.test.ts`**: 12 new tests covering silent mode, shiny sparkle, idle messages, care journal, hatch polish
- **`lib/progression/lifecycle.test.ts`**: 4 new tests for memory entry structure and manipulation

### Documentation
- **`README.md`**: Project overview, quick start, feature list, commands, structure
- **`ROADMAP.md`**: Version plan (v0.1–v0.5) with future ideas
- **`docs/buddy/reports/release-v0.1.0.md`**: Release report with included features, verification, known issues

## Quality Gate

```bash
npm test           # 163 passing (9 files)
npx tsc --noEmit   # clean
npx next build     # 120 kB first-load JS
npx next lint      # clean
```

## Files Changed

| File | Change |
|------|--------|
| `app/globals.css` | Added `shiny-sparkle` and `idle-pulse` animations |
| `components/hatch/HatchFlow.tsx` | Personality/stats reveal, hatch memory |
| `components/device/LcdDisplay.tsx` | Shiny sparkle class on container |
| `components/device/MainDevice.tsx` | Idle messages, care journal, silent mode check, memories tab |
| `components/device/MemoryAlbum.tsx` | NEW — memory album viewer |
| `components/device/SettingsScreen.tsx` | Silent mode toggle |
| `lib/polish.test.ts` | NEW — 12 tests for polish features |
| `lib/progression/lifecycle.test.ts` | 4 new memory tests |
| `README.md` | NEW — project readme |
| `ROADMAP.md` | NEW — version roadmap |
| `docs/buddy/reports/release-v0.1.0.md` | NEW — release report |

## Remaining for v0.2

- Cloud sync (Supabase auth, cross-device save)
- Sound effects and animations
- Mini-games
- Seasonal content
- Buddy trading
