import { describe, expect, it, vi } from 'vitest'

import {
  createProtectedProcessRecord,
  getAdoptableProcessIdentity,
  getMatchingProtectedProcessIdentity,
  isProtectedSystemdScope,
  matchesProcessIdentity,
  parseLinuxProcessIdentity,
  PROTECTED_PROCESS_RECORD_MAX_AGE_MS,
  signalProtectedProcessGroup,
} from './sessionProcessIdentity'

describe('daemon Session process identity', () => {
  it('accepts only an exact process-group leader in a scope outside the daemon cgroup', () => {
    const session = parseLinuxProcessIdentity(
      4242,
      '4242 (happy codex worker) S 1 4242 4242 0 0 0 0 0 0 0 0 0 0 0 20 0 1 0 98765 0 0',
      '0::/user.slice/user-1000.slice/user@1000.service/app.slice/run-p4242-i1.scope\n',
    )
    const daemon = parseLinuxProcessIdentity(
      4000,
      '4000 (happy daemon) S 1 4000 4000 0 0 0 0 0 0 0 0 0 0 0 20 0 1 0 87654 0 0',
      '0::/user.slice/user-1000.slice/user@1000.service/app.slice/happy-daemon.service\n',
    )

    expect(session).not.toBeNull()
    expect(daemon).not.toBeNull()
    expect(isProtectedSystemdScope(session!, daemon!)).toBe(true)
    expect(matchesProcessIdentity(session!, { ...session! })).toBe(true)
    expect(matchesProcessIdentity(session!, {
      ...session!,
      startTimeTicks: '98766',
    })).toBe(false)
    expect(isProtectedSystemdScope({
      ...session!,
      processGroupId: 99,
    }, daemon!)).toBe(false)
    expect(isProtectedSystemdScope({
      ...session!,
      cgroupPath: daemon!.cgroupPath,
    }, daemon!)).toBe(false)
  })

  it('adopts only an exact live identity from a verified protected record', () => {
    const daemon = parseLinuxProcessIdentity(
      4000,
      '4000 (happy daemon) S 1 4000 4000 0 0 0 0 0 0 0 0 0 0 0 20 0 1 0 87654 0 0',
      '0::/user.slice/user-1000.slice/user@1000.service/app.slice/happy-daemon.service\n',
    )!
    const session = parseLinuxProcessIdentity(
      4242,
      '4242 (happy codex) S 1 4242 4242 0 0 0 0 0 0 0 0 0 0 0 20 0 1 0 98765 0 0',
      '0::/user.slice/user-1000.slice/user@1000.service/app.slice/run-p4242-i1.scope\n',
    )!
    const recordedAt = Date.now()
    const record = createProtectedProcessRecord(session, daemon, recordedAt)!

    expect(record).toEqual({
      protection: 'systemd-scope',
      identity: session,
      recordedAt,
    })
    expect(getAdoptableProcessIdentity(record, daemon, () => session)).toEqual(session)
    expect(getAdoptableProcessIdentity(record, daemon, () => ({
      ...session,
      startTimeTicks: 'reused-pid',
    }))).toBeNull()
    expect(getAdoptableProcessIdentity(undefined, daemon, () => session)).toBeNull()
    expect(getAdoptableProcessIdentity(
      { protection: 'systemd-scope' } as never,
      daemon,
      () => session,
    )).toBeNull()
    expect(getAdoptableProcessIdentity(
      { ...record, recordedAt: String(record.recordedAt) } as never,
      daemon,
      () => session,
      record.recordedAt,
    )).toBeNull()
  })

  it('rejects a zombie process as dead adoption evidence', () => {
    expect(parseLinuxProcessIdentity(
      4242,
      '4242 (happy codex) Z 1 4242 4242 0 0 0 0 0 0 0 0 0 0 0 20 0 1 0 98765 0 0',
      '0::/user.slice/user-1000.slice/user@1000.service/app.slice/run-p4242-i1.scope\n',
    )).toBeNull()
  })

  it('rejects an otherwise exact protected record after its bounded adoption window', () => {
    const daemon = parseLinuxProcessIdentity(
      4000,
      '4000 (happy daemon) S 1 4000 4000 0 0 0 0 0 0 0 0 0 0 0 20 0 1 0 87654 0 0',
      '0::/user.slice/user-1000.slice/user@1000.service/app.slice/happy-daemon.service\n',
    )!
    const session = parseLinuxProcessIdentity(
      4242,
      '4242 (happy codex) S 1 4242 4242 0 0 0 0 0 0 0 0 0 0 0 20 0 1 0 98765 0 0',
      '0::/user.slice/user-1000.slice/user@1000.service/app.slice/run-p4242-i1.scope\n',
    )!
    const recordedAt = 1_000
    const record = createProtectedProcessRecord(session, daemon, recordedAt)!

    expect(getAdoptableProcessIdentity(
      record,
      daemon,
      () => session,
      recordedAt + PROTECTED_PROCESS_RECORD_MAX_AGE_MS - 1,
    )).toEqual(session)
    expect(getAdoptableProcessIdentity(
      record,
      daemon,
      () => session,
      recordedAt + PROTECTED_PROCESS_RECORD_MAX_AGE_MS,
    )).toBeNull()
  })

  it('revalidates the complete protected identity after adoption instead of trusting a reused pid', () => {
    const daemon = parseLinuxProcessIdentity(
      4000,
      '4000 (happy daemon) S 1 4000 4000 0 0 0 0 0 0 0 0 0 0 0 20 0 1 0 87654 0 0',
      '0::/user.slice/user-1000.slice/user@1000.service/app.slice/happy-daemon.service\n',
    )!
    const session = parseLinuxProcessIdentity(
      4242,
      '4242 (happy codex) S 1 4242 4242 0 0 0 0 0 0 0 0 0 0 0 20 0 1 0 98765 0 0',
      '0::/user.slice/user-1000.slice/user@1000.service/app.slice/run-p4242-i1.scope\n',
    )!
    const record = createProtectedProcessRecord(session, daemon)!

    expect(getMatchingProtectedProcessIdentity(record, () => session)).toEqual(session)
    expect(getMatchingProtectedProcessIdentity(record, () => ({
      ...session,
      startTimeTicks: '98766',
    }))).toBeNull()
    expect(getMatchingProtectedProcessIdentity(record, () => null)).toBeNull()
  })

  it('signals an adopted process group only while its complete identity still matches', () => {
    const daemon = parseLinuxProcessIdentity(
      4000,
      '4000 (happy daemon) S 1 4000 4000 0 0 0 0 0 0 0 0 0 0 0 20 0 1 0 87654 0 0',
      '0::/user.slice/user-1000.slice/user@1000.service/app.slice/happy-daemon.service\n',
    )!
    const session = parseLinuxProcessIdentity(
      4242,
      '4242 (happy codex) S 1 4242 4242 0 0 0 0 0 0 0 0 0 0 0 20 0 1 0 98765 0 0',
      '0::/user.slice/user-1000.slice/user@1000.service/app.slice/run-p4242-i1.scope\n',
    )!
    const record = createProtectedProcessRecord(session, daemon)!
    const kill = vi.fn()

    expect(signalProtectedProcessGroup(record, 'SIGTERM', () => ({
      ...session,
      startTimeTicks: '98766',
    }), kill)).toBe(false)
    expect(kill).not.toHaveBeenCalled()

    expect(signalProtectedProcessGroup(record, 'SIGTERM', () => session, kill)).toBe(true)
    expect(kill).toHaveBeenCalledExactlyOnceWith(-session.processGroupId, 'SIGTERM')
  })
})
