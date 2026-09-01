import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    ensureLoaded: vi.fn(async () => undefined),
    refreshLive: vi.fn(async () => undefined),
    effectCleanup: undefined as undefined | (() => void),
}));

vi.mock('react', () => ({
    useEffect: (effect: () => void | (() => void)) => {
        mocks.effectCleanup = effect() ?? undefined;
    },
    useSyncExternalStore: (_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot(),
}));

vi.mock('react-native', () => ({
    StyleSheet: { create: (styles: unknown) => styles },
}));

vi.mock('@/components/StyledText', () => ({ Text: () => null }));
vi.mock('@/sync/storage', () => ({ useLocalSetting: () => true }));
vi.mock('@/text', () => ({ t: (key: string) => key }));
vi.mock('./githubIssueBindingProjection', () => ({
    selectGithubIssueSessionProjection: (_enabled: boolean, projection: unknown) => projection,
}));
vi.mock('./githubIssueBindingStore', () => ({
    ensureGithubIssueSessionProjectionsLoaded: mocks.ensureLoaded,
    getGithubIssueSessionFreshness: () => 'current',
    getGithubIssueSessionProjection: () => null,
    refreshGithubIssueSessionLiveContext: mocks.refreshLive,
    subscribeGithubIssueSessionProjections: () => () => undefined,
}));

import { useGithubIssueSessionProjection } from './GithubIssueSessionBadge';

describe('useGithubIssueSessionProjection', () => {
    beforeEach(() => {
        mocks.ensureLoaded.mockReset();
        mocks.ensureLoaded.mockResolvedValue(undefined);
        mocks.refreshLive.mockClear();
        mocks.effectCleanup = undefined;
    });

    it('does not load projections or refresh GitHub when the action gate is closed', async () => {
        useGithubIssueSessionProjection('session-1', false, true);
        await Promise.resolve();

        expect(mocks.ensureLoaded).not.toHaveBeenCalled();
        expect(mocks.refreshLive).not.toHaveBeenCalled();
    });

    it('loads projections and refreshes GitHub when the action gate is open', async () => {
        useGithubIssueSessionProjection('session-1', true, true);
        await Promise.resolve();
        await Promise.resolve();

        expect(mocks.ensureLoaded).toHaveBeenCalledOnce();
        expect(mocks.refreshLive).toHaveBeenCalledWith('session-1');
    });

    it('does not refresh GitHub after the action gate closes during projection loading', async () => {
        let resolveLoaded!: (value: undefined) => void;
        mocks.ensureLoaded.mockReturnValueOnce(new Promise<undefined>((resolve) => {
            resolveLoaded = resolve;
        }));

        useGithubIssueSessionProjection('session-1', true, true);
        expect(mocks.ensureLoaded).toHaveBeenCalledOnce();
        mocks.effectCleanup?.();
        resolveLoaded(undefined);
        await Promise.resolve();
        await Promise.resolve();

        expect(mocks.refreshLive).not.toHaveBeenCalled();
    });
});
