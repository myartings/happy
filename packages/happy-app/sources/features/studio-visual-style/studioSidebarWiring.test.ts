import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
    return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Studio sidebar visual-style wiring', () => {
    it('carries the resolved sidebar frame style through the host seam to SessionsList', () => {
        const sidebarView = readSource('../../components/SidebarView.tsx');
        const mainView = readSource('../../components/MainView.tsx');
        const sessionsList = readSource('../../components/SessionsList.tsx');

        expect(sidebarView).toContain('sidebarVisualStyle={sidebarFrame?.visualStyle}');
        expect(mainView).toContain('<SessionsList sidebarVisualStyle={sidebarVisualStyle} />');
        expect(sessionsList).toContain('resolveSidebarSessionRowStyle({');
        expect(sessionsList).toContain('sidebarVisualStyle,');
    });

    it('routes compact and historical rows through the shared chrome policy', () => {
        const compactRows = readSource('../../components/ActiveSessionsGroupCompact.tsx');
        const historicalRows = readSource('../../components/SessionsList.tsx');

        expect(compactRows).toContain('resolveStudioSidebarRowChrome(sessionRowStyle');
        expect(historicalRows).toContain('resolveStudioSidebarRowChrome(sessionRowStyle');
        expect(compactRows).toContain('rowChrome.showDivider && styles.sessionRowWithBorder');
        expect(historicalRows).toContain('rowChrome.useDefaultContainerSurface && styles.sessionItemContainer');
        expect(historicalRows).toContain('rowChrome.useGroupPositionShape && (');
        expect(historicalRows).not.toMatch(/<View style=\{\[\s*styles\.sessionItemContainer,/);
        expect(compactRows).toContain('resolveStudioSidebarStateBackground(interactionPresentation');
        expect(historicalRows).toContain('resolveStudioSidebarStateBackground(interactionPresentation');
        expect(compactRows).toContain('borderRadius: sessionRowStyle.cornerRadius!');
        expect(historicalRows).toContain('borderRadius: sessionRowStyle.cornerRadius!');
        expect(compactRows).toContain('...interactionState.interactionProps');
        expect(historicalRows).toContain('...interactionState.interactionProps');
    });

    it('wires shared interaction state into Studio controls and overlay consumers', () => {
        const sidebar = readSource('../../components/SidebarView.tsx');
        const projects = readSource('../../components/ProjectGroup.tsx');
        const actions = readSource('../../components/SessionActionsPopover.tsx');
        const paletteItem = readSource('../../components/CommandPalette/CommandPaletteItem.tsx');
        const paletteInput = readSource('../../components/CommandPalette/CommandPaletteInput.tsx');

        expect(sidebar).toContain('newSessionState.interactionProps');
        expect(sidebar).toContain('archiveState.interactionProps');
        expect(sidebar).toContain('settingsState.interactionProps');
        expect(projects).toContain('headerInteraction.interactionProps');
        expect(projects).toContain('favoriteInteraction.interactionProps');
        expect(actions).toContain('interactionState.interactionProps');
        expect(paletteItem).toContain('interactionState.interactionProps');
        expect(paletteInput).toContain('interactionState.interactionProps');
    });
});
