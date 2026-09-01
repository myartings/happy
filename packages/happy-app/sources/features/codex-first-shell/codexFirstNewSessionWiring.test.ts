import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
    return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Codex-first home and New Session wiring', () => {
    it('renders an actionable home canvas only for the packaged Codex-first desktop', () => {
        const home = readSource('../../app/(app)/index.tsx');
        const main = readSource('../../components/MainView.tsx');
        const canvas = readSource('./CodexFirstHomeCanvas.tsx');

        expect(home).toContain('resolveCurrentCodexFirstDesktopRuntime');
        expect(home).toContain('codexFirstEnabled={codexFirstContract.enabled}');
        expect(main).toContain('<CodexFirstHomeCanvas');
        expect(main).toContain('codexFirstEnabled ?');
        expect(canvas).toContain("collectCodexFirstRecentProjects(sessionListViewData, 3, machineChoices, t('codexFirst.unknownMachine'))");
        expect(canvas).toContain('project.machineLabel');
        expect(canvas).toContain('accessibilityLabel={projectLabel}');
    });

    it('enables the prompt-first contextual rail without changing the spawn handler', () => {
        const screen = readSource('../../app/(app)/new/index.tsx');

        expect(screen).toContain('resolveCurrentCodexFirstDesktopRuntime');
        expect(screen).toContain('codexFirstEnabled: codexFirstContract.enabled');
        expect(screen).toContain("useLocalSetting('studioLeftPanelWidth')");
        expect(screen).toContain('projectPanelWidth({');
        expect(screen).toContain('leftSidebarWidth: codexFirstLeftSidebarWidth');
        expect(screen).toContain('{composerNode}');
        expect(screen).toContain('{configContent}');
        expect(screen).toContain('machineSpawnNewSession(spawnOptions)');
    });
});
