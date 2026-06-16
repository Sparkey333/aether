# Prompt — Recon

Use at the start of a clone, before any building.

---

You are studying a target codebase I want to reproduce. **Do not write or change
any project code yet.** Read enough to produce an honest map.

Fill `targets/<NAME>/RECON.md` with:
1. **What it is** — purpose in one sentence; who uses it.
2. **Shape** — languages/frameworks, rough size, build/run/test commands, external
   services & secrets it needs.
3. **The skeleton** — entry points, core modules, data model, and specifically the
   ~20% of files that carry ~80% of the behavior.
4. **Hard parts** — hidden state, codegen, native/binary deps, licensing, anything
   where a clone usually fails.
5. **The spark** — the smallest runnable slice to reproduce first, and what "done"
   means for this rung of the ladder.

Flag what you couldn't determine instead of guessing. End by telling me the spark
slice and the single biggest risk to faithful reproduction.
