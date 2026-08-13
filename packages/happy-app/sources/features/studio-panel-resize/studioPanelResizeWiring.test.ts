import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
    return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Studio panel resize host wiring', () => {
    it('projects and persists the packaged-Studio left drawer width', () => {
        const navigator = readSource('../../components/SidebarNavigator.tsx');

        expect(navigator).toContain("useLocalSettingMutable('studioLeftPanelWidth')");
        expect(navigator).toContain('useStudioRightPanelVisible()');
        expect(navigator).toContain("sidebarFrame.visualStyle === 'studio'");
        expect(navigator).toContain('side="left"');
        expect(navigator).toContain('projectStudioPanelWidths({');
        expect(navigator).toContain('width={panelWidths.leftWidth}');
        expect(navigator).toContain('onWidthChange={setPersistedLeftPanelWidth}');
        expect(navigator).toContain('studioPanelResizeEnabled && showSidebar');
        expect(navigator).toContain(': sidebarFrame.width');
    });

    it('projects and persists the packaged-Studio right workspace width', () => {
        const session = readSource('../../-session/SessionView.tsx');

        expect(session).toContain("useLocalSettingMutable('studioRightPanelWidth')");
        expect(session).toContain('const visible = studioPanelResizeEnabled && showSidebar;');
        expect(session).toContain('setStudioRightPanelVisible(visible);');
        expect(session).toContain('runningInTauri');
        expect(session).toContain("requestedStyle: requestedVisualStyle");
        expect(session).toContain('side="right"');
        expect(session).toContain('projectStudioPanelWidths({');
        expect(session).toContain('width={panelWidths.rightWidth}');
        expect(session).toContain('onWidthChange={setPersistedRightPanelWidth}');
        expect(session).toContain('studioPanelResizeEnabled && showSidebar');
        expect(session).toContain(': Math.min(Math.max(Math.floor(windowWidth * 0.3), 250), 360)');
    });

    it('keeps collapse state separate from persisted width on both sides', () => {
        const navigator = readSource('../../components/SidebarNavigator.tsx');
        const session = readSource('../../-session/SessionView.tsx');

        expect(navigator).toContain('const drawerWidth = showSidebar ? fullDrawerWidth : 0;');
        expect(session).toContain('width: sidebarAnim.value * sidebarWidth');
        expect(session).not.toContain('setPersistedRightPanelWidth(0)');
        expect(navigator).not.toContain('setPersistedLeftPanelWidth(0)');
    });
});
