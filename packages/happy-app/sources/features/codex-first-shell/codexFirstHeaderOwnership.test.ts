import { describe, expect, it } from 'vitest';

import { resolveCodexFirstHeaderOwnership } from './codexFirstHeaderOwnership';

describe('Codex-first Header ownership', () => {
    it('gives the packaged shell sole ownership while preserving legacy tablet and phone decisions', () => {
        expect(resolveCodexFirstHeaderOwnership({
            codexFirstEnabled: true,
            legacyTabletLayout: false,
        })).toEqual({
            hideRouteBackButton: true,
            routeHeadersAllowed: false,
            showPhoneInboxHeader: false,
        });

        expect(resolveCodexFirstHeaderOwnership({
            codexFirstEnabled: false,
            legacyTabletLayout: true,
        })).toEqual({
            hideRouteBackButton: true,
            routeHeadersAllowed: true,
            showPhoneInboxHeader: false,
        });

        expect(resolveCodexFirstHeaderOwnership({
            codexFirstEnabled: false,
            legacyTabletLayout: false,
        })).toEqual({
            hideRouteBackButton: false,
            routeHeadersAllowed: true,
            showPhoneInboxHeader: true,
        });
    });
});
