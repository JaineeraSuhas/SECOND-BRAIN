import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FiMail, FiLock, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { MeadowCanvas } from '../components';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/dashboard');
            }
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) setError(error.message);
    };

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-white)' }}>
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 opacity-40 grayscale-[0.5]">
                <MeadowCanvas />
            </div>

            {/* Back Button */}
            <div className="fixed top-8 left-8 z-50">
                <Link to="/" className="p-3 text-gray-400 hover:text-black hover:bg-black/5 rounded-full transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <FiArrowLeft size={18} />
                </Link>
            </div>

            <main className="relative z-10 min-h-screen flex items-center justify-center p-6 bg-transparent">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.6, 0.05, 0.01, 0.9] }}
                    className="w-full max-w-lg"
                >
                    <div className="bg-white/70 backdrop-blur-2xl border border-white/50 p-12 rounded-[2.5rem] shadow-[0_32px_80px_rgba(0,0,0,0.06)]">
                        {/* Header */}
                        <div className="text-center space-y-4 mb-12">
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="text-3xl font-normal tracking-tight uppercase"
                                style={{ fontVariantCaps: 'all-small-caps' }}
                            >
                                {isSignUp ? 'Genesis Protocol' : 'Identity Verification'}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400"
                            >
                                {isSignUp
                                    ? 'Initialize your Second Brain node'
                                    : 'Access your knowledge lattice'}
                            </motion.p>
                        </div>

                        {/* Google Auth */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            whileHover={{ y: -2 }}
                            onClick={handleGoogleAuth}
                            className="w-full p-4 bg-white border border-gray-100 rounded-2xl hover:border-black/10 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 transition-duration-500 group"
                        >
                            <FcGoogle size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-700">Continue with NeuralID (Google)</span>
                        </motion.button>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-bold">
                                <span className="px-4 bg-white/20 backdrop-blur-md rounded-full text-gray-400">Secure Protocol</span>
                            </div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 pl-4">Digital Identity</label>
                                <div className="relative">
                                    <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-[#F8F8F7] border border-transparent rounded-2xl focus:bg-white focus:ring-4 ring-black/5 outline-none transition-all duration-300 text-sm"
                                        placeholder="you@identity.net"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 pl-4">Neural Key</label>
                                <div className="relative">
                                    <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-[#F8F8F7] border border-transparent rounded-2xl focus:bg-white focus:ring-4 ring-black/5 outline-none transition-all duration-300 text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl text-[10px] uppercase tracking-wider font-bold text-red-600 text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full p-5 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group text-xs font-bold uppercase tracking-[0.2em]"
                            >
                                {loading ? 'Processing...' : isSignUp ? 'Begin Initialization' : 'Authorize Access'}
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </form>

                        {/* Toggle */}
                        <div className="mt-12 text-center text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">
                            {isSignUp ? 'Known pattern?' : 'New consciousness?'}{' '}
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-black hover:underline underline-offset-4 decoration-[var(--color-yellow)] ml-2"
                            >
                                {isSignUp ? 'Sync' : 'Initialize'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
