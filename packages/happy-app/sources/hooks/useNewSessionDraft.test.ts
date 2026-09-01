import { beforeEach, describe, expect, it, vi } from 'vitest';

type Draft = {
    input: string;
    selectedMachineId: string | null;
    selectedProjectId: string | null;
    selectedPath: string | null;
    agentType: 'claude' | 'codex' | 'gemini' | 'openclaw' | 'agy' | 'rig';
    permissionMode: string | null;
    modelMode: string | null;
    effortLevel: string | null;
    sessionType: 'simple' | 'worktree';
    worktreeKey: string | null;
    updatedAt: number;
};

const mockPersistence = vi.hoisted(() => ({
    draft: null as Draft | null,
    saved: [] as Draft[],
}));

vi.mock('@/sync/persistence', () => ({
    loadNewSessionDraft: () => mockPersistence.draft,
    saveNewSessionDraft: (draft: Draft) => {
        mockPersistence.saved.push(draft);
        mockPersistence.draft = draft;
    },
}));

function persistedDraft(overrides: Partial<Draft> = {}): Draft {
    return {
        input: '',
        selectedMachineId: null,
        selectedProjectId: null,
        selectedPath: null,
        agentType: 'claude',
        permissionMode: null,
        modelMode: null,
        effortLevel: null,
        sessionType: 'simple',
        worktreeKey: null,
        updatedAt: 1,
        ...overrides,
    };
}

describe('useNewSessionDraft', () => {
    beforeEach(() => {
        vi.resetModules();
        mockPersistence.draft = null;
        mockPersistence.saved = [];
    });

    it('keeps mode defaults unset when there is no persisted draft', async () => {
        const { useNewSessionDraft } = await import('./useNewSessionDraft');

        expect(useNewSessionDraft.getState().permissionMode).toBeNull();
        expect(useNewSessionDraft.getState().modelMode).toBeNull();
        expect(useNewSessionDraft.getState().effortLevel).toBeNull();
    });

    it('loads persisted permission, model, and effort defaults', async () => {
        mockPersistence.draft = persistedDraft({
            permissionMode: 'yolo',
            modelMode: 'opus',
            effortLevel: 'xhigh',
        });

        const { useNewSessionDraft } = await import('./useNewSessionDraft');

        expect(useNewSessionDraft.getState().permissionMode).toBe('yolo');
        expect(useNewSessionDraft.getState().modelMode).toBe('opus');
        expect(useNewSessionDraft.getState().effortLevel).toBe('xhigh');
    });

    it('persists effort changes with the rest of the new-session draft', async () => {
        const { useNewSessionDraft } = await import('./useNewSessionDraft');

        useNewSessionDraft.getState().setEffortLevel('high');

        expect(useNewSessionDraft.getState().effortLevel).toBe('high');
        expect(mockPersistence.saved.at(-1)).toMatchObject({ effortLevel: 'high' });
    });

    it('keeps temporary image attachments in memory without persisting their file URIs', async () => {
        const { useNewSessionDraft } = await import('./useNewSessionDraft');
        const attachment = {
            id: 'photo-1',
            uri: 'file:///temporary/photo.jpg',
            width: 100,
            height: 100,
            mimeType: 'image/jpeg',
            size: 1024,
            name: 'photo.jpg',
        };

        useNewSessionDraft.getState().setAttachments([attachment]);

        expect(useNewSessionDraft.getState().attachments).toEqual([attachment]);
        expect(mockPersistence.saved).toHaveLength(0);
    });

    it('keeps project identity machine-scoped and clears it when a path is edited', async () => {
        const { useNewSessionDraft } = await import('./useNewSessionDraft');

        useNewSessionDraft.getState().setMachineId('machine-1');
        useNewSessionDraft.getState().selectProject({
            id: '11111111-1111-4111-8111-111111111111',
            primaryPath: '/home/dev/happy',
        });
        expect(useNewSessionDraft.getState()).toMatchObject({
            selectedMachineId: 'machine-1',
            selectedProjectId: '11111111-1111-4111-8111-111111111111',
            selectedPath: '/home/dev/happy',
        });
        expect(mockPersistence.saved.at(-1)).toMatchObject({
            selectedProjectId: '11111111-1111-4111-8111-111111111111',
            selectedPath: '/home/dev/happy',
        });

        useNewSessionDraft.getState().setPath('/home/dev/other');
        expect(useNewSessionDraft.getState().selectedProjectId).toBeNull();
        useNewSessionDraft.getState().setMachineId('machine-2');
        expect(useNewSessionDraft.getState()).toMatchObject({
            selectedMachineId: 'machine-2',
            selectedProjectId: null,
            selectedPath: null,
        });
    });
});
