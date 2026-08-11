#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
UPSTREAM_REF="${1:-upstream/main}"

test -x "$REPO_ROOT/devtools/happyctl"
test -f "$REPO_ROOT/devtools/happyctl.ps1"
grep -q 'packages/happy-app' "$REPO_ROOT/pnpm-workspace.yaml"
if grep -qE '(^|[[:space:]-])devtools([/"[:space:]]|$)' "$REPO_ROOT/pnpm-workspace.yaml"; then
  echo "devtools must not be part of the pnpm workspace" >&2
  exit 1
fi

git -C "$REPO_ROOT" rev-parse --verify --quiet "$UPSTREAM_REF^{commit}" >/dev/null
git -C "$REPO_ROOT" merge-base --is-ancestor "$UPSTREAM_REF" HEAD

invalid=()
while IFS= read -r path; do
  [[ -z "$path" ]] && continue
  case "$path" in
    devtools/*|.agents/skills/happy-desktop-update/*|.agents/skills/happy-ios-release/*|AGENTS.md|.gitignore) ;;
    *) invalid+=("$path") ;;
  esac
done < <(git -C "$REPO_ROOT" diff --name-only "$UPSTREAM_REF"..HEAD)

if [[ "${#invalid[@]}" -gt 0 ]]; then
  echo "Non-devtools changes found against $UPSTREAM_REF:" >&2
  printf '  %s\n' "${invalid[@]}" >&2
  exit 1
fi

echo "Happy devtools layout and official-product equivalence passed"
