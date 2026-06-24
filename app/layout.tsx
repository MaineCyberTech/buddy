import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegistration } from '@/components/ui/ServiceWorkerRegistration';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';

export const metadata: Metadata = {
  title: 'Buddy - Your LCD Virtual Pet',
  description: 'Hatch and care for your deterministic ASCII Buddy in this retro LCD-style virtual pet game.',
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
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
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