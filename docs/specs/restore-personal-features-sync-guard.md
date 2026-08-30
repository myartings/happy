# Personal Features Surface and Sync Guard

## Outcome

The personal Happy client provides an always-visible Settings entry for its
personal feature switches. Upstream synchronization stops before publishing or
installing a `dev` tree when that surface is lost.

## Behavior

1. The main Settings screen presents a Personal Features row independently of
   Developer Mode.
2. Activating the row opens a dedicated screen containing the current personal
   switches.
3. Each switch reads and writes the existing setting key, preserving current
   defaults and stored values.
4. Developer Tools may link to the dedicated screen but must not own a second
   copy of the controls.
5. Official experimental, appearance, input, and diagnostic controls remain in
   their upstream-owned locations.
6. After merging the patch stack into the final personal branch, synchronization
   validates the complete personal feature surface.
7. Validation failure returns non-zero before any push, desktop build, install,
   or launch step and identifies the missing invariant.

## Protected surface

The guard covers:

- the dedicated feature module;
- the Expo route delegating to it;
- the always-visible Settings navigation entry;
- Flat Session List;
- Side Chat Quick Panel;
- Project Todos;
- GitHub Issues;
- Needs Attention Sessions;
- Prompt History Navigator;
- Session Environment Labels;
- Enhanced Session Status Dots;
- global active-session sorting and date grouping;
- active-session runtime metadata;
- session model visibility;
- desktop session notifications.

## Compatibility and constraints

- No setting schema, key, default, or migration changes.
- No authentication, GitHub credential, session protocol, or server changes.
- The guard is deterministic and network-free.
- A failed guard may leave a local merge commit for repair, but it must not
  publish it or replace an installed client.
- Personal product files remain on `dev`; official `main` equivalence is
  unchanged.

## Acceptance and evidence

| Criterion | Evidence |
| --- | --- |
| Visible Settings entry and route delegation | Focused Happy App wiring test |
| One owner for all protected switches | Focused Happy App wiring test and source inspection |
| Existing Flat Session List runtime key remains connected | Existing focused wiring test |
| Guard accepts a complete surface | `happyctl` refresh-guard smoke fixture |
| Guard rejects missing module, route, entry, or key | Negative smoke fixtures |
| Guard runs before publication/build/install | Smoke inspection of the public sync function |
| No type regressions | `pnpm --filter happy-app typecheck` |
| Workflow and devtools consistency | Repository workflow checks and relevant smoke suite |

## Non-goals

- Reintroducing upstream's deleted experimental page.
- Redesigning switch labels or defaults.
- Publishing a PR, synchronizing branches, or installing the desktop client.
