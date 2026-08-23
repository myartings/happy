import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const compactRows = readFileSync(
    new URL('../components/ActiveSessionsGroupCompact.tsx', import.meta.url),
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
            "const statusTextColor = session.state === 'waiting' ? theme.colors.textSecondary : baseStatus.color;",
        );
        expect(compactRows).toContain('{ color: statusTextColor }');
    });
});
