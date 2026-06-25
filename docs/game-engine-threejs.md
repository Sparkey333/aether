# AETHER: THE SUNDERED NEXUS — Three.js / R3F Engine Architecture
### Maxed-out vertical-slice implementation plan · v1.0 · 2026-06-24

This is the opinionated build plan for the R3F implementation of the bible's vertical slice, designed to coexist in `/home/user/aether` (Next.js 15 / React 19 / Tauri 2) without disturbing the Atlas map app, and to be iterated **live in this headless browser/dev-server environment**.

---

## 0. The single biggest decision: where the game lives

**Recommendation: a separate Vite + React 19 + R3F sub-app under `game/threejs/`, sharing `game/shared/design-data/` and a tiny vendored copy of the tier colors. NOT a Next.js route.**

I considered three options against the actual repo facts I verified:

| Option | What it is | Verdict |
|---|---|---|
| **A. Next.js route `/play`** | A `src/app/play/page.tsx` rendering the R3F canvas inside the existing Next app | Rejected |
| **B. Vite sub-app `game/threejs/`** | Independent Vite app, own `package.json`, shares JSON design-data | **Chosen** |
| C. Separate repo | Fully external | Rejected — loses the shared-data coupling the bible demands |

### Why a route inside the Next app is the wrong call here

1. **The root layout is hostile to a game.** `src/app/layout.tsx` hard-mounts `<TopNav />` and wraps everything in `<main className="content">` with `globals.css`. A 320×240 fullscreen game canvas fights that chrome; you'd need a route group `(game)` with its own layout to escape it. Doable, but it's friction on every iteration.
2. **The combat loop is fundamentally incompatible with RSC/SSR.** Everything in the game is `"use client"`, a fixed-timestep `requestAnimationFrame` loop, WASM (Rapier), and `WebGLRenderTarget` ping-pong. Next's value-add (server components, routing, image optimization, streaming) is dead weight here. You'd `dynamic(() => import(...), { ssr: false })` the entire app — at which point Next is just a slow webpack/turbopack wrapper around a client bundle.
3. **HMR quality matters more than anything for this project.** You told me to lean into live iteration. **Vite's HMR for R3F + GLSL is the best-in-class iteration loop** — sub-200ms shader and component reloads, `vite-plugin-glsl` hot-swaps `.glsl` files without losing scene state via R3F's Fast Refresh. Next's dev server (even Turbopack) is heavier and its Fast Refresh interacts badly with a long-lived imperative game loop and WASM init.
4. **Dependency blast radius.** Adding `@react-three/fiber`, `drei`, `rapier`, `postprocessing`, `three`, `zustand`, `howler`, `leva` to the Atlas app's `package.json` bloats its install, its type-check surface, and risks version skew with `deck.gl`/`maplibre` (both pull `gl-matrix`/`earcut` transitively). Isolation keeps the Atlas app's `npm run typecheck` and `next build` fast and uncontaminated.

### Why the Vite sub-app is right — and how it still ships in the same Tauri shell

