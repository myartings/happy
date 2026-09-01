import { randomUUID } from 'node:crypto';

import type { Metadata, PermissionMode } from '@/api/types';

import {
    isRemoteCodexPermissionMode,
    shouldAutoApproveCodexApproval,
} from './executionPolicy';
import type { CodexRemoteModeState } from './remoteModeState';

export type CodexLivePermissionModeRequest = {
    requestId: string;
    permissionMode: string;
    generation: string;
};

export type CodexLivePermissionModeResponse = {
    requestId: string;
    permissionMode: PermissionMode;
    pendingApprovalsResolved: number;
    revision: number;
    generation: string;
};

export type CodexLivePermissionModeState = {
    permissionMode: PermissionMode;
    revision: number;
    generation: string;
};

export type CodexApprovalDecision = 'approved' | 'approved_for_session' | 'denied' | 'abort';

type RpcRegistrar = {
    registerHandler<TRequest = unknown, TResponse = unknown>(
        method: string,
        handler: (request: TRequest) => TResponse | Promise<TResponse>,
    ): void;
};

type LivePermissionModeSession = {
    rpcHandlerManager: RpcRegistrar;
    getMetadata(): { permissionModeRevision?: number } | null | undefined;
    updateMetadata(handler: (metadata: Metadata) => Metadata): void;
};

export class CodexLivePermissionModeController {
    private readonly remoteModeState: CodexRemoteModeState;
    private readonly approveAllPending: () => number;
    private readonly sandboxManagedByHappy: boolean;
    private readonly responsesByRequestId = new Map<string, CodexLivePermissionModeResponse>();
    private revision: number;
    private generation: string;
    private abortInProgress = false;
    private invalidatedThroughRevision = 0;

    constructor(options: {
        remoteModeState: CodexRemoteModeState;
        approveAllPending: () => number;
        sandboxManagedByHappy: boolean;
        initialRevision?: number;
        generation?: string;
    }) {
        this.remoteModeState = options.remoteModeState;
        this.approveAllPending = options.approveAllPending;
        this.sandboxManagedByHappy = options.sandboxManagedByHappy;
        this.revision = Number.isSafeInteger(options.initialRevision) && options.initialRevision! >= 0
            ? options.initialRevision!
            : 0;
        this.generation = options.generation ?? randomUUID();
    }

    beginAbort(): void {
        this.abortInProgress = true;
        this.invalidatedThroughRevision = this.revision;
        this.revision += 1;
        this.generation = randomUUID();
    }

    finishAbort(): void {
        this.abortInProgress = false;
    }

    advanceRevision(revision: number | null | undefined): void {
        if (Number.isSafeInteger(revision) && revision! >= 0) {
            this.revision = Math.max(this.revision, revision!);
        }
    }

    getState(): CodexLivePermissionModeState {
        return {
            permissionMode: this.remoteModeState.currentPermissionMode,
            revision: this.revision,
            generation: this.generation,
        };
    }

    apply(request: CodexLivePermissionModeRequest): CodexLivePermissionModeResponse {
        if (!request || typeof request.requestId !== 'string' || request.requestId.length === 0) {
            throw new Error('A permission-mode request ID is required');
        }
        if (!isRemoteCodexPermissionMode(request.permissionMode)) {
            throw new Error(`Unsupported Codex permission mode: ${String(request.permissionMode)}`);
        }
        if (this.abortInProgress) {
            throw new Error('Cannot change Codex permission mode while abort is in progress');
        }
        if (typeof request.generation !== 'string' || request.generation !== this.generation) {
            throw new Error('The permission-mode generation is stale');
        }

        const cached = this.responsesByRequestId.get(request.requestId);
        if (cached) {
            if (cached.revision <= this.invalidatedThroughRevision) {
                throw new Error('The permission-mode request was invalidated by abort');
            }
            return cached;
        }

        this.remoteModeState.applyExplicitPermissionMode(request.permissionMode);
        this.revision += 1;
        const pendingApprovalsResolved = shouldAutoApproveCodexApproval(
            request.permissionMode,
            this.sandboxManagedByHappy,
        )
            ? this.approveAllPending()
            : 0;

        const response = {
            requestId: request.requestId,
            permissionMode: request.permissionMode,
            pendingApprovalsResolved,
            revision: this.revision,
            generation: this.generation,
        };
        this.responsesByRequestId.set(request.requestId, response);
        return response;
    }

