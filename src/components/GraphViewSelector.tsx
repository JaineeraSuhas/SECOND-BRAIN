import { motion } from 'framer-motion';
import { Layers, Clock, Network, Focus, Sparkles } from 'lucide-react';

export type GraphViewMode = 'default' | 'cluster' | 'timeline' | 'hierarchy' | 'focus';

interface GraphViewSelectorProps {
    currentView: GraphViewMode;
    onViewChange: (view: GraphViewMode) => void;
    selectedNodeId?: string | null;
}

const views = [
    { id: 'default' as const, label: 'Neural', icon: Network, description: 'Natural force-directed layout' },
    { id: 'cluster' as const, label: 'Cluster', icon: Layers, description: 'Group by topic' },
    { id: 'timeline' as const, label: 'Timeline', icon: Clock, description: 'Chronological order' },
    { id: 'focus' as const, label: 'Focus', icon: Focus, description: 'Center on selection' },
];

export default function GraphViewSelector({ currentView, onViewChange, selectedNodeId }: GraphViewSelectorProps) {
    return (
        <div className="absolute top-24 right-8 z-40">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="liquid-glass rounded-[2rem] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.1)]"
            >
                <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-4 flex items-center gap-2 px-2">
                    <Sparkles size={10} />
                    View Mode
                </h3>
                <div className="space-y-1">
                    {views.map((view) => {
                        const Icon = view.icon;
                        const isDisabled = view.id === 'focus' && !selectedNodeId;

                        return (
                            <button
                                key={view.id}
                                onClick={() => !isDisabled && onViewChange(view.id)}
                                disabled={isDisabled}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${currentView === view.id
                                    ? 'bg-black text-white'
                                    : isDisabled
                                        ? 'opacity-30 cursor-not-allowed'
                                        : 'hover:bg-white/50 text-gray-600'
                                    }`}
                            >
                                <Icon size={16} />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-bold">{view.label}</p>
                                    <p className="text-[8px] opacity-60">{view.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
