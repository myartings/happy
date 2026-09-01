import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
    return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Codex-first execution and decision wiring', () => {
    it('drives all packaged tool activity from the shared desktop runtime contract', () => {
        const hook = readSource('../studio-tool-presentation/useStudioToolPresentation.ts');
        const tool = readSource('../../components/tools/ToolView.tsx');
        const group = readSource('../../components/ToolGroupView.tsx');

        expect(hook).toContain('resolveCurrentCodexFirstDesktopRuntime');
        expect(hook).toContain('runtime.presentation.usesStudioPrimitives');
        expect(hook).not.toContain("from '@/utils/isTauri'");
        expect(tool).toContain('useStudioToolPresentation');
        expect(tool).toContain('StudioExecutionTranscriptView');
        expect(tool).toContain('StudioToolOutputActions');
        expect(group).toContain('useStudioToolPresentation');
        expect(group).toContain('resolveStudioToolOutputDisclosure');
    });

    it('shares the exact-once lifecycle across permission and Agent-question surfaces', () => {
        const permission = readSource('../../components/tools/PermissionFooter.tsx');
        const inline = readSource('../../components/tools/views/InlineQuestionForm.tsx');
        const modal = readSource('../../components/AgentQuestionModal.tsx');
        const banner = readSource('../../components/AgentQuestionBanner.tsx');

        for (const source of [permission, inline, modal, banner]) {
            expect(source).toContain('submitCodexFirstDecisionOnce');
        }
        expect(permission).toContain('decisionPresentation.canInteract');
        expect(inline).toContain('requestStatus');
        expect(modal).toContain('connected');
        expect(banner).toContain("session?.presence === 'online'");
    });

    it('keeps Stop reachable while tools await permission or Agent input', () => {
        const session = readSource('../../-session/SessionView.tsx');
        const composer = readSource('../../components/AgentInput.tsx');

        expect(session).toContain("sessionStatus.state === 'permission_required'");
        expect(session).toContain("sessionStatus.state === 'input_required'");
        expect(session).toContain('onAbort={isDisconnected || !rigCanAbort(session.metadata) ? undefined : handleAbort}');
        expect(composer).toContain('resolveStudioComposerStatePresentation({');
        expect(composer).toContain('props.onAbort');
        expect(composer).toContain('props.onPickImages');
        expect(composer).toContain('autocompleteSuggestions');
    });
});
