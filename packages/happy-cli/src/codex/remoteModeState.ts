import type { MessageMeta, PermissionMode } from '@/api/types';

import type { CodexServiceTier, ReasoningEffort } from './codexAppServerTypes';
import { isRemoteCodexPermissionMode } from './executionPolicy';

const VALID_REMOTE_EFFORTS: readonly ReasoningEffort[] = [
    'none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra',
];

type Resolution<T> =
    | { kind: 'updated'; value: T }
    | { kind: 'retained'; value: T }
    | { kind: 'ignored'; incoming: unknown; value: T };

export type CodexRemoteModeResolution = {
    permissionMode: PermissionMode;
    model: string | undefined;
    effort: ReasoningEffort | undefined;
    serviceTier: CodexServiceTier;
    permission: Resolution<PermissionMode>;
    modelResolution: Resolution<string | undefined>;
    effortResolution: Resolution<ReasoningEffort | undefined>;
    serviceTierResolution: Resolution<CodexServiceTier>;
};

export type CodexMessageRoute = {
    model?: string;
    effort?: ReasoningEffort;
    serviceTier: CodexServiceTier;
};

export function codexMessageRoute(
    mode: CodexMessageRoute,
): CodexMessageRoute {
    return {
        model: mode.model,
        effort: mode.effort,
        serviceTier: mode.serviceTier,
    };
}

/**
 * Mutable per-session mode state for remote Codex turns.
 *
 * The launch policy is restored immediately after abort for the approval
 * handler's safety window. Model and effort stay sticky: current apps omit
 * unselected fields when a runtime-confirmed route exists and reassert only
 * explicit per-session selections.
 */
export class CodexRemoteModeState {
    readonly initialPermissionMode: PermissionMode;
    currentPermissionMode: PermissionMode;
    currentPermissionModeExplicitlySet = false;
    currentModel: string | undefined;
    currentEffort: ReasoningEffort | undefined;
    currentServiceTier: CodexServiceTier;

    constructor(options: {
        permissionMode: PermissionMode;
        model?: string;
        effort?: ReasoningEffort;
        serviceTier?: CodexServiceTier;
    }) {
        this.initialPermissionMode = options.permissionMode;
        this.currentPermissionMode = options.permissionMode;
        this.currentModel = options.model;
        this.currentEffort = options.effort;
        this.currentServiceTier = options.serviceTier ?? 'default';
    }

    applyExplicitPermissionMode(permissionMode: PermissionMode): void {
        this.currentPermissionMode = permissionMode;
        this.currentPermissionModeExplicitlySet = true;
    }

    resolve(meta: MessageMeta | undefined): CodexRemoteModeResolution {
        let permission: Resolution<PermissionMode>;
        if (meta?.permissionMode) {
            if (isRemoteCodexPermissionMode(meta.permissionMode)) {
                this.applyExplicitPermissionMode(meta.permissionMode);
                permission = { kind: 'updated', value: this.currentPermissionMode };
            } else {
                permission = {
                    kind: 'ignored',
                    incoming: meta.permissionMode,
                    value: this.currentPermissionMode,
                };
            }
        } else {
            permission = { kind: 'retained', value: this.currentPermissionMode };
        }

        let modelResolution: Resolution<string | undefined>;
        if (meta !== undefined && Object.prototype.hasOwnProperty.call(meta, 'model')) {
            this.currentModel = meta?.model || undefined;
            modelResolution = { kind: 'updated', value: this.currentModel };
        } else {
            modelResolution = { kind: 'retained', value: this.currentModel };
        }

        let effortResolution: Resolution<ReasoningEffort | undefined>;
        if (meta !== undefined && Object.prototype.hasOwnProperty.call(meta, 'effort')) {
            const incoming = meta?.effort;
            if (incoming === null || incoming === undefined) {
                this.currentEffort = undefined;
                effortResolution = { kind: 'updated', value: undefined };
            } else if ((VALID_REMOTE_EFFORTS as readonly string[]).includes(incoming)) {
                this.currentEffort = incoming as ReasoningEffort;
                effortResolution = { kind: 'updated', value: this.currentEffort };
            } else {
                effortResolution = {
                    kind: 'ignored',
                    incoming,
                    value: this.currentEffort,
                };
            }
        } else {
            effortResolution = { kind: 'retained', value: this.currentEffort };
        }

        let serviceTierResolution: Resolution<CodexServiceTier>;
        if (meta !== undefined && Object.prototype.hasOwnProperty.call(meta, 'serviceTier')) {
            const incoming = meta?.serviceTier;
            if (incoming === 'default' || incoming === 'fast') {
                this.currentServiceTier = incoming;
                serviceTierResolution = { kind: 'updated', value: this.currentServiceTier };
            } else {
                serviceTierResolution = {
                    kind: 'ignored',
                    incoming,
                    value: this.currentServiceTier,
                };
            }
        } else {
            serviceTierResolution = { kind: 'retained', value: this.currentServiceTier };
        }

        return {
            permissionMode: this.currentPermissionMode,
            model: this.currentModel,
            effort: this.currentEffort,
            serviceTier: this.currentServiceTier,
            permission,
            modelResolution,
            effortResolution,
            serviceTierResolution,
        };
    }

    resetAfterAbort(): void {
        this.currentPermissionMode = this.initialPermissionMode;
        this.currentPermissionModeExplicitlySet = false;
    }
}
