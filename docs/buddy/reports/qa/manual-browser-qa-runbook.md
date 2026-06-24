# Buddy V2 — Manual Browser QA Runbook

**Prerequisites:** A browser, `npm run dev` running on localhost:3000

## 1. Core Startup QA

1. Open `http://localhost:3000` in a browser
2. [ ] App loads without console errors (F12 → Console tab)
3. [ ] Save slot selection screen appears
4. [ ] "NEW GAME" starts the hatch flow
5. [ ] "CONTINUE" loads existing save (if one exists)

## 2. Hatch Flow QA

1. [ ] Landing step shows egg artwork
2. [ ] Hatching animation plays
3. [ ] Reveal step shows: species name, rarity badge, shiny indicator (if applicable), personality name + description, peak stat, dump stat
4. [ ] Name input step works
5. [ ] Confirming name saves the buddy
6. [ ] Main device screen appears after hatch

## 3. Deterministic Generation QA

1. [ ] Hatch a buddy, note the species + rarity + personality + stats
2. [ ] Reload the page
3. [ ] Same buddy loads (click Continue on same slot)
4. [ ] Species, rarity, personality, stats are identical

## 4. Care Loop QA

1. [ ] Feed action works — hunger increases, message appears
2. [ ] Play action works — happiness increases
3. [ ] Wash action works — cleanliness increases
4. [ ] Rest action works — energy increases
5. [ ] Talk action works — social increases
6. [ ] Train action works — discipline increases, XP gained
7. [ ] Heal action works — health restores
8. [ ] Mood changes based on needs
9. [ ] Bond increases with care
10. [ ] XP/level-up works

## 5. Adventure QA

1. [ ] EXPLORE tab shows location list
2. [ ] Selecting a location starts an adventure
3. [ ] Results show success/failure, rewards
4. [ ] Items and coins added to inventory
5. [ ] Energy decreases after adventure
6. [ ] Account-gated locations show prompt for guest users

## 6. Mini-Games QA

1. [ ] GAMES tab shows Memory Match, Reaction Test, Rhythm Tap
2. [ ] Memory Match: flip cards, match pairs, score shown on completion
3. [ ] Reaction Test: wait for green, tap fast, results shown
4. [ ] Rhythm Tap: follow the pattern, score shown on completion
5. [ ] High score persists across page reloads
6. [ ] Breeding: only shown when buddy is Adult/Elder
7. [ ] Marketplace: daily stock appears, buy/sell works, coins update

## 7. Collections QA

1. [ ] PROFILE → Species Book shows species grid
2. [ ] Undiscovered species shown as "???", discovered shown with sprite
3. [ ] Lore Journal shows locations, visited ones have descriptions
4. [ ] Photo Album shows saved photos (use 📸 button in header)
5. [ ] Memory Album shows hatch/evolution/achievement memories

## 8. Home Customization QA

1. [ ] HOME tab shows 6 decor slots
2. [ ] Clicking a slot opens the decor picker
3. [ ] Pick an item → it appears in the slot
4. [ ] Items are consumed from inventory
5. [ ] Removing a decor returns it to inventory

## 9. PWA / Offline QA

1. [ ] Install prompt appears (Chrome: ⋮ → Install Buddy)
2. [ ] Service worker registers (DevTools → Application → Service Workers)
3. [ ] Disconnect internet → app still loads from cache
4. [ ] Reconnect → app resumes normally
5. [ ] Close tab, reopen → save still loads

## 10. Settings QA

1. [ ] Silent mode checkbox works
2. [ ] Sound toggle works
3. [ ] Export save downloads a .txt file
4. [ ] Import save restores from .txt file
5. [ ] Guest ID displayed
6. [ ] Create account flow works
7. [ ] Sign out returns to guest mode

## 11. Mobile QA (if on phone or responsive mode)

1. [ ] App fits mobile screen width
2. [ ] Buttons are touch-friendly
3. [ ] No overlapping UI elements
4. [ ] Vibration works on actions (if device supports)
5. [ ] Add to Home Screen works

## Report Template

When done, copy this into `docs/buddy/reports/qa/manual-browser-qa-report.md`:

```md
# Manual Browser QA Report

**Date:** YYYY-MM-DD
**Browser:** Chrome/Firefox/Safari/Edge vXXX
**Device:** Desktop/Mobile

## Results
- Pass: XX/XX
- Fail: X/XX
- Blocking (P0): X
- Issues Found:
  1. ...
```

## Verification

After QA completes, run the automated gates one final time:
```powershell
npx vitest run
npx tsc --noEmit
npx next build
npx next lint
```