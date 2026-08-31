#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_DIR="$(mktemp -d -t happy-android-release-XXXXXX)"
trap 'rm -rf "$TEMP_DIR"' EXIT

export HAPPY_DEVTOOLS_STATE_DIR="$TEMP_DIR/state"
export EXPO_OWNER="validation-owner"
export EXPO_PUBLIC_EAS_PROJECT_ID="00000000-0000-4000-8000-000000000000"

FAKE_COREPACK="$TEMP_DIR/corepack"
cat >"$FAKE_COREPACK" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
test "${1:-}" = "pnpm@10.11.0"
shift
exec pnpm "$@"
SH
chmod +x "$FAKE_COREPACK"

run_dry() {
  local name="$1"
  shift
  "$ROOT/happyctl" "$@" >"$TEMP_DIR/$name.out"
  grep -F "No cloud build, submission, update, or report was created." "$TEMP_DIR/$name.out" >/dev/null
  grep -F "No artifact was downloaded." "$TEMP_DIR/$name.out" >/dev/null
}

bash -n "$ROOT/happyctl"
run_dry internal android-build-internal --dry-run
grep -F "build --profile personal --platform android" "$TEMP_DIR/internal.out" >/dev/null

run_dry store android-build-store --dry-run
grep -F "build --profile personal-store --platform android" "$TEMP_DIR/store.out" >/dev/null

run_dry hash android-build-internal --hash-artifact --dry-run
grep -F "Artifact SHA-256: requested only after a future successful build" "$TEMP_DIR/hash.out" >/dev/null

run_dry update android-publish-update --message "Smoke validation" --dry-run
grep -F "update --channel personal --environment preview --platform android" "$TEMP_DIR/update.out" >/dev/null

HAPPY_PNPM_CMD="$FAKE_COREPACK pnpm@10.11.0" \
  "$ROOT/happyctl" android-build-internal --dry-run >"$TEMP_DIR/linux-command.out"
grep -F "$FAKE_COREPACK pnpm@10.11.0 dlx eas-cli@21.7.0 build --profile personal --platform android --wait --json" \
  "$TEMP_DIR/linux-command.out" >/dev/null

if "$ROOT/happyctl" android-publish-update --dry-run >"$TEMP_DIR/missing-message.out" 2>&1; then
  echo "Expected android-publish-update without --message to fail" >&2
  exit 1
fi
grep -F "requires --message" "$TEMP_DIR/missing-message.out" >/dev/null

"$ROOT/happyctl" help >"$TEMP_DIR/help.out"
grep -F "android-doctor" "$TEMP_DIR/help.out" >/dev/null
grep -F "android-release-status" "$TEMP_DIR/help.out" >/dev/null

if [[ -e "$TEMP_DIR/state/reports" ]]; then
  echo "Android dry-runs must not create reports" >&2
  exit 1
fi

echo "happyctl Android release smoke passed"
