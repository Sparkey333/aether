import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

// Tests are pure logic (no R3F / GLSL), so they use a clean config without the app's vite plugins.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
