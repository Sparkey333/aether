# The Method — the Masterclass Loop

> One loop, run again and again, each pass tighter than the last. The goal is not
> to clone one thing — it is to make *the act of cloning* near-perfect and
> near-automatic, so you can point an agent at ever-bigger things and step back.

The loop has eight stations. Most failures come from skipping one — usually
Recon (you set the agent loose on a fog) or Eval (you call it done on a vibe).

```
   ┌──────────────────────────── the carry-forward ───────────────────────────┐
   │                                                                           │
RECON → PLAN → SETUP → BUILD → VERIFY → EVAL → REFINE → PROMOTE                 │
   │                                                              │            │
   └────────────── every correction becomes an experiment ───────┘────────────┘
```

## 1. Recon — *map before you march*
Understand the target until the build is mostly mechanical. Fill
`targets/<name>/RECON.md`. The deliverable is a map: what it is, its shape, the
20% of files carrying 80% of the behavior, the hard parts, and the **smallest
runnable slice** (the "spark") to reproduce first.

> Vow: never set an agent loose on a target you can't sketch in five bullets.

## 2. Plan — *turn the map into an ordered build*
Fill `targets/<name>/PLAN.md`. Break the work into smallest-runnable-first slices,
each ending in something you can run and check. Name the guardrails: what's
off-limits, how you verify each slice, what should make the agent stop and ask.

## 3. Setup — *choose the hand*
Pick the **preset** you'll set the agent on its way with: which `CLAUDE.md`, which
`settings`, which agents/subagents, which permission posture, which provider/model.
Presets live in [`../presets/`](../presets/). This is the lever the whole
masterclass turns on — most of your gains come from a better setup, not a better
prompt in the moment.

## 4. Build — *set it on its way*
Run the slices. Use the prompts in [`../presets/prompts/`](../presets/prompts/)
as the spine. Keep your hands off until a checkpoint fails.

## 5. Verify — *prove the slice runs*
After each slice, run the check you named in the plan. Green or not — record it.
Don't let "looks right" stand in for "ran".

## 6. Eval — *score it, don't feel it*
Fill `targets/<name>/EVAL.md` with the scorecard (0–100): fidelity, coverage,
speed, autonomy, reusability. This is provenance applied to your own work:
**measure before you believe.** A clone isn't done because it's tiring — it's
done when the numbers say so.

## 7. Refine — *every correction is a lesson*
Every time you had to step in and correct the agent, that's a signal the setup
was missing something. Open a new experiment: `forge experiment <slug>`. State a
hypothesis (one change, one prediction), run it, record the result.

> Vow: never carry a fix only in your head. If it mattered, it becomes an
> experiment, and if it works, it becomes a preset.

## 8. Promote — *make the gain permanent*
When an experiment says **keep**, fold the change into a preset or a profile so
the next clone starts further along. This is the flywheel: the agent needs less of
you each loop, which lets you climb the [Cloning Ladder](CLONING_LADDER.md).

---

## The cold-start checklist (tape this to the wall)

- [ ] Recon written — target sketchable in five bullets
- [ ] Spark slice identified — the smallest thing that runs
- [ ] Preset chosen and named in the plan
- [ ] Guardrails + stop-and-ask triggers written down
- [ ] Verify command exists and is run after each slice
- [ ] Scorecard filled with numbers, not adjectives
- [ ] Every correction captured as an experiment
- [ ] At least one lesson promoted to a preset/profile this loop

## What "near-perfect" actually means here

Not zero corrections. It means the corrections **shrink every loop** and the
clone **scale grows every loop**, because the setup keeps absorbing what you
learn. You're not trying to be a better operator in the moment — you're trying to
build a setup so good that a quieter operator gets the same result.
