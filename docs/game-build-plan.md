# AETHER: THE SUNDERED NEXUS — Three-Engine Build Plan Synthesis
### Technical-lead synthesis across Three.js/R3F, Godot 4, and Unity 6 · v1.0 · 2026-06-24

This synthesizes the three maxed-out engine architectures into one build plan. The thesis: **the design-data JSON is the product; the three engines are interchangeable renderers of it.** Comparability is the whole point, so every decision below protects the shared contract (`game/shared/design-data/`) and the determinism rules in bible §2.14. The existing Next.js 15 + Tauri 2 Atlas app at the repo root stays untouched — game code lives entirely under a new `game/` tree.

---

## 1. COMPARISON MATRIX

Honest tradeoffs. The single most important environmental fact dominates everything: **this is a headless Linux box with no desktop, no Unity, no Godot editor, no .NET.** Only the Three.js build can be authored *and iterated live* here; the other two are scaffolded blind and handed to the user to run on their own machine.

| Dimension | Three.js / R3F | Godot 4.3 (GDScript) | Unity 6 (URP) |
|---|---|---|---|
| **Setup effort (in THIS env)** | **Lowest.** `npm install` + `vite dev` runs now. No external editor. | **Deferred.** Scaffold the project blind; user installs Godot 4.3 standard build, enables a plugin, runs one menu item. No build step, no toolchain. | **Highest.** Scaffold blind; user installs Unity 6 LTS + Hub, waits for UPM resolve (minutes), confirms Input-System toggle (editor restart), runs bootstrap menu. IL2CPP for ship needs platform modules. |
| **Live iteration HERE (headless)** | **Yes — uniquely.** Vite dev server + HMR for code/GLSL/JSON; drive headless Chromium via Playwright; screenshot any frame deterministically. The only build we can *see* and *verify* in this environment. | **No.** Editor is GUI-only. Can run `godot --headless --script` for pure-logic unit tests (PRNG, frame math) in CI, but cannot author scenes or view the game here. | **No.** Editor is GUI-only. Can run batchmode tests headlessly in CI, but no authoring/viewing here. Heaviest to drive. |
| **Fidelity ceiling for N64-charm target** | **Exactly on-target, arguably the most authentic.** Vertex snap + affine warp belong in a hand-written vertex shader; WebGL gives full control; the look IS the platform's native idiom. Ceiling is *deliberately low* and that's correct. | **On-target.** `SubViewport` low-res + `.gdshader` vertex snap/affine + posterize/dither. Mature retro-shader ecosystem. Slightly easier flat/vertex-lit setup than Unity. | **On-target but most fighting the engine.** URP is built for *high* fidelity; you actively disable PBR, linear color, AA, perspective-correct UVs. Achievable (hand-written HLSL `LitRetro.shader`), but you're swimming upstream against the renderer's defaults. |
| **Physics** | Rapier (WASM) — **custom kinematic character controller** (NOT ecctrl); analytic capsule hitboxes from data. Deterministic by hand. | Built-in `CharacterBody3D` + `move_and_slide`; `NavigationAgent3D`; `Area3D` sensors but **logical capsule overlap from data** for hits. Solid, integrated. | Built-in `CharacterController` (NOT Rigidbody); `OverlapCapsuleNonAlloc` for data-driven hits; `NavMeshAgent` desired-velocity only. Mature, Burst-stable. |
| **Animation** | R3F `useAnimations` / manual; combat is frame-table-driven, not animation-driven (animation is cosmetic). | `AnimationTree` state machine with method-call tracks — **best-in-class** for firing hitboxes on exact frames. | `Animator` / state machine; good, but combat truth lives in code, not Mecanim. |
| **Gamepad** | Browser Gamepad API (manual polling + buffer). Works, lowest-level. | Godot input map (gamepad + KBM first-class), `Input.get_vector`. Clean. | **Input System package** — strongest of the three: one `.inputactions` asset, both schemes, rebinding built-in. |
| **Asset ecosystem** | glTF-native (`useGLTF`); npm. No DCC needed — primitives in-engine. Smallest runtime. | glTF/`.glb` import; AssetLib; `@tool` procedural geometry. | Largest ecosystem (Asset Store), glTF via package; but heaviest project. Overkill for placeholder primitives. |
| **Packaging: Web** | **Native.** `vite build` → static bundle, shareable URL, zero server deps. | Web export (WASM) possible but heavier download; not the strength. | WebGL export exists but large/slow; not recommended for the slice. |
| **Packaging: Desktop** | Via existing **Tauri** shell (second window) — no new toolchain. | Godot one-click export (Win/Mac/Linux), tiny, no toolchain. **Best desktop story.** | Standalone IL2CPP (Win/Mac/Linux) — robust but heaviest build. |
| **Packaging: Mobile** | Through Tauri iOS (already in repo `package.json`) — but a 320×240 action game on touch is awkward. | Godot Android/iOS export — solid. | Unity mobile — industry standard, strongest, but heaviest. |
| **Overall suitability for THIS project** | **Best fit for the slice and this environment.** Live-iterable, web-native, deterministic-by-construction, ships in the existing Tauri shell, machine-verifiable headless. | **Best "press Play" desktop deliverable.** Cleanest hand-off (no toolchain), strong AnimationTree, tiny exports. The pragmatic second build. | **Most powerful, least convenient.** Justified only as the "could-this-be-a-real-shipping-game" reference. Heaviest setup, fights the retro look, can't iterate here. |

