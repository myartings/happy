/**
 * Presentation-neutral roles used to describe semantic conversation text.
 * Concrete colors and runtime-specific styling belong to theme integration.
 */
export const semanticTextRoles = [
    'body',
    'heading',
    'emphasis',
    'link',
    'inlineCode',
    'command',
    'path',
    'number',
    'statusSuccess',
    'statusWarning',
    'statusError',
    'statusSecondary',
] as const;

export type SemanticTextRole = (typeof semanticTextRoles)[number];

export type SemanticTextRun = Readonly<{
    text: string;
    role: SemanticTextRole;
}>;

export type AnsiColor =
    | Readonly<{ mode: 'standard'; index: number }>
    | Readonly<{ mode: 'indexed'; index: number }>
    | Readonly<{ mode: 'rgb'; red: number; green: number; blue: number }>;

export type AnsiTextStyle = Readonly<{
    foreground?: AnsiColor;
    background?: AnsiColor;
    bold?: true;
    dim?: true;
    italic?: true;
    underline?: true;
}>;

export type StyledSemanticTextRun = SemanticTextRun & Readonly<{
    style?: AnsiTextStyle;
}>;

export type ParsedSemanticText = Readonly<{
    text: string;
    runs: readonly StyledSemanticTextRun[];
}>;
