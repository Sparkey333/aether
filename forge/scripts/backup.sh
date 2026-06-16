#!/usr/bin/env bash
# backup.sh — snapshot every "sensitive/personalized/time-valuable" file into the
# vault, keeping at least N generations so an accidental overwrite is never fatal.
#
#   forge/scripts/backup.sh            # back up everything matching sensitive.globs
#   forge/scripts/backup.sh <path>     # back up a single file (used by the hook)
#   FORGE_BACKUP_LEVELS=8 forge/scripts/backup.sh
#
# Vault layout:   backups/<relative/path/to/file>/<timestamp>.bak
# The newest snapshot is also linked/copied to  .../latest  for quick eyeballing.

source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
shopt -s globstar nullglob dotglob 2>/dev/null || true

VAULT="$FORGE_ROOT/$(cfg '.backup.vault' 'backups')"
LEVELS="${FORGE_BACKUP_LEVELS:-$(cfg '.backup.levels' 5)}"
# Spec floor: never keep fewer than 3 generations.
[ "$LEVELS" -lt 3 ] 2>/dev/null && LEVELS=3
CHANGE_ONLY="$(cfg '.backup.snapshot_on_change_only' 'true')"
GLOBS_FILE="$FORGE_ROOT/$(cfg '.backup.sensitive_globs_file' 'config/sensitive.globs')"
LOG="$VAULT/.forge-backup.log"

mkdir -p "$VAULT"

# Back up exactly one file (relative-or-absolute), with rotation + change check.
backup_one() {
  local src="$1"
  [ -f "$src" ] || return 0
  # Normalize to a path relative to FORGE_ROOT for the vault layout.
  local abs; abs="$(cd "$(dirname "$src")" && pwd)/$(basename "$src")"
  case "$abs" in
    "$FORGE_ROOT"/*) : ;;
    *) warn "skip (outside forge): $src"; return 0 ;;
  esac
  local rel="${abs#"$FORGE_ROOT"/}"
  # Never back up the vault itself, and skip the scaffolding templates.
  case "$rel" in
    "$(cfg '.backup.vault' 'backups')"/*) return 0 ;;
    */_TEMPLATE/*|_TEMPLATE/*) return 0 ;;
  esac

  local dest_dir="$VAULT/$rel"
  mkdir -p "$dest_dir"

  # Change-only: compare against newest existing snapshot. (find, not ls+glob —
  # an unmatched nullglob would make ls list the cwd.)
  if [ "$CHANGE_ONLY" = "true" ]; then
    local newest
    newest="$(find "$dest_dir" -maxdepth 1 -type f -name '*.bak' 2>/dev/null | sort | tail -n1)"
    if [ -n "$newest" ] && [ "$(forge_sha "$src")" = "$(forge_sha "$newest")" ]; then
      return 0  # unchanged since last snapshot
    fi
  fi

  local snap="$dest_dir/$(forge_ts).bak"
  # Guard same-second collisions (two writes within one second).
  local n=1
  while [ -e "$snap" ]; do snap="$dest_dir/$(forge_ts)-$n.bak"; n=$((n+1)); done
  cp -p "$src" "$snap"
  cp -p "$src" "$dest_dir/latest"
  printf '%s\t%s\t%s\n' "$(date -Iseconds 2>/dev/null || date)" "$rel" "$(basename "$snap")" >> "$LOG"

  # Prune: keep the newest $LEVELS snapshots only.
  local count
  count="$(find "$dest_dir" -maxdepth 1 -type f -name '*.bak' 2>/dev/null | wc -l | tr -d ' ')"
  if [ "$count" -gt "$LEVELS" ]; then
    find "$dest_dir" -maxdepth 1 -type f -name '*.bak' | sort | head -n "$((count - LEVELS))" \
      | while read -r old; do rm -f "$old"; done
  fi
  printf '%s\n' "$rel"
}

main() {
  local n=0
  if [ "$#" -ge 1 ]; then
    # Targeted mode: back up the given files (e.g. from a pre-write hook).
    for f in "$@"; do backup_one "$f" >/dev/null && n=$((n+1)) || true; done
    exit 0
  fi

  [ -f "$GLOBS_FILE" ] || die "no sensitive.globs at $GLOBS_FILE"
  say "Forge backup → vault: ${VAULT#"$FORGE_ROOT"/}  (keeping $LEVELS generations)"

  # Read patterns, expand each relative to FORGE_ROOT.
  while IFS= read -r pattern || [ -n "$pattern" ]; do
    case "$pattern" in ''|\#*) continue ;; esac
    pattern="${pattern%%[[:space:]]}"
    ( cd "$FORGE_ROOT" && eval "for m in $pattern; do printf '%s\n' \"\$m\"; done" ) 2>/dev/null \
    | while IFS= read -r m; do
        [ -f "$FORGE_ROOT/$m" ] || continue
        if r="$(backup_one "$FORGE_ROOT/$m")" && [ -n "$r" ]; then
          dim "  ↳ $r"
        fi
      done
  done < "$GLOBS_FILE"

  # Count distinct backed-up files for the summary.
  n="$(find "$VAULT" -name '*.bak' 2>/dev/null | sed "s#/[^/]*\.bak##" | sort -u | wc -l | tr -d ' ')"
  ok "Backup complete — $n file(s) protected, log: ${LOG#"$FORGE_ROOT"/}"
}

main "$@"
