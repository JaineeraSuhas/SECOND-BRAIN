import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Grid3x3, MessageSquare, LogOut, Plus, TrendingUp, Activity, Zap } from 'lucide-react';
import { toast, AnimatedCounter, ParticleBackground, Logo } from '../components';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: 'Documents', value: 0, pct: 0 },
        { label: 'Concepts', value: 0, pct: 0 },
        { label: 'Connections', value: 0, pct: 0 },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { count: docCount } = await supabase.from('documents').select('*', { count: 'exact', head: true });
            const { count: nodeCount } = await supabase.from('nodes').select('*', { count: 'exact', head: true });
            const { count: edgeCount } = await supabase.from('edges').select('*', { count: 'exact', head: true });

            setStats([
                { label: 'Documents', value: docCount || 0, pct: Math.min(((docCount || 0) / 10) * 100, 100) },
                { label: 'Concepts', value: nodeCount || 0, pct: Math.min(((nodeCount || 0) / 50) * 100, 100) },
                { label: 'Connections', value: edgeCount || 0, pct: Math.min(((edgeCount || 0) / 100) * 100, 100) },
            ]);
        } catch (error) {
            console.error('Stats fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const handleAction = (name: string) => {
        toast.info(`${name} Protocol initiated...`);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#FBFBFA] selection:bg-[#F2EDFF] relative overflow-hidden"
        >
            <ParticleBackground />
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.6, 0.05, 0.01, 0.9] }}
                className="fixed top-0 left-0 right-0 z-50 bg-[#FBFBFA]/70 backdrop-blur-2xl border-b border-[#EBEBEB]"
            >
                <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-sm font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
                            Second Brain
                        </Link>
                        <nav className="hidden md:flex gap-6">
                            {['Documents', 'Graph', 'Chat', 'Analytics'].map((item) => (
                                <Link
                                    key={item}
                                    to={`/${item.toLowerCase()}`}
                                    className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-black transition-colors"
                                >
                                    {item}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleSignOut}
                            className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2"
                        >
                            <LogOut size={14} />
                            Log Out
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#df6536] to-[#ebb137] shadow-sm ring-2 ring-white flex items-center justify-center">
                            <Logo size="sm" />
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-8 pt-32 pb-20">

                {/* Hero / Greeting */}
                <div className="mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-5xl font-normal tracking-tighter mb-4"
                        style={{ fontVariantCaps: 'all-small-caps' }}
                    >
                        Intelligence Hub
                    </motion.h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            <Zap size={10} /> {loading ? 'Syncing...' : 'Neural Sync Active'}
                        </div>
                        <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Node Status: Optimized</p>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-12 gap-8">

                    {/* Main Actions */}
                    <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickActions.map((action, index) => (
                            <motion.div
                                key={action.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                            >
                                <Link to={action.path} className="group block h-full">
                                    <div className="h-full bg-white border border-[#EBEBEB] p-8 rounded-[2rem] hover:shadow-[0_24px_48px_rgba(0,0,0,0.04)] hover:border-black/5 transition-all duration-500 flex flex-col items-start text-left">
                                        <div className="w-12 h-12 rounded-2xl bg-[#FBFBFA] border border-[#EBEBEB] flex items-center justify-center text-gray-400 group-hover:text-black group-hover:bg-white transition-all duration-300 mb-6 group-hover:shadow-sm">
                                            {action.icon}
                                        </div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest mb-2">{action.title}</h3>
                                        <p className="text-[11px] text-gray-400 uppercase tracking-widest leading-relaxed font-medium">{action.description}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Stats Widget */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="col-span-12 lg:col-span-4 bg-white border border-[#EBEBEB] p-10 rounded-[2.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Knowledge Stats</h3>
                            <Activity className="text-gray-300" size={16} />
                        </div>
                        <div className="space-y-10">
                            {stats.map((stat) => (
                                <div key={stat.label} className="group">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-black transition-colors">{stat.label}</span>
                                        <span className="text-2xl font-normal leading-none">
                                            <AnimatedCounter value={stat.value} duration={1.5} />
                                        </span>
                                    </div>
                                    <div className="h-1 bg-[#F3F3F2] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stat.pct}%` }}
                                            transition={{ duration: 1.5, delay: 0.8 }}
                                            className="h-full bg-black rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => handleAction('Knowledge Report Generator')}
                            className="w-full mt-10 py-4 bg-[#FBFBFA] border border-[#EBEBEB] rounded-2xl text-[10px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all duration-300"
                        >
                            Generate Report
                        </button>
                    </motion.div>

                    {/* Recent Activity Mini-List */}
                    <div className="col-span-12 space-y-4">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Live Synthesis Flow</h3>
                            <Link to="/documents" className="text-[10px] uppercase tracking-widest font-bold hover:underline">View all</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                            {['Vector Database', 'Semantic Mesh', 'Neural Cluster', 'Memory Pool'].map((item) => (
                                <div key={item} className="p-4 bg-white/50 border border-[#EBEBEB] rounded-2xl flex items-center justify-between group hover:bg-white transition-all cursor-default shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                                        <span className="text-[11px] uppercase tracking-widest font-bold">{item}</span>
                                    </div>
                                    <TrendingUp className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" size={12} />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={() => handleAction('Universal Node Creation')}
                    className="w-14 h-14 bg-black text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 hover:shadow-black/20 transition-all duration-500 active:scale-90 group"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>
            </div>

        </motion.div>
    );
}

const quickActions = [
    {
        title: 'Vault',
        description: 'Secure knowledge storage',
        icon: <FileText size={24} />,
        path: '/documents',
    },
    {
        title: 'Lattice',
        description: 'Explore neural patterns',
        icon: <Grid3x3 size={24} />,
        path: '/graph',
    },
    {
        title: 'Oracle',
        description: 'Synthesize new insights',
        icon: <MessageSquare size={24} />,
        path: '/chat',
    },
];
