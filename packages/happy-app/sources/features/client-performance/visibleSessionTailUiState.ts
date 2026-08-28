export type VisibleSessionTailUiState = {
    atLiveTail: boolean;
    readingOlderHistory: boolean;
    targetActive: boolean;
    composerBusy: boolean;
    viewportBusy: boolean;
};

/** Aggregate every mounted view conservatively; one protected view blocks all. */
export function aggregateVisibleSessionTailUiSources(
    sources: Iterable<Partial<VisibleSessionTailUiState>>,
): VisibleSessionTailUiState | null {
    const sourceList = [...sources];
    if (sourceList.length === 0) return null;
    const transcriptSources = sourceList.filter((source) => (
        source.atLiveTail !== undefined
        || source.readingOlderHistory !== undefined
        || source.targetActive !== undefined
        || source.viewportBusy !== undefined
    ));
    return {
        atLiveTail: transcriptSources.length > 0
            && transcriptSources.every((source) => source.atLiveTail === true),
        readingOlderHistory: transcriptSources.some((source) => source.readingOlderHistory === true),
        targetActive: transcriptSources.some((source) => source.targetActive === true),
        composerBusy: sourceList.some((source) => source.composerBusy === true),
        viewportBusy: transcriptSources.some((source) => source.viewportBusy === true),
    };
}
