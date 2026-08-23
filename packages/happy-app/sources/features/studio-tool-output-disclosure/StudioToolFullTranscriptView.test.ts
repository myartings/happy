import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        Platform: { OS: 'web', select: (values: any) => values.default ?? values.web },
        Text: host('Text'),
        View: host('View'),
    };
});

import { StudioToolFullTranscriptView } from './StudioToolFullTranscriptView';

function render(element: React.ReactElement): ReactTestRenderer {
    let renderer!: ReactTestRenderer;
    act(() => { renderer = create(element); });
    return renderer;
}

describe('StudioToolFullTranscriptView', () => {
    it('renders the complete sanitized Codex command and stored success output', () => {
        const renderer = render(React.createElement(StudioToolFullTranscriptView, {
            presentation: {
                transcript: {
                    dark: false,
                    commandColor: '#2D2D2D',
                    errorColor: '#A23D3D',
                    fontSize: 13,
                    lineHeight: 19,
                    metadataColor: '#707070',
                    promptColor: '#327078',
                    stderrColor: '#A23D3D',
                    stdoutColor: '#424242',
                },
            } as any,
            tool: {
                name: 'CodexBash',
                state: 'completed',
                input: { command: '\u001B[32mpnpm test\u001B[0m\u0007' },
                result: { stdout: `first\n${'complete output sentinel '.repeat(200)}\nlast` },
                createdAt: 1,
                startedAt: 1,
                completedAt: 2,
                description: null,
            },
        }));

        const transcript = renderer.root.findByProps({ testID: 'studio-tool-full-transcript' });
        const text = transcript.findAllByType('Text' as any)
            .map((node: { props: { children?: unknown } }) => node.props.children)
            .flat(Infinity)
            .join('');
        expect(text).toContain('pnpm test');
        expect(text).toContain('complete output sentinel');
        expect(text).toContain('last');
        expect(text).not.toContain('\u001B');
        expect(text).not.toContain('\u0007');
    });
});
