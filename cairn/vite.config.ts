import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config tuned for Tauri: fixed dev port, no clobbering the Tauri CLI's
// terminal, and source maps in debug builds.
export default defineConfig(async () => ({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: false,
    watch: {
      // src-tauri is watched by the Tauri CLI, not Vite.
      ignored: ["**/src-tauri/**", "**/crates/**"],
    },
  },
}));
