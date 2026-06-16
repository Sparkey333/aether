# Profiles — your trained self

These are **your** files. They are the thing that compounds. Everything else in
the Forge exists to make these better over time.

- [`preferences.md`](preferences.md) — how you like an agent to work *with you*.
- [`style.md`](style.md) — how you like the *output* (code, prose, commits).
- [`providers/`](providers/) — per-provider settings and findings.

## How profiles get better

You don't write these once. You **train** them: every loop, when a correction or
a preference becomes clear, you fold it in (often via an experiment that says
"keep"). Over time they become a precise portrait of how you work — so precise
that any agent reading them behaves the way you'd want with little prompting.

## They are protected

All of `profiles/**` is in [`../config/sensitive.globs`](../config/sensitive.globs),
so every save is backed up ≥5 generations deep. Edit fearlessly — an accidental
overwrite is always one `forge restore` away.

## Keep them honest

State preferences as rules an agent can follow, not moods. "Prefer X over Y
because Z" beats "I like clean code." The more testable the preference, the more
reliably an agent — or a future you — can honor it.
