#!/usr/bin/env bash
# forge.sh — the one entrypoint for the Forge.
#
#   forge/scripts/forge.sh <command> [args]
#
# Tip: alias it.   alias forge="$PWD/forge/scripts/forge.sh"

source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

cmd="${1:-help}"; shift || true

case "$cmd" in
  backup)     exec "$FORGE_ROOT/scripts/backup.sh" "$@" ;;
  restore)    exec "$FORGE_ROOT/scripts/restore.sh" "$@" ;;
  clone)      exec "$FORGE_ROOT/scripts/clone.sh" "$@" ;;
  target)     exec "$FORGE_ROOT/scripts/new-target.sh" "$@" ;;
  experiment) exec "$FORGE_ROOT/scripts/new-experiment.sh" "$@" ;;

  status)
    say "The Forge — status"
    printf '%s\n' "root: $FORGE_ROOT"
    local_t="$(find "$FORGE_ROOT/targets" -maxdepth 1 -mindepth 1 -type d ! -name '_TEMPLATE' 2>/dev/null | wc -l | tr -d ' ')"
    local_c="$(find "$FORGE_ROOT/clones" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')"
    local_e="$(find "$FORGE_ROOT/experiments" -maxdepth 1 -mindepth 1 -type d ! -name '_TEMPLATE' 2>/dev/null | wc -l | tr -d ' ')"
    local_b="$(find "$FORGE_ROOT/backups" -name '*.bak' 2>/dev/null | wc -l | tr -d ' ')"
    printf '  targets:      %s\n' "$local_t"
    printf '  clones:       %s\n' "$local_c"
    printf '  experiments:  %s\n' "$local_e"
    printf '  backup snaps: %s (≥%s generations/file)\n' "$local_b" "$(cfg '.backup.levels' 5)"
    ;;

  doctor)
    say "The Forge — doctor"
    for tool in git bash; do
      command -v "$tool" >/dev/null 2>&1 && ok "$tool present" || warn "$tool MISSING"
    done
    command -v jq >/dev/null 2>&1 && ok "jq present (rich config)" || dim "jq absent — using defaults (fine)"
    [ -f "$FORGE_ROOT/config/forge.config.json" ] && ok "config found" || warn "config missing"
    [ -f "$FORGE_ROOT/config/sensitive.globs" ] && ok "sensitive.globs found" || warn "sensitive.globs missing"
    bash -n "$FORGE_ROOT/scripts/backup.sh" && ok "backup.sh parses" || warn "backup.sh has a syntax error"
    ;;

  help|--help|-h|"")
    cat <<TXT
${C_BOLD}The Forge${C_RESET} — cloning lab + masterclass + preference vault

  forge backup [file...]      snapshot sensitive files (≥ N generations deep)
  forge restore <file> [n]    list / roll back a file's generations
  forge clone <git-url> [tier]  clone a repo into clones/ + scaffold a study target
  forge target <name> [..]    scaffold a study target by hand
  forge experiment <slug>     scaffold one run of the improvement cycle
  forge status                what's in the Forge right now
  forge doctor                check the environment

Read the doctrine:   forge/doctrine/METHOD.md  ·  CLONING_LADDER.md  ·  PROVIDERS.md
TXT
    ;;

  *) die "unknown command: $cmd  (try: forge help)" ;;
esac
