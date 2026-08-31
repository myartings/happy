#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
if [ -f "$ROOT/scripts/workflow-state.py" ]; then
  if command -v python3 >/dev/null 2>&1 \
      && python3 -c 'import sys; raise SystemExit(sys.version_info < (3, 11))' \
        >/dev/null 2>&1; then
    python_command=(python3)
  elif command -v py >/dev/null 2>&1 \
      && py -3 -c 'import sys; raise SystemExit(sys.version_info < (3, 11))' \
        >/dev/null 2>&1; then
    python_command=(py -3)
  elif command -v python >/dev/null 2>&1 \
      && python -c 'import sys; raise SystemExit(sys.version_info < (3, 11))' \
        >/dev/null 2>&1; then
    python_command=(python)
  else
    printf '%s\n' 'session-start hook requires usable Python 3.11+ (python3, py -3, or python)' >&2
    exit 127
  fi
  workflow_status="$("${python_command[@]}" "$ROOT/scripts/workflow-state.py" active)"
  if [ "$workflow_status" = "no active workflow" ]; then
    printf '%s\n' '{"continue":true}'
  else
    WORKFLOW_STATUS="$workflow_status" "${python_command[@]}" - <<'PY'
import json
import os

print(json.dumps({
    "continue": True,
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": os.environ["WORKFLOW_STATUS"],
    },
}, ensure_ascii=False))
PY
  fi
fi
