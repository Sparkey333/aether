# AETHER: THE SUNDERED NEXUS — Unity 6 (URP) Implementation Architecture
### Vertical-Slice Engine Build · `game/unity/` · v1.0

> Scope contract: this is the Unity build of the engine-agnostic bible. Every combat number is loaded from `game/shared/design-data/*` at runtime — Unity owns *behavior and rendering*, never *tuning*. The deliverable is a **headless-authored, hand-runnable** project: the user clones, opens in Unity 6, lets UPM resolve, runs one menu item, and presses Play. No `.unity` YAML is hand-authored; scenes are built procedurally by an Editor script.

---

## 0. Coexistence & Repo Layout

The Next.js/Tauri app at repo root is **untouched**. Unity lives in a sibling tree. Crucial detail: Unity's own `.gitignore` lives **inside** `game/unity/` so it cannot fight the root `.gitignore` (which ignores `/build`, `/out`, etc. — none of which collide, but isolation is cleaner).

```
/home/user/aether/
├── (existing Next.js + Tauri — DO NOT TOUCH)
├── src/lib/tiers.ts                 ← reused as the color contract (see §11)
├── content/canon/*.md               ← lore source for ScriptableObject text
├── game/
│   ├── shared/
│   │   └── design-data/             ← the cross-engine JSON (bible §5). Unity READS these.
│   │       ├── combat.json
│   │       ├── moves/moves.json
│   │       ├── bosses/bosses.json
│   │       ├── enemies/enemies.json
│   │       ├── weapons/weapons.json
│   │       └── schema/*.schema.json
│   └── unity/                       ← THE UNITY PROJECT ROOT
│       ├── .gitignore               ← Unity-specific (see §1.4)
│       ├── Packages/manifest.json
│       ├── Packages/packages-lock.json   (generated on first resolve; committed)
│       ├── ProjectSettings/*.asset
│       ├── Assets/
│       │   ├── Aether/
│       │   │   ├── Runtime/         ← all gameplay C# (asmdef: Aether.Runtime)
│       │   │   ├── Editor/          ← bootstrap + tooling (asmdef: Aether.Editor)
│       │   │   ├── Data/            ← ScriptableObject .asset instances (generated)
│       │   │   ├── Settings/        ← URP assets, Renderer, Input Actions
│       │   │   ├── Shaders/         ← retro HLSL + Shader Graph
│       │   │   ├── Art/             ← placeholder materials, palette LUT
│       │   │   └── DesignData/      ← StreamingAssets symlink target (see §11.1)
│       │   └── StreamingAssets/design-data/  ← build-time copy of shared JSON
│       └── README-UNITY.md          ← the "what you do manually" doc (§13)
```

