# Decisions: `codex-visual-theme`

| ID | Question | Status | Decision/evidence |
| --- | --- | --- | --- |
| D1 | Is Codex a functional or visual reference? | decided | Visual reference only; Happy functionality and information architecture remain authoritative. |
| D2 | Does the theme replace the existing appearance setting? | decided | No. `visualStyle` is independent from `adaptive/light/dark`. |
| D3 | Is the screenshot geometry copied literally? | decided | No. Preserve Happy macro layout; translate color, type, shape, shadow, icon treatment, and safe micro-spacing. |
| D4 | Which font family is authoritative? | decided | Static Codex evidence resolves the screenshot ambiguity: Geist/Inter for UI and Geist Mono/platform mono for code. |
| D5 | Can the light-only evidence support a public complete theme? | decided | No. A development preview may proceed, but dark and representative states are required before public exposure. |
| D6 | Can the private Codex screenshot be committed? | decided | No. Keep it in the Shared Directory and record its hash and local path only. |
| D7 | Is Codex visually flat? | decided | No. Components are quiet, but regions and temporary surfaces form an explicit multi-level hierarchy. |
| D8 | Is the sidebar color universal? | decided | No. Shared content surfaces are stable; platform chrome may adapt to macOS or Windows with an opaque fallback. |
| D9 | Are composer and popovers the same elevation? | decided | No. Composer is persistent elevated interaction; popovers are temporary floating surfaces with broader separation and cross-region occlusion. |
| D10 | Should Web popovers dim the page? | decided | No. Observed contextual popovers have no visible scrim; retain only a transparent outside-dismiss hit target. |
| D11 | Are menu variants separate visual components? | decided | No. Three runtime examples establish one recurring floating shell with content and placement variants. |
| D12 | Is a universal accent value proven? | decided | No. macOS, Windows, and static samples differ; keep a semantic role until matched color-managed verification. |
