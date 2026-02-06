import { motion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export interface NodeTypeConfig {
    type: string;
    label: string;
    color: string;
    visible: boolean;
}

interface GraphLegendProps {
    types: NodeTypeConfig[];
    onToggle: (type: string) => void;
}

export function GraphLegend({ types, onToggle }: GraphLegendProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-8 left-8 z-40"
        >
            <div className="p-4 bg-[var(--color-white)]/80 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-xl">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--color-text)]/50 mb-4 px-2">
                    Data Layers
                </h3>
                <div className="space-y-1">
                    {types.map((type) => (
                        <button
                            key={type.type}
                            onClick={() => onToggle(type.type)}
                            className={`w-full flex items-center justify-between gap-4 px-3 py-2 rounded-lg transition-all text-xs font-medium group ${type.visible
                                    ? 'hover:bg-[var(--color-text)]/5 text-[var(--color-text)]'
                                    : 'opacity-50 hover:opacity-80 text-[var(--color-text)]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full shadow-sm transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: type.visible ? type.color : '#ccc' }}
                                />
                                <span className="uppercase tracking-wide text-[10px] text-left">
                                    {type.label}
                                </span>
                            </div>
                            <div className="text-[var(--color-text)]/40">
                                {type.visible ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