**Why `StreamingAssets`:** the shared JSON lives outside `Assets/`. A symlink is fragile cross-platform; instead the bootstrap **and** a `Build` preprocessor copy `game/shared/design-data/` into `Assets/StreamingAssets/design-data/` so `Application.streamingAssetsPath` resolves identically in Editor and player. The copy is git-ignored (it's a derived artifact); the source of truth stays in `game/shared`.

---

## 1. Project Foundation

### 1.1 Unity version
**Unity 6 LTS — `6000.0.32f1`** (any `6000.0.x` LTS patch ≥ .23 is fine; pin one in `ProjectSettings/ProjectVersion.txt`). Rationale: URP 17, Render Graph stable, `ScriptableRendererFeature` API settled, Input System 1.11, Cinemachine 3.x (the component-rewrite — important, the API differs hard from CM 2.x).

### 1.2 `Packages/manifest.json` (exact)

```jsonc
{
  "dependencies": {
    "com.unity.render-pipelines.universal": "17.0.3",
    "com.unity.inputsystem": "1.11.2",
    "com.unity.cinemachine": "3.1.2",
    "com.unity.ugui": "2.0.0",
    "com.unity.textmeshpro": "3.2.0-pre.10",
    "com.unity.mathematics": "1.3.2",
    "com.unity.burst": "1.8.18",
    "com.unity.test-framework": "1.4.5",
    "com.unity.ide.rider": "3.0.34",
    "com.unity.ide.visualstudio": "2.0.22",
    "com.unity.shadergraph": "17.0.3",
    "com.unity.modules.audio": "1.0.0",
    "com.unity.modules.physics": "1.0.0",
    "com.unity.modules.ui": "1.0.0",
    "com.unity.modules.uielements": "1.0.0",
    "com.unity.modules.imgui": "1.0.0",
    "com.unity.modules.jsonserialize": "1.0.0",
    "com.unity.modules.animation": "1.0.0",
    "com.unity.modules.particlesystem": "1.0.0"
  },
  "enableLockFile": true,
  "resolutionStrategy": "highest"
}
```

Opinionated notes:
- **`shadergraph` is listed but we author the core retro shaders in handwritten HLSL** (§9). Shader Graph stays for one thing only: the dissolve/glow on fog-walls and the boss great-circle floor, where node-based iteration is faster and the affine/vertex-snap requirement doesn't apply.
- **Burst + Mathematics** are pulled for the deterministic fixed-step combat loop and the xorshift128 PRNG — `float`/`int` math under Burst is bit-stable, which matters for the §2.14 determinism contract.
- **No Timeline, no Visual Scripting, no Addressables.** Slice scope. Bosses are coded state machines + ScriptableObjects, not Timeline tracks.
- `textmeshpro` is pinned but the HUD font is a **bitmap/point-filtered** font asset (§8), not SDF — SDF anti-aliases, which violates the retro contract. TMP is used for layout only, with a pixel font + point sampling.

### 1.3 ProjectSettings essentials (`ProjectSettings/*.asset`, authored as YAML by the bootstrap-adjacent settings, since these are stable to hand-write unlike scenes)

| Setting | Value | Why |
|---|---|---|
| **Scripting Backend** | Mono (Editor), IL2CPP (player builds) | IL2CPP for ship; Mono for fast iteration |
| **Api Compatibility** | .NET Standard 2.1 | default, fine |
| **Active Input Handling** | **Input System Package (New)** | bible mandates the new Input System; old manager OFF |
| **Color Space** | **Gamma** | PS1/N64 look. Linear fights the 16-bit RGB555 quantize. Opinionated and load-bearing — see §9.6 |
| **Fixed Timestep** | **0.01666667** (1/60) | the §2.14 contract; all combat logic is in `FixedUpdate` |
| **Maximum Allowed Timestep** | 0.1 | clamp the spiral-of-death |
| **VSync** | Don't Sync | we cap framerate manually to 30 (§9.7) |
| **Default Graphics API** | platform default (Vulkan/DX11/Metal) | URP handles it |
| **Quality** | single tier "Retro", URP asset assigned, all higher tiers deleted | one comparable target |
| **Physics** | gravity (0,-30,0); layers defined (§5.2); auto-sync transforms OFF | bigger-than-earth gravity for snappy souls feel; matches bible's juggle math at 60Hz |
| **Time → Capped Framerate** | `Application.targetFrameRate = 30` (set in code, §9.7) | aesthetic cadence |
| **Player → Color Gamut / HDR** | HDR OFF | 16-bit output target |
| **Splash** | disabled (or default if Personal license) | — |

**Physics layers (defined in `TagManager.asset`):** `Player`, `Enemy`, `PlayerHitbox`, `EnemyHitbox`, `Hurtbox`, `Environment`, `Interactable`, `Trigger`, `Hazard`. The hitbox/hurtbox layer matrix is the load-bearing part — only `PlayerHitbox×Hurtbox(Enemy)` and `EnemyHitbox×Hurtbox(Player)` collide; hitboxes never collide with environment (combat uses `OverlapCapsule` queries on hurtbox layers, not physical collision — see §4.3).

### 1.4 Unity `.gitignore` (at `game/unity/.gitignore`)

```gitignore
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Bb]uilds/
[Ll]ogs/
[Uu]ser[Ss]ettings/
[Mm]emoryCaptures/
[Rr]ecordings/
.vs/
.idea/
.gradle/
ExportedObj/
*.csproj
*.sln
*.user
*.unityproj
*.booproj
*.svd
*.pidb
*.suo
*.tmp
*.apk
*.aab
*.unitypackage
*.app
crashlytics-build.properties
/[Aa]ssets/[Ss]treamingAssets/design-data/    # derived copy of game/shared
*.pidb.meta
*.pdb.meta
*.mdb.meta
sysinfo.txt
```

**Committed (NOT ignored):** `Assets/**` (incl. all `.meta`), `Packages/manifest.json`, `Packages/packages-lock.json`, `ProjectSettings/**`. Never commit `Library/`. `.meta` files are mandatory — losing them breaks every reference.

---

## 2. Assembly Definitions

Two asmdefs keep compile times sane and enforce the Editor/Runtime boundary (Editor code must never ship):

- **`Aether.Runtime.asmdef`** (`Assets/Aether/Runtime/`) — references: Input System, Cinemachine, URP runtime, TMP, Unity.Mathematics, Unity.Burst. `autoReferenced: true`.
- **`Aether.Editor.asmdef`** (`Assets/Aether/Editor/`) — `includePlatforms: ["Editor"]`, references `Aether.Runtime`. Contains the scene bootstrap (§10).
- (optional) **`Aether.Tests.asmdef`** — references Runtime + Test Framework. Holds determinism tests (PRNG bit-stability, combo-window frame math).

---

## 3. Runtime Architecture — the big picture

**Decision: CharacterController for the player, NOT Rigidbody.** Souls-style locomotion is kinematic, deterministic, and authored — you want exact roll distances (4.0 m over 30 frames), no physics jitter, no friction surprises, and frame-perfect i-frame movement. Rigidbody's continuous-collision/solver introduces variance that breaks the §2.14 determinism contract. The player is a `CharacterController` driven by an explicit velocity integrator in `FixedUpdate`. Enemies/bosses are **also** kinematic — `CharacterController` for the humanoid bosses, `NavMeshAgent` only for the dumb roaming `Husk` pathing (and even then `updatePosition=false`, we read the agent's desired velocity and feed our own controller, so combat states fully own movement).

**Gravity:** custom, per-actor (the bible's juggle state needs 40% gravity — that's an actor-level scalar, not Physics.gravity). `Physics.gravity` stays at (0,-30,0) for the rare ragdoll/hazard pit, but locomotion integrates its own `verticalVelocity`.

### 3.1 Core loop & determinism (`SimClock`)

```
GameBootstticker (MonoBehaviour, FixedUpdate @ 1/60)
  └─ ticks every IFixedTickable in deterministic registration order:
       1. InputBuffer.Tick()        (consume buffered inputs)
       2. PlayerController.Tick()
       3. each EnemyController.Tick()
       4. each BossController.Tick()
       5. HitboxSystem.Resolve()     (single global pass — see §4.3)
       6. ResourceSystem.Tick()      (stamina/AE/flow regen+decay)
       7. HitstopController.Tick()   (global freeze gate)
```

Everything combat-relevant implements `IFixedTickable { void Tick(int frame); }` and is registered with a central `SimClock` that increments an `int frame` counter. **No combat code reads `Time.deltaTime`** — only the fixed `frame` integer and `Time.fixedDeltaTime`. This is what makes Unity match the other two engines.

