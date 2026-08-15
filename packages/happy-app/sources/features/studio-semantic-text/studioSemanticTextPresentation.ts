import { resolveDesktopVisualStyle, type VisualStyle } from '../studio-visual-style/studioVisualStyle';

import type { SemanticTextRole } from './semanticText';

export type SemanticRoleTextStyle = Readonly<{
    color: string;
    backgroundColor?: string;
    fontWeight?: '600' | '700';
    textDecorationLine?: 'underline';
}>;

export type StudioSemanticTextPresentation = Readonly<{
    visualStyle: 'studio';
    roles: Readonly<Record<SemanticTextRole, SemanticRoleTextStyle>>;
    body: Readonly<{
        fontSize: number;
        lineHeight: number;
        marginTop: number;
        marginBottom: number;
    }>;
    headings: Readonly<Record<1 | 2 | 3 | 4 | 5 | 6, Readonly<{
        fontSize: number;
        lineHeight: number;
        marginTop: number;
        marginBottom: number;
    }>>>;
    inlineCode: Readonly<{
        fontSize: number;
        lineHeight: number;
        borderRadius: number;
    }>;
    codeBlock: Readonly<{
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
        borderRadius: number;
    }>;
    metadata: Readonly<{
        fontSize: number;
        lineHeight: number;
    }>;
    list: Readonly<{
        gap: number;
        indent: number;
        markerColor: string;
    }>;
    blockquote: Readonly<{
        backgroundColor: string;
        borderColor: string;
        borderLeftWidth: number;
        borderRadius: number;
        marginVertical: number;
        paddingHorizontal: number;
        paddingVertical: number;
    }>;
    horizontalRule: Readonly<{
        backgroundColor: string;
        marginVertical: number;
    }>;
    table: Readonly<{
        borderColor: string;
        headerBackgroundColor: string;
        borderRadius: number;
        cellPaddingHorizontal: number;
        cellPaddingVertical: number;
        headerFontSize: number;
        bodyFontSize: number;
        lineHeight: number;
    }>;
    codeChrome: Readonly<{
        labelColor: string;
        copyBackgroundColor: string;
        copyBorderColor: string;
        copyTextColor: string;
    }>;
    options: Readonly<{
        gap: number;
        marginVertical: number;
        minHeight: number;
        paddingHorizontal: number;
        paddingVertical: number;
        borderRadius: number;
        borderWidth: number;
        backgroundColor: string;
        borderColor: string;
        pressedBackgroundColor: string;
        hoverBackgroundColor: string;
        hoverBorderColor: string;
        focusBorderColor: string;
        textColor: string;
        fontSize: number;
        lineHeight: number;
    }>;
}>;

type ResolveStudioSemanticTextPresentationInput = Readonly<{
    isTauriRuntime: boolean;
    requestedStyle: VisualStyle;
    previewStyle?: string;
    dark: boolean;
}>;

const lightRoles = {
    body: { color: '#2D2D2D' },
    heading: { color: '#202020', fontWeight: '700' },
    emphasis: { color: '#252525', fontWeight: '600' },
    link: { color: '#3F6B8F', textDecorationLine: 'underline' },
    inlineCode: { color: '#34302C', backgroundColor: '#F2F1EF' },
    command: { color: '#4D5962', backgroundColor: '#F2F1EF' },
    path: { color: '#536778' },
    number: { color: '#6B567E' },
    statusSuccess: { color: '#2E6A4F' },
    statusWarning: { color: '#8A6428' },
    statusError: { color: '#A23D3D' },
    statusSecondary: { color: '#707070' },
} as const satisfies Readonly<Record<SemanticTextRole, SemanticRoleTextStyle>>;

