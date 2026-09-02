import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => {
    const state: {
        userMessageHandler: ((message: any) => void) | null;
        metadata: Record<string, any>;
        queue: any[];
        queueWaitStarted: boolean;
        queueWake: (() => void) | null;
        activeThread: boolean;
        threadId: string | null;
        releaseMetadata: (() => void) | null;
        metadataAck: Promise<void>;
        releaseDaemon: (() => void) | null;
        daemonAck: Promise<void>;
        initialOffline: boolean;
        sessionRequestCount: number;
        releaseReconnect: ((value: any) => void) | null;
        rejectReconnect: ((error: Error) => void) | null;
        reconnectReady: Promise<any>;
        firstMessageMeta: Record<string, unknown> | undefined;
    } = {} as any;

    const resetDeferreds = () => {
        state.metadataAck = new Promise<void>((resolve) => {
            state.releaseMetadata = resolve;
        });
        state.daemonAck = new Promise<void>((resolve) => {
            state.releaseDaemon = resolve;
        });
        state.reconnectReady = new Promise((resolve, reject) => {
            state.releaseReconnect = resolve;
            state.rejectReconnect = reject;
        });
    };

    return {
        state,
        resetDeferreds,
        startThread: vi.fn(),
        sendTurnAndWait: vi.fn(),
        notifyDaemonCodexEffectiveRoute: vi.fn(),
        reconnectionCancel: vi.fn(),
        session: {} as any,
    };
});

vi.mock('node:child_process', () => ({
    execSync: vi.fn(() => 'codex-cli 1.0.0'),
}));

vi.mock('@/persistence', () => ({
    readSettings: vi.fn(async () => ({ machineId: 'machine-run-codex' })),
}));

vi.mock('@/api/api', () => ({
    ApiClient: {
        create: vi.fn(async () => ({
            getOrCreateMachine: vi.fn(async () => ({})),
            getOrCreateSession: vi.fn(async ({ metadata, state }: any) => {
                if (harness.state.initialOffline && harness.state.sessionRequestCount++ === 0) {
                    return null;
                }
                return {
                    id: 'happy-session-run-codex',
                    seq: 0,
                    metadata,
                    metadataVersion: 0,
                    agentState: state,
                    agentStateVersion: 0,
                    encryptionKey: new Uint8Array(32),
                    encryptionVariant: 'legacy',
                };
            }),
            push: () => ({ sendSessionNotification: vi.fn(async () => ({})) }),
        })),
    },
}));

vi.mock('@/daemon/run', () => ({ initialMachineMetadata: {} }));

vi.mock('@/utils/setupOfflineReconnection', () => ({
    setupOfflineReconnection: ({ metadata, response }: any) => {
        harness.state.metadata = metadata;
        return {
            session: harness.session,
            reconnectionHandle: response ? null : { cancel: harness.reconnectionCancel },
            readySession: response
                ? Promise.resolve({ session: harness.session, response })
                : harness.state.reconnectReady,
        };
    },
}));

vi.mock('@/daemon/controlClient', () => ({
    notifyDaemonSessionStarted: vi.fn(async () => ({})),
    notifyDaemonCodexEffectiveRoute: harness.notifyDaemonCodexEffectiveRoute,
}));

vi.mock('@/claude/utils/startHappyServer', () => ({
    startHappyServer: vi.fn(async () => ({ url: 'http://happy-mcp.test', stop: vi.fn() })),
}));

vi.mock('@/projectPath', () => ({ projectPath: () => '/tmp/happy-cli' }));
vi.mock('./codexSkills', () => ({ discoverCodexSkillCommands: vi.fn(async () => []) }));
vi.mock('@/claude/registerKillSessionHandler', () => ({ registerKillSessionHandler: vi.fn() }));
vi.mock('@/utils/serverConnectionErrors', () => ({ connectionState: { setBackend: vi.fn() } }));
vi.mock('@/ui/logger', () => ({
    logger: {
        debug: vi.fn(),
        warn: vi.fn(),
        getLogPath: vi.fn(() => '/tmp/happy.log'),
    },
}));

