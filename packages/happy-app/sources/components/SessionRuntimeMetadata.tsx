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
    providerKind,
    providerName,
    modelName,
    identityLine,
    activitySummary,
}: {
    platformKind: SessionPlatformKind;
    providerKind: string | null;
    providerName: string | null;
    modelName: string | null;
    identityLine: string | null;
    activitySummary: string | null;
}) {
    const details = [identityLine ?? providerName, modelName, activitySummary].filter(Boolean) as string[];
    const accessibilityLabel = [platformLabels[platformKind], ...details].join(', ');

    return (
        <View style={styles.row} accessible accessibilityLabel={accessibilityLabel}>
            <PlatformIcon kind={platformKind} size={12} />
            <Text style={styles.separator}>·</Text>
            {providerKind ? <ProviderIcon kind={providerKind} size={11} /> : null}
            <Text style={styles.details} numberOfLines={1}>
                {details.join(' · ')}
            </Text>
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
