# Provider Profile — Claude Code (primary)

> What works when setting Claude Code on its way. This is the home turf; keep the
> sharpest version of the setup here and let other providers translate from it.

## Models
- Default to the latest, most capable Claude model for the driving agent.
- Drop to a faster model only for narrow, well-specified slices on a setup I've
  already proven.
- Always record the model used in `target.yaml` / `run.yaml` so it can't silently
  confound an eval.

## Context (CLAUDE.md)
- Keep a per-target `CLAUDE.md` that captures the target's *shape* (from recon) so
  the agent doesn't re-derive it each session. Start from
  [`../../presets/claude-code/CLAUDE.template.md`](../../presets/claude-code/CLAUDE.template.md).
- Smaller and sharper beats long and vague. Link out to docs rather than pasting.

## Permissions posture
- Tighten as scale grows. On `large`/`massive`, allowlist the safe read-only and
  build commands so the loop isn't death-by-prompt, but keep destructive ops gated.
- Use the `/fewer-permission-prompts` skill to mine transcripts for a good allowlist.

## Subagents
- Use them to fit big work into context: one subagent per independent slice.
- A dedicated cloning/recon subagent keeps the driver's context clean — see
  [`../../presets/claude-code/agents/cloner.md`](../../presets/claude-code/agents/cloner.md).

## Hooks
- Always wire the pre-write backup hook (see
  [`../../doctrine/BACKUP_DOCTRINE.md`](../../doctrine/BACKUP_DOCTRINE.md)).
- Consider a SessionStart hook to ensure tests/linters run in fresh containers.

## Findings (train this)
- (log what reliably helps / hurts as you run loops)
