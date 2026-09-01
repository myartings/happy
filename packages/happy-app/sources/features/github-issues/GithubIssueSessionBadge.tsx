import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from '@/components/StyledText';
import {
    getGithubIssueSessionProjection,
    getGithubIssueSessionFreshness,
    ensureGithubIssueSessionProjectionsLoaded,
    refreshGithubIssueSessionLiveContext,
    subscribeGithubIssueSessionProjections,
} from './githubIssueBindingStore';
import { t } from '@/text';
import { useLocalSetting } from '@/sync/storage';
import { selectGithubIssueSessionProjection } from './githubIssueBindingProjection';
import { formatGithubIssueSessionBadgeLabel, getGithubIssueSessionBadgeState } from './githubIssueBindingBadgeState';

export function useGithubIssueSessionProjection(sessionId: string, enabled = true, refreshLive = false) {
    React.useEffect(() => {
        if (!enabled) return;
        let active = true;
        void ensureGithubIssueSessionProjectionsLoaded().then(() => {
            if (active && refreshLive) return refreshGithubIssueSessionLiveContext(sessionId);
        });
        return () => {
            active = false;
        };
    }, [enabled, refreshLive, sessionId]);
    return React.useSyncExternalStore(
        subscribeGithubIssueSessionProjections,
        () => selectGithubIssueSessionProjection(enabled, getGithubIssueSessionProjection(sessionId)),
        () => null,
    );
}

export function useGithubIssueSessionFreshness(
    sessionId: string,
    enabled = true,
): 'current' | 'changed' | 'unavailable' | 'identity-conflict' {
    return React.useSyncExternalStore(
        subscribeGithubIssueSessionProjections,
        () => enabled ? getGithubIssueSessionFreshness(sessionId) : 'current',
        () => 'current',
    );
}

export function GithubIssueSessionBadge({ sessionId }: { sessionId: string }) {
    const enabled = useLocalSetting('devGithubIssuesEnabled');
    const projection = useGithubIssueSessionProjection(sessionId, enabled);
    const freshness = useGithubIssueSessionFreshness(sessionId, enabled);
    if (!projection) return null;
    const label = formatGithubIssueSessionBadgeLabel(projection.payload);
    const badgeState = getGithubIssueSessionBadgeState(projection.status, freshness);
    const state = badgeState === 'replaced'
        ? ` · ${t('githubIssues.replaced')}`
        : badgeState === 'repair-required'
            ? ` · ${t('githubIssues.repairSession')}`
        : badgeState === 'identity-conflict'
            ? ` · ${t('githubIssues.identityConflict')}`
        : badgeState === 'cached'
            ? ` · ${t('githubIssues.cachedIssueContext')}`
            : badgeState === 'stale'
                ? ` · ${t('githubIssues.staleIssueContext')}`
                : ` · ${t('githubIssues.currentSession')}`;
    return <Text accessibilityRole="text" accessibilityLabel={`GitHub Issue ${label}${state}`} numberOfLines={1} style={styles.badge}>{label}{state}</Text>;
}

const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
        marginTop: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: 'rgba(127,127,127,0.14)',
        fontSize: 10,
        lineHeight: 13,
    },
});
