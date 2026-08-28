import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

function read(relativePath: string): string {
    return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
}

describe('hardware keyboard command native contract', () => {
    const nativeView = read('../../modules/hardware-keyboard-command/ios/HardwareKeyboardCommandView.swift');

    it('claims only unmodified hardware Return with system priority', () => {
        expect(nativeView).toContain('input: "\\r"');
        expect(nativeView).toContain('modifierFlags: []');
        expect(nativeView).toContain('wantsPriorityOverSystemBehavior = true');
        expect(nativeView).not.toContain('modifierFlags: [.shift]');
    });

    it('does not submit while an input method has marked text', () => {
        expect(nativeView).toContain('textInput.markedTextRange != nil');
        expect(nativeView).toContain('return !hasMarkedText(in: self)');
    });

    it('keeps the software-keyboard multiline contract unchanged', () => {
        const multiTextInput = read('../components/MultiTextInput.tsx');
        expect(multiTextInput).toContain("submitBehavior = multiline ? 'newline' : 'blurAndSubmit'");
    });
});

describe('hardware keyboard command wiring', () => {
    it('wraps both session composers in the native command boundary', () => {
        const existingSession = read('../components/AgentInput.tsx');
        const newSession = read('../app/(app)/new/index.tsx');

        expect(existingSession).toContain('<HardwareKeyboardCommandBoundary onHardwareReturn={handleHardwareReturn}>');
        expect(newSession).toContain('<HardwareKeyboardCommandBoundary onHardwareReturn={props.onHardwareReturn}>');
    });

    it('falls back without adding a layout wrapper when the native module is unavailable', () => {
        const nativeModule = read('../../modules/hardware-keyboard-command/index.tsx');
        const appleBoundary = read('./HardwareKeyboardCommandBoundary.ios.tsx');
        const otherPlatforms = read('./HardwareKeyboardCommandBoundary.tsx');

        expect(nativeModule).toContain("requireOptionalNativeModule('HardwareKeyboardCommand')");
        expect(appleBoundary).toContain('if (!HardwareKeyboardCommandView)');
        expect(otherPlatforms).toContain('return <>{children}</>');
    });
});
