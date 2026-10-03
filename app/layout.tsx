import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ServiceWorkerRegistration } from '@/components/ui/ServiceWorkerRegistration';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';

/**
 * Fonts are self-hosted at build time via next/font instead of loading from
 * fonts.googleapis.com at runtime. This removes the third-party request and
 * makes the typography available offline (API-P2-002).
 */
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Buddy - Your LCD Virtual Pet',
  description:
    'Hatch and care for your deterministic ASCII Buddy in this retro LCD-style virtual pet game.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Buddy',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full ${ibmPlexSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ServiceWorkerRegistration />
        <OfflineIndicator />
        <main id="main-content" className="flex-1 flex flex-col" role="main">
          {children}
        </main>
      </body>
    </html>
  );
}