vi.mock('./utils/permissionHandler', () => ({
    CodexPermissionHandler: class {
        reset = vi.fn();
        abortAll = vi.fn();
        approveAllPending = vi.fn(() => 0);
        updateSession = vi.fn();
        handleToolCall = vi.fn();
    },
}));

vi.mock('./utils/reasoningProcessor', () => ({
    ReasoningProcessor: class {
        abort = vi.fn();
        handleSectionBreak = vi.fn();
        processDelta = vi.fn();
        complete = vi.fn();
    },
}));

vi.mock('./utils/diffProcessor', () => ({
    DiffProcessor: class {
        abort = vi.fn();
        reset = vi.fn();
        processDiff = vi.fn();
    },
}));

vi.mock('./livePermissionModeController', async () => {
    const actual = await vi.importActual<typeof import('./livePermissionModeController')>('./livePermissionModeController');
    return {
        ...actual,
        CodexLivePermissionModeController: class {
            getState = vi.fn(() => ({}));
            approveAllPending = vi.fn();
        },
        registerCodexLivePermissionModeRpcForSession: vi.fn(),
    };
});

vi.mock('@/utils/MessageQueue2', () => ({
    MessageQueue2: class {
        push(message: string, mode: any, attachments?: any[], clientUserMessageId?: string) {
            harness.state.queue.push({ message, mode, attachments, clientUserMessageId });
            harness.state.queueWake?.();
            harness.state.queueWake = null;
        }
        pushImmediate(message: string, mode: any) { this.push(message, mode); }
        pushIsolated(message: string, mode: any, attachments?: any[], clientUserMessageId?: string) {
            this.push(message, mode, attachments, clientUserMessageId);
        }
        pushIsolateAndClear(message: string, mode: any, attachments?: any[], clientUserMessageId?: string) {
            harness.state.queue = [];
            this.push(message, mode, attachments, clientUserMessageId);
        }
        pushUncertain(message: string, mode: any, attachments: any[] | undefined, clientUserMessageId: string) {
            this.push(message, mode, attachments, clientUserMessageId);
        }
        unshift(message: string, mode: any) { harness.state.queue.unshift({ message, mode }); }
        size() { return harness.state.queue.length; }
        async waitForMessagesAndGetAsString() {
            if (harness.state.queue.length > 0) {
                harness.state.queueWaitStarted = true;
                return harness.state.queue.shift();
            }
            if (harness.state.queueWaitStarted) return null;
            harness.state.queueWaitStarted = true;
            await new Promise<void>((resolve) => {
                harness.state.queueWake = resolve;
            });
            return harness.state.queue.shift() ?? null;
        }
    },
}));

vi.mock('./codexAppServerClient', () => ({
    CodexTurnStartDeliveryUnknownError: class extends Error {},
    CodexAppServerClient: class {
        sandboxEnabled = false;
        turnId = null;
        setApprovalHandler = vi.fn();
        setEventHandler = vi.fn();
        connect = vi.fn(async () => {
            harness.state.userMessageHandler?.({
                localKey: 'first-message',
                content: { text: 'hello from the first message' },
                meta: harness.state.firstMessageMeta,
            });
        });
        disconnect = vi.fn(async () => {});
        hasActiveThread = () => harness.state.activeThread;
        get threadId() { return harness.state.threadId; }
        startThread = harness.startThread;
        sendTurnAndWait = harness.sendTurnAndWait;
        supportsGoalActions = () => false;
        supportsClientUserMessageIds = () => true;
        clearThreadState = vi.fn();
        reconcilePendingTurn = vi.fn();
        reconnectAndResumeThread = vi.fn();
        steerTurn = vi.fn();
        abortTurnWithFallback = vi.fn(async () => ({ forcedRestart: false, resumedThread: true }));
        interruptTurn = vi.fn();
        readThread = vi.fn();
        setGoal = vi.fn();
        clearGoal = vi.fn();
    },
}));

