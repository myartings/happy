export type CodexFirstSessionNavigationPresentation = {
    mode: 'flat' | 'project';
    showMachineHeaders: boolean;
    showProjectMachineName: boolean;
};

type ResolveCodexFirstSessionNavigationInput = {
    codexFirstEnabled: boolean;
    flatSessionList: boolean;
    machineGroupCount: number;
};

export function resolveCodexFirstSessionNavigation({
    codexFirstEnabled,
    flatSessionList,
    machineGroupCount,
}: ResolveCodexFirstSessionNavigationInput): CodexFirstSessionNavigationPresentation {
    return {
        mode: flatSessionList ? 'flat' : 'project',
        showMachineHeaders: !codexFirstEnabled,
        showProjectMachineName: !codexFirstEnabled || machineGroupCount > 1,
    };
}
