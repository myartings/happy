# Decisions: `worktree-mobile-build-optimization`

## D1 — What do the three planner states prove?

- Status: resolved.
- Owner: repository/operator contract.
- Options: path-only heuristic; fingerprint-only cloud lookup; conservative
  fast path followed by exact fingerprint lookup.
- Decision: use a conservative path-only `metro-only` fast path. For any
  native-sensitive path, generate the native fingerprint and require a finished
  EAS build matching platform, profile, channel, and fingerprint, with a build
  ID, HTTPS artifact URL, and no elapsed reported expiry, for `reuse-artifact`.
  Otherwise return `native-rebuild`.
- Evidence: Expo/EAS exposes exact fingerprint filtering; false reuse is more
  expensive and riskier than a conservative rebuild recommendation.
- Reversibility/cost of error: easily refinable allowlist; a false negative
  costs build time, while a false positive can install an incompatible binary.

## D2 — How is dynamic build provenance removed from native fingerprints?

- Status: resolved.
- Owner: native compatibility contract.
- Options: set constant environment values only in the planner; remove build
  metadata from the app; use Expo's supported source skip for `extra`.
- Decision: add `fingerprint.config.cjs` with
  `ExpoConfigExtraSection`. `extra` is JavaScript/OTA configuration and should
  not define native binary compatibility; native config and assets remain.
- Evidence: controlled fingerprint runs showed the commit timestamp alone
  changed the old fingerprint, and the installed Expo fingerprint package
  explicitly supports this source skip.
- Reversibility/cost of error: reversible configuration; historical artifacts
  will not match the new normalized baseline, causing one intentional rebuild.

## D3 — Must every report download the artifact to hash it?

- Status: resolved.
- Owner: operator cost policy.
- Options: always download; never hash; explicit opt-in streaming hash.
- Decision: always record the artifact URL and an artifact-hash field, but only
  stream/download and calculate SHA-256 when `--hash-artifact` is supplied.
  Otherwise record why it was not computed.
- Evidence: EAS build JSON does not expose a binary digest; automatic hashing
  would add a full IPA/APK download to every build and undermine the stated
  cost goal.
- Reversibility/cost of error: flag behavior is additive; silent downloads
  impose recurring time/bandwidth cost.

## D4 — What Android parity is in this slice?

- Status: resolved.
- Owner: existing devtools architecture.
- Options: build/status only; mirror every iOS command including submission;
  mirror supported operations and omit unsupported submission.
- Decision: add Android doctor, internal/store build, OTA, and build status in
  Unix `happyctl`. Do not add Play submission because `eas.json` has no Android
  submit contract. PowerShell parity is not part of the existing mobile release
  surface and remains out of scope.
- Evidence: current personal submit profile contains only iOS App Store Connect
  configuration; all existing personal mobile commands/tests are in Bash.
- Reversibility/cost of error: additive command surface; inventing submission
  settings could target the wrong store identity.

## D5 — How should dependency reuse work across worktrees?

- Status: resolved.
- Owner: package-manager correctness.
- Options: share `node_modules`; share pnpm virtual store; run normal pnpm install
  backed by its content-addressable store.
- Decision: migrate settings to `pnpm-workspace.yaml` and retain normal per-
  worktree linking. Do not symlink `node_modules` or a virtual store.
- Evidence: pnpm 10 already reuses downloaded package content while each
  worktree retains an independently valid dependency graph.
- Reversibility/cost of error: normal install is safe; shared mutable links can
  make branch-specific dependency state nondeterministic.

## D6 — Where may real mobile release actions run?

- Status: resolved.
- Owner: repository release invariant.
- Decision: planning and dry-runs may run in feature worktrees. Real EAS build,
  update, or submit actions continue to require a clean configured `dev`
  checkout and authenticated personal identity. This implementation itself will
  run none of them.
- Evidence: existing iOS guard and repository personal branch model.
- Reversibility/cost of error: hard guard is reversible in code; relaxing it
  can spend EAS capacity or publish unintegrated source.

## D7 — What proves a cloud build action succeeded?

- Status: resolved.
- Owner: release-safety and audit contract.
- Decision: keep the process outcome and raw EAS status/dimensions separate. A
  build succeeds only when the command exits zero, EAS reports `FINISHED`, and
  returned platform/profile/channel match the request. The original process
  exit/outcome, raw EAS fields, and effective result remain distinct. Every
  other combination fails while retaining returned evidence in the report.
- Evidence: EAS JSON and process exit can disagree; caller-supplied dimensions
  alone cannot prove which build the response describes.
- Reversibility/cost of error: additive report fields are reversible; false
  success can promote or hash the wrong/failed artifact.

## D8 — How do native image classifications stay aligned with Expo config?

- Status: resolved.
- Owner: native compatibility contract.
- Decision: store native icon, notification, and splash image paths in
  `packages/happy-app/native-assets.cjs`; both Expo config and the planner
  consume it, and planner tests classify every manifest entry as native.
- Evidence: duplicating those strings allowed future config additions to be
  misclassified as Metro-only.
- Reversibility/cost of error: the indirection preserves generated Expo config;
  a drifted allowlist could incorrectly reuse an incompatible binary.

## D9 — What evidence survives an unparseable EAS response?

- Status: resolved.
- Owner: release audit contract.
- Decision: every build report records the exact response byte count and
  SHA-256 before the temporary JSON file is removed. Parseable responses also
  retain each available structured field even if other success fields are
  absent; malformed response bodies are not copied wholesale.
