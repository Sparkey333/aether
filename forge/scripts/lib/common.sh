#!/usr/bin/env bash
# common.sh — shared helpers for the Forge scripts. Source me, don't run me.
# Dependency-light on purpose: bash + coreutils. jq is used only if present.

set -euo pipefail

# --- locate the forge root (the dir that holds config/forge.config.json) ---
forge_root() {
  # Walk up from this script's dir until we find config/forge.config.json.
  local d
  d="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  while [ "$d" != "/" ]; do
    if [ -f "$d/config/forge.config.json" ]; then
      printf '%s\n' "$d"
      return 0
    fi
    d="$(dirname "$d")"
  done
  echo "forge: could not locate forge root (config/forge.config.json)" >&2
  return 1
}

FORGE_ROOT="${FORGE_ROOT:-$(forge_root)}"

# --- pretty output ---
if [ -t 1 ]; then
  C_DIM=$'\033[2m'; C_BOLD=$'\033[1m'; C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'; C_CYAN=$'\033[36m'; C_RED=$'\033[31m'; C_RESET=$'\033[0m'
else
  C_DIM=""; C_BOLD=""; C_GREEN=""; C_YELLOW=""; C_CYAN=""; C_RED=""; C_RESET=""
fi
say()  { printf '%s%s%s\n' "$C_CYAN" "$*" "$C_RESET"; }
ok()   { printf '%s✓ %s%s\n' "$C_GREEN" "$*" "$C_RESET"; }
warn() { printf '%s! %s%s\n' "$C_YELLOW" "$*" "$C_RESET" >&2; }
die()  { printf '%s✗ %s%s\n' "$C_RED" "$*" "$C_RESET" >&2; exit 1; }
dim()  { printf '%s%s%s\n' "$C_DIM" "$*" "$C_RESET"; }

# --- tiny config reader: jq if available, else a default ---
# usage: cfg <jq-path> <default>   e.g. cfg '.backup.levels' 5
cfg() {
  local path="$1" def="${2:-}"
  local file="$FORGE_ROOT/config/forge.config.json"
  if command -v jq >/dev/null 2>&1 && [ -f "$file" ]; then
    local v; v="$(jq -r "$path // empty" "$file" 2>/dev/null || true)"
    [ -n "$v" ] && { printf '%s\n' "$v"; return 0; }
  fi
  printf '%s\n' "$def"
}

# Cross-platform ISO-ish timestamp safe for filenames.
forge_ts() { date +%Y%m%d-%H%M%S; }

# sha of a file, portable (sha256sum or shasum)
forge_sha() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1
  elif command -v shasum >/dev/null 2>&1; then shasum -a 256 "$1" | cut -d' ' -f1
  else cksum "$1" | cut -d' ' -f1; fi
}
