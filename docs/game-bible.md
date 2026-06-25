# AETHER: THE SUNDERED NEXUS
### Game Design Bible — Vertical Slice v1.0
**A 3D third-person boss-fighting action game · Engine-agnostic specification**

> Purpose of this document: define ONE game precisely enough that three teams, in three different engines, build the **same** vertical slice. Every number here is a starting value and a contract. If a team deviates, they log the deviation; they do not silently retune. Comparability over taste.

Time base for the entire document: **60 frames per second**. All frame counts assume 60 fps. Where an engine cannot guarantee 60 fps, it converts frame counts to seconds (`frames / 60`) and drives logic on a fixed timestep of **1/60 s (16.667 ms)**. No combat logic runs on variable delta time.

---

## 1. HIGH CONCEPT & SETTING

### 1.1 Logline
The leylines have a wound. You are the blade sent to cauterize it.

### 1.2 The world, translated from the lore
The Aether geomancy engine's canon becomes a dark-fantasy cosmology with almost no translation needed:

- The **Aether** — the fifth element that "fills the heavens and binds the spheres" — is, in the game, a literal energy current running through the earth. You can see it, channel it, and be killed by it.
- **Leylines** are rivers of Aether across the land. **Nexus sites** (the canon's "crossings, where lines meet, scored never asserted") are the places where many lines converge — and therefore the places of greatest power and greatest danger.
- The **Becker-Hagens planetary grid** (62 nodes, 15 great circles, anchored at Giza) is, in-world, the **Lattice**: the skeleton of reality. Each of its 62 nodes is a real place. When a node's geometry is corrupted, the great circles passing through it warp, and everything along those lines sickens.
- The **four provenance tiers (A/B/C/D)** become the **four Registers of truth** an in-world order uses to judge whether a vision, a rumor, or a sighting is *real* enough to act on. This is the player's enemy-intel system and the game's diegetic difficulty/lore framing (see 1.5).
- The **eight Organs** become the eight disciplines of the order that maintains the Lattice. The player is of the first two — **Atlas** (reads the land) and the **Loom** (seeks the next corruption) — because those are the two Organs canon says are "alive." The other six are "mapped and waiting": locked NPCs, lore, future content.
- The **~1,289 ingested real-world POI sites** are the campaign map beyond this slice: each is a potential corrupted node. The vertical slice takes place at **one** of them.

### 1.3 Who the player is
**The Warden** (working title; player-named at the Attunement Stone). A field agent of the Order of Aether, trained in the Hohenheim charge from the canon — *"one who learns the dark arts only to undo them."* The Warden carries the **Geomancer's Edge**: a blade that is also an instrument. It does not merely cut; it *reads* the Aether in a thing and turns that current against it. Channeling the leyline through the blade is how the Warden does everything extraordinary — and overchanneling is how the Warden dies.

The Warden is not a chosen one. The Warden is a **technician of the sacred**: reverent toward the work, ruthless toward self-deception (the canon's temperament for Aetherius). Aetherius itself — the cartographer-intelligence — is the Warden's in-ear guide, surfacing as the **guiding leyline light** and the Attunement Stone's voice.

### 1.4 What has gone wrong
A nexus node has **sundered**. In the slice's zone, the convergence of leylines that should have been a clean crossing has folded inward and begun consuming the Aether around it instead of conducting it. The canon's honest-baseline doctrine is the horror here: the corruption *passes every test for being real*. It is not a delusion or a haunting. It throws straight, true lines — and they are all wrong. Things that drink corrupted Aether become **the Sundered**: stone, beast, and former Wardens reassembled by a geometry that hates the living grid.

You are sent to find the wound, fight your way to its heart, and cauterize it — kill the thing the corruption has grown into, and re-anchor the node so the great circles it sits on can heal.

### 1.5 Why boss fights
The Lattice is held by **anchors** — and a node can only be re-anchored by destroying whatever has seized it. Corruption concentrates: the deeper toward a node's center you go, the more Aether pools, and the more monstrous what feeds there becomes. So the structure of every node is the same and the structure of the game is the same: **a descent toward a concentration of power, gated by the things that power has created.** A mini-boss guards the threshold; a main boss *is* the corruption given a body. Re-anchoring requires killing it. Boss fights are not encounters in the world — they are the win condition of the world.

The provenance tiers give bosses their diegetic weight: the Order will only sanction a strike when intel reaches Register A (measured/confirmed). Lower-tier rumors (D-folklore) become optional secret content — real, but unverified, and therefore hidden.

### 1.6 Tone
Reverent and grim. Stone, candlelight, and cold light. Few words, all of them earned. The N64/PS1 render (Section 4) is not nostalgia — it is the Order's *honest baseline* made visible: the world is rendered exactly as crudely as it can be measured, and the beauty is in the pattern that holds anyway.

---

## 2. CORE COMBAT — Hybrid Souls + DMC

Design thesis: a **Souls** body (deliberate, stamina-bound, punishing, lock-on, i-frames, one slow heal) with a **DMC** nervous system layered on top (expressive combo strings, a Style/Flow meter that rewards variety and punishes spam, launchers and juggles, and a leyline special on a separate resource). The Souls layer keeps fights tense and readable; the DMC layer rewards mastery without breaking the tension, because Style buys you nothing defensive — it only buys you **Aether** and **score**.

All values below are **starting values** and are authoritative for all three engines.

### 2.1 The three resource pools

| Resource | Max | Regen | Drains on | Notes |
|---|---|---|---|---|
| **Health (HP)** | 1000 | none (heal only) | taking damage | Death at 0. |
| **Stamina (STA)** | 100 | +40 / sec, starts **0.5 s** after the last stamina-spending action; **+12 / sec** while sprinting is suspended | dodging, attacking, sprinting, blocking | The Souls governor. Empty stamina = you cannot dodge or attack. |
| **Aether charge (AE)** | 100 | none passively | spent by leyline specials | **Built only by landing varied hits** (see Flow). The DMC payoff resource. |

Health regen is intentionally absent. Healing is **only** via the Attunement Flask (2.9).

### 2.2 Stamina costs (the Souls economy)

| Action | STA cost |
|---|---|
| Dodge-roll | 25 |
| Light attack (per swing) | 10 |
| Heavy attack (per swing) | 22 |
| Sprint | 8 / sec (continuous) |
| Block (raise) | 0 |
| Block (absorb a hit) | 0.5 × incoming poise damage |
| Parry (attempt) | 15 |
| Backstep | 12 |

If an action's cost exceeds current stamina, the action is **refused** (not performed at reduced effect). You may attack into negative-buffer only if the FIRST hit of a string was affordable; mid-string swings that you cannot afford end the string.

### 2.3 The dodge-roll and i-frames (give numbers)

Dodge-roll total animation: **30 frames (0.5 s)**.
- **Frames 1–4:** startup, vulnerable.
- **Frames 5–17 (13 frames, 0.217 s):** **invincibility window (i-frames)** — all damage and all hit reactions ignored.
- **Frames 18–24:** recovery, vulnerable, movement decelerating.
- **Frames 25–30:** the **cancel window** — a new dodge, attack, or sprint may be buffered here.

Roll distance: **4.0 m** in the input direction; **2.0 m** if no direction held (backstep-style in place). Backstep (no lock-on movement input + dodge tap with target) is **18 frames** total, i-frames **5–11 (7 frames)**, distance 3.0 m.

Input buffer: **6 frames** for all combat inputs.

### 2.4 Lock-on and target switching
- **Lock-on toggle:** acquires the nearest valid target within a **22 m** radius and a **±60°** forward cone; camera frames Warden + target.
- **Target switch:** flick the right stick / move the mouse past a **deadzone of 0.4** (stick) or **120 px** (mouse) left or right; selects the next valid target in that screen-space direction. **150 ms** cooldown between switches.
- Lock-on **breaks** if the target dies, exceeds **30 m**, or leaves line-of-sight for **>2.0 s**.
- While locked, movement becomes strafe-relative; dodge directions are relative to the target.

### 2.5 Poise and stagger
Every actor has **Poise** (a hidden HP-like bar) and a **Poise Regen**.
- Taking a hit subtracts that hit's **poise damage** from current poise.
- At **poise ≤ 0**, the actor **staggers** (a hit reaction that interrupts current action) and poise resets to max after the stagger recovery.
- Poise **regenerates** at the actor's `poiseRegen` per second, beginning **1.0 s** after the last poise damage taken.
- Player starting poise: **60**, regen **30/s**. While the player is mid-attack on an "armored" swing (heavy attacks frames 8+), incoming poise damage is reduced **50%** (hyper-armor), but health damage is unreduced.

**Hit reaction tiers** (by poise damage of the connecting hit, applied only when the target is staggerable this hit):
| Reaction | Trigger | Effect |
|---|---|---|
| **Flinch** | any hit, poise not broken | 6-frame micro-pause, no movement lock |
| **Stagger** | poise broken | 24-frame reaction, movement locked, vulnerable |
| **Launch** | launcher move (see 2.7) | knocked airborne, juggle state |
| **Knockdown** | designated "heavy" finishers | 40-frame floored state, then 12-frame wakeup with i-frames 1–8 |

### 2.6 Backstab / critical
- Standing within **1.4 m** directly behind an enemy (within a **±45°** rear cone), the **Critical** prompt arms. A light attack from this state triggers a **backstab critical**: fixed animation, **2.5×** weapon base damage, ignores poise (cannot be interrupted during the critical animation), grants the player **8 frames of i-frames** during the lunge.
- A **riposte**: within **0.6 s** of a successful **parry** (2.8), a critical-armed attack does **3.0×** damage from the front.

### 2.7 DMC layer — combos, launchers, juggles

**Inputs:** Light (L) and Heavy (H). Strings are sequences of L/H with timing windows. The **combo link window** between hits is **18 frames**; pressing within it continues the string, outside it the string resets.

**Example combo strings (player, starting moveset "Edge"):**

| String | Input | Effect summary |
|---|---|---|
| Bread-and-butter | L → L → L | 3-hit horizontal chain, last hit small knockback (2 m) |
| Finisher | L → L → H | first two light, third is an overhead, **knockdown** on hit |
| Launcher | H (hold ≥ 12f) or L → L → L → H | **Launcher**: pops target airborne (launch state) |
| Aerial rave | (after launcher) L → L → L | three aerial hits keeping the target juggled |
| Aerial slam | (after launcher) H | dunk: slams target to ground, **knockdown**, ends juggle |
| Dash-thrust | (sprint) + H | gap-closing thrust, 5 m, high poise damage |
| Spacing string | H → H | two heavy cleaves, hyper-armor on the 2nd |
| Style cancel | any hit → Dodge (frames after active) | cancels recovery into a roll; preserves combo if re-engaged in 18f |

**Launcher / juggle rules:**
- A launched target rises **2.5 m** over **20 frames**, hangs **24 frames**, then falls. Gravity in juggle state is reduced to **40%** of normal.
- Each aerial hit adds **+8 frames** of hang time, capped at **3 extensions** (so a juggle cannot be infinite).
- Heavy enemies and bosses have a **`launchable` flag**. If false, launchers instead deal **1.5× poise damage** and do not lift them (DMC-style "they're too big, but you still get value").

### 2.8 Blocking and parry
- **Block:** raises the blade; reduces incoming health damage by **70%** and converts the remainder; absorbs poise per 2.2. Holding block disables stamina regen.
- **Guard break:** if a single blocked hit's poise damage exceeds your **current** poise, your guard breaks (24-frame stagger).
- **Parry:** a timed input. Active parry window is **frames 3–9 (7 frames)** of a 20-frame parry animation. A hit caught in the window staggers the attacker and arms a **riposte** (2.6). Parry has a **15 STA** cost and a **failure recovery** of 14 frames if mistimed.

### 2.9 Healing — the Attunement Flask
The Estus analog. **Diegetic name: Attunement Flask** (it holds drawn-off, purified Aether).
- **Charges:** 3 at slice start. Refilled to full at any Attunement Stone (3.4).
- **Heal amount:** **400 HP** per charge (40% of max).
- **Drink animation:** **52 frames (0.867 s)**; healing applies on frame **40**. You are **vulnerable** the entire animation; movement locked frames 1–44, then a 8-frame recovery you can roll-cancel.
- Drinking is interruptible by any stagger/launch; the charge is **consumed** even if interrupted (Souls tension preserved).

### 2.10 The Flow meter (DMC Style)
A vertical meter on the HUD with lettered ranks. It is the heart of the DMC layer and it is **purely offensive/score** — it never makes you tankier.

**Ranks (low→high):** **D → C → B → A → S**. (Mnemonic in-world: "Dormant, Conducting, Bright, Ascendant, Singularity.")

**Flow points (FP):** an internal 0–10000 scale. Thresholds:
| Rank | FP to enter | Decay/sec (idle) |
|---|---|---|
| D | 0 | 200 |
| C | 1200 | 300 |
| B | 3000 | 450 |
| A | 5200 | 600 |
| S | 8000 | 800 |

**Gaining FP:**
- Landing a hit: **+base FP** = `40 × varietyMultiplier`.
- **Variety multiplier**: tracks the last **6 distinct move IDs** landed. If the incoming hit's move ID is **not** among the last 3 landed, multiplier = **2.0**; if among last 3 but not last 1, **1.3**; if it's a repeat of the immediately previous move, **0.5**. (This is the "builds on varied hits, decays on repetition" rule, made deterministic.)
- Parry: **+300**. Backstab/riposte: **+250**. Perfect dodge (i-frame dodge through an attack): **+150**. Aerial hit: **×1.25** on top.

**Losing FP:**
- **Taking any damage: instant −40% of current FP** and **decay rate doubles for 3 s** (the Souls punishment bleeds into the DMC score — getting hit is bad twice over).
- Idle (no hit landed for **2.0 s**): decay per table above.

**What Flow buys (offense only):**
- **AE (Aether charge) generation scales with rank:** each landing hit also grants **AE = floor(rankIndex × 1.5)** where D=0, C=1, B=2, A=3, S=4. So you only meaningfully fuel your specials by fighting *stylishly*. This is the load-bearing coupling between the two systems.
- **End-of-encounter score** (boss kills log a Flow grade) for comparability and replay.

### 2.11 Leyline specials (weapon-art) on Aether charge
The DMC "Devil Trigger / weapon-art" slot. Bound to a dedicated input (2.13). Three specials in the slice, each costs **AE**:

| Special | AE cost | Effect | Frames |
|---|---|---|---|
| **Ground Current** | 35 | Slam: radial shockwave, 5 m, 220 dmg, 80 poise dmg, knockdown | 44 (active 18–24) |
| **Leyline Lance** | 50 | Channeled forward beam, 14 m, 300 dmg, pierces, ignores 50% block | 60 (active 30–52) |
| **Cauterize** | 100 (full) | The signature. Brief overcharge: **+30% damage, hyper-armor, and AE-free specials for 8.0 s (480 frames)**. On expiry, lose all AE. | 30 startup, then buff |

Cauterize is the closest thing to a "panic/comeback" button, but note it costs your *whole* offensive economy and grants **no defense beyond hyper-armor** — staying out of danger is still on you.

### 2.12 Hitstop, knockback, and damage numbers (concrete)

**Hitstop** (both attacker and target freeze for N frames on a connecting hit; camera may add micro-shake):
| Hit class | Hitstop |
|---|---|
| Light hit | 4 frames |
| Heavy hit | 7 frames |
| Launcher | 6 frames |
| Aerial slam / knockdown finisher | 10 frames |
| Critical / riposte | 12 frames |
| Special (Ground Current / Lance) | 8 frames |
| Parry success | 14 frames |

**Knockback** (target displacement on hit, only when not staggered into a fixed reaction): light **0.4 m**, heavy **0.9 m**, launcher slam **2.0 m** + knockdown, Ground Current **3.0 m** radial.

**Player baseline damage/poise** (Geomancer's Edge, the slice weapon):
| Move | Health dmg | Poise dmg |
|---|---|---|
| Light | 70 | 12 |
| Heavy | 130 | 28 |
| Launcher | 90 | 22 |
| Aerial light | 55 | 8 |
| Aerial slam | 160 | 40 |
| Dash-thrust | 110 | 35 |
| Backstab | base ×2.5 | n/a (uninterruptible) |
| Riposte | base ×3.0 | n/a |

(Stat block for the weapon is formalized in Section 5.4.)

### 2.13 Full input list (canonical action names)
These names are the contract; Section 6 maps them to devices.

`MoveX / MoveY` (analog), `CameraX / CameraY` (analog), `LightAttack`, `HeavyAttack`, `Dodge` (roll/backstep, context by movement), `Sprint` (hold), `Block` (hold), `Parry` (tap; may share button with Block via tap-vs-hold — see 6), `LockOn` (toggle), `TargetSwitchLeft`, `TargetSwitchRight`, `UseFlask`, `Special1` (Ground Current), `Special2` (Leyline Lance), `Cauterize` (Special3, hold 0.5 s to confirm), `Interact` (Attunement Stone / levers / pickups), `Pause`.

### 2.14 Determinism contract for all three engines
1. Fixed timestep **1/60 s**; all combat logic on the fixed step; rendering may interpolate.
2. Input buffer **6 frames**; combo link window **18 frames**; these are frame counts, not seconds.
3. All randomness (e.g., boss attack selection where "random" is specified) draws from a **named seeded PRNG** (xorshift128, seed logged at encounter start) so two runs with the same inputs match. Seed value for the slice's deterministic test runs: **0x41455448** ("AETH").
4. Damage is integer; resolved at the active-frame of the hitbox overlap, attacker's frame-of-contact authoritative.
5. Hitboxes/hurtboxes are capsules/spheres defined in the shared data (Section 5), not per-engine mesh colliders, so all three resolve identically.

---

## 3. VERTICAL SLICE CONTENT — *The Sundered Nexus*

A single, self-contained corrupted node. In the campaign fiction this node maps to one of the canon's real grid anchors; for the slice it is presented as **Node Δ (Externsteine-class rock sanctuary)** — chosen because the lore already tags Externsteine as a C-traditional solstice rock-sanctuary, giving the arena a believable vertical, riven-stone geometry.

### 3.1 Greybox layout — areas and connections

```
                         [E1] The Approach (tutorial corridor)
                              │  (one-way drop after the gate)
                              ▼
        ┌──────────────►  [A] Threshold Hall  ◄── Attunement Stone #1 (the only save)
        │                     │            ╲
        │                     │             ╲ (hidden seam, S1)
        │                     ▼              ╲
        │            [B] The Riven Stair      ▼
        │                     │           [S1] Hollow Below  ← SECRET 1
        │                     ▼
        │            [C] Conductor's Gallery ──(MINI-BOSS gate: The Tuning Knight)
        │                     │
        │                     ▼
        │            [D] The Choir of Stone  ──(lever puzzle; opens E)
        │                  │        ╲
        │                  │         ╲(false wall, S2)
        │                  ▼          ▼
        │         [E] The Fold Antechamber   [S2] The Unsanctioned Vault ← SECRET 2
        │                  │
        │                  ▼
        └──────────  [F] The Sundered Nexus (MAIN-BOSS arena: Aetherius-Mar)
```

**Per-area description:**

- **E1 — The Approach.** Tutorial corridor. Movement, lock-on, light/heavy, dodge i-frames taught against 2–3 weak "Husk" enemies. Ends in a one-way drop into Threshold Hall, so the player can't re-enter and the slice has a clean front door.
- **A — Threshold Hall.** Hub. Contains **Attunement Stone #1** (the only checkpoint). Three exits: the Riven Stair (critical path, lit by the guiding leyline), a faintly mismatched wall (S1), and a sealed door back to E1.
- **B — The Riven Stair.** Vertical descent, fall-damage taught gently, 4–5 Husks and one **Sundered Acolyte** (ranged). The guiding leyline light threads the safe path down.
- **C — Conductor's Gallery.** A long gallery of broken organ-pipe stone. **Mini-boss arena** (The Tuning Knight) at the far end; its fog-gate is the canon Souls "you are committed" threshold.
- **D — The Choir of Stone.** A 3-lever resonance puzzle (align three stone tongues to the guiding-light's pitch-color) that opens the gate to E. Teaches `Interact` and soft environmental reading. One false wall here (S2).
- **E — The Fold Antechamber.** Calm-before-the-storm room; second view of the guiding leyline converging hard toward F. No enemies — a deliberate breath. A non-checkpoint **rest alcove** (lore plaque, no save).
- **F — The Sundered Nexus.** Main boss arena. A circular riven-stone platform over a pit of folded Aether; the 15-great-circle motif is etched into the floor and lights up during phase transitions.

### 3.2 Critical path with soft guidance — the Guiding Leyline Light
- A continuous **thread of pale-gold light (#ebbe5a — the canon C-traditional tier color)** runs along the floor/walls of the critical path: **E1 → A → B → C → D → E → F**.
- It is **soft guidance**: it pulses toward the next objective at **0.5 Hz**, brightening when the player faces away from progress for **>8 s** (a gentle nudge), and **never blocks exploration** — side paths are simply unlit.
- At branch points it visibly **forks dim**: the bright fork is the path, the dim fork is optional. This is how the player learns secrets exist without a quest marker.
- Diegetic justification: the Warden's blade reads the strongest remaining clean current, which always runs toward the wound.

### 3.3 Hidden secret areas (2)

**S1 — The Hollow Below** (hidden in Threshold Hall, A)
- **How hidden:** one wall panel is rendered with a subtly *mismatched fog value and a missing vertex-snap seam* — i.e., it reads as "wrong" to a player attuned to the aesthetic. Striking it with a heavy attack (or a Ground Current special) collapses it.
- **Discovery aid:** the guiding light has a barely-perceptible dim fork pointing at it.
- **Reward:** **+1 Attunement Flask max charge** (3→4 for the rest of the slice) and a lore tablet (D-folklore tier intel: the first written hint of the main boss's true name).

**S2 — The Unsanctioned Vault** (hidden in The Choir of Stone, D)
- **How hidden:** solving the lever puzzle in the *"wrong" but harmonically valid order* (a 4th lever sequence the puzzle doesn't require) opens a false wall instead of the main gate. The clue is a fourth stone tongue that hums when the guiding light sweeps it.
- **Reward:** a **second weapon / weapon-art unlock** for the slice — the **"Resonant Edge"** variant (Section 5.4 alt stat block; faster, lower poise damage) — plus **+25 starting AE** carried into the boss. Tier framing: this is "D-folklore" intel the Order never sanctioned, hence *unsanctioned* — power with no provenance.

### 3.4 Checkpoint — the Attunement Stone (bonfire analog)
- **One** in the slice: Threshold Hall (A).
- **On interact:** refills HP to full, refills Attunement Flask to max, refills nothing of AE (AE is earned in combat), **respawns all non-boss enemies**, sets the respawn point, and opens the Stone's menu (rename Warden, level review — leveling itself is out of scope for the slice but the menu hooks exist).
- **On death:** respawn at the last-rested Attunement Stone with full HP/Flask; enemies reset; bosses reset fully; the player drops a **"Cinder of Aether"** (lost-currency analog, cosmetic in the slice) at the death spot, recoverable once.
- Visual: a standing riven stone threaded with the gold guiding light; lighting the stone is the only moment fog briefly clears (a reward beat).

### 3.5 MINI-BOSS — **The Tuning Knight** (Sera, the First Warden of this Node)

- **Lore tie:** the former Warden assigned to maintain Node Δ. When it sundered, the corruption took her *before* she could re-anchor it; her armor now "tunes" itself to the wrong geometry. She is what the player could become. (Foreshadows that the main boss is the node's accumulated corruption — and that Wardens are not safe from it.)
- **Arena:** Conductor's Gallery (C), ~18 m diameter, broken organ-pipe pillars provide line-of-sight breaks (used in phase 2).
- **Stats:** HP **2600**, Poise **120**, Poise regen **20/s** (regen suspended for 1.5 s after a stagger). `launchable: false` (too armored — launchers convert to poise per 2.7). Fog-gate locks the room.

**Phase 1 (100%→55% HP): "In Tune"** — grounded, readable, punish-window heavy.
| Attack | Tell | Timing | Damage / Poise | Punish window |
|---|---|---|---|---|
| Overhead Cleave | raises blade overhead, 24-frame wind-up, blade glints gold | active f25–30 | 180 / 35 | 18-frame recovery after — free heavy |
| Horizontal Sweep ×2 | steps in, hip rotation | active f18–22, then f34–38 | 120 / 22 each | after 2nd sweep, 22f recovery |
| Lunge Thrust | pulls blade back, points at you | active f20–26, travels 6 m | 150 / 40 | sidestep (dodge f5–17) → backstab armed |
| Guard | raises shield (visual), 1.5 s | — | blocks frontal | walk behind → backstab |

**Transition trigger:** at **≤55% HP**, she "retunes": a 90-frame stagger-immune animation, screen pulses, poise resets, **Phase 2** begins. (If the player has Cauterize active, the transition still completes — bosses are immune to interrupt during transitions, per 2.14.)

**Phase 2 (55%→0%): "Dissonant"** — adds tracking, a delayed feint, and uses the pillars.
| Attack | Tell | Timing | Damage / Poise | Punish window |
|---|---|---|---|---|
| Feint Cleave | identical wind-up to Overhead, but **holds** 14 extra frames before striking | active f39–44 | 200 / 38 | bait-and-punish; dodge late |
| Pillar Dash | retreats behind a pillar, gold streak | 30-frame approach, reappears with a thrust f31–36 | 160 / 42 | the streak telegraphs the exit pillar |
| Resonant Burst | plants blade, 40-frame charge, gold ring expands to 6 m | active f41–48 | 140 / 60 (guard-breaks) | **must leave the ring**; long 30f recovery — best heavy window |
| Combo: Sweep→Sweep→Feint | as P1 sweeps then the feint | chained | per move | dodge the feint, full punish |

**On death:** drops the **Conductor's Key** (opens D's puzzle shortcut) and a guaranteed **Flask refill**. Flow grade logged.

### 3.6 MAIN BOSS — **Aetherius-Mar, the Folded Choir** (the corruption embodied)

- **Lore tie:** not a creature but the **node's accumulated corruption given a body** — the canon's "crossing that folded inward and began consuming." It wears fragments of every Sundered thing the node has eaten, including Wardens. Its name is the guide-intelligence's name *(Aetherius)* warped — *Aetherius-Mar*, "the Aetherius that turned" — the horror being that the thing maintaining the grid and the thing destroying it share an origin. Re-anchoring the node = killing it.
- **Arena:** The Sundered Nexus (F). Circular, ~26 m, ringed by a pit of folded Aether (falling in = instant death; environmental hazard the boss uses). The floor is etched with the **15 great circles**; they ignite in phase 2.
- **Stats:** HP **7200**, Poise **200**, Poise regen **25/s**. `launchable: false`. Three phases.

**Phase 1 (100%→65%): "The Lines Hold"** — a corrupted-knight melee form. Teaches its tempo.
| Attack | Tell | Timing | Dmg / Poise | Punish |
|---|---|---|---|---|
| Triple Slash | three telegraphed arcs, each with a 16-frame wind-up | active per arc | 110/20 ea | after 3rd, 24f recovery |
| Ground Fissure | slams blade, gold crack races toward you | 30f wind-up, crack hits f31 along a line | 150/35 | strafe off the line, punish the slam |
| Grab | lunges with open hand, **un-parryable**, gold flash | active f22–28, 5 m | 280/— + throw | dodge i-frames only; whiffed grab = 40f recovery (biggest window) |

**Transition 1 → at ≤65% HP: "The Lines Bend."** The great circles on the floor ignite (#ebbe5a); the boss sheds armor, gains speed, and adds ranged Aether attacks. 100-frame immune transition.

**Phase 2 (65%→30%): "The Lines Bend"** — adds zoning, faster melee, uses the etched circles.
| Attack | Tell | Timing | Dmg / Poise | Punish |
|---|---|---|---|---|
| Leyline Volley | raises hand, 3 gold orbs spawn, fire in sequence | spawn f1, fire f20/35/50, homing-lite | 90/15 ea | dodge each on its tell; gaps to close distance |
| Circle Ignite | one etched great circle flares — stand off it | 36f warning glow, then ignites for 1.2 s | 160/45 if on it | pure positioning; free window while it burns |
| Rushing Combo | dash + 4-hit string, last hit delayed (feint) | dash 24f, hits at f25/35/45/**63** | 100/20 ea | dodge the delayed 4th, then punish |
| Phase-tell roar | at 30% the arena dims — see Transition 2 | — | — | — |

**Transition 2 → at ≤30% HP: "The Lines Break."** **Cauterize-the-node beat:** the boss folds inward, pulls Aether from the pit, grows a second pair of arms, and the arena's great circles **all** ignite in a slow rotating pattern (a moving safe-zone dance). 120-frame immune transition; the guiding-light voice (Aetherius) speaks one line.

**Phase 3 (30%→0%): "The Lines Break"** — desperation; combines everything, adds an arena-wide attack with a hard counter.
| Attack | Tell | Timing | Dmg / Poise | Punish |
|---|---|---|---|---|
| Choir of Blades | summons 6 floating blades, fire two at a time | volley f1/30/60, each blade telegraphs with a gold line | 100/18 ea | weave; punish between volleys |
| Rotating Circles | the ignited great circles rotate; a single safe wedge moves | continuous for 4 s | 200/60 on contact | stay in the wedge; no offense window — survival phase |
| Fold (super) | boss kneels, pulls the whole arena's Aether inward, 90f charge, screen gold-shifts | detonates f91 arena-wide | **600/100, lethal-ish** | **HARD COUNTER:** a clean **parry** at f88–91 **or** spending **Cauterize** negates it and staggers the boss for a 120f critical window (the intended kill setup) |
| Desperate Grab | as P1 grab but faster (f18–24) | 5 m | 300/— | dodge-only |

**On death:** the node re-anchors — fog clears across F, the great circles settle into a calm steady glow, the guiding light goes still. Slice complete. Boss Flow grade + total time logged for cross-engine comparison.

### 3.7 Enemy roster (non-boss, for the slice)
| Enemy | HP | Poise | Notable | `launchable` |
|---|---|---|---|---|
| **Husk** | 180 | 15 | shambling melee, single overhead, tutorial fodder | true |
| **Sundered Acolyte** | 140 | 10 | ranged gold-bolt, kites, low poise | true |
| **Stone Sentinel** | 420 | 70 | slow, hyper-armored, big punish windows | false |

Full stat blocks formalized as data in Section 5.5.

---

## 4. RETRO N64/PS1 AESTHETIC SPEC

This is **art direction and scope reduction in one**: low render targets and crude shading mean cheaper assets, smaller textures, fewer polys, and forgiving collision — and a unified look across three engines. Every value below is a contract; deviation must be logged.

### 4.1 Render resolution / scale
- **Internal render resolution: 320 × 240** (4:3, PS1-native). Upscale (integer or sharp-bilinear at the engine's choosing) to the window. Letterbox to preserve 4:3.
- Optional documented mode: **640 × 480** for "N64" feel — but the **slice ships at 320 × 240** so all three match. Render scale parameter: `renderScale = internalH / outputH`.
- **No** post-process anti-aliasing. No TAA, no FXAA. Jaggies are the look.

### 4.2 Vertex snapping (PS1 wobble)
- Transform each vertex's **screen-space (post-projection) position to a fixed grid** before rasterization. Grid precision: **snap to a 256-step grid across the internal width** → effectively `snap = round(pos * (gridRes/2)) / (gridRes/2)` with **gridRes = 160** (in internal pixels) for X and **120** for Y, i.e., quantize to the 320×240 pixel lattice at **¼-pixel granularity off**, producing the characteristic vertex jitter.
- Concrete contract: snap NDC.xy to a grid of **160 × 120 cells** (one cell ≈ 2 internal px). Apply **after** perspective divide, **before** viewport. This must be identical in all engines (implement in the vertex/geometry stage or a snap shader).

### 4.3 Affine texture warping
- **ON.** Disable perspective-correct texture interpolation (affine/screen-space UV interpolation), producing the PS1 texture "swim" on large near surfaces. Where an engine cannot disable perspective correction globally, emulate via a vertex-passed `1/w` of constant or a documented affine shader. **All three must render affine.**

### 4.4 Shading
- **Flat shading** (per-face normals, no smooth normals) as the default for world geometry.
- **Vertex lighting only** — no per-pixel lighting, no normal maps, no specular. One key directional light + one ambient term.
- Characters may use **Gouraud (smooth vertex) shading** for readability of silhouettes, but still vertex-lit only. Document per-asset which is used; keep it identical across engines.

### 4.5 Fog
- **Linear fog**, used aggressively for draw-distance scope reduction and mood.
- **Start: 8 m. End: 36 m.** Beyond 36 m → full fog color (nothing drawn; pair with a 38 m far-clip).
- **Fog color: #1a1f2e** (cold near-black blue) for general areas; **#2a2418** (warm murk) inside the boss arena F. Per-area fog color is a zone parameter.
- Fog clears briefly only at the Attunement Stone (3.4) and on the main-boss death (3.6).

### 4.6 Color depth / palette / dithering
- **Color depth: 16-bit (RGB555)** output — quantize the framebuffer to 5 bits per channel.
- **Ordered (Bayer 4×4) dithering** applied during the 24→16-bit quantization to fake gradients, the PS1 banding-hider. Dither strength: full (1.0).
- **Texture palette: 256 colors max per texture** (8-bit indexed), textures authored at **≤128×128**, most at 64×64.

### 4.7 Texture filtering
- **Point (nearest-neighbor) sampling only.** No bilinear, no mipmaps (or nearest-mip-nearest at most). Crunchy texels are the look. `filterMode = POINT` globally.

### 4.8 Framerate feel
- **Target 30 fps presentation feel** (PS1/N64 cadence) **but** simulate combat on the **fixed 60 Hz** logic step (Section 2.14) for fair, comparable combat. So: logic at 60, present at a **capped 30** if a team wants the authentic judder, otherwise present at 60 with the 60 Hz logic. **Decision for the slice: present at 30 fps (frame-double) for aesthetic authenticity; logic remains 60 Hz fixed.** Both choices are documented; combat numbers do not change because they are frame-count based.

### 4.9 UI / HUD style
- **Diegetic-minimal, PS1-era.** Chunky 1-bit-feel pixel font (authored, monospace, ~8×8 cell), no anti-aliasing on text.
- **HUD elements:**
  - **HP bar** top-left, red, segmented, hard pixel edges.
  - **Stamina bar** under HP, green (#78e6a0 — canon B tier color).
  - **Aether (AE) bar** under stamina, blue (#50c8ff — canon A tier color).
  - **Flow meter** right side, vertical, a column of runes that fills; the rank letter **D/C/B/A/S** large above it, color-shifting from gold (#ebbe5a) at low ranks to white-hot at S.
  - **Flask count** bottom-left, small flask icon ×N.
  - **Boss health bar** bottom-center, wide, with the boss name in the pixel font; segments mark phase-transition HP thresholds.
- All HUD rendered at internal res (320×240) so it's appropriately chunky. Lock-on reticle: a simple 4-pixel gold bracket.

---

## 5. SHARED DATA SCHEMAS (engine-agnostic JSON)

**Goal:** all three engines load the **same files** so builds stay comparable. Proposed location:

```
game/shared/design-data/
  moves/        moves.json            (attack/move definitions)
  bosses/       bosses.json           (boss configs: phases + attack-pattern refs)
  weapons/      weapons.json          (weapon stat blocks)
  enemies/      enemies.json          (enemy stat blocks)
  combat.json                         (global constants from §2: i-frames, costs, hitstop, Flow thresholds)
  schema/       *.schema.json         (JSON Schema for each, for CI validation across engines)
```

Conventions: all distances in **meters**, all durations in **frames @60**, all damage **integers**, all ids **kebab-case strings**. Every engine validates against `schema/` in CI; a build that fails validation is not comparable and is rejected.

### 5.1 Move / attack definition

**Schema (abridged JSON Schema):**
```json
{
  "$id": "move.schema.json",
  "type": "object",
  "required": ["id", "name", "kind", "frames", "hits"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "kind": { "enum": ["light","heavy","launcher","aerial","special","grab","critical"] },
    "staminaCost": { "type": "number" },
    "aetherCost": { "type": "number", "default": 0 },
    "frames": {
      "type": "object",
      "required": ["total","active"],
      "properties": {
        "total": { "type": "integer" },
        "startup": { "type": "integer" },
        "active": { "type": "array", "items": { "type": "integer" }, "minItems": 2, "maxItems": 2 },
        "recovery": { "type": "integer" },
        "iframes": { "type": "array", "items": { "type": "integer" } },
        "hyperArmorFrom": { "type": "integer" }
      }
    },
    "hits": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["damage","poiseDamage","hitstop","hitbox"],
        "properties": {
          "damage": { "type": "integer" },
          "poiseDamage": { "type": "integer" },
          "hitstop": { "type": "integer" },
          "knockback": { "type": "number" },
          "launch": { "type": "boolean", "default": false },
          "hitbox": {
            "type": "object",
            "required": ["shape","radius","offset"],
            "properties": {
              "shape": { "enum": ["sphere","capsule"] },
              "radius": { "type": "number" },
              "length": { "type": "number" },
              "offset": { "type": "array", "items": { "type": "number" }, "minItems": 3, "maxItems": 3 }
            }
          }
        }
      }
    },
    "comboNext": { "type": "array", "items": { "type": "string" } },
    "flowMoveId": { "type": "string" }
  }
}
```

**Example:**
```json
{
  "id": "player-light-1",
  "name": "Edge Slash 1",
  "kind": "light",
  "staminaCost": 10,
  "aetherCost": 0,
  "frames": { "total": 22, "startup": 7, "active": [8, 11], "recovery": 11, "iframes": [] },
  "hits": [
    {
      "damage": 70, "poiseDamage": 12, "hitstop": 4, "knockback": 0.4, "launch": false,
      "hitbox": { "shape": "capsule", "radius": 0.6, "length": 2.0, "offset": [0, 1.0, 1.2] }
    }
  ],
  "comboNext": ["player-light-2"],
  "flowMoveId": "edge-slash-1"
}
```

### 5.2 Boss config (phases + attack-pattern references)

**Schema (abridged):**
```json
{
  "$id": "boss.schema.json",
  "type": "object",
  "required": ["id","name","hp","poise","arena","phases"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "loreRef": { "type": "string" },
    "hp": { "type": "integer" },
    "poise": { "type": "integer" },
    "poiseRegen": { "type": "number" },
    "launchable": { "type": "boolean", "default": false },
    "arena": { "type": "string" },
    "phases": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id","hpEnterPct","attacks"],
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "hpEnterPct": { "type": "number" },
          "transitionInFrames": { "type": "integer" },
          "immuneDuringTransition": { "type": "boolean", "default": true },
          "attacks": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["moveRef","weight"],
              "properties": {
                "moveRef": { "type": "string" },
                "weight": { "type": "number" },
                "minRangeM": { "type": "number" },
                "maxRangeM": { "type": "number" },
                "cooldownFrames": { "type": "integer" },
                "tell": { "type": "string" },
                "punishRecoveryFrames": { "type": "integer" }
              }
            }
          }
        }
      }
    }
  }
}
```

**Example (one phase shown):**
```json
{
  "id": "boss-aetherius-mar",
  "name": "Aetherius-Mar, the Folded Choir",
  "loreRef": "content/canon/aetherius.md#turned",
  "hp": 7200, "poise": 200, "poiseRegen": 25, "launchable": false,
  "arena": "f-sundered-nexus",
  "phases": [
    {
      "id": "p1-lines-hold", "name": "The Lines Hold", "hpEnterPct": 1.0,
      "transitionInFrames": 0, "immuneDuringTransition": true,
      "attacks": [
        { "moveRef": "mar-triple-slash", "weight": 0.4, "minRangeM": 0, "maxRangeM": 3.5, "cooldownFrames": 40, "tell": "three telegraphed arcs", "punishRecoveryFrames": 24 },
        { "moveRef": "mar-ground-fissure", "weight": 0.35, "minRangeM": 3.5, "maxRangeM": 12, "cooldownFrames": 70, "tell": "blade slam, gold crack", "punishRecoveryFrames": 30 },
        { "moveRef": "mar-grab", "weight": 0.25, "minRangeM": 0, "maxRangeM": 5, "cooldownFrames": 120, "tell": "open-hand lunge, gold flash", "punishRecoveryFrames": 40 }
      ]
    }
  ]
}
```
(Attack selection: each fixed-step decision draws from the seeded PRNG (§2.14), filters attacks by range and cooldown, then weighted-random among the eligible. Identical across engines because the seed and order are fixed.)

### 5.3 Weapon stats

**Schema (abridged):**
```json
{
  "$id": "weapon.schema.json",
  "type": "object",
  "required": ["id","name","baseDamage","basePoiseDamage","moveset"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "baseDamage": { "type": "integer" },
    "basePoiseDamage": { "type": "integer" },
    "scaling": {
      "type": "object",
      "properties": { "strength": {"type":"number"}, "attunement": {"type":"number"} }
    },
    "staminaPerLight": { "type": "number" },
    "staminaPerHeavy": { "type": "number" },
    "moveset": { "type": "array", "items": { "type": "string" } },
    "specials": { "type": "array", "items": { "type": "string" } },
    "critMultiplier": { "type": "number" },
    "riposteMultiplier": { "type": "number" }
  }
}
```

**Example:**
```json
{
  "id": "geomancers-edge",
  "name": "Geomancer's Edge",
  "baseDamage": 70, "basePoiseDamage": 12,
  "scaling": { "strength": 0.8, "attunement": 1.0 },
  "staminaPerLight": 10, "staminaPerHeavy": 22,
  "moveset": ["player-light-1","player-light-2","player-light-3","player-heavy-1","player-launcher","player-aerial-1","player-aerial-slam","player-dash-thrust"],
  "specials": ["ground-current","leyline-lance","cauterize"],
  "critMultiplier": 2.5, "riposteMultiplier": 3.0
}
```
(Secret S2's "Resonant Edge" alt: `baseDamage 55, basePoiseDamage 8, staminaPerLight 8`, faster move frame data — its own file, same schema.)

### 5.4 Enemy stats

**Schema (abridged):**
```json
{
  "$id": "enemy.schema.json",
  "type": "object",
  "required": ["id","name","hp","poise","poiseRegen","launchable","attacks"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "hp": { "type": "integer" },
    "poise": { "type": "integer" },
    "poiseRegen": { "type": "number" },
    "launchable": { "type": "boolean" },
    "moveSpeedMps": { "type": "number" },
    "tier": { "enum": ["A-measured","B-scholarly","C-traditional","D-folklore"] },
    "attacks": { "type": "array", "items": { "type": "string" } },
    "loot": { "type": "array", "items": { "type": "string" } }
  }
}
```

**Example:**
```json
{
  "id": "husk",
  "name": "Husk",
  "hp": 180, "poise": 15, "poiseRegen": 10, "launchable": true,
  "moveSpeedMps": 2.2, "tier": "D-folklore",
  "attacks": ["husk-overhead"],
  "loot": ["cinder-small"]
}
```
(The `tier` field reuses the canon provenance system verbatim — `src/lib/tiers.ts` — so enemy "realness" is the same four-tier vocabulary the rest of Aether uses, and the same colors drive their corruption glow.)

### 5.5 Global constants — `combat.json` (excerpt)
```json
{
  "fixedTimestepHz": 60,
  "inputBufferFrames": 6,
  "comboLinkWindowFrames": 18,
  "dodge": { "totalFrames": 30, "iframes": [5, 17], "distanceM": 4.0, "staminaCost": 25 },
  "stamina": { "max": 100, "regenPerSec": 40, "regenDelaySec": 0.5 },
  "aether": { "max": 100 },
  "flask": { "startCharges": 3, "healAmount": 400, "drinkFrames": 52, "healAppliesFrame": 40 },
  "flow": {
    "ranks": ["D","C","B","A","S"],
    "enterFP": { "D": 0, "C": 1200, "B": 3000, "A": 5200, "S": 8000 },
    "decayPerSec": { "D": 200, "C": 300, "B": 450, "A": 600, "S": 800 },
    "baseHitFP": 40,
    "varietyMult": { "novel": 2.0, "recent": 1.3, "repeat": 0.5 },
    "damageTakenFPLossPct": 0.40,
    "aeByRank": { "D": 0, "C": 1, "B": 2, "A": 3, "S": 4 }
  },
  "prngSeed": "0x41455448"
}
```

---

## 6. PLAYER INPUT MAP

Action names match Section 2.13. Both schemes are first-class; the slice ships with both fully bound.

### 6.1 Gamepad (Xbox layout; PlayStation equivalents in parentheses)
| Action | Binding |
|---|---|
| Move | Left Stick |
| Camera | Right Stick |
| LightAttack | X (□) |
| HeavyAttack | Y (△) |
| Dodge / Backstep | B (○) |
| Sprint | B (○) **hold** (tap = dodge, hold = sprint) |
| Block | LB (L1) **hold** |
| Parry | LB (L1) **tap** (tap-vs-hold disambiguated at 10 frames) |
| LockOn | R3 (Right Stick click) |
| TargetSwitchLeft / Right | Right Stick flick L / R (while locked) |
| UseFlask | D-pad Up |
| Special1 (Ground Current) | RB (R1) |
| Special2 (Leyline Lance) | RB + LightAttack, or D-pad Right |
| Cauterize (Special3) | RT + LT **hold 0.5 s** (R2 + L2) |
| Interact | A (✕) |
| Pause | Start (Options) |

### 6.2 Keyboard + Mouse
| Action | Binding |
|---|---|
| Move | W A S D |
| Camera | Mouse move |
| LightAttack | Left Mouse Button |
| HeavyAttack | Right Mouse Button |
| Dodge / Backstep | Space (tap) |
| Sprint | Left Shift (hold) |
| Block | Q (hold) |
| Parry | Q (tap) — or Middle Mouse Button |
| LockOn | Mouse Button 4 (or Tab) |
| TargetSwitchLeft / Right | Mouse Button 4 + flick, or Q/E while locked — bind: **`[` / `]`** |
| UseFlask | R |
| Special1 (Ground Current) | F |
| Special2 (Leyline Lance) | C |
| Cauterize (Special3) | V (hold 0.5 s) |
| Interact | E |
| Pause | Esc |

**Binding notes for all engines:** the **tap-vs-hold** split (Dodge/Sprint on B/Space; Parry/Block on LB/Q) resolves at **10 frames** — release before frame 10 = the "tap" action, still held at frame 10 = the "hold" action begins. This must be identical across engines (it's in `combat.json` as `tapHoldThresholdFrames: 10`). All bindings are remappable; the **defaults above are the comparison baseline** and the three builds ship identical defaults.

---

## Appendix A — Cross-engine comparability checklist
1. Load identical `game/shared/design-data/*` files; pass `schema/` validation in CI. ✅ required to ship.
2. Fixed 60 Hz logic step; present at 30 fps (frame-doubled) per §4.8.
3. Seeded PRNG `0x41455448` for all "random" boss/AI decisions; log seed at encounter start.
4. Capsule/sphere hit/hurtboxes from data (§5.1), not per-engine mesh colliders.
5. Aesthetic contract numbers (§4) implemented and visually diffed against reference frames.
6. Boss kills emit a log line: `{boss, timeSec, flowGrade, deaths, flaskUsed}` — the comparison telemetry.
7. Any deviation from a value in this bible is recorded in a per-engine `DEVIATIONS.md`; silent retuning forbidden.

## Appendix B — Lore-to-mechanic mapping (quick reference)
| Canon | In-game |
|---|---|
| Aether (5th element) | The energy you channel through the blade |
| Leylines | Rivers of power; the guiding light follows the cleanest one |
| Becker-Hagens grid (62 nodes / 15 great circles) | The Lattice; the boss arena floor; 15 circles ignite in boss phases |
| Nexus / crossings | Corrupted nodes; the slice is one (Node Δ) |
| Provenance tiers A/B/C/D | Enemy "realness" + intel gating + hidden-content framing; reuse `tiers.ts` colors |
| Eight Organs | Eight disciplines; Warden is Atlas+Loom (the only "alive" ones) |
| Aetherius (the guide) | The in-ear guide / Attunement Stone voice; the main boss is its turned mirror, *Aetherius-Mar* |
| Hohenheim charge ("learn the dark arts to undo them") | The Warden's whole job: channel corruption to cauterize it |
| ~1,289 POI sites | The campaign map beyond the slice; each a potential node |
| Monte-Carlo honest baseline | Tonal core: the corruption is *real*, passes every test — that's the horror |

---

### Critical Files for Implementation
These existing repo files are the lore + type foundations the game's shared data and framing reuse:
- /home/user/aether/content/canon/aetherius.md
- /home/user/aether/content/canon/provenance.md
- /home/user/aether/src/lib/types.ts
- /home/user/aether/src/lib/tiers.ts
- /home/user/aether/src/lib/engine.ts

New shared-data files to be authored at implementation (engine-agnostic, all three engines load these):
- game/shared/design-data/combat.json
- game/shared/design-data/moves/moves.json
- game/shared/design-data/bosses/bosses.json
- game/shared/design-data/enemies/enemies.json
- game/shared/design-data/weapons/weapons.json
