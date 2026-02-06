import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiCheck, FiX, FiZap, FiInfo } from 'react-icons/fi';
import { graphService, AIConnectionSuggestion } from '../lib/graphService';
import { toast } from './Toast';

interface ConnectionSuggestionsProps {
    nodeId: string;
    nodeName: string;
    userId: string;
    onSuggestionApplied?: () => void;
}

export default function ConnectionSuggestions({
    nodeId,
    nodeName,
    userId,
    onSuggestionApplied
}: ConnectionSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<AIConnectionSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    const loadSuggestions = async () => {
        setLoading(true);
        setHasLoaded(true);
        try {
            const results = await graphService.getSuggestionsForNode(nodeId, 3); // Reduced from 5 to 3
            setSuggestions(results);

            if (results.length === 0) {
                toast.info('No connection suggestions found');
            } else {
                toast.success(`Found ${results.length} potential connections`);
            }
        } catch (error: any) {
            toast.error(`Failed to load suggestions: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (suggestion: AIConnectionSuggestion) => {
        setProcessingId(suggestion.targetId);
        try {
            const success = await graphService.createSuggestedEdge(
                userId,
                suggestion.sourceId,
                suggestion.targetId,
                suggestion.confidence,
                suggestion.evidence
            );

            if (success) {
                toast.success('Connection created!');
                setSuggestions(prev => prev.filter(s => s.targetId !== suggestion.targetId));
                if (onSuggestionApplied) onSuggestionApplied();
            } else {
                toast.error('Failed to create connection');
            }
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = (suggestion: AIConnectionSuggestion) => {
        setSuggestions(prev => prev.filter(s => s.targetId !== suggestion.targetId));
        toast.info('Suggestion dismissed');
    };

    const getConfidenceColor = (confidence: number): string => {
        if (confidence >= 0.8) return 'text-green-600 bg-green-50';
        if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
        return 'text-orange-600 bg-orange-50';
    };

    const getConfidenceLabel = (confidence: number): string => {
        if (confidence >= 0.8) return 'High';
        if (confidence >= 0.6) return 'Medium';
        return 'Low';
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiZap className="text-yellow-500" size={18} />
                    <h3 className="text-sm font-medium">AI Connection Suggestions</h3>
                </div>
                {!loading && suggestions.length === 0 && (
                    <button
                        onClick={loadSuggestions}
                        className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors"
                    >
                        Find Connections
                    </button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            )}

            {/* Suggestions List */}
            <AnimatePresence mode="popLayout">
                {suggestions.map((suggestion, index) => (
                    <motion.div
                        key={suggestion.targetId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="liquid-glass rounded-2xl p-4 space-y-3"
                    >
                        {/* Confidence Badge */}
                        <div className="flex items-center justify-between">
                            <div className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${getConfidenceColor(suggestion.confidence)}`}>
                                {getConfidenceLabel(suggestion.confidence)} ({Math.round(suggestion.confidence * 100)}%)
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleReject(suggestion)}
                                    disabled={processingId === suggestion.targetId}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                    title="Reject"
                                >
                                    <FiX size={16} />
                                </button>
                                <button
                                    onClick={() => handleAccept(suggestion)}
                                    disabled={processingId === suggestion.targetId}
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all disabled:opacity-50"
                                    title="Accept"
                                >
                                    {processingId === suggestion.targetId ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                    ) : (
                                        <FiCheck size={16} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Connection Info */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-900">{nodeName}</span>
                                <span className="text-gray-400">→</span>
                                <span className="font-medium text-gray-900">Target Node</span>
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed">
                                {suggestion.reason}
                            </p>

                            {suggestion.evidence.length > 0 && (
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                    <FiInfo size={12} />
                                    <span className="uppercase tracking-wider">
                                        {suggestion.evidence.join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Empty State */}
            {!loading && suggestions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    <FiZap size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No suggestions yet</p>
                    <p className="text-xs mt-1">Click "Find Connections" to discover related nodes</p>
                </div>
            )}

            {/* Reload Button */}
            {!loading && suggestions.length > 0 && (
                <button
                    onClick={loadSuggestions}
                    className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors"
                >
                    Refresh Suggestions
                </button>
            )}
        </div>
    );
}
