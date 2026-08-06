import * as React from 'react';
import { SessionListViewItem, useSessionListViewData, useSetting } from '@/sync/storage';
import { buildVisibleSessionListViewData } from '@/utils/visibleSessionListViewData';

export function useVisibleSessionListViewData(): SessionListViewItem[] | null {
    const data = useSessionListViewData();
    const hideInactiveSessions = useSetting('hideInactiveSessions');
    const sortActiveSessionsGlobally = useSetting('sortActiveSessionsGlobally');
    const groupActiveSessionsByDate = useSetting('groupActiveSessionsByDate');

    return React.useMemo(() => buildVisibleSessionListViewData(data, {
        hideInactiveSessions,
        sortActiveSessionsGlobally,
        groupActiveSessionsByDate,
    }), [data, hideInactiveSessions, sortActiveSessionsGlobally, groupActiveSessionsByDate]);
}
