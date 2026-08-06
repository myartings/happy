import * as React from 'react';
import { SessionListViewItem, useSessionListViewData, useSetting } from '@/sync/storage';
import { buildVisibleSessionListViewData } from '@/utils/visibleSessionListViewData';

export function useVisibleSessionListViewData(): SessionListViewItem[] | null {
    const data = useSessionListViewData();
    const hideInactiveSessions = useSetting('hideInactiveSessions');
    const sortActiveSessionsGlobally = useSetting('sortActiveSessionsGlobally');

    return React.useMemo(() => buildVisibleSessionListViewData(data, {
        hideInactiveSessions,
        sortActiveSessionsGlobally,
    }), [data, hideInactiveSessions, sortActiveSessionsGlobally]);
}
