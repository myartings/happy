# Decisions: `happy-desktop-official-release`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Where does the workflow live? | accepted | `AGENTS.md` contains only routing/invariants; `.agents/skills/happy-desktop-official-release/` holds agent procedure; `devtools/happyctl` owns executable behavior. |
| D2 | What does “official release” mean here? | accepted | A local official-baseline macOS app built from validated `main`; public distribution/notarization is out of scope. |
| D3 | How is source isolated? | accepted | Use detached `.baseline/worktree/official-main`; never switch the active development worktree. |
| D4 | Can it replace the dev client? | accepted | No. Use `Happy (official baseline).app` and `com.slopus.happy.official-baseline`. |
| D5 | How is release safety enforced? | accepted | Fail closed on dirty/divergent source, stable-sign only, backup before replacement, verify before launch, and never push. |
