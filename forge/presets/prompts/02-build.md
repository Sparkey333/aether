# Prompt — Build

Use to execute one slice from the plan.

---

Build slice **<N>** from `targets/<NAME>/PLAN.md`. Only this slice.

- Match the target's existing conventions before introducing new ones.
- Stay inside the guardrails; respect the off-limits list.
- When you hit a stop-and-ask trigger, stop and ask — don't guess.
- When the slice is code-complete, run the slice's verify command and show me the
  real output.

Append a short entry to `targets/<NAME>/LOG.md`: what you built, where it went
smoothly, where it drifted, and any correction needed. Then stop — do not start
the next slice until I say go.