`HitstopController` is global: when active, it sets a `bool frozen` and the player/enemy `Tick` methods early-out on animation/movement advancement but the freeze countdown still ticks. This gives the bible's exact per-class hitstop (§2.12) without `Time.timeScale` (which would desync the fixed step).

---

## 4. C# Scripts — full inventory

Grouped by subsystem. Format: **`File.cs` — responsibility — key methods/fields — interactions.**

### 4.1 Foundation / data loading

- **`SimClock.cs`** — owns the global frame counter and the ordered `IFixedTickable` registry. `int CurrentFrame`, `Register/Unregister(IFixedTickable, int order)`, `FixedUpdate()` → ticks all in order, increments frame. Singleton, `DefaultExecutionOrder(-1000)`.
- **`IFixedTickable.cs`** — `void Tick(int frame);` interface.
- **`Xorshift128.cs`** — the seeded PRNG from §2.14. `struct` (Burst-friendly). `Xorshift128(uint seed)`, `uint NextUInt()`, `float NextFloat01()`, `int Range(int,int)`. Seed `0x41455448`. **Bit-identical to the other engines' xorshift** — this is a tested contract (`Aether.Tests`).
- **`DesignDataLoader.cs`** — loads & deserializes all `StreamingAssets/design-data/*.json` at boot into typed C# records. `static CombatConstants Combat`, `MoveDef GetMove(string id)`, `BossDef GetBoss(string id)`, etc. Uses `JsonUtility` where shapes allow, falls back to a tiny hand-rolled parser or Newtonsoft for the nested arrays (JsonUtility can't do top-level arrays/dictionaries cleanly — we wrap them). Validates against expected keys; logs a hard error + refuses Play if a file is missing (mirrors the bible's "fails validation = not comparable = rejected").
- **`CombatConstants.cs`, `MoveDef.cs`, `BossDef.cs`, `EnemyDef.cs`, `WeaponDef.cs`** — plain `[Serializable]` data records mirroring the §5 schemas exactly. These are the deserialization targets, distinct from the authored ScriptableObjects (§7) which *wrap* them for inspector editing.

### 4.2 Player

- **`PlayerController.cs`** — top-level player brain; owns the `CharacterController`, the active `PlayerState`, and references to all player subsystems. `Tick(frame)` drives: input read → state machine update → locomotion integrate → `CharacterController.Move()`. Fields: `PlayerState current`, `Locomotion`, `CombatComponent`, `ResourcePool`, `Health`, `LockOnController`. It is the only thing that calls `controller.Move`.
- **`PlayerLocomotion.cs`** — converts intent → displacement. `Vector3 ComputeMove(frame)`, handles strafe-relative movement when locked-on, sprint, roll displacement curve (4.0 m over frames 1–30 with the deceleration profile), gravity, slope. Reads `MoveX/MoveY` from the input buffer. Movement is **velocity authored per state**, not physics-driven.
- **`PlayerStateMachine.cs`** + **`PlayerState.cs`** (abstract) with concrete states: `LocomotionState`, `DodgeState` (owns i-frame window frames 5–17, backstep variant), `AttackState` (drives the combo machine), `BlockState`, `ParryState` (active window frames 3–9), `DrinkFlaskState` (52f, heal on frame 40, interruptible), `HitReactState` (flinch/stagger/launch/knockdown), `DeadState`. Each `Enter/Tick(frame)/Exit`, `CanTransitionTo`. The state machine enforces the §2.3 cancel windows and §2.7 combo links.
- **`PlayerCombat.cs`** — the **combo state machine** (DMC layer). Tracks current string, the 18-frame link window, buffered next input, branch resolution (`comboNext` from move data), launcher → juggle entry, aerial states. `TryQueueAttack(AttackType)`, `AdvanceCombo(frame)`, `ResolveActiveFrames(frame)` → spawns hitboxes via `HitboxSystem`. Reads `MoveDef`s; emits Flow events on landed hits.
- **`PlayerResources.cs`** (or shared `ResourcePool.cs`) — Health/Stamina/Aether. Stamina regen with the 0.5s delay + sprint-suspend rule; refuses actions whose cost exceeds current (§2.2); Aether granted by Flow rank (§2.10). `bool TrySpend(stamina)`, `void AddAether(int)`, `Tick(frame)`.
- **`FlowMeter.cs`** — the Style system. Internal FP 0–10000, rank D→S, the 6-move variety ring buffer, novel/recent/repeat multipliers, decay table, the −40%-on-damage + doubled-decay-3s punish. `OnHitLanded(moveId, isAerial)`, `OnDamageTaken()`, `OnParry/OnBackstab/OnPerfectDodge()`, `int RankIndex`, `Tick(frame)`. Drives `AddAether(floor(rankIndex*1.5))` per §2.10 and the HUD.
- **`FlaskController.cs`** — charges (3, +1 from secret S1), 400 HP heal on frame 40, consume-even-if-interrupted. Refilled by `AttunementStone`.
- **`LeylineSpecials.cs`** — Ground Current / Leyline Lance / Cauterize. Each checks AE cost via `PlayerResources`, plays its move, spawns its hitbox/beam. Cauterize sets an 8s buff flag (+30% dmg, hyper-armor, AE-free specials) read by `PlayerCombat`/`LeylineSpecials`.

### 4.3 Combat resolution (shared player↔enemy)

