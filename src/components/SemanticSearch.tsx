import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Brain, Link2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { gemini } from '../lib/gemini';

interface SearchResult {
    id: string;
    type: 'document' | 'node' | 'edge';
    title: string;
    content: string;
    relevance: number;
    highlights: string[];
}

interface SemanticSearchProps {
    onResultClick?: (result: SearchResult) => void;
    onNodeHighlight?: (nodeId: string) => void;
}

export default function SemanticSearch({ onResultClick, onNodeHighlight }: SemanticSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>('semantic');
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.length < 2) {
            setResults([]);
            return;
        }

        debounceRef.current = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, searchMode]);

    const performSearch = async (searchQuery: string) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Parallel search across documents and nodes
            const [docsResult, nodesResult] = await Promise.all([
                supabase
                    .from('documents')
                    .select('id, title, content')
                    .eq('user_id', user.id)
                    .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
                    .limit(10),
                supabase
                    .from('nodes')
                    .select('id, label, type, properties')
                    .eq('user_id', user.id)
                    .ilike('label', `%${searchQuery}%`)
                    .limit(10)
            ]);

            const searchResults: SearchResult[] = [];

            // Process document results
            (docsResult.data || []).forEach((doc) => {
                const relevance = calculateRelevance(searchQuery, doc.title, doc.content || '');
                searchResults.push({
                    id: doc.id,
                    type: 'document',
                    title: doc.title,
                    content: doc.content || '',
                    relevance,
                    highlights: extractHighlights(searchQuery, doc.content || doc.title)
                });
            });

            // Process node results
            (nodesResult.data || []).forEach((node) => {
                const relevance = calculateRelevance(searchQuery, node.label, '');
                searchResults.push({
                    id: node.id,
                    type: 'node',
                    title: node.label,
                    content: `${node.type} concept`,
                    relevance,
                    highlights: [node.label]
                });
            });

            // Sort by relevance
            searchResults.sort((a, b) => b.relevance - a.relevance);

            // For semantic mode, enhance with AI understanding
            if (searchMode === 'semantic' && searchResults.length > 0) {
                try {
                    const aiEnhanced = await enhanceWithAI(searchQuery, searchResults.slice(0, 5));
                    setResults(aiEnhanced);
                } catch {
                    setResults(searchResults);
                }
            } else {
                setResults(searchResults);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateRelevance = (query: string, title: string, content: string): number => {
        const q = query.toLowerCase();
        const t = title.toLowerCase();
        const c = content.toLowerCase();

        let score = 0;
        if (t.includes(q)) score += 50;
        if (t.startsWith(q)) score += 30;
        if (c.includes(q)) score += 20;

        // Word match bonus
        const words = q.split(' ');
        words.forEach(word => {
            if (t.includes(word)) score += 10;
            if (c.includes(word)) score += 5;
        });

        return Math.min(score, 100);
    };

    const extractHighlights = (query: string, text: string): string[] => {
        const words = query.toLowerCase().split(' ');
        const sentences = text.split(/[.!?]+/);

        return sentences
            .filter(s => words.some(w => s.toLowerCase().includes(w)))
            .slice(0, 2)
            .map(s => s.trim().substring(0, 100) + '...');
    };

    const enhanceWithAI = async (query: string, results: SearchResult[]): Promise<SearchResult[]> => {
        const context = results.map(r => `${r.title}: ${r.content}`).join('\n');
        const prompt = `Given the search query "${query}" and these results:\n${context}\n\nRank them by semantic relevance (1-100) and return just the IDs in order of relevance, comma-separated.`;

        try {
            const response = await gemini.generateContent(prompt);
            const rankedIds = response.split(',').map(s => s.trim());

            return results.sort((a, b) => {
                const aIdx = rankedIds.indexOf(a.id);
                const bIdx = rankedIds.indexOf(b.id);
                return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
            });
        } catch {
            return results;
        }
    };

    const handleResultClick = (result: SearchResult) => {
        if (result.type === 'node' && onNodeHighlight) {
            onNodeHighlight(result.id);
        }
        if (onResultClick) {
            onResultClick(result);
        }
        setIsOpen(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'document': return <FileText size={16} />;
            case 'node': return <Brain size={16} />;
            case 'edge': return <Link2 size={16} />;
            default: return <FileText size={16} />;
        }
    };

    return (
        <>
            {/* Search Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-3 px-4 py-2 bg-white/50 hover:bg-white border border-[#EBEBEB] rounded-2xl text-sm text-gray-400 hover:text-gray-600 transition-all group"
            >
                <Search size={16} />
                <span className="hidden md:inline">Search knowledge...</span>
                <kbd className="hidden md:inline px-2 py-0.5 bg-[#F3F3F2] rounded text-[10px] font-mono">⌘K</kbd>
            </button>

            {/* Search Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        />
                        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="w-full max-w-2xl liquid-glass-heavy rounded-[2rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.2)]"
                            >
                                {/* Search Input */}
                                <div className="relative border-b border-[#EBEBEB]">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search your knowledge universe..."
                                        className="w-full py-5 pl-14 pr-20 bg-transparent border-none outline-none text-lg font-light"
                                        autoFocus
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <button
                                            onClick={() => setSearchMode(searchMode === 'keyword' ? 'semantic' : 'keyword')}
                                            className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold transition-all ${searchMode === 'semantic'
                                                    ? 'bg-purple-100 text-purple-600'
                                                    : 'bg-gray-100 text-gray-500'
                                                }`}
                                        >
                                            <Sparkles size={10} className="inline mr-1" />
                                            {searchMode === 'semantic' ? 'AI' : 'Exact'}
                                        </button>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="p-1 text-gray-400 hover:text-black transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Results */}
                                <div className="max-h-[50vh] overflow-y-auto hide-scrollbar">
                                    {loading ? (
                                        <div className="p-8 text-center">
                                            <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-3" />
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400">
                                                {searchMode === 'semantic' ? 'Understanding meaning...' : 'Searching...'}
                                            </p>
                                        </div>
                                    ) : results.length > 0 ? (
                                        <div className="p-4">
                                            {results.map((result, idx) => (
                                                <motion.button
                                                    key={result.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    onClick={() => handleResultClick(result)}
                                                    className="w-full p-4 rounded-2xl hover:bg-white/50 transition-all text-left group flex items-start gap-4"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-[#F3F3F2] flex items-center justify-center text-gray-400 group-hover:text-black group-hover:bg-white transition-all">
                                                        {getIcon(result.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium text-sm truncate">{result.title}</h4>
                                                            <span className="text-[9px] uppercase tracking-widest text-gray-400 bg-[#F3F3F2] px-2 py-0.5 rounded-full">
                                                                {result.type}
                                                            </span>
                                                        </div>
                                                        {result.highlights.length > 0 && (
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {result.highlights[0]}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-300">
                                                        {result.relevance}%
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    ) : query.length >= 2 ? (
                                        <div className="p-8 text-center">
                                            <p className="text-gray-400 text-sm">No results found</p>
                                            <p className="text-[10px] text-gray-300 mt-1">Try different keywords or switch search mode</p>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400">
                                                Type to search your knowledge universe
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t border-[#EBEBEB] flex justify-between items-center bg-[#FAFAFA]">
                                    <div className="flex gap-4 text-[9px] text-gray-400 uppercase tracking-widest">
                                        <span><kbd className="px-1.5 py-0.5 bg-white rounded border text-[8px]">↑↓</kbd> Navigate</span>
                                        <span><kbd className="px-1.5 py-0.5 bg-white rounded border text-[8px]">↵</kbd> Select</span>
                                        <span><kbd className="px-1.5 py-0.5 bg-white rounded border text-[8px]">esc</kbd> Close</span>
                                    </div>
                                    <span className="text-[9px] text-gray-300 uppercase tracking-widest">
                                        {results.length} results
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
