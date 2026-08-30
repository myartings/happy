export type DesktopComposerModeChip = {
    key: 'model' | 'effort' | 'fast';
    label: string;
    enabled: boolean;
    selected?: boolean;
};

export type ResolveDesktopComposerModeChipsInput = {
    isStudioComposer: boolean;
    zenMode: boolean;
    modelLabel: string | null;
    effortLabel: string | null;
    canSelectModel: boolean;
    canSelectEffort: boolean;
    showFastToggle?: boolean;
    fastMode?: boolean;
};

export function resolveDesktopComposerModeChips({
    isStudioComposer,
    zenMode,
    modelLabel,
    effortLabel,
    canSelectModel,
    canSelectEffort,
    showFastToggle = false,
    fastMode = false,
}: ResolveDesktopComposerModeChipsInput): DesktopComposerModeChip[] {
    if (zenMode) return [];

    const chips: DesktopComposerModeChip[] = [];
    if (isStudioComposer && modelLabel) {
        chips.push({ key: 'model', label: modelLabel, enabled: canSelectModel });
    }
    if (isStudioComposer && effortLabel) {
        chips.push({ key: 'effort', label: effortLabel, enabled: canSelectEffort });
    }
    if (showFastToggle) {
        chips.push({ key: 'fast', label: 'Fast', enabled: true, selected: fastMode });
    }
    return chips;
}
