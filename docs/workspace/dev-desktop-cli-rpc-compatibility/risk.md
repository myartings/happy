# Risk Assessment: `dev-desktop-cli-rpc-compatibility`

## Result

Cleared with controls. The implementation changes a local executable link,
restarts the user's daemon, and later replaces the personal Dev `.app`. These
operations are consequential but local, directly observable, and recoverable;
the Slice remains Feature intensity with a required risk gate.

## Affected systems and blast radius

- The user's globally resolved local `happy` CLI, its background daemon, and
  currently connected local Happy sessions.
- The personal Happy Dev `.app` and its existing external backup directory.
- Personal `main`/`dev` synchronization during the eventual real refresh.
- No server schema, authentication material, public npm package, production
  deployment, or other user's runtime is changed.

## Failure modes

1. CLI build or local installation fails after the old daemon stops.
2. A daemon start command returns without a usable daemon.
3. Source contains the RPC while the installed compiled bundle does not.
4. Desktop replacement occurs before compatibility is proven.
5. A later Desktop failure leaves new CLI with old Desktop.
6. Dry-run mutates Git, executables, processes, reports, or backups.
7. Report aggregation hides which stage failed or falsely records success.
8. Shared helper changes accidentally alter Linux, Windows, or official-baseline behavior.
9. A different Node/npm installation puts one `happy` on `PATH` while the RPC
   verifier scans another global package, falsely claiming compatibility.

## Required controls

- Use the existing local installer, which builds before stop/link/start and
  retains its normal composite behavior for direct use; happyctl uses its
  link-only mode after a separate build so daemon lifecycle cannot resolve via
  PATH or be misreported as installation.
- Require npm's installed package to realpath to the workspace package. Resolve
  both daemon executable and compiled bundle from it, invoke the executable by
  exact path, and reject a non-replaced post-install daemon PID.
- Complete both checks before Desktop backup/install/launch.
- Treat every nonzero stage as terminal; retain the exact exit code and failed
  stage in the report.
- Keep the existing installed Desktop backup and rollback behavior.
- Accept new CLI/old App as the only partial runtime because the retained old
  App remains compatible; never permit new App/unverified old CLI.
- Keep dry-run on a return-before-action path and prove fixture state unchanged.
- Use stubbed smoke tests before any real daemon/App mutation.
- Run independent review and applicable checks before the real forced refresh.

## Preconditions and stop conditions

- Stop if implementation requires npm publication, protected native paths,
  credentials, official-baseline changes, scanner fallback, or protocol changes.
- Stop real refresh if the delivery/push boundary is not explicitly authorized,
  Git guards or clean-branch preconditions fail, or the candidate is not the
  checked/reviewed implementation.
- Stop on CLI install, daemon health, RPC compatibility, Desktop build/install,
  verification, or launch failure; do not weaken checks to complete refresh.

## Rollback and recovery

- Before delivery, the bounded source diff is locally reversible without
  external effects.
- Desktop replacement keeps the existing `.app` backup and `rollback-desktop`
  path.
- The local CLI link is recoverable by rerunning the workspace `cli:install`;
  the documented upstream recovery remains `npm unlink -g happy && npm i -g
  happy@latest`, but this Slice does not run that network installation.
- A later Desktop failure preserves the compatible new CLI and previous backed
  up/installed Desktop; no data migration requires rollback.