- **`Hitbox.cs`** — a data-driven volume spawned during a move's active frames. Holds `shape (sphere/capsule)`, `radius/length/offset` from `MoveDef`, `damage/poiseDamage/hitstop/knockback/launch`, owner ref, and a per-activation hit-set (so one swing hits each target once). **Not a Unity collider** — it's a logical capsule resolved by `Physics.OverlapCapsuleNonAlloc` against the hurtbox layer. This matches the bible's "capsules from data, not mesh colliders" determinism rule (§2.14.5).
- **`Hurtbox.cs`** — a logical capsule on each actor (player, enemies, bosses) registered with `HitboxSystem`; routes a confirmed hit to its `Damageable`.
- **`HitboxSystem.cs`** — the single global resolution pass (`SimClock` step 5). Iterates active hitboxes, overlaps against eligible hurtboxes, resolves the *attacker's frame-of-contact-authoritative* hit (§2.14.4), applies damage/poise/knockback/launch, triggers hitstop, fires Flow events, spawns hit VFX/SFX. One pass = deterministic ordering.
- **`Damageable.cs`** — the Health + Poise component (bible §2.5). `int hp`, `Poise poise`, `int poiseRegen`, `launchable`. `TakeHit(HitInfo)` → applies damage, subtracts poise, picks the §2.5 reaction tier (flinch/stagger/launch/knockdown), triggers hyper-armor reduction if armored swing, raises `OnDeath`. Reused by player and every enemy/boss.
- **`PoiseComponent.cs`** — poise value + 1.0s-delayed regen, stagger reset. Split out so bosses can suspend regen for 1.5s post-stagger (mini-boss rule).
- **`HitInfo.cs`** — struct passed through resolution: damage, poiseDamage, hitstop, knockback, launch, hitDirection, attacker, isCritical/isRiposte, moveId.
- **`HitstopController.cs`** — global freeze (§2.12). `Request(frames)`, `bool Frozen`, `Tick(frame)`. Player/enemy ticks honor `Frozen`. Adds optional camera micro-shake via Cinemachine impulse.
- **`KnockbackController.cs`** — applies the §2.12 displacement over a few frames when the target isn't in a fixed reaction.
- **`BackstabSystem.cs`** — checks the 1.4 m / ±45° rear cone, arms the Critical prompt, runs the fixed backstab (2.5×) and riposte-after-parry (3.0×) animations with their i-frames.

### 4.4 Camera & targeting

- **`CameraRig.cs`** — wraps a **Cinemachine 3** `CinemachineCamera` (free-look style) for the default third-person follow, and a second `CinemachineCamera` for the locked-on framing (group framing of Warden + target). Blends between them on lock-on toggle. Owns the `CinemachineTargetGroup` used when locked.
- **`LockOnController.cs`** — the targeting system (§2.4). `TryToggleLockOn()` (22 m radius, ±60° cone, nearest valid), `SwitchTarget(dir)` (screen-space next target, 0.4 stick deadzone / 120px mouse, 150ms cooldown), break conditions (death / >30 m / LoS lost >2.0s). Exposes `Transform CurrentTarget` to `PlayerController`, `CameraRig`, and the HUD reticle. Maintains the candidate list each tick from registered `Targetable` components.
- **`Targetable.cs`** — marks an enemy/boss as lockable, exposes the lock point (chest height) and validity (alive, in-LoS).

### 4.5 Enemies & Boss AI (the reusable core)

- **`ActorController.cs`** (abstract base) — shared brain for all non-player actors: owns `CharacterController`, `Damageable`, `Hurtbox`, a movement helper, target-tracking (the player), and a hit-reaction pipeline. `Tick(frame)`. Enemies and bosses both derive logic from here.
- **`EnemyController.cs`** — simple enemies (Husk, Acolyte, Sentinel). A tiny behavior FSM: `Idle → Aggro → Approach → Attack → Recover`. Husk uses NavMesh desired-velocity; Acolyte kites + fires `gold-bolt` projectiles; Sentinel is slow/hyper-armored. Reads its `EnemyDef` (HP/poise/speed/attacks) and the referenced `MoveDef`s. Respawns on Attunement Stone rest.
- **`BossController.cs`** — **the reusable boss brain, shared by mini-boss and main boss.** It is data-driven entirely by a `BossDefinition` ScriptableObject (which wraps `bosses.json`). Responsibilities:
  - **Phase management:** tracks HP %, triggers phase transitions at `hpEnterPct` thresholds, plays the immune transition animation (`transitionInFrames`, `immuneDuringTransition`), resets poise on transition.
  - **Attack selection:** each decision tick, filter the current phase's `attacks` by `minRangeM/maxRangeM` to player and per-attack `cooldownFrames`, then **weighted-random via the shared `Xorshift128`** (seed logged at encounter start). This is the §5.2 determinism note implemented.
  - **Attack execution:** drive the chosen `BossAttackDefinition` — tell window (telegraph VFX/anim), active frames (spawn hitbox from `MoveDef`), recovery (the documented punish window).
  - **Special transition beats:** hooks for the main boss's "Fold" super (the parry/Cauterize hard-counter at f88–91, §3.6 P3), arena hazards (the great-circle ignite, the pit). These are `UnityEvent`/virtual hooks the boss-specific subclass or a `BossArenaController` listens to.
  - Key methods: `BeginEncounter(BossDefinition)`, `Tick(frame)`, `SelectAttack()`, `EnterPhase(int)`, `OnDamaged(HitInfo)`, `IReadOnlyPhase CurrentPhase`. Emits `OnPhaseChanged`, `OnDefeated`, `OnHealthChanged` for the HUD boss-bar and the world-flow persistence.
