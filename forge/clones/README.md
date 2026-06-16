# Clones — the disposable working copies

The actual cloned repositories land here, one per target. They are **git-ignored**
(see `forge/.gitignore`) because they can be huge and carry their own `.git`
history. Treat them as scratch space: the durable asset is the intelligence in
`../targets/`, not the copy here.

```bash
forge clone https://github.com/owner/repo medium
# → clones/repo/        (the working copy, ignored)
# → targets/repo/       (your study notes, tracked)
```

Safe to delete any clone here and re-fetch it later — nothing irreplaceable lives
in this folder.
