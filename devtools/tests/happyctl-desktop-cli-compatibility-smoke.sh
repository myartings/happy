#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEMP_ROOT="$(mktemp -d -t happyctl-desktop-cli-compatibility-XXXXXX)"
trap 'rm -rf "$TEMP_ROOT"' EXIT

# Load the public command without running an operational action.
# shellcheck disable=SC1091
source "$REPO_ROOT/devtools/happyctl" help >/dev/null
ORIGINAL_VERIFY_RPC="$(declare -f verify_workspace_cli_rpc_compatibility)"
ORIGINAL_VERIFY_DAEMON="$(declare -f verify_workspace_cli_daemon)"
ORIGINAL_VERIFY_IDENTITY="$(declare -f verify_workspace_cli_install_identity)"
ORIGINAL_INSTALLED_BUNDLE="$(declare -f installed_happy_cli_bundle_path)"
ORIGINAL_INSTALLED_EXECUTABLE="$(declare -f installed_happy_cli_executable_path)"

HAPPY_DEVTOOLS_REPORT_DIR="$TEMP_ROOT/dry-run-reports"
HAPPY_DEVTOOLS_BACKUP_DIR="$TEMP_ROOT/dry-run-backups"
dry_run_output="$(refresh_desktop --dry-run --force)"
grep -F 'workspace Happy CLI' <<<"$dry_run_output" >/dev/null
grep -F 'restart the local daemon' <<<"$dry_run_output" >/dev/null
grep -F 'list-saved-projects' <<<"$dry_run_output" >/dev/null
grep -F 'No changes made.' <<<"$dry_run_output" >/dev/null
[[ ! -e "$HAPPY_DEVTOOLS_REPORT_DIR" ]]
[[ ! -e "$HAPPY_DEVTOOLS_BACKUP_DIR" ]]

fixture_repo="$TEMP_ROOT/repo"
mkdir -p "$fixture_repo"
git -C "$fixture_repo" init -q -b dev
git -C "$fixture_repo" config user.name "Happyctl Test"
git -C "$fixture_repo" config user.email "happyctl-test@example.invalid"
printf 'fixture\n' >"$fixture_repo/source.txt"
git -C "$fixture_repo" add source.txt
git -C "$fixture_repo" commit -qm fixture

HAPPY_REPO="$fixture_repo"
HAPPY_DEVTOOLS_FINAL_BRANCH=dev
INSTALL_APP="$TEMP_ROOT/Happy (dev).app"
HAPPY_DEVTOOLS_REPORT_DIR="$TEMP_ROOT/reports"
TRACE_FILE="$TEMP_ROOT/trace"
REPORT_ARGS="$TEMP_ROOT/report-args"
RPC_COMPATIBLE=1
FAIL_STAGE=""

trace() { printf '%s\n' "$1" >>"$TRACE_FILE"; }
report_value() {
  awk -v key="$1" '$0 == key { getline; print; exit }' "$REPORT_ARGS"
}
doctor() { :; }
happy_patch_stack_state() { printf '0|0|0|0|0\n'; }
show_patch_stack_state() { :; }
validate_base_branch_for_refresh() { :; }
sync_patch_stack_locally() { :; }
push_patch_stack() { :; }
current_happy_commit() { git -C "$HAPPY_REPO" rev-parse HEAD; }
happy_cli_version_without_exec() { printf 'happy@fixture\n'; }
happy_daemon_pid() { printf '202\n'; }
build_desktop() { trace desktop-build; }
build_workspace_cli() { trace cli-build; [[ "$FAIL_STAGE" != cli-build ]]; }
install_workspace_cli() {
  trace cli-install
  [[ "$FAIL_STAGE" != cli-install ]] || return 23
}
verify_workspace_cli_daemon() {
  trace daemon-running
  [[ "$FAIL_STAGE" != daemon ]] || return 24
}
verify_workspace_cli_rpc_compatibility() {
  trace rpc-compatibility
  [[ "$RPC_COMPATIBLE" -eq 1 && "$FAIL_STAGE" != rpc ]] || {
    [[ "$FAIL_STAGE" != rpc ]] || return 25
    return 1
  }
}
install_desktop() { trace desktop-install; }
remove_old_desktop_backups() { trace backup-retention; }
verify_desktop() { trace desktop-verify; }
launch_desktop() { trace desktop-launch; }
write_update_report() { printf '%s\n' "$@" >"$REPORT_ARGS"; }

