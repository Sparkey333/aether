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
├─ README.md            ← you are here
├─ dashboard/index.html ← RUNNABLE now. Zero deps. The .dmg-able UI, KISS form.
├─ docs/STRATEGY.md     ← business: market, models, pricing, devil's advocate, data plan
├─ docs/TECH.md         ← "what's really happening in the code" across all 3 tiers + BOM
└─ assets/              ← logo, GhostHands mascot, rig diagram (SVG, generated)
```

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

1. **Tier 1**: wire the engine to a virtual gamepad (ViGEm/`vgamepad` on Win,
   `CGEvent` on macOS, `uinput`/`evdev` on Linux) so it drives PC games & emulators.
2. **Tier 2**: flash an RP2040/ESP32 as a USB/BLE controller; dashboard talks to it
   over **WebSerial** (works straight from the browser *and* the Tauri build).
3. **Ship**: wrap this exact HTML in **Tauri** → `.dmg` on Mac (you already have the
   muscle memory from Aether), Windows/Linux for free.
4. **Hardware + teach**: publish STLs to MakerWorld/Printables, sell kits & assembled
   units, link the YouTube build course.

See `docs/STRATEGY.md` for the business and `docs/TECH.md` for the engineering.
