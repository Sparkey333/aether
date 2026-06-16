#!/usr/bin/env bash
# new-experiment.sh — scaffold one run of the improvement cycle from _TEMPLATE.
#
#   forge/scripts/new-experiment.sh <slug>
#
# An experiment is one disciplined attempt to improve the *technique* itself:
# a single change to a preset / prompt / setting, with a hypothesis and a measured
# result. This is how the masterclass compounds.

source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

SLUG="${1:-}"
[ -n "$SLUG" ] || die "usage: new-experiment.sh <slug>   (e.g. tighter-recon-prompt)"

exp_dir="$FORGE_ROOT/$(cfg '.experiments.dir' 'experiments')"
tpl="$exp_dir/_TEMPLATE"
stamp="$(date +%Y%m%d)-$SLUG"
dest="$exp_dir/$stamp"

[ -d "$tpl" ] || die "missing template: $tpl"
[ -d "$dest" ] && die "experiment exists: experiments/$stamp"

cp -r "$tpl" "$dest"
ts="$(date -Iseconds 2>/dev/null || date)"
cat > "$dest/run.yaml" <<YAML
# Forge experiment — one change, one measurement.
slug: $SLUG
created: $ts
changed: ""          # which preset/prompt/setting did you touch? (path)
provider: claude-code
target: ""           # which target(s) did you test against?
baseline: ""         # the experiment/run this is compared to (or "cold start")
verdict:             # keep | revert | inconclusive  (fill after RESULT.md)
YAML

ok "Scaffolded experiments/$stamp"
dim "Write HYPOTHESIS.md before you run it. Fill RESULT.md after. Set verdict in run.yaml."