**Bottom line:** Three.js wins on *iteration and verifiability in this environment*; Godot wins on *clean hand-off and desktop packaging*; Unity wins on *raw ceiling and tooling depth* but loses on *convenience and aesthetic alignment*. None is "wrong" — they're three honest points on a convenience-vs-power curve, and the shared JSON makes the comparison fair.

---

## 2. RECOMMENDED COEXISTING REPO LAYOUT

The existing root (`src/`, `src-tauri/`, `content/`, `docs/`, `next.config.mjs`, `package.json`, root `.gitignore`) is **never touched**. Everything new lives under `game/`. Each engine gets its own isolated project so its dependency graph, gitignore, and build never contaminate the Atlas app's fast `next build` / `tsc --noEmit`.

```
/home/user/aether/
├── src/                          # Atlas app (Next.js 15 / React 19) — UNTOUCHED
├── src-tauri/                    # Tauri 2 — UNTOUCHED except ONE optional "play" window block
├── content/  docs/  scripts/     # UNTOUCHED
├── next.config.mjs  package.json  package-lock.json  tsconfig.json  README.md
├── .gitignore                    # root — APPEND a small game section (see §2.1)
│
└── game/                         # ← ALL game code lives here
    ├── README.md                 # "this is the game; the root is the Atlas" (see §2.2)
    │
    ├── shared/                   # THE CROSS-ENGINE CONTRACT — all three engines read this
    │   ├── design-data/          # bible §5 — single source of truth
    │   │   ├── combat.json
    │   │   ├── moves/moves.json
    │   │   ├── bosses/bosses.json
    │   │   ├── enemies/enemies.json
    │   │   ├── weapons/weapons.json
    │   │   └── schema/*.schema.json     # JSON Schema — CI validates all three builds against these
    │   └── assets/               # engine-neutral placeholders (see §4)
    │       ├── models/           # *.glb (low-poly primitives, optional — most geo is in-engine)
    │       ├── textures/         # *.png ≤128², ≤256-color indexed, point-sample
    │       ├── audio/            # *.ogg/*.wav SFX + music stems
    │       └── fonts/            # the 8×8 pixel font (shared HUD typeface)
    │
    ├── threejs/                  # Build #1 — Vite + R3F sub-app (own package.json)
    │   ├── package.json  vite.config.ts  index.html  tsconfig.json
    │   ├── public/               # build-time copy/symlink of shared/assets
    │   ├── src/{engine,combat,actors,ai,render,world,input,hud,audio,state,data}/
    │   ├── e2e/                  # Playwright headless verification
    │   └── DEVIATIONS.md         # bible Appendix A.7 — required
    │
    ├── godot/                    # Build #2 — Godot 4.3 project (open THIS folder)
    │   ├── project.godot
    │   ├── addons/aether_bootstrap/     # @tool plugin: generates greybox scenes
    │   ├── autoload/  resources/  data/  scenes/  scenes_generated/  scripts/  shaders/
    │   ├── README_GODOT.md
    │   └── DEVIATIONS.md
    │
    └── unity/                    # Build #3 — Unity 6 project root
        ├── .gitignore           # Unity-specific (Library/, etc.) — lives INSIDE game/unity/
        ├── Packages/manifest.json  Packages/packages-lock.json
        ├── ProjectSettings/*.asset
        ├── Assets/Aether/{Runtime,Editor,Data,Settings,Shaders,Art}/
        ├── Assets/StreamingAssets/design-data/    # build-time copy of shared (gitignored)
        ├── README-UNITY.md
        └── DEVIATIONS.md
```

