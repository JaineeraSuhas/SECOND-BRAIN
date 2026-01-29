import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaBrain, FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';

export default function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard`,
                    },
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/dashboard');
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary flex items-center justify-center p-6">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-20 w-96 h-96 bg-accent-blue rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-accent-purple rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-accent-teal rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="liquid-glass p-8 rounded-3xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-3 mb-4">
                            <FaBrain className="text-accent-blue text-4xl" />
                            <span className="text-3xl font-display font-bold text-gradient-blue">
                                Second Brain AI
                            </span>
                        </Link>
                        <h2 className="text-2xl font-display font-semibold mb-2">
                            {isSignUp ? 'Create your account' : 'Welcome back'}
                        </h2>
                        <p className="text-gray-400">
                            {isSignUp
                                ? 'Start building your knowledge universe'
                                : 'Sign in to access your second brain'}
                        </p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card bg-red-500/10 border-red-500/20 p-4 rounded-xl mb-6"
                        >
                            <p className="text-red-400 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card bg-green-500/10 border-green-500/20 p-4 rounded-xl mb-6"
                        >
                            <p className="text-green-400 text-sm">{message}</p>
                        </motion.div>
                    )}

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="w-full glass-button flex items-center justify-center gap-3 mb-6 hover:bg-white/10"
                    >
                        <FaGoogle className="text-xl" />
                        <span>Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-bg-secondary text-gray-400">Or continue with email</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                <FaEnvelope className="inline mr-2" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="glass-input"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                <FaLock className="inline mr-2" />
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="glass-input"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full glass-button bg-accent-blue/20 hover:bg-accent-blue/30 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Loading...</span>
                                </div>
                            ) : isSignUp ? (
                                'Sign Up'
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Toggle Sign Up/Sign In */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setMessage('');
                            }}
                            className="text-accent-blue hover:text-accent-teal transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-6 text-center">
                        <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                            ← Back to home
                        </Link>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    <p>🔒 Enterprise-grade security • 100% FREE forever</p>
                </div>
            </motion.div>
        </div>
    );
}
