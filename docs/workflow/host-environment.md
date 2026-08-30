# Host environment boundary

## Decision

The workflow core is host-neutral at its durable boundaries. Linux, macOS, and
native Windows are supported hosts for daily verification with the same
workflow semantics, evidence contracts, and fail-closed submission gates.

- Linux and macOS use the supported POSIX route and enter repository Python
  commands through `python3`.
- Native Windows means PowerShell 7 (`pwsh`), Git for Windows, and Python 3.11
  or newer. Enter repository Python commands through `py -3` or `python`,
  according to the installed entrypoint.
- Configured commands use `{python}` as a repository-owned logical marker.
  `workflow-check.py` resolves it to the active `sys.executable` at execution
  time. It must never be pasted into a shell or replaced in Git with a
  machine-local executable path.
- A Python process that starts another repository Python process reuses
  `sys.executable`. Shell adapters resolve an available Python 3 entrypoint when
  they run and fail explicitly when none is usable.
- Ubuntu is the full-safety hosted lane. One bounded `windows-latest` smoke uses
  `actions/setup-python` and the native default shell for platform-sensitive
  public seams. First-class native Windows support does not require a real
  Windows device evidence matrix for every delivery, and it does not duplicate
  the full suite on macOS or Windows.

Core native-Windows support covers clean checkouts, linked worktrees,
configured validation and workflow tests, task/workflow state and review
tooling, and `workflow-ci.py --staged` / `--base <ref>`. It does not implement
the privileged `sync-template.py --apply` transaction on Windows; that remains
an explicitly unsupported operation rather than a partially executed one.

## Mandatory host-neutral invariants

The supported-host boundary does not weaken repository correctness. These
invariants apply on every supported execution route:

- Persisted repository identities use canonical repository-relative POSIX
  paths and reject traversal, absolute paths, aliases, and ambiguous forms.
- Git index, tree, and blob data are authoritative for staged and committed
  evidence; checkout transformations cannot redefine candidate identity.
- Git path lookup is literal and distinguishes inspection failure from genuine
  absence.
- Review, lifecycle, optimization, and submission evidence remains portable and
  deterministic once written.
- A candidate may not bypass a binding invariant merely because one host cannot
  run an applicable check locally.

Windows separators, drive aliases, CRLF checkout behavior, or interpreter names
may reveal a violation of these invariants. The resulting core defect remains
host-neutral; the reproducing platform is evidence, not product scope.

## Issue and dependency routing

Classify a host-related discovery before changing a Slice or dependency graph:

1. **Core invariant defect** — the behavior violates a mandatory invariant
   independently of the reproducing host. Keep a platform-neutral contract and
   verification seam. Examples include path traversal, Git pathspec aliasing,
   and using mutable checkout bytes where Git objects are authoritative.
2. **Host adapter defect** — the core contract is correct, but native execution
   requires host-specific interpreter, filesystem, shell, or path support. Keep
   it in an optional host-adapter Issue unless native support was explicitly
   accepted by the project.
3. **Execution or recovery problem** — an in-flight candidate is stranded on a
   host or in an immutable lifecycle state. Route recovery or transfer through
   the owning lifecycle boundary; do not fabricate an implementation dependency
   on a platform feature.

A native `blocked-by` edge is valid only when the downstream accepted contract
consumes an exact upstream artifact or cannot independently implement, verify,
and deliver on a supported route. File overlap, a preferred integration order,
the host that exposed a bug, and the location of an existing worktree are not
delivery dependencies.

## Downstream override

A downstream repository may accept additional host-specific product
requirements. Record the supported hosts and interpreter boundary in its
preserved `CONTEXT.md`, product/architecture contracts, and CI configuration.
The project then owns any additional platform-applicable fixtures and evidence
explicitly required by that contract; the generic template does not infer a
device or full-suite matrix.
