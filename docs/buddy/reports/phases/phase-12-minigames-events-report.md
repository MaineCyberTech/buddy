# Phase 12 — Mini-Games & Events (v0.3)

## Objective
Add three mini-games, seasonal events system, and daily login rewards.

## Changes

### Mini-Games

#### Memory Match (`lib/minigames/memory-match.ts`)
- 4/6/8 pairs (easy/medium/hard) using emoji symbols
- Flip-two mechanics with match detection
- Score based on moves and time
- **`components/minigames/MemoryMatchGame.tsx`**: 4-column grid UI, move counter, completion score

#### Reaction Test (`lib/minigames/reaction-test.ts`)
- 5 rounds: wait random 1-4s, screen turns green, tap ASAP
- Penalty for early taps ("TOO EARLY!")
- Score = average reaction time mapped to 20-100 points
- **`components/minigames/ReactionTestGame.tsx`**: Single large button, phase display, best/avg times

#### Rhythm Tap (`lib/minigames/rhythm-tap.ts`)
- 6/10/16 note pattern (left/right arrows)
- Auto-advancing pattern with 600ms interval
- Tap matching arrow → +10 pts, miss → no points
- Accuracy-based score (90%+ = 100, 70%+ = 70, etc.)
- **`components/minigames/RhythmTapGame.tsx`**: Visual pattern preview, two large L/R buttons, live score

#### Shared
- **`lib/minigames/ui.ts`**: `MINIGAMES` registry, `MinigameRenderer` component
- **`lib/minigames/index.ts`**: Exports all games + types

### Events System

#### Daily Login (`lib/events/daily-login.ts`)
- 7-day rotating rewards (coins + occasional special items)
- Streak tracking with localStorage persistence
- Auto-reset on missed day
- **`components/events/DailyLoginView.tsx`**: Visual 7-day grid, claim button, streak display

#### Seasonal Events (`lib/events/seasonal.ts`)
- 4 hardcoded seasonal events (Spring, Summer, Harvest, Winter)
- Date-range activation, exclusive items per event
- **`components/events/SeasonalEventsView.tsx`**: List with active/inactive status

### Integration
- New tabs in MainDevice: `minigames` (hub), `events` (daily login + seasonal)
- Sound effects on all game actions via `SoundEngine`
- Vibration (30ms) on care actions and game inputs
- Rewards: coins + items added to inventory on game completion

## Files Changed
| File | Change |
|------|--------|
| `lib/minigames/memory-match.ts` | NEW — game logic |
| `lib/minigames/reaction-test.ts` | NEW — game logic |
| `lib/minigames/rhythm-tap.ts` | NEW — game logic |
| `lib/minigames/ui.ts` | NEW — renderer/registry |
| `lib/minigames/index.ts` | NEW — exports |
| `components/minigames/MemoryMatchGame.tsx` | NEW — UI |
| `components/minigames/ReactionTestGame.tsx` | NEW — UI |
| `components/minigames/RhythmTapGame.tsx` | NEW — UI |
| `lib/events/daily-login.ts` | NEW — daily rewards |
| `lib/events/seasonal.ts` | NEW — seasonal events |
| `lib/events/index.ts` | NEW — exports |
| `components/events/DailyLoginView.tsx` | NEW — UI |
| `components/events/SeasonalEventsView.tsx` | NEW — UI |

## Quality Gate
```bash
npm test           # 163 passing
npx tsc --noEmit   # clean
npx next build     # 127 kB first-load JS
```

## Notes
- All games work offline, no server required
- Rewards scale with difficulty
- SoundEngine uses Web Audio API (no audio files needed)
- Vibration via `navigator.vibrate()` with graceful fallback
