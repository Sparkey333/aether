# AETHER: THE SUNDERED NEXUS — Godot 4 Implementation Architecture

**Maxed-out Godot build of the vertical slice. Deliverable: a fully-scaffolded Godot project + all GDScript that the user opens on their machine. Coexists in `/home/user/aether` under `game/godot/`; the Next.js app is untouched.**

Verified against the repo: tier colors in the bible (`#50c8ff` / `#78e6a0` / `#ebbe5a` / `#e66e8c`) match `src/lib/tiers.ts` exactly, and the `Tier` enum (`A-measured`/`B-scholarly`/`C-traditional`/`D-folklore`) matches `src/lib/types.ts`. The Godot tier resource will mirror these 1:1 so corruption glow colors stay canon.

---

## 0. Headline decisions (opinionated)

| Decision | Choice | One-line justification |
|---|---|---|
| Language | **GDScript** | Headless scaffolding + hot-reload + `@tool` scene generation + zero build step. C# needs `dotnet`, an exported solution, and breaks "open and press Play." |
| Engine | **Godot 4.3 stable** (works on 4.2.2+; **avoid 4.4 dev**) | 4.3 has stable `SubViewport` 2D-stretch upscale, `physics_interpolation`, `AnimationTree` state machine API used here, and the `@tool` plugin API. Pin it. |
| Boss AI | **Hand-rolled hierarchical State pattern in GDScript** (LimboAI-shaped, no plugin dep) | Keeps the project a pure git checkout — no addon install step. Data-driven from the shared JSON. LimboAI noted as a drop-in upgrade path. |
| Scene authoring | **`@tool` EditorPlugin bootstrap generates greybox `.tscn` from primitives** | Headless env can't run the Godot editor; the user runs one menu item and gets playable scenes. Reusable scenes (`Player`, bosses, HUD) are hand-authored `.tscn` (small, stable); large greybox geometry is generated. |
| Logic timing | **`_physics_process` at fixed 60 Hz** (`physics/common/physics_ticks_per_second=60`), present at 30 fps via `max_fps` or frame-double | Satisfies the bible's §2.14 determinism contract without touching combat frame counts. |
| Data | **JSON in `game/shared/design-data/` loaded into Godot `Resource` classes at boot** | One source of truth across all three engines. Godot caches parsed Resources; no per-frame JSON parsing. |

---

## 1. Why GDScript over C# (full justification)

1. **The deliverable constraint is decisive.** The user opens the project in Godot 4 and presses Play. A C# project requires `.NET 8 SDK`, a generated `.csproj`/`.sln`, `dotnet restore`, and the **Mono/.NET build of the editor specifically** — the standard editor download cannot open a C# project. GDScript runs in every Godot build with no toolchain. For "scaffold headlessly, hand to a user," GDScript removes an entire failure surface.
2. **`@tool` ergonomics.** The bible's killer requirement is procedural scene generation. `@tool` GDScript hot-reloads in the editor instantly; `@tool` C# requires recompiling the assembly on every change, and editor-time C# is historically the flakiest path in Godot.
3. **Determinism is unaffected.** The §2.14 contract is *frame-count* based on a fixed 60 Hz `_physics_process`. GDScript integer math and `Vector3` are deterministic enough for this (we use integer damage, fixed frame counters, and a seeded xorshift — not float accumulation). C#'s marginal speed buys nothing for a 1-boss slice.
4. **Hot-reload during balance work.** Tuning a Souls/DMC frame economy is iteration-heavy. GDScript edits apply on save without a rebuild.
5. **Single-language repo.** The Next.js side is TypeScript; adding C# means three languages. GDScript keeps the game side one language with a thin JSON bridge to the shared TS-authored data.

**When to revisit:** if the campaign (1,289 nodes) needs heavy nav-mesh baking or 50+ simultaneous Sundered, profile and consider porting the AI hot loop to C# or GDExtension. Not for the slice.

---

## 2. Repo coexistence & top-level layout

The Godot project lives entirely under `game/godot/`. The shared data sits beside it under `game/shared/`. Next.js (`src/`, `src-tauri/`, `content/`, `next.config.mjs`) is never touched.

