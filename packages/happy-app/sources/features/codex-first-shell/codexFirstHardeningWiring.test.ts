import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
    return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Codex-first responsive and accessibility wiring', () => {
    it('keeps the packaged shell desktop-first independently of the legacy tablet heuristic', () => {
        const navigator = readSource('../../components/SidebarNavigator.tsx');
        const main = readSource('../../components/MainView.tsx');
        const session = readSource('../../-session/SessionView.tsx');

        expect(navigator).toContain('resolveCodexFirstDesktopLayout');
        expect(navigator).toContain('responsiveLayout.desktopShell');
        expect(main).toContain('resolveCodexFirstDesktopLayout');
        expect(main).toContain('responsiveLayout.desktopShell');
        expect(session).toContain('resolveCodexFirstDesktopLayout');
        expect(session).toContain('responsiveLayout.desktopShell');
    });

    it('makes desktop navigation and workspace controls keyboard-visible and semantically named', () => {
        const navigator = readSource('../../components/SidebarNavigator.tsx');
        const header = readSource('../../components/ChatHeaderView.tsx');
        const files = readSource('../../components/FilesSidebar.tsx');
        const controls = readSource('../../components/SideChatQuickPanelControls.tsx');

        expect(navigator).toContain('DesktopHeaderAction');
        expect(navigator).toContain('selected === undefined');
        expect(navigator).toContain('accessibilityState={accessibilityState}');
        expect(header).toContain('const desktopLayout = isTablet || codexFirstContract.enabled');
        expect(files).toContain('accessibilityState={{ selected: active }}');
        expect(files).toContain('accessibilityRole="tab"');
        expect(controls).toContain('focusRingColor');
        expect(controls).toContain('accessibilityRole="menu"');
        expect(controls).toContain('accessibilityViewIsModal');
    });

    it('honors the system reduced-motion preference in the packaged command surface', () => {
        const modal = readSource('../../components/CommandPalette/CommandPaletteModal.tsx');
        const permission = readSource('../../components/tools/PermissionFooter.tsx');
        const question = readSource('../../components/AgentQuestionModal.tsx');

        expect(modal).toContain('useReducedMotion');
        expect(modal).toContain('resolveCodexFirstMotionDuration');
        expect(modal).toContain('openingDuration');
        expect(modal).toContain('closingDuration');
        expect(permission).toContain('if (reduceMotion)');
        expect(question).toContain("animationType={reduceMotion ? 'none' : 'slide'}");
    });

    it('assigns packaged back and route Header controls to one persistent-shell owner', () => {
        const navigationHeader = readSource('../../components/navigation/Header.tsx');
        const newSession = readSource('../../app/(app)/new/index.tsx');
        const inbox = readSource('../../app/(app)/inbox/index.tsx');

        expect(navigationHeader).toContain('resolveCodexFirstHeaderOwnership');
        expect(navigationHeader).toContain('headerOwnership.hideRouteBackButton');
        expect(newSession).toContain('headerOwnership.routeHeadersAllowed');
        expect(inbox).toContain('resolveCurrentCodexFirstDesktopRuntime');
        expect(inbox).toContain('headerOwnership.showPhoneInboxHeader');
    });

    it('gates new desktop control visuals to Codex-first and localizes their accessible names', () => {
        const navigator = readSource('../../components/SidebarNavigator.tsx');
        const session = readSource('../../-session/SessionView.tsx');
        const newSession = readSource('../../app/(app)/new/index.tsx');
        const files = readSource('../../components/FilesSidebar.tsx');
        const sideChat = readSource('../../components/SideChatPanel.tsx');
        const controls = readSource('../../components/SideChatQuickPanelControls.tsx');
        const defaultText = readSource('../../text/_default.ts');
        const simplifiedChineseText = readSource('../../text/translations/zh-Hans.ts');

        expect(navigator).toContain('<PersistentHeader codexFirstEnabled={codexFirstContract.enabled} />');
        expect(navigator).toContain('codexFirstEnabled && Platform.OS === \'web\'');
        expect(navigator).toContain("label={t('codexFirst.resizeNavigationPanel')}");
        expect(navigator).toContain("accessibilityLabel={t('codexFirst.forward')}");
        expect(session).toContain("label={t('codexFirst.resizeWorkspacePanel')}");
        expect(controls).toContain('codexFirstEnabled = false');
        expect(controls).toContain('const codexFirstPresentation = codexFirstEnabled && overlayPresentation.isStudio;');
        expect(controls).toContain("t('codexFirst.openSidebarTools')");
        expect(controls).toContain("t('codexFirst.sidebarTools')");
        expect(session).toContain('codexFirstEnabled={codexFirstContract.enabled}');
        expect(files).toContain('codexFirstEnabled={codexFirstEnabled}');
        expect(sideChat).toContain('codexFirstEnabled={codexFirstEnabled}');
        expect(newSession).toContain("codexFirstContract.enabled ? t('codexFirst.newSessionComposerPlaceholder') : 'What would you like to work on?'");
        expect(defaultText).toContain("newSessionComposerPlaceholder: 'What would you like to work on?'");
        expect(simplifiedChineseText).toContain("newSessionComposerPlaceholder: '你想做什么？'");
    });
});
