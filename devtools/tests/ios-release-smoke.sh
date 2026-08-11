#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

export EXPO_OWNER="validation-owner"
export EXPO_PUBLIC_EAS_PROJECT_ID="00000000-0000-4000-8000-000000000000"

run_dry() {
  local name="$1"
  shift
  "$ROOT/happyctl" "$@" >"$TEMP_DIR/$name.out"
  grep -q "No cloud build, submission, update, or report was created." "$TEMP_DIR/$name.out"
}

bash -n "$ROOT/happyctl"
run_dry internal ios-build-internal --dry-run
grep -q "cd .*packages/happy-app && APP_ENV=personal" "$TEMP_DIR/internal.out"
if grep -q "pnpm -C .*packages/happy-app.* dlx" "$TEMP_DIR/internal.out"; then
  echo "Expected EAS to run from the Happy app working directory" >&2
  exit 1
fi
run_dry testflight ios-build-testflight --dry-run
run_dry submit ios-submit-testflight --build-id 00000000-0000-4000-8000-000000000001 --dry-run
run_dry update ios-publish-update --message "Smoke validation" --dry-run
grep -q "update --channel personal --environment preview --platform ios" "$TEMP_DIR/update.out"

if "$ROOT/happyctl" ios-publish-update --dry-run >"$TEMP_DIR/missing-message.out" 2>&1; then
  echo "Expected ios-publish-update without --message to fail" >&2
  exit 1
fi
grep -q "requires --message" "$TEMP_DIR/missing-message.out"

if "$ROOT/happyctl" ios-submit-testflight --dry-run >"$TEMP_DIR/missing-build-id.out" 2>&1; then
  echo "Expected ios-submit-testflight without --build-id to fail" >&2
  exit 1
fi
grep -q "requires --build-id" "$TEMP_DIR/missing-build-id.out"

echo "happyctl iOS release smoke passed"