**Key structural decisions:**
- **`game/shared/` is the contract.** All three engines load `game/shared/design-data/*.json`. The folder sits as a sibling to each engine project so relative reads work (`../shared/...` from Godot, a copy step into `StreamingAssets`/`public` for Unity/Three.js exports).
- **Each engine is a self-contained project** — its own dependency manifest, its own gitignore concern, its own README and `DEVIATIONS.md`. No engine can break another's build or the Atlas app.
- **The tier colors** (`#50c8ff`/`#78e6a0`/`#ebbe5a`/`#e66e8c` from `src/lib/tiers.ts`) are a frozen contract each engine *mirrors* (a ~30-line constant), not imports — TS can't be consumed by GDScript/C#, and cross-build `tsconfig paths` aren't worth it. A CI check asserts all four copies match `src/lib/tiers.ts`.

### 2.1 `.gitignore` additions

**Root `/home/user/aether/.gitignore` — APPEND** (the existing Next/Tauri rules stay; these handle the Three.js sub-app and any build-time asset copies, since the root gitignore already covers `/node_modules` only at root, not nested):

```gitignore
# ── game: three.js sub-app ──
game/threejs/node_modules/
game/threejs/dist/
game/threejs/.vite/
game/threejs/test-results/
game/threejs/playwright-report/

# ── game: build-time shared-asset copies (derived; source is game/shared) ──
game/threejs/public/design-data/
game/threejs/public/assets/
game/unity/Assets/StreamingAssets/design-data/
game/godot/data/design-data/          # res:// export copy; source is game/shared

# ── godot ──
game/godot/.godot/
game/godot/.import/
game/godot/export_presets.cfg
game/godot/*.tmp
```

**`game/unity/.gitignore` — NEW file inside the Unity project** (kept local so it never fights the root gitignore; Unity-standard):

```gitignore
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/  [Bb]uilds/
[Ll]ogs/
[Uu]ser[Ss]ettings/
[Mm]emoryCaptures/
.vs/  .idea/  .gradle/
*.csproj  *.sln  *.user  *.unityproj  *.booproj
*.pidb  *.suo  *.tmp  *.apk  *.aab  *.unitypackage  *.app
/[Aa]ssets/[Ss]treamingAssets/design-data/    # derived copy of game/shared
sysinfo.txt
```
> Unity rule: commit `Assets/**` **including every `.meta`**, plus `Packages/manifest.json`, `Packages/packages-lock.json`, `ProjectSettings/**`. Never commit `Library/`.

