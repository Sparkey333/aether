# Providers — one technique, many hands

> The masterclass is provider-agnostic. The *loop* (Recon → … → Promote) and the
> *discipline* (measure, back up, promote) never change. What changes per provider
> is only the mechanics of "how do I set THIS agent on its way."

The Forge's home is **Claude Code**, on the latest, most capable Claude models.
But the whole point of the technique is that it transfers: when you've made the
loop reflexive, pointing a different agent at the same target should give similar
results with only a translation of the setup.

## The translation table

Every provider needs the same five things; only the file names and switches differ.

| The need | Claude Code | Cursor | Aider | Other CLI agents |
|---|---|---|---|---|
| **Project context** | `CLAUDE.md` | `.cursor/rules/*.mdc` | `CONVENTIONS.md` (read via `--read`) | per-tool config / system prompt |
| **Settings / permissions** | `.claude/settings.json` | Cursor settings | flags / `.aider.conf.yml` | per-tool config |
| **Specialized roles** | subagents (`agents/`) | — (manual) | — (manual) | per-tool, if supported |
| **Reusable actions** | slash commands (`commands/`) | — | — | per-tool |
| **Automated guardrails** | hooks (PreToolUse, etc.) | — (mostly manual) | git + manual review | per-tool / external scripts |

Keep one canonical setup in [`../presets/`](../presets/) (Claude Code form) and,
when you port it, drop the translated version beside it. Then run the **same
target** through both and compare scorecards. That comparison — same target, two
hands — is the cleanest experiment you can run, and it tells you what's the
technique vs. what's the tool.

## Per-provider profiles

Your provider-specific preferences and findings live in
[`../profiles/providers/`](../profiles/providers/):

- [`claude-code.md`](../profiles/providers/claude-code.md) — the primary; what
  works, model choices, permission posture, hook strategy.
- [`alt-providers.md`](../profiles/providers/alt-providers.md) — notes as you test
  Cursor / Aider / others against the same targets.

## The vow for cross-provider work

When you claim "the technique transfers," prove it with a **side-by-side eval on
the same target**, not an impression. A provider isn't "worse" because one run
went badly — translate the full setup faithfully first, then measure. Otherwise
you're comparing your good Claude Code preset to a half-built one elsewhere.

## A word on Claude models

Default to the latest and most capable Claude models for the agent itself; drop
to faster/cheaper models for narrow, well-specified slices where you've already
proven the setup. Record the model in each `target.yaml` and each experiment's
`run.yaml` so model changes don't silently confound your evals.
