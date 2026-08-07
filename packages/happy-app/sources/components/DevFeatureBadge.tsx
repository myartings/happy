import * as React from 'react';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Typography } from '@/constants/Typography';

export const DevFeatureBadge = React.memo(function DevFeatureBadge() {
    return <Text style={styles.badge}>DEV</Text>;
});

const styles = StyleSheet.create((theme) => ({
    badge: {
        ...Typography.default('semiBold'),
        marginLeft: 7,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 5,
        overflow: 'hidden',
        color: theme.colors.textLink,
        backgroundColor: theme.colors.textLink + '18',
        fontSize: 10,
        lineHeight: 14,
        letterSpacing: 0.5,
    },
}));
