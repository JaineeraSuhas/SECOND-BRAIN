import { motion } from 'framer-motion';
import { Settings2, Sliders, Eye, Camera } from 'lucide-react';
import { useState } from 'react';

interface GraphControlsProps {
    onPhysicsChange: (strength: 'weak' | 'moderate' | 'strong') => void;
    onNodeLimitChange: (limit: number) => void;
    onAutoLayoutToggle: (enabled: boolean) => void;
    onCameraModeToggle: (autoFollow: boolean) => void;
}

export default function GraphControls({
    onPhysicsChange,
    onNodeLimitChange,
    onAutoLayoutToggle,
    onCameraModeToggle
}: GraphControlsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [physics, setPhysics] = useState<'weak' | 'moderate' | 'strong'>('moderate');
    const [nodeLimit, setNodeLimit] = useState(500);
    const [autoLayout, setAutoLayout] = useState(true);
    const [autoFollow, setAutoFollow] = useState(false);

    const handlePhysicsChange = (value: 'weak' | 'moderate' | 'strong') => {
        setPhysics(value);
        onPhysicsChange(value);
    };

    const handleNodeLimitChange = (value: number) => {
        setNodeLimit(value);
        onNodeLimitChange(value);
    };

    const handleAutoLayoutToggle = () => {
        const newValue = !autoLayout;
        setAutoLayout(newValue);
        onAutoLayoutToggle(newValue);
    };

    const handleCameraModeToggle = () => {
        const newValue = !autoFollow;
        setAutoFollow(newValue);
        onCameraModeToggle(newValue);
    };

    return (
        <div className="absolute top-24 left-8 z-40">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 bg-white border border-[#EBEBEB] rounded-xl flex items-center justify-center text-gray-400 hover:text-black transition-all shadow-sm hover-lift"
            >
                <Settings2 size={18} />
            </button>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="mt-4 w-80 liquid-glass rounded-[2rem] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.1)]"
                >
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6 flex items-center gap-2">
                        <Sliders size={12} />
                        Graph Controls
                    </h3>

                    <div className="space-y-6">
                        {/* Physics Strength */}
                        <div>
                            <label className="block text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-3">
                                Physics Strength
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['weak', 'moderate', 'strong'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => handlePhysicsChange(level)}
                                        className={`py-2 px-3 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${physics === level
                                                ? 'bg-black text-white'
                                                : 'bg-white/50 text-gray-600 hover:bg-white'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Max Visible Nodes */}
                        <div>
                            <label className="block text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-3 flex items-center gap-2">
                                <Eye size={10} />
                                Max Visible Nodes: {nodeLimit === 9999 ? 'Unlimited' : nodeLimit}
                            </label>
                            <input
                                type="range"
                                min="100"
                                max="1000"
                                step="100"
                                value={nodeLimit === 9999 ? 1000 : nodeLimit}
                                onChange={(e) => handleNodeLimitChange(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-[8px] text-gray-400 mt-1">
                                <span>100</span>
                                <span>1000</span>
                            </div>
                        </div>

                        {/* Auto Layout */}
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                                Auto-layout
                            </label>
                            <button
                                onClick={handleAutoLayoutToggle}
                                className={`w-12 h-6 rounded-full transition-all ${autoLayout ? 'bg-black' : 'bg-gray-300'
                                    }`}
                            >
                                <div
                                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${autoLayout ? 'translate-x-6' : 'translate-x-0.5'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Camera Mode */}
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                                <Camera size={10} />
                                Auto-follow
                            </label>
                            <button
                                onClick={handleCameraModeToggle}
                                className={`w-12 h-6 rounded-full transition-all ${autoFollow ? 'bg-black' : 'bg-gray-300'
                                    }`}
                            >
                                <div
                                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${autoFollow ? 'translate-x-6' : 'translate-x-0.5'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
