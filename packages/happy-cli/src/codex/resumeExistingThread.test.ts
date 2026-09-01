import { describe, expect, it, vi } from 'vitest';

import { resumeExistingThread } from './resumeExistingThread';
import { startDaemonControlServer } from '@/daemon/controlServer';

describe('resumeExistingThread', () => {
    it('resumes the thread and updates session metadata', async () => {
        const client = {
            resumeThread: vi.fn().mockResolvedValue({
                threadId: '019ccca2-1a77-7481-9873-de72f3464372',
                model: 'gpt-5.4',
                reasoningEffort: 'high',
            }),
        };
        const metadataHandlers: Array<(metadata: any) => any> = [];
        const session = {
            updateMetadata: vi.fn((handler) => metadataHandlers.push(handler)),
            sendSessionEvent: vi.fn(),
        };
        const messageBuffer = {
            addMessage: vi.fn(),
        };
        const onConfirmedRoute = vi.fn();

        const result = await resumeExistingThread({
            client,
            session,
            messageBuffer,
            threadId: '019ccca2-1a77-7481-9873-de72f3464372',
            cwd: '/tmp/project',
            mcpServers: { happy: { command: 'happy-mcp' } },
            onConfirmedRoute,
        });

        expect(result).toEqual({
            threadId: '019ccca2-1a77-7481-9873-de72f3464372',
            model: 'gpt-5.4',
            reasoningEffort: 'high',
        });
        expect(client.resumeThread).toHaveBeenCalledWith({
            threadId: '019ccca2-1a77-7481-9873-de72f3464372',
            cwd: '/tmp/project',
            mcpServers: { happy: { command: 'happy-mcp' } },
        });
        expect(metadataHandlers).toHaveLength(1);
        expect(metadataHandlers[0]({ existing: true })).toEqual({
            existing: true,
            codexThreadId: '019ccca2-1a77-7481-9873-de72f3464372',
            effectiveModel: 'gpt-5.4',
            effectiveReasoningEffort: 'high',
        });
        expect(messageBuffer.addMessage).toHaveBeenCalledWith(expect.stringContaining('Resumed thread'), 'status');
        expect(session.sendSessionEvent).toHaveBeenCalledWith({
            type: 'message',
            message: 'Resumed Codex thread 019ccca2-1a77-7481-9873-de72f3464372',
        });
        expect(onConfirmedRoute).toHaveBeenCalledWith({
            threadId: '019ccca2-1a77-7481-9873-de72f3464372',
            model: 'gpt-5.4',
            reasoningEffort: 'high',
        });
    });

    it('wraps backend resume errors with the thread ID', async () => {
        const client = {
            resumeThread: vi.fn().mockRejectedValue(new Error('thread not found')),
        };
        const session = {
            updateMetadata: vi.fn(),
            sendSessionEvent: vi.fn(),
        };
        const messageBuffer = {
            addMessage: vi.fn(),
        };

        await expect(
            resumeExistingThread({
                client,
                session,
                messageBuffer,
                threadId: 'thread-404',
                cwd: '/tmp/project',
                mcpServers: {},
            }),
        ).rejects.toThrow('Failed to resume Codex thread thread-404: thread not found');
    });

    it('projects one App Server-confirmed Luna Max resume through Session and daemon', async () => {
        const child = {
            startedBy: 'daemon',
            happySessionId: 'session-luna-max',
            pid: 8300,
            happySessionMetadataFromLocalWebhook: { flavor: 'codex' } as any,
        };
        const server = await startDaemonControlServer({
            ownerToken: 'generation-luna-max',
            getChildren: () => [child],
            stopSession: () => false,
            spawnSession: vi.fn(),
            requestShutdown: vi.fn(),
            onHappySessionWebhook: vi.fn(),
        });

        try {
            await resumeExistingThread({
                client: {
                    resumeThread: vi.fn().mockResolvedValue({
                        threadId: 'thread-luna-max',
                        model: 'gpt-5.6-luna',
                        reasoningEffort: 'max',
                    }),
                },
                session: {
                    updateMetadata: (handler) => {
                        child.happySessionMetadataFromLocalWebhook = handler(
                            child.happySessionMetadataFromLocalWebhook,
                        );
                    },
                    sendSessionEvent: vi.fn(),
                },
                messageBuffer: { addMessage: vi.fn() },
                threadId: 'thread-luna-max',
                cwd: '/tmp/project',
                mcpServers: {},
                announce: false,
                onConfirmedRoute: async (route) => {
                    const response = await fetch(
                        `http://127.0.0.1:${server.port}/session-effective-route`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                expectedOwnerToken: 'generation-luna-max',
                                sessionId: 'session-luna-max',
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
});
