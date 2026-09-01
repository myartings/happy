import {
    resolveDesktopVisualStyle,
    type VisualStyle,
} from '../studio-visual-style/studioVisualStyle';
import { STUDIO_PANEL_GEOMETRY } from '../studio-panel-resize/studioPanelResizePolicy';

export type DesktopHostPlatform = 'macos' | 'windows' | 'linux' | 'unknown';

export type CodexFirstDesktopExperience = 'codex-first' | 'legacy-happy';

export type CodexFirstDestination = {
    availability: 'always' | 'github-issues' | 'project-todos';
    id: 'new-session' | 'tasks' | 'issues' | 'artifacts' | 'machines-agents';
};

const CODEX_FIRST_DESTINATIONS: readonly CodexFirstDestination[] = Object.freeze([
    { availability: 'always', id: 'new-session' },
    { availability: 'project-todos', id: 'tasks' },
    { availability: 'github-issues', id: 'issues' },
    { availability: 'always', id: 'artifacts' },
    { availability: 'always', id: 'machines-agents' },
]);

export function resolveCodexFirstRollbackRequested(buildValue: string | undefined): boolean {
    return buildValue?.trim() === '0';
}

type ResolveDesktopHostPlatformInput = {
    navigatorPlatform?: string | null;
    userAgent?: string | null;
};

export function resolveDesktopHostPlatform({
    navigatorPlatform,
    userAgent,
}: ResolveDesktopHostPlatformInput): DesktopHostPlatform {
    const signal = `${navigatorPlatform ?? ''} ${userAgent ?? ''}`.toLowerCase();

    if (signal.includes('iphone') || signal.includes('ipad') || signal.includes('android')) {
        return 'unknown';
    }
    if (signal.includes('mac')) {
        return 'macos';
    }
    if (signal.includes('win')) {
        return 'windows';
    }
    if (signal.includes('linux')) {
        return 'linux';
    }
    return 'unknown';
}

export type CodexFirstDesktopContract = {
    enabled: boolean;
    experience: CodexFirstDesktopExperience;
    hostPlatform: DesktopHostPlatform;
    navigation: {
        defaultSessionOrganization: 'project-first' | 'preserve-existing';
        destinations: readonly CodexFirstDestination[];
        notificationsVisible: boolean;
        searchVisible: boolean;
    };
    presentation: {
        usesStudioPrimitives: boolean;
        visualStyle: VisualStyle;
    };
    product: {
        customization: 'Happy' | null;
        name: 'Happy' | 'Happy Codex';
        reference: 'Codex' | null;
    };
    regions: {
        leftNavigation: {
            defaultWidth: number;
            maxWidth: number;
            minWidth: number;
            persistentAtStandardWidth: true;
            resizable: true;
        };
        main: {
            minUsableWidth: number;
        };
        rightWorkspace: {
            defaultWidth: number;
            maxWidth: number;
            minWidth: number;
            optional: true;
            resizable: true;
        };
        titleBarSafeAreaOwner: 'shell';
    } | null;
    rollback: {
        active: boolean;
        available: boolean;
    };
};

type ResolveCodexFirstDesktopContractInput = {
    hostPlatform: DesktopHostPlatform;
    isTauriRuntime: boolean;
    requestedVisualStyle?: VisualStyle;
    rollbackRequested?: boolean;
};

export function resolveCodexFirstDesktopContract({
    hostPlatform,
    isTauriRuntime,
    requestedVisualStyle = 'default',
    rollbackRequested = false,
}: ResolveCodexFirstDesktopContractInput): CodexFirstDesktopContract {
    const available = isTauriRuntime
        && (hostPlatform === 'macos' || hostPlatform === 'windows');
    const enabled = available && !rollbackRequested;
    const visualStyle = resolveDesktopVisualStyle({
        isTauriRuntime,
        requestedStyle: requestedVisualStyle,
    });

    return {
        enabled,
        experience: enabled ? 'codex-first' : 'legacy-happy',
        hostPlatform,
        navigation: {
            defaultSessionOrganization: enabled ? 'project-first' : 'preserve-existing',
            destinations: enabled ? CODEX_FIRST_DESTINATIONS : [],
            notificationsVisible: enabled,
            searchVisible: enabled,
        },
        presentation: {
            usesStudioPrimitives: visualStyle === 'studio',
            visualStyle,
        },
        product: enabled
            ? {
                customization: 'Happy',
                name: 'Happy Codex',
                reference: 'Codex',
            }
            : {
                customization: null,
                name: 'Happy',
                reference: null,
            },
        regions: enabled
            ? {
                leftNavigation: {
                    ...STUDIO_PANEL_GEOMETRY.left,
                    persistentAtStandardWidth: true,
                    resizable: true,
                },
                main: {
                    minUsableWidth: STUDIO_PANEL_GEOMETRY.minMainWidth,
                },
                rightWorkspace: {
                    ...STUDIO_PANEL_GEOMETRY.right,
                    optional: true,
                    resizable: true,
                },
                titleBarSafeAreaOwner: 'shell',
            }
            : null,
        rollback: {
            active: available && rollbackRequested,
            available,
        },
    };
}
