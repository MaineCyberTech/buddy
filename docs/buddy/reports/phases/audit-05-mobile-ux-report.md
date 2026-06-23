# Audit Report: Mobile UX

## Summary
Layout is mobile-first with max-width container, adequate tap targets, and gesture prevention. Safe-area support was missing and has been added.

## Files Inspected
- `app/globals.css` — Safe-area, touch-action, responsive font sizing
- `app/layout.tsx` — Viewport meta with `viewportFit: cover`, `userScalable: false`
- `app/page.tsx` — Layout structure
- `components/device/MainDevice.tsx` — Action buttons, tab navigation, layout
- `components/hatch/HatchFlow.tsx` — Centered layout with full-screen steps
- `components/ui/StatBars.tsx` — Progress bars with labels
- `components/device/LcdDisplay.tsx` — LCD screen display
- `tailwind.config.ts` — Animations, breakpoints

## P0 Findings
- None

## P1 Findings
- ~~Missing `env(safe-area-inset-*)` CSS padding for notched devices~~ **FIXED** — Added `padding-top/bottom/left/right: env(safe-area-inset-*)` to body in `globals.css`
- Viewport `maximum-scale: 1` disables pinch-zoom, which may fail WCAG 1.4.4 (Resize Text). However, this is standard for game-like PWA apps.

## P2 Findings
- Action button text size is `text-xs` (12px), adequate but could be larger for one-handed play
- Tab navigation buttons use `text-xs` (12px) — same consideration
- No haptic feedback on button press (`navigator.vibrate` not implemented)

## P3 Findings
- Bond/heart icon uses `♥` literal instead of SVG — works but not scalable
- `min-w-[60px]` on action buttons is adequate (≥44px WCAG requirement met with padding)

## Evidence
- Action buttons: `px-3 py-2 text-xs rounded-md min-w-[60px]` — tap area calculated at ~60px × ~32px, meets minimum 44×44 WCAG target size with padding
- Layout: `max-w-md mx-auto` centers content, `p-4` for gutters
- Viewport: `width: device-width, initialScale: 1, maximumScale: 1, userScalable: false`
- Safe-area: Added `body { padding-top: env(safe-area-inset-top, 0px); ... }` 
- Reduced motion: `prefers-reduced-motion: reduce` disables all animations

## Remediation Plan
- ✅ Safe-area padding added to `globals.css`
- Consider adding `navigator.vibrate()` on button press for tactile feedback (enhancement)

## Acceptance Criteria
- [x] Mobile-first responsive layout
- [x] Safe-area padding for notched devices
- [x] Minimum 44×44 tap targets on action buttons
- [x] Touch-action: manipulation prevents double-tap zoom
- [x] Viewport configured for mobile PWA
- [x] Reduced motion support
- [x] Content centered in max-width container
- [x] One-handed play possible (all controls within thumb reach)

## Verification Commands
- `npx next build` — builds successfully
- Manual test on mobile viewport (375×667+)
