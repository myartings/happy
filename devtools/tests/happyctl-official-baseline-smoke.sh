#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEMP_ROOT="$(mktemp -d -t happyctl-official-baseline-XXXXXX)"
trap 'rm -rf "$TEMP_ROOT"' EXIT

# shellcheck disable=SC1091
source "$REPO_ROOT/devtools/happyctl" help >/dev/null

set_desktop_profile official-baseline
test "$HAPPY_APP_NAME" = "Happy (official baseline).app"
test "$HAPPY_APP_BUNDLE_ID" = "com.slopus.happy.official-baseline"
test "$INSTALL_APP" = "/Applications/Happy (official baseline).app"
test "$HAPPY_TAURI_CONFIG" = "$REPO_ROOT/devtools/config/tauri.official-baseline.conf.json"

is_devtools_path ".agents/skills/happy-desktop-official-release/SKILL.md"

fixture_repo="$TEMP_ROOT/repo"
mkdir -p "$fixture_repo/devtools/config"
git -C "$fixture_repo" init -q -b main
git -C "$fixture_repo" config user.name "Happyctl Test"
git -C "$fixture_repo" config user.email "happyctl-test@example.invalid"
printf 'official\n' >"$fixture_repo/product.txt"
printf '{}\n' >"$fixture_repo/devtools/config/tauri.official-baseline.conf.json"
git -C "$fixture_repo" add .
git -C "$fixture_repo" commit -qm "official"
git -C "$fixture_repo" branch upstream/main

HAPPY_REPO="$fixture_repo"
HAPPY_DEVTOOLS_BASE_UPSTREAM="upstream/main"
HAPPY_DEVTOOLS_BASE_BRANCH="main"
HAPPY_OFFICIAL_BASELINE_WORKTREE="$TEMP_ROOT/baseline"
caller_branch_before="$(git -C "$fixture_repo" branch --show-current)"
prepare_official_baseline_worktree
test "$(git -C "$fixture_repo" branch --show-current)" = "$caller_branch_before"
test "$(git -C "$HAPPY_OFFICIAL_BASELINE_WORKTREE" rev-parse HEAD)" = "$(git -C "$fixture_repo" rev-parse main)"
test -z "$(git -C "$HAPPY_OFFICIAL_BASELINE_WORKTREE" branch --show-current)"

printf 'dirty\n' >"$HAPPY_OFFICIAL_BASELINE_WORKTREE/dirty.txt"
if prepare_official_baseline_worktree >/dev/null 2>&1; then
  echo "official baseline preparation accepted a dirty isolated worktree" >&2
  exit 1
fi
rm "$HAPPY_OFFICIAL_BASELINE_WORKTREE/dirty.txt"

before_status="$(git -C "$fixture_repo" status --porcelain=v1)"
dry_run_output="$(refresh_official_baseline --dry-run)"
after_status="$(git -C "$fixture_repo" status --porcelain=v1)"
test "$before_status" = "$after_status"
grep -F 'No changes made.' <<<"$dry_run_output" >/dev/null
grep -F 'Happy (official baseline).app' <<<"$dry_run_output" >/dev/null
grep -F "$HAPPY_OFFICIAL_BASELINE_WORKTREE" <<<"$dry_run_output" >/dev/null
grep -F 'rollback-official-baseline' < <("$REPO_ROOT/devtools/happyctl" help) >/dev/null

git -C "$fixture_repo" switch -q -c official-next upstream/main
printf 'new official product\n' >>"$fixture_repo/product.txt"
git -C "$fixture_repo" add product.txt
git -C "$fixture_repo" commit -qm "new official"
git -C "$fixture_repo" branch -f upstream/main HEAD
git -C "$fixture_repo" switch -q main
if assert_official_baseline_source >/dev/null 2>&1; then
  echo "official baseline source guard accepted main behind upstream/main" >&2
  exit 1
fi

echo "Happyctl official baseline smoke tests passed"
