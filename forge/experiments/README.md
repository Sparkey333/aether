# Experiments — how the technique compounds

An experiment is **one disciplined change** to the technique itself — a single
tweak to a preset, prompt, setting, or profile — with a hypothesis written *before*
the run and a result measured *after*. This is what turns scattered corrections
into a method that gets near-perfect.

```
experiments/<YYYYMMDD-slug>/
  run.yaml         # what changed, against what baseline, the verdict
  HYPOTHESIS.md    # one change, one prediction — write BEFORE running
  RESULT.md        # what happened, and keep / revert / inconclusive
```

Scaffold one with:

```bash
forge experiment tighter-recon-prompt
```

The rule: **one change at a time.** If you change three things and the score
moves, you've learned nothing about which one did it. Keep/revert decisions feed
back into `presets/` and `profiles/` (the "Promote" station of the loop).
