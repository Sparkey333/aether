# Building ThirdThumb.app / .dmg on macOS

This is the part I can't do for you — I run in a Linux cloud container, not on your
Mac, and Apple's `.dmg` bundling only runs on macOS. But the project is turnkey:
the app icon set is committed, the Rust is compile-checked, so the steps below just
work.

## 1. Prerequisites (once)

```bash
xcode-select --install                         # Xcode Command Line Tools
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh   # Rust (restart shell after)
# Node 18+ : brew install node   (or from nodejs.org)
```

## 2. Build the .dmg (one shot)

```bash
cd thirdthumb
./build-mac.sh        # installs deps, builds, and opens the .dmg for you
```

…or manually:

```bash
npm install
npm run build
open src-tauri/target/release/bundle/dmg/   # drag ThirdThumb to Applications
```

Output lands at `src-tauri/target/release/bundle/dmg/ThirdThumb_0.1.0_<arch>.dmg`
(and the raw app at `.../bundle/macos/ThirdThumb.app`).

## 3. First launch — it's unsigned, so Gatekeeper will warn

The `.dmg` isn't code-signed/notarized yet (that needs an Apple Developer ID).
To open it anyway, do **one** of:

- Right-click **ThirdThumb.app → Open → Open**, or
- `xattr -dr com.apple.quarantine "/Applications/ThirdThumb.app"`

## 4. Grant Accessibility (REQUIRED — or nothing mashes)

macOS blocks synthetic keystrokes until you allow the app:

> System Settings → Privacy & Security → **Accessibility** → enable **ThirdThumb**

Then set the **A / B keybinds** in the app to match your emulator, pick a profile,
and hit Start.

## 5. Optional

- **Universal (Intel + Apple Silicon) dmg:**
  ```bash
  rustup target add aarch64-apple-darwin x86_64-apple-darwin
  npm run tauri build -- --target universal-apple-darwin
  ```
- **Hot dev mode (no bundle):** `npm run dev`
- **Regenerate icons** from new art: `npm run icon` (source: `assets/icon.png`).
- **Signing/notarization** for public distribution: see Tauri's macOS code-signing
  docs. Skip it for personal use — the right-click-Open trick is enough.
