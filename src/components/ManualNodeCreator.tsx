import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiX, FiZap, FiLoader } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import { gemini } from '../lib/gemini';
import { toast } from './Toast';

interface ManualNodeCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onNodeCreated?: () => void;
}

export default function ManualNodeCreator({ isOpen, onClose, onNodeCreated }: ManualNodeCreatorProps) {
    const [label, setLabel] = useState('');
    const [type, setType] = useState<'concept' | 'person' | 'organization' | 'topic' | 'location'>('concept');
    const [description, setDescription] = useState('');
    const [aiEnrichment, setAiEnrichment] = useState(true);
    const [creating, setCreating] = useState(false);

    const nodeTypes = [
        { value: 'concept', label: 'Concept', color: '#ebb137' },
        { value: 'person', label: 'Person', color: '#b20155' },
        { value: 'organization', label: 'Organization', color: '#3469a1' },
        { value: 'topic', label: 'Topic', color: '#df6536' },
        { value: 'location', label: 'Location', color: '#666' }
    ];

    const handleCreate = async () => {
        if (!label.trim()) {
            toast.error('Please enter a node label');
            return;
        }

        setCreating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Please log in to create nodes');
                return;
            }

            let enrichedProperties: any = { description };

            // AI Enrichment
            if (aiEnrichment && description.trim()) {
                try {
                    const enrichmentPrompt = `Analyze this ${type} and provide enrichment data:
Name: ${label}
Description: ${description}

Provide:
1. 3-5 related concepts or keywords
2. A brief summary (max 50 words)
3. Suggested category or domain

Respond in JSON format:
{
  "keywords": ["keyword1", "keyword2", ...],
  "summary": "brief summary",
  "category": "category name"
}`;

                    const aiResponse = await gemini.generateContent(enrichmentPrompt);
                    const enrichment = JSON.parse(aiResponse);

                    enrichedProperties = {
                        ...enrichedProperties,
                        keywords: enrichment.keywords,
                        summary: enrichment.summary,
                        category: enrichment.category,
                        ai_enriched: true
                    };
                } catch (error) {
                    console.error('AI enrichment failed:', error);
                    // Continue without enrichment
                }
            }

            // Create node
            const { data: node, error } = await supabase
                .from('nodes')
                .insert({
                    user_id: user.id,
                    type,
                    label,
                    properties: enrichedProperties
                })
                .select()
                .single();

            if (error) throw error;

            toast.success(`Node "${label}" created successfully!`);

            // Reset form
            setLabel('');
            setDescription('');
            setType('concept');

            if (onNodeCreated) onNodeCreated();
            onClose();
        } catch (error: any) {
            toast.error(`Failed to create node: ${error.message}`);
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="liquid-glass-heavy rounded-[2rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.15)] max-w-2xl w-full"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white">
                                <FiZap size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Create Knowledge Node</h2>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400">
                                    Manual node creation
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-black transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Label */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Node Label *</label>
                            <input
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="e.g., Machine Learning, Albert Einstein, etc."
                                className="w-full px-4 py-3 bg-white border border-[#EBEBEB] rounded-2xl outline-none focus:border-black transition-colors"
                            />
                        </div>

                        {/* Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Node Type</label>
                            <div className="grid grid-cols-5 gap-2">
                                {nodeTypes.map((nodeType) => (
                                    <button
                                        key={nodeType.value}
                                        onClick={() => setType(nodeType.value as any)}
                                        className={`p-3 rounded-xl text-xs font-medium transition-all ${type === nodeType.value
                                                ? 'bg-black text-white'
                                                : 'bg-[#F3F3F2] hover:bg-[#EBEBEB]'
                                            }`}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full mx-auto mb-1"
                                            style={{ backgroundColor: nodeType.color }}
                                        />
                                        {nodeType.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add context, notes, or details about this node..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white border border-[#EBEBEB] rounded-2xl outline-none focus:border-black transition-colors resize-none"
                            />
                        </div>

                        {/* AI Enrichment Toggle */}
                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <FiZap className="text-blue-600" size={18} />
                                <div>
                                    <p className="text-sm font-medium">AI Enrichment</p>
                                    <p className="text-xs text-gray-600">
                                        Automatically add keywords, summary, and category
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAiEnrichment(!aiEnrichment)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${aiEnrichment ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${aiEnrichment ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={creating}
                            className="flex-1 py-3 bg-[#F3F3F2] text-gray-700 rounded-2xl text-sm font-medium hover:bg-[#EBEBEB] transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={creating || !label.trim()}
                            className="flex-1 py-3 bg-black text-white rounded-2xl text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {creating ? (
                                <>
                                    <FiLoader className="animate-spin" size={16} />
                                    Creating...
                                </>
                            ) : (
                                'Create Node'
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
