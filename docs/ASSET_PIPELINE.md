# Aether Fight — Digital Asset Pipeline

This is the art pipeline for turning the [Martial Codex](martial-codex/README.md) into a game. It ships **two layers**:

1. **Vector starter assets** that work *right now, with no API keys* — live in [`public/assets/`](../public/assets/) (belts, provenance badges, weapons, avatars, a gi, location backdrops). Open [`public/assets/gallery.html`](../public/assets/gallery.html) in any browser to see them.
2. **An AI generation pipeline** ([`scripts/generate-assets.mjs`](../scripts/generate-assets.mjs)) driven by [`public/assets/manifest.json`](../public/assets/manifest.json) — plug in your **Gemini** key (or others) and render avatars, gis, dojos, locations, weapons, and animation specs at scale.

## Quickstart

```bash
# 1. See exactly what would be generated — needs NO key:
npm run assets:plan

# 2. Add a key (Gemini is the recommended primary):
cp .env.assets.example .env.assets        # then paste your GEMINI_API_KEY
set -a && . ./.env.assets && set +a

# 3. Render. Output lands in public/assets/generated/<category>/
npm run assets:generate                   # everything
npm run assets:generate -- --only weapons # one category
npm run assets:generate -- --id katana    # one asset
npm run assets:generate -- --provider openai   # force a provider
```

The script **never calls anything without a matching key** — no key → it just prints the plan. Keys are read from the environment; `.env.assets` is gitignored, and so is `public/assets/generated/` (render binaries locally, keep the vector starters in git).

To expand: add items to `manifest.json` (each is `{ id, prompt, linkedStyle? }`). Prompts inherit the global `artDirection` so the whole set stays cohesive. The `linkedStyle` field references a name in [`src/data/martial-arts.seed.json`](../src/data/martial-arts.seed.json), so you can script "one avatar per top-ranked style."

## Recommended AI services (what to use for what)

You said you'd wire **Gemini + the top others** — here's the opinionated map. ✅ = has a real API you can key in.

| Asset | Primary pick | Why | Strong alternatives |
|---|---|---|---|
| **Avatars / fighters** | ✅ **Gemini 2.5 Flash Image** ("Nano Banana") | best character **consistency** + conversational editing ("same fighter, now throwing a kick") | ✅ Imagen 4 · ✅ Flux 1.1 Pro (Replicate/fal) · ✅ **Scenario.gg** (game-trained, style-locked) · ✅ Leonardo.ai · Midjourney (no API) |
| **Gis / uniforms / textures** | ✅ Flux / SDXL (Replicate, fal) | tileable materials, fabric control | ✅ **Recraft** (transparent PNG **+ true SVG**) · Scenario |
| **Dojos / locations (flat)** | ✅ Imagen 4 / Flux | environment art | Gemini for edits |
| **VR dojos (360°)** | ✅ **Blockade Labs — Skybox AI** | one-shot **360° panoramas** you can stand inside | — |
| **Weapons / props (transparent)** | ✅ **Recraft** | clean cutouts + vector export | ✅ Gemini · Flux + bg-removal |
| **2D animation loops** | ✅ **Runway Gen-4** / ✅ **Luma Dream Machine** / ✅ **Kling** | image→video: turn a still into an idle/attack loop | Pika; AnimateDiff (local) |
| **Sprite sheets (2D game)** | ✅ **Scenario.gg** / ✅ **PixelLab** | consistent multi-frame sheets | Retro Diffusion |
| **3D models (props → chars)** | ✅ **Meshy.ai** / ✅ **Tripo3D** / ✅ **Rodin** | image→3D, game-ready meshes | Luma Genie |
| **Rig + fight animation (3D)** | **Adobe Mixamo** (free auto-rig + anim library) + **Cascadeur** (physics action) | real martial-arts motion | ✅ **DeepMotion / Plask / Rokoko** — *video→3D mocap: film a real technique, get an animation* |
| **SFX / announcer VO** | ✅ **ElevenLabs** | impacts, crowd, "FIGHT!" | — |

> **Highest-leverage tip for a *martial-arts* game specifically:** the **video-to-3D mocap** tools (DeepMotion / Plask / Rokoko) let you film a real jab, ginga, or armbar on your phone and get a usable animation — far better fidelity than text-to-motion. Pair with **Mixamo** for free rigging. That's the path from "static avatars" to "fighters that actually move."

### Wiring a new provider
`generate-assets.mjs` has a small `IMAGE_PROVIDERS` map (`gemini`, `openai`, `replicate` are implemented). Add a function `genFoo(prompt, {aspect,size,transparent})` returning `{buf, ext}`, register it, and add its key to `.env.assets.example`. The video/3D services are async-poll APIs — wire them the same way (the manifest already flags `animations` as `type: "video"`).

### Already-connected option (no keys needed)
This workspace also has **Adobe Firefly** and **Canva** generation tools connected via MCP. If you'd rather, I can generate a handful of concept pieces through those directly — say the word and I'll render, e.g., a hero dojo or a couple of fighter concepts to seed the style.

---

## Building the Mac app + `.dmg`

The Tauri bundle is **already configured to emit a `.dmg`** (`src-tauri/tauri.conf.json` → `bundle.targets: ["app", "dmg"]`). I can't build it from this Linux cloud container (a macOS `.dmg` needs macOS + `hdiutil` + the Apple toolchain), but on **your Mac** it's one command:

```bash
# prerequisites (once):
xcode-select --install                                   # Apple command-line tools
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh   # Rust toolchain

# then, from the repo root:
git pull
npm install
npm run tauri:build
```

The signed-for-local disk image lands at:

```
src-tauri/target/release/bundle/dmg/Aether_0.1.0_aarch64.dmg     # Apple Silicon
# (…_x64.dmg on Intel)
```

Double-click it to open and drag **Aether** into Applications. The `public/assets/` you see in the gallery are bundled into the app automatically (Next exports `public/` → `out/` → Tauri packs it).

> For **distribution** (sending it to other people without Gatekeeper warnings) you'll later want an Apple Developer ID to sign + notarize — not needed to run it yourself.
