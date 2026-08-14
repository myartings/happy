import {
    resolveDesktopVisualStyle,
    type VisualStyle,
} from '@/features/studio-visual-style/studioVisualStyle';

export type StudioToolPresentation = Readonly<{
    visualStyle: 'studio';
    shell: Readonly<{
        backgroundColor: string;
        borderColor: string;
        borderRadius: number;
        borderWidth: number;
        marginVertical: number;
    }>;
    header: Readonly<{
        backgroundColor: string;
        borderColor: string;
        minHeight: number;
        paddingHorizontal: number;
        paddingVertical: number;
        titleFontSize: number;
        descriptionFontSize: number;
    }>;
    compactRow: Readonly<{
        minHeight: number;
        paddingHorizontal: number;
        paddingVertical: number;
        gap: number;
        fontSize: number;
        lineHeight: number;
    }>;
    disclosureRow: Readonly<{
        minHeight: number;
        paddingHorizontal: number;
        paddingVertical: number;
        fontSize: number;
        lineHeight: number;
    }>;
    section: Readonly<{
        marginBottom: number;
        titleFontSize: number;
        titleLineHeight: number;
        titleLetterSpacing: number;
    }>;
    error: Readonly<{
        backgroundColor: string;
        borderColor: string;
        textColor: string;
        borderRadius: number;
        padding: number;
        marginBottom: number;
    }>;
    diff: Readonly<{
        backgroundColor: string;
        borderColor: string;
        pathColor: string;
        metadataColor: string;
        addedColor: string;
        removedColor: string;
        borderRadius: number;
    }>;
    transcript: Readonly<{
        dark: boolean;
        backgroundColor: string;
        borderColor: string;
        commandColor: string;
        promptColor: string;
        stdoutColor: string;
        stderrColor: string;
        metadataColor: string;
        successColor: string;
        runningColor: string;
        errorColor: string;
        borderRadius: number;
        paddingHorizontal: number;
        paddingVertical: number;
        fontSize: number;
        lineHeight: number;
    }>;
}>;

type ResolveStudioToolPresentationInput = Readonly<{
    isTauriRuntime: boolean;
    requestedStyle: VisualStyle;
    previewStyle?: string;
    dark: boolean;
}>;

export function resolveStudioToolPresentation({
    dark,
    isTauriRuntime,
    previewStyle,
    requestedStyle,
}: ResolveStudioToolPresentationInput): StudioToolPresentation | null {
    const visualStyle = resolveDesktopVisualStyle({
        isTauriRuntime,
        previewStyle,
        requestedStyle,
    });

    if (visualStyle !== 'studio') return null;

    return {
        visualStyle,
        shell: {
            backgroundColor: dark ? '#272727' : '#F7F7F6',
            borderColor: dark ? '#3B3B3B' : '#E7E6E3',
            borderRadius: 12,
            borderWidth: 1,
            marginVertical: 6,
        },
        header: {
            backgroundColor: dark ? '#2C2C2C' : '#FAFAF9',
            borderColor: dark ? '#3B3B3B' : '#E7E6E3',
            minHeight: 42,
            paddingHorizontal: 12,
            paddingVertical: 9,
            titleFontSize: 13,
            descriptionFontSize: 12,
        },
        compactRow: {
            minHeight: 26,
            paddingHorizontal: 4,
            paddingVertical: 2,
            gap: 8,
            fontSize: 14,
            lineHeight: 20,
        },
        disclosureRow: {
            minHeight: 30,
            paddingHorizontal: 12,
            paddingVertical: 4,
            fontSize: 13,
            lineHeight: 18,
        },
        section: {
            marginBottom: 10,
            titleFontSize: 11,
            titleLineHeight: 16,
            titleLetterSpacing: 0.55,
        },
        error: {
            backgroundColor: dark ? '#352929' : '#FFF8F7',
            borderColor: dark ? '#5A3A3A' : '#E9CFCC',
            textColor: dark ? '#DC8A8A' : '#973D37',
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
        },
        diff: {
            backgroundColor: dark ? '#2C2C2C' : '#FAFAF9',
            borderColor: dark ? '#3B3B3B' : '#E7E6E3',
            pathColor: dark ? '#E7E7E7' : '#2D2D2D',
            metadataColor: dark ? '#A6A6A6' : '#707070',
            addedColor: dark ? '#80B99D' : '#2E6A4F',
            removedColor: dark ? '#DC8A8A' : '#A23D3D',
            borderRadius: 10,
        },
        transcript: {
            dark,
            backgroundColor: dark ? '#232323' : '#FAFAF9',
            borderColor: dark ? '#3B3B3B' : '#E7E6E3',
            commandColor: dark ? '#E7E7E7' : '#2D2D2D',
            promptColor: dark ? '#85C1C7' : '#327078',
            stdoutColor: dark ? '#D8D8D8' : '#424242',
            stderrColor: dark ? '#DC8A8A' : '#A23D3D',
            metadataColor: dark ? '#A6A6A6' : '#707070',
            successColor: dark ? '#80B99D' : '#2E6A4F',
            runningColor: dark ? '#85C1C7' : '#327078',
            errorColor: dark ? '#DC8A8A' : '#A23D3D',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 13,
            lineHeight: 19,
        },
    };
}
