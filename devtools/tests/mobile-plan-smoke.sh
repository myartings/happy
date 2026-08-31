#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_ROOT="$(mktemp -d -t happy-mobile-plan-XXXXXX)"
trap 'rm -rf "$TEMP_ROOT"' EXIT

FIXTURE_REPO="$TEMP_ROOT/repo"
mkdir -p "$FIXTURE_REPO/packages/happy-app/sources/components"
git -C "$FIXTURE_REPO" init -q
git -C "$FIXTURE_REPO" config user.name "Happy Test"
git -C "$FIXTURE_REPO" config user.email "happy@example.invalid"
printf 'baseline\n' >"$FIXTURE_REPO/packages/happy-app/sources/components/Fixture.tsx"
printf '{"name":"fixture"}\n' >"$FIXTURE_REPO/package.json"
git -C "$FIXTURE_REPO" add .
git -C "$FIXTURE_REPO" commit -qm baseline
printf 'metro change\n' >"$FIXTURE_REPO/packages/happy-app/sources/components/Fixture.tsx"

HAPPY_REPO="$FIXTURE_REPO" \
HAPPY_DEVTOOLS_STATE_DIR="$TEMP_ROOT/state" \
  "$ROOT/happyctl" mobile-plan --platform ios --base HEAD --json >"$TEMP_ROOT/plan.json"

node - "$TEMP_ROOT/plan.json" <<'NODE'
const fs = require('node:fs');
const plan = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
if (plan.schemaVersion !== 1) throw new Error('unexpected schema');
if (plan.plan !== 'metro-only') throw new Error(`unexpected plan: ${plan.plan}`);
if (plan.platform !== 'ios' || plan.profile !== 'personal') throw new Error('unexpected target');
if (!plan.dirty || !plan.dirtySourceDigest.startsWith('sha256:')) throw new Error('missing dirty provenance');
if (plan.stagedPaths.length !== 0) throw new Error('unexpected staged provenance');
if (!plan.unstagedPaths.includes('packages/happy-app/sources/components/Fixture.tsx')) throw new Error('missing unstaged provenance');
if (plan.indexWorktreeDivergentPaths.length !== 0) throw new Error('unexpected index/worktree divergence');
NODE

HAPPY_REPO="$FIXTURE_REPO" \
HAPPY_DEVTOOLS_STATE_DIR="$TEMP_ROOT/state" \
  "$ROOT/happyctl" mobile-plan --platform android --base HEAD >"$TEMP_ROOT/plan.txt"
grep -F 'Mobile build plan: metro-only' "$TEMP_ROOT/plan.txt" >/dev/null
grep -F 'No build, update, submission, installation, or report was performed.' "$TEMP_ROOT/plan.txt" >/dev/null

if HAPPY_REPO="$FIXTURE_REPO" "$ROOT/happyctl" mobile-plan --platform windows >"$TEMP_ROOT/invalid.out" 2>&1; then
  echo "Expected an unsupported platform to fail" >&2
  exit 1
fi
grep -F 'requires --platform ios or android' "$TEMP_ROOT/invalid.out" >/dev/null

printf 'packages: []\n' >"$FIXTURE_REPO/pnpm-workspace.yaml"
if HAPPY_REPO="$FIXTURE_REPO" \
  HAPPY_MOBILE_PNPM_CMD="$TEMP_ROOT/eas-must-not-run" \
  "$ROOT/happyctl" mobile-plan --platform ios --profile preview --base HEAD \
  >"$TEMP_ROOT/invalid-profile.out" 2>&1; then
  echo "Expected an unsupported profile to fail" >&2
  exit 1
fi
grep -F 'Unsupported mobile EAS profile: preview' "$TEMP_ROOT/invalid-profile.out" >/dev/null

# A native path staged in the index but restored only in the worktree must fail
# closed before the configured EAS command can run.
printf '{"name":"staged-native-change"}\n' >"$FIXTURE_REPO/package.json"
git -C "$FIXTURE_REPO" add package.json
printf '{"name":"fixture"}\n' >"$FIXTURE_REPO/package.json"
HAPPY_REPO="$FIXTURE_REPO" \
HAPPY_MOBILE_PNPM_CMD="$TEMP_ROOT/eas-must-not-run" \
HAPPY_DEVTOOLS_STATE_DIR="$TEMP_ROOT/state" \
  "$ROOT/happyctl" mobile-plan --platform ios --base HEAD --json >"$TEMP_ROOT/divergent.json"
node - "$TEMP_ROOT/divergent.json" <<'NODE'
const fs = require('node:fs');
const plan = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
if (plan.plan !== 'native-rebuild' || plan.fingerprint !== null) throw new Error('native divergence did not fail closed');
if (!plan.indexWorktreeDivergentPaths.includes('package.json')) throw new Error('missing native divergence provenance');
if (!plan.reasons.some((reason) => reason.includes('differ between the Git index and worktree'))) throw new Error('missing divergence reason');
NODE

echo "happyctl mobile plan smoke passed"