- **`BossArenaController.cs`** — per-arena glue: the fog-gate trigger that starts the encounter, the great-circle floor lighting tied to phase events, the Aether-pit instant-death hazard, on-defeat drops (Conductor's Key, flask refill) and the persistence write. One instance per boss room, configured by the bootstrap.
- **`Projectile.cs`** — Acolyte gold-bolt, Leyline Volley orbs, Choir-of-Blades. Pooled; logical-capsule hit via `HitboxSystem`; homing-lite steering for the volley.

### 4.6 World flow, persistence, interaction

- **`GameDirector.cs`** — top-level session owner (persists across scenes via `DontDestroyOnLoad`). Holds run state (current weapon, flask max, AE carried from secret S2, bosses-defeated set), spawns the player, owns `SaveSystem`, handles death→respawn.
- **`SceneFlowController.cs`** — async scene loads/unloads (hub `Threshold` ↔ arenas), fade transitions, spawn-point resolution, the one-way drops. Hub and each arena are separate scenes (the bootstrap builds both; §10). Uses additive loading so the `GameDirector`/player survive.
- **`AttunementStone.cs`** — the bonfire (§3.4). `Interact()` → full HP, refill flask, respawn non-boss enemies, set respawn point, (re)open the stone menu, the fog-clear reward beat. Refills nothing of AE. Writes a checkpoint via `SaveSystem`.
- **`RespawnManager.cs`** — on death: teleport to last stone, reset enemies, **reset bosses fully**, drop a recoverable `Cinder of Aether` at the death spot.
- **`FogWallTrigger.cs`** — the committed-threshold trigger (§3.1). On player enter: spawn the visual fog-wall, lock the room, `BossController.BeginEncounter`. Removes the wall on boss defeat.
- **`Checkpoint.cs` / `SpawnPoint.cs`** — named transform markers placed by the bootstrap.
- **`Interactable.cs`** (interface) + **`LeverPuzzle.cs`** (the 3-lever Choir-of-Stone resonance puzzle, plus the secret 4th-sequence false-wall, §3.3 S2), **`BreakableWall.cs`** (secret S1 — heavy-attack/Ground-Current collapses it), **`LoreTablet.cs`**, **`PickupItem.cs`** (flask-charge, Resonant Edge weapon, AE bonus).
- **`InteractionController.cs`** — player-side: raycast/overlap for the nearest `Interactable`, surfaces the `Interact` prompt to the HUD, routes the `Interact` input.
- **`SaveSystem.cs`** — **JSON + PlayerPrefs hybrid** per the bible: a `RunSave` record (bosses defeated, secrets found, flask max, current weapon, checkpoint id, Flow grades) serialized to JSON written to `Application.persistentDataPath/aether_run.json`; PlayerPrefs holds only the lightweight pointer (last checkpoint id, player name) for fast boot. `Save()`, `Load()`, `MarkBossDefeated(id)`, `bool IsBossDefeated(id)`. Bosses-defeated drives whether fog-walls re-arm.
- **`GuidingLeyline.cs`** — the soft-guidance light (§3.2). A line/strip along the critical path that pulses at 0.5 Hz, brightens after 8s of facing-away, forks dim at branches. Uses the canon **C-traditional `#ebbe5a`** color from `tiers.ts` (§11). Pure visual + a tiny "current objective" pointer; never blocks.

### 4.7 UI / HUD

- **`HUDController.cs`** — owns the HUD canvas (Screen-Space Overlay, rendered at internal res so it's chunky — §8.4). Binds to player resources + Flow + lock-on + boss + prompts. `Tick()` polls or subscribes.
- **`ResourceBarWidget.cs`** — segmented HP (red), stamina (`#78e6a0` B-tier green), AE (`#50c8ff` A-tier blue) bars — colors pulled from the tier palette (§11). Hard-pixel edges, no smoothing.
- **`FlowMeterWidget.cs`** — vertical rune column + big D/C/B/A/S letter, color-shifts gold→white-hot with rank.
- **`FlaskWidget.cs`** — flask icon ×N.
- **`BossHealthBarWidget.cs`** — bottom-center wide bar, boss name in pixel font, phase-threshold segment marks; subscribes to `BossController.OnHealthChanged/OnPhaseChanged`.
- **`LockOnReticle.cs`** — the 4-pixel gold bracket at `LockOnController.CurrentTarget`'s screen pos.
- **`InteractPromptWidget.cs`** — context prompt ("Rest", "Pull Lever", "Take").
- **`PauseMenu.cs`**, **`AttunementStoneMenu.cs`** — pause + bonfire menu (rename Warden, level-review stub).

### 4.8 Input

- **`AetherInputActions` (`.inputactions` asset)** — the generated Input Actions asset with **both** gamepad and keyboard/mouse bindings from bible §6, action names matching §2.13 exactly (`LightAttack`, `HeavyAttack`, `Dodge`, `Sprint`, `Block`, `Parry`, `LockOn`, `TargetSwitchLeft/Right`, `UseFlask`, `Special1/2`, `Cauterize`, `Interact`, `Pause`, `Move`, `Camera`).
- **`InputReader.cs`** — wraps the generated actions, exposes typed events/values, implements the **tap-vs-hold split at 10 frames** (Dodge/Sprint on B/Space, Parry/Block on LB/Q — `tapHoldThresholdFrames` from `combat.json`). Pushes discrete actions into `InputBuffer`.
- **`InputBuffer.cs`** — the 6-frame buffer (§2.3). Stores `(action, frameStamped)`; `bool Consume(action, frame)` returns true if a matching input is within the 6-frame window. Ticked first each fixed step.

### 4.9 Audio

- **`AudioManager.cs`** — pooled one-shot SFX (hits per class, parry, footsteps), music layers (exploration/combat/boss with phase-tied intensity), the Attunement-Stone rest sting, ducking. `PlaySfx(id, pos)`, `SetMusicState(state)`, `OnBossPhase(int)`. Driven by `HitboxSystem` (hit SFX), `BossController` (music intensity), `AudioCueDef` ScriptableObjects so audio is data-light and swappable.

---

## 5. ScriptableObjects (authored data layer)

The bible mandates SO-for-data, *derived from* the shared JSON. The pattern: **JSON is the source of truth; SOs are editor-friendly wrappers generated from it** by a menu item, so designers can tweak in-Inspector but the canonical numbers come from `game/shared`.

- **`CombatConfig` (SO)** — singleton wrapping `combat.json` (i-frames, costs, hitstop, Flow thresholds, PRNG seed, tap-hold threshold). Loaded at boot; everything reads it.
- **`MoveDefinition` (SO)** — one per move; wraps a `moves.json` entry (frames, hits, hitbox, comboNext, flowMoveId). Player moveset + enemy + boss attacks all reference these.
- **`WeaponDefinition` (SO)** — Geomancer's Edge + Resonant Edge; wraps `weapons.json`; lists its `MoveDefinition`s and specials.
- **`EnemyDefinition` (SO)** — Husk/Acolyte/Sentinel; wraps `enemies.json`; carries the **tier** (reusing the four-tier vocabulary) which drives the corruption-glow color from the tier palette.
- **`BossDefinition` (SO)** — wraps `bosses.json`: phases, per-phase weighted attack lists (each referencing a `MoveDefinition`), transition frames, arena id. **The same SO type powers the Tuning Knight and Aetherius-Mar** — that's the reuse the bible demands.
- **`AudioCueDef` (SO)**, **`ZoneFogProfile` (SO)** (per-area fog start/end/color — `#1a1f2e` general, `#2a2418` boss arena).

`DataImporter.cs` (Editor) regenerates all SOs from `game/shared/design-data/*` via menu **Aether/Regenerate Data Assets** — keeps SOs and JSON in sync, never hand-divergent.

---

## 6. Retro Aesthetic in URP (§4 of the bible)

### 6.1 The URP Renderer Feature (full-screen post)
**`RetroPostFeature.cs`** — a `ScriptableRendererFeature` (Render-Graph compatible, URP 17) added to the URP Renderer asset. It injects one full-screen pass `AfterRenderingPostProcessing` running **`Retro/PostProcess.shader`** which does, in order:
1. **Pixelation** — sample the low-res (320×240) buffer; the scene is *already* rendered at internal res via render scale, so this mostly handles the integer/sharp upscale + 4:3 letterbox.
2. **Posterize** — quantize each channel to **5 bits (RGB555)**.
3. **Ordered dither** — Bayer 4×4 applied during the 24→16-bit quantize (strength 1.0), the band-hider.
Settings exposed on the feature: bayer strength, color depth, letterbox color. Files: **`RetroPostFeature.cs`**, **`Retro/PostProcess.shader`** (handwritten HLSL fullscreen), **`Art/Bayer4x4.png`** (or inline matrix).

### 6.2 Low render scale & filtering (URP asset)
- **`Settings/Retro_URPAsset.asset`** — Render Scale set so the camera renders at ~320×240 (we use an explicit low-res RenderTexture path inside the feature for exactness rather than fractional render scale, because fractional scale + letterbox needs pixel-exact control). HDR off, MSAA off, post-processing on (for the feature), shadows: hard-only, low-res cascade or off.
- **`Settings/Retro_Renderer.asset`** — the Universal Renderer with `RetroPostFeature` added.
- **Point filtering globally** — a build/asset postprocessor **`PointFilterImporter.cs`** (Editor) forces `filterMode = Point`, no mipmaps, max size 128 on all textures under `Assets/Aether/Art/`. Plus per-material sampler state in the world shader.
- **Fog** — URP linear fog enabled (start 8 m, end 36 m), far-clip 38 m, color per `ZoneFogProfile`. Driven at runtime by the active zone.

### 6.3 The vertex-snap + affine-texture world shader
**Decision: handwritten HLSL, not Shader Graph**, for the core world/character shader — because Shader Graph cannot cleanly (a) snap **post-projection clip position** to a pixel grid, and (b) defeat perspective-correct UV interpolation. Both require touching the interpolator/`noperspective` semantics and the clip-space vertex output, which Graph abstracts away. We author:

- **`Retro/LitRetro.shader`** (handwritten HLSL, URP-compatible, `Universal Forward` pass):
  - **Vertex snap:** after `TransformObjectToHClip`, snap `clipPos.xy` to the **160×120 cell grid** (one cell ≈ 2 internal px), per bible §4.2: `clipPos.xy = round(clipPos.xy / clipPos.w * gridRes) / gridRes * clipPos.w;` (snap in NDC then re-apply `w`).
  - **Affine textures:** declare the UV interpolator **`noperspective`** so the GPU interpolates UVs linearly in screen space → the PS1 texture swim, per §4.3. (Fallback for backends without `noperspective`: pass `uv * (1/w)`-free affine via documented vertex math.)
  - **Vertex lighting + flat shading:** one key directional + ambient, computed **per-vertex** (no per-pixel lights, no normal maps, no specular). World geo uses per-face normals (flat); set a `_FlatShading` toggle.
  - **Point sampling + fog** baked in.
- **`Retro/CharacterRetro.shader`** — variant with Gouraud (smooth vertex) shading for character silhouette readability (§4.4), same snap + affine.
- **Shader Graph is used only for** `FX/FogWall.shadergraph` (scrolling dissolve) and `FX/GreatCircles.shadergraph` (the boss-arena floor 15-circle ignite glow) — pure VFX, no snap/affine requirement.

### 6.4 Color space & framerate
- **Gamma color space** (set in ProjectSettings) so the RGB555 quantize and dither land where the PS1 reference does. Documented deviation-free.
- **30 fps present cadence:** `Application.targetFrameRate = 30` set in `GameBootstrap.cs` at boot; **logic stays 60 Hz** in `FixedUpdate` (fixed timestep 1/60). Combat numbers are frame-count based so the 30 fps present doesn't touch them (§4.8 of bible).

---

## 7. The Editor Scene Bootstrap (the heart of the deliverable)

Because `.unity` YAML is fragile to hand-author, **everything is built in code.** `Assets/Aether/Editor/SceneBootstrap.cs` registers menu items:

- **`Aether/Build Vertical Slice`** (the big one) — builds **two scenes** and saves them to `Assets/Aether/Scenes/`:
  1. **`Hub_Threshold.unity`** (areas E1 + A): floor/wall primitives greyboxing the Approach corridor + Threshold Hall, a directional key light + ambient, the **player prefab** spawned at the entry, an **AttunementStone** with its trigger + menu, the **GuidingLeyline** strip, the **BreakableWall** secret (S1) with its mismatched-fog hint, a few **Husk** spawns, the sealed door, and the **SceneFlow** trigger that loads the arena scene. HUD canvas instantiated.
  2. **`Arena_Nexus.unity`** (areas B–F condensed for the slice, or split further): the Riven Stair greybox, the mini-boss room (Conductor's Gallery) with **FogWallTrigger + Tuning Knight prefab + BossArenaController**, the Choir-of-Stone **LeverPuzzle** + secret S2 false-wall, the Fold Antechamber breath room, and the **Sundered Nexus** main-boss arena with the **Aetherius-Mar prefab**, the great-circle floor, the Aether-pit hazard, and warm fog profile. Checkpoints, lights, HUD.
  - It wires the **build settings scene list** (`EditorBuildSettings.scenes`) so both scenes are included and the hub is index 0.
  - It runs **`Aether/Regenerate Data Assets`** first (so SOs exist), copies `game/shared/design-data` → `StreamingAssets`, and bakes a NavMesh for the Husk roaming (`NavMeshBuilder`).

- **`Aether/Build Player Prefab`** — generates the player prefab from primitives (capsule body + `CharacterController` + all player components + a child camera-target + logical hurtbox capsule) and saves it as `.prefab`. Idempotent.
- **`Aether/Build Boss Prefabs`** — generates Tuning Knight + Aetherius-Mar prefabs (scaled capsules/cubes as placeholder geo, `BossController` + `BossDefinition` reference + hurtbox + `Targetable`).
- **`Aether/Build Enemy Prefabs`** — Husk/Acolyte/Sentinel placeholder prefabs.
- **`Aether/Regenerate Data Assets`** — runs `DataImporter` (§5).
- **`Aether/Setup URP & Project Settings`** — assigns the Retro URP asset to Graphics + Quality, sets fixed timestep, color space, input handling (those it can set via `EditorUserBuildSettings`/`PlayerSettings` API), and adds `RetroPostFeature` to the renderer. (A few settings — Active Input Handling — require a domain reload; the menu logs a one-line instruction if a manual toggle remains.)

**What each scene contains so the user can press Play:** placeholder geo (primitive cubes/planes/capsules with the `LitRetro` material), one key directional light + ambient, the player prefab at a spawn point, boss prefabs behind fog-wall triggers, fog-wall triggers, checkpoints/AttunementStone, the HUD canvas, the guiding-leyline strip, secret triggers, and the zone fog profiles. **Press Play in `Hub_Threshold` → fully playable loop through to the main boss.**

Implementation notes for the bootstrap: use `ObjectFactory`/`GameObject.CreatePrimitive`, `PrefabUtility.SaveAsPrefabAsset`, `EditorSceneManager.NewScene` + `SaveScene`, `Undo`-free (it's generative), and **delete-then-rebuild** semantics so re-running the menu is idempotent and never duplicates.

---

## 8. Build Milestones (ordered, files-per-milestone)

**M0 — Project skeleton (compiles, opens, resolves).**
`Packages/manifest.json`, `ProjectSettings/*` (incl. `ProjectVersion.txt`, Tags/Layers, Time, GraphicsSettings), `game/unity/.gitignore`, both `.asmdef`s, `README-UNITY.md`. → User can open the project and it resolves with zero errors and an empty scene.

**M1 — Retro render stack.**
`Settings/Retro_URPAsset.asset`, `Settings/Retro_Renderer.asset`, `RetroPostFeature.cs`, `Retro/PostProcess.shader`, `Retro/LitRetro.shader`, `Retro/CharacterRetro.shader`, `Editor/PointFilterImporter.cs`, `Art/Bayer4x4.png`, `Editor` menu `Setup URP & Project Settings`. → A cube renders pixelated, dithered, vertex-snapped, affine, fogged at 320×240.

**M2 — Data + determinism core.**
`SimClock.cs`, `IFixedTickable.cs`, `Xorshift128.cs`, `DesignDataLoader.cs`, the `*Def.cs` records, `CombatConstants.cs`, the SO types + `Editor/DataImporter.cs`, `Aether.Tests` PRNG/frame-math tests. → JSON loads, SOs generate, PRNG is bit-stable (unit test green).

**M3 — Player locomotion + camera.**
`PlayerController.cs`, `PlayerLocomotion.cs`, `PlayerStateMachine.cs`/states, `InputReader.cs`, `InputBuffer.cs`, `AetherInputActions.inputactions`, `CameraRig.cs`, `LockOnController.cs`, `Targetable.cs`, `Editor/SceneBootstrap.Build Player Prefab`. → Move, sprint, roll (i-frames), lock-on, target-switch on a greybox plane.

**M4 — Combat resolution.**
`PlayerCombat.cs`, `Hitbox.cs`, `Hurtbox.cs`, `HitboxSystem.cs`, `Damageable.cs`, `PoiseComponent.cs`, `HitInfo.cs`, `HitstopController.cs`, `KnockbackController.cs`, `BackstabSystem.cs`, `PlayerResources.cs`, `FlowMeter.cs`, `FlaskController.cs`, `LeylineSpecials.cs`. → Full combo strings, launchers/juggles, parry/riposte, stamina, Flow, specials, hitstop — against a dummy `Damageable`.

**M5 — Enemies + Boss AI.**
`ActorController.cs`, `EnemyController.cs`, `Projectile.cs`, `BossController.cs`, `BossArenaController.cs`, `Editor` boss/enemy prefab builders, the `BossDefinition`/`EnemyDefinition` assets. → Husk/Acolyte/Sentinel fight back; Tuning Knight + Aetherius-Mar run phases/transitions/attack-selection from data, including the Fold hard-counter.

**M6 — World flow, persistence, interaction, secrets.**
`GameDirector.cs`, `SceneFlowController.cs`, `AttunementStone.cs`, `RespawnManager.cs`, `FogWallTrigger.cs`, `Checkpoint.cs`/`SpawnPoint.cs`, `InteractionController.cs`, `Interactable.cs`, `LeverPuzzle.cs`, `BreakableWall.cs`, `LoreTablet.cs`, `PickupItem.cs`, `SaveSystem.cs`, `GuidingLeyline.cs`. → Death/respawn, bonfire, fog-walls, scene transitions, both secrets, JSON+PlayerPrefs persistence of bosses defeated.

**M7 — HUD/UI + audio.**
`HUDController.cs`, `ResourceBarWidget.cs`, `FlowMeterWidget.cs`, `FlaskWidget.cs`, `BossHealthBarWidget.cs`, `LockOnReticle.cs`, `InteractPromptWidget.cs`, `PauseMenu.cs`, `AttunementStoneMenu.cs`, `AudioManager.cs`, `AudioCueDef`, pixel font asset. → Full readable HUD + audio.

**M8 — The bootstrap + VFX polish.**
`Editor/SceneBootstrap.cs` (`Build Vertical Slice` assembling everything), `FX/FogWall.shadergraph`, `FX/GreatCircles.shadergraph`, `ZoneFogProfile` assets, NavMesh bake. → **One menu click builds the playable slice.** Ship.

---

## 9. What the user must do manually (the only in-editor steps)

`README-UNITY.md` spells this out; concretely:

1. **Open the project:** Unity Hub → Add → select `game/unity/`. Open with **Unity 6 (6000.0.x)**. (If Hub warns about a different patch, "open anyway" is fine within 6000.0.)
2. **Let UPM resolve:** first open downloads/compiles packages from `manifest.json` (a few minutes). Wait for the spinner to finish; the console should be error-free.
3. **(One-time settings the API can't fully set silently)**: confirm **Edit → Project Settings → Player → Active Input Handling = "Input System Package (New)"** and accept the editor restart if prompted. (The bootstrap sets everything else, but this toggle forces a domain reload, so it's called out.)
4. **Run the bootstrap:** menu **`Aether → Build Vertical Slice`**. This generates SOs, copies the shared JSON into StreamingAssets, builds prefabs, builds both scenes, wires Build Settings, and bakes the NavMesh.
5. **Press Play** in `Hub_Threshold` (it's scene index 0). Plug in a gamepad or use KB/M — both schemes are bound.
6. **(Optional) Make a build:** File → Build Settings → select **Windows/Mac/Linux Standalone** (IL2CPP), ensure both scenes are listed (the bootstrap added them), Build. For the authentic 30 fps cadence, leave VSync off (the code caps to 30).

That's the whole manual surface: **open → resolve → confirm input handling → one menu click → Play.**

---

## 10. Reuse of the existing repo (the contract bridge)

- **Colors:** `RetroPalette.cs` mirrors the four hex values from `/home/user/aether/src/lib/tiers.ts` (`#50c8ff`, `#78e6a0`, `#ebbe5a`, `#e66e8c`) as the single source for HUD bar colors, enemy-tier corruption glow, and the guiding-leyline gold — so Unity and the web app render the *same* four-tier vocabulary. (Mirrored, not imported — Unity can't consume TS — but kept in lockstep with a one-line comment pointing at `tiers.ts`.)
- **Tier vocabulary:** `EnemyDefinition.tier` uses the exact `"A-measured" | "B-scholarly" | "C-traditional" | "D-folklore"` strings from `types.ts`.
- **Lore text:** `LoreTablet`/`AttunementStoneMenu` strings derive from `/home/user/aether/content/canon/*.md` (aetherius.md → the Aetherius-Mar reveal; provenance.md → tier framing).
- **Shared design-data JSON** is the real runtime contract — Unity reads `game/shared/design-data/*`, the same files the other two engines load, validated against `schema/` in CI.

---

### Critical Files for Implementation
- /home/user/aether/game/unity/Packages/manifest.json *(UPM versions — pins the whole stack; §1.2)*
- /home/user/aether/game/unity/Assets/Aether/Editor/SceneBootstrap.cs *(the procedural scene/prefab builder — the deliverable's centerpiece; §7)*
- /home/user/aether/game/unity/Assets/Aether/Runtime/Boss/BossController.cs *(reusable data-driven boss brain for mini-boss + main boss; §4.5)*
- /home/user/aether/game/unity/Assets/Aether/Runtime/Combat/HitboxSystem.cs *(deterministic global hit resolution — the §2.14 contract in code; §4.3)*
- /home/user/aether/game/unity/Assets/Aether/Shaders/Retro/LitRetro.shader *(vertex-snap + affine + vertex-lit world shader — the retro look; §6.3)*

*(Grounding files that already exist and define the reused contracts: /home/user/aether/src/lib/tiers.ts, /home/user/aether/src/lib/types.ts, /home/user/aether/content/canon/aetherius.md.)*
