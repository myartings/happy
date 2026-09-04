import { readFileSync } from 'node:fs'

export type SessionProcessIdentity = {
  pid: number
  processGroupId: number
  startTimeTicks: string
  cgroupPath: string
}

export type ProtectedDaemonProcessRecord = {
  protection: 'systemd-scope'
  identity: SessionProcessIdentity
  recordedAt: number
}

export const PROTECTED_PROCESS_RECORD_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000

export function parseLinuxProcessIdentity(
  pid: number,
  stat: string,
  cgroup: string,
): SessionProcessIdentity | null {
  const commandEnd = stat.lastIndexOf(')')
  if (commandEnd < 0) return null

  const fields = stat.slice(commandEnd + 1).trim().split(/\s+/)
  const processState = fields[0]
  const processGroupId = Number(fields[2])
  const startTimeTicks = fields[19]
  const unifiedCgroup = cgroup
    .split(/\r?\n/)
    .find((line) => line.startsWith('0::'))
    ?.slice(3)

  if (
    !Number.isSafeInteger(pid)
    || pid <= 0
    || processState === 'Z'
    || !Number.isSafeInteger(processGroupId)
    || processGroupId <= 0
    || !startTimeTicks
    || !/^\d+$/.test(startTimeTicks)
    || !unifiedCgroup
  ) {
    return null
  }

  return { pid, processGroupId, startTimeTicks, cgroupPath: unifiedCgroup }
}

export function readLinuxProcessIdentity(pid: number): SessionProcessIdentity | null {
  try {
    return parseLinuxProcessIdentity(
      pid,
      readFileSync(`/proc/${pid}/stat`, 'utf8'),
      readFileSync(`/proc/${pid}/cgroup`, 'utf8'),
    )
  } catch {
    return null
  }
}

export function matchesProcessIdentity(
  expected: SessionProcessIdentity,
  current: SessionProcessIdentity,
): boolean {
  return expected.pid === current.pid
    && expected.processGroupId === current.processGroupId
    && expected.startTimeTicks === current.startTimeTicks
    && expected.cgroupPath === current.cgroupPath
}

export function isProtectedSystemdScope(
  session: SessionProcessIdentity,
  daemon: SessionProcessIdentity,
): boolean {
  const unit = session.cgroupPath.split('/').filter(Boolean).at(-1)
  return session.processGroupId === session.pid
    && session.cgroupPath !== daemon.cgroupPath
    && unit?.endsWith('.scope') === true
}

export function createProtectedProcessRecord(
  session: SessionProcessIdentity,
  daemon: SessionProcessIdentity,
  recordedAt: number = Date.now(),
): ProtectedDaemonProcessRecord | null {
  if (!isProtectedSystemdScope(session, daemon)) return null
  return { protection: 'systemd-scope', identity: session, recordedAt }
}

export function getMatchingProtectedProcessIdentity(
  record: ProtectedDaemonProcessRecord | undefined,
  readIdentity: (pid: number) => SessionProcessIdentity | null = readLinuxProcessIdentity,
): SessionProcessIdentity | null {
  const identity = record?.identity
  if (
    record?.protection !== 'systemd-scope'
    || !identity
    || !Number.isSafeInteger(identity.pid)
    || identity.pid <= 0
    || !Number.isSafeInteger(identity.processGroupId)
    || identity.processGroupId <= 0
    || typeof identity.startTimeTicks !== 'string'
    || !/^\d+$/.test(identity.startTimeTicks)
    || typeof identity.cgroupPath !== 'string'
    || !identity.cgroupPath.startsWith('/')
  ) {
    return null
  }
  const current = readIdentity(identity.pid)
  return current && matchesProcessIdentity(identity, current) ? current : null
}

export function signalProtectedProcessGroup(
  record: ProtectedDaemonProcessRecord | undefined,
  signal: NodeJS.Signals,
  readIdentity: (pid: number) => SessionProcessIdentity | null = readLinuxProcessIdentity,
  kill: (pid: number, signal: NodeJS.Signals) => unknown = process.kill,
): boolean {
  const current = getMatchingProtectedProcessIdentity(record, readIdentity)
  if (!current) return false
  try {
    kill(-current.processGroupId, signal)
    return true
  } catch {
    return false
  }
}

export function getAdoptableProcessIdentity(
  record: ProtectedDaemonProcessRecord | undefined,
  daemon: SessionProcessIdentity,
  readIdentity: (pid: number) => SessionProcessIdentity | null = readLinuxProcessIdentity,
  now: number = Date.now(),
): SessionProcessIdentity | null {
  const recordedAt = record?.recordedAt
  if (
    typeof recordedAt !== 'number'
    || !Number.isSafeInteger(recordedAt)
    || recordedAt <= 0
    || !Number.isSafeInteger(now)
  ) {
    return null
  }
  const recordAge = now - recordedAt
  if (
    !Number.isFinite(recordAge)
    || recordAge < 0
    || recordAge >= PROTECTED_PROCESS_RECORD_MAX_AGE_MS
  ) {
    return null
  }
  const current = getMatchingProtectedProcessIdentity(record, readIdentity)
  if (!current) return null
  return isProtectedSystemdScope(current, daemon) ? current : null
}
