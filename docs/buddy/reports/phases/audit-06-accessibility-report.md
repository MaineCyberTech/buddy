# Audit Report: Accessibility

## Summary
App has good accessibility foundations: skip-link, focus-ring styles, semantic landmarks, ARIA labels on interactive elements, reduced-motion support, and high-contrast support. Hatch flow lacked live region announcements — fixed.

## Files Inspected
- `app/layout.tsx` — Skip-link, main landmark, lang attribute
- `app/page.tsx` — Boot screen announcement
- `app/globals.css` — Focus-ring, sr-only, skip-link, reduced-motion, high-contrast
- `components/hatch/HatchFlow.tsx` — Landing, hatching, reveal, nickname steps
- `components/device/MainDevice.tsx` — Action buttons, tabs, status area
- `components/device/LcdDisplay.tsx` — Role img, aria-label on Buddy display
- `components/ui/StatBars.tsx` — role="progressbar", aria-valuenow/min/max
- `components/ui/OfflineIndicator.tsx` — role="alert", aria-live="assertive"
- `components/ui/ServiceWorkerRegistration.tsx` — role="alert"

## P0 Findings
- None

## P1 Findings
- ~~Hatch flow hatching/reveal steps lacked `aria-live` or `role="status"` for screen reader announcements~~ **FIXED** — Added `role="status"` and `aria-live="polite"` to hatching and reveal steps
- ~~Hatch flow reveal step had no screen reader text for the species/rarity/shiny description~~ **FIXED** — Added `.sr-only` text: "A {rarity} {speciesName} was hatched"

## P2 Findings
- ASCII art in LcdDisplay uses `role="img"` with `aria-label` — correct pattern but alt text could be more descriptive (e.g., "ASCII art of Duck with crown hat")
- Hatch flow nickname input lacks associated label element (uses `aria-label` on input — acceptable)
- Emoji icons in action buttons have `aria-hidden="true"` — correct pattern
- Stat bars have `role="progressbar"` with `aria-valuenow/min/max` — correct
- Tab buttons use `button` elements (semantic) — correct

## P3 Findings
- Consider adding `aria-controls` to tab buttons linking to tab panels
- Consider adding `aria-selected` on active tab button
- No keyboard shortcut hints visible on screen
- No skip-to-actions link (only skip-to-content)

## Evidence
- `globals.css`: `.skip-link` — positioned off-screen until focused, `.focus-ring:focus-visible { outline: 2px solid #00ff88 }`
- `globals.css`: `@media (prefers-reduced-motion: reduce)` — disables all animations/transitions
- `globals.css`: `@media (prefers-contrast: high)` — overrides all LCD colors to black/white + pure accent
- `layout.tsx`: `<html lang="en">`, `<main id="main-content" role="main">`
- `layout.tsx`: `<a href="#main-content" class="skip-link">`
- `LcdDisplay.tsx`: `role="img" aria-label="{nickname} the {speciesName}"`
- `StatBars.tsx`: `role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}`
- `MainDevice.tsx`: `role="status" aria-live="polite"` on action messages
- `OfflineIndicator.tsx`: `role="alert" aria-live="assertive"`
- Keyboard: all interactive elements are `<button>` or `<input>`, natively focusable

## Remediation Plan
- ✅ Hatch flow live regions added
- ✅ Reveal screen reader description added
- Consider adding more descriptive alt text to LCD display for screen readers

## Acceptance Criteria
- [x] Skip-link present and functional
- [x] Focus-ring on all interactive elements
- [x] `role="main"` landmark
- [x] `lang="en"` on HTML
- [x] `prefers-reduced-motion` disables animations
- [x] `prefers-contrast: high` increases contrast
- [x] All buttons have accessible names
- [x] Stat bars have ARIA progressbar roles
- [x] LCD image has alt text via aria-label
- [x] Status messages have aria-live regions

## Verification Commands
- `npx next build` — builds successfully
- Manual: tab through all interactive elements, verify focus rings visible
- Manual: enable VoiceOver/NVDA, verify hatch flow announcements
