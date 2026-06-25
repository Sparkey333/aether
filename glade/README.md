# 🌱 GLADE

> *A quiet garden, and one small life that grows into whoever you help it become.*

A spiritual successor to the **Chao Garden** of *Sonic Adventure 2: Battle* and the **Tiny
Chao Garden** of the GBA *Sonic Advance* games — but it takes the part that was once a side
mode (the creature you raised, the garden you raised it in) and makes it the **whole game**.
Calm, slow, safe. Nothing here can hurt you. The thing you love will remember you.

This folder is a **separate game** living inside the `aether` repo. It does not touch the
Aether app.

## Play it

It's a single self-contained file — no build, no install, works offline.

```bash
# just open it
open glade/index.html            # macOS
xdg-open glade/index.html        # Linux
# or serve it (any static server)
npx serve glade                  # then visit the printed URL
```

Then **"step into the glade."**

### How to play

- **Warm the seed** — tap your seed-egg a few times; it stirs, then hatches.
- **Pet** — tap your Bloomling. Its mood lifts, the **Mote** above its head brightens, and it
  remembers. The Mote is its whole face: color = its nature (Solar/Lunar/Verdant), shape =
  its mood.
- **Feed essences** — pick one from the basket and tap your Bloomling. Sunfruit and Emberbloom
  pull it toward the **Solar** sun; Moonberry and Dewlight toward the **Lunar** moon;
  Greenleaf and Deeproot keep it **Verdant**. *What* and *when* you feed shapes its stats, its
  alignment, and — visibly — its **body**: it grows petals, horns, wings, fins, a tail. No two
  are alike.
- **Name** and **call** it with the buttons.
- **Tend the garden** — if a purple **blight** appears, tap it to clear it. The garden blooms
  more the more you care for it.
- **The Returning** — when your Bloomling grows old and well-loved, a glowing *"the Returning"*
  button appears. Let it cocoon, and it is reborn — carrying its name, a deeper soul, and a
  faint echo of its old body into the next life. Stay devoted and balanced across lives to
  reach the secret, ageless **Everbloom**.

### Little joys (the 90s-kid stuff)

Every step is meant to feel good, even the waiting:

- **Dewdrops** ✦ drift through the glade — tap them to gather (the ring-collecting homage).
  Petting, tending, and the Returning all shower you with more.
- **Floating "+♥" pops**, sparkle bursts, confetti on every milestone, **stat level-up
  fanfares**, a startup jingle, and a soft screen-bounce when something big happens.
- The **egg cracks and wobbles** as it readies to hatch; **"✓ saved"** sprouts in the corner.
- **`sound`** toggles the synthesized ambient bed + chimes; **`cozy CRT`** adds an optional
  warm scanline-and-vignette glow for that old-tube-TV feeling.

Everything is **saved to your device**, and it keeps growing while you're away — come back to
a creature that aged and missed you, with a few dewdrops waiting.

## What's here

| File | What it is |
|---|---|
| [`index.html`](./index.html) | The playable prototype (one self-contained file — open it directly) |
| [`DESIGN.md`](./DESIGN.md) | The full Game Design Document + the build spec |
| [`src-tauri/`](./src-tauri) | The Tauri desktop-app shell (Rust + config + icons) |
| [`scripts/`](./scripts) | `make-icons.mjs` (icon generator), `stage-web.mjs`, `build-dmg.sh` |
| `package.json` | The app toolchain + build scripts |

## Get it as a Mac app (.dmg)

GLADE ships as a tiny native desktop app via **Tauri**. The shell, icons, config, and build
scripts all live here — nothing else to wire up.

> **Heads-up:** a macOS `.dmg` can only be *baked on macOS* (it uses Apple's tooling and can't
> be cross-built from Linux). So there are two ways to get one:

**A) On your Mac — one command.** Needs [Rust](https://rustup.rs) + Node 18+.

```bash
cd glade
./scripts/build-dmg.sh     # installs deps, builds, and drops the .dmg in ~/Downloads
```

**B) From anywhere — build it on a cloud Mac.** Trigger the **“GLADE macOS dmg”** GitHub
Action (repo → *Actions* → *Run workflow*, or push a `glade-v*` tag). It builds on a macOS
runner; download the finished `.dmg` from the run’s **Artifacts**.

Either way you get `GLADE.app` inside a drag-to-Applications `.dmg`. Regenerate the icon any
time with `npm run icons`.

> It isn’t code-signed/notarized yet, so on first launch use **right-click → Open** (or System
> Settings → Privacy & Security → *Open Anyway*). Add an Apple Developer ID to remove that step.

## Status

**v0.1 — playable prototype, now with full game-feel + desktop packaging.** Implemented: the
Mote, the care loop (pet/feed/name/call), procedural essence-driven evolution, Solar/Lunar/
Verdant alignment, a day/night garden that blooms as you tend it, a gentle blight-tending
beat, offline persistence with wall-clock catch-up, the Returning, the Everbloom, synthesized
ambient audio + fanfares, collectible dewdrops, floating pops/confetti/level-ups, a cozy-CRT
mode, and a one-command **Tauri macOS `.dmg`** build (+ cloud-Mac CI).

**Next:** *Pocket Glade* (the portable companion layer — the thing the GBA link made magic),
multi-zone navigation, the secrets/Almanac layer, and seasons. See [`DESIGN.md`](./DESIGN.md).

*Original IP — no Sega assets or trademarks are used.*
