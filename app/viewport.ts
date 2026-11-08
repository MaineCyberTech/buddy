import type { Viewport } from 'next';

/**
 * Zoom must remain available for low-vision users (WCAG 1.4.4 / UX-P2-001).
 * Do not reintroduce maximumScale or userScalable: false.
 */
export const appViewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
