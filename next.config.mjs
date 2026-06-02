/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // deck.gl ships modern ESM; let Next transpile it cleanly.
  transpilePackages: ["@deck.gl/core", "@deck.gl/layers", "@deck.gl/mapbox"],
  // The native (Tauri) build is a static export that Tauri serves from ../out.
  // Web dev (`npm run dev`) and the web build stay server-rendered as usual.
  ...(process.env.TAURI_BUILD
    ? { output: "export", images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
