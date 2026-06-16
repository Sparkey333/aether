#!/usr/bin/env bash
# restore.sh — list and roll back the generations the Forge kept for a file.
#
#   forge/scripts/restore.sh <file>           # list available generations
#   forge/scripts/restore.sh <file> <n>       # restore generation n (1 = newest)
#   forge/scripts/restore.sh <file> latest     # restore the newest snapshot
#
# Before overwriting the current file, restore.sh snapshots it first, so even a
# restore can be undone. Nothing is ever lost without a generation behind it.

source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

VAULT="$FORGE_ROOT/$(cfg '.backup.vault' 'backups')"

[ "$#" -ge 1 ] || die "usage: restore.sh <file> [n|latest]"

target="$1"
# Resolve to a forge-relative path.
abs="$(cd "$(dirname "$target")" 2>/dev/null && pwd)/$(basename "$target")" || die "no such path: $target"
case "$abs" in "$FORGE_ROOT"/*) rel="${abs#"$FORGE_ROOT"/}" ;; *) die "outside forge: $target" ;; esac
dest_dir="$VAULT/$rel"
[ -d "$dest_dir" ] || die "no backups for $rel"

# Newest first.
mapfile -t snaps < <(find "$dest_dir" -maxdepth 1 -type f -name '*.bak' 2>/dev/null | sort -r)
[ "${#snaps[@]}" -gt 0 ] || die "no snapshots in $dest_dir"

if [ "$#" -eq 1 ]; then
  say "Generations for $rel (1 = newest):"
  i=1
  for s in "${snaps[@]}"; do
    sz="$(wc -c < "$s" | tr -d ' ')"
    printf '  %s%2d%s  %s  %sB\n' "$C_BOLD" "$i" "$C_RESET" "$(basename "$s" .bak)" "$sz"
    i=$((i+1))
  done
  dim "restore with: $0 \"$target\" <n>"
  exit 0
fi

sel="$2"
if [ "$sel" = "latest" ]; then chosen="${snaps[0]}";
else
  [[ "$sel" =~ ^[0-9]+$ ]] || die "n must be a number or 'latest'"
  idx=$((sel-1))
  [ "$idx" -ge 0 ] && [ "$idx" -lt "${#snaps[@]}" ] || die "no generation $sel (have ${#snaps[@]})"
  chosen="${snaps[$idx]}"
fi

# Safety: snapshot the current file before clobbering it.
if [ -f "$abs" ]; then
  "$FORGE_ROOT/scripts/backup.sh" "$abs" >/dev/null 2>&1 || true
fi
mkdir -p "$(dirname "$abs")"
cp -p "$chosen" "$abs"
ok "restored $rel  ←  $(basename "$chosen")"
