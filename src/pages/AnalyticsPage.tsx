import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    BarChart3, Brain, FileText, Link2, TrendingUp, Calendar,
    ArrowLeft, Target
} from 'lucide-react';
import { AnimatedCounter, ParticleBackground, Logo } from '../components';

interface AnalyticsData {
    totalDocuments: number;
    totalNodes: number;
    totalEdges: number;
    documentsThisWeek: number;
    nodesThisWeek: number;
    topConcepts: { label: string; count: number }[];
    activityByDay: { day: string; count: number }[];
    knowledgeGrowth: { date: string; nodes: number }[];
}

export default function AnalyticsPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch counts
            const [docs, nodes, edges] = await Promise.all([
                supabase.from('documents').select('created_at', { count: 'exact' }).eq('user_id', user.id),
                supabase.from('nodes').select('label, created_at', { count: 'exact' }).eq('user_id', user.id),
                supabase.from('edges').select('*', { count: 'exact' }).eq('user_id', user.id)
            ]);

            // Calculate this week's additions
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const docsThisWeek = (docs.data || []).filter(d => new Date(d.created_at) > weekAgo).length;
            const nodesThisWeek = (nodes.data || []).filter(n => new Date(n.created_at) > weekAgo).length;

            // Get top concepts (most connected nodes)
            const { data: edgeData } = await supabase.from('edges').select('source_id, target_id').eq('user_id', user.id);
            const nodeCounts = new Map<string, number>();
            (edgeData || []).forEach(edge => {
                nodeCounts.set(edge.source_id, (nodeCounts.get(edge.source_id) || 0) + 1);
                nodeCounts.set(edge.target_id, (nodeCounts.get(edge.target_id) || 0) + 1);
            });

            const topNodeIds = Array.from(nodeCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([id, count]) => ({ id, count }));

            const topConcepts = await Promise.all(
                topNodeIds.map(async ({ id, count }) => {
                    const { data: node } = await supabase.from('nodes').select('label').eq('id', id).single();
                    return { label: node?.label || 'Unknown', count };
                })
            );

            // Activity by day (last 7 days)
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const activityByDay = days.map((day, idx) => {
                const count = (docs.data || []).filter(d => new Date(d.created_at).getDay() === idx).length +
                    (nodes.data || []).filter(n => new Date(n.created_at).getDay() === idx).length;
                return { day, count };
            });

            // Knowledge growth (last 30 days)
            const knowledgeGrowth: { date: string; nodes: number }[] = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const nodesUpToDate = (nodes.data || []).filter(n =>
                    new Date(n.created_at).toISOString().split('T')[0] <= dateStr
                ).length;
                knowledgeGrowth.push({ date: dateStr, nodes: nodesUpToDate });
            }

            setData({
                totalDocuments: docs.count || 0,
                totalNodes: nodes.count || 0,
                totalEdges: edges.count || 0,
                documentsThisWeek: docsThisWeek,
                nodesThisWeek: nodesThisWeek,
                topConcepts,
                activityByDay,
                knowledgeGrowth
            });
        } catch (error) {
            console.error('Analytics fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const maxGrowth = Math.max(...(data?.knowledgeGrowth.map(g => g.nodes) || [1]));
    const maxActivity = Math.max(...(data?.activityByDay.map(a => a.count) || [1]));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#FBFBFA] relative overflow-hidden"
        >
            <ParticleBackground />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#FBFBFA]/70 backdrop-blur-2xl border-b border-[#EBEBEB]">
                <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-black transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <BarChart3 size={20} />
                            <span className="text-sm font-bold uppercase tracking-widest">Analytics</span>
                        </div>
                    </div>
                    <Logo size="sm" animated />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-8 pt-32 pb-20">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    </div>
                ) : data && (
                    <>
                        {/* Hero Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                            {[
                                { label: 'Documents', value: data.totalDocuments, icon: FileText, color: 'from-blue-400 to-blue-600' },
                                { label: 'Concepts', value: data.totalNodes, icon: Brain, color: 'from-purple-400 to-purple-600' },
                                { label: 'Connections', value: data.totalEdges, icon: Link2, color: 'from-green-400 to-green-600' },
                                { label: 'This Week', value: data.nodesThisWeek, icon: TrendingUp, color: 'from-orange-400 to-orange-600' }
                            ].map((stat, idx) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white border border-[#EBEBEB] rounded-[2rem] p-8 hover-lift"
                                >
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <p className="text-4xl font-light tracking-tight mb-2">
                                        <AnimatedCounter value={stat.value} duration={1.5} />
                                    </p>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            {/* Knowledge Growth */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white border border-[#EBEBEB] rounded-[2rem] p-8"
                            >
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6 flex items-center gap-2">
                                    <TrendingUp size={12} />
                                    Knowledge Growth (30 Days)
                                </h3>
                                <div className="h-48 flex items-end gap-1">
                                    {data.knowledgeGrowth.map((point, idx) => (
                                        <div
                                            key={point.date}
                                            className="flex-1 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-sm transition-all hover:from-purple-600 hover:to-purple-400"
                                            style={{ height: `${(point.nodes / maxGrowth) * 100}%` }}
                                            title={`${point.date}: ${point.nodes} concepts`}
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            {/* Weekly Activity */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white border border-[#EBEBEB] rounded-[2rem] p-8"
                            >
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6 flex items-center gap-2">
                                    <Calendar size={12} />
                                    Activity by Day
                                </h3>
                                <div className="h-48 flex items-end justify-around gap-4">
                                    {data.activityByDay.map((day) => (
                                        <div key={day.day} className="flex flex-col items-center gap-2">
                                            <div
                                                className="w-12 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-400"
                                                style={{ height: `${Math.max((day.count / maxActivity) * 150, 8)}px` }}
                                            />
                                            <span className="text-[10px] font-bold text-gray-400">{day.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Top Concepts */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white border border-[#EBEBEB] rounded-[2rem] p-8"
                        >
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6 flex items-center gap-2">
                                <Target size={12} />
                                Most Connected Concepts
                            </h3>
                            <div className="space-y-4">
                                {data.topConcepts.length > 0 ? data.topConcepts.map((concept, idx) => (
                                    <div key={concept.label} className="flex items-center gap-4">
                                        <span className="text-[10px] font-bold text-gray-300 w-6">{idx + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium">{concept.label}</span>
                                                <span className="text-[10px] text-gray-400">{concept.count} connections</span>
                                            </div>
                                            <div className="h-1.5 bg-[#F3F3F2] rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(concept.count / (data.topConcepts[0]?.count || 1)) * 100}%` }}
                                                    transition={{ duration: 1, delay: 0.7 + idx * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-gray-400 text-sm">Add more content to see top concepts</p>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </main>
        </motion.div>
    );
}