```
/home/user/aether/
├── src/  src-tauri/  content/  next.config.mjs        # EXISTING Next.js — untouched
├── game/
│   ├── shared/
│   │   └── design-data/                                # §5 of the bible (engine-agnostic JSON)
│   │       ├── combat.json
│   │       ├── moves/moves.json
│   │       ├── bosses/bosses.json
│   │       ├── enemies/enemies.json
│   │       ├── weapons/weapons.json
│   │       └── schema/*.schema.json
│   └── godot/                                          # THE GODOT PROJECT (open this folder in Godot 4.3)
│       ├── project.godot
│       ├── DEVIATIONS.md                               # required by Appendix A.7
│       ├── icon.svg
│       ├── addons/
│       │   └── aether_bootstrap/                       # @tool plugin (§9)
│       │       ├── plugin.cfg
│       │       ├── bootstrap_plugin.gd                 # EditorPlugin, adds Tools menu items
│       │       ├── scene_factory.gd                    # builds nodes from primitives -> .tscn
│       │       ├── greybox_factory.gd                  # hub + arena geometry from BoxMesh/CSG
│       │       └── data_validator.gd                   # validates JSON vs schema at edit time
│       ├── data/
│       │   └── design_data.gd                          # loader (shared JSON -> Resources)
│       ├── resources/                                  # Resource class scripts (§7)
│       │   ├── move_data.gd
│       │   ├── boss_data.gd
│       │   ├── boss_phase.gd
│       │   ├── boss_attack_ref.gd
│       │   ├── weapon_data.gd
│       │   ├── enemy_data.gd
│       │   ├── combat_constants.gd
│       │   ├── zone_data.gd
│       │   └── tier_palette.gd
│       ├── autoload/                                   # singletons (§4)
│       │   ├── GameData.gd
│       │   ├── Combat.gd
│       │   ├── RNG.gd
│       │   ├── EventBus.gd
│       │   ├── SaveSystem.gd
│       │   ├── SceneFlow.gd
│       │   └── AudioDirector.gd
│       ├── scenes/                                     # hand-authored .tscn (small/stable)
│       │   ├── Main.tscn                               # root; holds RetroViewport + HUD + world slot
│       │   ├── player/Player.tscn
│       │   ├── camera/PlayerCamera.tscn
│       │   ├── enemies/{Husk,Acolyte,Sentinel}.tscn
│       │   ├── bosses/{TuningKnight,AetheriusMar}.tscn
│       │   ├── world/{AttunementStone,FogWall,LeverPuzzle,SecretWall,GuidingLight}.tscn
│       │   └── hud/HUD.tscn
│       ├── scenes_generated/                           # .tscn written by the bootstrap plugin
│       │   └── world/{E1_Approach,A_ThresholdHall,B_RivenStair,
│       │                C_ConductorsGallery,D_ChoirOfStone,
│       │                E_FoldAntechamber,F_SunderedNexus}.tscn
│       ├── scripts/                                    # behavior scripts attached in .tscn
│       │   ├── player/*.gd
│       │   ├── ai/*.gd
│       │   ├── combat/*.gd
│       │   ├── world/*.gd
│       │   └── ui/*.gd
│       ├── shaders/                                    # §8 retro aesthetic .gdshader
│       │   ├── ps1_vertex_snap.gdshader
│       │   ├── affine_unlit.gdshader
│       │   ├── posterize_dither.gdshader
│       │   └── retro_world_env.gdshader
│       └── fonts/  audio/  README_GODOT.md
```

`SubViewport`-generated scenes go in `scenes_generated/` so a re-run of the bootstrap never clobbers hand-authored scenes.

---

## 3. `project.godot` essentials & input map

`project.godot` is hand-authored (it is a stable INI, not a fragile `.tscn`). Key sections:

```ini
config_version=5

[application]
config/name="Aether: The Sundered Nexus"
run/main_scene="res://scenes/Main.tscn"
config/features=PackedStringArray("4.3", "Forward Plus")

[autoload]
GameData="*res://autoload/GameData.gd"
RNG="*res://autoload/RNG.gd"
EventBus="*res://autoload/EventBus.gd"
Combat="*res://autoload/Combat.gd"
SaveSystem="*res://autoload/SaveSystem.gd"
SceneFlow="*res://autoload/SceneFlow.gd"
AudioDirector="*res://autoload/AudioDirector.gd"

[physics]
common/physics_ticks_per_second=60          # §2.14 fixed step
common/max_physics_steps_per_frame=8
3d/default_gravity=24.0                       # tuned so juggle hang ≈ bible frames

[display]
window/size/viewport_width=1280
window/size/viewport_height=960               # 4:3 window (320x240 ×4 integer)
window/stretch/mode="viewport"
window/stretch/aspect="keep"                  # letterbox to 4:3
window/vsync/vsync_mode=1

[rendering]
textures/default_filters/use_nearest_mipmap_filter=true
anti_aliasing/quality/msaa_3d=0               # §4.1 no AA
anti_aliasing/quality/screen_space_aa=0
textures/default_filters/anisotropic_filtering_level=0
environment/defaults/default_environment="res://resources/retro_world_environment.tres"

[rendering.environment]
defaults/default_clear_color=Color(0.102,0.122,0.18,1)   # #1a1f2e fog color
```

