import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
    FiPlus,
    FiSearch,
    FiZap,
    FiBookOpen,
    FiBarChart2,
    FiCommand
} from 'react-icons/fi';

interface QuickActionsBarProps {
    onCreateNode?: () => void;
    onSearch?: () => void;
    onAISuggest?: () => void;
    onLearningPath?: () => void;
    onAnalyze?: () => void;
}

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    label: string;
    icon: any;
}

export default function QuickActionsBar({
    onCreateNode,
    onSearch,
    onAISuggest,
    onLearningPath,
    onAnalyze
}: QuickActionsBarProps) {
    const [showShortcuts, setShowShortcuts] = useState(false);

    const shortcuts: KeyboardShortcut[] = [
        { key: 'n', ctrl: true, action: onCreateNode || (() => { }), label: 'New Node', icon: FiPlus },
        { key: 'k', ctrl: true, action: onSearch || (() => { }), label: 'Search', icon: FiSearch },
        { key: 's', ctrl: true, shift: true, action: onAISuggest || (() => { }), label: 'AI Suggest', icon: FiZap },
        { key: 'l', ctrl: true, action: onLearningPath || (() => { }), label: 'Learning Path', icon: FiBookOpen },
        { key: 'a', ctrl: true, shift: true, action: onAnalyze || (() => { }), label: 'Analyze', icon: FiBarChart2 }
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Show shortcuts helper
            if (e.key === '?' && e.shiftKey) {
                e.preventDefault();
                setShowShortcuts(true);
                return;
            }

            // Execute shortcuts
            for (const shortcut of shortcuts) {
                const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
                const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
                const altMatch = shortcut.alt ? e.altKey : !e.altKey;

                if (e.key.toLowerCase() === shortcut.key && ctrlMatch && shiftMatch && altMatch) {
                    e.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);

    const getShortcutText = (shortcut: KeyboardShortcut): string => {
        const parts: string[] = [];
        if (shortcut.ctrl) parts.push('⌘');
        if (shortcut.shift) parts.push('⇧');
        if (shortcut.alt) parts.push('⌥');
        parts.push(shortcut.key.toUpperCase());
        return parts.join(' + ');
    };

    return (
        <>
            {/* Quick Actions Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="liquid-glass-heavy rounded-[2rem] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex items-center gap-2"
                >
                    {shortcuts.map((shortcut, index) => {
                        const Icon = shortcut.icon;
                        return (
                            <button
                                key={index}
                                onClick={shortcut.action}
                                className="group relative p-3 rounded-xl hover:bg-white/50 transition-all"
                                title={`${shortcut.label} (${getShortcutText(shortcut)})`}
                            >
                                <Icon size={18} className="text-gray-600 group-hover:text-black transition-colors" />

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="bg-black text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap">
                                        {shortcut.label}
                                        <div className="text-[10px] text-gray-400 mt-0.5">
                                            {getShortcutText(shortcut)}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-200 mx-1" />

                    {/* Shortcuts Helper */}
                    <button
                        onClick={() => setShowShortcuts(true)}
                        className="group relative p-3 rounded-xl hover:bg-white/50 transition-all"
                        title="Keyboard Shortcuts (?)"
                    >
                        <FiCommand size={18} className="text-gray-600 group-hover:text-black transition-colors" />
                    </button>
                </motion.div>
            </div>

            {/* Shortcuts Modal */}
            {showShortcuts && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowShortcuts(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="liquid-glass-heavy rounded-[2rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.15)] max-w-md w-full"
                    >
                        <h2 className="text-lg font-bold mb-6">Keyboard Shortcuts</h2>

                        <div className="space-y-3">
                            {shortcuts.map((shortcut, index) => {
                                const Icon = shortcut.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-white/50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={16} className="text-gray-600" />
                                            <span className="text-sm font-medium">{shortcut.label}</span>
                                        </div>
                                        <kbd className="px-3 py-1 bg-black/10 rounded-lg text-xs font-mono">
                                            {getShortcutText(shortcut)}
                                        </kbd>
                                    </div>
                                );
                            })}

                            <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <FiCommand size={16} className="text-gray-600" />
                                    <span className="text-sm font-medium">Show Shortcuts</span>
                                </div>
                                <kbd className="px-3 py-1 bg-black/10 rounded-lg text-xs font-mono">
                                    ?
                                </kbd>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowShortcuts(false)}
                            className="w-full mt-6 py-3 bg-black text-white rounded-2xl text-sm font-medium hover:bg-gray-800 transition-all"
                        >
                            Got it!
                        </button>
                    </motion.div>
                </div>
            )}
        </>
    );
}
