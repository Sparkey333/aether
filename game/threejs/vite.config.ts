import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';
import { fileURLToPath, URL } from 'node:url';

// The game shares game/shared/design-data with the Godot and Unity builds.
// We alias @shared to ../shared and allow Vite to read it from outside the app root.
export default defineConfig({
  base: './',
  plugins: [react(), glsl()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  server: {
    host: true,
    fs: {
      // allow importing the sibling game/shared design-data
      allow: [fileURLToPath(new URL('..', import.meta.url))],
    },
  },
});
