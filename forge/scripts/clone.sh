#!/usr/bin/env bash
# clone.sh — clone a GitHub project into clones/ AND scaffold a study target for it.
#
#   forge/scripts/clone.sh <git-url> [tier]
#   forge/scripts/clone.sh https://github.com/owner/repo small
#
# tier is one of the cloning ladder rungs (spark|small|medium|large|massive|
# niche-engineering); it just tags the target so you can track scale. Default: medium.
#
# The clone itself lives in clones/<repo> (git-ignored — it can be huge). The
# *study* of it — recon, plan, log, eval — lives in targets/<repo> and IS tracked,
# because that accumulated intelligence is the real asset.

source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

URL="${1:-}"; TIER="${2:-medium}"
[ -n "$URL" ] || die "usage: clone.sh <git-url> [tier]"

name="$(basename "${URL%.git}")"
clones_dir="$FORGE_ROOT/$(cfg '.cloning.clones_dir' 'clones')"
dest="$clones_dir/$name"

mkdir -p "$clones_dir"
if [ -d "$dest/.git" ]; then
  warn "clone exists, fetching latest: $dest"
  git -C "$dest" fetch --all --prune || warn "fetch failed (offline?)"
else
  say "Cloning $URL → ${dest#"$FORGE_ROOT"/}"
  git clone "$URL" "$dest" || die "git clone failed"
fi

# Scaffold the study target (idempotent — won't clobber your notes).
"$FORGE_ROOT/scripts/new-target.sh" "$name" --url "$URL" --tier "$TIER" --quiet || true

ok "Ready. Study target: targets/$name   |   working clone: clones/$name"
dim "Next: open targets/$name/RECON.md and run the masterclass loop (doctrine/METHOD.md)."
