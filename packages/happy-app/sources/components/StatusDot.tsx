import * as React from 'react';
import { ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

export interface StatusDotProps {
    color: string;
    isPulsing?: boolean;
    size?: number;
    pulseOpacity?: number;
    style?: ViewStyle;
}

export const StatusDot = React.memo(({ color, isPulsing, size = 6, pulseOpacity = 0.3, style }: StatusDotProps) => {
    const opacity = useSharedValue(1);

    React.useEffect(() => {
        if (isPulsing) {
            opacity.value = withRepeat(
                withTiming(pulseOpacity, { duration: 1000 }),
                -1, // infinite
                true // reverse
            );
        } else {
            opacity.value = withTiming(1, { duration: 200 });
        }
    }, [isPulsing, pulseOpacity]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const baseStyle: ViewStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
    };

    return (
        <Animated.View
            style={[
                baseStyle,
                animatedStyle,
                style
            ]}
        />
    );
});
