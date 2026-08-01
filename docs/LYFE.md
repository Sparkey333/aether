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

- **Now (built)** — Life Tree (138) + Order Score + Water-Line + Snags +
  **Time-Waves** (real dated commitments seeding the urgency tide) + **the
  Vacuum** (read-only clutter findings) + **Trajectory** (projection from
  measured completion counters). One emerald design system; the leaf as brand.
- **Now (built)** — **hand re-sorting**: click any project to move it between
  pillars. The person's judgment outranks the classifier, persists locally, and
  recomputes the Order Score live (`src/lib/lyfe/store.ts`).
- **Next** — per-project drill-in; `TODO#3–6` *dated* rows into Time-Waves (their
  completion counters are already in `history.seed.json`).
- **Vacuum execution** — local folder scan (Tauri fs): turn the findings into
  actual backup-first safe moves with approval + a Drive backup target. Mirrors
  the VACUUM-app spirit. Ships in the Mac build only.
- **Connectors** — Google Drive / Todoist read + safe organize. Todoist is the
  big unlock: it turns the completion *ratio* into a velocity over time.
- **Trajectory, deepened** — résumé/LinkedIn import to add career points to the
  projection (named as a gap in `MISSING_INPUTS` until it lands), then gentle
  nudges.
- **Boosted intelligence** — optional BYOK (Anthropic key, **OS keychain** — see
  [`SECURITY.md`](../SECURITY.md)) to let Lyfe narrate balance reads and suggest
  re-sorts. Never bundled into the app.

## The first real finding (2026-06)

Lyfe's first honest read of its own owner, from the TODO#1–6 completion counters:

> **59.1%** of items get finished where someone else is waiting (26/44).
> **8.3%** get finished where only you are (1/12). A **50.8-point** gap.

Not a discipline problem — the external number is strong. A *structural* one:
follow-through is wired to other people, so self-directed work is the only work
that arrives with nobody waiting for it. The lever Lyfe suggests is small and
testable: give one soul-project a witness. The caveat is stated with it — this
is drawn from board counters, not time logs, so work finished outside these
sheets is invisible to it.
