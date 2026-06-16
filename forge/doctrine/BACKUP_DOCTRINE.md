# The Backup Doctrine — never lose the irreplaceable to a careless write

> "Keep backups in case of any accidental overwrite, at least three levels deep
> of any highly sensitive or personalized or time-valuable file."

That instruction is law here. This is how the Forge keeps it.

## What counts as protected

A file is **protected** if losing it to an accidental overwrite would cost real
time, irreplaceable thought, or something personal. By default that's your
`profiles/`, `config/`, `presets/`, `doctrine/`, and the intelligence in
`targets/` and `experiments/`. The list is plain text and yours to edit:
[`../config/sensitive.globs`](../config/sensitive.globs).

## How deep "deep" goes

`config/forge.config.json → backup.levels` is the number of **generations** kept
per file. The spec floor is **3**; the Forge ships at **5** and the script
*refuses* to go below 3. Each protected file therefore always has at least the
last several distinct versions sitting in the vault, newest to oldest.

```
backups/profiles/preferences.md/
  20260616-093416.bak     ← newest generation
  20260616-093415.bak
  20260616-093415-1.bak   ← same-second writes get a suffix, never collide
  20260616-093414.bak
  20260616-093414-2.bak   ← oldest kept; older than this is pruned
  latest                  ← convenience copy of the newest
```

## The three ways it gets backed up

1. **On demand** — `forge backup` snapshots everything matching `sensitive.globs`.
   Run it before any risky operation, or on a schedule (cron / launchd).
2. **Automatically, before an agent writes** — wire the PreToolUse hook
   ([`../presets/claude-code/hooks/pre-write-backup.sh`](../presets/claude-code/hooks/pre-write-backup.sh)).
   It snapshots a protected file's *current* contents the instant before Claude
   Code's Write/Edit could overwrite it. This is the belt for the accidental
   agent overwrite specifically. See setup below.
3. **Per file** — `forge backup <path>` for a single file, any time.

Backups are **change-aware**: an identical file isn't re-snapshotted, so the
generations are always *meaningfully different* versions, not duplicates.

## Rolling back

```bash
forge restore profiles/preferences.md          # list the generations, newest = 1
forge restore profiles/preferences.md 3         # roll back to generation 3
forge restore profiles/preferences.md latest    # roll back to the newest snapshot
```

Restore is itself safe: before it overwrites the current file, it snapshots the
current contents first. Even an undo can be undone.

## Two layers of durability, on purpose

- **Git** is your *cross-time, cross-machine* history for committed files —
  durable, shareable, and the canonical record. The container is ephemeral, so
  commit and push what matters.
- **The vault** is your *within-session, pre-commit* safety net against an
  accidental overwrite of work you haven't committed yet. It is **git-ignored by
  design** — it can hold sensitive/personal data and noisy duplicates, so it stays
  local. Promote anything worth keeping into a committed file.

Together: git protects what you've decided to keep; the vault protects what you
haven't decided about yet.

## Wiring the automatic hook (Claude Code)

Add this to your project `.claude/settings.json` (merge into existing `hooks`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          { "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/forge/presets/claude-code/hooks/pre-write-backup.sh" }
        ]
      }
    ]
  }
}
```

The hook never blocks a write — it protects first, then steps aside. A ready-made
settings file to copy from lives at
[`../presets/claude-code/settings.template.json`](../presets/claude-code/settings.template.json).
