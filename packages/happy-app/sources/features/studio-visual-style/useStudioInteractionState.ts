import * as React from 'react';

export function useStudioInteractionState(enabled: boolean) {
    const [hovered, setHovered] = React.useState(false);
    const [focused, setFocused] = React.useState(false);

    const interactionProps = React.useMemo(() => enabled ? {
        onBlur: () => setFocused(false),
        onFocus: (event?: any) => {
            const target = event?.nativeEvent?.target ?? event?.target;
            const focusVisible = typeof target?.matches === 'function'
                ? target.matches(':focus-visible')
                : true;
            setFocused(focusVisible);
        },
        onHoverIn: () => setHovered(true),
        onHoverOut: () => setHovered(false),
    } : {}, [enabled]);

    React.useEffect(() => {
        if (!enabled) {
            setHovered(false);
            setFocused(false);
        }
    }, [enabled]);

    return { focused, hovered, interactionProps };
}
