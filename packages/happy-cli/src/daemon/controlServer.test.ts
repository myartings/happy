import { afterEach, describe, expect, it, vi } from 'vitest';
import { startDaemonControlServer } from './controlServer';

// Behavioral fixture for happy-session-launcher v0.5
// scripts/worktree_session.py::authoritative_effective_route and
// ::bind_issue_route_verification. Keep this test-only contract unchanged so
// daemon response evolution remains visibly compatible with that consumer.
function verifyLauncherV05Route(
  payload: Record<string, any>,
  expected: { model: string; reasoningEffort: string },
): 'verified' | 'mismatch' | 'unobservable' {
  const candidates = [payload];
  for (const key of ['metadata', 'runtime', 'session', 'agent']) {
    if (payload[key] && typeof payload[key] === 'object' && !Array.isArray(payload[key])) {
      candidates.push(payload[key]);
    }
  }
  for (const item of candidates) {
    const model = item.effectiveModel ?? item.modelMode ?? item.model;
    const effort = item.effectiveReasoningEffort
      ?? item.effortLevel
      ?? item.reasoningEffort
      ?? item.reasoning_effort
      ?? item.effort;
    if (typeof model === 'string' && model.length > 0
      && typeof effort === 'string' && effort.length > 0) {
      return model === expected.model && effort === expected.reasoningEffort
        ? 'verified'
        : 'mismatch';
    }
  }
  return 'unobservable';
}

