import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

import { Typography } from '@/constants/Typography';
import { t } from '@/text';
import {
    resolveDesktopComposerModeChips,
    type ResolveDesktopComposerModeChipsInput,
} from './desktopComposerModeChipPresentation';

type DesktopComposerModeChipsProps = ResolveDesktopComposerModeChipsInput & {
    activePicker: 'model' | 'effort' | null;
    onModelPress: () => void;
    onEffortPress: () => void;
    onFastPress: () => void;
};

export const DesktopComposerModeChips = React.memo(function DesktopComposerModeChips(
    props: DesktopComposerModeChipsProps,
) {
    const { theme } = useUnistyles();
    const chips = resolveDesktopComposerModeChips(props);
    if (chips.length === 0) return null;

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {chips.map((chip) => {
                const active = chip.key === 'fast' ? chip.selected === true : props.activePicker === chip.key;
                const onPress = chip.key === 'model'
                    ? props.onModelPress
                    : chip.key === 'effort'
                        ? props.onEffortPress
                        : props.onFastPress;
                return (
                    <Pressable
                        key={chip.key}
                        accessibilityRole={chip.key === 'fast' ? 'switch' : 'button'}
                        accessibilityLabel={chip.key === 'fast'
                            ? 'Fast mode'
                            : `${chip.key === 'model' ? t('agentInput.model.title') : t('agentInput.effort.title')}: ${chip.label}`}
                        accessibilityState={chip.key === 'fast'
                            ? { disabled: !chip.enabled, checked: active }
                            : { disabled: !chip.enabled, selected: active }}
                        disabled={!chip.enabled}
                        onPress={onPress}
                        hitSlop={{ top: 5, bottom: 10, left: 2, right: 2 }}
                        style={({ pressed }) => ({
                            height: 28,
                            maxWidth: chip.key === 'model' ? 184 : 112,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            paddingHorizontal: 8,
                            borderRadius: 8,
                            backgroundColor: active
                                ? theme.colors.surfaceSelected
                                : pressed
                                    ? theme.colors.surfacePressed
                                    : 'transparent',
                            opacity: chip.enabled ? 1 : 0.58,
                        })}
                    >
                        <Ionicons
                            name={chip.key === 'model' ? 'cube-outline' : chip.key === 'fast' && active ? 'flash' : 'flash-outline'}
                            size={13}
                            color={theme.colors.button.secondary.tint}
                        />
                        <Text
                            numberOfLines={1}
                            style={{
                                flexShrink: 1,
                                fontSize: 12,
                                color: theme.colors.button.secondary.tint,
                                ...Typography.default('semiBold'),
                            }}
                        >
                            {chip.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
});
