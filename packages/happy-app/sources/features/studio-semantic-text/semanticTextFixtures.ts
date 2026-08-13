import type { SemanticTextRole } from './semanticText';

export type SemanticTextFixture = Readonly<{
    id: string;
    kind: 'markdown' | 'structured' | 'ansi' | 'mixed';
    input: string;
    readableText: string;
    expectedRoles: readonly SemanticTextRole[];
}>;

export const semanticTextFixtures = [
    {
        id: 'markdown-hierarchy',
        kind: 'markdown',
        input: '# Release\nRead **details** in [the docs](https://example.com) and use `pnpm test`.',
        readableText: 'Release\nRead details in the docs and use pnpm test.',
        expectedRoles: ['body', 'heading', 'emphasis', 'link', 'inlineCode'],
    },
    {
        id: 'structured-command-path-number',
        kind: 'structured',
        input: 'pnpm test wrote 42 results to /tmp/happy/report.json',
        readableText: 'pnpm test wrote 42 results to /tmp/happy/report.json',
        expectedRoles: ['body', 'command', 'path', 'number'],
    },
    {
        id: 'structured-status-levels',
        kind: 'structured',
        input: 'Complete · Waiting · Failed · Queued',
        readableText: 'Complete · Waiting · Failed · Queued',
        expectedRoles: ['statusSuccess', 'statusWarning', 'statusError', 'statusSecondary'],
    },
    {
        id: 'ansi-error-and-body',
        kind: 'ansi',
        input: '\u001B[1;31merror\u001B[0m plain',
        readableText: 'error plain',
        expectedRoles: ['body', 'statusError'],
    },
    {
        id: 'mixed-conversation-output',
        kind: 'mixed',
        input: 'Build **passed**: `pnpm typecheck` processed 128 files.',
        readableText: 'Build passed: pnpm typecheck processed 128 files.',
        expectedRoles: ['body', 'emphasis', 'inlineCode', 'command', 'number', 'statusSuccess'],
    },
] as const satisfies readonly SemanticTextFixture[];