: >"$TRACE_FILE"
refresh_desktop --force
cat >"$TEMP_ROOT/expected-success" <<'EOF'
desktop-build
cli-build
cli-install
daemon-running
rpc-compatibility
desktop-install
backup-retention
desktop-verify
desktop-launch
EOF
cmp "$TEMP_ROOT/expected-success" "$TRACE_FILE"
[[ "$(report_value 'Status')" == success ]]
[[ "$(report_value 'Built workspace CLI')" == true ]]
[[ "$(report_value 'Installed workspace CLI')" == true ]]
[[ "$(report_value 'Daemon restarted')" == true ]]
[[ "$(report_value 'Daemon PID before')" == 202 ]]
[[ "$(report_value 'Daemon PID after')" == 202 ]]
[[ "$(report_value 'CLI compatibility')" == true ]]

while IFS='|' read -r failure expected_stage expected_rc; do
  : >"$TRACE_FILE"
  FAIL_STAGE="$failure"
  RPC_COMPATIBLE=1
  set +e
  (refresh_desktop --force >/dev/null 2>&1)
  actual_rc=$?
  set -e
  if [[ "$actual_rc" -eq 0 ]]; then
    echo "refresh-desktop accepted failed stage: $failure" >&2
    exit 1
  fi
  [[ "$actual_rc" -eq "$expected_rc" ]]
  [[ "$(report_value 'Status')" == failed ]]
  [[ "$(report_value 'Failed stage')" == "$expected_stage" ]]
  [[ "$(report_value 'Error')" == "refresh failed at $expected_stage with exit code $expected_rc" ]]
  if grep -Eq '^desktop-(install|verify|launch)$' "$TRACE_FILE"; then
    echo "refresh-desktop touched the Desktop after failed stage: $failure" >&2
    exit 1
  fi
done <<'EOF'
cli-build|build workspace CLI|1
cli-install|install workspace CLI|23
daemon|restart local daemon|24
rpc|verify CLI compatibility|25
EOF

: >"$TRACE_FILE"
FAIL_STAGE=""
RPC_COMPATIBLE=0
if (refresh_desktop --force >/dev/null 2>&1); then
  echo "refresh-desktop accepted an installed CLI without list-saved-projects" >&2
  exit 1
fi
grep -Fx 'rpc-compatibility' "$TRACE_FILE" >/dev/null
if grep -Eq '^desktop-(install|verify|launch)$' "$TRACE_FILE"; then
  echo "refresh-desktop touched the Desktop after RPC compatibility failed" >&2
  exit 1
fi
[[ "$(report_value 'Failed stage')" == 'verify CLI compatibility' ]]
[[ "$(report_value 'CLI compatibility')" == false ]]

: >"$TRACE_FILE"
RPC_COMPATIBLE=1
refresh_desktop >/dev/null
[[ ! -s "$TRACE_FILE" ]]
[[ "$(report_value 'Status')" == skipped-no-upstream-update ]]
[[ -z "$(report_value 'Failed stage')" ]]

compatible_dist="$TEMP_ROOT/compatible-dist"
incompatible_dist="$TEMP_ROOT/incompatible-dist"
mkdir -p "$compatible_dist" "$incompatible_dist"
printf "export * from './rpc-chunk.mjs';\n" >"$compatible_dist/index.mjs"
printf "registerHandler('list-saved-projects', handler);\n" >"$compatible_dist/rpc-chunk.mjs"
printf "export * from './rpc-chunk.mjs';\n" >"$incompatible_dist/index.mjs"
printf "registerHandler('list-workspace-projects', handler);\n" >"$incompatible_dist/rpc-chunk.mjs"
eval "$ORIGINAL_VERIFY_RPC"
installed_happy_cli_bundle_path() { printf '%s/index.mjs\n' "$FIXTURE_DIST"; }

FIXTURE_DIST="$compatible_dist"
verify_workspace_cli_rpc_compatibility >/dev/null

FIXTURE_DIST="$incompatible_dist"
if verify_workspace_cli_rpc_compatibility >"$TEMP_ROOT/missing-rpc.out" 2>&1; then
  echo "CLI compatibility verifier accepted a bundle without list-saved-projects" >&2
  exit 1
fi
grep -F 'list-saved-projects is missing' "$TEMP_ROOT/missing-rpc.out" >/dev/null

