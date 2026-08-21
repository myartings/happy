#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HOOK_SOURCE="$REPO_ROOT/devtools/git-hooks/pre-push"
TEMP_ROOT="$(mktemp -d -t happy-main-push-guard-XXXXXX)"
trap 'rm -rf "$TEMP_ROOT"' EXIT

if [[ ! -x "$HOOK_SOURCE" ]]; then
  echo "tracked pre-push hook is missing or not executable: $HOOK_SOURCE" >&2
  exit 1
fi

fixture_repo="$TEMP_ROOT/repo"
remote_repo="$TEMP_ROOT/origin.git"
mkdir -p "$fixture_repo/devtools/git-hooks"
git init -q --bare "$remote_repo"
git -C "$fixture_repo" init -q -b main
git -C "$fixture_repo" config user.name "Happy Push Guard Test"
git -C "$fixture_repo" config user.email "happy-push-guard@example.invalid"

printf 'official\n' >"$fixture_repo/product.txt"
git -C "$fixture_repo" add product.txt
git -C "$fixture_repo" commit -qm "official"
git -C "$fixture_repo" branch upstream/main

mkdir -p "$fixture_repo/devtools"
printf 'allowed\n' >"$fixture_repo/devtools/tool"
git -C "$fixture_repo" add devtools/tool
git -C "$fixture_repo" commit -qm "personal devtools"
git -C "$fixture_repo" remote add origin "$remote_repo"

cp "$REPO_ROOT/devtools/happyctl" "$fixture_repo/devtools/happyctl"
cp "$HOOK_SOURCE" "$fixture_repo/devtools/git-hooks/pre-push"
chmod +x "$fixture_repo/devtools/happyctl" "$fixture_repo/devtools/git-hooks/pre-push"

# Load the public guard functions without running a mutating command.
# shellcheck disable=SC1091
source "$REPO_ROOT/devtools/happyctl" help >/dev/null
HAPPY_REPO="$fixture_repo"
HAPPY_DEVTOOLS_BASE_BRANCH="main"
HAPPY_DEVTOOLS_BASE_UPSTREAM="upstream/main"

install_git_push_guard >/dev/null
install_git_push_guard >/dev/null
installed_hooks_path="$(git -C "$fixture_repo" config --local --get core.hooksPath)"
test "$installed_hooks_path" = "$(git_push_guard_install_dir)"
test -x "$installed_hooks_path/pre-push"
check_git_push_guard >/dev/null

if git -C "$fixture_repo" push origin main:main >"$TEMP_ROOT/direct-main.log" 2>&1; then
  echo "direct main push succeeded without happyctl authorization" >&2
  exit 1
fi
grep -q "must run through devtools/happyctl sync-dev" "$TEMP_ROOT/direct-main.log"

HAPPY_MAIN_PUSH_GUARD=happyctl-sync git -C "$fixture_repo" push origin main:main >/dev/null

git -C "$fixture_repo" switch -qc feature/test main
printf 'feature\n' >>"$fixture_repo/product.txt"
git -C "$fixture_repo" add product.txt
git -C "$fixture_repo" commit -qm "feature product change"
git -C "$fixture_repo" push origin feature/test:feature/test >/dev/null

if HAPPY_MAIN_PUSH_GUARD=happyctl-sync git -C "$fixture_repo" push origin HEAD:main >"$TEMP_ROOT/feature-main.log" 2>&1; then
  echo "feature HEAD push to main bypassed the source-branch guard" >&2
  exit 1
fi
grep -q "must originate from local main" "$TEMP_ROOT/feature-main.log"

if HAPPY_MAIN_PUSH_GUARD=happyctl-sync git -C "$fixture_repo" push "$remote_repo" HEAD:main >"$TEMP_ROOT/url-main.log" 2>&1; then
  echo "direct remote URL push to main bypassed the source-branch guard" >&2
  exit 1
fi
grep -q "must originate from local main" "$TEMP_ROOT/url-main.log"

git -C "$fixture_repo" switch -q main
printf 'invalid\n' >>"$fixture_repo/product.txt"
git -C "$fixture_repo" add product.txt
git -C "$fixture_repo" commit -qm "invalid main product change"
if HAPPY_MAIN_PUSH_GUARD=happyctl-sync git -C "$fixture_repo" push origin main:main >"$TEMP_ROOT/product-main.log" 2>&1; then
  echo "product delta on main bypassed the allowlist guard" >&2
  exit 1
fi
grep -q "outside the devtools allowlist" "$TEMP_ROOT/product-main.log"

git -C "$fixture_repo" config --local core.hooksPath wrong-hooks
if check_git_push_guard >"$TEMP_ROOT/drift.log" 2>&1; then
  echo "git push guard drift was accepted" >&2
  exit 1
fi
grep -q "install-git-guards" "$TEMP_ROOT/drift.log"

git -C "$fixture_repo" config --local --unset core.hooksPath
install_git_push_guard >/dev/null
printf '# stale\n' >>"$(git_push_guard_install_dir)/pre-push"
if check_git_push_guard >"$TEMP_ROOT/stale.log" 2>&1; then
  echo "stale installed hook content was accepted" >&2
  exit 1
fi
grep -q "install-git-guards" "$TEMP_ROOT/stale.log"

echo "Happy main push guard smoke tests passed"
