#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# PostToolUse Hook
# Runs after a tool has completed. Use this to inject reminders or context.
#
# Input:  JSON on stdin  — tool_name, tool_input, tool_response
# Output: {"systemMessage": "..."} to inject a message into Claude's context,
#         or empty output for no effect.
#
# Docs: https://docs.anthropic.com/en/docs/claude-code/hooks
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

INPUT=$(cat)

json_get() {
  python3 -c "
import sys, json
try:
    d = json.loads(sys.stdin.read())
    keys = '$1'.split('.')
    v = d
    for k in keys:
        v = v[k] if isinstance(v, dict) else ''
    print(v if v is not None else '')
except:
    print('')
" <<< "$INPUT"
}

TOOL_NAME=$(json_get "tool_name")
FILE_PATH=$(json_get "tool_input.path")

# ── Reminder: run tests after editing test files ──────────────────────────────
if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" || "$TOOL_NAME" == "MultiEdit" ]]; then
  if echo "$FILE_PATH" | grep -qiE '\.(test|spec)\.[jt]sx?$|_test\.go$|test_.*\.py$|.*_spec\.rb$'; then
    echo '{"systemMessage":"Test file edited. Consider running the test suite to verify the changes work as expected."}'
    exit 0
  fi
fi

# ── Default: no effect ────────────────────────────────────────────────────────
exit 0
