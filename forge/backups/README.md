# Backups — the generational vault

The accidental-overwrite safety net. Every file matching
[`../config/sensitive.globs`](../config/sensitive.globs) is snapshotted here, at
least **5 generations deep** (spec floor: 3; the script refuses to go below 3).

```
backups/<relative/path/to/file>/
  <timestamp>.bak    # newest → oldest, pruned to the generation limit
  latest             # convenience copy of the newest
.forge-backup.log    # an audit trail of every snapshot taken
```

The snapshots themselves are **git-ignored** — they're a local belt-and-suspenders
net that may hold sensitive/personal data and noisy duplicates. The canonical
files live in git; this vault protects work you haven't committed yet.

```bash
forge backup                              # snapshot everything sensitive now
forge restore profiles/preferences.md      # list this file's generations
forge restore profiles/preferences.md 3    # roll back to generation 3
```

Read the full doctrine: [`../doctrine/BACKUP_DOCTRINE.md`](../doctrine/BACKUP_DOCTRINE.md).
