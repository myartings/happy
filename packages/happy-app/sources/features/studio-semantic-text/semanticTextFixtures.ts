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

export const studioRichTextConstructs = [
    'paragraphs',
    'heading-1',
    'heading-2',
    'heading-3',
    'heading-4',
    'heading-5',
    'heading-6',
    'bold',
    'italic',
    'strikethrough',
    'trusted-link',
    'nested-unordered-list',
    'nested-ordered-list',
    'blockquote',
    'horizontal-rule',
    'inline-code',
    'fenced-code-language-copy',
    'table',
    'command',
    'path',
    'number',
    'status-success',
    'status-warning',
    'status-error',
    'tool-output',
    'diff-content',
] as const;

/**
 * Stable pasteable fixture for packaged Studio visual verification. Tool and
 * diff rows are represented textually here and paired with the existing
 * structured semantic fixtures above; the parent integration run exercises
 * their real renderers without changing message transport or stored content.
 */
export const studioRichTextMarkdownFixture = [
    '# Heading one',
    '## Heading two',
    '### Heading three',
    '#### Heading four',
    '##### Heading five',
    '###### Heading six',
    '',
    'First paragraph with **bold**, *italic*, ~~obsolete~~, a [trusted link](https://example.com/docs), and `inline code`.',
    'Second paragraph: command `pnpm typecheck`, path `/tmp/happy/report.json`, number `128`.',
    '',
    '- Unordered item',
    '  - Nested unordered item',
    '    - Deep unordered item',
    '',
    '1. Ordered item',
    '  2. Nested ordered item',
    '',
    '> A restrained blockquote.',
    '> It keeps a second selectable line.',
    '',
    '---',
    '',
    '```typescript',
    'const status: "success" | "warning" | "error" = "success";',
    'console.log(status);',
    '```',
    '',
    '| Role | Example |',
    '| --- | --- |',
    '| Success | Complete |',
    '| Warning | Waiting |',
    '| Error | Failed |',
    '| Tool output | 128 files processed |',
    '| Diff content | + added / - removed |',
].join('\n');
