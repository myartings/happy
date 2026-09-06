import { describe, expect, it } from 'vitest';
import {
    getAppUpdateChannel,
    getNativeUpdateUrl,
    getOtaSourceLabel,
} from './updateChannel';

describe('update channel presentation', () => {
    it('labels Personal and official OTA sources distinctly', () => {
        expect(getOtaSourceLabel(getAppUpdateChannel('com.myartings.happy'))).toBe('Happy Personal OTA');
        expect(getOtaSourceLabel(getAppUpdateChannel('com.ex3ndr.happy'))).toBe('Happy Official OTA');
    });

    it('keeps development variants from being presented as official', () => {
        expect(getOtaSourceLabel(getAppUpdateChannel('com.slopus.happy.dev'))).toBe('Happy Dev OTA');
        expect(getOtaSourceLabel(getAppUpdateChannel('com.slopus.happy.preview'))).toBe('Happy Preview OTA');
    });
});

describe('native update isolation', () => {
    const officialUrl = 'https://apps.apple.com/example';

    it('accepts the current server contract for the official app', () => {
        expect(getNativeUpdateUrl({ updateUrl: officialUrl }, 'com.ex3ndr.happy')).toBe(officialUrl);
    });

    it('accepts the legacy deployed contract for the official app', () => {
        expect(getNativeUpdateUrl({ update_required: true, update_url: officialUrl }, 'com.ex3ndr.happy')).toBe(officialUrl);
    });

    it('rejects official store links for Personal and unknown apps', () => {
        expect(getNativeUpdateUrl({ updateUrl: officialUrl }, 'com.myartings.happy')).toBeNull();
        expect(getNativeUpdateUrl({ updateUrl: officialUrl }, 'com.example.unknown')).toBeNull();
    });
});
