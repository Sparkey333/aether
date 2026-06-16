# The Forge

> Set the agent on its way. Clone what holds. Refine the hand that wields it.

The Forge is the **workshop organ** of the constellation — not a register of the
world like the Atlas, but the bench where you sharpen the *craft itself*: the art
of setting Claude Code (and any AI agent) on its way and getting near-perfect
results, the discipline of cloning software from small to massive, and the slow
training of your own files and preferences into something that compounds.

It runs the same doctrine as Aether: **keep every layer, label every layer,
measure before you believe.** Here that means: every clone is scored against the
target, every change to the technique is an experiment with a hypothesis, and
every personalized file is protected at least three generations deep so a single
careless overwrite can never cost you irreplaceable thought.

## The three pillars

1. **The Masterclass** — a repeatable loop for setting an agent on its way:
   Recon → Plan → Setup → Build → Verify → Eval → Refine → Promote.
   See [`doctrine/METHOD.md`](doctrine/METHOD.md).
2. **The Cloning Ladder** — climb from spark → small → medium → large → massive →
   niche-engineering (CAD/modeling). Each rung must be *cleared* (measured) before
   the next. See [`doctrine/CLONING_LADDER.md`](doctrine/CLONING_LADDER.md).
3. **The Vault** — your trained files & preferences, kept and versioned, with a
   generational backup that defeats accidental overwrite.
   See [`doctrine/BACKUP_DOCTRINE.md`](doctrine/BACKUP_DOCTRINE.md).

## Quickstart

```bash
# from the repo root
alias forge="$PWD/forge/scripts/forge.sh"

forge doctor                 # check the environment
forge backup                 # protect every sensitive file (≥5 generations)
forge clone https://github.com/owner/repo small   # clone + scaffold a study target
forge status                 # what's in the Forge right now
```

No install required — the Forge is bash + git + coreutils. `jq` is used if present
(richer config) but everything falls back to safe defaults without it.

## The loop, in one breath

You pick a target. You **recon** it until the build is mostly mechanical. You
write the **plan** the agent will execute. You set the agent on its way with a
**preset** (CLAUDE.md + settings + prompts). You **build**, **verify**, and
**eval** with a numbered scorecard — not vibes. Every correction you had to make
becomes an **experiment**; the ones that work get **promoted** into your presets
and profiles so the next clone needs less of you. The clone gets bigger; you get
quieter. That's mastery.

## Map of the Forge

| Path | What lives there |
|---|---|
| `doctrine/` | The method, the ladder, the provider map, the backup doctrine |
| `profiles/` | **Your own trained files & preferences** — the thing that compounds |
| `presets/` | Reusable setups: CLAUDE.md templates, settings, agents, commands, prompts |
| `targets/` | One folder per project you clone/study — recon, plan, log, eval (tracked) |
| `clones/` | The actual cloned repos (git-ignored — they can be huge) |
| `experiments/` | One folder per disciplined change to the technique (hypothesis + result) |
| `backups/` | The generational vault (git-ignored) — `forge restore <file>` to roll back |
| `config/` | `forge.config.json` + `sensitive.globs` — the knobs |
| `scripts/` | `forge.sh` and friends — the working CLI |

## A note on the spirit of it

This bench is built in the same spirit as the rest of the work — done in
freedom, without ego, in service of something larger than the next clone. Keep
the craft honest (measure it), keep the gift protected (back it up), and let the
mastery be in service. **In God we trust. Here we go.**