const darkRoles = {
    body: { color: '#E7E7E7' },
    heading: { color: '#F3F3F3', fontWeight: '700' },
    emphasis: { color: '#EEEEEE', fontWeight: '600' },
    link: { color: '#8DB6D7', textDecorationLine: 'underline' },
    inlineCode: { color: '#E8DFD6', backgroundColor: '#32302E' },
    command: { color: '#CAD5DE', backgroundColor: '#32302E' },
    path: { color: '#AFC3D4' },
    number: { color: '#C8AED9' },
    statusSuccess: { color: '#80B99D' },
    statusWarning: { color: '#D2AD6E' },
    statusError: { color: '#DC8A8A' },
    statusSecondary: { color: '#A6A6A6' },
} as const satisfies Readonly<Record<SemanticTextRole, SemanticRoleTextStyle>>;

export function resolveStudioSemanticTextPresentation({
    isTauriRuntime,
    requestedStyle,
    previewStyle,
    dark,
}: ResolveStudioSemanticTextPresentationInput): StudioSemanticTextPresentation | null {
    const visualStyle = resolveDesktopVisualStyle({
        isTauriRuntime,
        requestedStyle,
        previewStyle,
    });

    if (visualStyle !== 'studio') return null;

    return {
        visualStyle,
        roles: dark ? darkRoles : lightRoles,
        body: {
            fontSize: 15,
            lineHeight: 23,
            marginTop: 6,
            marginBottom: 8,
        },
        headings: {
            1: { fontSize: 22, lineHeight: 29, marginTop: 18, marginBottom: 8 },
            2: { fontSize: 18, lineHeight: 26, marginTop: 16, marginBottom: 7 },
            3: { fontSize: 16, lineHeight: 24, marginTop: 14, marginBottom: 6 },
            4: { fontSize: 15, lineHeight: 23, marginTop: 12, marginBottom: 5 },
            5: { fontSize: 15, lineHeight: 23, marginTop: 10, marginBottom: 4 },
            6: { fontSize: 15, lineHeight: 23, marginTop: 10, marginBottom: 4 },
        },
        inlineCode: {
            fontSize: 14,
            lineHeight: 21,
            borderRadius: 4,
        },
        codeBlock: {
            backgroundColor: dark ? '#272727' : '#F7F7F6',
            borderColor: dark ? '#3B3B3B' : '#E7E6E3',
            borderWidth: 1,
            borderRadius: 6,
        },
        metadata: {
            fontSize: 12,
            lineHeight: 18,
        },
        list: {
            gap: 4,
            indent: 18,
            markerColor: dark ? '#A6A6A6' : '#707070',
        },
        blockquote: {
            backgroundColor: dark ? '#262626' : '#F7F7F6',
            borderColor: dark ? '#55514C' : '#D8D6D2',
            borderLeftWidth: 3,
            borderRadius: 5,
            marginVertical: 8,
            paddingHorizontal: 13,
            paddingVertical: 9,
        },
        horizontalRule: {
            backgroundColor: dark ? '#414141' : '#E2E0DC',
            marginVertical: 14,
        },
        table: {
            borderColor: dark ? '#414141' : '#DFDDD9',
            headerBackgroundColor: dark ? '#2D2D2D' : '#F4F3F1',
            borderRadius: 6,
            cellPaddingHorizontal: 11,
            cellPaddingVertical: 7,
            headerFontSize: 14,
            bodyFontSize: 14,
            lineHeight: 21,
        },
        codeChrome: {
            labelColor: dark ? '#A6A6A6' : '#707070',
            copyBackgroundColor: dark ? '#343434' : '#FFFFFF',
            copyBorderColor: dark ? '#4A4A4A' : '#DDDCD9',
            copyTextColor: dark ? '#E7E7E7' : '#343434',
        },
        options: {
            gap: 6,
            marginVertical: 8,
            minHeight: 40,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 9,
            borderWidth: 1,
            backgroundColor: dark ? '#292929' : '#F7F7F6',
            borderColor: dark ? '#3C3C3C' : '#E5E3DF',
            pressedBackgroundColor: dark ? '#343434' : '#EEEDEB',
            hoverBackgroundColor: dark ? '#303030' : '#F1F0EE',
            hoverBorderColor: dark ? '#4A4A4A' : '#DAD8D4',
            focusBorderColor: dark ? 'rgba(132, 168, 255, 0.88)' : 'rgba(70, 111, 226, 0.82)',
            textColor: dark ? '#E7E7E7' : '#2D2D2D',
            fontSize: 14,
            lineHeight: 20,
        },
    };
}

