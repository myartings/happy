import type { VisualStyle } from '@/features/studio-visual-style/studioVisualStyle';

export type StudioConversationLayout = {
    visualStyle: VisualStyle;
    headerHeight: number | null;
    headerHorizontalPadding: number | null;
    messageViewportMaxWidth: number | null;
    messageTopGap: number | null;
    messageBottomGap: number | null;
};

type ResolveStudioConversationLayoutInput = {
    codexFirstEnabled?: boolean;
    isTauriRuntime: boolean;
    visualStyle: VisualStyle;
};

export function resolveStudioConversationLayout({
    codexFirstEnabled = false,
    isTauriRuntime,
    visualStyle,
}: ResolveStudioConversationLayoutInput): StudioConversationLayout {
    if (!isTauriRuntime || visualStyle !== 'studio') {
        return {
            visualStyle: 'default',
            headerHeight: null,
            headerHorizontalPadding: null,
            messageViewportMaxWidth: null,
            messageTopGap: null,
            messageBottomGap: null,
        };
    }

    if (codexFirstEnabled) {
        // The reference's visible content aligns at roughly 750pt. Message
        // rows keep their existing 16pt safety inset, hence the 782pt list
        // viewport while the Composer itself resolves to 750pt.
        return {
            visualStyle: 'studio',
            headerHeight: 46,
            headerHorizontalPadding: 16,
            messageViewportMaxWidth: 782,
            messageTopGap: 24,
            messageBottomGap: 14,
        };
    }

    return {
        visualStyle: 'studio',
        headerHeight: 54,
        headerHorizontalPadding: 20,
        messageViewportMaxWidth: 832,
        messageTopGap: 28,
        messageBottomGap: 16,
    };
}
