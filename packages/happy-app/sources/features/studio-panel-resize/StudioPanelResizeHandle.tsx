import * as React from 'react';
import { Platform, View } from 'react-native';
import {
    STUDIO_PANEL_GEOMETRY,
    projectPanelDrag,
    projectPanelWidth,
    resetPanelWidth,
    type StudioPanelSide,
} from './studioPanelResizePolicy';

type StudioPanelResizeHandleProps = {
    side: StudioPanelSide;
    width: number;
    windowWidth: number;
    oppositeWidth: number;
    oppositeVisible: boolean;
    label: string;
    onWidthChange: (width: number) => void;
    style?: unknown;
};

type ActivePointer = {
    id: number;
    startX: number;
    startWidth: number;
};

export function StudioPanelResizeHandle({
    side,
    width,
    windowWidth,
    oppositeWidth,
    oppositeVisible,
    label,
    onWidthChange,
    style,
}: StudioPanelResizeHandleProps) {
    const activePointer = React.useRef<ActivePointer | null>(null);
    const [hovered, setHovered] = React.useState(false);
    const [focused, setFocused] = React.useState(false);
    const [dragging, setDragging] = React.useState(false);

    const projectionInput = React.useMemo(() => ({
        side,
        windowWidth,
        oppositeWidth,
        oppositeVisible,
    }), [oppositeVisible, oppositeWidth, side, windowWidth]);
    const minimum = projectPanelWidth({ ...projectionInput, requestedWidth: -1_000_000 });
    const maximum = projectPanelWidth({ ...projectionInput, requestedWidth: 1_000_000 });

    const adjustBy = React.useCallback((delta: number) => {
        onWidthChange(projectPanelWidth({
            ...projectionInput,
            requestedWidth: width + delta,
        }));
    }, [onWidthChange, projectionInput, width]);

    const reset = React.useCallback(() => {
        onWidthChange(resetPanelWidth(projectionInput));
    }, [onWidthChange, projectionInput]);

    const pointerProps = Platform.OS === 'web' ? {
        role: 'separator',
        tabIndex: 0,
        onPointerEnter: () => setHovered(true),
        onPointerLeave: () => setHovered(false),
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
        onPointerDown: (event: any) => {
            if (event.button !== undefined && event.button !== 0) return;
            activePointer.current = {
                id: event.pointerId,
                startX: event.clientX,
                startWidth: width,
            };
            event.currentTarget?.setPointerCapture?.(event.pointerId);
            setDragging(true);
            event.preventDefault?.();
        },
        onPointerMove: (event: any) => {
            const active = activePointer.current;
            if (!active || active.id !== event.pointerId) return;
            onWidthChange(projectPanelDrag({
                ...projectionInput,
                startWidth: active.startWidth,
                startPointerX: active.startX,
                pointerX: event.clientX,
            }));
        },
        onPointerUp: (event: any) => {
            const active = activePointer.current;
            if (!active || active.id !== event.pointerId) return;
            event.currentTarget?.releasePointerCapture?.(event.pointerId);
            activePointer.current = null;
            setDragging(false);
        },
        onPointerCancel: () => {
            activePointer.current = null;
            setDragging(false);
        },
        onDoubleClick: (event: any) => {
            event.preventDefault?.();
            reset();
        },
        onKeyDown: (event: any) => {
            if (event.key === 'Home') {
                event.preventDefault();
                reset();
                return;
            }
            if (!['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key)) return;
            event.preventDefault();
            const increase = event.key === 'ArrowRight' || event.key === 'ArrowUp';
            adjustBy((increase ? 1 : -1) * STUDIO_PANEL_GEOMETRY.keyboardStep);
        },
    } : {};

    return (
        <View
            {...pointerProps as any}
            accessibilityRole="adjustable"
            accessibilityLabel={label}
            accessibilityValue={{ min: minimum, max: maximum, now: width }}
            accessibilityActions={[
                { name: 'increment', label: 'Increase width' },
                { name: 'decrement', label: 'Decrease width' },
            ]}
            onAccessibilityAction={(event) => {
                if (event.nativeEvent.actionName === 'increment') adjustBy(STUDIO_PANEL_GEOMETRY.keyboardStep);
                if (event.nativeEvent.actionName === 'decrement') adjustBy(-STUDIO_PANEL_GEOMETRY.keyboardStep);
            }}
            style={[
                {
                    width: 8,
                    cursor: Platform.OS === 'web' ? 'col-resize' : undefined,
                    backgroundColor: dragging
                        ? 'rgba(47, 111, 235, 0.46)'
                        : focused
                            ? 'rgba(47, 111, 235, 0.34)'
                            : hovered
                                ? 'rgba(87, 96, 106, 0.22)'
                                : 'rgba(87, 96, 106, 0.04)',
                } as any,
                style,
            ]}
        />
    );
}
