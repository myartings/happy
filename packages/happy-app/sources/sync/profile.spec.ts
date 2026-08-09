import { describe, expect, it } from 'vitest';
import { getDisplayName, profileParse } from './profile';

describe('profileParse', () => {
    it('accepts nullable GitHub name and email fields', () => {
        const profile = profileParse({
            id: 'account-1',
            timestamp: 1,
            firstName: null,
            lastName: null,
            avatar: null,
            github: {
                id: 42,
                login: 'octocat',
                name: null,
                avatar_url: 'https://avatars.githubusercontent.com/u/42',
                email: null,
                bio: null,
            },
            connectedServices: [],
        });

        expect(profile.github?.name).toBeNull();
        expect(profile.github?.email).toBeNull();
        expect(getDisplayName(profile)).toBe('octocat');
    });
});
