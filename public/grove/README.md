# 🌱 The Grove

> A living atlas of the AI toolscape — models, apps, connectors and stacks —
> grown as a tree, so you can trace a path along any tools and read its cost,
> capability and speed **objectively**. A new organ of [Aether](../../README.md),
> built on the same doctrine: *keep every layer, label every layer.*

## What's here

| File | What it is |
|---|---|
| `index.html` | The landing — the doctrine and the two doors |
| `orbs.html` | **Orbs** — the simple first dashboard. Seven floating orbs (the chakras / cores of a life); each lit by how strong AI is for that aspect. Click one → its best root stack + true cost. |
| `tree.html` | **The Tree** — the deep reference. The whole toolscape as strata from fruit to shadow-root. Click tools to lay a path; read cheapest vs fastest vs most-capable on honest numbers. Preset routes included. |
| `data.js` | The canonical dataset — every tool tagged by tree-layer, the 7 aspects, cost model, capability/speed/ease, and a **provenance tier on the data itself**. |
| `grove.css` | Shared styling (inherits Aether's palette). |
| `assets/` | Generated hero art (see *Generating the fruit*). |

## How to view it

It's **self-contained static HTML** — no build step.

- **Right now:** open `public/grove/index.html` in any browser (double-click works — data loads via `<script src>`, so `file://` is fine).
- **Inside the Aether app:** `npm run dev`, then the **Grove** tab in the top nav (served at `/grove/index.html`).

## How to read a path (The Tree)

Click any tools to select them. The right panel sums a **realistic monthly floor**
(free & local roots read $0) and **blends** capability, speed and ease across your
selection — so "cheapest route" and "most capable route" are objective, not vibes.
Thin threads show what *builds on* what (Cursor on a VS Code fork; Claude Code on the
Claude API + MCP; Nano Banana on the Gemini API). Preset routes lay a curated path in
one click: **Aether-native · Cheapest · Fastest · Most capable · Most private/local**.

## The honest tiers

Every datum carries a provenance tier, ported from Aether's Source Atlas —
🔵 measured (vendor docs) · 🟢 scholarly (triangulated) · 🟡 approximate (aggregators) ·
🔴 folklore (unverified / your own private tools). The tier is metadata, never a delete
key. Figures gathered **June 2026**. Like the Loom, the Grove should only re-pulse past a
**real threshold** — not chase every daily price change. To refresh, edit `data.js`.

## Generating the fruit (image gen)

The generators in the canopy are wired to a key-driven pipeline at
[`scripts/imagine.mjs`](../../scripts/imagine.mjs) — **zero dependencies, pure Node**.

```bash
cp .env.local.example .env.local      # then paste your key:
# GEMINI_API_KEY=...   (Nano Banana — https://aistudio.google.com/apikey)

npm run imagine -- "a seed rooting into a glowing tree of AI tools"
npm run imagine -- --hero             # regenerate the Grove's own hero art
npm run imagine -- "prompt" --dry     # show the plan, call nothing
```

Provider priority (first key found wins): **Nano Banana / Gemini** (`gemini-2.5-flash-image`,
cheapest SOTA) → OpenAI GPT Image → Stability. Override the model with
`--model gemini-3-pro-image-preview` (Nano Banana Pro) or via `GROVE_IMAGE_MODEL`.
Keys live only in `.env.local` (git-ignored) — never bundle a key into the shipped app.

> **A note on the `.dmg` / your local folder.** This repository runs in an ephemeral
> cloud container, so it can't see (or write to) a folder on your Mac. The downloadable
> `.dmg` is produced by Tauri **on macOS** with `npm run tauri:build` — it lands in
> `src-tauri/target/release/bundle/dmg/`. Run that on your machine, then drop the `.dmg`
> wherever you keep it. The Grove ships *inside* that app via the **Grove** nav tab.

## Roadmap into Aether proper

This static build is the fast-to-see version. The natural next step is a native
`/grove` React route reading the same `data.js`, an interactive canvas tree (the
n8n-style node-canvas + Obsidian-style graph the user wants to mimic), and a Loom-style
"re-pulse" that refreshes prices only past a threshold.
