# Decisions: `pinned-sessions-projects`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Where should preferences live? | accepted | Use the existing encrypted account Settings object so choices follow the user across devices; add flat string-array fields for forward compatibility. |
| D2 | How should pins interact with attention? | accepted | Permission-required attention remains first; pinning is the next stable ordering key and never suppresses unread or permission state. |
| D3 | What is a project favorite keyed by? | accepted | Use the existing `ProjectGroupData.id`, which is native Rig identity or Happy's stable machine/repository-derived identity. |
| D4 | How much project management should this add? | accepted | Only pin/favorite and ordering. No tags, folders, manual projects, or server entities. |
