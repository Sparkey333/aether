# The Cloning Ladder

> Climb deliberately. Each rung must be *cleared* — reproduced and scored — before
> you reach for the next. Skipping rungs is how you end up with a half-built
> "massive" clone and no idea which part of your technique failed.

The rung is recorded in each target's `target.yaml` (`tier:`) and tags the scale
you're training against. The point of the ladder is not the size for its own
sake — it's that **each rung exposes a different failure mode**, and you can only
fix one class of failure at a time.

| Rung | Scale (rough) | What it teaches | What usually breaks |
|---|---|---|---|
| **spark** | one file / one function | the loop itself, end to end | nothing — this is the warm-up |
| **small** | a CLI / a single-page app / a library | clean recon → plan → build | under-specified recon |
| **medium** | a multi-module app, a real backend + UI | slicing, guardrails, verify discipline | agent drift across modules; lost context |
| **large** | a full product: services, DB, auth, tests, CI | context management, subagents, parallelism | context exhaustion; cross-cutting changes |
| **massive** | a platform / monorepo / a whole website at depth | orchestration, decomposition, long horizons | coordination; keeping a coherent mental model |
| **niche-engineering** | CAD / CAE / modeling / simulation software | domain fidelity, numeric correctness, native deps | correctness you can't eyeball; toolchains |

## How to know a rung is cleared

A rung is cleared when, on a *fresh* target at that scale, you can:

1. Run the full loop with **fewer corrections than the previous attempt**, and
2. Hit an **Eval scorecard** at or above your bar (suggest: fidelity ≥ 80,
   autonomy ≥ 70), and
3. Point to at least one **promoted lesson** that made it go better than last time.

Two clean clears at a rung → reach for the next. A regression → drop back a rung
and find the experiment that recovers it.

## Notes per rung

- **spark / small** — Resist over-tooling. The job here is to make the *loop*
  reflexive. If the loop is clumsy on something small, it will shatter on
  something large.
- **medium** — The first place context management matters. This is where presets
  start earning their keep: a good `CLAUDE.md` that explains the target's shape
  saves the agent from re-deriving it every session.
- **large** — Decompose into subagents/slices that each fit a context window.
  Verify is non-negotiable here; a silent break in one service poisons the eval.
- **massive** — You become an orchestrator. The skill is decomposition and
  hand-off, not coding. Lean on parallel agents for independent slices.
- **niche-engineering (CAD/CAE/modeling)** — The hardest rung, because
  *correctness is not visible*. A model can look right and be numerically wrong.
  Bring measured ground: reference outputs, known-good fixtures, golden files,
  unit tests on the math. This is the provenance doctrine at full strength — never
  let a plausible-looking result borrow the authority of a verified one.

## The honest caveat (provenance, applied to ambition)

Cloning grows harder *faster* than size suggests — licensing, proprietary
formats, native/binary dependencies, and domain correctness (especially in
engineering software) are real walls, not just "more code." Treat "massive" and
"niche-engineering" as **research rungs**: the win is a faithful, well-scoped
*reproduction of a slice* plus an honest eval of what didn't transfer — not a
claim of total replication. Label what you reproduced and what you didn't. That
honesty is what makes the rare full success trustworthy.