- Evidence: replacing malformed JSON with `n/a` alone cannot bind a diagnostic
  report to the response that caused it.
- Reversibility/cost of error: two small fields add negligible cost; retaining
  full responses indefinitely would increase local data exposure and storage.

## D10 — How does one fingerprint represent Git index/worktree divergence?

- Status: resolved.
- Owner: native compatibility contract.
- Decision: it does not. When the same native-sensitive path differs between
  index and worktree, return `native-rebuild` before fingerprint or EAS lookup.
  Worktree differences include ordinary unstaged changes and an untracked
  recreation of a path staged for deletion.
- Evidence: Expo fingerprints the filesystem, not the staged blob; using that
  hash to represent both states can falsely reuse an artifact. A real Git
  tracer showed staged-delete/untracked-recreation is not reported as an
  ordinary unstaged diff and must be detected explicitly.
- Reversibility/cost of error: this conservative case costs only an occasional
  rebuild recommendation; false reuse can install an incompatible binary.

## D11 — How are previously unknown changed paths classified?

- Status: resolved.
- Owner: planner safety contract.
- Decision: unknown paths are native-sensitive by default. Ignore only explicit
  documentation, devtools, repository-AI metadata, and non-mobile package
  prefixes; package manifests remain native-sensitive regardless of prefix.
  Preserve Git-returned separators because a backslash is a valid POSIX
  filename byte and must not be rewritten into an allowlisted prefix.
- Evidence: root build hooks such as `scripts/postinstall.cjs` can mutate native
  dependencies even though they are outside the mobile package, and the
  `docs\\postinstall.cjs` tracer demonstrated the separator-spoofing failure.
- Reversibility/cost of error: the unrelated allowlist can be refined with
  evidence; a false negative is more dangerous than extra fingerprint work.

## D12 — How is optional artifact hashing contained?

- Status: resolved.
- Owner: network/data safety contract.
- Decision: validate a credential-free HTTPS URL, constrain curl's initial and
  redirect protocols to HTTPS, never save downloaded bytes, and install
  exit/signal cleanup immediately after creating the temporary EAS response.
- Evidence: EAS response fields are external input and report/hash failures can
  otherwise leave signed artifact URLs in temporary storage.
- Reversibility/cost of error: controls are local and low-cost; permissive
  schemes or leaked response files widen the release workflow's trust boundary.

## D13 — How do real-build prerequisites propagate through Bash callers?

- Status: resolved.
- Owner: release-safety invariant.
- Decision: every configuration, clean-tree, branch-resolution, and EAS-auth
  prerequisite returns explicitly from `mobile_require_release_ready`; never
  rely on `set -e` inside that function.
- Evidence: Bash disables errexit within a function invoked from an OR-list. A
  RED tracer showed a failed local-configuration check could be masked by later
  successes; GREEN tests configuration and clean-tree failures and proves the
  EAS boundary remains uncalled.
- Reversibility/cost of error: explicit propagation is local and preserves the
  command interface; masking a failure can spend cloud capacity on unvalidated
  source or identity.

## D14 — How are renamed paths classified conservatively?

- Status: resolved.
- Owner: planner safety contract.
- Decision: disable rename folding for committed, staged, and unstaged Git
  diffs so both source and destination names enter classification.
- Evidence: Git `--name-only` normally reports only a detected rename's
  destination. Real-Git tracers showed a native app config renamed under
  `docs/` lost its native source until `--no-renames` was applied in all three
  states.
- Reversibility/cost of error: reporting two paths is a small conservative cost;
  omitting the native deletion can incorrectly select `metro-only`.

## D15 — Which final-check states may enter independent review?

- Status: resolved.
- Owner: documented check/review/finish lifecycle contract plus explicit user
  gap acceptance.
- Decision: `review-conclusion` accepts only `check=passed` or
  `check=accepted_gaps`. The latter must be recorded through `check-receipt`
  against the final complete structured run, must contain at least one failed
  command, and retains the run fingerprint plus exact staged-candidate identity.
  The generic gate cannot declare either successful state. `pending` and
  `blocked` remain ineligible, while required-workflow validation rejects
  `not_required` before review. Finish and staged CI may waive only the expected
  command-failure result. Structured evidence accepts only `passed` with zero
  exit and no reuse source, `reused` with zero exit plus valid successful source
  provenance, or exact `failed (N)` text matching a nonzero exit and no reuse
  source. Incomplete evidence, stale configuration/command set, candidate drift,
  package mismatch, missing axes, and archive drift still fail.
- Evidence: the check and finish skills explicitly allow named accepted gaps,
  while the previous hard-coded equality rejected the accepted Studio baseline
  and prevented persistence of otherwise valid independent review conclusions.
  One public CLI tracer fails before and passes after the bounded review
  predicate change; a second fails on the missing structured receipt status and
  then passes through review, finish, archive, and both staged CI boundaries. A
  review-driven adversarial tracer proves `failed (0)` could previously relabel
  an all-passing run, then proves canonical parsing rejects the same tamper at
  receipt, finish, and archived staged-CI boundaries.
- Reversibility/cost of error: the bounded state/check/CI policy is locally
  reversible. An unbound or over-broad waiver could bypass deterministic
  verification, so passing runs cannot be mislabeled as gaps and no other state
  is admitted.
