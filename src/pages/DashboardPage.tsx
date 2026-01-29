import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { FaBrain, FaCube, FaComments, FaFile, FaCog, FaSignOutAlt } from 'react-icons/fa';

export default function DashboardPage() {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
            {/* Header */}
            <header className="vibrancy border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FaBrain className="text-accent-blue text-3xl" />
                        <span className="text-2xl font-display font-bold text-gradient-blue">
                            Second Brain AI
                        </span>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="glass-button flex items-center gap-2 hover:bg-red-500/20"
                    >
                        <FaSignOutAlt /> Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-5xl font-display font-bold mb-4">
                        Welcome to Your <span className="text-gradient-blue">Second Brain</span>
                    </h1>
                    <p className="text-xl text-gray-300">
                        Start by uploading documents or exploring your knowledge graph
                    </p>
                </motion.div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickActions.map((action, index) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={action.path}>
                                <div className="liquid-glass p-6 rounded-2xl hover:scale-105 transition-transform cursor-pointer group">
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                                        {action.icon}
                                    </div>
                                    <h3 className="text-xl font-display font-semibold mb-2">{action.title}</h3>
                                    <p className="text-gray-400 text-sm">{action.description}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 grid md:grid-cols-3 gap-6"
                >
                    {stats.map((stat) => (
                        <div key={stat.label} className="glass-card p-6 rounded-xl">
                            <div className="text-3xl font-bold text-accent-blue mb-2">{stat.value}</div>
                            <div className="text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Getting Started */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-12 liquid-glass p-8 rounded-2xl"
                >
                    <h2 className="text-2xl font-display font-bold mb-4">🚀 Getting Started</h2>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-accent-blue flex items-center justify-center text-sm font-bold flex-shrink-0">
                                1
                            </div>
                            <div>
                                <p className="font-medium">Upload your first document</p>
                                <p className="text-sm text-gray-400">
                                    PDFs, Word docs, or paste text directly
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-accent-purple flex items-center justify-center text-sm font-bold flex-shrink-0">
                                2
                            </div>
                            <div>
                                <p className="font-medium">Explore your knowledge graph</p>
                                <p className="text-sm text-gray-400">
                                    See concepts and connections in stunning 3D
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-accent-teal flex items-center justify-center text-sm font-bold flex-shrink-0">
                                3
                            </div>
                            <div>
                                <p className="font-medium">Ask questions</p>
                                <p className="text-sm text-gray-400">
                                    Chat with your AI assistant to discover insights
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

const quickActions = [
    {
        title: 'Documents',
        description: 'Upload and manage your documents',
        icon: <FaFile className="text-accent-blue" />,
        path: '/documents',
    },
    {
        title: 'Knowledge Graph',
        description: 'Explore in 3D visualization',
        icon: <FaCube className="text-accent-purple" />,
        path: '/graph',
    },
    {
        title: 'AI Chat',
        description: 'Ask questions, get insights',
        icon: <FaComments className="text-accent-teal" />,
        path: '/chat',
    },
    {
        title: 'Settings',
        description: 'Manage your preferences',
        icon: <FaCog className="text-accent-orange" />,
        path: '/settings',
    },
];

const stats = [
    { label: 'Documents', value: '0' },
    { label: 'Concepts', value: '0' },
    { label: 'Connections', value: '0' },
];
