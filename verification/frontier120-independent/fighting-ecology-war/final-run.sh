#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
node bind-sources.cjs before
node replay-all.cjs > runtime-replay.log 2>&1 & P1=$!
node adversarial.cjs > adversarial.log 2>&1 & P2=$!
node ecology-diversity.cjs > ecology-diversity.log 2>&1 & P3=$!
node ui-audit.cjs > ui-audit.log 2>&1
node ecology-ai-boundary.cjs > ecology-ai-boundary.log 2>&1
node save-and-boundary.cjs > save-and-boundary.log 2>&1
node fighting-causality.cjs > fighting-causality.log 2>&1
node ecology-causality.cjs > ecology-causality.log 2>&1
node war-causality.cjs > war-causality.log 2>&1
node war-alternatives.cjs > war-alternatives.log 2>&1
wait "$P1"; wait "$P2"; wait "$P3"
node bind-sources.cjs after
printf 'ALL INDEPENDENT COMMANDS FINISHED\n'
