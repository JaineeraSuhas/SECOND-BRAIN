import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSend, FiPlus, FiArrowLeft, FiMoreHorizontal, FiLoader } from 'react-icons/fi';
import { toast } from '../components';
import { supabase } from '../lib/supabase';
import { gemini } from '../lib/gemini';
import { neuralChimes } from '../utils/audio';

export default function ChatPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchChatHistory();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchChatHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data && data.length > 0) {
                setMessages(data);
            } else {
                setMessages([{
                    id: 'welcome',
                    role: 'assistant',
                    content: 'Hello! I am your Second Brain AI. I have full access to your vault and knowledge graph. How can I assist you today?'
                }]);
            }
        } catch (error: any) {
            toast.error(`History load failed: ${error.message}`);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userContent = input;
        setInput('');
        setLoading(true);
        neuralChimes.chimePulse();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: userMsg, error: userError } = await supabase
                .from('chat_messages')
                .insert({
                    user_id: user.id,
                    role: 'user',
                    content: userContent
                })
                .select()
                .single();

            if (userError) throw userError;
            setMessages(prev => [...prev, userMsg]);

            const { data: docs } = await supabase
                .from('documents')
                .select('title, content')
                .eq('status', 'completed');

            const context = docs?.map(d => `Document: ${d.title}\nContent: ${d.content}`).join('\n\n') || 'No documents in vault.';

            const aiContent = await gemini.answerQuestion(userContent, context);

            const { data: aiMsg, error: aiError } = await supabase
                .from('chat_messages')
                .insert({
                    user_id: user.id,
                    role: 'assistant',
                    content: aiContent,
                    sources: docs?.map(d => d.title) || []
                })
                .select()
                .single();

            if (aiError) throw aiError;
            setMessages(prev => [...prev, aiMsg]);
            neuralChimes.chimeConnection();

        } catch (error: any) {
            toast.error(`Protocol Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAttach = () => {
        toast.info("Knowledge Node selector enabled.");
    };

    const handleOptions = () => {
        toast.info("Oracle Configuration Protocol initiated.");
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#FBFBFA] flex flex-col selection:bg-[#F2EDFF]"
        >
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#FBFBFA]/80 backdrop-blur-xl border-b border-[#EBEBEB]">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-black/5 rounded-full transition-all">
                            <FiArrowLeft size={20} />
                        </Link>
                        <h1 className="text-sm font-medium tracking-tight">Oracle</h1>
                    </div>
                    <button
                        onClick={handleOptions}
                        className="p-2 text-gray-400 hover:text-black hover:bg-black/5 rounded-full transition-all"
                    >
                        <FiMoreHorizontal size={20} />
                    </button>
                </div>
            </header>

            <main ref={scrollRef} className="flex-1 overflow-y-auto pt-24 pb-32 px-6 hide-scrollbar">
                <div className="max-w-3xl mx-auto space-y-12">
                    {initialLoading ? (
                        <div className="flex justify-center items-center py-20 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                            Synchronizing Neural Link...
                        </div>
                    ) : messages.map((msg, idx) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className="max-w-[85%] group">
                                <div className={`px-6 py-4 rounded-3xl shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-black text-white text-right font-light'
                                    : 'bg-white border border-[#EBEBEB] text-gray-800'
                                    } shadow-sm`}>
                                    {msg.content}
                                </div>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mt-3 px-2 flex gap-2">
                                        Grounded in: {msg.sources.join(', ')}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-white border border-[#EBEBEB] p-4 rounded-2xl flex items-center gap-2">
                                <FiLoader className="animate-spin text-gray-400" size={14} />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Synthesizing...</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-8 pt-0 pointer-events-none">
                <div className="max-w-4xl mx-auto pointer-events-auto">
                    <form
                        onSubmit={handleSend}
                        className="relative group bg-white border border-[#EBEBEB] rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 focus-within:ring-4 ring-black/5"
                    >
                        <textarea
                            aria-label="Ask Second Brain..."
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Ask Second Brain..."
                            className="w-full py-4 pl-6 pr-16 bg-transparent border-none outline-none text-sm resize-none font-light"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-20"
                            disabled={!input.trim() || loading}
                        >
                            <FiSend size={18} />
                        </button>
                    </form>
                    <div className="mt-4 flex justify-between items-center px-4">
                        <div className="flex gap-4">
                            <button
                                onClick={handleAttach}
                                className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold hover:text-black transition-colors flex items-center gap-2"
                            >
                                <FiPlus size={10} /> Attach Context
                            </button>
                        </div>
                        <p className="text-[9px] text-gray-300 uppercase tracking-widest font-medium">Shift + Enter for new line</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
