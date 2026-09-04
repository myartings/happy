import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventEmitter } from 'node:events'

const mocks = vi.hoisted(() => ({
  crossSpawn: vi.fn(() => ({ pid: 4321, once: vi.fn() })),
  loggerDebug: vi.fn(),
}))

vi.mock('cross-spawn', () => ({ spawn: mocks.crossSpawn }))
vi.mock('@/projectPath', () => ({ projectPath: () => '/opt/happy' }))
vi.mock('@/ui/logger', () => ({ logger: { debug: mocks.loggerDebug } }))
vi.mock('node:fs', () => ({ existsSync: () => true }))
vi.mock('./runtime', () => ({ isBun: () => false }))

import { spawnHappyCLI } from './spawnHappyCLI'

describe('spawnHappyCLI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('runs the Happy process in a transient user scope when requested', () => {
    const options = {
      cwd: '/workspace/project',
      detached: true,
      stdio: 'ignore' as const,
      env: { SAFE_VALUE: 'present' },
    }

    spawnHappyCLI(['codex', '--started-by', 'daemon'], options, {
      systemdScope: true,
    })

    expect(mocks.crossSpawn).toHaveBeenCalledWith(
      'systemd-run',
      [
        '--user',
        '--scope',
        '--quiet',
        expect.stringMatching(/^--unit=happy-session-\d+-\d+$/),
        '--',
        'node',
        '--no-warnings',
        '--no-deprecation',
        '/opt/happy/dist/index.mjs',
        'codex',
        '--started-by',
        'daemon',
      ],
      expect.objectContaining(options),
    )
  })

  it('keeps the direct spawn path when no transient scope is requested', () => {
    spawnHappyCLI(['daemon', 'start'], { detached: true })

    expect(mocks.crossSpawn).toHaveBeenCalledWith(
      'node',
      [
        '--no-warnings',
        '--no-deprecation',
        '/opt/happy/dist/index.mjs',
        'daemon',
        'start',
      ],
      expect.objectContaining({ detached: true }),
    )
  })

  it('propagates a transient-scope launcher failure without direct-spawn fallback', () => {
    mocks.crossSpawn.mockImplementationOnce(() => {
      throw new Error('systemd-run unavailable')
    })

    expect(() => spawnHappyCLI(['codex'], {}, { systemdScope: true }))
      .toThrow('systemd-run unavailable')
    expect(mocks.crossSpawn).toHaveBeenCalledTimes(1)
    expect(mocks.crossSpawn).toHaveBeenCalledWith(
      'systemd-run',
      expect.any(Array),
      expect.any(Object),
    )
  })

  it('consumes the asynchronous ENOENT shape emitted by cross-spawn before a caller can inspect pid', async () => {
    const child = new EventEmitter() as EventEmitter & { pid?: number }
    mocks.crossSpawn.mockReturnValueOnce(child as never)

    expect(spawnHappyCLI(['codex'], {}, { systemdScope: true }).pid).toBeUndefined()
    expect(() => child.emit('error', Object.assign(new Error('spawn systemd-run ENOENT'), {
      code: 'ENOENT',
    }))).not.toThrow()

    expect(mocks.loggerDebug).toHaveBeenCalledWith(
      expect.stringContaining('spawn systemd-run ENOENT'),
    )
  })
})
