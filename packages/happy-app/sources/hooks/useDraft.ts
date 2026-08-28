import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { storage } from '@/sync/storage';
import { useIsFocused } from '@react-navigation/native';

interface UseDraftOptions {
    autoSaveInterval?: number; // in milliseconds, default 2000
}

export function useDraft(
    sessionId: string | null | undefined,
    value: string,
    onChange: (value: string) => void,
    options: UseDraftOptions = {}
) {
    const { autoSaveInterval = 2000 } = options;
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestValueRef = useRef(value);
    const latestValueSessionIdRef = useRef(sessionId);
    if (latestValueSessionIdRef.current === sessionId) {
        latestValueRef.current = value;
    }
    // Seed with the initial value so a pre-hydrated draft (e.g. ChatComposer
    // reads storage synchronously on mount) doesn't trip the autosave into
    // re-writing what we just loaded.
    const lastSavedValue = useRef<string>(value);
    const isFocused = useIsFocused();

    const cancelPendingSave = useCallback(() => {
        if (saveTimeoutRef.current === null) return;
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
    }, []);

    // Render-time updates keep lifecycle callbacks current, but a new Session's
    // value must not replace the old Session's value before effect cleanup has
    // had a chance to flush it.
    useEffect(() => {
        latestValueSessionIdRef.current = sessionId;
        latestValueRef.current = value;
        lastSavedValue.current = sessionId
            ? storage.getState().sessions[sessionId]?.draft ?? ''
            : value;
    }, [sessionId]);

    // Save draft to storage
    const saveDraft = useCallback((draft: string) => {
        if (!sessionId) return;

        storage.getState().updateSessionDraft(sessionId, draft);
        lastSavedValue.current = draft;
    }, [sessionId]);

    // Load draft on mount and when focused
    useEffect(() => {
        if (!sessionId || !isFocused) return;

        const session = storage.getState().sessions[sessionId];
        if (session?.draft && !value) {
            onChange(session.draft);
            latestValueRef.current = session.draft;
            lastSavedValue.current = session.draft;
        } else if (!session?.draft) {
            // Ensure lastSavedValue is empty if there's no draft
            lastSavedValue.current = '';
        }
    }, [sessionId, isFocused, onChange]);

    // Auto-save with smart debouncing
    useEffect(() => {
        if (!sessionId) return;

        cancelPendingSave();

        // Hydration updates the latest ref before the caller has rerendered
        // with the persisted value. Ignore that stale render instead of
        // treating its initial empty string as a user edit.
        if (latestValueRef.current !== value) {
            return;
        }

        // Only save if value has changed
        if (value !== lastSavedValue.current) {
            const wasEmpty = !lastSavedValue.current.trim();
            const isEmpty = !value.trim();

            if (wasEmpty !== isEmpty) {
                // State transition: empty <-> non-empty
                // Save immediately for instant feedback
                saveDraft(value);
            } else if (!isEmpty) {
                // Text is being modified (non-empty to non-empty)
                // Debounce to avoid excessive saves
                saveTimeoutRef.current = setTimeout(() => {
                    saveTimeoutRef.current = null;
                    if (
                        latestValueRef.current === value
                        && value !== lastSavedValue.current
                    ) {
                        saveDraft(value);
                    }
                }, autoSaveInterval);
            }
            // If both are empty, no need to save
        }

        return cancelPendingSave;
    }, [value, sessionId, autoSaveInterval, cancelPendingSave, saveDraft]);

    // Save on app state change (background/inactive)
    useEffect(() => {
        if (!sessionId) return;

        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                cancelPendingSave();
                const latestValue = latestValueRef.current;
                if (latestValue !== lastSavedValue.current) {
                    saveDraft(latestValue);
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [sessionId, cancelPendingSave, saveDraft]);

    // Save on unmount
    useEffect(() => {
        return () => {
            cancelPendingSave();
            const latestValue = latestValueRef.current;
            if (sessionId && latestValue !== lastSavedValue.current) {
                saveDraft(latestValue);
            }
        };
    }, [sessionId, cancelPendingSave, saveDraft]);

    // Clear draft (used after message is sent)
    const clearDraft = useCallback(() => {
        if (!sessionId) return;

        cancelPendingSave();
        storage.getState().updateSessionDraft(sessionId, null);
        latestValueRef.current = '';
        lastSavedValue.current = '';
    }, [sessionId, cancelPendingSave]);

    return {
        clearDraft,
    };
}
