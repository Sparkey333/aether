import { defineConfig } from 'vite';

// Tauri expects a fixed dev port; strictPort makes failures loud.
export default defineConfig({
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    target: 'es2021',
    sourcemap: false,
  },
});
