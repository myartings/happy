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

personal_fixture="$TEMP_ROOT/personal-feature-surface"
personal_screen="$personal_fixture/packages/happy-app/sources/features/personal-settings/PersonalFeaturesSettingsScreen.tsx"
personal_route="$personal_fixture/packages/happy-app/sources/app/(app)/settings/personal-features.tsx"
settings_view="$personal_fixture/packages/happy-app/sources/components/SettingsView.tsx"
mkdir -p "$(dirname "$personal_screen")" "$(dirname "$personal_route")" "$(dirname "$settings_view")"

write_complete_personal_surface() {
  printf '%s\n' \
    "useLocalSettingMutable('flatSessionList')" \
    "useLocalSettingMutable('devSideChatQuickPanelEnabled')" \
    "useLocalSettingMutable('devProjectTodosEnabled')" \
    "useLocalSettingMutable('devGithubIssuesEnabled')" \
    "useSettingMutable('needsAttentionSessionsEnabled')" \
    "useLocalSettingMutable('devPromptHistoryNavigatorEnabled')" \
    "useLocalSettingMutable('devSessionEnvironmentLabelsEnabled')" \
    "useLocalSettingMutable('devEnhancedStatusDotsEnabled')" \
    "useSettingMutable('sortActiveSessionsGlobally')" \
    "useSettingMutable('groupActiveSessionsByDate')" \
    "useLocalSettingMutable('devShowActiveSessionRuntimeEnabled')" \
    "useLocalSettingMutable('devShowSessionModelEnabled')" \
    "useLocalSettingMutable('desktopSessionNotificationsEnabled')" >"$personal_screen"
  printf '%s\n' "@/features/personal-settings/PersonalFeaturesSettingsScreen" >"$personal_route"
  printf '%s\n' "router.push('/settings/personal-features')" "{/* Developer */}" >"$settings_view"
}

HAPPY_REPO="$personal_fixture"
write_complete_personal_surface
validate_personal_feature_surface

rm "$personal_route"
if validate_personal_feature_surface >/dev/null 2>&1; then
  echo "personal feature guard accepted a missing route" >&2
  exit 1
fi

write_complete_personal_surface
printf '%s\n' "missing navigation" >"$settings_view"
if validate_personal_feature_surface >/dev/null 2>&1; then
  echo "personal feature guard accepted a missing Settings entry" >&2
  exit 1
fi

write_complete_personal_surface
printf '%s\n' "useLocalSettingMutable('flatSessionList')" >"$personal_screen"
if validate_personal_feature_surface >/dev/null 2>&1; then
  echo "personal feature guard accepted missing protected switches" >&2
  exit 1
fi

write_complete_personal_surface
printf '%s\n' "{/* Developer */}" "router.push('/settings/personal-features')" >"$settings_view"
if validate_personal_feature_surface >/dev/null 2>&1; then
  echo "personal feature guard accepted a Developer-only Settings entry" >&2
  exit 1
fi

declare -f sync_patch_stack_locally | grep -q 'validate_personal_feature_surface'

echo "Happyctl refresh guard smoke tests passed"
