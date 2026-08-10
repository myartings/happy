import { describe, expect, it } from 'vitest';
import { parseGithubRepository } from './githubRepository';

describe('parseGithubRepository', () => {
    it.each([
        ['git@github.com:acme/widget.git', { owner: 'acme', repo: 'widget' }],
        ['https://github.com/acme/widget.git', { owner: 'acme', repo: 'widget' }],
        ['https://github.com/acme/widget/', { owner: 'acme', repo: 'widget' }],
        ['ssh://git@github.com/acme/widget', { owner: 'acme', repo: 'widget' }],
    ])('parses %s', (remote, expected) => expect(parseGithubRepository(remote)).toEqual(expected));

    it('rejects non-GitHub remotes', () => expect(parseGithubRepository('https://gitlab.com/acme/widget.git')).toBeNull());
});

