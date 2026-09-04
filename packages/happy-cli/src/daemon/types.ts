/**
 * Daemon-specific types (not related to API/server communication)
 */

import { Metadata } from '@/api/types';
import { ChildProcess } from 'child_process';
import type { ProtectedDaemonProcessRecord } from './sessionProcessIdentity';

export interface SessionEncryptionData {
  encryptionKey: Uint8Array;
  encryptionVariant: 'legacy' | 'dataKey';
  seq: number;
  metadataVersion: number;
  agentStateVersion: number;
}

/**
 * Session tracking for daemon
 */
export interface TrackedSession {
  startedBy: 'daemon' | string;
  happySessionId?: string;
  happySessionMetadataFromLocalWebhook?: Metadata;
  encryption?: SessionEncryptionData;
  pid: number;
  childProcess?: ChildProcess;
  error?: string;
  directoryCreated?: boolean;
  message?: string;
  /** tmux session identifier (format: session:window) */
  tmuxSessionId?: string;
  /** This spawn must prove that systemd moved it outside the daemon service cgroup. */
  systemdScopeRequired?: boolean;
  /** This process has passed the systemd scope and process-identity checks. */
  systemdScopeProtected?: boolean;
  /** Exact protected identity retained for heartbeat and pre-signal revalidation. */
  daemonProcess?: ProtectedDaemonProcessRecord;
}
