# Context: `codex-first-happy-client-dev-integration`

PR [#78](https://github.com/myartings/happy/pull/78) contains the accepted
Codex-first Windows delivery at
`e9c76eee00aa7320b0881a75a19f450993601773`. A fresh fetch places
`origin/dev` at `68cfb6f915fb25f5ecd444df2aefafeccae92fa8`, 19 commits ahead of the
common ancestor `a269068ab42316a6e5749882cd81499aeb31fabb`. GitHub reports the
PR as `CONFLICTING`.

`git merge-tree --write-tree --name-only --messages HEAD origin/dev` predicts
two textual conflicts: `docs/PRD.md` and `docs/workspace/archive.md`. It
auto-merges `devtools/happyctl` and
`packages/happy-app/sources/app/(app)/new/index.tsx`, but the broader incoming
history changes workflow infrastructure, Session transport, New Session project
discovery, Windows tooling, mobile build planning, and overlapping App seams.
Textual cleanliness therefore does not substitute for semantic validation.

## Implementation context

- Preserve the original Codex-first specification and workflow evidence.
- Treat the current `origin/dev` tree and merged PRs #64, #65, #66, #67, #68,
  #73, and #77 as the target-side primary sources.
- Resolve documents as a lossless union; keep archive rows chronological and
  make product edits only after an integration-specific RED test.

## Verification context

- Verify against both pinned parents and the combined candidate.
- Use the merged `.ai/project.json` and workflow tooling after the merge.
- Add relevant CLI/wire and native Windows signals because those current-`dev`
  behaviors are not fully represented by the default App/Server profile.

## Notes

- The user authorized a normal merge, conflict resolution, complete validation,
  and updating PR #78. They did not authorize merging the PR, installing a new
  client, intentional rollback, signing, publication, or release.
