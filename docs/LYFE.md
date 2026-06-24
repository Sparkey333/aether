# Lyfe · Projekt Z — the harmony organ

Lyfe reads *the person* the way [Aether](../README.md) reads the land: it gathers
the scattered self — projects, tasks, files across drives and apps — into one
honest picture, reveals the order already latent in it, and projects an honest
trajectory forward. Gently gamified, local-first, **TransparentZ**. See the
mandate in [`content/canon/lyfe.md`](../content/canon/lyfe.md).

## What happened (the diagnosis, 2026-06-16)

A scan of the owner's Google Drive found the same project — *Lyfe* — started and
abandoned under **three overlapping names**, the fragmentation itself mirroring
the problem the app is meant to solve:

| Place | What it is |
|---|---|
| `_ProjectZ/` | Main workspace. Holds `_LYFE Projects/` plus a flat pile of AI/learning/business subfolders (Ansom Robotics, ANSOM OUTDOOR-AI, Breaking Hecras Code, Agents-Udemy, REPLIT-Gamified-Hecras-3D, …). |
| `Todoist - LIFE LYFE Projects/` (top-level) | The data hub: the **LIFE Tree Master Tracker** (138 projects), Todoist `.zip` backups, and an empty **"Dual-Path Data Extractor — Todoist Case Study"** folder. |
| `_LYFE Projects/` (inside `_ProjectZ`) | Older Todoist backups. |

**The crown jewel:** *LIFE Tree Master Tracker — Project Index* — 138 projects
grouped 0–12, each with a Todoist id, section/task/subtask counts, and a state
(active vs. "empty shell"). Its own `Category (optimize later)` column was left
blank — so Lyfe's engine fills exactly that gap with a first-pass pillar mapping.

**Clutter signals (the Vacuum's first targets):**
- `_Workflow` doc duplicated 4× across folders (identical content).
- `Automate_the_Boring_Stuff_3e` zip — exact byte-for-byte duplicate (6,826,503 B).
- `TODO#1_WaterlooIOWA.xlsx` — exact duplicate (1,631,979 B).
- 4+ Todoist backup zips; two drifting copies of the master tracker.
- A 2019 doc literally titled *"Organized Chaos - Balance?"* — this search has
  been running for years; the Water-Line mantra finally names it.

The "what the heck happened" on screen was benign: one Drive search matched so
many files it exceeded the inline size limit and spilled to a temp file — itself
a measure of how scattered things are. Nothing broke.

## What Lyfe v0 does now (built)

- **The Life Tree** (`/lyfe`): all **138 projects** rendered across six pillars —
  Mind (35) · Craft (31) · Body (25) · Work (21) · Spirit (17) · Service (9).
  Synced by [`scripts/lyfe-sync.mjs`](../scripts/lyfe-sync.mjs) from the raw
  tracker export kept at [`src/data/lyfe/tracker.raw.md`](../src/data/lyfe/tracker.raw.md).
- **Order Score** (0–100): balance across pillars + real-work-vs-shells +
  cleanliness. Always shown *with what would move it*.
- **The Water-Line**: three live tides (urgency · priority · soul) with a
  centered/lean reading — the mantra, made interactive.
- **Snags**: duplicates and empty shells detected, each with a *safe* suggestion
  (back-up-first, propose, never auto-delete).
- Pure-function engine in [`src/lib/lyfe/`](../src/lib/lyfe/); real seed in
  [`src/data/lyfe/projects.seed.json`](../src/data/lyfe/projects.seed.json).

## What I need from you to go further

1. ~~Full tracker sync.~~ **Done** — all 138 projects synced from the master
   tracker via `npm run lyfe:sync`. (Still open: the per-area `TODO#1–6` sheets
   add live due-dates and notes.)
2. **Todoist backups.** The `.zip`s hold the real tasks/dates. Either (a) point
   me at the unzipped CSVs in Drive, or (b) I add an importer to the Mac build
   that unzips them locally. Your call — both are safe/local.
3. **Trajectory inputs (later slice).** A résumé / LinkedIn export gives the past
   "points" to project a fair, honest forward trajectory from.
4. **Go-ahead on the Vacuum.** The safe-move/organize engine needs local file
   access — it ships only in the Mac build, and only ever acts after you approve.

## Roadmap

- **Now** — Life Tree + Order Score + Water-Line + Snags (read-only).
- **Next** — full 138 sync; re-sort pillars by hand; per-project drill-in.
- **Vacuum** — local folder scan (Tauri fs): duplicate/clutter map, backup-first
  safe moves with approval, Drive backup target. Mirrors the VACUUM-app spirit.
- **Connectors** — Google Drive / Todoist read + safe organize.
- **Trajectory** — résumé/LinkedIn → life-points timeline → projected paths,
  gentle popup nudges.
- **Boosted intelligence** — optional BYOK (Anthropic key, OS keychain) to let
  Lyfe narrate balance reads and suggest re-sorts. Never bundled into the app.
