import { describe, expect, it, vi } from 'vitest';

import { startFreshThread } from './startFreshThread';
import { startDaemonControlServer } from '@/daemon/controlServer';

describe('startFreshThread', () => {
    it('publishes the App Server-confirmed launch route before any turn', async () => {
        const client = {
            startThread: vi.fn().mockResolvedValue({
                threadId: 'thread-luna-max',
                model: 'gpt-5.6-luna',
                reasoningEffort: 'max',
            }),
        };
        const metadataHandlers: Array<(metadata: any) => any> = [];
        const session = {
            updateMetadataAndWait: vi.fn(async (handler) => {
                metadataHandlers.push(handler);
            }),
        };
        const onConfirmedRoute = vi.fn();

        const result = await startFreshThread({
            client,
            session,
            model: 'gpt-5.6-luna',
            effort: 'max',
            cwd: '/tmp/project',
            approvalPolicy: 'never',
            sandbox: 'read-only',
            mcpServers: { happy: { command: 'happy-mcp' } },
            onConfirmedRoute,
        });

        expect(result).toEqual({
            threadId: 'thread-luna-max',
            model: 'gpt-5.6-luna',
            reasoningEffort: 'max',
        });
        expect(client.startThread).toHaveBeenCalledWith({
            model: 'gpt-5.6-luna',
            effort: 'max',
            cwd: '/tmp/project',
            approvalPolicy: 'never',
            sandbox: 'read-only',
            mcpServers: { happy: { command: 'happy-mcp' } },
        });
        expect(metadataHandlers).toHaveLength(1);
        expect(metadataHandlers[0]({ flavor: 'codex' })).toEqual({
            flavor: 'codex',
            codexThreadId: 'thread-luna-max',
            effectiveModel: 'gpt-5.6-luna',
            effectiveReasoningEffort: 'max',
        });
        expect(onConfirmedRoute).toHaveBeenCalledWith({
            threadId: 'thread-luna-max',
            model: 'gpt-5.6-luna',
            reasoningEffort: 'max',
        });
    });

    it('fails closed when thread start does not return a complete effective route', async () => {
        const session = { updateMetadataAndWait: vi.fn() };
        const onConfirmedRoute = vi.fn();

        await expect(startFreshThread({
            client: {
                startThread: vi.fn().mockResolvedValue({
                    threadId: 'thread-missing-effort',
                    model: 'gpt-5.6-luna',
                    reasoningEffort: null,
                }),
            },
            session,
            model: 'gpt-5.6-luna',
            effort: 'max',
            cwd: '/tmp/project',
            approvalPolicy: 'never',
            sandbox: 'read-only',
            mcpServers: {},
            onConfirmedRoute,
        })).rejects.toThrow('complete effective route');

        expect(session.updateMetadataAndWait).not.toHaveBeenCalled();
        expect(onConfirmedRoute).not.toHaveBeenCalled();
    });

    it('projects the confirmed fresh route through Session and the daemon before resolving', async () => {
        const child = {
            startedBy: 'daemon',
            happySessionId: 'session-fresh-luna-max',
            pid: 8301,
            happySessionMetadataFromLocalWebhook: {
                flavor: 'codex',
                codexLaunchRoutePending: true,
            } as any,
        };
        const server = await startDaemonControlServer({
            ownerToken: 'generation-fresh-luna-max',
            getChildren: () => [child],
            stopSession: () => false,
            spawnSession: vi.fn(),
            requestShutdown: vi.fn(),
            onHappySessionWebhook: vi.fn(),
        });

        try {
            await startFreshThread({
                client: {
                    startThread: vi.fn().mockResolvedValue({
                        threadId: 'thread-fresh-luna-max',
                        model: 'gpt-5.6-luna',
                        reasoningEffort: 'max',
                    }),
                },
                session: {
                    updateMetadataAndWait: async (handler) => {
                        child.happySessionMetadataFromLocalWebhook = handler(
                            child.happySessionMetadataFromLocalWebhook,
                        );
                    },
                },
                model: 'gpt-5.6-luna',
                effort: 'max',
                cwd: '/tmp/project',
                approvalPolicy: 'never',
                sandbox: 'read-only',
                mcpServers: {},
                onConfirmedRoute: async (route) => {
                    const response = await fetch(
                        `http://127.0.0.1:${server.port}/session-effective-route`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                expectedOwnerToken: 'generation-fresh-luna-max',
                                sessionId: 'session-fresh-luna-max',
                                route: {
                                    effectiveModel: route.model,
                                    effectiveReasoningEffort: route.reasoningEffort,
                                },
                            }),
                        },
                    );
                    expect(response.status).toBe(200);
                },
            });

            expect(child.happySessionMetadataFromLocalWebhook).not.toHaveProperty('codexLaunchRoutePending');
            const listed = await fetch(`http://127.0.0.1:${server.port}/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{}',
            });
            expect(await listed.json()).toMatchObject({
                children: [{
                    metadata: {
                        effectiveModel: 'gpt-5.6-luna',
                        effectiveReasoningEffort: 'max',
                    },
                }],
            });
        } finally {
            await server.stop();
        }
    });

    it('does not publish the daemon route or resolve until Session metadata is durable', async () => {
        let releaseMetadata!: () => void;
        const metadataDurable = new Promise<void>((resolve) => {
            releaseMetadata = resolve;
        });
        const onConfirmedRoute = vi.fn();
        const result = startFreshThread({
            client: {
                startThread: vi.fn().mockResolvedValue({
                    threadId: 'thread-delayed-metadata',
                    model: 'gpt-5.6-luna',
                    reasoningEffort: 'max',
                }),
            },
            session: {
                updateMetadataAndWait: vi.fn(() => metadataDurable),
            },
            model: 'gpt-5.6-luna',
            effort: 'max',
            cwd: '/tmp/project',
            approvalPolicy: 'never',
            sandbox: 'read-only',
            mcpServers: {},
            onConfirmedRoute,
        });

        await Promise.resolve();
        expect(onConfirmedRoute).not.toHaveBeenCalled();
        releaseMetadata();
        await expect(result).resolves.toMatchObject({ threadId: 'thread-delayed-metadata' });
        expect(onConfirmedRoute).toHaveBeenCalledOnce();
    });

    it('fails initialization when the awaited daemon publication rejects', async () => {
        await expect(startFreshThread({
            client: {
                startThread: vi.fn().mockResolvedValue({
                    threadId: 'thread-daemon-rejected',
                    model: 'gpt-5.6-luna',
                    reasoningEffort: 'max',
                }),
            },
            session: { updateMetadataAndWait: vi.fn().mockResolvedValue(undefined) },
            model: 'gpt-5.6-luna',
            effort: 'max',
            cwd: '/tmp/project',
            approvalPolicy: 'never',
            sandbox: 'read-only',
            mcpServers: {},
            onConfirmedRoute: vi.fn().mockRejectedValue(new Error('daemon rejected route')),
        })).rejects.toThrow('daemon rejected route');
    });
});
