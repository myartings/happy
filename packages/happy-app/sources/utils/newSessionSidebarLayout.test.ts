import { describe, expect, it } from 'vitest';
import { getNewSessionSidebarLayout } from './newSessionSidebarLayout';

describe('getNewSessionSidebarLayout', () => {
    it('uses the contextual configuration rail by default for a wide Codex-first desktop', () => {
        expect(getNewSessionSidebarLayout({
            codexFirstEnabled: true,
            platform: 'web',
            isMac: true,
            fileDiffsSidebarEnabled: false,
            zenMode: false,
            windowWidth: 1470,
        })).toEqual({
            canShowSidebar: true,
            showSidebar: true,
            sidebarWidth: 360,
        });
    });

    it('enables the right sidebar on supported wide web layouts', () => {
        expect(getNewSessionSidebarLayout({
            platform: 'web',
            isMac: false,
            fileDiffsSidebarEnabled: true,
            zenMode: false,
            windowWidth: 1200,
        })).toEqual({
            canShowSidebar: true,
            showSidebar: true,
            sidebarWidth: 360,
        });
    });

    it('reserves the persistent left navigation and protects 600pt of main content', () => {
        expect(getNewSessionSidebarLayout({
            codexFirstEnabled: true,
            platform: 'web',
            isMac: false,
            fileDiffsSidebarEnabled: false,
            zenMode: false,
            windowWidth: 1100,
            leftSidebarWidth: 275,
        })).toEqual({
            canShowSidebar: false,
            showSidebar: false,
            sidebarWidth: 250,
        });

        const constrained = getNewSessionSidebarLayout({
            codexFirstEnabled: true,
            platform: 'web',
            isMac: false,
            fileDiffsSidebarEnabled: false,
            zenMode: false,
            windowWidth: 1200,
            leftSidebarWidth: 275,
        });
        expect(constrained).toEqual({
            canShowSidebar: true,
            showSidebar: true,
            sidebarWidth: 325,
        });
        expect(1200 - 275 - constrained.sidebarWidth).toBe(600);
    });

    it('disables the sidebar when the setting is off', () => {
        expect(getNewSessionSidebarLayout({
            platform: 'web',
            isMac: false,
            fileDiffsSidebarEnabled: false,
            zenMode: false,
            windowWidth: 1200,
        }).showSidebar).toBe(false);
    });

    it('disables the sidebar in zen mode', () => {
        expect(getNewSessionSidebarLayout({
            platform: 'web',
            isMac: false,
            fileDiffsSidebarEnabled: true,
            zenMode: true,
            windowWidth: 1200,
        }).showSidebar).toBe(false);
    });

    it('disables the sidebar below the minimum width', () => {
        expect(getNewSessionSidebarLayout({
            platform: 'web',
            isMac: false,
            fileDiffsSidebarEnabled: true,
            zenMode: false,
            windowWidth: 1099,
        }).showSidebar).toBe(false);
    });

    it('disables the sidebar on unsupported native platforms', () => {
        expect(getNewSessionSidebarLayout({
            platform: 'ios',
            isMac: false,
            fileDiffsSidebarEnabled: true,
            zenMode: false,
            windowWidth: 1400,
        }).showSidebar).toBe(false);
    });
});
