import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiSearch, FiFile, FiCommand, FiActivity, FiArrowRight, FiKey } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface CommandItem {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
    shortcut?: string;
}

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    // Define commands
    const commands: CommandItem[] = [
        {
            id: 'nav-dashboard',
            title: 'Go to Dashboard',
            description: 'Navigate to the main dashboard',
            icon: <FiActivity />,
            action: () => navigate('/dashboard'),
            shortcut: '⌘D',
        },
        {
            id: 'nav-graph',
            title: 'Explore Graph',
            description: 'View the 3D knowledge lattice',
            icon: <FiActivity />,
            action: () => navigate('/graph'),
            shortcut: '⌘G',
        },
        {
            id: 'nav-docs',
            title: 'My Documents',
            description: 'Manage uploads and files',
            icon: <FiFile />,
            action: () => navigate('/documents'),
        },
        {
            id: 'nav-chat',
            title: 'AI Chat',
            description: 'Ask the oracle',
            icon: <FiCommand />,
            action: () => navigate('/chat'),
        },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.title.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description.toLowerCase().includes(search.toLowerCase())
    );

    useKeyboardShortcuts([
        {
            key: 'k',
            ctrlKey: true,
            action: () => setIsOpen(prev => !prev),
            description: 'Toggle Command Palette'
        },
        {
            key: 'Escape',
            action: () => setIsOpen(false),
            description: 'Close Command Palette'
        }
    ]);

    // Keyboard navigation within the palette
    useEffect(() => {
        if (!isOpen) return;

        const handleNavigation = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    setIsOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleNavigation);
        return () => window.removeEventListener('keydown', handleNavigation);
    }, [isOpen, filteredCommands, selectedIndex]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 p-4"
                    >
                        <div className="bg-[var(--color-white)]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden flex flex-col max-h-[60vh]">

                            {/* Search Bar */}
                            <div className="flex items-center px-4 py-4 border-b border-[var(--color-border)]">
                                <FiSearch className="text-[var(--color-text)] opacity-50 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Type a command or search..."
                                    className="flex-1 bg-transparent border-none outline-none px-4 text-lg text-[var(--color-text)] placeholder-[var(--color-text)]/30"
                                    value={search}
                                    onChange={e => {
                                        setSearch(e.target.value);
                                        setSelectedIndex(0);
                                    }}
                                    autoFocus
                                />
                                <div className="flex items-center gap-1 text-xs font-mono text-[var(--color-text)]/40 bg-[var(--color-text)]/5 px-2 py-1 rounded">
                                    <span className="text-[10px]">ESC</span>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                                {filteredCommands.length > 0 ? (
                                    filteredCommands.map((cmd, index) => (
                                        <button
                                            key={cmd.id}
                                            onClick={() => {
                                                cmd.action();
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${index === selectedIndex
                                                    ? 'bg-[var(--color-text)] text-[var(--color-background)] shadow-lg scale-[1.01]'
                                                    : 'text-[var(--color-text)] hover:bg-[var(--color-text)]/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-[var(--color-background)]/20' : 'bg-[var(--color-text)]/5'
                                                    }`}>
                                                    {cmd.icon}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-semibold text-sm">{cmd.title}</div>
                                                    <div className={`text-xs ${index === selectedIndex ? 'opacity-80' : 'opacity-50'
                                                        }`}>
                                                        {cmd.description}
                                                    </div>
                                                </div>
                                            </div>

                                            {cmd.shortcut && (
                                                <div className={`text-xs font-mono px-2 py-1 rounded ${index === selectedIndex
                                                        ? 'bg-[var(--color-background)]/20'
                                                        : 'bg-[var(--color-text)]/10'
                                                    }`}>
                                                    {cmd.shortcut}
                                                </div>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-[var(--color-text)]/40">
                                        <p>No results found</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="bg-[var(--color-text)]/5 px-4 py-2 flex items-center justify-between text-[10px] text-[var(--color-text)]/50 border-t border-[var(--color-border)]">
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1"><FiArrowRight className="rotate-90 inline" /> Navigate</span>
                                    <span className="flex items-center gap-1"><FiKey className="inline" /> Select</span>
                                </div>
                                <div>
                                    Second Brain OS
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