**Present-at-30 decision (§4.8):** set `Engine.max_fps = 30` in `Main.gd._ready()` (kept as a constant so it's documented and toggleable), while physics stays at 60. Combat numbers are frame-count based, so the visual judder costs nothing.

### Input map (`[input]` section — names are the §2.13 contract)

Every action below is added with **both** a gamepad and a keyboard binding (§6). The tap-vs-hold split (`Dodge`/`Sprint` and `Parry`/`Block` share a physical button) is resolved in code at frame 10, **not** by two separate Godot actions — `combat.json:tapHoldThresholdFrames`.

```
MoveLeft/Right/Forward/Back  (WASD + LeftStick axes)
CameraX / CameraY            (mouse motion handled in code + RightStick axes)
LightAttack   (LMB / pad X)        HeavyAttack  (RMB / pad Y)
Dodge         (Space / pad B)      Sprint       (Shift / pad B-hold)
Block         (Q-hold / LB-hold)   Parry        (Q-tap / LB-tap or MMB)
LockOn        (Tab/MB4 / R3)       TargetSwitchLeft "[" / TargetSwitchRight "]"
UseFlask      (R / DpadUp)         Special1 (F / R1)   Special2 (C / DpadRight)
Cauterize     (V-hold / R2+L2)     Interact (E / pad A)   Pause (Esc / Start)
```

Note: `MoveX/MoveY` from the bible are split into four Godot digital+analog actions and recombined into a `Vector2` via `Input.get_vector(...)` so keyboard and stick feed the same locomotion code.

---

## 4. Autoload singletons (the spine)

| Autoload | Responsibility | Key API |
|---|---|---|
| **GameData** | Loads all shared JSON into Resource dictionaries once at boot; the read-only design DB. | `GameData.move("player-light-1") -> MoveData`, `GameData.boss(id)`, `GameData.constants` (`CombatConstants`), `GameData.weapon(id)`, `GameData.tier_color(tier)`. |
| **RNG** | The §2.14 seeded xorshift128 PRNG, seed `0x41455448`. Boss AI and any "random" draw from here only; never `randi()`. Logs seed at encounter start. | `RNG.reseed(0x41455448)`, `RNG.next_float()`, `RNG.weighted_pick(weights)`. |
| **Combat** | Pure stateless rule math: damage resolution, poise/stagger tier from poise damage, hitstop frames, Flow FP math + variety multiplier, i-frame queries. No node state. | `Combat.resolve_hit(attacker, target, MoveData, hit_index)`, `Combat.flow_gain(move_id, history)`, `Combat.hit_reaction(poise_dmg, target)`. |
| **EventBus** | Global signals to decouple combat → HUD/audio/AI. | signals: `hit_landed(attacker,target,move,dmg)`, `flow_changed(rank,fp)`, `boss_phase_changed(boss,phase)`, `player_died`, `checkpoint_rested`, `enemy_died`. |
| **SaveSystem** | Read/write `user://save_slot_0.tres` (Godot `Resource`) **and** mirror a `user://save_slot_0.json`. Resource for speed, JSON for cross-engine comparability/inspection. | `SaveSystem.rest_at(stone_id)`, `SaveSystem.load()`, `SaveSystem.record_death(pos)`. |
| **SceneFlow** | Owns the world-scene slot in `Main`; loads/unloads area scenes; handles fog-wall transitions, respawn, the one-way E1 drop, boss-arena commit. | `SceneFlow.goto_area(area_id, spawn_id)`, `SceneFlow.respawn()`. |
| **AudioDirector** | Bus routing + music/ambience cross-fades on EventBus signals (boss phase → music layer). | `AudioDirector.play_sting("boss_phase2")`, bus volume control. |

`GameData`, `RNG`, `Combat` are pure/data — trivially unit-testable headlessly via `godot --headless --script test_*.gd` (CI can validate the §2.14 contract without a display).

---

## 5. Scenes & scripts — concrete list with responsibilities

### 5.1 `Main.tscn` (hand-authored root)
```
Main (Node)  [Main.gd]
├── RetroViewport (SubViewport, 320×240, snap2d, nearest)   # §8 low-res target
│   └── WorldRoot (Node3D)                                  # SceneFlow loads areas here
│       └── WorldEnvironment + DirectionalLight3D (key)
├── RetroDisplay (TextureRect/SubViewportContainer)         # upscales viewport, nearest
│   └── (material = posterize_dither.gdshader)              # screen-space posterize+dither
├── HUDLayer (CanvasLayer)
│   └── HUD (instance of hud/HUD.tscn)
└── PauseMenu (CanvasLayer, hidden)
```
`Main.gd` sets `Engine.max_fps=30`, calls `GameData.boot()` then `SceneFlow.goto_area("E1", "start")`.

### 5.2 Player — `player/Player.tscn` (hand-authored)
```
Player (CharacterBody3D)  [PlayerController.gd]
├── CollisionShape3D (capsule)
├── MeshInstance3D (greybox or skinned model later)
├── AnimationPlayer
├── AnimationTree (StateMachine root)  [drives combat anim states]
├── Hurtbox (Area3D, layer=player_hurt)              [HurtboxComponent.gd]
├── WeaponPivot (Node3D)
│   └── Hitbox (Area3D, monitoring=false default)    [HitboxComponent.gd]
├── HealthComponent (Node)   [health.gd]   # HP 1000
├── PoiseComponent (Node)    [poise.gd]    # poise 60, regen 30/s
├── StaminaComponent (Node)  [stamina.gd]  # 100, +40/s after 0.5s
├── AetherComponent (Node)   [aether.gd]   # AE 0..100, built only by varied hits
├── FlowComponent (Node)     [flow.gd]     # FP 0..10000, ranks D..S
├── DodgeComponent (Node)    [dodge.gd]    # i-frame windows
└── LockOnComponent (Node)   [lock_on.gd]  # 22m / ±60° acquisition
```

| Script | Responsibility |
|---|---|
| `PlayerController.gd` | Top-level state owner. Reads input via `Input.get_vector`, drives `CharacterBody3D.velocity` + `move_and_slide`, dispatches to a small player FSM (`Locomotion`, `Attacking`, `Dodging`, `Blocking`, `Drinking`, `Staggered`, `Juggled`). Strafe-relative movement when locked. All on `_physics_process`. |
| `dodge.gd` | Frame-counted roll/backstep. Exposes `is_invincible()` (frames 5–17 of 30; backstep 5–11 of 18). Distance 4.0 m / 2.0 m / 3.0 m. Cancel window frames 25–30 buffers next action. |
| `stamina.gd` | Costs table (§2.2). Refuses actions when unaffordable; mid-string swing that can't pay ends the string. Regen +40/s after 0.5 s idle. |
| `flow.gd` | Tracks last 6 distinct move IDs; variety multiplier 2.0/1.3/0.5; thresholds D/C/B/A/S; instant −40% FP and 2× decay 3 s on damage taken; grants AE = `floor(rankIndex × 1.5)` per landing hit. Emits `flow_changed`. **This is the load-bearing DMC↔Souls coupling.** |
| `aether.gd` | Holds AE; spends on specials; Cauterize free-specials window. |
| `health.gd` / `poise.gd` | HP (no regen) and poise/stagger (regen after 1.0 s; hyper-armor 50% reduction on heavy frames 8+). |
| `lock_on.gd` | Acquisition cone, target switch (deadzone, 150 ms cooldown), break conditions (death / 30 m / LoS 2 s). Tells the camera who to frame. |

### 5.3 Camera — `camera/PlayerCamera.tscn` (hand-authored)
```
PlayerCamera (Node3D)  [camera_rig.gd]
└── SpringArm3D (length 4.0, collision against world)
    └── Camera3D
```
`camera_rig.gd`: free-look from `CameraX/CameraY` when unlocked; when `LockOnComponent` has a target, frames the midpoint of Warden+target and pitch-clamps. SpringArm3D auto-handles wall collision (Godot strength: built-in). Micro-shake on hitstop via additive offset.

### 5.4 Combat scaffolding scripts (`scripts/combat/`)
| Script | Responsibility |
|---|---|
| `HitboxComponent.gd` | Area3D that, when a `MoveData` hit goes active (frame in `active[0..1]`), enables monitoring with the data-defined capsule/sphere (§5.1 — shape/radius/length/offset). On overlap with a `HurtboxComponent`, calls `Combat.resolve_hit`, applies hitstop to both, emits `hit_landed`. One hit per target per active window. |
| `HurtboxComponent.gd` | Receives hits; routes to owner's health/poise; honors i-frames (`DodgeComponent.is_invincible()`), block reduction, parry window. |
| `HitstopController.gd` | On a connecting hit, sets `Engine.time_scale`-free local freeze: zeroes both actors' `AnimationTree` advance for N frames (light 4 … parry 14) so determinism holds without touching global time. |
| `comboresolver.gd` | Walks `MoveData.comboNext`; enforces 18-frame link window and 6-frame input buffer; handles launcher → aerial rave/slam juggle chains and the §2.7 3-extension cap. |

### 5.5 Enemies & bosses (`scenes/enemies/`, `scenes/bosses/`)
Each enemy/boss is `CharacterBody3D` with the same component set (Health/Poise/Hurtbox/Hitbox) plus an AI brain. **Bosses and enemies share one HSM** (next section), differing only by their JSON-loaded `BossData`/`EnemyData`.

### 5.6 HUD — `hud/HUD.tscn` (Control nodes, hand-authored)
```
HUD (Control)  [hud.gd]
├── HPBar (TextureProgressBar, red, segmented)
├── StaminaBar (#78e6a0)
├── AetherBar (#50c8ff)
├── FlowMeter (vertical rune column + big rank letter, gold→white-hot)
├── FlaskCount (icon ×N, bottom-left)
├── BossBar (wide, bottom-center, name + phase ticks)  [boss_bar.gd]
└── LockOnReticle (4-px gold bracket)  [reticle.gd]
```
Rendered inside the 320×240 SubViewport so it's appropriately chunky. `hud.gd` subscribes to EventBus signals — never polls.

---

## 6. Boss / enemy AI — reusable hierarchical State machine

A LimboAI-shaped HSM, hand-rolled so the project has **no addon install step**. Data-driven from `bosses.json` / `enemies.json`.

```
ai/
├── ai_brain.gd        # Node attached to each actor. Owns state stack, blackboard, ref to BossData/EnemyData.
├── ai_state.gd        # base class: enter()/exit()/physics_tick(dt)/can_transition()
├── states/
│   ├── idle_state.gd        # acquire/track player
│   ├── approach_state.gd     # NavigationAgent3D pathing into attack range
│   ├── select_attack_state.gd # RNG.weighted_pick over phase attacks eligible by range+cooldown
│   ├── attack_state.gd        # plays a MoveData via AnimationTree; spawns hitbox on active frames
│   ├── reposition_state.gd    # strafe / pillar-dash (TuningKnight P2)
│   ├── stagger_state.gd       # from poise break
│   ├── phase_transition_state.gd # immune transition; resets poise; ignites floor circles (signal)
│   └── dead_state.gd
└── boss_director.gd   # per-boss orchestration: phase thresholds, transition triggers, super-attack hard-counters
```

**How it's reused across mini-boss + main boss:** both `TuningKnight.tscn` and `AetheriusMar.tscn` attach the same `ai_brain.gd` + `boss_director.gd`. The brain reads its `BossData` resource (loaded from `bosses.json`) for phases, `hpEnterPct`, transition frames, and per-attack `moveRef`/`weight`/`min-maxRangeM`/`cooldownFrames`/`punishRecoveryFrames`. The **only** boss-specific code is small hooks (the §3.6 P3 "Fold" super hard-counter: a clean parry at f88–91 *or* Cauterize negates it and opens a 120-frame critical window) — implemented as a virtual `on_super_resolved()` override or a per-boss signal handler. Husk/Acolyte/Sentinel use the same `ai_brain.gd` with a trimmed state set and `EnemyData`.

**Attack selection (deterministic, §2.14):** `select_attack_state` filters phase attacks by current range + cooldown, then `RNG.weighted_pick(weights)` — identical across engines because seed + iteration order are fixed.

**Godot strengths leveraged:** `NavigationAgent3D` + a baked `NavigationRegion3D` per arena (auto-baked in the bootstrap) for approach pathing; `AnimationTree` `StateMachinePlayback` for attack animations with method-call tracks firing hitbox enable/disable on exact frames; built-in physics for grab/knockback displacement.

---

## 7. Loading the shared JSON into Godot Resources

The bridge from `game/shared/design-data/` (authored once, used by all three engines) into typed Godot Resources.

**Resource classes** (`resources/*.gd`, each `class_name` + `extends Resource`) mirror the §5 schemas:

```gdscript
# resources/move_data.gd
@tool
class_name MoveData extends Resource
@export var id: String
@export var kind: String          # light/heavy/launcher/aerial/special/grab/critical
@export var stamina_cost: float
@export var aether_cost: float
@export var total_frames: int
@export var startup: int
@export var active: Vector2i      # [start,end] frame
@export var recovery: int
@export var iframes: PackedInt32Array
@export var hyper_armor_from: int = -1
@export var hits: Array[HitData]  # damage/poiseDamage/hitstop/knockback/launch/hitbox
@export var combo_next: PackedStringArray
@export var flow_move_id: String
```

(Plus `HitData`, `HitboxData`, `BossData`, `BossPhase`, `BossAttackRef`, `WeaponData`, `EnemyData`, `CombatConstants`, `ZoneData`, `TierPalette`.)

**Loader path** — `data/design_data.gd`, called from `GameData.boot()`:

1. **Resolve the shared path.** The shared JSON lives *outside* `res://` (it's at `game/shared/`, sibling to `game/godot/`). Two supported modes:
   - **Editor/dev:** read via absolute path using `ProjectSettings.globalize_path("res://") + "../shared/design-data/..."` (the project is `game/godot/`, so `../shared` is `game/shared`). `FileAccess.open()` works on absolute OS paths in the editor and desktop builds.
   - **Export:** a one-line `@tool` step in the bootstrap copies `game/shared/design-data/` into `res://data/design-data/` so it's packed into the export. `design_data.gd` tries `res://data/design-data/` first, falls back to the `../shared` path. This keeps a single authored source while making exports self-contained.
2. **Parse:** `JSON.parse_string(FileAccess.get_file_as_string(path))`.
3. **Hydrate:** map dictionaries → Resource instances; store in `GameData` dictionaries keyed by `id`. `combat.json` → one `CombatConstants` resource (i-frames, costs, Flow thresholds, `prngSeed`, `tapHoldThresholdFrames`).
4. **Seed RNG** from `constants.prngSeed` (`0x41455448`).
5. **Validate** against `schema/*.schema.json` (the bootstrap's `data_validator.gd` runs the same checks the bible's CI requires; a failing build refuses to boot — Appendix A.1).

Resources are parsed **once** at boot and cached — no JSON touches the combat hot loop.

**Tier palette:** `resources/tier_palette.gd` hard-codes the four tier colors from `src/lib/tiers.ts` (`#50c8ff/#78e6a0/#ebbe5a/#e66e8c`) so corruption glow and the guiding light (`#ebbe5a`, C-traditional) match canon. `EnemyData.tier` drives the glow color via this palette.

---

## 8. Retro N64/PS1 aesthetic in Godot 4

Four named shaders + a `WorldEnvironment` resource + the SubViewport pipeline.

### Pipeline (§4.1 320×240 → upscale)
- `Main.tscn` renders the 3D world into **`RetroViewport` (SubViewport, size = 320×240)** with `scaling_3d_mode = bilinear` disabled, `snap_2d_transforms_to_pixel = true`, `texture_filter = nearest`.
- A `SubViewportContainer`/`TextureRect` (`RetroDisplay`) blits it to the 1280×960 window with **nearest** filtering; window stretch `aspect=keep` letterboxes to 4:3 (§4.1).
- `Engine.max_fps = 30` for the §4.8 cadence; physics stays 60.

### Shaders (exact filenames)

| File | Type | Does |
|---|---|---|
| **`shaders/ps1_vertex_snap.gdshader`** | spatial vertex shader | §4.2 vertex snapping. In `vertex()`: project to clip, snap NDC.xy to a **160×120 cell grid** (`snapped(ndc.xy, 1.0/grid)`), reproject. Quantizes vertices to the 320×240 lattice → PS1 wobble. Applied to all world materials. |
| **`shaders/affine_unlit.gdshader`** | spatial, `render_mode unshaded` + affine UV | §4.3 affine texture warping. Passes UV without perspective correction (multiply UV by a per-vertex `1/w` trick / `render_mode` flag) so textures swim on large near surfaces. Combined with vertex snap in one material on world geo. Flat shading via `render_mode` (per-face normals), vertex-lit only (§4.4). |
| **`shaders/posterize_dither.gdshader`** | canvas_item (screen-space, on `RetroDisplay`) | §4.6 16-bit RGB555 quantization + **Bayer 4×4 ordered dither** during 24→16-bit reduction, strength 1.0. The PS1 banding-hider. |
| **`shaders/retro_world_env.gdshader`** *(or just the env resource)* | — | §4.5 linear fog driver if per-zone tinting needs a custom term beyond `WorldEnvironment`. |

### WorldEnvironment (`resources/retro_world_environment.tres`)
- `fog_enabled = true`, **linear**, start **8 m**, end **36 m**, far-clip **38 m** (§4.5).
- Fog color **`#1a1f2e`** general / **`#2a2418`** in arena F (per-`ZoneData` override — `SceneFlow` swaps the env on area load).
- One key `DirectionalLight3D` + flat ambient; **no** SSAO/SSR/glow/AA (§4.4, §4.1).
- Textures import preset: filter **nearest**, mipmaps **off**, ≤128×128 (§4.7).

**Fog reward beats:** `SceneFlow` lerps fog end → far at the Attunement Stone rest and on main-boss death (§4.5), then back.

---

## 9. `@tool` scene-bootstrap plugin (the "press Play immediately" engine)

`addons/aether_bootstrap/` — an `EditorPlugin` that adds a **Tools menu** group. The headless env can't open the editor, so this is what the *user* runs once on their machine.

`bootstrap_plugin.gd` registers these `add_tool_menu_item` entries:

| Menu item | Calls | Generates |
|---|---|---|
| **Aether ▸ 1. Validate Design Data** | `data_validator.validate_all()` | Checks `game/shared/design-data/*` against `schema/*`; prints pass/fail. |
| **Aether ▸ 2. Generate Greybox World** | `greybox_factory.build_all()` | Writes the 7 area `.tscn` into `scenes_generated/world/` from primitives: `BoxMesh`/`CSGBox3D` rooms (A–F + E1) with `StaticBody3D` collision, doorways, the one-way E1 drop, pit hazard in F (Area3D = instant death), pillar `MeshInstance3D` rows in C, the circular platform + etched-circle `Decal`/mesh in F. Bakes a `NavigationRegion3D` per arena. Places spawn markers (`Marker3D`) for enemies/bosses, the Attunement Stone, fog walls, levers, secret walls, and threads `GuidingLight.tscn` `Path3D` along the critical path. |
| **Aether ▸ 3. Wire Scene Flow** | `scene_factory.build_flow()` | Writes `Main.tscn` references and the area-graph resource (E1→A→B→C→D→E→F + secret branches S1/S2) consumed by `SceneFlow`. |
| **Aether ▸ 4. Copy Shared Data into res://** | `design_data.export_copy()` | Copies `../shared/design-data` → `res://data/design-data` for self-contained export. |
| **Aether ▸ 5. Build Everything + Set Main Scene** | runs 1–4, sets `run/main_scene` | One-click: after this the user presses Play. |

`scene_factory.gd` builds node trees in memory (`Node3D.new()`, `add_child`, `set_owner`), then `PackedScene.pack(root)` + `ResourceSaver.save(packed, "res://scenes_generated/...")`. This is the robust way to "author" `.tscn` — never hand-edit the geometry-heavy ones.

**Which `.tscn` are hand-authored vs generated:**
- **Hand-author (small, stable, reused):** `Player.tscn`, `PlayerCamera.tscn`, the 3 enemy scenes, 2 boss scenes, `HUD.tscn`, and the world *prefabs* (`AttunementStone`, `FogWall`, `LeverPuzzle`, `SecretWall`, `GuidingLight`). These have tuned component trees, not procedural geometry.
- **Generate via plugin (large, greybox, regenerable):** the 7 area scenes in `scenes_generated/world/` and `Main.tscn`'s wiring. Greybox geometry from primitives is exactly what's tedious and fragile to hand-write, so the factory owns it.

---

## 10. World/scene flow, fog-walls, checkpoint, secrets, audio

| System | Scene/script | Notes |
|---|---|---|
| **Scene flow** | `SceneFlow.gd` + area-graph resource | Async-loads area `.tscn` into `WorldRoot`; spawns player at a `Marker3D`; swaps `WorldEnvironment` per `ZoneData`. One-way E1 drop = a teleport trigger Area3D that loads A and seals E1. |
| **Fog-wall gates** | `world/FogWall.tscn` (`Area3D` + fog `GPUParticles3D`/quad) `[fog_wall.gd]` | Boss-commit threshold (§1.5). On player enter → `SceneFlow` locks the room (disables back-door collision), emits `boss_engaged`, AudioDirector swaps to boss music. Mini-boss gate at C, main at F. |
| **Checkpoint** | `world/AttunementStone.tscn` `[attunement_stone.gd]` | `Interact` → `SaveSystem.rest_at("stone-A")`: full HP, full flask, **no** AE refill, respawn non-boss enemies (via `EventBus.checkpoint_rested` → enemies reset), open Stone menu (rename Warden, level-review hooks), brief fog-clear reward beat. Death → `SceneFlow.respawn()` at last stone; drop recoverable "Cinder of Aether" at death spot. |
| **Secrets** | `world/SecretWall.tscn` `[secret_wall.gd]`, `world/LeverPuzzle.tscn` `[lever_puzzle.gd]` | S1: a wall with mismatched fog/missing vertex seam (a shader param flag) that takes heavy/Ground-Current damage to collapse → +1 flask max + lore tablet. S2: lever puzzle solved in the "wrong-but-valid" 4th order opens a false wall → Resonant Edge weapon + +25 starting AE. Both surfaced by the guiding light's dim fork (`GuidingLight.tscn`). |
| **Guiding light** | `world/GuidingLight.tscn` `[guiding_light.gd]` | `Path3D` of pale-gold (`#ebbe5a`) emissive along the critical path; pulses 0.5 Hz; brightens after 8 s of facing-away; forks dim at branch points. Pure soft guidance — never blocks. |
| **Audio** | `AudioDirector.gd` + bus layout `default_bus_layout.tres` | Buses: **Master → Music, SFX, Ambience, UI, Voice**. `AudioStreamPlayer3D` for world SFX (positional), `AudioStreamPlayer` for music/UI. Boss phase signals cross-fade music layers; hitstop pairs with an SFX accent. Voice bus carries Aetherius's guide lines (the P3 transition line, §3.6). |
| **Interaction** | `world/Interactable.gd` base | `Interact` raycast from player; powers Stone, levers, pickups, lore tablets. |

---

## 11. Ordered build milestones (files per milestone)

**M0 — Project boots (greybox, no combat).**
`project.godot`, `Main.tscn`+`Main.gd`, `addons/aether_bootstrap/*` (plugin + factories), `autoload/GameData.gd`+`data/design_data.gd`+all `resources/*.gd`, the four `shaders/*.gdshader` + `retro_world_environment.tres`. → User runs **Build Everything**, presses Play, walks a fog-lit greybox at 320×240. *Deliverable: the retro look is real and the world is walkable.*

**M1 — Player locomotion + camera + lock-on.**
`Player.tscn`+`PlayerController.gd`+`dodge.gd`+`stamina.gd`, `PlayerCamera.tscn`+`camera_rig.gd`, `lock_on.gd`, input map finalized. → Move, sprint, roll with real i-frame windows, lock onto a dummy.

**M2 — Combat core vs a dummy.**
`Combat.gd`, `HitboxComponent.gd`/`HurtboxComponent.gd`/`HitstopController.gd`/`comboresolver.gd`, `health.gd`/`poise.gd`, AnimationTree combat states, `EventBus.gd`. Loads `moves.json`/`weapons.json`. → Combos, launchers, hitstop, poise/stagger, backstab/parry/riposte all resolve from data.

**M3 — DMC layer + specials.**
`flow.gd`, `aether.gd`, specials (`Ground Current`/`Leyline Lance`/`Cauterize`). → Flow meter ranks, variety multiplier, AE generation coupling, three leyline specials.

**M4 — Enemies + shared AI HSM.**
`ai/ai_brain.gd`+`ai_state.gd`+`states/*`, `Husk/Acolyte/Sentinel.tscn`, `enemies.json` load, `RNG.gd`, `NavigationRegion3D` baking in the factory. → Roster fights back deterministically.

**M5 — Bosses.**
`TuningKnight.tscn`+`AetheriusMar.tscn`, `boss_director.gd`, `phase_transition_state.gd`, `bosses.json` load, boss-specific hooks (P3 Fold hard-counter). → Both bosses, all phases, transitions, fog-gates.

**M6 — World systems.**
`SceneFlow.gd`+area-graph, `FogWall/AttunementStone/LeverPuzzle/SecretWall/GuidingLight.tscn` + scripts, `SaveSystem.gd`, the 7 generated area scenes wired into the E1→F flow with S1/S2 secrets. → Full slice traversal + checkpoint/death/respawn.

**M7 — HUD + audio + polish.**
`HUD.tscn`+`hud.gd`/`boss_bar.gd`/`reticle.gd`, `AudioDirector.gd`+bus layout, fog reward beats, boss-kill telemetry log line (Appendix A.6), `DEVIATIONS.md`. → Shippable comparable slice.

---

## 12. Exactly what the user does in-editor (+ gotchas)

**Steps:**
1. Install **Godot 4.3 stable (standard build, not Mono/.NET)**.
2. **Import** the project: Godot Project Manager → Import → select `/home/user/aether/game/godot/project.godot`.
3. First open: let the editor finish the initial import scan (textures get the nearest/no-mipmap preset; shaders compile).
4. **Project ▸ Project Settings ▸ Plugins** → enable **Aether Bootstrap**.
5. **Tools ▸ Aether ▸ 5. Build Everything + Set Main Scene** (runs validate → greybox → flow → copy-data → sets `run/main_scene`).
6. Confirm **Project ▸ Project Settings ▸ Application ▸ Run ▸ Main Scene** = `res://scenes/Main.tscn` (the menu item sets it; verify).
7. Press **Play (F5)**.

**Version / import gotchas:**
- **Use the standard build, not Mono.** The project is GDScript; a Mono editor isn't needed and only adds friction.
- **Shared-data path:** the JSON lives at `game/shared/` (a sibling of `game/godot/`, outside `res://`). If the user moves the Godot folder away from the repo, the `../shared` relative read breaks — run **Tools ▸ Aether ▸ 4** first, which copies data into `res://data/` so the game is self-contained.
- **Texture filtering:** if any imported texture looks smooth, re-import with **Filter = Nearest, Mipmaps = off** (the project default preset should catch this; older imports may need a manual re-import).
- **`SubViewport` blurry / not 4:3:** confirm `RetroViewport.snap_2d_transforms_to_pixel=true`, container filter nearest, and window stretch `aspect=keep`.
- **30 fps cap:** `Engine.max_fps=30` is set in code; if the user wants 60-present, flip the constant in `Main.gd` — combat is unaffected (frame-count based, §4.8).
- **`@tool` re-runs are safe:** the factory only writes to `scenes_generated/`; hand-authored scenes are never overwritten.
- **Determinism:** never use `randi()`/`randf()` anywhere in AI/combat — only `RNG.*` (seeded `0x41455448`). A grep for `randi(`/`randf(` in CI should return zero hits in `scripts/`, `ai/`, `autoload/Combat.gd`.
- **`config_version=5`** is correct for Godot 4.x; a `config_version=4` would mean the file was written by Godot 3 — regenerate.

---

## Critical Files for Implementation
- `/home/user/aether/game/godot/project.godot` — engine config, fixed-60 physics, input map, autoloads, retro render settings.
- `/home/user/aether/game/godot/addons/aether_bootstrap/bootstrap_plugin.gd` (+ `scene_factory.gd`, `greybox_factory.gd`) — the `@tool` plugin that generates the greybox world so the user can press Play immediately.
- `/home/user/aether/game/godot/autoload/Combat.gd` (+ `RNG.gd`) — deterministic rule math (damage/poise/Flow/hitstop) honoring the §2.14 contract.
- `/home/user/aether/game/godot/data/design_data.gd` (+ `resources/*.gd`) — loads `game/shared/design-data/*.json` into typed Godot Resources, the cross-engine single source of truth.
- `/home/user/aether/game/godot/scripts/ai/ai_brain.gd` (+ `boss_director.gd`) — the reusable hierarchical state machine shared by enemies, mini-boss, and main boss, driven by `bosses.json`/`enemies.json`.

Existing repo files the data layer mirrors (verified): `/home/user/aether/src/lib/tiers.ts` (tier colors → `tier_palette.gd`) and `/home/user/aether/src/lib/types.ts` (the `Tier` enum → `EnemyData.tier`).
