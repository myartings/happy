import { describe, expect, it } from 'vitest';
import { resolveCodexFirstSessionNavigation } from './codexFirstSessionNavigation';

describe('Codex-first Session navigation', () => {
    it('uses project-first hierarchy without redundant Machine chrome by default', () => {
        expect(resolveCodexFirstSessionNavigation({
            codexFirstEnabled: true,
            flatSessionList: false,
            machineGroupCount: 1,
        })).toEqual({
            mode: 'project',
            showMachineHeaders: false,
            showProjectMachineName: false,
        });
    });

    it('keeps the explicit flat chronological preference reversible', () => {
        expect(resolveCodexFirstSessionNavigation({
            codexFirstEnabled: true,
            flatSessionList: true,
            machineGroupCount: 1,
        }).mode).toBe('flat');
    });

    it('shows Machine identity only when multiple Machines need disambiguation', () => {
        expect(resolveCodexFirstSessionNavigation({
            codexFirstEnabled: true,
            flatSessionList: false,
            machineGroupCount: 2,
        })).toMatchObject({
            showMachineHeaders: false,
            showProjectMachineName: true,
        });
    });

    it('preserves legacy Machine hierarchy outside the Codex-first shell', () => {
        expect(resolveCodexFirstSessionNavigation({
            codexFirstEnabled: false,
            flatSessionList: false,
            machineGroupCount: 1,
        })).toEqual({
            mode: 'project',
            showMachineHeaders: true,
            showProjectMachineName: true,
        });
    });
});
