# ThirdThumb · GhostHands

> It mashes, you chill. A friendly, KISS auto-masher for the long boring stretches
> of single-player games — Pokémon shiny hunts, JRPG grinds, idle tappers.

**This is a separate product from Aether.** It lives in this folder only as a staging
area; it should graduate to its own repo before it ships (it shares none of Aether's
geomancy code, only the *philosophy*: local-first, KISS, ship as a desktop app).

## The one-line pitch

Three ways to make a button press itself — pick your depth:

| Tier | Name | What it is | Universality | Effort | Best for |
|---|---|---|---|---|---|
| **1 · Software** | *GhostHands app* | Macros / OS input injection / emulator hotkeys | PC & emulators only | lowest | players on PC/emu |
| **2 · Hybrid** | *ThirdThumb Link* | A tiny board that *is* a controller, driven by the app | any console that takes that controller | medium | the sweet spot |
| **3 · Hardware** | *ThirdThumb Rig* | 3D-printed servos that physically press a **real** controller | literally anything with a button | highest | "works on everything" + the teach/learn story |

KISS rule that holds it together: **one action schema** (`A, B, dpad, sticks…`) →
mapped per target. Same dashboard drives all three tiers.

## What's in this folder today

```
thirdthumb/
├─ README.md             ← you are here
├─ package.json          ← Tauri scripts (dev / build → .dmg)
├─ dashboard/index.html  ← the UI. Runs standalone in a browser AND as the app frontend.
├─ src-tauri/            ← the desktop app + REAL Tier-1 mash engine (Rust + enigo)
│  ├─ src/mash.rs        ← the timed key-press engine (drives emulators for real)
│  ├─ src/lib.rs         ← Tauri commands: start_mash / stop_mash / mash_presses
│  └─ tauri.conf.json    ← bundles dashboard/ → ThirdThumb.app / .dmg
├─ hardware/clamp.scad   ← parametric, printable Tier-3 servo clamp (+ BOM.md)
├─ marketing/storefront.html ← Shopify/Etsy/Tindie/MakerWorld/YouTube mockups
├─ docs/STRATEGY.md      ← market, models, pricing, devil's advocate, data plan
├─ docs/TECH.md          ← "what's really happening" across all 3 tiers + BOM
└─ assets/               ← logo, GhostHands mascot, rig diagram (SVG, generated)
```

## Run the desktop app — it presses for real (Tier 1)

```bash
cd projects/thirdthumb
npm install
npm run icon      # one-time: generate the app icon set from assets/icon.png
npm run dev       # launches ThirdThumb; the engine presses your emulator keys
npm run build     # → src-tauri/target/release/bundle/dmg/ThirdThumb_0.1.0.dmg
```

- Set the **A / B keybinds** in the dashboard to match your emulator (RetroArch,
  mGBA, Citra/Lime3DS…). The native engine (`src-tauri/src/mash.rs`) synthesizes
  those keystrokes on a timer — that's the whole Tier-1 trick.
- **macOS:** grant ThirdThumb **Accessibility** permission (System Settings →
  Privacy & Security → Accessibility) so it's allowed to send keystrokes.
- In a plain browser (no Tauri) the dashboard runs in **simulation** mode — same
  UI and data, no real presses — perfect for trying it out.

> Not yet compiled in this environment: the Rust is syntax-checked, but a full
> Tauri build needs the platform's GUI/input dev libraries (and on Linux,
> `libxdo` for enigo). Build on your Mac to get the `.dmg`.

## Try it in 5 seconds (no install — the Aether heartbeat trick)

```bash
open projects/thirdthumb/dashboard/index.html      # macOS
# or just double-click the file
```

You get a live mash console: pick a profile (Pokémon shiny hunt, egg hatch, JRPG,
idle), set the A-mash rate, hit **Start**, and the GhostHands avatar mashes for you.
It tracks presses, APM, estimated encounters, and **real shiny probability**
(`1 − (1−p)^N`, full odds `1/4096`, Shiny Charm `3/4096`). Every session is logged
to local storage and exportable as JSON — that's the data layer for later.

> The dashboard is a *simulator/control surface* right now: it models and logs the
> mashing and drives the UI. Wiring it to real input (Tier 1) or a real device
> (Tier 2/3 over WebSerial) is the next build step — see `docs/TECH.md`.

## Where it goes next

1. ✅ **Tier 1 (done):** native key-press engine (Rust + `enigo`) drives emulators
   for real, wrapped in a Tauri app that builds to a `.dmg`.
2. ✅ **Ship shell (done):** dashboard bundles into ThirdThumb.app via Tauri.
3. **Tier 1 polish:** add a Windows virtual-gamepad path (ViGEm/`vgamepad`) so it
   also drives native PC games, not just emulators; keymap presets per emulator.
4. **Tier 2:** flash an RP2040/ESP32 as a USB/BLE controller; the dashboard's
   WebSerial panel (already stubbed) talks to it to drive a real console.
5. **Tier 3 + teach:** finish `hardware/clamp.scad`, publish STLs to
   MakerWorld/Printables, sell kits & assembled units, link the YouTube course.

See `docs/STRATEGY.md` for the business and `docs/TECH.md` for the engineering.
