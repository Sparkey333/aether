#!/usr/bin/env bash
# Build ThirdThumb.app + .dmg on macOS, then open the .dmg.
# Run from the project root:  ./build-mac.sh
set -euo pipefail
cd "$(dirname "$0")"

if [[ "$(uname)" != "Darwin" ]]; then
  echo "⚠  This builds a macOS .dmg and must run on a Mac. (You're on $(uname).)"
  exit 1
fi
command -v cargo >/dev/null || { echo "Install Rust first: https://rustup.rs"; exit 1; }
command -v npm   >/dev/null || { echo "Install Node first: https://nodejs.org"; exit 1; }

echo "▶ Installing JS deps…"
npm install

echo "▶ Building the app + .dmg (first build compiles Rust — a few minutes)…"
npm run build

DMG="$(ls -t src-tauri/target/release/bundle/dmg/*.dmg 2>/dev/null | head -1 || true)"
if [[ -n "${DMG}" ]]; then
  echo "✅ Built: ${DMG}"
  echo "▶ Opening it…"
  open "${DMG}"
  echo
  echo "Next: drag ThirdThumb to Applications, then —"
  echo "  • First launch: right-click ThirdThumb.app → Open → Open (it's unsigned)."
  echo "  • Allow it under System Settings → Privacy & Security → Accessibility."
else
  echo "❌ No .dmg found — check the build output above."
  exit 1
fi
