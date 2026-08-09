import { z } from 'zod';
import type { Fastify } from '../types';
import { GithubIssuesError, githubIssuesService } from '@/app/github/githubIssuesRuntime';
import { isGithubIssuesEnabled } from '@/app/github/githubIssuesFeature';

const repositoryParams = z.object({ owner: z.string().min(1), repo: z.string().min(1) });
const issueParams = repositoryParams.extend({ number: z.coerce.number().int().positive() });

function sendError(reply: any, error: unknown) {
    if (error instanceof GithubIssuesError) {
        return reply.code(error.statusCode).send({ error: error.code, message: error.message });
    }
    const message = error instanceof Error ? error.message : 'GitHub Issues request failed';
    const statusCode = message.includes('not allowed') ? 403 : message.includes('required') ? 400 : 500;
    return reply.code(statusCode).send({ error: 'github_issues_error', message });
}

export function githubIssuesRoutes(app: Fastify) {
    app.addHook('preHandler', async (request, reply) => {
        if (request.url.startsWith('/v1/github-issues') && !isGithubIssuesEnabled()) {
            return reply.code(404).send({ error: 'feature_disabled', message: 'GitHub Issues is disabled' });
        }
    });

    app.get('/v1/github-issues/repositories', { preHandler: app.authenticate }, async (request, reply) => {
        try {
            const slug = process.env.GITHUB_APP_SLUG;
            return reply.send({
                repositories: await githubIssuesService.listRepositories(request.userId),
                installationUrl: slug ? `https://github.com/apps/${encodeURIComponent(slug)}/installations/new` : null,
            });
        } catch (error) { return sendError(reply, error); }
    });

    app.get('/v1/github-issues/repositories/:owner/:repo/issues', {
        preHandler: app.authenticate,
        schema: {
            params: repositoryParams,
            querystring: z.object({ state: z.enum(['open', 'closed']).default('open'), page: z.coerce.number().int().positive().default(1) }),
        },
    }, async (request, reply) => {
        try {
            return reply.send(await githubIssuesService.listIssues(request.userId, { ...request.params, ...request.query }));
        } catch (error) { return sendError(reply, error); }
    });

    app.get('/v1/github-issues/repositories/:owner/:repo/issues/:number', {
        preHandler: app.authenticate,
        schema: { params: issueParams },
    }, async (request, reply) => {
        try { return reply.send(await githubIssuesService.getIssue(request.userId, request.params)); }
        catch (error) { return sendError(reply, error); }
    });

    app.post('/v1/github-issues/repositories/:owner/:repo/issues', {
        preHandler: app.authenticate,
        schema: { params: repositoryParams, body: z.object({ title: z.string().min(1).max(256), body: z.string().max(65536).nullable().optional() }) },
    }, async (request, reply) => {
        try { return reply.code(201).send(await githubIssuesService.createIssue(request.userId, { ...request.params, ...request.body })); }
        catch (error) { return sendError(reply, error); }
    });

    app.patch('/v1/github-issues/repositories/:owner/:repo/issues/:number', {
        preHandler: app.authenticate,
        schema: { params: issueParams, body: z.object({ state: z.enum(['open', 'closed']) }) },
    }, async (request, reply) => {
        try { return reply.send(await githubIssuesService.setIssueState(request.userId, { ...request.params, ...request.body })); }
        catch (error) { return sendError(reply, error); }
    });

    app.delete('/v1/github-issues/repositories/:owner/:repo/issues/:number', {
        preHandler: app.authenticate,
        schema: { params: issueParams },
    }, async (request, reply) => {
        try {
            await githubIssuesService.deleteIssue(request.userId, request.params);
            return reply.send({ success: true });
        } catch (error) { return sendError(reply, error); }
    });
}
