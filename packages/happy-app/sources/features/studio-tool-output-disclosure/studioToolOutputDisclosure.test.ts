import { describe, expect, it } from 'vitest';

import {
    resolveStudioToolOutputDisclosure,
    toggleStudioToolOutputDisclosure,
} from './studioToolOutputDisclosure';
import { disclosureEdgeFixtures, disclosureTerminalTool as terminalTool } from './studioToolOutputDisclosure.fixtures';

describe('Studio tool output disclosure', () => {
    it('turns collapsed or preview summaries into a manual expansion and expanded summaries into a manual collapse', () => {
        expect(toggleStudioToolOutputDisclosure('collapsed')).toBe('expanded');
        expect(toggleStudioToolOutputDisclosure('preview')).toBe('expanded');
        expect(toggleStudioToolOutputDisclosure('expanded')).toBe('collapsed');
    });

    it('defaults a successful completed tool to a collapsed summary', () => {
        expect(resolveStudioToolOutputDisclosure(terminalTool())).toMatchObject({
            presentation: 'collapsed',
            automaticPresentation: 'collapsed',
            manualOverride: null,
            summary: {
                command: 'pnpm typecheck',
                status: 'completed',
                durationMs: 250,
                exitCode: 0,
                outputLineCount: 1,
                truncated: false,
            },
            preview: null,
            completeCopyText: {
                command: 'pnpm typecheck',
                output: 'all checks passed\n',
            },
        });
    });

    it('previews only the last five supplied visual lines while running', () => {
        const visualLines = disclosureEdgeFixtures.wrappedLongLogicalLine;

        expect(resolveStudioToolOutputDisclosure(terminalTool({
            state: 'running',
            completedAt: null,
            result: { output: 'one extremely long logical line' },
        }), { previewVisualLines: visualLines })).toMatchObject({
            presentation: 'preview',
            automaticPresentation: 'preview',
            summary: { status: 'running' },
            preview: {
                kind: 'running-tail',
                head: [],
                tail: ['wrapped 5', 'wrapped 6', 'wrapped 7', 'wrapped 8', 'wrapped 9'],
                omittedVisualLineCount: 4,
            },
            completeCopyText: { output: 'one extremely long logical line' },
        });
    });

    it('previews the first two and last eight diagnostic visual lines for structural failure', () => {
        const visualLines = disclosureEdgeFixtures.narrowFailureVisualLines;

        expect(resolveStudioToolOutputDisclosure(terminalTool({
            state: 'error',
            result: {
                stdout: 'ordinary stdout',
                stderr: 'diagnostic stream',
                exitCode: 2,
            },
        }), { previewVisualLines: visualLines })).toMatchObject({
            presentation: 'preview',
            summary: { status: 'failed', exitCode: 2 },
            preview: {
                kind: 'failure-head-tail',
                sourceText: 'diagnostic stream',
                head: ['diagnostic 1', 'diagnostic 2'],
                tail: [
                    'diagnostic 8', 'diagnostic 9', 'diagnostic 10', 'diagnostic 11',
                    'diagnostic 12', 'diagnostic 13', 'diagnostic 14', 'diagnostic 15',
                ],
                omittedVisualLineCount: 5,
            },
        });
    });

    it('keeps a mounted manual expansion or collapse authoritative across updates', () => {
        const running = terminalTool({
            state: 'running',
            completedAt: null,
            result: { output: 'streaming' },
        });
        const completed = terminalTool({ result: { output: 'done' } });

        expect(resolveStudioToolOutputDisclosure(running, {
            manualOverride: 'collapsed',
            previewVisualLines: ['streaming'],
        })?.presentation).toBe('collapsed');
        expect(resolveStudioToolOutputDisclosure(completed, {
            manualOverride: 'expanded',
            previewVisualLines: ['done'],
        })?.presentation).toBe('expanded');
        expect(resolveStudioToolOutputDisclosure(terminalTool({
            state: 'error',
            result: { stderr: 'failed' },
        }), {
            manualOverride: 'collapsed',
            previewVisualLines: ['failed'],
        })?.presentation).toBe('collapsed');
    });

    it('uses structured pending, cancellation, and interruption state without reading failure prose', () => {
        expect(resolveStudioToolOutputDisclosure(terminalTool({
            result: { output: 'fatal: this prose alone is not a failed tool' },
        }))?.presentation).toBe('collapsed');

        expect(resolveStudioToolOutputDisclosure(terminalTool({
            state: 'running',
            completedAt: null,
            permission: { id: 'permission-1', status: 'pending' },
            result: { output: 'historical output' },
        }), { previewVisualLines: ['historical output'] })).toMatchObject({
            presentation: 'collapsed',
            summary: { status: 'pending-permission' },
        });

        expect(resolveStudioToolOutputDisclosure(terminalTool({
            state: 'error',
            result: { error: 'cancel diagnostic', status: 'cancelled' },
        }), { previewVisualLines: ['cancel diagnostic'] })).toMatchObject({
            presentation: 'preview',
            summary: { status: 'cancelled' },
            preview: { kind: 'failure-head-tail' },
        });

        expect(resolveStudioToolOutputDisclosure(terminalTool({
            result: { output: '', status: 'interrupted' },
        }))).toMatchObject({
            presentation: 'collapsed',
            summary: { status: 'interrupted' },
        });

        expect(resolveStudioToolOutputDisclosure(terminalTool({
            state: 'error',
            result: { error: 'interrupt diagnostic', status: 'interrupted' },
        }), { previewVisualLines: ['interrupt diagnostic'] })).toMatchObject({
            presentation: 'preview',
            summary: { status: 'interrupted' },
            preview: { sourceText: 'interrupt diagnostic' },
        });
    });

    it('keeps sanitized complete copy text separate from preview omission metadata', () => {
        const disclosure = resolveStudioToolOutputDisclosure(terminalTool({
            state: 'error',
            input: { command: disclosureEdgeFixtures.heredocCommand },
            result: { stderr: disclosureEdgeFixtures.unicodeProgressOutput, truncated: true },
        }), {
            previewVisualLines: Array.from({ length: 12 }, (_, index) => `line ${index + 1}`),
        });

        expect(disclosure).toMatchObject({
            summary: { command: 'python - <<\'PY\'\nprint("通过 👩🏽‍💻 é")\nPY', truncated: true },
            preview: { omittedVisualLineCount: 2 },
            completeCopyText: {
                command: 'python - <<\'PY\'\nprint("通过 👩🏽‍💻 é")\nPY',
                output: 'step 1\nstep 2\t列好 👩🏽‍💻 é \u202Eabc',
            },
        });
        expect(disclosure?.completeCopyText.output).not.toContain('line 3');
    });

    it('keeps command-only and output-only legacy tools in the summary contract', () => {
        expect(resolveStudioToolOutputDisclosure(terminalTool({
            result: undefined,
        }))).toMatchObject({
            summary: { command: 'pnpm typecheck', outputLineCount: 0 },
            preview: null,
            completeCopyText: { output: '' },
        });

        expect(resolveStudioToolOutputDisclosure(terminalTool({
            input: {},
            result: 'legacy output\nsecond line',
        }))).toMatchObject({
            summary: { command: '', outputLineCount: 2 },
            completeCopyText: { command: '', output: 'legacy output\nsecond line' },
        });
    });
});
