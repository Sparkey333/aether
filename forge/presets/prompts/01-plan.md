# Prompt — Plan

Use after recon, before building.

---

From `targets/<NAME>/RECON.md`, produce the build plan in `targets/<NAME>/PLAN.md`.

- Break the work into **smallest-runnable-first slices**. Each slice must end in
  something I can run and check. Start with the spark.
- For each slice, name the **verify command** that proves it works.
- Name the **guardrails**: files/areas off-limits, conventions to match.
- Name the **stop-and-ask triggers**: the ambiguities that should pause you rather
  than be guessed.
- State which **preset** (CLAUDE.md, settings, model, subagents) we'll use.

Keep slices small enough that each fits comfortably in one working session. Show
me the plan and wait for confirmation before building.
