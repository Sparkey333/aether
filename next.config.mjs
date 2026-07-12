/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // deck.gl ships modern ESM; let Next transpile it cleanly.
  transpilePackages: ["@deck.gl/core", "@deck.gl/layers", "@deck.gl/mapbox"],
  // API route handlers live in `route.api.ts` files. The "api.ts" extension is
  // registered only for the web build — the Tauri static export can't run a
  // server, so there they simply don't exist and the Vault UI falls back to
  // its local-only paths.
  pageExtensions: process.env.TAURI_BUILD ? ["tsx", "ts"] : ["api.ts", "tsx", "ts"],
  // The native (Tauri) build is a static export that Tauri serves from ../out.
  // Web dev (`npm run dev`) and the web build stay server-rendered as usual.
  ...(process.env.TAURI_BUILD
    ? { output: "export", images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