find_failure_bin="$TEMP_ROOT/find-failure-bin"
mkdir -p "$find_failure_bin"
cat >"$find_failure_bin/find" <<'EOF'
#!/usr/bin/env bash
exit 26
EOF
chmod +x "$find_failure_bin/find"
FIXTURE_DIST="$compatible_dist"
set +e
PATH="$find_failure_bin:$PATH" verify_workspace_cli_rpc_compatibility >/dev/null 2>&1
find_failure_rc=$?
set -e
if [[ "$find_failure_rc" -ne 26 ]]; then
  echo "RPC verifier did not preserve find exit 26 (got $find_failure_rc)" >&2
  exit 1
fi

eval "$ORIGINAL_VERIFY_IDENTITY"
eval "$ORIGINAL_INSTALLED_BUNDLE"
eval "$ORIGINAL_INSTALLED_EXECUTABLE"
eval "$ORIGINAL_VERIFY_DAEMON"
for npm_root_consumer in \
  verify_workspace_cli_install_identity \
  installed_happy_cli_bundle_path \
  installed_happy_cli_executable_path \
  verify_workspace_cli_daemon \
  verify_workspace_cli_rpc_compatibility; do
  set +e
  (npm() { return 27; }; "$npm_root_consumer") >/dev/null 2>&1
  npm_root_rc=$?
  set -e
  if [[ "$npm_root_rc" -ne 27 ]]; then
    echo "$npm_root_consumer did not preserve npm root exit 27 (got $npm_root_rc)" >&2
    exit 1
  fi
done

eval "$ORIGINAL_VERIFY_DAEMON"
require_cmd() { :; }
exact_cli="$TEMP_ROOT/npm-root/happy/bin/happy.mjs"
mkdir -p "${exact_cli%/*}" "$TEMP_ROOT/decoy-bin"
printf 'fixture\n' >"$exact_cli"
printf '#!/usr/bin/env bash\nexit 99\n' >"$TEMP_ROOT/decoy-bin/happy"
chmod +x "$TEMP_ROOT/decoy-bin/happy"
PATH="$TEMP_ROOT/decoy-bin:$PATH"
DAEMON_COMMANDS="$TEMP_ROOT/daemon-commands"
CURRENT_DAEMON_PID=303
installed_happy_cli_executable_path() { printf '%s\n' "$exact_cli"; }
run() {
  printf '%s\n' "$*" >>"$DAEMON_COMMANDS"
  if [[ "$*" == *' daemon start' ]]; then
    CURRENT_DAEMON_PID=404
  fi
}
happy_daemon_pid() { printf '%s\n' "$CURRENT_DAEMON_PID"; }

verify_workspace_cli_daemon >/dev/null
grep -Fx "node $exact_cli daemon stop" "$DAEMON_COMMANDS" >/dev/null
grep -Fx "node $exact_cli daemon start" "$DAEMON_COMMANDS" >/dev/null
if grep -Eq '(^| )happy daemon' "$DAEMON_COMMANDS"; then
  echo "daemon verifier used the PATH-resolved decoy Happy CLI" >&2
  exit 1
fi

CURRENT_DAEMON_PID=303
run() { printf '%s\n' "$*" >>"$DAEMON_COMMANDS"; }
if verify_workspace_cli_daemon >"$TEMP_ROOT/same-daemon.out" 2>&1; then
  echo "daemon verifier accepted an unreplaced post-install PID" >&2
  exit 1
fi
grep -F 'PID is still 303' "$TEMP_ROOT/same-daemon.out" >/dev/null

INSTALL_LOCAL_TRACE="$TEMP_ROOT/install-local-trace"
INSTALL_LOCAL_BIN="$TEMP_ROOT/install-local-bin"
mkdir -p "$INSTALL_LOCAL_BIN"
for command_name in happy npm pnpm; do
  command_path="$INSTALL_LOCAL_BIN/$command_name"
  cat >"$command_path" <<EOF
#!/usr/bin/env bash
printf '%s\\n' "$command_name \$*" >>'$INSTALL_LOCAL_TRACE'
[[ '$command_name' == npm ]]
EOF
  chmod +x "$command_path"
done
PATH="$INSTALL_LOCAL_BIN:$PATH" node "$REPO_ROOT/packages/happy-cli/scripts/install-local.cjs" --link-only >/dev/null
grep -Fx 'npm link' "$INSTALL_LOCAL_TRACE" >/dev/null
if grep -Eq '^(happy|pnpm) ' "$INSTALL_LOCAL_TRACE"; then
  echo "link-only installer invoked build or PATH-resolved daemon commands" >&2
  exit 1
fi

echo "Happyctl Desktop/CLI compatibility smoke tests passed"
