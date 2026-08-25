import { execFileSync, execSync } from 'child_process';
import { existsSync } from 'fs';
import os from 'os';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findAgyBin } from '@/agy/constants';
import { detectCLIAvailability } from './detectCLI';

vi.mock('child_process', () => ({ execFileSync: vi.fn(), execSync: vi.fn() }));
vi.mock('fs', () => ({ existsSync: vi.fn() }));
vi.mock('os', () => ({
  default: {
    homedir: vi.fn(() => '/home/person'),
    platform: vi.fn(() => 'darwin'),
  },
}));
vi.mock('@/agy/constants', () => ({ findAgyBin: vi.fn() }));

const mockedExecFileSync = vi.mocked(execFileSync);
const mockedExecSync = vi.mocked(execSync);
const mockedExistsSync = vi.mocked(existsSync);
const mockedFindAgyBin = vi.mocked(findAgyBin);
const mockedPlatform = vi.mocked(os.platform);

describe('CLI availability detection', () => {
  beforeEach(() => {
    mockedExecFileSync.mockReset();
    mockedExecSync.mockReset();
    mockedExecSync.mockImplementation(() => {
      throw new Error('not installed');
    });
    mockedExistsSync.mockReset();
    mockedExistsSync.mockReturnValue(false);
    mockedFindAgyBin.mockReset();
    mockedFindAgyBin.mockReturnValue(undefined);
    mockedPlatform.mockReturnValue('darwin');
  });

  it('checks Windows CLIs without invoking a command shell', () => {
    mockedPlatform.mockReturnValue('win32');

    expect(detectCLIAvailability()).toMatchObject({
      claude: true,
      codex: true,
      gemini: true,
      openclaw: true,
      agy: false,
    });
    expect(mockedExecSync).not.toHaveBeenCalled();
    expect(mockedExecFileSync).toHaveBeenCalledTimes(4);

    for (const name of ['claude', 'codex', 'gemini', 'openclaw']) {
      expect(mockedExecFileSync).toHaveBeenCalledWith(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          `Get-Command -Name '${name}' -ErrorAction Stop | Out-Null`,
        ],
        { stdio: 'ignore', windowsHide: true },
      );
    }
  });

  it('reports Antigravity only when its executable resolver finds an installation', () => {
    expect(detectCLIAvailability().agy).toBe(false);

    mockedFindAgyBin.mockReturnValue('/home/person/.local/bin/agy');

    expect(detectCLIAvailability().agy).toBe(true);
  });
});