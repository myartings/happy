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
    isTauriRuntime: boolean;
    visualStyle: VisualStyle;
};

export function resolveStudioConversationLayout({
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

    return {
        visualStyle: 'studio',
        headerHeight: 54,
        headerHorizontalPadding: 20,
        messageViewportMaxWidth: 832,
        messageTopGap: 28,
        messageBottomGap: 16,
    };
}