**Godot** ignores are folded into the root append above (`.godot/`, `.import/`, `export_presets.cfg`). Godot 4.3 keeps its import cache in `.godot/` — ignoring it is mandatory (it's machine-local and huge).

### 2.2 Root README / docs updates

The repo's identity is currently "Aether — a geomancy engine… ships as a Mac/iOS app" (per `package.json`). Adding a game needs the repo to explain **two products in one monorepo**:

- **Root `README.md`** — add a short "Repository contents" section near the top: *"This repo holds two things: (1) **Aether Atlas** — the geomancy engine / Next.js + Tauri app (`src/`, `src-tauri/`, `content/`); (2) **Aether: The Sundered Nexus** — a boss-fighter game built three ways for engine comparison (`game/`). The game reuses the Atlas's lore and four-tier provenance vocabulary but is otherwise independent. The Atlas app is unaffected by anything under `game/`."*
- **`game/README.md`** (new) — the game's front door: the bible summary, the three-engine premise, the shared-data contract, and "which build to run where" (Three.js = web/this-env, Godot/Unity = your desktop).
- **`docs/`** — add `docs/game-bible.md` (the design bible) and `docs/game-build-plan.md` (this synthesis) so the design contract lives beside the existing Atlas docs. Each engine keeps its own `README_*` for run instructions and a `DEVIATIONS.md` for logged retunes (bible Appendix A.7).
- **`package.json`** root — optionally add pass-through scripts (`"game:web": "npm --prefix game/threejs run dev"`) for convenience, but **do not** add game dependencies to the root manifest — isolation is the point.

---

## 3. RECOMMENDED BUILD ORDER

**Build Three.js first, Godot second, Unity third.** Rationale below, then what "maxing out" means per tool.

### Why this order

1. **Three.js FIRST — it is the only build that runs live in this environment.** This is decisive. We can `vite dev`, hot-reload code/shaders/JSON, drive headless Chromium, and screenshot/diff any frame *right now*. That means Three.js is where we:
   - **Author and prove the `game/shared/design-data/` JSON** against the schemas. Every number in the bible gets exercised in a real running game before either other engine touches it. The JSON stops being a spec and becomes a *tested* contract.
   - **Validate the determinism harness** (seeded xorshift `0x41455448`, fixed 60 Hz step, 6-frame buffer, replay) end-to-end, producing the golden boss-kill telemetry line `{boss, timeSec, flowGrade, deaths, flaskUsed}` that the other two engines must reproduce.
   - **Lock the retro aesthetic reference frames** (320×240, snap, affine, dither, fog) that Godot and Unity visually diff against.
   So Three.js isn't just "first playable" — it's the build that *defines the reference* the other two are measured against. Fastest feedback **and** it produces the comparison baseline.

2. **Godot SECOND — cleanest hand-off, validates the data layer in a second runtime.** Once the JSON is proven, Godot is the lowest-friction way to confirm the contract is genuinely engine-agnostic: no toolchain, no build step, `@tool` generates the greybox world, user presses Play. Its `AnimationTree` makes frame-exact hitbox firing pleasant, and its one-click desktop export gives the first *native* (non-web) build for comparison. If the data port to Godot reveals an ambiguity in a schema, we fix it in `shared/` *before* paying Unity's heavier setup cost.

3. **Unity THIRD — highest cost, highest ceiling, do it last when the contract is hardened.** Unity's setup is the most expensive (UPM resolve, Input-System restart, IL2CPP modules) and it fights the retro look the hardest. There's no reason to pay that cost until the design-data and determinism contract have survived two independent implementations. By the time Unity starts, `shared/` is frozen and battle-tested, so Unity is a pure implementation exercise with no contract churn — the most efficient sequencing.

> Dependency note: all three depend on `game/shared/design-data/` + `schema/`, so **Milestone M0 of Three.js (scaffold + author + validate the shared JSON) is effectively shared infrastructure for the whole program.** Do it once, well, in the live-iterable engine.

### What "maxing out per tool" concretely means

The shared rule: **maxing out means leaning into each engine's native idioms to hit the bible's bar, NOT adding scope.** Same slice, same numbers, same content — three honest expressions.

- **Three.js / R3F — max = web-native, live-iterable, machine-verifiable, deterministic-by-construction.**
  - Hand-written GLSL vertex-snap + affine + vertex-lighting (`psx_world.vert.glsl`) in a 320×240 `WebGLRenderTarget` → nearest upscale → posterize/dither/fog post chain. The look done *right*, in the stage where it has to be done.
  - Fixed-step accumulator loop (`GameLoop.ts`) with replay recording → bit-identical regression of full boss fights; `?frame=N&replay=run.json` screenshot harness for headless verification.
  - Custom kinematic Rapier character controller (not ecctrl) for frame-exact, deterministic motion.
  - Ships as a shareable static URL **and** a Tauri window with zero CSP changes (the existing CSP already permits WASM/workers/blobs).
  - Live JSON/shader/leva tuning during balance work.

- **Godot 4.3 (GDScript) — max = zero-toolchain "press Play" deliverable with procedural authoring.**
  - Pure-GDScript so the user needs only the standard editor (no Mono/.NET/dotnet).
  - `@tool` `EditorPlugin` that *generates the greybox world* (`scene_factory`/`greybox_factory`) from primitives + bakes NavMesh — the headless env can't open the editor, so the user runs one menu item and gets a playable slice.
  - `SubViewport` retro pipeline + four `.gdshader` files; `AnimationTree` method-call tracks firing hitboxes on exact frames; one hand-rolled hierarchical state machine (`ai_brain.gd` + `boss_director.gd`) reused for enemies, mini-boss, and main boss (no plugin dependency).
  - One-click tiny desktop exports; `godot --headless --script` unit tests for the determinism contract in CI.

- **Unity 6 (URP) — max = the "real shipping game" reference with the deepest tooling.**
  - Hand-written HLSL `LitRetro.shader` (clip-space vertex snap + `noperspective` affine + per-vertex flat/Gouraud lighting) + a `RetroPostFeature` Render-Graph pass for RGB555 + Bayer dither, in Gamma color space — the retro look forced through a high-fidelity renderer.
  - Burst + `Unity.Mathematics` for a bit-stable xorshift and fixed-step `SimClock`; single global `HitboxSystem` resolution pass for deterministic ordering.
  - Input System `.inputactions` (both schemes, rebinding); Cinemachine 3 lock-on framing; `BossController` driven entirely by `BossDefinition` ScriptableObjects wrapping `bosses.json`.
  - Editor `SceneBootstrap` that procedurally builds prefabs + both scenes + Build Settings so `.unity` YAML is never hand-authored; IL2CPP standalone for ship.

---

## 4. SHARED ART / ASSET PIPELINE

**Constraint that shapes everything: there are no DCC tools here (no Blender/Maya/Photoshop) and no desktop.** So the pipeline is built around **procedural / primitive placeholder geometry generated in-engine**, with a thin shared-asset folder for the few things that genuinely must be authored files (textures, audio, font).

### Where placeholders live and what's shared vs in-engine

| Asset class | Lives in | Format | Why |
|---|---|---|---|
| **Geometry (world + characters)** | **In-engine, procedural** (R3F primitives / Godot `@tool` `BoxMesh`/`CSGBox3D` / Unity `GameObject.CreatePrimitive`) | n/a (generated) | No DCC here. The bible's N64 look *wants* crude primitive geo. Greybox rooms, capsule actors, cube bosses, pillar rows, circular arena — all generated. This is the right call aesthetically AND practically. |
| **Optional shared models** | `game/shared/assets/models/` | **glTF 2.0 `.glb`** | The one interchange format all three import natively. Use only if a hand-authored prop is ever needed; not required for the slice. |
| **Textures** | `game/shared/assets/textures/` | **PNG, ≤128² (mostly 64²), ≤256-color indexed** | Authored once, used by all three. Bible §4.6–4.7: point-sample, no mipmaps. Can be generated programmatically (palette grids, noise) without a DCC tool. |
| **Audio** | `game/shared/assets/audio/` | **`.ogg`** (music/ambience), **`.wav`** (SFX one-shots) | OGG = universal + compressed; WAV = low-latency SFX. All three load both. |
| **Pixel font** | `game/shared/assets/fonts/` | bitmap font (PNG atlas + metrics, or `.fnt`) | Shared 8×8 HUD typeface so the HUD reads identically; point-sampled, never SDF/anti-aliased. |
| **Palette / tier colors** | mirrored constant per engine | hex from `src/lib/tiers.ts` | `#50c8ff`/`#78e6a0`/`#ebbe5a`/`#e66e8c`. CI asserts the three mirrors equal the source. |

**glTF `.glb`** is the designated 3D interchange format because it is the only one all three engines import first-class (R3F `useGLTF`, Godot `.glb` import, Unity glTF package). But for the slice, **geometry is overwhelmingly in-engine primitives** — `shared/assets/models/` may stay nearly empty. That's intentional: it keeps the three builds visually comparable (same primitive shapes from the same dimensions in the bible) and sidesteps the no-DCC constraint entirely.

### How the same design-data JSON feeds all three engines

This is the heart of comparability. **One authored source, three load paths, one validation gate:**

```
                    game/shared/design-data/*.json   (+ schema/*.schema.json)
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
   THREE.JS                    GODOT                      UNITY
   loadDesignData.ts           data/design_data.gd        DesignDataLoader.cs
   • Vite imports JSON         • FileAccess reads          • reads StreamingAssets
   • Ajv validates vs schema     ../shared (editor) or       /design-data (copied
     at boot (hard-fail)         res://data copy (export)    at bootstrap+build)
   • frozen typed views        • hydrates Godot Resource   • deserializes to C#
                                  classes (MoveData…)         records → wraps in
                                                              ScriptableObjects
          │                        │                        │
          └────────────────────────┴────────────────────────┘
                                   ▼
              SAME numbers • SAME seeded PRNG (0x41455448) • SAME frame counts
              → SAME boss-kill telemetry {boss,timeSec,flowGrade,deaths,flaskUsed}
```

- **Authoring:** numbers live **only** in `game/shared/design-data/`. No engine hard-codes a combat value; each reads `combat.json`, `moves.json`, `bosses.json`, `enemies.json`, `weapons.json`.
- **Path resolution:** Three.js imports JSON directly (dev) / copies into `public/` (build); Godot reads `../shared/design-data` in-editor and a `res://` copy on export; Unity copies into `Assets/StreamingAssets/design-data/` at bootstrap and on build. The copies are gitignored derived artifacts — `shared/` stays the single source.
- **Validation gate (bible Appendix A.1):** every build validates against `schema/*.schema.json` in CI; **a build that fails validation is rejected as non-comparable.** Three.js uses Ajv at boot; Godot's `data_validator.gd` and Unity's loader replicate the schema checks. A failing file refuses to boot in all three.
- **Determinism coupling:** all three seed their PRNG from `combat.json:prngSeed` (`0x41455448`), run logic on a fixed 1/60 s step, use the 6-frame buffer and 18-frame combo window as *frame counts*, and resolve hits with capsule/sphere volumes **from the data**, not engine mesh colliders. That's what makes a Tuning-Knight kill in Three.js reproducible in Godot and Unity.

---

## 5. RISKS & MANUAL STEPS

### Environment constraints (apply to the whole program)
- **No desktop, no GUI** → only Three.js is authorable/viewable here. Godot and Unity are scaffolded **blind** and verified by the user on their machine. Plan for a feedback loop: scaffold → user runs → user reports → fix.
- **No Unity, no Godot editor, no .NET/dotnet, no Mono** installed here → cannot compile C#, cannot open either editor, cannot bake NavMesh/lighting here. CI for Godot/Unity is limited to **headless batchmode logic tests** (PRNG bit-stability, frame math, schema validation) — not scene authoring or rendering.
- **No DCC tools** → all geometry procedural/primitive (see §4). This is a constraint turned into an aesthetic asset.
- **Outbound HTTPS via proxy** → npm installs for the Three.js sub-app work; Unity UPM / Godot AssetLib pulls happen on the *user's* machine, not here.

### Per-engine manual steps the user must do

**Three.js (minimal — mostly automatable here):**
- `npm install` in `game/threejs` (proxy-OK). Then `vite dev` / `vite build`.
- To ship desktop: add one `"play"` window block to `src-tauri/tauri.conf.json` (or a copy step into `out/play/`). **One JSON block; the existing CSP needs no change** (verified: it already allows `'unsafe-eval'`, `worker-src blob:`, `connect-src blob:` for Rapier WASM/workers).

**Godot (clean hand-off):**
1. Install **Godot 4.3 stable, STANDARD build (not Mono)**.
2. Import `game/godot/project.godot`; let the import scan finish.
3. Enable the **Aether Bootstrap** plugin (Project Settings → Plugins).
4. Run **Tools → Aether → 5. Build Everything + Set Main Scene** (validates data → generates greybox → wires flow → copies data → sets main scene).
5. Press **F5**.
- *Gotchas:* never use `randi()`/`randf()` (CI greps for them) — only the seeded `RNG`; if textures look smooth, re-import as Filter=Nearest/Mipmaps=off; keep `game/godot/` beside `game/shared/` or run the copy-to-`res://` step first; `config_version=5` confirms a Godot-4 project file.

**Unity (heaviest):**
1. Install **Unity 6 LTS (`6000.0.x`)** via Hub, with desktop build support modules.
2. Add `game/unity/` in Hub; open; **wait for UPM to resolve** (minutes; console must be error-free).
3. Confirm **Player → Active Input Handling = Input System Package (New)** (forces an editor restart — the one step the bootstrap can't fully automate).
4. Run **Aether → Build Vertical Slice** (generates SOs, copies JSON to StreamingAssets, builds prefabs + both scenes, wires Build Settings, bakes NavMesh).
5. Press **Play** in `Hub_Threshold` (scene index 0).
6. For a desktop build: Build Settings → Standalone (IL2CPP), both scenes listed.
- *Gotchas:* commit all `.meta` files; Gamma color space and `noperspective` HLSL are load-bearing for the look; some ProjectSettings can't be set silently and are called out in `README-UNITY.md`.

### Open decisions for the user (sign-off needed before building)

1. **Three.js host: Vite sub-app (recommended) vs Next `/play` route.** The architectures recommend the isolated Vite sub-app for HMR quality, dependency isolation from the Atlas's `deck.gl`/`maplibre` stack, and headless verifiability. It still ships in your existing Tauri shell. *Confirm the sub-app approach.*
2. **Build scope: all three, or Three.js + one?** Three.js is mandatory (it defines the reference). Godot is the recommended second (cheap, clean hand-off). Unity is the expensive "shipping-game reference" — *confirm whether Unity is in scope for this pass or deferred.*
3. **Present cadence:** bible §4.8 says present at 30 fps (frame-doubled) for authenticity, logic at 60. *Confirm 30-fps-present as the shipped default* (it's a one-constant toggle per engine; combat numbers are unaffected).
4. **Desktop packaging for the game in Tauri:** add the second `"play"` window to `src-tauri/tauri.conf.json`, or keep the game web-only for the slice? *Touching `tauri.conf.json` is the only proposed edit to the otherwise-untouched Tauri app — confirm you want it.*
5. **Mobile:** out of scope for the slice in all three architectures (a 320×240 action game on touch is awkward). *Confirm mobile is deferred.*
6. **Tier-color source of truth:** mirror `src/lib/tiers.ts` into each engine with a CI equality check (recommended) vs some build-time codegen. *Confirm the mirror-with-CI-check approach.*

---

### Critical Files for Implementation
- /home/user/aether/game/shared/design-data/combat.json — the engine-agnostic numeric + determinism contract every build reads (seed, fixed-step, i-frames, Flow thresholds)
- /home/user/aether/game/shared/design-data/schema/ — JSON Schemas; the CI gate that makes the three builds comparable (a build failing validation is rejected)
- /home/user/aether/game/threejs/src/engine/GameLoop.ts — the reference fixed-step + replay harness that defines the golden telemetry the other two engines must match
- /home/user/aether/.gitignore — root append for the Three.js sub-app + derived shared-asset copies (Godot `.godot/`, build copies)
- /home/user/aether/game/unity/.gitignore — Unity-local ignores (Library/, StreamingAssets copy) kept inside the project so it never fights the root gitignore

(Existing untouched repo files the plan reuses, read-only: /home/user/aether/src/lib/tiers.ts, /home/user/aether/src/lib/types.ts, /home/user/aether/src-tauri/tauri.conf.json, /home/user/aether/content/canon/aetherius.md.)
