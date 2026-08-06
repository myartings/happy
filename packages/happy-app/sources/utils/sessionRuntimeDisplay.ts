export type SessionPlatformKind = 'windows' | 'macos' | 'linux' | 'unknown';

export type SessionRuntimeDisplay = {
    platformKind: SessionPlatformKind;
    agentKind: string | null;
    agentLabel: string | null;
    modelLabel: string | null;
};

type SessionRuntimeDisplayInput = {
    metadata: {
        os?: string;
        flavor?: string | null;
        provider?: { kind?: string | null } | null;
        modelMode?: string | null;
        currentModelCode?: string | null;
        models?: Array<{
            code: string;
            id?: string;
            name?: string;
            value?: string;
            description?: string | null;
        }>;
    } | null | undefined;
    modelMode?: string | null;
    machinePlatform?: string | null;
};

export function getSessionPlatformKind(value: string | null | undefined): SessionPlatformKind {
    switch (value?.trim().toLowerCase()) {
        case 'win32':
        case 'windows':
            return 'windows';
        case 'darwin':
        case 'macos':
        case 'mac':
            return 'macos';
        case 'linux':
            return 'linux';
        default:
            return 'unknown';
    }
}

function agentKind(value: string | null | undefined): string | null {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) return null;
    if (normalized === 'gpt' || normalized === 'openai') return 'codex';
    if (normalized === 'anthropic') return 'claude';
    return normalized;
}

function agentLabel(kind: string | null): string | null {
    if (!kind) return null;
    const labels: Record<string, string> = {
        codex: 'Codex',
        claude: 'Claude',
        gemini: 'Gemini',
        openclaw: 'OpenClaw',
        agy: 'Agy',
        rig: 'Rig',
        grok: 'Grok',
        kimi: 'Kimi',
    };
    return labels[kind] ?? kind;
}

function modelLabel(value: string | null | undefined): string | null {
    const normalized = value?.trim();
    if (!normalized || normalized.toLowerCase() === 'default' || normalized.toLowerCase() === 'default model') {
        return null;
    }
    return normalized;
}

function resolvedModelLabel(metadata: SessionRuntimeDisplayInput['metadata'], selectedModel: string | null | undefined): string | null {
    const selected = modelLabel(selectedModel);
    if (!selected) return null;
    const advertisedModel = metadata?.models?.find((model) => model.code === selected || model.id === selected);
    return modelLabel(advertisedModel?.name ?? advertisedModel?.value) ?? selected;
}

export function resolveSessionRuntimeDisplay(input: SessionRuntimeDisplayInput): SessionRuntimeDisplay {
    const metadata = input.metadata;
    const resolvedAgentKind = agentKind(metadata?.provider?.kind ?? metadata?.flavor);
    return {
        platformKind: getSessionPlatformKind(metadata?.os ?? input.machinePlatform),
        agentKind: resolvedAgentKind,
        agentLabel: agentLabel(resolvedAgentKind),
        modelLabel: resolvedModelLabel(metadata, input.modelMode ?? metadata?.modelMode ?? metadata?.currentModelCode),
    };
}
