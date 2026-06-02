/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // deck.gl ships modern ESM; let Next transpile it cleanly.
  transpilePackages: ["@deck.gl/core", "@deck.gl/layers", "@deck.gl/mapbox"],
  // For the Tauri (Mac/iOS) shell, switch to a static export:
  //   output: "export", images: { unoptimized: true }
};

export default nextConfig;