describe('daemon control server ownership', () => {
  let stopServer: (() => Promise<void>) | undefined;

  afterEach(async () => {
    await stopServer?.();
    stopServer = undefined;
    vi.restoreAllMocks();
  });

  it('rejects a stop request bound to a predecessor generation', async () => {
    const requestShutdown = vi.fn();
    const server = await startDaemonControlServer({
      ownerToken: 'generation-h',
      getChildren: () => [],
      stopSession: () => false,
      spawnSession: vi.fn(),
      requestShutdown,
      onHappySessionWebhook: vi.fn(),
    });
    stopServer = server.stop;

    const response = await fetch(`http://127.0.0.1:${server.port}/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedOwnerToken: 'generation-g' }),
    });
    expect(response.status).toBe(409);
    expect(requestShutdown).not.toHaveBeenCalled();
  });

  it('does not trust effective-route fields supplied through session startup', async () => {
    const onHappySessionWebhook = vi.fn();
    const server = await startDaemonControlServer({
      ownerToken: 'generation-startup',
      getChildren: () => [],
      stopSession: () => false,
      spawnSession: vi.fn(),
      requestShutdown: vi.fn(),
      onHappySessionWebhook,
    });
    stopServer = server.stop;

    const response = await fetch(`http://127.0.0.1:${server.port}/session-started`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'session-spoofed-startup',
        metadata: {
          flavor: 'codex',
          effectiveModel: 'gpt-5.6-sol',
          effectiveReasoningEffort: 'medium',
        },
      }),
    });

    expect(response.status).toBe(200);
    expect(onHappySessionWebhook).toHaveBeenCalledWith(
      'session-spoofed-startup',
      { flavor: 'codex' },
      undefined,
    );
  });

  it('projects only a complete confirmed route pair when listing sessions', async () => {
    const server = await startDaemonControlServer({
      ownerToken: 'generation-route',
      getChildren: () => [{
        startedBy: 'daemon',
        happySessionId: 'session-luna-max',
        pid: 8100,
        happySessionMetadataFromLocalWebhook: {
          flavor: 'codex',
          effectiveModel: 'gpt-5.6-luna',
          effectiveReasoningEffort: 'max',
        } as any,
      }, {
        startedBy: 'daemon',
        happySessionId: 'session-partial',
        pid: 8101,
        happySessionMetadataFromLocalWebhook: {
          flavor: 'codex',
          effectiveModel: 'gpt-5.6-sol',
        } as any,
      }, {
        startedBy: 'daemon',
        happySessionId: 'session-invalid',
        pid: 8102,
        happySessionMetadataFromLocalWebhook: {
          flavor: 'codex',
          effectiveModel: 'default',
          effectiveReasoningEffort: 'turbo',
        } as any,
      }],
      stopSession: () => false,
      spawnSession: vi.fn(),
      requestShutdown: vi.fn(),
      onHappySessionWebhook: vi.fn(),
    });
    stopServer = server.stop;

    const response = await fetch(`http://127.0.0.1:${server.port}/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    const payload = await response.json() as { children: Array<Record<string, any>> };
    expect(payload).toEqual({
      children: [{
        startedBy: 'daemon',
        happySessionId: 'session-luna-max',
        pid: 8100,
        metadata: {
          effectiveModel: 'gpt-5.6-luna',
          effectiveReasoningEffort: 'max',
        },
      }, {
        startedBy: 'daemon',
        happySessionId: 'session-partial',
        pid: 8101,
      }, {
        startedBy: 'daemon',
        happySessionId: 'session-invalid',
        pid: 8102,
      }],
    });
    expect(verifyLauncherV05Route(payload.children[0], {
      model: 'gpt-5.6-luna',
      reasoningEffort: 'max',
    })).toBe('verified');
    expect(verifyLauncherV05Route(payload.children[1], {
      model: 'gpt-5.6-luna',
      reasoningEffort: 'max',
    })).toBe('unobservable');
    expect(verifyLauncherV05Route({
      metadata: {
        effectiveModel: 'gpt-5.6-sol',
        effectiveReasoningEffort: 'medium',
      },
    }, {
      model: 'gpt-5.6-luna',
      reasoningEffort: 'max',
    })).toBe('mismatch');
  });

  it('updates and clears the confirmed route projection atomically', async () => {
    const children = [{
      startedBy: 'daemon',
      happySessionId: 'session-live-route',
      pid: 8200,
      happySessionMetadataFromLocalWebhook: { flavor: 'codex' } as any,
    }];
    const server = await startDaemonControlServer({
      ownerToken: 'generation-live-route',
      getChildren: () => children,
      stopSession: () => false,
      spawnSession: vi.fn(),
      requestShutdown: vi.fn(),
      onHappySessionWebhook: vi.fn(),
    });
    stopServer = server.stop;

    const update = await fetch(`http://127.0.0.1:${server.port}/session-effective-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expectedOwnerToken: 'generation-live-route',
        sessionId: 'session-live-route',
        route: {
          effectiveModel: 'gpt-5.6-luna',
          effectiveReasoningEffort: 'max',
        },
      }),
    });
    expect(update.status).toBe(200);

    const spoof = await fetch(`http://127.0.0.1:${server.port}/session-effective-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expectedOwnerToken: 'generation-predecessor',
        sessionId: 'session-live-route',
        route: {
          effectiveModel: 'gpt-5.6-sol',
          effectiveReasoningEffort: 'medium',
        },
      }),
    });
    expect(spoof.status).toBe(409);

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

    const clear = await fetch(`http://127.0.0.1:${server.port}/session-effective-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expectedOwnerToken: 'generation-live-route',
        sessionId: 'session-live-route',
        route: null,
      }),
    });
    expect(clear.status).toBe(200);

    const partial = await fetch(`http://127.0.0.1:${server.port}/session-effective-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expectedOwnerToken: 'generation-live-route',
        sessionId: 'session-live-route',
        route: { effectiveModel: 'gpt-5.6-sol' },
      }),
    });
    expect(partial.status).toBe(400);

    for (const route of [
      { effectiveModel: 'default', effectiveReasoningEffort: 'medium' },
      { effectiveModel: 'null', effectiveReasoningEffort: 'medium' },
      { effectiveModel: 'garbage', effectiveReasoningEffort: 'medium' },
      { effectiveModel: 'gpt-5.6-sol\nspoofed', effectiveReasoningEffort: 'medium' },
      { effectiveModel: ' gpt-5.6-sol ', effectiveReasoningEffort: 'medium' },
      { effectiveModel: 'gpt-5.6-sol', effectiveReasoningEffort: 'turbo' },
      { effectiveModel: 'gpt-5.6-sol', effectiveReasoningEffort: ' medium ' },
    ]) {
      const invalid = await fetch(`http://127.0.0.1:${server.port}/session-effective-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedOwnerToken: 'generation-live-route',
          sessionId: 'session-live-route',
          route,
        }),
      });
      expect(invalid.status).toBe(400);
    }

    const clearedList = await fetch(`http://127.0.0.1:${server.port}/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    expect(await clearedList.json()).toEqual({
      children: [{
        startedBy: 'daemon',
        happySessionId: 'session-live-route',
        pid: 8200,
      }],
    });
  });

  it('accepts the empty stop payload sent by an older CLI', async () => {
    vi.useFakeTimers();
    const requestShutdown = vi.fn();
    const server = await startDaemonControlServer({
      ownerToken: 'generation-current',
      getChildren: () => [],
      stopSession: () => false,
      spawnSession: vi.fn(),
      requestShutdown,
      onHappySessionWebhook: vi.fn(),
    });
    stopServer = server.stop;

    const response = await fetch(`http://127.0.0.1:${server.port}/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(200);
    await vi.advanceTimersByTimeAsync(60);
    expect(requestShutdown).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
