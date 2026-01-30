import { motion } from 'framer-motion';
import { FiEye, FiEdit3, FiZap, FiBookOpen, FiBarChart2 } from 'react-icons/fi';

export type GraphMode = 'VIEW' | 'EDIT' | 'AI_SUGGEST' | 'LEARN' | 'ANALYZE';

interface GraphModeSelectorProps {
    currentMode: GraphMode;
    onModeChange: (mode: GraphMode) => void;
}

export default function GraphModeSelector({ currentMode, onModeChange }: GraphModeSelectorProps) {
    const modes: Array<{ value: GraphMode; label: string; icon: any; color: string }> = [
        { value: 'VIEW', label: 'View', icon: FiEye, color: '#666' },
        { value: 'EDIT', label: 'Edit', icon: FiEdit3, color: '#3469a1' },
        { value: 'AI_SUGGEST', label: 'AI Suggest', icon: FiZap, color: '#ebb137' },
        { value: 'LEARN', label: 'Learn', icon: FiBookOpen, color: '#df6536' },
        { value: 'ANALYZE', label: 'Analyze', icon: FiBarChart2, color: '#b20155' }
    ];

    return (
        <div className="liquid-glass rounded-[2rem] p-2 flex gap-2">
            {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = currentMode === mode.value;

                return (
                    <button
                        key={mode.value}
                        onClick={() => onModeChange(mode.value)}
                        className={`relative px-4 py-2 rounded-xl text-xs font-medium transition-all ${isActive
                                ? 'text-white'
                                : 'text-gray-600 hover:text-black hover:bg-white/50'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeMode"
                                className="absolute inset-0 rounded-xl"
                                style={{ backgroundColor: mode.color }}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <div className="relative flex items-center gap-2">
                            <Icon size={14} />
                            <span>{mode.label}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
