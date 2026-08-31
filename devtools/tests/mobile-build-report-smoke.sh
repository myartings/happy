#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_DIR="$(mktemp -d -t happy-mobile-report-XXXXXX)"
trap 'rm -rf "$TEMP_DIR"' EXIT

export HAPPY_DEVTOOLS_STATE_DIR="$TEMP_DIR/state"
export HAPPY_DEVTOOLS_REPORT_DIR="$TEMP_DIR/reports"

# Load functions without running a cloud or local build action.
# shellcheck disable=SC1090
source "$ROOT/happyctl" help >/dev/null

BUILD_JSON="$TEMP_DIR/build.json"
write_build_fixture() {
  local output="$1" status="$2" platform="$3" profile="$4" channel="$5"
  cat >"$output" <<JSON
[
  {
    "id": "build-123",
    "status": "$status",
    "platform": "$platform",
    "buildProfile": "$profile",
    "channel": "$channel",
    "fingerprint": { "hash": "native-hash" },
    "createdAt": "2026-08-30T01:00:00.000Z",
    "completedAt": "2026-08-30T01:10:00.000Z",
    "artifacts": { "buildUrl": "https://example.invalid/app.ipa" }
  }
]
JSON
}

write_build_fixture "$BUILD_JSON" FINISHED IOS personal personal
BUILD_RESPONSE_BYTES="$(wc -c <"$BUILD_JSON" | tr -d '[:space:]')"
BUILD_RESPONSE_SHA256="$(mobile_sha256_stdin <"$BUILD_JSON")"

REPORT_OUTPUT="$(mobile_write_build_report_from_json \
  ios build-internal personal \
  1111111111111111111111111111111111111111 \
  sha256:2222222222222222222222222222222222222222222222222222222222222222 \
  100 142 0 FINISHED "$BUILD_JSON" \
  'not computed (use --hash-artifact to stream the remote artifact)')"
REPORT_PATH="${REPORT_OUTPUT#Update report: }"

test -f "$REPORT_PATH"
grep -F -- '- Platform: ios' "$REPORT_PATH" >/dev/null
grep -F -- '- EAS profile: personal' "$REPORT_PATH" >/dev/null
grep -F -- '- EAS channel: personal' "$REPORT_PATH" >/dev/null
grep -F -- '- Returned EAS platform: IOS' "$REPORT_PATH" >/dev/null
grep -F -- '- Returned EAS profile: personal' "$REPORT_PATH" >/dev/null
grep -F -- '- Returned EAS channel: personal' "$REPORT_PATH" >/dev/null
grep -F -- '- Source commit: 1111111111111111111111111111111111111111' "$REPORT_PATH" >/dev/null
grep -F -- '- Dirty source digest: sha256:2222222222222222222222222222222222222222222222222222222222222222' "$REPORT_PATH" >/dev/null
grep -F -- '- Native fingerprint: native-hash' "$REPORT_PATH" >/dev/null
grep -F -- '- EAS build ID: build-123' "$REPORT_PATH" >/dev/null
grep -F -- '- Duration seconds: 42' "$REPORT_PATH" >/dev/null
grep -F -- '- EAS created: 2026-08-30T01:00:00.000Z' "$REPORT_PATH" >/dev/null
grep -F -- '- EAS completed: 2026-08-30T01:10:00.000Z' "$REPORT_PATH" >/dev/null
grep -F -- '- EAS duration seconds: 600' "$REPORT_PATH" >/dev/null
grep -F -- '- Artifact URL: https://example.invalid/app.ipa' "$REPORT_PATH" >/dev/null
grep -F -- '- Artifact SHA-256: not computed (use --hash-artifact to stream the remote artifact)' "$REPORT_PATH" >/dev/null
grep -F -- "- EAS response bytes: $BUILD_RESPONSE_BYTES" "$REPORT_PATH" >/dev/null
grep -F -- "- EAS response SHA-256: $BUILD_RESPONSE_SHA256" "$REPORT_PATH" >/dev/null
grep -F -- '- EAS process exit: 0' "$REPORT_PATH" >/dev/null
grep -F -- '- Command outcome: exited 0' "$REPORT_PATH" >/dev/null
grep -F -- '- EAS status: FINISHED' "$REPORT_PATH" >/dev/null
grep -F -- '- Status: FINISHED' "$REPORT_PATH" >/dev/null

# Every real-build prerequisite must propagate explicitly even when the caller
# invokes the readiness gate from an OR-list. Bash suppresses errexit inside a
# function in that context, so later successful checks must not mask a failure.
assert_release_gate_stops_before_eas() {
  local name="$1" validation_exit="$2" clean_exit="$3"
  local eas_marker="$TEMP_DIR/$name-eas-called"
  if (
    mobile_validate_local_configuration() { return "$validation_exit"; }
    ensure_clean_repo() { return "$clean_exit"; }
    git() { printf '%s\n' "$HAPPY_DEVTOOLS_FINAL_BRANCH"; }
    mobile_run_eas() { : >"$eas_marker"; }
    mobile_require_release_ready ios
  ); then
    echo "Expected $name release readiness failure" >&2
    exit 1
  fi
  test ! -e "$eas_marker"
}

