#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEMP_ROOT="$(mktemp -d -t happyctl-refresh-guards-XXXXXX)"
trap 'rm -rf "$TEMP_ROOT"' EXIT

# Load the public shell functions without running a mutating command.
# shellcheck disable=SC1091
source "$REPO_ROOT/devtools/happyctl" help >/dev/null

fixture_repo="$TEMP_ROOT/repo"
mkdir -p "$fixture_repo"
git -C "$fixture_repo" init -q -b main
git -C "$fixture_repo" config user.name "Happyctl Test"
git -C "$fixture_repo" config user.email "happyctl-test@example.invalid"
printf 'official\n' >"$fixture_repo/product.txt"
git -C "$fixture_repo" add product.txt
git -C "$fixture_repo" commit -qm "official"
git -C "$fixture_repo" branch upstream/main

mkdir -p "$fixture_repo/devtools"
printf 'allowed\n' >"$fixture_repo/devtools/tool"
git -C "$fixture_repo" add devtools/tool
git -C "$fixture_repo" commit -qm "personal devtools"

HAPPY_REPO="$fixture_repo"
HAPPY_DEVTOOLS_BASE_UPSTREAM="upstream/main"
HAPPY_DEVTOOLS_BASE_BRANCH="main"

validate_base_branch_for_refresh

printf 'personal product change\n' >>"$fixture_repo/product.txt"
git -C "$fixture_repo" add product.txt
git -C "$fixture_repo" commit -qm "invalid product change"
if validate_base_branch_for_refresh >/dev/null 2>&1; then
  echo "refresh base validation accepted a non-allowlisted product delta" >&2
  exit 1
fi

HAPPY_REPO="$REPO_ROOT"
BUILD_APP="$TEMP_ROOT/Happy (dev).app"
mkdir -p "$BUILD_APP"
install_marker="$TEMP_ROOT/install-ran"
install_js_dependencies() { touch "$install_marker"; }
run_pnpm() { return 0; }

unset EXPO_PUBLIC_HAPPY_GITHUB_ISSUES_CLIENT_ID
EXPO_PUBLIC_HAPPY_GITHUB_ISSUES_APP_SLUG="happy-issues-test"
if build_desktop >/dev/null 2>&1; then
  echo "build_desktop succeeded without GitHub Issues client ID" >&2
  exit 1
fi
test ! -e "$install_marker"

EXPO_PUBLIC_HAPPY_GITHUB_ISSUES_CLIENT_ID="test-client-id"
unset EXPO_PUBLIC_HAPPY_GITHUB_ISSUES_APP_SLUG
if build_desktop >/dev/null 2>&1; then
  echo "build_desktop succeeded without GitHub Issues app slug" >&2
  exit 1
fi
test ! -e "$install_marker"

echo "Happyctl refresh guard smoke tests passed"
