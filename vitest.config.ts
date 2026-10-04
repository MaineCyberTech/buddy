import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      // Measure the pure-logic layers that the unit suite is responsible for.
      include: ['lib/**/*.ts', 'data/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.d.ts'],
      // A baseline floor so test scope cannot silently shrink (TEST-P3-001).
      // Measured at introduction: 83.7% lines/statements, 82.8% branches, 71.4% functions.
      thresholds: {
        lines: 80,
        functions: 65,
        statements: 80,
        branches: 75,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});