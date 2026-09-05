import { execFileSync, execSync } from 'node:child_process';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import {
  DEFAULT_AGY_EFFORT,
  DEFAULT_AGY_MODEL,
  findAgyBin,
  resolveAgyBin,
  resolveAgyModelName,
} from './constants';

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

describe('resolveAgyModelName', () => {
  it('maps Gemini 3.8 Flash and Happy effort to agy display names', () => {
    expect(resolveAgyModelName(DEFAULT_AGY_MODEL, DEFAULT_AGY_EFFORT))
      .toBe('Gemini 3.8 Flash (Medium)');
    expect(resolveAgyModelName(DEFAULT_AGY_MODEL, 'low'))
      .toBe('Gemini 3.8 Flash (Low)');
    expect(resolveAgyModelName(DEFAULT_AGY_MODEL, 'high'))
      .toBe('Gemini 3.8 Flash (High)');
  });

  it('uses Medium for an absent or unsupported saved effort', () => {
    expect(resolveAgyModelName(DEFAULT_AGY_MODEL, undefined))
      .toBe('Gemini 3.8 Flash (Medium)');
    expect(resolveAgyModelName(DEFAULT_AGY_MODEL, 'ultra'))
      .toBe('Gemini 3.8 Flash (Medium)');
  });

  it('passes non-Gemini and saved legacy model names through', () => {
    expect(resolveAgyModelName('Claude Opus 4.6 (Thinking)', 'high'))
      .toBe('Claude Opus 4.6 (Thinking)');
    expect(resolveAgyModelName('Gemini 3.6 Flash (High)', 'medium'))
      .toBe('Gemini 3.6 Flash (High)');
  });
});
