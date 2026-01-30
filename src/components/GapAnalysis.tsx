import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Lightbulb, X, Brain, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { gemini } from '../lib/gemini';

interface KnowledgeGap {
    topic: string;
    reason: string;
    suggestedResources: string[];
    priority: 'high' | 'medium' | 'low';
}

interface LearningPath {
    title: string;
    steps: { order: number; topic: string; description: string }[];
}

interface GapAnalysisProps {
    onClose?: () => void;
}

export default function GapAnalysis({ onClose }: GapAnalysisProps) {
    const [analyzing, setAnalyzing] = useState(false);
    const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
    const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
    const [activeTab, setActiveTab] = useState<'gaps' | 'path'>('gaps');

    const analyzeKnowledge = async () => {
        setAnalyzing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch all nodes and edges
            const [nodesResult, edgesResult] = await Promise.all([
                supabase.from('nodes').select('label, type').eq('user_id', user.id),
                supabase.from('edges').select('source_id, target_id, label').eq('user_id', user.id)
            ]);

            const nodes = nodesResult.data || [];
            const edges = edgesResult.data || [];

            // Build knowledge context
            const knowledgeContext = nodes.map(n => `${n.label} (${n.type})`).join(', ');
            const connectionContext = `Total: ${nodes.length} concepts, ${edges.length} connections`;

            // Use AI to identify gaps
            const prompt = `Analyze this knowledge graph and identify 3-5 knowledge gaps:

Knowledge Base: ${knowledgeContext}
${connectionContext}

For each gap, provide:
1. Topic that's missing or underexplored
2. Why it would be valuable to learn
3. 2-3 suggested resources or subtopics
4. Priority (high/medium/low)

Format as JSON array: [{"topic": "", "reason": "", "suggestedResources": [], "priority": ""}]
Return ONLY the JSON array, no other text.`;

            const response = await gemini.generateContent(prompt);

            try {
                const jsonMatch = response.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const parsedGaps = JSON.parse(jsonMatch[0]);
                    setGaps(parsedGaps);
                }
            } catch {
                console.error('Failed to parse gaps');
            }

            // Generate learning path
            const pathPrompt = `Based on these concepts: ${knowledgeContext}

Create a personalized learning path with 5-7 steps to deepen understanding.

Format as JSON: {"title": "", "steps": [{"order": 1, "topic": "", "description": ""}]}
Return ONLY the JSON, no other text.`;

            const pathResponse = await gemini.generateContent(pathPrompt);

            try {
                const jsonMatch = pathResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedPath = JSON.parse(jsonMatch[0]);
                    setLearningPath(parsedPath);
                }
            } catch {
                console.error('Failed to parse learning path');
            }

        } catch (error) {
            console.error('Gap analysis failed:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-600';
            case 'medium': return 'bg-yellow-100 text-yellow-600';
            case 'low': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="liquid-glass-heavy rounded-[2rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.15)] max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white">
                        <Brain size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Knowledge Intelligence</h2>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">Gap Analysis & Learning Paths</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {[
                    { id: 'gaps', label: 'Knowledge Gaps', icon: Lightbulb },
                    { id: 'path', label: 'Learning Path', icon: BookOpen }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'gaps' | 'path')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === tab.id
                                ? 'bg-black text-white'
                                : 'bg-white/50 text-gray-500 hover:bg-white'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                {gaps.length === 0 && !learningPath ? (
                    <div className="text-center py-12">
                        <Sparkles size={40} className="mx-auto text-purple-300 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Analyze Your Knowledge</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            AI will identify gaps in your knowledge graph and suggest a personalized learning path.
                        </p>
                        <button
                            onClick={analyzeKnowledge}
                            disabled={analyzing}
                            className="px-6 py-3 bg-black text-white rounded-2xl text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
                        >
                            {analyzing ? 'Analyzing...' : 'Start Analysis'}
                        </button>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'gaps' ? (
                            <motion.div
                                key="gaps"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                {gaps.map((gap, idx) => (
                                    <motion.div
                                        key={gap.topic}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white/50 rounded-2xl p-5 hover:bg-white transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <h4 className="font-medium">{gap.topic}</h4>
                                            <span className={`px-2 py-1 rounded-full text-[8px] uppercase tracking-widest font-bold ${getPriorityColor(gap.priority)}`}>
                                                {gap.priority}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">{gap.reason}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {gap.suggestedResources.map((resource, i) => (
                                                <span key={i} className="px-3 py-1 bg-[#F3F3F2] rounded-full text-[10px] text-gray-600">
                                                    {resource}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="path"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {learningPath && (
                                    <>
                                        <h3 className="text-lg font-medium mb-6">{learningPath.title}</h3>
                                        <div className="space-y-4">
                                            {learningPath.steps.map((step, idx) => (
                                                <motion.div
                                                    key={step.order}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex gap-4 items-start"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                        {step.order}
                                                    </div>
                                                    <div className="flex-1 bg-white/50 rounded-2xl p-4 hover:bg-white transition-all">
                                                        <h4 className="font-medium text-sm mb-1">{step.topic}</h4>
                                                        <p className="text-xs text-gray-500">{step.description}</p>
                                                    </div>
                                                    {idx < learningPath.steps.length - 1 && (
                                                        <ArrowRight size={16} className="text-gray-300 mt-2" />
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer */}
            {(gaps.length > 0 || learningPath) && (
                <div className="mt-6 pt-4 border-t border-[#EBEBEB] flex justify-between items-center">
                    <button
                        onClick={analyzeKnowledge}
                        disabled={analyzing}
                        className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                        {analyzing ? 'Analyzing...' : 'Re-analyze'}
                    </button>
                    <span className="text-[9px] text-gray-300 uppercase tracking-widest">
                        Powered by AI
                    </span>
                </div>
            )}
        </motion.div>
    );
}
