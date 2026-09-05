import * as React from 'react';
import { View } from 'react-native';
import { DiffChunk } from '@/components/diff/DiffChunk';
import { useSetting } from '@/sync/storage';
import { useStudioToolPresentation } from '@/features/studio-tool-presentation/useStudioToolPresentation';

interface ToolDiffViewProps {
    /** Pre-built unified-diff patch string. Preferred when available. */
    patch?: string;
    /** Pair used to derive a patch if `patch` isn't supplied. */
    oldText?: string;
    newText?: string;
    /** File name — used for language detection in syntax highlighting. */
    fileName?: string;
    style?: any;
    showLineNumbers?: boolean;
    /** No longer used: the marker column is always drawn in the pinned gutter. */
    showPlusMinusSymbols?: boolean;
}

export const ToolDiffView = React.memo<ToolDiffViewProps>(({
    patch,
    oldText,
    newText,
    fileName,
    style,
    showLineNumbers,
}) => {
    const wrapLines = useSetting('wrapLinesInDiffs');
    const showLineNumbersInToolViews = useSetting('showLineNumbersInToolViews');
    const studioPresentation = useStudioToolPresentation();

    return (
        <View style={[
            { flex: 1 },
            studioPresentation && {
                backgroundColor: studioPresentation.diff.backgroundColor,
                borderRadius: studioPresentation.diff.borderRadius,
                overflow: 'hidden',
            },
            style,
        ]}>
            <DiffChunk
                patch={patch}
                oldText={patch ? undefined : oldText ?? ''}
                newText={patch ? undefined : newText ?? ''}
                fileName={fileName ?? 'file.txt'}
                wrap={wrapLines}
                showLineNumbers={showLineNumbers ?? showLineNumbersInToolViews}
            />
        </View>
    );
});
