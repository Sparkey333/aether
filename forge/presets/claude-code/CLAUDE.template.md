<!--
  CLAUDE.template.md — copy this into a clone's working dir as CLAUDE.md and fill it
  from your RECON.md. Its job: give the agent the target's *shape* so it never has
  to re-derive it. Keep it sharp; link out instead of pasting long files.
-->

# <TARGET NAME> — clone context

## What this is
<one sentence: what the target does and what I'm reproducing>

## Goal of this clone
- Rung on the ladder: <spark|small|medium|large|massive|niche-engineering>
- "Done" looks like: <the checkable definition of done for this rung>
- Out of scope: <what I am explicitly NOT trying to reproduce>

## Shape of the codebase
- Languages / frameworks: <…>
- Build: `<command>`   ·   Run: `<command>`   ·   Test: `<command>`
- The 20% of files that carry 80% of behavior:
  - `path/…` — <why it matters>
- External services / secrets needed: <…>

## How to work here
- Build smallest-runnable-first; verify after every slice with `<command>`.
- Match the target's existing conventions before introducing new ones.
- Off-limits / don't touch: <…>
- Stop and ask if: <the ambiguities that should pause you>

## House rules (from my profile)
- Protect sensitive files (the pre-write backup hook is wired — see settings).
- Report failures with output; don't call something done until it ran.
- Lead with the answer; reference files as `path:line`.

## Open questions / unknowns
- <things recon couldn't resolve — flag, don't guess>
