# Prompt — Verify

Use after a slice (or the whole clone) to prove it actually works.

---

Verify the current state of the clone against the target. Do not patch anything
yet — first establish ground truth.

1. Run the verify command(s) from the plan and show the real output.
2. Compare behavior against the target for this slice: what matches, what diverges.
3. For each divergence, say whether it's a true defect, an acceptable difference,
   or out of scope for this rung.
4. If something is broken, propose the smallest fix — but show me the diagnosis
   before applying it.

"Looks right" is not acceptable. If it ran, show that it ran. If it didn't, show
the failure. Record the outcome in `targets/<NAME>/LOG.md`.