export function resolveStudioMarkdownOptionState(
    presentation: StudioSemanticTextPresentation,
    state: Readonly<{ focused: boolean; hovered: boolean; pressed: boolean }>,
): Readonly<{ backgroundColor: string; borderColor: string }> {
    if (state.pressed) {
        return {
            backgroundColor: presentation.options.pressedBackgroundColor,
            borderColor: presentation.options.hoverBorderColor,
        };
    }
    if (state.focused) {
        return {
            backgroundColor: presentation.options.backgroundColor,
            borderColor: presentation.options.focusBorderColor,
        };
    }
    if (state.hovered) {
        return {
            backgroundColor: presentation.options.hoverBackgroundColor,
            borderColor: presentation.options.hoverBorderColor,
        };
    }
    return {
        backgroundColor: presentation.options.backgroundColor,
        borderColor: presentation.options.borderColor,
    };
}

type SemanticMarkdownSpan = Readonly<{
    text: string;
    styles: readonly ('italic' | 'bold' | 'semibold' | 'strikethrough' | 'code')[];
    url: string | null;
}>;

const markdownCommandPattern = /^(?:\$\s*)?(?:pnpm|npm|yarn|bun|git|gh|node|python3?|cargo|go|swift|xcodebuild|make|cmake|docker|kubectl|happy)(?:\s|$)/i;
const markdownPathPattern = /^(?:\/|\.\.?\/|~\/|[a-z]:[\\/])\S+$/i;
const markdownNumberPattern = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;

function resolveEmphasizedStatusRole(text: string): SemanticTextRole | null {
    const normalized = text.trim().toLowerCase();
    if (['complete', 'completed', 'success', 'succeeded', 'passed', 'done', 'ok'].includes(normalized)) {
        return 'statusSuccess';
    }
    if (['warning', 'warn', 'waiting', 'blocked'].includes(normalized)) {
        return 'statusWarning';
    }
    if (['error', 'failed', 'failure'].includes(normalized)) {
        return 'statusError';
    }
    if (['queued', 'pending', 'skipped', 'cancelled', 'canceled'].includes(normalized)) {
        return 'statusSecondary';
    }
    return null;
}

export function resolveMarkdownSpanRoles(
    span: SemanticMarkdownSpan,
    isInteractiveLink = false,
): SemanticTextRole[] {
    const roles: SemanticTextRole[] = [];
    const emphasized = span.styles.includes('bold') || span.styles.includes('semibold');
    if (emphasized) {
        roles.push('emphasis');
    }
    if (span.styles.includes('code')) {
        roles.push('inlineCode');
        const text = span.text.trim();
        if (markdownNumberPattern.test(text)) {
            roles.push('number');
        } else if (markdownPathPattern.test(text)) {
            roles.push('path');
        } else if (markdownCommandPattern.test(text)) {
            roles.push('command');
        }
    }
    if (emphasized) {
        const statusRole = resolveEmphasizedStatusRole(span.text);
        if (statusRole) roles.push(statusRole);
    }
    if (isInteractiveLink) roles.push('link');
    return roles;
}

type MarkdownSpanPresentationStyle =
    | SemanticRoleTextStyle
    | StudioSemanticTextPresentation['inlineCode'];

export function resolveMarkdownSpanPresentationStyles(
    span: SemanticMarkdownSpan,
    isInteractiveLink: boolean,
    presentation: StudioSemanticTextPresentation | null,
): readonly MarkdownSpanPresentationStyle[] {
    if (!presentation) return [];

    return resolveMarkdownSpanRoles(span, isInteractiveLink).flatMap((role) => (
        role === 'inlineCode'
            ? [presentation.roles.inlineCode, presentation.inlineCode]
            : [presentation.roles[role]]
    ));
}
