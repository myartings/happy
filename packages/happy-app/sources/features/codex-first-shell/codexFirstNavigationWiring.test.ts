import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
    return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Codex-first project, search, and attention wiring', () => {
    it('carries project-first presentation through the sidebar list without changing phone UI', () => {
        const sidebar = readSource('../../components/SidebarView.tsx');
        const main = readSource('../../components/MainView.tsx');
        const sessions = readSource('../../components/SessionsList.tsx');
        const projects = readSource('../../components/ProjectGroup.tsx');

        expect(sidebar).toContain('codexFirstEnabled={codexFirstContract.enabled}');
        expect(main).toContain('codexFirstEnabled?: boolean;');
        expect(main).toContain('codexFirstEnabled={codexFirstEnabled}');
        expect(sessions).toContain('resolveCodexFirstSessionNavigation({');
        expect(sessions).toContain('navigationPresentation.showMachineHeaders');
        expect(sessions).toContain('if (!isTablet && !codexFirstEnabled) return undefined;');
        expect(projects).toContain('showMachineName = true');
        expect(projects).toContain('showMachineName && machineName');
    });

    it('projects local search entries into the existing command surface', () => {
        const provider = readSource('../../components/CommandPalette/CommandPaletteProvider.tsx');

        expect(provider).toContain('buildCodexFirstSearchEntries({');
        expect(provider).toContain('useAllMachines({ includeOffline: true })');
        expect(provider).toContain('projectCodexFirstSidebarDestinations({');
        expect(provider).toContain(".filter((session) => !session.metadata?.isSideChat)");
        expect(provider).toContain("target.kind === 'session'");
        expect(provider).toContain('navigateToSession(target.sessionId)');
    });

    it('opens a counted attention Session and retains the Inbox fallback', () => {
        const sidebar = readSource('../../components/SidebarView.tsx');
        const shell = readSource('./CodexFirstSidebarShell.tsx');

        expect(sidebar).toContain('countCodexFirstAttentionSessions');
        expect(sidebar).toContain('resolveCodexFirstNotificationTarget');
        expect(sidebar).toContain('attentionCount={attentionCount}');
        expect(shell).toContain('badgeCount={attentionCount}');
        expect(sidebar).toContain("notificationTarget.kind === 'session'");
        expect(sidebar).toContain('navigateToSession(notificationTarget.sessionId)');
        expect(sidebar).toContain("router.push('/inbox' as any)");
    });
});