assert_release_gate_stops_before_eas invalid-configuration 41 0
assert_release_gate_stops_before_eas dirty-repository 0 42

# A zero-exit EAS process with an unrecognized JSON shape must not be reported
# as a successful build. The external command is the only mocked boundary.
mobile_require_release_ready() { :; }
EAS_FIXTURE_PATH="$TEMP_DIR/invalid.json"
EAS_FIXTURE_EXIT=0
printf '{}\n' >"$EAS_FIXTURE_PATH"
mobile_run_eas() {
  command cat "$EAS_FIXTURE_PATH"
  return "$EAS_FIXTURE_EXIT"
}
if INVALID_OUTPUT="$(mobile_build_action \
  android build-internal personal 0 0 \
  build --profile personal --platform android)"; then
  echo "Expected successful-but-invalid EAS JSON to fail" >&2
  exit 1
fi
INVALID_REPORT_PATH="${INVALID_OUTPUT#Update report: }"
test -f "$INVALID_REPORT_PATH"
grep -F -- '- Status: command failed (invalid EAS build JSON)' "$INVALID_REPORT_PATH" >/dev/null
grep -F -- '- EAS process exit: 0' "$INVALID_REPORT_PATH" >/dev/null
grep -F -- '- Command outcome: exited 0' "$INVALID_REPORT_PATH" >/dev/null

# A successful process is not a successful build unless EAS reports FINISHED.
ERRORED_JSON="$TEMP_DIR/errored.json"
cat >"$ERRORED_JSON" <<'JSON'
{
  "status": "ERRORED",
  "platform": "ANDROID",
  "buildProfile": "personal",
  "channel": "personal",
  "createdAt": "2026-08-30T01:00:00.000Z"
}
JSON
EAS_FIXTURE_PATH="$ERRORED_JSON"
if ERRORED_OUTPUT="$(mobile_build_action \
  android build-internal personal 0 0 \
  build --profile personal --platform android)"; then
  echo "Expected zero-exit ERRORED EAS build to fail" >&2
  exit 1
fi
ERRORED_REPORT_PATH="${ERRORED_OUTPUT#Update report: }"
grep -F -- '- Returned EAS platform: ANDROID' "$ERRORED_REPORT_PATH" >/dev/null
grep -F -- '- Returned EAS profile: personal' "$ERRORED_REPORT_PATH" >/dev/null
grep -F -- '- Returned EAS channel: personal' "$ERRORED_REPORT_PATH" >/dev/null
grep -F -- '- EAS build ID: n/a' "$ERRORED_REPORT_PATH" >/dev/null
grep -F -- '- EAS created: 2026-08-30T01:00:00.000Z' "$ERRORED_REPORT_PATH" >/dev/null
grep -F -- '- EAS completed: n/a' "$ERRORED_REPORT_PATH" >/dev/null
grep -F -- '- EAS process exit: 0' "$ERRORED_REPORT_PATH" >/dev/null
grep -F -- '- Command outcome: exited 0' "$ERRORED_REPORT_PATH" >/dev/null
grep -F -- '- EAS status: ERRORED' "$ERRORED_REPORT_PATH" >/dev/null
grep -F -- '- Status: build failed (EAS status: ERRORED)' "$ERRORED_REPORT_PATH" >/dev/null

# A failed process remains failed even if it emitted otherwise valid FINISHED JSON.
EAS_FIXTURE_PATH="$BUILD_JSON"
EAS_FIXTURE_EXIT=23
if NONZERO_OUTPUT="$(mobile_build_action \
  ios build-internal personal 0 0 \
  build --profile personal --platform ios)"; then
  echo "Expected nonzero EAS command with FINISHED JSON to fail" >&2
  exit 1
else
  NONZERO_EXIT=$?
fi
test "$NONZERO_EXIT" -eq 23
NONZERO_REPORT_PATH="${NONZERO_OUTPUT#Update report: }"
grep -F -- '- EAS process exit: 23' "$NONZERO_REPORT_PATH" >/dev/null
grep -F -- '- Command outcome: command failed (exit 23)' "$NONZERO_REPORT_PATH" >/dev/null
grep -F -- '- EAS status: FINISHED' "$NONZERO_REPORT_PATH" >/dev/null
grep -F -- '- Status: command failed (exit 23)' "$NONZERO_REPORT_PATH" >/dev/null
EAS_FIXTURE_EXIT=0