- **Tauri serves static files.** Your `tauri.conf.json` already points `frontendDist` at `../out` (Next's export). Tauri 2 supports **multiple windows**. The clean integration: build the game to `game/threejs/dist/`, and either (a) add a **second Tauri window** (`label: "play"`) whose dev URL is `http://localhost:5173` and whose prod dist is the game bundle, or (b) copy `game/threejs/dist/` into `out/play/` during `build:native` so a single window can navigate to it. I recommend (a) for dev (independent HMR) and (b) for the shipped app.
- **The CSP is already game-ready.** I checked: your CSP allows `script-src 'unsafe-eval'`, `worker-src 'self' blob:`, and `connect-src 'self' https: data: blob:`. That is exactly what Rapier's WASM (`'unsafe-eval'` for some bundlers / `WebAssembly.instantiate`), web workers, and blob shader URLs need. **No CSP changes required** — a real, verified advantage.
- **Shared data, zero coupling.** Both apps read `game/shared/design-data/*.json`. The game vendors the four tier colors as a 30-line `tiers.ts` constant (they are a frozen contract — `#ebbe5a`/`#78e6a0`/`#50c8ff`/`#e66e8c` — copying is correct here; importing across two build systems with different `tsconfig` `paths` is not worth it). A CI check can assert the two copies match.
- **Headless-friendly.** `vite` dev server + Playwright/Chromium headless is a trivial, fast harness (Section 9). Next's dev server boot is slower and noisier to drive.

### Final repo shape

```
/home/user/aether
├── src/                      # Atlas app — UNTOUCHED
├── src-tauri/                # add one window def for "play" (one JSON block)
├── game/
│   ├── shared/
│   │   └── design-data/      # bible §5 — the cross-engine contract (JSON + schema/)
│   └── threejs/              # the R3F game — its own Vite app
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── public/           # textures (≤128²), audio, pixel font
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── engine/       # fixed-step loop, ECS-lite, math, PRNG
│           ├── combat/       # state machines, resources, flow, hitboxes
│           ├── actors/       # player, enemies, bosses
│           ├── ai/           # data-driven boss FSM
│           ├── render/       # retro pipeline, shaders, materials
│           ├── world/        # scene graph, zones, secrets, checkpoint
│           ├── input/        # device mapping, buffer, tap/hold
│           ├── hud/          # React DOM overlay
│           ├── audio/        # howler manager
│           ├── state/        # zustand stores
│           └── data/         # loaders + typed views over shared JSON
└── (everything else unchanged)
```

---

## 1. Libraries + versions (opinionated, pinned)

All versions are the current stable line as of mid-2026; pin exact in `package.json`, dedupe `three`.

| Package | Version | Why this, not the alternative |
|---|---|---|
| `react` / `react-dom` | `^19.0.0` | Match the host repo; R3F v9 requires React 19. |
| `three` | `^0.171.0` | Pin and **dedupe** — drei/rapier/postprocessing all peer-dep `three`; one copy only. |
| `@react-three/fiber` | `^9.0.0` | R3F v9 = React 19 reconciler. |
| `@react-three/drei` | `^10.0.0` | `useGLTF`, `useTexture`, `KeyboardControls`, `Bvh`, `PerspectiveCamera`, `Html`, `useAnimations`, `Detailed` (LOD). |
| `@react-three/rapier` | `^2.0.0` | **Physics. Chosen over cannon/jolt.** WASM, deterministic enough, kinematic-character-controller support, `world.castShape` for hitscan, sensors for hitboxes. |
| `@dimforge/rapier3d-compat` | matched | The `-compat` (inlined-WASM) build avoids top-level-await/CSP headaches in Vite + Tauri. |
| `@react-three/postprocessing` | `^3.0.0` | The retro pass chain (Section 4). |
| `postprocessing` | `^6.36.0` | Underlying `EffectComposer`; we author **custom `Effect` subclasses**. |
| `zustand` | `^5.0.0` | Game state. Vanilla store + transient `getState()` reads in the loop (no re-render churn). |
| `howler` | `^2.2.4` | Audio. Sprite-based SFX, spatial-lite, music crossfade. |
| `leva` | `^0.10.0` | **Dev-only** live tuning panel (gated behind `import.meta.env.DEV`). Iteration multiplier. |
| `vite` | `^6.0.0` | Build/dev. |
| `vite-plugin-glsl` | `^1.3.0` | `#include` + HMR for `.glsl`/`.frag`/`.vert`. Load-bearing for shader iteration. |
| `@vitejs/plugin-react` | `^4.3.0` | Fast Refresh. |
| `typescript` | `^5.6.0` | Match host. |
| `ajv` | `^8.17.0` | Validate design-data against `schema/*.schema.json` (bible Appendix A.1) at load + in CI. |
| `vitest` | `^2.0.0` | Unit tests for combat math / determinism. |
| `@playwright/test` | `^1.49.0` | Headless verification harness (Section 9). |
| `stats.js` (via drei `Perf`) | — | `r3f-perf` `^7.2.0` for frame budget HUD in dev. |

### Character controller: **custom `CharacterController` on a kinematic Rapier body. NOT ecctrl.**

This is a deliberate, load-bearing pick.

- **`ecctrl` is wrong for this game.** It's a dynamic-rigidbody, physics-driven controller tuned for platformers/floaty movement (it leans on friction, ride-height springs, and dynamic forces). The bible specifies **frame-exact, deterministic, data-driven locomotion**: a 30-frame roll with i-frames on frames 5–17, 4.0m fixed roll distance, strafe-relative lock-on movement, fixed-timestep combat. You cannot get frame-exact, reproducible motion out of a dynamic body integrated by a physics solver — it'll drift across machines and break the determinism contract (§2.14).
- **Use Rapier's `KinematicPositionBased` body + `KinematicCharacterController`** (`world.createCharacterController(offset)`). You compute the desired translation each fixed step **yourself** (root-motion tables from `moves.json` for attacks/rolls; analog stick for free move), then `controller.computeColliderMovement(collider, desiredDelta)` resolves it against world colliders (slopes, walls, the boss-pit ledge), and you read `controller.computedMovement()` back. This gives you: deterministic frame-driven motion, authoritative root-motion for attacks/dodges, autostep/slope handling for the Riven Stair, and a clean way to enforce the instant-death pit in arena F (`controller.computedGrounded()` + a kill volume).
- Enemies/bosses use the **same** `CharacterController` class, configured by `enemies.json`/`bosses.json`.
- Physics is used for: world collision, character movement resolution, fall damage (vertical delta), and **hitbox/hurtbox overlap via Rapier sensors** — though per bible §2.14.5 the authoritative overlap test is **capsule/sphere from data**, so we run our own analytic capsule-vs-capsule test on the fixed step and use Rapier sensors only as a broadphase hint. This keeps hit resolution identical to the other two engines.

---

## 2. Engine core — fixed-timestep loop, ECS-lite, determinism

The whole game is an **imperative simulation that React renders a view of.** React/R3F owns the scene graph and DOM; it does **not** own combat truth. Combat truth lives in plain TS objects stepped at a fixed 1/60 s.

### `engine/GameLoop.ts`
The heart. Implements the classic accumulator (Glenn Fiedler "Fix Your Timestep"):

```
FIXED_DT = 1/60
accumulator += clamp(realDelta, 0, 0.25)   // spiral-of-death guard
while (accumulator >= FIXED_DT) {
  input.beginFixedStep()      // sample buffered input for this tick
  world.fixedStep(FIXED_DT)   // ALL combat/AI/resource logic, integer frame N++
  accumulator -= FIXED_DT
}
const alpha = accumulator / FIXED_DT
world.interpolate(alpha)      // visual-only: lerp meshes between prev/cur transforms
```

- Driven by R3F's `useFrame` at the top of the tree (priority controls order), **not** a second RAF. R3F already runs a RAF; we hook its delta.
- **Logic at 60 Hz, present at 30 fps (bible §4.8):** we still *simulate* at 60 but optionally *render* every other frame by skipping the R3F render on alternate visual frames (`gl.setAnimationLoop` gate) — or simpler, accept 60 fps present in dev and frame-double only in the "authentic" build flag. Combat numbers are frame-count based so this is purely cosmetic, exactly as the bible says.
- Exposes `frame: number` (the integer tick) — every system reads frame counts, never seconds.

### `engine/World.ts` (ECS-lite)
Not a full ECS — a **registry of systems + entity arrays**, because the slice has tens of actors, not thousands. Entities are plain objects (`PlayerActor`, `EnemyActor`, `BossActor`) held in typed arrays. `fixedStep()` runs systems **in a fixed order** (order is part of the determinism contract):

```
1. InputSystem.consume()          5. HitResolutionSystem (capsule overlaps → damage/poise/hitstop)
2. PlayerController.step()         6. ResourceSystem (stamina regen, AE, flow decay)
3. EnemyAI.step() / BossAI.step()  7. ReactionSystem (stagger/launch/knockdown transitions)
4. MovementSystem (kinematic)      8. CleanupSystem (deaths, despawns, secrets, checkpoints)
```

### `engine/Rng.ts`
`xorshift128` seeded with `0x41455448` (bible §2.14.3). Every "random" boss choice draws from **this named instance**; seed logged at encounter start. Deterministic and cross-engine-identical.

### `engine/Time.ts`, `engine/math.ts`
Frame↔second helpers (`frames(n) => n/60`), capsule/sphere overlap tests, NDC snap helper (shared CPU-side reference for the GPU snap), fixed-point-ish integer damage resolution.

---

## 3. The concrete module / component / hook inventory

Below, each module's **responsibility** and **who it talks to**. `*.ts` = pure logic (testable in vitest, no React). `*.tsx` = R3F/DOM view bound to logic.

### 3.1 Input — `src/input/`
| File | Responsibility |
|---|---|
| `InputManager.ts` | Polls keyboard/mouse/gamepad, maps to **canonical action names** (bible §2.13), maintains the **6-frame input buffer** (ring buffer of `{action, frame}`), resolves **tap-vs-hold at 10 frames** (`tapHoldThresholdFrames`). Exposes `consume(action)` (buffer-aware) and `isHeld(action)`. |
| `bindings.ts` | The two default binding tables (gamepad §6.1, KBM §6.2). Remappable; defaults are the comparison baseline. |
| `useInput.ts` | React hook to register listeners on mount; feeds `InputManager`. Pointer-lock for mouse-look. |

Interactions: `InputSystem` (in World) calls `InputManager.beginFixedStep()` once per tick so the buffer advances on the fixed clock, not the render clock.

### 3.2 Locomotion + camera — `src/actors/` + `src/render/camera/`
| File | Responsibility |
|---|---|
| `CharacterController.ts` | Kinematic Rapier controller wrapper (Section 1). Free-move (analog, accel/decel), strafe-relative when locked, **root-motion playback** from move tables (rolls = 4.0m over 30f curve, attacks move the body per `moves.json`), grounded test, fall-damage delta, pit-death volume. Shared by player + enemies + bosses. |
| `Locomotion.ts` | Speed sets (walk/sprint), sprint stamina drain (8/s), backstep vs roll disambiguation by movement input + lock state. |
| `ThirdPersonCamera.tsx` | Spring-damped follow cam. Free-look (right stick/mouse) when unlocked. **Lock-on framing**: composes Warden + target in frame, 22m acquire radius, ±60° cone, breaks at 30m / 2s LOS loss. |
| `LockOnSystem.ts` | Target acquisition/validation, screen-space **target switching** (0.4 stick deadzone / 120px mouse, 150ms cooldown), reticle target feed to HUD. |
| `CameraShake.ts` | Micro-shake on hitstop classes (bible §2.12). |

### 3.3 Combat — `src/combat/`
The DMC nervous system. All pure TS, all frame-driven, all vitest-tested.

| File | Responsibility |
|---|---|
| `ComboStateMachine.ts` | The move graph. Nodes = moves from `moves.json`; edges = `comboNext` + the **18-frame link window**. Handles L/L/L, L/L/H knockdown, launcher, aerial rave/slam, dash-thrust, spacing string, **style-cancel into dodge** (preserves combo if re-engaged in 18f). Refuses mid-string swings you can't afford (stamina). |
| `DodgeSystem.ts` | 30f roll, **i-frames 5–17**, recovery + **cancel window 25–30**, backstep (18f, i-frames 5–11). Emits an `invulnerable` flag the HitResolution system reads. |
| `StaminaSystem.ts` | Pool, costs (§2.2), **+40/s regen starting 0.5s after last spend**, refuse-if-unaffordable. |
| `PoiseSystem.ts` | Per-actor poise + regen (1s delay), hyper-armor (heavy f8+, −50% poise dmg), guard-break, computes **hit-reaction tier** (flinch/stagger/launch/knockdown) from connecting poise dmg. |
| `HealthSystem.ts` | Integer HP, damage application **at active-frame of overlap** (§2.14.4), death. No regen. |
| `FlaskSystem.ts` | 3 charges, **400 HP heal on frame 40 of 52**, vulnerable throughout, **charge consumed even if interrupted**. |
| `FlowSystem.ts` | The Style meter. FP 0–10000, ranks D→S, thresholds + decay table, **variety multiplier over last 6 move IDs** (2.0 novel / 1.3 recent / 0.5 repeat), parry/backstab/perfect-dodge bonuses, aerial ×1.25, **−40% FP + doubled decay 3s on taking damage**. Computes **AE-per-hit = aeByRank[rank]** — the load-bearing coupling. Emits boss-kill Flow grade. |
| `AetherSystem.ts` | AE pool (0–100), spent by specials, fueled only via Flow. |
| `SpecialsSystem.ts` | Ground Current (35), Leyline Lance (50), **Cauterize (100): +30% dmg, hyper-armor, AE-free specials 480f, dumps AE on expiry**. Hooks the boss phase-3 "Fold" hard-counter. |
| `BlockParrySystem.ts` | Block (70% reduction, poise absorb), **parry active f3–9 of 20f**, riposte arming (0.6s), guard break. |
| `CriticalSystem.ts` | Backstab (1.4m, ±45° rear cone, 2.5×, 8 i-frames), riposte (3.0×). |
| `HitResolution.ts` | The authoritative overlap test: **analytic capsule/sphere from data** (§2.14.5) between active hitboxes and hurtboxes on the fixed step; resolves damage/poise/knockback/**hitstop** (freeze both actors N frames), launch/juggle entry. Attacker's frame-of-contact authoritative. |
| `JuggleSystem.ts` | Launch (2.5m/20f rise, 24f hang, 40% gravity), **+8f per aerial hit, cap 3**, `launchable:false` → 1.5× poise instead of lift. |
| `Hitstop.ts` | Global freeze coordinator (pauses affected actors' animation + sim advance for the hit, per §2.12). |

### 3.4 Boss & enemy AI — `src/ai/`  (data-driven, reused mini-boss ↔ main boss)
**One FSM, two configs.** This is the key reuse the bible asks for.

| File | Responsibility |
|---|---|
| `BossBrain.ts` | Generic **data-driven boss FSM**, constructed entirely from a `bosses.json` entry. States: `Idle → Approach → Telegraph(move) → Active → Recovery → Reposition`, plus `PhaseTransition` (immune, frame-gated, `transitionInFrames`), `Staggered`, `Dead`. **Attack selection** each decision tick: filter phase `attacks[]` by `minRangeM/maxRangeM` + `cooldownFrames`, then **weighted-random via the seeded Rng**. Identical across engines because seed + iteration order are fixed. Drives the **Tuning Knight** (2 phases) and **Aetherius-Mar** (3 phases) from the same code — only their JSON differs. |
| `PhaseController.ts` | Watches HP %, fires phase transitions at `hpEnterPct` thresholds, runs the immune transition window, triggers arena VFX hooks (great-circle ignite in F, Aetherius voice line). |
| `EnemyBrain.ts` | Lightweight FSM for Husk / Sundered Acolyte / Stone Sentinel (chase / ranged-kite / hyper-armor-punish) from `enemies.json`. |
| `TelegraphSystem.ts` | Maps a move's `tell` string + startup frames to a VFX/anim cue (gold glint, ring expand, blade pull-back) so tells are readable and data-defined. |
| `BossHardCounters.ts` | Special-cased counter logic the data references by id: the **phase-3 "Fold" super** negated by parry f88–91 **or** Cauterize → 120f crit window. |

Boss "moves" (their attacks) live in `moves.json` alongside player moves — same schema (§5.1), so a boss attack is just a move with `kind` and hitboxes, referenced by `moveRef` in `bosses.json`. **The combat resolution code does not know or care whether a move belongs to the player or a boss.** That symmetry is what makes the system clean.

### 3.5 World, zones, secrets, checkpoint — `src/world/`
| File | Responsibility |
|---|---|
| `Scene.tsx` | Root R3F scene graph: lights (1 directional key + ambient, **vertex-lit only**), fog, the active zone, actors, the retro composer. |
| `ZoneManager.ts` | Loads/unloads the slice's zones **E1→A→B→C→D→E→F** (bible §3.1). One-way drop locks behind you. Per-zone fog color (general `#1a1f2e`, arena F `#2a2418`). Streams GLTF + spawns enemies from a `zones/*.json` manifest. |
| `Zone.tsx` | Renders one zone's static geometry (greybox GLTF), colliders, spawn points, triggers, fog gates. |
| `GuidingLeyline.tsx` | The pale-gold (#ebbe5a) critical-path thread: pulses 0.5Hz, brightens after 8s of facing-away, **forks dim at branch points** (the secret-hinting mechanic). Pure VFX, reads progress from `progressStore`. |
| `Secrets.ts` | S1 (heavy-attack/Ground-Current breakable wall in A → +1 Flask max + lore tablet) and S2 (alt lever sequence in D → Resonant Edge weapon + 25 AE). Breakable-wall detection via the hidden "mismatched fog/missing snap-seam" material flag. |
| `LeverPuzzle.tsx` | The Choir of Stone 3-lever resonance puzzle (opens E) + the 4th-tongue alt sequence (opens S2). Uses `Interact`. |
| `Checkpoint.ts` + `AttunementStone.tsx` | The single save point in A: refills HP/Flask (not AE), **respawns non-boss enemies**, sets respawn, briefly clears fog (reward beat), opens the stone menu (rename Warden; leveling hooks stubbed). |
| `FallDeath.ts` | Pit kill-volume in F + fall-damage thresholds. |

### 3.6 HUD — `src/hud/` (React DOM overlay, NOT in-canvas)
Rendered as an absolutely-positioned DOM layer over the `<Canvas>`, then **CSS-scaled with `image-rendering: pixelated`** so it's chunky at 320×240-equivalent. Reads game state via **zustand selectors** (re-renders only on value change, never per-frame imperative-to-DOM).

| File | Responsibility |
|---|---|
| `Hud.tsx` | Layout root, pixel-font, letterbox to 4:3. |
| `HealthBar.tsx`, `StaminaBar.tsx` (green #78e6a0), `AetherBar.tsx` (blue #50c8ff) | Segmented hard-edge bars. |
| `FlowMeter.tsx` | Vertical rune column + big D/C/B/A/S letter, gold→white-hot color shift. |
| `FlaskCounter.tsx`, `BossBar.tsx` (name + phase-threshold segments), `LockOnReticle.tsx` (4px gold bracket), `Interactable Prompt`, `PauseMenu.tsx`. |

Why DOM not in-canvas: faster iteration, crisp pixel font without authoring an SDF atlas, and it keeps the 320×240 render target purely for the world. The reticle is the one element that could be in-canvas (needs world→screen projection) but is cheaper as a DOM element positioned from the projected target point.

### 3.7 Audio — `src/audio/`
| File | Responsibility |
|---|---|
| `AudioManager.ts` | Howler wrapper: SFX sprite sheets (swings, hits by class, parry ring, stagger, special channels), **music layers with crossfade** (explore → mini-boss → main-boss phases), one-shot stingers (phase transitions, Attunement Stone, Aetherius voice line at boss T2). Gain buses (master/sfx/music). |
| `useAudioEvents.ts` | Subscribes to a tiny event bus the combat systems emit into (`onHit`, `onParry`, `onPhase`, `onDeath`) so audio never reaches into combat logic. |

### 3.8 State — `src/state/`
| Store | Holds |
|---|---|
| `runStore.ts` | Run/meta: current zone, checkpoint, deaths, Cinder drop location, secrets found, Warden name, equipped weapon. |
| `hudStore.ts` | Snapshot of HP/STA/AE/poise/flow/flask/boss-bar **written once per fixed step** by a `HudSync` system (decouples render from sim; HUD reads this, not the live actors). |
| `settingsStore.ts` | Bindings, audio gains, present-mode (30/60), render scale. Persisted to `localStorage`. |
| `saveStore.ts` | The save/checkpoint blob → `localStorage` key `aether.slice.save.v1` (and exportable JSON). |

### 3.9 Data — `src/data/`
| File | Responsibility |
|---|---|
| `loadDesignData.ts` | Loads `game/shared/design-data/*.json` (Vite `?url`/`import` of JSON), **validates against `schema/*.schema.json` with Ajv at boot** (and CI), exposes typed, frozen views (`Moves`, `Bosses`, `Enemies`, `Weapons`, `Combat`). A validation failure hard-fails boot (bible: a build that fails validation is not comparable and is rejected). |
| `tiers.ts` | Vendored 30-line copy of the four tier colors (the frozen contract). CI asserts equality with `src/lib/tiers.ts`. |
| `types.ts` | TS types generated/mirrored from the JSON schemas. |

---

## 4. The retro N64/PS1 aesthetic — exact Three.js approach

This is implemented as a **two-stage pipeline**, and it is the part you'll iterate most live, so it's built for hot-swap from the first commit.

### Stage 1 — render the world to a tiny target, upscale nearest
- A `WebGLRenderTarget` at **320×240**, `minFilter=NearestFilter`, `magFilter=NearestFilter`, `generateMipmaps=false`, depth texture attached (needed for fog/dither passes).
- All world geometry renders into it. Then a **fullscreen triangle** samples it with `NearestFilter` and blits to the canvas, **integer/sharp upscaled and letterboxed to 4:3**. `renderScale = internalH / outputH`.
- In R3F: a custom `<RetroComposer>` wrapping `EffectComposer` whose first input is the low-res target. No MSAA, no FXAA/TAA, `antialias:false` on the WebGLRenderer.

### Stage 2 — the look, as material features + post passes

**A. Vertex snapping + affine warp — in the world material's vertex shader.** A shared `ShaderMaterial`/`onBeforeCompile` patch applied to all world + character materials.

- `psx_snap.vert.glsl` — after `gl_Position` is computed (post-projection), snap NDC.xy to a **160×120 cell grid** (bible §4.2): `pos.xy = round(pos.xy/pos.w * grid) / grid * pos.w` with `grid = vec2(160.0, 120.0)/2.0`. Applied after perspective divide intent, before viewport — done by operating on clip-space with the `*pos.w` factor so the snap survives the GPU's own divide. The CPU reference in `engine/math.ts` mirrors this for tests.
- `psx_affine.vert.glsl` — affine texture warp: pass UVs **without perspective correction** by multiplying through `1/w` deliberately, i.e. interpolate `vUv * (1.0/gl_Position.w)` and `vInvW = 1.0/gl_Position.w`, then in the fragment divide `vUv/vInvW` — but the trick that yields PS1 swim is using `noperspective` interpolation. WebGL2/GLSL3 supports the `noperspective` qualifier, so the canonical version is `noperspective out vec2 vUv;` in `psx_affine.vert.glsl` + a matching `noperspective in` in the fragment. (GLSL1 fallback uses the explicit 1/w hack.)
- `psx_vertexlight.vert.glsl` — vertex lighting only (1 directional + ambient), flat normals for world (per-face) / Gouraud for characters. No per-pixel light, no specular, no normal maps.

These three are composed via `vite-plugin-glsl` `#include` into one `psx_world.vert.glsl`, paired with `psx_world.frag.glsl` (point-sampled texture, fog, vertex color).

**B. Post passes — custom `Effect` subclasses (postprocessing v6) in the composer, in this order:**

1. `RetroResolveEffect` — samples the 320×240 target with nearest (this is the blit; can be the composer's input setup rather than a separate pass).
2. `PosterizeDitherEffect` (`posterize_dither.frag.glsl`) — quantize to **RGB555 (5 bits/channel)** with **ordered Bayer 4×4 dithering**, strength 1.0 (bible §4.6). The Bayer matrix is a `const mat4`/lookup in the shader.
3. `FogEffect` (`fog_depth.frag.glsl`) — **linear fog start 8m / end 36m**, per-zone fog color uniform, reconstructs view-space depth from the depth texture (so fog is applied in the post stage uniformly and pairs with a 38m far-clip + 36m geometry cull). Fog color is a uniform the `ZoneManager` sets per zone; the Attunement-Stone fog-clear and boss-death clear animate this uniform.
4. (optional, dev-toggle) `ScanlineEffect` / `colorBleed` — off by default; the bible doesn't call for scanlines, so shipped off.

**Named shader files (in `src/render/shaders/`):**
```
psx_world.vert.glsl          # composes the three includes below
  ├─ psx_snap.vert.glsl      # vertex snapping (160×120 grid)
  ├─ psx_affine.vert.glsl    # affine/noperspective UV warp
  └─ psx_vertexlight.vert.glsl
psx_world.frag.glsl          # nearest-sampled texture + vertex color
posterize_dither.frag.glsl   # RGB555 + Bayer 4×4 ordered dither
fog_depth.frag.glsl          # linear fog from depth, per-zone color
fullscreen.vert.glsl         # shared fullscreen-triangle vertex stage
```

Texture pipeline: all textures authored **≤128² (most 64²), ≤256-color indexed**, loaded with `NearestFilter`, `generateMipmaps:false` (bible §4.6–4.7). A `loaders/retroTexture.ts` enforces this so no asset can sneak in bilinear/mipmaps.

### Why this is the right Three.js approach
- Doing snap + affine in the **vertex shader** (not post) is what produces authentic PS1 wobble and texture swim — a pure post-process cannot recreate sub-pixel vertex jitter or affine warp because that information is gone by the time you have the framebuffer.
- Doing posterize/dither/fog in **post** is correct because they're per-pixel framebuffer ops and keeping them out of the material shader means every material gets them for free and you can tune them live without recompiling object materials.
- This split also matches the bible's "implement in the vertex/geometry stage or a snap shader … identical in all engines" contract.

---

## 5. Maximizing the engine — iteration, hot reload, web + desktop, shareable URL

This environment can run the dev server and drive a headless browser, so the architecture is built to exploit that.

1. **Instant shader iteration.** `vite-plugin-glsl` HMR: editing any `.glsl` re-links the material without losing scene/combat state. The whole retro look is tunable live.
2. **Live combat tuning without recompiles.** All combat numbers live in `game/shared/design-data/*.json`. In dev, `loadDesignData` watches the files (Vite `import.meta.hot.accept`) and `leva` mirrors hot keys (i-frame windows, FP thresholds, hitstop) so you can dial a fight in real time, then write the value back to JSON. The JSON is the source of truth; leva is a live lens.
3. **Deterministic replay harness.** Because the sim is fixed-step + seeded PRNG + buffered input, `engine/Replay.ts` can record an input stream (`{frame, action}[]`) and replay it bit-identically. This is how you regression-test a boss fight and how the headless harness verifies behavior (Section 9). It's also the bible's cross-engine comparability mechanism.
4. **Pause/step/rewind dev tools.** A dev overlay can single-step the fixed loop, freeze, and scrub — trivial because the loop is an explicit accumulator you own.
5. **Web + desktop from one bundle.** `vite build` → `game/threejs/dist/` runs as: (a) a plain static site (shareable URL — drop `dist/` on any static host or a `claudeusercontent.com`-style bundle), and (b) a Tauri window. **Tauri integration is a one-block change**: add a `"play"` window to `src-tauri/tauri.conf.json` (or a menu item that opens it), `devUrl: http://localhost:5173`, and a `beforeBuildCommand` that also builds the game and copies `dist/` into `out/play/`. The existing CSP already permits WASM/workers/blobs — verified, no changes.
6. **Shareable URL build.** `vite build --base=/play/` produces a self-contained static bundle. Because the game has **no server dependencies** (all data is static JSON, all state is `localStorage`), the built `dist/` is a complete, linkable artifact — exactly what you want for sharing a slice build.
7. **One performance budget HUD** (`r3f-perf`, dev-only) keeps you honest about the 320×240 + low-poly budget.

---

## 6. Ordered build milestones

Each milestone ends in something **runnable in the headless browser** and (from M2 on) **replay-testable**.

**M0 — Scaffold & shared data**
Files: `game/threejs/{package.json,vite.config.ts,index.html,tsconfig.json}`, `src/main.tsx`, `src/App.tsx`, `game/shared/design-data/*` (combat.json, moves.json, bosses.json, enemies.json, weapons.json) + `schema/*.schema.json`, `src/data/{loadDesignData.ts,tiers.ts,types.ts}`.
Testable: `vite dev` boots, Ajv validates all design-data (fails loudly if not), a placeholder canvas renders. CI: schema validation + tier-color-parity check.

**M1 — Retro render pipeline**
Files: `src/render/RetroComposer.tsx`, all `shaders/*.glsl`, `src/render/materials/psxMaterial.ts`, `loaders/retroTexture.ts`, `world/Scene.tsx` with a test box + ground.
Testable: a spinning textured box renders at 320×240 upscaled nearest, with vertex snap, affine swim, posterize+dither, and 8–36m fog. **This is the first "screenshot it headless and eyeball the look" beat.**

**M2 — Fixed-step engine + input + locomotion**
Files: `engine/{GameLoop.ts,World.ts,Rng.ts,Time.ts,math.ts,Replay.ts}`, `input/{InputManager.ts,bindings.ts,useInput.ts}`, `actors/CharacterController.ts`, `actors/Locomotion.ts`, `render/camera/ThirdPersonCamera.tsx`, Rapier init.
Testable: Warden moves with KBM/gamepad, sprints (stamina drains), rolls with **provably correct i-frame windows** (vitest on `DodgeSystem`), camera follows. Replay records/replays a movement run identically.

**M3 — Core combat loop vs a dummy**
Files: all of `combat/*` (combo SM, dodge, stamina, poise, health, hitstop, hit-resolution, juggle, block/parry, critical, flow, aether, specials), `actors/PlayerActor.ts`, a static dummy enemy.
Testable: full L/L/L, launcher→aerial→slam, dodge i-frames negate damage, parry→riposte, hitstop freezes both actors, **Flow meter rises on varied hits and collapses on repeats/getting hit**, AE only builds via Flow, Cauterize works. Heavy vitest coverage on the determinism contract (§2.14).

**M4 — Enemies + lock-on + HUD**
Files: `ai/EnemyBrain.ts`, `actors/EnemyActor.ts` (Husk/Acolyte/Sentinel from JSON), `render/camera/LockOnSystem.ts`, all of `hud/*`, `state/{hudStore.ts,HudSync}`.
Testable: lock-on + target switching, three enemy archetypes behave per `enemies.json`, full HUD reflects live state (HP/STA/AE/Flow/flask/reticle).

**M5 — Mini-boss (the data-driven FSM proves itself)**
Files: `ai/{BossBrain.ts,PhaseController.ts,TelegraphSystem.ts}`, `actors/BossActor.ts`, `hud/BossBar.tsx`, Tuning Knight entry in `bosses.json` + its moves in `moves.json`.
Testable: **The Tuning Knight**, both phases, fog gate, transition at 55%, weighted seeded attack selection, punish windows, on-death loot/Flask + Flow grade. Replay of a full kill is bit-identical.

**M6 — Main boss (zero new AI code — pure data)**
Files: Aetherius-Mar entry in `bosses.json` + moves; `ai/BossHardCounters.ts` (Fold parry/Cauterize counter); arena-F great-circle VFX + pit kill-volume.
Testable: **Aetherius-Mar**, all three phases, T1/T2 transitions, rotating-circle survival phase, the Fold hard-counter, boss-death node re-anchor (fog clears). Proves the BossBrain reuse claim end-to-end.

**M7 — World, zones, guidance, secrets, checkpoint, save**
Files: `world/{ZoneManager.ts,Zone.tsx,GuidingLeyline.tsx,Secrets.ts,LeverPuzzle.tsx,Checkpoint.ts,AttunementStone.tsx,FallDeath.ts}`, `state/saveStore.ts`, zone manifests, greybox GLTFs.
Testable: full critical path **E1→F**, guiding leyline + dim forks, both secrets (S1 breakable wall, S2 alt-lever vault), Attunement Stone save/respawn/enemy-reset/fog-clear, death→Cinder→recover, localStorage persistence.

**M8 — Audio, polish, present-mode, Tauri window, shareable build**
Files: `audio/{AudioManager.ts,useAudioEvents.ts}`, present-mode 30/60 toggle, `src-tauri/tauri.conf.json` "play" window block, build/copy step into `out/play/`.
Testable: full slice playable web + desktop, 30fps authentic present, music layers + stingers, `vite build` produces a shareable static bundle, Tauri window launches the game alongside untouched Atlas.

---

## 7. How to run & test locally (commands)

From the game sub-app:
```
cd game/threejs
npm install
npm run dev            # vite, http://localhost:5173 — live HMR for code + shaders + JSON
npm run typecheck      # tsc --noEmit
npm run test           # vitest — combat math + determinism + replay regression
npm run build          # → game/threejs/dist  (static, shareable, self-contained)
npm run preview        # serve the built bundle locally
```
Desktop (from repo root, unchanged Atlas dev path stays as-is):
```
npm run tauri:dev      # opens Atlas window; the "play" window/menu launches the game
```
The Atlas app is untouched: its `npm run dev`, `npm run typecheck`, `npm run build:native` keep working with no new deps.

## 8. Headless verification in this environment

Because the slice is a static site with a deterministic, seeded, fixed-step sim and a replay harness, it verifies cleanly headless:

```
npx playwright test               # game/threejs/e2e — drives headless Chromium
```
- **Boot + validation test:** load `localhost:5173`, assert no Ajv validation error, assert WebGL2 context + the 320×240 target exist, screenshot the M1 retro frame and pixel-diff it against a committed reference (the bible's §4 visual contract).
- **Determinism test:** feed a recorded input stream via `engine/Replay.ts` (exposed on `window.__aether` in dev), run the Tuning Knight to death, assert the emitted boss-kill log line `{boss, timeSec, flowGrade, deaths, flaskUsed}` matches the golden value bit-for-bit. Re-run twice → identical (proves the seeded PRNG + fixed-step contract).
- **Combat unit truth** lives in vitest (no browser needed): i-frame windows, FP variety multiplier, hitstop, juggle cap, flask-interrupt-consumes-charge, Cauterize timing.
- **Screenshot-on-demand** for live iteration: a tiny `?frame=N&replay=run.json` URL param lets the headless harness step the sim to a frame and capture it, so you can eyeball any moment of any fight from the CLI.

This is the payoff of the deterministic architecture: the same properties that make the three engines comparable also make the game **machine-verifiable headless**, which is exactly the advantage to lean into here.

---

## 9. Critical Files for Implementation
- /home/user/aether/game/threejs/src/engine/GameLoop.ts (fixed-timestep accumulator + interpolation — the determinism backbone)
- /home/user/aether/game/threejs/src/combat/FlowSystem.ts (the DMC↔Souls coupling: Flow→AE, the heart of the design)
- /home/user/aether/game/threejs/src/ai/BossBrain.ts (the single data-driven FSM reused for mini-boss + main boss)
- /home/user/aether/game/threejs/src/render/shaders/psx_world.vert.glsl (vertex snap + affine warp — the retro look that can't be done in post)
- /home/user/aether/game/shared/design-data/combat.json (the engine-agnostic numeric contract every system reads)

(Existing repo files the game reuses/mirrors, all read-only: /home/user/aether/src/lib/tiers.ts, /home/user/aether/src-tauri/tauri.conf.json, /home/user/aether/content/canon/aetherius.md.)

---

Note: plan mode is active, so I made no edits and created no files — the above is the complete architecture doc as my deliverable. One decision worth your explicit sign-off before any build: the **separate Vite sub-app under `game/threejs/`** (vs. a Next `/play` route). I recommend the sub-app for HMR quality, dependency isolation, and headless verifiability, and it still ships in your existing Tauri shell with no CSP changes. If you'd rather keep everything inside the Next app despite the trade-offs, the module/shader/milestone breakdown is identical — only the host shell (route group `(game)` with its own layout + `dynamic(ssr:false)`) changes.