import { runCodex } from './runCodex';

describe('runCodex launch-pinned cold path', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        harness.state.userMessageHandler = null;
        harness.state.metadata = {};
        harness.state.queue = [];
        harness.state.queueWaitStarted = false;
        harness.state.queueWake = null;
        harness.state.activeThread = false;
        harness.state.threadId = null;
        harness.state.initialOffline = false;
        harness.state.sessionRequestCount = 0;
        harness.state.firstMessageMeta = { model: 'gpt-5.6-terra', effort: 'high' };
        harness.resetDeferreds();

        harness.session = {
            sessionId: 'happy-session-run-codex',
            onUserMessage: vi.fn((handler: (message: any) => void) => {
                harness.state.userMessageHandler = handler;
            }),
            onFileEvent: vi.fn(),
            drainAttachmentsForUserMessage: vi.fn(async () => []),
            trackAttachmentDownload: vi.fn(),
            uploadLocalImageAttachmentEnvelope: vi.fn(),
            getMetadata: vi.fn(() => harness.state.metadata),
            updateMetadata: vi.fn((handler: (metadata: any) => any) => {
                harness.state.metadata = handler(harness.state.metadata);
            }),
            updateMetadataAndWait: vi.fn(async (handler: (metadata: any) => any) => {
                const next = handler(harness.state.metadata);
                await harness.state.metadataAck;
                harness.state.metadata = next;
            }),
            updateAgentState: vi.fn(),
            keepAlive: vi.fn(),
            sendSessionProtocolMessage: vi.fn(),
            sendSessionEvent: vi.fn(),
            sendSessionDeath: vi.fn(),
            flush: vi.fn(async () => {}),
            close: vi.fn(async () => {}),
            rpcHandlerManager: { registerHandler: vi.fn() },
        };

        harness.startThread.mockImplementation(async (opts: any) => {
            harness.state.activeThread = true;
            harness.state.threadId = 'thread-luna-max';
            return {
                threadId: 'thread-luna-max',
                model: opts.model,
                reasoningEffort: opts.effort,
            };
        });
        harness.sendTurnAndWait.mockResolvedValue({ aborted: false });
        harness.notifyDaemonCodexEffectiveRoute.mockImplementation(async () => {
            await harness.state.daemonAck;
            return {};
        });
    });

    it('publishes Luna/Max before the first message and reuses that thread for an explicit override', async () => {
        const running = runCodex({
            credentials: {} as any,
            model: 'gpt-5.6-luna',
            effort: 'max',
        });

        await vi.waitFor(() => expect(harness.startThread).toHaveBeenCalledOnce());
        expect(harness.startThread).toHaveBeenCalledWith(expect.objectContaining({
            model: 'gpt-5.6-luna',
            effort: 'max',
        }));
        expect(harness.sendTurnAndWait).not.toHaveBeenCalled();
        expect(harness.notifyDaemonCodexEffectiveRoute).not.toHaveBeenCalled();

        harness.state.releaseMetadata?.();
        await vi.waitFor(() => expect(harness.notifyDaemonCodexEffectiveRoute).toHaveBeenCalledWith(
            'happy-session-run-codex',
            { effectiveModel: 'gpt-5.6-luna', effectiveReasoningEffort: 'max' },
        ));
        expect(harness.sendTurnAndWait).not.toHaveBeenCalled();

        harness.state.releaseDaemon?.();
        await vi.waitFor(() => expect(harness.sendTurnAndWait).toHaveBeenCalledOnce());
        expect(harness.startThread).toHaveBeenCalledOnce();
        expect(harness.sendTurnAndWait).toHaveBeenCalledWith(
            expect.stringContaining('hello from the first message'),
            expect.objectContaining({ model: 'gpt-5.6-terra', effort: 'high' }),
        );
        await running;
    });

    it('reuses Luna/Max for the first turn when the first message has no route override', async () => {
        harness.state.firstMessageMeta = undefined;
        const running = runCodex({
            credentials: {} as any,
            model: 'gpt-5.6-luna',
            effort: 'max',
        });

        await vi.waitFor(() => expect(harness.startThread).toHaveBeenCalledOnce());
        harness.state.releaseMetadata?.();
        await vi.waitFor(() => expect(harness.notifyDaemonCodexEffectiveRoute).toHaveBeenCalled());
        harness.state.releaseDaemon?.();
        await vi.waitFor(() => expect(harness.sendTurnAndWait).toHaveBeenCalledOnce());

        expect(harness.startThread).toHaveBeenCalledOnce();
        expect(harness.sendTurnAndWait).toHaveBeenCalledWith(
            expect.stringContaining('hello from the first message'),
            expect.objectContaining({ model: 'gpt-5.6-luna', effort: 'max' }),
        );
        await running;
    });

    it('keeps hot reconnection alive and withholds Codex launch while the Happy Session is offline', async () => {
        harness.state.initialOffline = true;
        const running = runCodex({
            credentials: {} as any,
            model: 'gpt-5.6-luna',
            effort: 'max',
        });

        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(harness.startThread).not.toHaveBeenCalled();
        expect(harness.reconnectionCancel).not.toHaveBeenCalled();

        harness.state.releaseReconnect?.({
            session: harness.session,
            response: {
                id: 'happy-session-run-codex',
                seq: 0,
                metadata: harness.state.metadata,
                metadataVersion: 0,
                agentState: {},
                agentStateVersion: 0,
                encryptionKey: new Uint8Array(32),
                encryptionVariant: 'legacy',
            },
        });
        await vi.waitFor(() => expect(harness.startThread).toHaveBeenCalledOnce());
        expect(harness.sendTurnAndWait).not.toHaveBeenCalled();

        harness.state.releaseMetadata?.();
        await vi.waitFor(() => expect(harness.notifyDaemonCodexEffectiveRoute).toHaveBeenCalled());
        harness.state.releaseDaemon?.();
        await vi.waitFor(() => expect(harness.sendTurnAndWait).toHaveBeenCalledOnce());
        await running;
        expect(harness.reconnectionCancel).toHaveBeenCalledOnce();
    });

    it('rejects and cleans up without starting Codex when offline reconnection terminates', async () => {
        harness.state.initialOffline = true;
        const running = runCodex({
            credentials: {} as any,
            model: 'gpt-5.6-luna',
            effort: 'max',
        });
        const rejected = expect(running).rejects.toMatchObject({
            name: 'OfflineReconnectionTerminalError',
        });

        harness.state.rejectReconnect?.(Object.assign(new Error('auth failed'), {
            name: 'OfflineReconnectionTerminalError',
        }));

        await rejected;
        expect(harness.startThread).not.toHaveBeenCalled();
        expect(harness.sendTurnAndWait).not.toHaveBeenCalled();
        expect(harness.reconnectionCancel).toHaveBeenCalledOnce();
    });

    it('rejects and cleans up without starting Codex when offline readiness is cancelled', async () => {
        harness.state.initialOffline = true;
        const running = runCodex({
            credentials: {} as any,
            model: 'gpt-5.6-luna',
            effort: 'max',
        });
        const rejected = expect(running).rejects.toMatchObject({
            name: 'OfflineReconnectionCancelledError',
        });

        harness.state.rejectReconnect?.(Object.assign(new Error('cancelled'), {
            name: 'OfflineReconnectionCancelledError',
        }));

        await rejected;
        expect(harness.startThread).not.toHaveBeenCalled();
        expect(harness.sendTurnAndWait).not.toHaveBeenCalled();
        expect(harness.reconnectionCancel).toHaveBeenCalledOnce();
    });
});
