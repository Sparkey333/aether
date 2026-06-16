---
description: Start a Forge clone — clone a repo, scaffold a study target, and begin recon
argument-hint: <git-url> [tier]
---

Begin a Forge clone of: $ARGUMENTS

Do this in order:

1. Run `forge/scripts/clone.sh $ARGUMENTS` to clone the repo into `clones/` and
   scaffold a study target under `targets/`. (Tier defaults to `medium` if not given.)
2. Read the cloned project enough to fill `targets/<name>/RECON.md` honestly —
   purpose, shape, build/run/test commands, the 20% of files carrying 80% of the
   behavior, the hard parts, and the smallest runnable slice (the "spark").
3. Propose the build plan in `targets/<name>/PLAN.md`: smallest-runnable-first
   slices, guardrails, the verify command, and stop-and-ask triggers.
4. Stop and show me the recon + plan before building. Do not start the build until
   I confirm.

Follow the masterclass loop in `forge/doctrine/METHOD.md` and the ladder in
`forge/doctrine/CLONING_LADDER.md`. Measure, don't vibe.
