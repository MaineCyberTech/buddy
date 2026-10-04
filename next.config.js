const { execSync } = require('child_process');

/**
 * Resolve a build id that is stable for a given commit and changes on every
 * deploy. It is exposed to the client (OBS-P3-001) and quoted into the service
 * worker registration so the offline cache name changes per build (ARCH-P2-001).
 */
function resolveBuildId() {
  if (process.env.NEXT_PUBLIC_BUILD_ID) return process.env.NEXT_PUBLIC_BUILD_ID;
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 12);
  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
}

const buildId = resolveBuildId();
const isDev = process.env.NODE_ENV !== 'production';

// Fonts are self-hosted via next/font, so the policy can stay same-origin
// (SEC-P2-002, API-P2-002). 'unsafe-inline' is required by Next.js for the
// inlined runtime bootstrap; 'unsafe-eval' is only allowed during development.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws:' : ''}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  generateBuildId: () => buildId,
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Ensure the browser revalidates the worker script on navigation.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
