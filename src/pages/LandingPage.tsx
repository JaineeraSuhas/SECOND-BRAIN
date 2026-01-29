import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBrain, FaCube, FaRobot, FaLock, FaChartLine, FaGithub } from 'react-icons/fa';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-accent-blue rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                    <div className="absolute top-40 right-20 w-72 h-72 bg-accent-purple rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-accent-teal rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
                </div>

                {/* Header */}
                <header className="relative z-10 vibrancy border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FaBrain className="text-accent-blue text-3xl" />
                            <span className="text-2xl font-display font-bold text-gradient-blue">
                                Second Brain AI
                            </span>
                        </div>
                        <Link to="/login">
                            <button className="glass-button">Get Started</button>
                        </Link>
                    </div>
                </header>

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-6xl md:text-7xl font-display font-bold mb-6"
                    >
                        Your{' '}
                        <span className="text-gradient-blue">AI-Powered</span>
                        <br />
                        Knowledge Universe
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
                    >
                        Transform your documents into an interactive 3D knowledge graph. Extract insights,
                        discover connections, and chat with your second brain.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex gap-4 justify-center"
                    >
                        <Link to="/login">
                            <button className="glass-button bg-accent-blue/20 hover:bg-accent-blue/30 text-lg px-8 py-4">
                                Start Free
                            </button>
                        </Link>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-button text-lg px-8 py-4 flex items-center gap-2"
                        >
                            <FaGithub /> View on GitHub
                        </a>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-6 text-sm text-gray-400"
                    >
                        100% FREE • No credit card required • Enterprise-grade security
                    </motion.p>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <h2 className="text-4xl font-display font-bold text-center mb-16">
                    Enterprise Features, Zero Cost
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="liquid-glass p-8 rounded-2xl"
                        >
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-display font-semibold mb-3">{feature.title}</h3>
                            <p className="text-gray-300">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="liquid-glass p-12 rounded-3xl text-center">
                    <h2 className="text-4xl font-display font-bold mb-6">
                        Ready to Build Your Second Brain?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join thousands of knowledge workers using AI to organize, connect, and explore their
                        ideas.
                    </p>
                    <Link to="/login">
                        <button className="glass-button bg-accent-blue/20 hover:bg-accent-blue/30 text-lg px-12 py-4">
                            Get Started Free
                        </button>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="vibrancy border-t border-white/10 py-8">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
                    <p>© 2026 Second Brain AI. Built with ❤️ for knowledge management.</p>
                </div>
            </footer>
        </div>
    );
}

const features = [
    {
        icon: <FaBrain />,
        title: 'AI-Powered Extraction',
        description:
            'Automatically extract concepts, entities, and relationships from your documents using Google Gemini.',
    },
    {
        icon: <FaCube />,
        title: '3D Knowledge Graph',
        description:
            'Visualize your knowledge in stunning 3D. Explore connections and discover insights at 60 FPS.',
    },
    {
        icon: <FaRobot />,
        title: 'Intelligent Q&A',
        description:
            'Ask questions and get answers grounded in your personal knowledge base with RAG technology.',
    },
    {
        icon: <FaLock />,
        title: 'Enterprise Security',
        description:
            'Row-level security, encryption at rest and in transit, and complete data isolation.',
    },
    {
        icon: <FaChartLine />,
        title: 'Premium Design',
        description:
            'macOS Liquid Glass UI with Genie effects, Vibrancy, and buttery smooth 60 FPS animations.',
    },
    {
        icon: <FaGithub />,
        title: '100% Open Source',
        description:
            'Fully open source and free forever. Deploy to your own infrastructure or use our free hosting.',
    },
];
