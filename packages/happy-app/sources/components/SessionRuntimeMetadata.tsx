import * as React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import type { SessionPlatformKind } from '@/utils/sessionRuntimeDisplay';
import { ProviderIcon } from './ProviderIcon';

const platformLabels: Record<SessionPlatformKind, string> = {
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
    unknown: 'Unknown device',
};

function PlatformIcon({ kind, size }: { kind: SessionPlatformKind; size: number }) {
    const { theme } = useUnistyles();
    const color = theme.colors.textSecondary;
    if (kind === 'windows') return <Ionicons name="logo-windows" size={size} color={color} />;
    if (kind === 'macos') return <Ionicons name="logo-apple" size={size} color={color} />;
    if (kind === 'linux') return <Ionicons name="logo-tux" size={size} color={color} />;
    return <Ionicons name="desktop-outline" size={size} color={color} />;
}

export function SessionRuntimeMetadata({
    platformKind,
    projectName,
    providerKind,
    providerName,
    modelName,
    identityLine,
    activitySummary,
    contentInset,
}: {
    platformKind: SessionPlatformKind | null;
    projectName: string | null;
    providerKind: string | null;
    providerName: string | null;
    modelName: string | null;
    identityLine: string | null;
    activitySummary: string | null;
    contentInset?: number;
}) {
    const details = [identityLine ?? providerName, projectName, modelName, activitySummary].filter(Boolean) as string[];
    const accessibilityLabel = [platformKind ? platformLabels[platformKind] : null, ...details].filter(Boolean).join(', ');

    if (!platformKind && !providerKind && details.length === 0) return null;

    return (
        <View
            style={[styles.row, contentInset !== undefined && { marginLeft: contentInset }]}
            accessible
            accessibilityLabel={accessibilityLabel}
        >
            {platformKind ? <PlatformIcon kind={platformKind} size={12} /> : null}
            {platformKind && (providerKind || details.length > 0) ? <Text style={styles.separator}>·</Text> : null}
            {providerKind ? <ProviderIcon kind={providerKind} size={11} /> : null}
            {details.length > 0 ? (
                <Text style={styles.details} numberOfLines={1}>
                    {details.join(' · ')}
                </Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    row: {
        marginLeft: 24,
        marginTop: 2,
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    separator: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        ...Typography.default('regular'),
    },
    details: {
        minWidth: 0,
        flexShrink: 1,
        fontSize: 11,
        color: theme.colors.textSecondary,
        ...Typography.default('regular'),
    },
}));