    confirm(
        acknowledgement: CodexLivePermissionModeResponse,
        publishState: (state: CodexLivePermissionModeState) => void,
    ): CodexLivePermissionModeState {
        const cached = acknowledgement?.requestId
            ? this.responsesByRequestId.get(acknowledgement.requestId)
            : undefined;
        const state = this.getState();
        if (!cached
            || cached.permissionMode !== acknowledgement.permissionMode
            || cached.revision !== acknowledgement.revision
            || cached.generation !== acknowledgement.generation
            || cached.pendingApprovalsResolved !== acknowledgement.pendingApprovalsResolved
            || state.permissionMode !== acknowledgement.permissionMode
            || state.revision !== acknowledgement.revision
            || state.generation !== acknowledgement.generation
            || this.abortInProgress) {
            throw new Error('The permission-mode acknowledgement is no longer current');
        }
        // Validation and publication scheduling happen in one synchronous CLI
        // turn. A later Abort can only enqueue its greater revision afterwards.
        publishState(state);
        return state;
    }
}

export async function resolveCodexApprovalDecision(options: {
    activeTurnPermissionMode: PermissionMode | null | undefined;
    remoteModeState: CodexRemoteModeState;
    sandboxManagedByHappy: boolean;
    requestDecision: () => Promise<CodexApprovalDecision>;
}): Promise<CodexApprovalDecision> {
    const permissionMode = selectCodexApprovalPermissionMode(
        options.activeTurnPermissionMode,
        options.remoteModeState,
    );
    return shouldAutoApproveCodexApproval(permissionMode, options.sandboxManagedByHappy)
        ? 'approved'
        : options.requestDecision();
}

export async function runWithCodexLivePermissionModeAbortGuard(
    controller: CodexLivePermissionModeController | undefined,
    abortWork: () => Promise<void>,
    resetAfterAbort: () => void,
): Promise<void> {
    controller?.beginAbort();
    try {
        await abortWork();
    } finally {
        try {
            resetAfterAbort();
        } finally {
            controller?.finishAbort();
        }
    }
}

export function withCodexLivePermissionModeMetadata<T extends Record<string, unknown>>(
    metadata: T,
    state: CodexLivePermissionModeState,
): T | (T & { permissionMode: PermissionMode; permissionModeRevision: number }) {
    const currentRevision = metadata.permissionModeRevision;
    if (typeof currentRevision === 'number'
        && Number.isSafeInteger(currentRevision)
        && currentRevision > state.revision) {
        return metadata;
    }
    return {
        ...metadata,
        permissionMode: state.permissionMode,
        permissionModeRevision: state.revision,
    };
}

export function registerCodexLivePermissionModeRpc(
    registrar: RpcRegistrar,
    controller: CodexLivePermissionModeController,
    publishState: (state: CodexLivePermissionModeState) => void = () => {},
): void {
    registrar.registerHandler<Record<string, never>, CodexLivePermissionModeState>(
        'permission-mode-state',
        async () => controller.getState(),
    );
    registrar.registerHandler<CodexLivePermissionModeRequest, CodexLivePermissionModeResponse>(
        'permission-mode',
        async (request) => controller.apply(request),
    );
    registrar.registerHandler<CodexLivePermissionModeResponse, CodexLivePermissionModeState>(
        'permission-mode-confirm',
        async (acknowledgement) => controller.confirm(acknowledgement, publishState),
    );
}

export function registerCodexLivePermissionModeRpcForSession(
    session: LivePermissionModeSession,
    controller: CodexLivePermissionModeController,
): void {
    controller.advanceRevision(session.getMetadata()?.permissionModeRevision);
    registerCodexLivePermissionModeRpc(
        session.rpcHandlerManager,
        controller,
        (state) => session.updateMetadata((metadata) => withCodexLivePermissionModeMetadata(metadata, state)),
    );
}

export function selectCodexApprovalPermissionMode(
    activeTurnPermissionMode: PermissionMode | null | undefined,
    remoteModeState: CodexRemoteModeState,
): PermissionMode {
    return remoteModeState.currentPermissionModeExplicitlySet
        ? remoteModeState.currentPermissionMode
        : (activeTurnPermissionMode ?? remoteModeState.currentPermissionMode);
}
