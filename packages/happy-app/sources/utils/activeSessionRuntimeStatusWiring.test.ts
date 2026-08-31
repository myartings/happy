import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const compactRows = readFileSync(
    new URL('../components/ActiveSessionsGroupCompact.tsx', import.meta.url),
    'utf8',
);
const flatRows = readFileSync(
    new URL('../components/FlatSessionRow.tsx', import.meta.url),
    'utf8',
);
const groupedRows = readFileSync(
    new URL('../components/SessionsList.tsx', import.meta.url),
    'utf8',
);
const sessionRoute = readFileSync(
    new URL('../app/(app)/session/[id].tsx', import.meta.url),
    'utf8',
);

describe('active session runtime status wiring', () => {
    it('renders every localized runtime state in the default compact row', () => {
        expect(compactRows).toContain("t('status.running')");
        expect(compactRows).toContain("t('status.idle')");
        expect(compactRows).toContain("t('status.permissionRequired')");
        expect(compactRows).toContain("t('status.lastSeen'");
        expect(compactRows).toContain('{statusText}');
        expect(compactRows).toContain('{ color: statusTextColor }');
    });

    it('does not hide the status label behind optional runtime metadata', () => {
        const statusLabelIndex = compactRows.indexOf('{statusText}');
        const optionalMetadataIndex = compactRows.indexOf('{showActiveSessionRuntime ? (');

        expect(statusLabelIndex).toBeGreaterThanOrEqual(0);
        expect(statusLabelIndex).toBeLessThan(optionalMetadataIndex);
    });

    it('keeps the idle label consistent with the existing waiting indicator', () => {
        expect(compactRows).toContain(
            "const statusTextColor = currentRequestKind === null && session.state === 'waiting'",
        );
        expect(compactRows).toContain(': status.color;');
        expect(compactRows).toContain('{ color: statusTextColor }');
    });

    it('keeps the same runtime labels visible in the default flat list', () => {
        expect(flatRows).toContain("t('status.running')");
        expect(flatRows).toContain("t('status.idle')");
        expect(flatRows).toContain("t('status.permissionRequired')");
        expect(flatRows).toContain("t('status.lastSeen'");
        expect(flatRows).toContain(
            "const statusTextColor = currentRequestKind === null && session.state === 'waiting'",
        );
    });

    it('gates reason, action, and focus navigation through one setting-aware row policy', () => {
        for (const source of [compactRows, flatRows, groupedRows]) {
            expect(source).toContain(
                'resolveCurrentRequestRowAttention(session, needsAttentionSessionsEnabled)',
            );
            expect(source).toContain('t(currentRequest.actionTextKey)');
            expect(source).toContain('currentRequest.focusHint ?? undefined');
            expect(source).not.toContain('session.attention?.primaryReason');
        }
    });

    it('parses attention versions strictly at the Session route boundary', () => {
        expect(sessionRoute).toContain('parseCurrentRequestAttentionRouteVersion(');
        expect(sessionRoute).not.toContain('Number(attentionAgentStateVersion)');
    });
});
