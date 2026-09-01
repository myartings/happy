import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
    return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Codex-first conversation wiring', () => {
    it('projects the one packaged runtime contract into header, transcript, and Composer geometry', () => {
        const header = readSource('../../components/ChatHeaderView.tsx');
        const list = readSource('../../components/ChatList.tsx');
        const composer = readSource('../../components/AgentInput.tsx');

        for (const source of [header, list, composer]) {
            expect(source).toContain('resolveCurrentCodexFirstDesktopRuntime');
            expect(source).toContain('codexFirstEnabled: codexFirstContract.enabled');
        }
    });

    it('uses compact user bubbles while preserving transcript and Composer behavior seams', () => {
        const list = readSource('../../components/ChatList.tsx');
        const message = readSource('../../components/MessageView.tsx');
        const composer = readSource('../../components/AgentInput.tsx');

        expect(list).toContain('codexFirstEnabled={codexFirstContract.enabled}');
        expect(list).toContain('maintainVisibleContentPosition');
        expect(message).toContain('resolveCodexFirstUserMessagePresentation');
        expect(message).toContain('externalCopyHandler');
        expect(composer).toContain('props.onAbort');
        expect(composer).toContain('props.onPickImages');
    });
});
