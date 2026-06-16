# Provider Profile — Alternates

> Notes as you port the technique to other agents and test them against the SAME
> targets. The discipline: translate the full Claude Code setup faithfully, then
> measure side-by-side. See [`../../doctrine/PROVIDERS.md`](../../doctrine/PROVIDERS.md).

For each provider, capture: how you give it project context, how you set
permissions, whether it supports roles/commands/hooks, and the scorecard delta vs.
Claude Code on the same target.

## Cursor
- Context via: `.cursor/rules/*.mdc`
- Setup notes:
- Best result so far (target + scorecard):

## Aider
- Context via: `CONVENTIONS.md` + `--read`; model via `--model`
- Setup notes:
- Best result so far:

## Other CLI agents (Codex CLI, Gemini CLI, Continue, …)
- Setup notes:
- Best result so far:

## Side-by-side ledger (same target, two hands)
| Target | Claude Code score | Alt provider | Alt score | What differed (technique vs. tool) |
|---|---|---|---|---|
| | | | | |
