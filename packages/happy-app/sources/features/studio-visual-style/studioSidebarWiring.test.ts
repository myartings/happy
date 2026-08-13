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
        expect(compactRows).toContain('borderRadius: rowChrome.cornerRadius!');
        expect(historicalRows).toContain('borderRadius: rowChrome.cornerRadius!');
    });
});
