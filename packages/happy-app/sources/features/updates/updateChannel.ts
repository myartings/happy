export const OFFICIAL_APP_ID = 'com.ex3ndr.happy';
export const PERSONAL_APP_ID = 'com.myartings.happy';

type AppUpdateChannel = 'official' | 'personal' | 'development' | 'preview' | 'unknown';

export function getAppUpdateChannel(appId: string | undefined): AppUpdateChannel {
    switch (appId) {
        case OFFICIAL_APP_ID:
            return 'official';
        case PERSONAL_APP_ID:
            return 'personal';
        case 'com.slopus.happy.dev':
            return 'development';
        case 'com.slopus.happy.preview':
            return 'preview';
        default:
            return 'unknown';
    }
}

export function getOtaSourceLabel(channel: AppUpdateChannel): string {
    switch (channel) {
        case 'official':
            return 'Happy Official OTA';
        case 'personal':
            return 'Happy Personal OTA';
        case 'development':
            return 'Happy Dev OTA';
        case 'preview':
            return 'Happy Preview OTA';
        default:
            return 'Happy OTA';
    }
}

export function getNativeUpdateUrl(payload: unknown, appId: string | undefined): string | null {
    if (appId !== OFFICIAL_APP_ID || !payload || typeof payload !== 'object') {
        return null;
    }

    const response = payload as Record<string, unknown>;
    if (typeof response.updateUrl === 'string') {
        return response.updateUrl;
    }
    if (response.update_required === true && typeof response.update_url === 'string') {
        return response.update_url;
    }
    return null;
}
