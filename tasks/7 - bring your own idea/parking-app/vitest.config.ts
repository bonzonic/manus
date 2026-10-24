import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    globals: false,
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    passWithNoTests: false,
    clearMocks: true,
    restoreMocks: true
  }
});
