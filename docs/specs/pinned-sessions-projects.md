# Pinned Sessions and Favorite Projects

## Goal

Let users keep important Happy work visible without introducing folders, tags,
or a separate task-management model.

## Acceptance criteria

1. A session can be pinned or unpinned from every existing session action menu.
2. Pinned sessions sort before ordinary sessions inside their existing section or
   project workspace, while permission-required attention remains the strongest
   priority.
3. A project can be favorited or unfavorited from its project-card header.
4. Favorite projects sort before ordinary projects inside the same source
   section (`Rig` or `Happy`) without changing source-section order.
5. Pin and favorite choices use the existing encrypted account settings path so
   they follow the user across Happy clients.
6. Pinned sessions and favorite projects have visible pin/star indicators and
   accessible labels.
7. Existing archive visibility, attention promotion, global-active ordering,
   project grouping, and settings forward compatibility continue to work.

## Boundaries

- No folders, tags, manual project creation, or new server entity.
- No change to session lifecycle, project identity, or Agent protocols.
- Stale saved IDs are tolerated and remain inert until explicitly toggled.
- This is a personal feature based on `dev`; it is not prepared as an upstream
  contribution in this workflow.

## Rollback

Remove the two settings fields and the display/action seams. Older and newer
clients already preserve unknown settings fields, so mixed-version clients do
not lose unrelated settings.
