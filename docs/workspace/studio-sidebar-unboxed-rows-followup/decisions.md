# Decisions: `studio-sidebar-unboxed-rows-followup`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Is the first implementation accepted? | decided | No. The revision-2 packaged screenshot visibly reconstructs the group card and fails acceptance. |
| D2 | Which style source is authoritative in the sidebar? | decided | The resolved `DesktopSidebarFrame.visualStyle` already passed into `SidebarView`. |
| D3 | What chrome may an ordinary Studio row retain? | decided | No surface, group-position radius, clipping, or divider; existing spacing and content geometry remain. |
| D4 | What chrome may a selected row retain? | decided | The existing bounded local selected fill and Studio corner radius. |
| D5 | Who closes visual acceptance? | decided | Parent rebuilds/captures; user accepts or requests another revision. |
