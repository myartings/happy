import type { ToolCall } from '@/sync/typesMessage';

export function disclosureTerminalTool(overrides: Partial<ToolCall> = {}): ToolCall {
    return {
        name: 'CodexBash',
        state: 'completed',
        input: { command: 'pnpm typecheck' },
        result: { output: 'all checks passed\n', exitCode: 0, truncated: false },
        createdAt: 1,
        startedAt: 10,
        completedAt: 260,
        description: null,
        ...overrides,
    };
}

export const disclosureEdgeFixtures = Object.freeze({
    wrappedLongLogicalLine: Array.from({ length: 9 }, (_, index) => `wrapped ${index + 1}`),
    narrowFailureVisualLines: Array.from({ length: 15 }, (_, index) => `diagnostic ${index + 1}`),
    heredocCommand: '\u001B[31mpython - <<\'PY\'\nprint("通过 👩🏽‍💻 e\u0301")\nPY\u001B[0m\u0007',
    unicodeProgressOutput: 'step 1\rstep 2\t列\u0000\u001B[32m好\u001B[0m 👩🏽‍💻 e\u0301 \u202Eabc',
});
