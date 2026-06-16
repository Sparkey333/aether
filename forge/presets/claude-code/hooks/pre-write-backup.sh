#!/usr/bin/env bash
# pre-write-backup.sh — a Claude Code PreToolUse hook.
#
# Fires BEFORE Write/Edit/MultiEdit touch a file. If the file is one of your
# sensitive/personalized/time-valuable files, it snapshots the *current* contents
# into the Forge vault first — so an accidental overwrite by the agent is always
# recoverable (forge restore <file>).
#
# Wire it up in your project .claude/settings.json (see presets/claude-code/
# settings.template.json). It never blocks the write — it just protects first.
#
# Claude Code passes the tool call as JSON on stdin, e.g.:
#   { "tool_name": "Edit", "tool_input": { "file_path": "/abs/path", ... } }

set -euo pipefail

# Find the forge root by walking up from this hook's location.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$here"
while [ "$root" != "/" ] && [ ! -f "$root/config/forge.config.json" ]; do
  root="$(dirname "$root")"
done

payload="$(cat)"
file_path=""
if command -v jq >/dev/null 2>&1; then
  file_path="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null || true)"
fi
if [ -z "$file_path" ]; then
  # jq-less fallback: pull the first "file_path":"..." value.
  file_path="$(printf '%s' "$payload" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)"
fi

# Nothing to protect (e.g. a new file, or non-file tool) — let it proceed.
[ -n "$file_path" ] && [ -f "$file_path" ] || exit 0

if [ -f "$root/config/forge.config.json" ]; then
  "$root/scripts/backup.sh" "$file_path" >/dev/null 2>&1 || true
fi
exit 0
