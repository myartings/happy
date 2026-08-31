import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
    return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Codex-first workspace and Settings wiring', () => {
    it('promotes the existing right workspace through one runtime-driven seam', () => {
        const session = readSource('../../-session/SessionView.tsx');

        expect(session).toContain('resolveCurrentCodexFirstDesktopRuntime');
        expect(session).toContain('resolveCodexFirstWorkspaceChrome');
        expect(session).toContain('featureEnabled: workspaceChrome.quickPanelEnabled');
        expect(session).toContain('fileDiffsSidebarEnabled: workspaceChrome.fileDiffsSidebarEnabled');
        expect(session).toContain('quickPanelEnabled={workspaceChrome.quickPanelEnabled}');
        expect(session).toContain("workspaceChrome.actions.some(action => action.id === 'side-chat')");
        expect(session).toContain("workspaceChrome.actions.some(action => action.id === 'issues')");
        expect(session).toContain('{showGithubIssuesAction ? (');
        expect(session).toContain('quickPanelShowSideChatAction={showQuickPanelSideChatAction}');
        expect(session).toContain('studioRightPanelWidth: width');
    });

    it('uses the shared overlay contract for the workspace selector and restores focus', () => {
        const overlayHook = readSource('../studio-overlays/useStudioOverlayPresentation.ts');
        const controls = readSource('../../components/SideChatQuickPanelControls.tsx');
        const sessionActions = readSource('../../components/SessionActionsPopover.tsx');
        const defaultText = readSource('../../text/_default.ts');
        const simplifiedChineseText = readSource('../../text/translations/zh-Hans.ts');

        expect(overlayHook).toContain('resolveCurrentCodexFirstDesktopRuntime');
        expect(overlayHook).not.toContain("from '@/utils/isTauri'");
        expect(controls).toContain('useStudioOverlayPresentation');
        expect(controls).toContain('resolveSessionActionsMenuPosition');
        expect(controls).toContain('resolveCodexFirstWorkspaceMenuKey');
        expect(controls).toContain('event.stopPropagation()');
        expect(controls).toContain('menuButtonRef.current?.focus?.()');
        expect(defaultText).toContain("collapseSideChat: 'Collapse workspace panel'");
        expect(simplifiedChineseText).toContain("collapseSideChat: '收起工作区面板'");
        expect(sessionActions).toContain('resolveSessionActionsMenuPosition');
        expect(sessionActions).toContain('action.destructive');
    });

    it('indexes Settings routes and presents explicit Happy Codex identity', () => {
        const provider = readSource('../../components/CommandPalette/CommandPaletteProvider.tsx');
        const settings = readSource('../../components/SettingsView.tsx');

        expect(provider).toContain('projectCodexFirstSettingsDestinations');
        expect(provider).toContain('codexFirstSettingsDestinationCopy');
        expect(provider).toContain("category: t('settings.title')");
        expect(provider).toContain('codexFirstContract.presentation.usesStudioPrimitives');
        expect(settings).toContain('resolveCodexFirstSettingsPresentation');
        expect(settings).toContain('codexFirstContract.product.name');
        expect(settings).toContain("t('codexFirst.settingsIdentity')");
        expect(settings).toContain("t('codexFirst.settingsAboutFooter')");
        expect(settings).toContain("t('settings.aboutFooter')");
    });

    it('keeps the no-query command surface bounded and localizes Codex-first command copy', () => {
        const provider = readSource('../../components/CommandPalette/CommandPaletteProvider.tsx');
        const results = readSource('../../components/CommandPalette/CommandPaletteResults.tsx');

        expect(provider).toContain("case 'machines-agents': return t('codexFirst.machinesAndAgents');");
        expect(provider).toContain("title: codexFirstContract.enabled ? t('sidebar.newSession') : 'New Session'");
        expect(provider).toContain("category: codexFirstContract.enabled ? t('tabs.sessions') : 'Sessions'");
        expect(provider).toContain("const searchOnly = entry.kind !== 'destination'");
        expect(provider).toContain('visibleSessionEntries >= 5');
        expect(provider).toContain('searchOnly: true');
        expect(results).toContain("t('codexFirst.commandNoResults')");
    });

    it('restores command-palette focus to the explicit sidebar launcher', () => {
        const shell = readSource('./CodexFirstSidebarShell.tsx');
        const provider = readSource('../../components/CommandPalette/CommandPaletteProvider.tsx');
        const modal = readSource('../../modal/components/CustomModal.tsx');

        expect(shell).toContain('const searchButtonRef = React.useRef<CommandPaletteFocusTarget | null>(null);');
        expect(shell).toContain('buttonRef={searchButtonRef}');
        expect(shell).toContain('onOpenSearch(searchButtonRef.current)');
        expect(provider).toContain('open: (restoreFocusTarget?: CommandPaletteFocusTarget | null) => void;');
        expect(provider).toContain('requestedRestoreFocusTarget ?? document.activeElement');
        expect(modal).toContain('requestAnimationFrame(() => restoreFocusTarget.focus?.())');
    });
});
