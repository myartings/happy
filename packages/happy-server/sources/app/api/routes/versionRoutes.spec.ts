import fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type Fastify } from '../types';
import { versionRoutes } from './versionRoutes';

async function buildApp(): Promise<Fastify> {
    const app = fastify();
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    const typed = app.withTypeProvider<ZodTypeProvider>() as unknown as Fastify;
    versionRoutes(typed);
    await typed.ready();
    return typed;
}

describe('POST /v1/version', () => {
    let app: Fastify;

    beforeEach(async () => {
        app = await buildApp();
    });

    afterEach(async () => {
        await app.close();
    });

    async function check(platform: 'ios' | 'android', appId: string) {
        const response = await app.inject({
            method: 'POST',
            url: '/v1/version',
            payload: { platform, version: '0.0.0', app_id: appId },
        });

        expect(response.statusCode).toBe(200);
        return response.json();
    }

    it('returns the official App Store URL only for the official iOS app', async () => {
        await expect(check('ios', 'com.ex3ndr.happy')).resolves.toEqual({
            updateUrl: 'https://apps.apple.com/us/app/happy-claude-code-client/id6748571505',
        });
        await expect(check('ios', 'com.myartings.happy')).resolves.toEqual({ updateUrl: null });
        await expect(check('ios', 'com.example.unknown')).resolves.toEqual({ updateUrl: null });
    });

    it('returns the official Play Store URL only for the official Android app', async () => {
        await expect(check('android', 'com.ex3ndr.happy')).resolves.toEqual({
            updateUrl: 'https://play.google.com/store/apps/details?id=com.ex3ndr.happy',
        });
        await expect(check('android', 'com.myartings.happy')).resolves.toEqual({ updateUrl: null });
        await expect(check('android', 'com.example.unknown')).resolves.toEqual({ updateUrl: null });
    });
});
