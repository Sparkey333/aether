#!/usr/bin/env bash
# Build the GLADE macOS .dmg and drop it in ~/Downloads. Run this ON A MAC.
set -euo pipefail

cd "$(dirname "$0")/.."   # -> glade/

if [[ "$(uname)" != "Darwin" ]]; then
  echo "✗ A Tauri .dmg can only be built on macOS. You're on $(uname)."
  echo "  (From any machine you can instead trigger the 'GLADE macOS dmg' GitHub Action"
  echo "   and download the .dmg artifact — see glade/README.md.)"
  exit 1
fi

command -v cargo >/dev/null 2>&1 || { echo "✗ Rust not found. Install: https://rustup.rs"; exit 1; }
command -v node  >/dev/null 2>&1 || { echo "✗ Node not found. Install Node 18+ first."; exit 1; }

echo "→ installing the GLADE app toolchain (first run only)…"
npm install

echo "→ building the macOS app + .dmg (compiles native code; a few minutes the first time)…"
npm run build:dmg

DMG="$(find src-tauri/target/release/bundle/dmg -name '*.dmg' 2>/dev/null | head -1)"
if [[ -z "${DMG:-}" ]]; then echo "✗ No .dmg was produced — check the build output above."; exit 1; fi

DEST="$HOME/Downloads/$(basename "$DMG")"
cp "$DMG" "$DEST"
echo "✓ done → $DEST"
open "$HOME/Downloads" >/dev/null 2>&1 || true
