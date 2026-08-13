/**
 * Horizontal scrollable strip showing selected image attachment thumbnails.
 * Each thumbnail shows the image with a remove button.
 * Uses thumbhash as a blurry placeholder while the full image loads.
 */
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { AttachmentPreview } from '@/sync/attachmentTypes';
import { thumbhashToDataUri } from '@/utils/thumbhash';

const THUMB_SIZE = 64;
const BORDER_RADIUS = 8;

interface AgentInputAttachmentStripProps {
    images: AttachmentPreview[];
    onRemove: (id: string) => void;
    studio?: boolean;
    thumbnailSize?: number;
}

export function AgentInputAttachmentStrip({ images, onRemove, studio = false, thumbnailSize = THUMB_SIZE }: AgentInputAttachmentStripProps) {
    const { theme } = useUnistyles();

    if (images.length === 0) return null;

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.strip, studio && styles.stripStudio]}
            contentContainerStyle={[styles.stripContent, studio && styles.stripContentStudio]}
            keyboardShouldPersistTaps="always"
        >
            {images.map((img) => (
                <AttachmentThumbnail
                    key={img.id}
                    image={img}
                    onRemove={onRemove}
                    theme={theme}
                    studio={studio}
                    thumbnailSize={thumbnailSize}
                />
            ))}
        </ScrollView>
    );
}

function AttachmentThumbnail({
    image,
    onRemove,
    theme,
    studio,
    thumbnailSize,
}: {
    image: AttachmentPreview;
    onRemove: (id: string) => void;
    theme: any;
    studio: boolean;
    thumbnailSize: number;
}) {
    // Build placeholder from thumbhash if available
    const placeholder = React.useMemo(() => {
        if (!image.thumbhash) return undefined;
        const uri = thumbhashToDataUri(image.thumbhash);
        return uri ? { uri } : undefined;
    }, [image.thumbhash]);

    return (
        <View style={[
            styles.thumbContainer,
            studio && styles.thumbContainerStudio,
            { width: thumbnailSize, height: thumbnailSize },
            { borderColor: theme.colors.divider }
        ]}>
            <Image
                source={{ uri: image.uri }}
                placeholder={placeholder}
                style={[
                    { width: thumbnailSize, height: thumbnailSize },
                    styles.thumb,
                    studio && styles.thumbStudio,
                ]}
                contentFit="cover"
                transition={150}
            />
            {/* Remove button */}
            <Pressable
                onPress={() => onRemove(image.id)}
                hitSlop={4}
                style={(p) => [
                    styles.removeButton,
                    { backgroundColor: theme.colors.surfaceHigh, opacity: p.pressed ? 0.7 : 1 }
                ]}
            >
                <Ionicons name="close" size={10} color={theme.colors.text} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create(() => ({
    strip: {
        marginBottom: 8,
        marginHorizontal: 8,
    },
    stripStudio: {
        marginBottom: 6,
        marginHorizontal: 4,
    },
    stripContent: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 4,
    },
    stripContentStudio: {
        gap: 6,
        paddingHorizontal: 0,
        paddingTop: 2,
    },
    thumbContainer: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: BORDER_RADIUS,
        overflow: 'visible',
        borderWidth: 1,
        position: 'relative',
    },
    thumbContainerStudio: {
        borderRadius: 10,
    },
    thumb: {
        borderRadius: BORDER_RADIUS,
    },
    thumbStudio: {
        borderRadius: 10,
    },
    removeButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
}));
