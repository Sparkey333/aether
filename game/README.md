# Aether: The Sundered Nexus — the game

A 3D third-person **boss-fighting action game** (hybrid Souls + Devil May Cry) with a deliberately
**N64/PS1 retro-HD** look, built **three ways** (Three.js, Godot, Unity) so the implementations can be
compared. It reuses the **Aether** geomancy lore from the root *Atlas* app (leylines, the planetary
Lattice, sacred nexus sites, the four provenance tiers). The Atlas app at the repo root is unaffected
by anything in here.

> The repo holds **two products**: the **Aether Atlas** (geomancy engine, `src/` + `src-tauri/`) and
> **this game** (`game/`). They share lore and the four-tier color vocabulary; otherwise independent.

## The contract: `game/shared/`

`game/shared/design-data/*.json` is the **single source of truth** — every combat number, boss
phase, move, and the retro-render spec. All three engine builds load it and validate it against
`schema/*.schema.json`. A build that fails validation is rejected as non-comparable. Determinism is
seeded (`prngSeed = 0x41455448`, "AETH") on a fixed 1/60 s step, so a boss kill in one engine
reproduces in the others.

Design docs live in `docs/`: `game-bible.md` (the design contract), `game-build-plan.md` (the
three-engine synthesis), and `game-engine-{threejs,godot,unity}.md` (per-engine architecture).

## Builds

| Build | Folder | Run it | Status |
|---|---|---|---|
| **Three.js / R3F** | `game/threejs/` | `cd game/threejs && npm install && npm run dev` → browser | **playable greybox** (M0–M2): retro render, locomotion, camera, dodge, shared-data load |
| **Godot 4.3** | `game/godot/` | open the folder in Godot 4.3, run *Tools → Aether → Build Everything*, F5 | planned |
| **Unity 6 (URP)** | `game/unity/` | open in Unity 6, run *Aether → Build Vertical Slice*, Play | planned |

Three.js is built first because it is the only build that runs/iterates live in a headless
environment; it authors and proves the shared design-data the other two consume.

## Three.js build — commands

```bash
cd game/threejs
npm install
npm run dev            # vite dev server, http://localhost:5173 (HMR for code + shaders + JSON)
npm run validate-data  # CI gate: schema + referential integrity + tier-color parity
npm run test           # vitest: determinism (seeded PRNG, fixed step) + math
npm run typecheck      # tsc --noEmit
npm run build          # → game/threejs/dist (static, shareable, self-contained)
```

### Vertical-slice content (target)
One zone — *The Sundered Nexus* (Node Δ): E1 Approach → A Threshold Hall → B Riven Stair →
C Conductor's Gallery (mini-boss **The Tuning Knight**) → D Choir of Stone → E Fold Antechamber →
F Sundered Nexus (main boss **Aetherius-Mar**). Clear critical path lit by a guiding leyline, two
hidden secrets, one Attunement Stone checkpoint.

### Milestones
- **M0** shared design-data + schemas + validation ✅
- **M1** retro render pipeline (320×240, vertex snap, affine warp, posterize/dither, fog) ✅
- **M2** fixed-step engine + input + locomotion + camera + dodge/stamina ✅
- **M3** combat core (combos, hitboxes, poise, Flow meter, specials) — next
- **M4** enemies + lock-on + HUD live values
- **M5** mini-boss (data-driven FSM) · **M6** main boss · **M7** world/secrets/checkpoint/save · **M8** audio + Tauri window + shareable build
