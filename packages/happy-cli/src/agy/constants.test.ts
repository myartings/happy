import { execFileSync, execSync } from 'node:child_process';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { findAgyBin, resolveAgyBin } from './constants';

vi.mock('node:child_process', () => ({ execFileSync: vi.fn(), execSync: vi.fn() }));

const mockedExecFileSync = vi.mocked(execFileSync);
const mockedExecSync = vi.mocked(execSync);

describe('resolveAgyBin', () => {
  const orig = process.env.HAPPY_AGY_PATH;
  beforeEach(() => {
    mockedExecFileSync.mockReset();
    mockedExecSync.mockReset();
  });

  afterEach(() => {
    if (orig === undefined) {
      delete process.env.HAPPY_AGY_PATH;
    } else {
      process.env.HAPPY_AGY_PATH = orig;
    }
  });

  it('uses HAPPY_AGY_PATH when it points at an existing file', () => {
    // node's own binary is guaranteed to exist on every platform
    process.env.HAPPY_AGY_PATH = process.execPath;
    expect(findAgyBin()).toBe(process.execPath);
    expect(resolveAgyBin()).toBe(process.execPath);
  });

  it('ignores HAPPY_AGY_PATH when the target does not exist', () => {
    process.env.HAPPY_AGY_PATH = '/nonexistent/path/to/agy-should-not-resolve';
    expect(resolveAgyBin()).not.toBe('/nonexistent/path/to/agy-should-not-resolve');
  });

  it('checks the Windows PATH without invoking a command shell', () => {
    const platform = vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
    delete process.env.HAPPY_AGY_PATH;

    try {
      expect(findAgyBin()).toBe('agy');
      expect(mockedExecSync).not.toHaveBeenCalled();
      expect(mockedExecFileSync).toHaveBeenCalledWith(
        'where.exe',
        ['agy'],
        { stdio: 'ignore', windowsHide: true },
      );
    } finally {
      platform.mockRestore();
    }
  });
});