# Returned EAS dimensions must independently match the requested build target.
while IFS='|' read -r mismatch returned_platform returned_profile returned_channel; do
  MISMATCH_JSON="$TEMP_DIR/mismatch-$mismatch.json"
  write_build_fixture \
    "$MISMATCH_JSON" FINISHED "$returned_platform" "$returned_profile" "$returned_channel"
  EAS_FIXTURE_PATH="$MISMATCH_JSON"
  if MISMATCH_OUTPUT="$(mobile_build_action \
    ios build-internal personal 0 0 \
    build --profile personal --platform ios)"; then
    echo "Expected returned EAS $mismatch mismatch to fail" >&2
    exit 1
  fi
  MISMATCH_REPORT_PATH="${MISMATCH_OUTPUT#Update report: }"
  grep -F -- '- EAS process exit: 0' "$MISMATCH_REPORT_PATH" >/dev/null
  grep -F -- '- Command outcome: exited 0' "$MISMATCH_REPORT_PATH" >/dev/null
  grep -F -- '- Status: build failed (EAS build dimensions do not match request)' \
    "$MISMATCH_REPORT_PATH" >/dev/null
  grep -F -- "- Returned EAS platform: $returned_platform" "$MISMATCH_REPORT_PATH" >/dev/null
  grep -F -- "- Returned EAS profile: $returned_profile" "$MISMATCH_REPORT_PATH" >/dev/null
  grep -F -- "- Returned EAS channel: $returned_channel" "$MISMATCH_REPORT_PATH" >/dev/null
done <<'CASES'
platform|ANDROID|personal|personal
profile|IOS|personal-store|personal
channel|IOS|personal|preview
CASES

MALFORMED_JSON="$TEMP_DIR/malformed.json"
printf '{not-json\n' >"$MALFORMED_JSON"
MALFORMED_RESPONSE_BYTES="$(wc -c <"$MALFORMED_JSON" | tr -d '[:space:]')"
MALFORMED_RESPONSE_SHA256="$(mobile_sha256_stdin <"$MALFORMED_JSON")"
EAS_FIXTURE_PATH="$MALFORMED_JSON"
if MALFORMED_OUTPUT="$(mobile_build_action \
  ios build-internal personal 0 0 \
  build --profile personal --platform ios)"; then
  echo "Expected successful-but-malformed EAS JSON to fail" >&2
  exit 1
fi
MALFORMED_REPORT_PATH="${MALFORMED_OUTPUT#Update report: }"
grep -F -- '- Status: command failed (invalid EAS build JSON)' "$MALFORMED_REPORT_PATH" >/dev/null
grep -F -- "- EAS response bytes: $MALFORMED_RESPONSE_BYTES" "$MALFORMED_REPORT_PATH" >/dev/null
grep -F -- "- EAS response SHA-256: $MALFORMED_RESPONSE_SHA256" "$MALFORMED_REPORT_PATH" >/dev/null
if mobile_build_metadata_line "$MALFORMED_JSON" >/dev/null 2>&1; then
  echo "Expected malformed EAS JSON metadata to fail" >&2
  exit 1
fi

test "$(mobile_parse_build_options --hash-artifact --dry-run)" = "1 1"
test "$(mobile_parse_build_options --dry-run)" = "1 0"

ARTIFACT_FIXTURE="$TEMP_DIR/artifact.bin"
printf 'artifact fixture\n' >"$ARTIFACT_FIXTURE"
EXPECTED_SHA256="$(shasum -a 256 "$ARTIFACT_FIXTURE" | awk '{print $1}')"
curl() {
  test "$#" -eq 10
  test "$1" = '--fail'
  test "$2" = '--location'
  test "$3" = '--silent'
  test "$4" = '--show-error'
  test "$5" = '--proto'
  test "$6" = '=https'
  test "$7" = '--proto-redir'
  test "$8" = '=https'
  test "$9" = '--'
  test "${10}" = 'https://example.invalid/app.ipa'
  command cat "$ARTIFACT_FIXTURE"
}
ACTUAL_SHA256="$(mobile_stream_artifact_sha256 'https://example.invalid/app.ipa')"
test "$ACTUAL_SHA256" = "$EXPECTED_SHA256"
if mobile_stream_artifact_sha256 "file://$ARTIFACT_FIXTURE" >/dev/null 2>&1; then
  echo "Expected file artifact URL to be rejected" >&2
  exit 1
fi
if mobile_stream_artifact_sha256 'http://example.invalid/app.ipa' >/dev/null 2>&1; then
  echo "Expected HTTP artifact URL to be rejected" >&2
  exit 1
fi

# The response file is removed even when report generation fails.
CLEANUP_JSON_PATH="$TEMP_DIR/cleanup-response.json"
EAS_FIXTURE_PATH="$BUILD_JSON"
EAS_FIXTURE_EXIT=0
mktemp() { printf '%s\n' "$CLEANUP_JSON_PATH"; }
mobile_write_build_report_from_json() { return 19; }
if mobile_build_action \
  ios build-internal personal 0 0 \
  build --profile personal --platform ios; then
  echo "Expected mocked report failure" >&2
  exit 1
else
  CLEANUP_EXIT=$?
fi
test "$CLEANUP_EXIT" -eq 19
test ! -e "$CLEANUP_JSON_PATH"

echo "happyctl mobile build report smoke passed"
