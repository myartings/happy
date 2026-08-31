---
name: diagnose
description: Diagnose build, test, runtime, integration, or behavioral failures from evidence before applying fixes. Use when root cause is unknown, an attempted fix failed, symptoms cross boundaries, or the same problem has recurred.
---

# Diagnose Failure

## Redact evidence

Before displaying or recording diagnostic commands, output, or captured
artifacts, replace credentials, tokens, cookies, authorization headers, and
other secrets with `<REDACTED>`. Keep credentials in environment variables, not
command arguments or copied transcripts. Captures can contain authentication
headers; quote or retain only the signal lines needed for diagnosis.

If redacted evidence is insufficient, ask the user for a narrower redacted
artifact, redacted command output, or explicitly authorized access. Do not ask
them to expose a secret to make diagnosis easier.

## Workflow

When a separate diagnosis context is useful, dispatch the direct `diagnoser`
agent type. Its static default is Sol Medium and it remains read-only. The
parent retains acceptance, risk, and fix authorization; do not ask the user to
choose a model for this child.

1. Read applicable project context and nearby ADRs, then establish one named tight feedback loop before forming a code theory. Run it and prove it is red-capable
   for the user's exact symptom, fast enough to repeat, and Agent-runnable.
2. Make the loop deterministic. For a nondeterministic failure, use a fixed
   attempt count, raise the reproduction rate where possible, and pin the
   observed rate as the comparison baseline.
3. If no red-capable loop can be built, stop. Record attempted signals and ask
   for the smallest missing input: environment access, a narrower redacted
   artifact, or permission for tagged temporary instrumentation.
4. Reproduce the exact symptom repeatedly, then minimise one element at a time
   until every remaining element is load-bearing. Keep that broader loop for
   final verification.
5. Separate facts from assumptions and trace inputs, state, boundaries, and
   outputs. Record three to five ranked, falsifiable hypotheses with their
   predictions; show the list as a non-blocking user checkpoint for cheap
   domain re-ranking.
6. Test the leading hypothesis with the cheapest discriminating probe. Name the
   prediction and change one variable. Prefer targeted instrumentation and tag
   every temporary probe for cleanup.
7. For a performance regression, record a measured baseline and use profiling
   or bisection instead of broad logging.
8. Identify root cause before patching. Add a regression test only at a seam that reproduces the real bug pattern.
   If no valid seam exists, record the
   architecture gap and keep the deterministic loop instead of adding a shallow
   test.
9. Implement the narrow fix, then rerun both the regression signal and the original unminimised loop.
   Remove tagged instrumentation and throwaway
   artifacts; record the actual cause and any architectural prevention
   opportunity.

After two unsuccessful fix attempts, stop editing, summarize evidence and
failed hypotheses, and keep the read-only diagnosis route separate. If the
current Root is Luna, state why the repeated-failure boundary now needs Sol,
recommend `gpt-5.6-sol` and the appropriate effort, and ask the operator to use
`/model` plus `/status`. Continue in place only after visible confirmation;
otherwise require a fresh suitable Root for the same accepted task, branch, and
worktree. A diagnosis or Sol subagent never counts as a Root-model change.
