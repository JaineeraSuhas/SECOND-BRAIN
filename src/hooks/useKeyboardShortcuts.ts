import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ShortcutConfig {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean; // Command key on Mac
    shiftKey?: boolean;
    altKey?: boolean;
    action: () => void;
    description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            shortcuts.forEach((shortcut) => {
                const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatches = shortcut.ctrlKey ? (event.ctrlKey || event.metaKey) : true;
                const shiftMatches = shortcut.shiftKey ? event.shiftKey : true;
                const altMatches = shortcut.altKey ? event.altKey : true;

                // Check for exact modifiers matching
                // If config specifies ctrlKey: true, we expect ctrl/meta to be pressed.
                // If config specifies ctrlKey: undefined/false, we generally don't care, 
                // BUT for "simple" keys (like Escape), we usually want no modifiers.
                // For this simple hook, we'll check simply:

                const metaPressed = event.metaKey || event.ctrlKey;
                const shiftPressed = event.shiftKey;
                const altPressed = event.altKey;

                const configMeta = !!shortcut.ctrlKey || !!shortcut.metaKey;
                const configShift = !!shortcut.shiftKey;
                const configAlt = !!shortcut.altKey;

                if (
                    keyMatches &&
                    metaPressed === configMeta &&
                    shiftPressed === configShift &&
                    altPressed === configAlt
                ) {
                    event.preventDefault();
                    shortcut.action();
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [shortcuts]);
};
