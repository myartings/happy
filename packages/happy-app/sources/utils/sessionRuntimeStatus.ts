export type SessionRuntimeState = 'running' | 'idle' | 'permission_required' | 'disconnected';

export type SessionRuntimeStatusInput = {
    isOnline: boolean;
    hasPermissions: boolean;
    isThinking: boolean;
};

export function resolveSessionRuntimeStatus(input: SessionRuntimeStatusInput): SessionRuntimeState {
    if (!input.isOnline) {
        return 'disconnected';
    }

    if (input.hasPermissions) {
        return 'permission_required';
    }

    if (input.isThinking) {
        return 'running';
    }

    return 'idle';
}
