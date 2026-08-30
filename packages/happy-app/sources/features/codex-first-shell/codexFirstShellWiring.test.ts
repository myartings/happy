import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
    return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Codex-first desktop shell wiring', () => {
    it('projects one runtime contract from the navigator into the sidebar host', () => {
        const navigator = readSource('../../components/SidebarNavigator.tsx');
        const sidebar = readSource('../../components/SidebarView.tsx');

        expect(navigator).toContain('resolveCurrentCodexFirstDesktopRuntime');
        expect(navigator).toContain('codexFirstContract={codexFirstContract}');
        expect(sidebar).toContain('codexFirstContract: CodexFirstDesktopContract');
        expect(sidebar).toContain('codexFirstContract.enabled ?');
        expect(sidebar).toContain('<CodexFirstSidebarShell');
    });

    it('owns product identity, search, notifications, and Happy destinations in the feature module', () => {
        const shell = readSource('./CodexFirstSidebarShell.tsx');

        expect(shell).toContain("accessibilityLabel={contract.product.name}");
        expect(shell).toContain('onOpenSearch');
        expect(shell).toContain('onOpenNotifications');
        expect(shell).toContain('projectCodexFirstSidebarDestinations');
        expect(shell).toContain('isCodexFirstDestinationSelected');
        expect(shell).toContain("t('codexFirst.machinesAndAgents')");
    });
});
