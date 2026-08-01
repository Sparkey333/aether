# Security — keys, secrets, and the shipped app

Aether ships as a **downloadable app**. That single fact drives every rule here:
anything bundled into the build can be extracted from it by whoever downloads it.

## The standing rules

1. **BYOK, always.** The Loom's pattern engine is pure math and needs no key. A
   key is *optional*, supplied by the person using the app, and stored on their
   device — never compiled into a release.
2. **Never commit a secret.** `.gitignore` carries a `*.env` catch-all so a
   non-standard filename can't slip past the bare `.env` rules. Only
   `*.example` files are tracked.
3. **`NEXT_PUBLIC_*` is public.** Next.js inlines any `NEXT_PUBLIC_`-prefixed
   variable into the **client bundle**. In a Tauri app that bundle ships inside
   the `.dmg`. Never put a real secret behind that prefix — the prefix is a
   promise that the value is safe to publish.
4. **Provenance applies to secrets too.** If a key leaks, say so plainly and
   rotate it. Quiet cleanup is the comfortable lie; the log below is the truth.

## Incident log

### 2026-07-07 · `Aether.env` committed with live keys

**What happened.** `Aether.env` was committed to `main` carrying a populated
`ANTHROPIC_API_KEY` and `NEXT_PUBLIC_MAP_TILE_KEY`. The `.gitignore` rules at the
time covered `.env`, `.env*.local` and `.env.assets` — the non-standard
`Aether.env` name matched none of them.

**Impact.** The Anthropic key is readable by anyone with access to the
repository, and remains in git history until history is rewritten. Neither key
was referenced anywhere in `src/` or `scripts/`, so no build or runtime depended
on them — but the `NEXT_PUBLIC_` prefix means that key *would* have been inlined
into the client bundle had it ever been used.

**Fixed here.**
- `Aether.env` untracked (`git rm --cached`); the local file is untouched.
- `*.env` catch-all added to `.gitignore`.
- Confirmed no code path referenced either variable.

**Still required — these are the owner's to do:**
- [ ] **Rotate the Anthropic API key.** Treat it as compromised. Anything
      committed to a repo should be considered public from the moment it lands,
      regardless of repo visibility.
- [ ] **Rotate the map tile key** if it is a real, billable credential.
- [ ] **Decide on history.** Untracking stops future exposure; it does not erase
      the past. To remove it from history entirely, rewrite with
      `git filter-repo` and force-push — coordinate first, because it rewrites
      every commit hash and every existing clone must be re-cloned. If the repo
      is private and the keys are rotated, leaving history alone is a reasonable
      call; make it deliberately, not by default.

## Where a key *should* live

- **Development:** an untracked `.env` (now covered by `*.env`).
- **The shipped Mac app:** the OS keychain, entered by the person at runtime via
  the Dashboard's BYOK field. Today that field uses `localStorage`; migrating it
  to the keychain is tracked in `docs/ROADMAP.md`.
- **CI:** GitHub Actions secrets. The macOS build needs none today — it builds
  and publishes without any key.
