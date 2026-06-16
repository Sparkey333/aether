#!/usr/bin/env bash
# new-target.sh — scaffold a study target from the _TEMPLATE.
#
#   forge/scripts/new-target.sh <name> [--url <git-url>] [--tier <rung>] [--quiet]
#
# A "target" is a project you're cloning/studying. It holds the intelligence you
# accumulate about it (RECON/PLAN/LOG/EVAL) — tracked in git, backed up as sensitive.

source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

NAME="${1:-}"; shift || true
URL=""; TIER="medium"; QUIET=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    --url) URL="${2:-}"; shift 2 ;;
    --tier) TIER="${2:-medium}"; shift 2 ;;
    --quiet) QUIET=1; shift ;;
    *) shift ;;
  esac
done
[ -n "$NAME" ] || die "usage: new-target.sh <name> [--url <git-url>] [--tier <rung>]"

targets_dir="$FORGE_ROOT/$(cfg '.cloning.targets_dir' 'targets')"
tpl="$targets_dir/_TEMPLATE"
dest="$targets_dir/$NAME"

if [ -d "$dest" ]; then
  [ "$QUIET" -eq 1 ] || warn "target exists, leaving notes intact: targets/$NAME"
  exit 0
fi
[ -d "$tpl" ] || die "missing template: $tpl"

cp -r "$tpl" "$dest"
ts="$(date -Iseconds 2>/dev/null || date)"

# Fill the target.yaml header.
cat > "$dest/target.yaml" <<YAML
# Forge study target
name: $NAME
url: ${URL:-"(none — local or TBD)"}
tier: $TIER          # spark | small | medium | large | massive | niche-engineering
created: $ts
status: recon        # recon | plan | build | verify | eval | promoted | shelved
provider: claude-code
score:               # filled in EVAL.md; 0–100, your judgment of how faithful the clone is
  fidelity:
  speed:
  effort:
notes: |
  One-line aim: what are you trying to learn or reproduce from this project?
YAML

[ "$QUIET" -eq 1 ] || ok "Scaffolded targets/$NAME (tier: $TIER)"
