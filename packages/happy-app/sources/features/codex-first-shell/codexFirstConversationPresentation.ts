import {
    normalizeUserMessageBubbleColor,
    resolveUserMessageBubbleColor,
} from '@/utils/userMessageBubbleColor';

export type CodexFirstUserMessagePresentation = Readonly<{
    backgroundColor: string;
    borderColor: string;
    borderRadius: number;
    contentMaxWidth: '82%';
    marginBottom: number;
    paddingHorizontal: number;
    paddingVertical: number;
}>;

type ResolveCodexFirstUserMessagePresentationInput = Readonly<{
    enabled: boolean;
    isDark: boolean;
    selectedColor: unknown;
}>;

export function resolveCodexFirstUserMessagePresentation({
    enabled,
    isDark,
    selectedColor,
}: ResolveCodexFirstUserMessagePresentationInput): CodexFirstUserMessagePresentation | null {
    if (!enabled) return null;

    const normalizedColor = normalizeUserMessageBubbleColor(selectedColor);
    const palette = resolveUserMessageBubbleColor(normalizedColor, isDark);
    const usesObservedNeutral = !isDark && normalizedColor === 'gray';

    return {
        backgroundColor: usesObservedNeutral ? '#F3F3F4' : palette.background,
        borderColor: usesObservedNeutral ? '#F3F3F4' : palette.border,
        borderRadius: 16,
        contentMaxWidth: '82%',
        marginBottom: 8,
        paddingHorizontal: 14,
        paddingVertical: 7,
    };
}
