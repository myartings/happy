export type DesktopComposerModeChip = {
    key: 'model' | 'effort';
    label: string;
    enabled: boolean;
};

export type ResolveDesktopComposerModeChipsInput = {
    isStudioComposer: boolean;
    zenMode: boolean;
    modelLabel: string | null;
    effortLabel: string | null;
    canSelectModel: boolean;
    canSelectEffort: boolean;
};

export function resolveDesktopComposerModeChips({
    isStudioComposer,
    zenMode,
    modelLabel,
    effortLabel,
    canSelectModel,
    canSelectEffort,
}: ResolveDesktopComposerModeChipsInput): DesktopComposerModeChip[] {
    if (!isStudioComposer || zenMode) return [];

    const chips: DesktopComposerModeChip[] = [];
    if (modelLabel) {
        chips.push({ key: 'model', label: modelLabel, enabled: canSelectModel });
    }
    if (effortLabel) {
        chips.push({ key: 'effort', label: effortLabel, enabled: canSelectEffort });
    }
    return chips;
}
