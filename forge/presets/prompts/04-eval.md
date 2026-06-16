# Prompt — Eval & Refine

Use when the clone (or rung) is reached, to score it and harvest the lessons.

---

Score this clone honestly in `targets/<NAME>/EVAL.md`:

1. Fill the scorecard (0–100): fidelity, coverage, speed, autonomy, reusability.
   Justify each with evidence, not adjectives.
2. Diff against the target: matches, misses/divergences, and anything the clone
   did *better*.
3. Verdict: was the ladder rung cleared? (fidelity ≥ 80 and autonomy ≥ 70 is the
   suggested bar.)

Then **refine the technique**:
- List every point where I had to correct you. For each, propose a concrete change
  to a preset, prompt, or profile that would have prevented it.
- For the most valuable one, scaffold an experiment (`forge experiment <slug>`),
  write its HYPOTHESIS.md (one change, one prediction), and tell me what to test.

The point isn't this clone — it's that the next clone needs less of me. Be honest
about what didn't transfer; a faithful "here's what I couldn't reproduce" is worth
more than an inflated score.
