#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEMP_ROOT="$(mktemp -d -t happyctl-macos-signing-XXXXXX)"
trap 'rm -rf "$TEMP_ROOT"' EXIT

# Load happyctl functions without running a mutating command.
# shellcheck disable=SC1091
source "$REPO_ROOT/devtools/happyctl" help >/dev/null
HAPPY_DEVTOOLS_LOG_DIR="$TEMP_ROOT/logs"

SECURITY_MODE="eligible"
security() {
  case "$SECURITY_MODE" in
    eligible)
      cat <<'EOF'
  1) AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA "Apple Development: Local Developer (TEAMDEV123)"
  2) BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB "Developer ID Application: Local Developer (TEAMREL123)"
  3) CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC "iPhone Distribution: Local Developer (TEAMIOS123)"
     3 valid identities found
EOF
      ;;
    development-only)
      cat <<'EOF'
  1) AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA "Apple Development: Local Developer (TEAMDEV123)"
     1 valid identities found
EOF
      ;;
    none)
      printf '     0 valid identities found\n'
      ;;
  esac
}

unset HAPPY_MACOS_SIGNING_IDENTITY
selected="$(resolve_macos_signing_identity)"
test "$selected" = "Apple Development: Local Developer (TEAMDEV123)"

SECURITY_MODE="development-only"
selected="$(resolve_macos_signing_identity)"
test "$selected" = "Apple Development: Local Developer (TEAMDEV123)"

HAPPY_MACOS_SIGNING_IDENTITY="Apple Development: Local Developer (TEAMDEV123)"
selected="$(resolve_macos_signing_identity)"
test "$selected" = "$HAPPY_MACOS_SIGNING_IDENTITY"

SECURITY_MODE="eligible"
HAPPY_MACOS_SIGNING_IDENTITY="iPhone Distribution: Local Developer (TEAMIOS123)"
if resolve_macos_signing_identity >/dev/null 2>&1; then
  echo "identity resolution accepted an iPhone Distribution identity" >&2
  exit 1
fi

unset HAPPY_MACOS_SIGNING_IDENTITY
SECURITY_MODE="none"
if resolve_macos_signing_identity >/dev/null 2>&1; then
  echo "identity resolution accepted a host without an eligible identity" >&2
  exit 1
fi

SECURITY_MODE="development-only"
fake_app="$TEMP_ROOT/Happy (dev).app"
mkdir -p "$fake_app/Contents"
touch "$fake_app/Contents/Info.plist"
codesign_args="$TEMP_ROOT/codesign-args"
SIGN_COMMAND_FAILS=0
codesign() {
  case "${1:-}" in
    --force)
      printf '%s\n' "$*" >"$codesign_args"
      [[ "$SIGN_COMMAND_FAILS" -eq 0 ]]
      ;;
    --verify)
      return 0
      ;;
    -dv)
      printf '%s\n' \
        'Identifier=com.slopus.happy.dev' \
        'Signature size=4789' \
        'TeamIdentifier=TEAMDEV123' >&2
      ;;
    *)
      echo "unexpected codesign invocation: $*" >&2
      return 1
      ;;
  esac
}

HAPPY_REPO="$REPO_ROOT"
HAPPY_APP_BUNDLE_ID="com.slopus.happy.dev"
sign_desktop_app "$fake_app"
grep -F -- '--sign Apple Development: Local Developer (TEAMDEV123)' "$codesign_args" >/dev/null
grep -F -- '--options runtime' "$codesign_args" >/dev/null
grep -F -- '--timestamp=none' "$codesign_args" >/dev/null
grep -F -- "--entitlements $REPO_ROOT/packages/happy-app/src-tauri/entitlements.plist" "$codesign_args" >/dev/null
if grep -F -- '--sign -' "$codesign_args" >/dev/null; then
  echo "stable signing fell back to ad-hoc" >&2
  exit 1
fi

SIGN_COMMAND_FAILS=1
if sign_desktop_app "$fake_app" >/dev/null 2>&1; then
  echo "sign_desktop_app hid a codesign command failure" >&2
  exit 1
fi
SIGN_COMMAND_FAILS=0

BUILD_APP="$fake_app"
INSTALL_APP="$TEMP_ROOT/Applications/Happy (dev).app"
mkdir -p "$(dirname "$INSTALL_APP")"
events="$TEMP_ROOT/install-events"
sign_desktop_app() { printf 'sign:%s\n' "$1" >>"$events"; }
quit_desktop() { printf 'quit\n' >>"$events"; }
backup_installed_app() { printf 'backup\n' >>"$events"; }
run() {
  if [[ "$1" == "ditto" ]]; then
    printf 'install\n' >>"$events"
    mkdir -p "$3"
  fi
}
install_desktop
test "$(sed -n '1p' "$events")" = "sign:$BUILD_APP"
test "$(sed -n '2p' "$events")" = "quit"
test "$(sed -n '3p' "$events")" = "backup"
test "$(sed -n '4p' "$events")" = "install"

: >"$events"
sign_desktop_app() { printf 'sign\n' >>"$events"; }
quit_desktop() { printf 'quit\n' >>"$events"; }
backup_installed_app() { printf 'backup-failed\n' >>"$events"; return 1; }
if install_desktop >/dev/null 2>&1; then
  echo "install_desktop continued after backup failure" >&2
  exit 1
fi
test "$(printf 'sign\nquit\nbackup-failed')" = "$(cat "$events")"

: >"$events"
sign_desktop_app() { printf 'sign-failed\n' >>"$events"; return 1; }
if install_desktop >/dev/null 2>&1; then
  echo "install_desktop continued after signing failure" >&2
  exit 1
fi
test "$(cat "$events")" = "sign-failed"

INSTALL_APP="$fake_app"
defaults() { printf 'com.slopus.happy.dev\n'; }
codesign() {
  if [[ "${1:-}" == "-dv" ]]; then
    printf '%s\n' \
      'Identifier=com.slopus.happy.dev' \
      'Signature=adhoc' \
      'TeamIdentifier=not set' >&2
    return 0
  fi
  if [[ "${1:-}" == "--verify" ]]; then
    return 0
  fi
  return 1
}
if verify_desktop >/dev/null 2>&1; then
  echo "verify_desktop accepted an ad-hoc teamless app" >&2
  exit 1
fi

echo "Happyctl macOS stable-signing smoke tests passed"
