import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { MeadowCanvas } from '../components';

export default function LandingPage() {
    const [permutation, setPermutation] = useState(0);

    const variations = [
        ['thoughts', 'systematized', 'flow'],
        ['ideas', 'structured', 'clarity'],
        ['vision', 'organized', 'reality']
    ];

    const currentWords = variations[permutation];

    const handleTaglineClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Don't trigger canvas click/plant
        setPermutation((prev) => (prev + 1) % variations.length);
    };

    const getWordColor = (word: string, index: number) => {
        const colors = ['var(--color-purple)', 'var(--color-green)', 'var(--color-orange)'];
        return colors[index % colors.length];
    };

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>

            {/* The Generative Meadow Background */}
            <MeadowCanvas />

            {/* Top Navigation */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.6, 0.05, 0.01, 0.9] }}
                className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
            >
                <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
                    <Link to="/" className="text-sm uppercase tracking-widest font-bold pointer-events-auto opacity-80 hover:opacity-100 transition-opacity">
                        Second Brain
                    </Link>
                    <div className="flex items-center gap-8 pointer-events-auto">
                        <Link to="/login" className="text-xs uppercase tracking-widest hover:opacity-100 opacity-60 transition-all font-bold">
                            Login
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Main Interactive Content */}
            <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-4 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: [0.6, 0.05, 0.01, 0.9] }}
                    className="pointer-events-auto"
                >
                    <h2
                        onClick={handleTaglineClick}
                        className="text-3xl md:text-5xl lg:text-6xl font-normal leading-tight max-w-4xl mx-auto mb-12 cursor-pointer select-none"
                        style={{ fontVariantCaps: 'all-small-caps' }}
                    >
                        Your <span className="transition-colors duration-500" style={{ color: getWordColor(currentWords[0], 0) }}>{currentWords[0]}</span>, beautifully <span className="transition-colors duration-500" style={{ color: getWordColor(currentWords[1], 1) }}>{currentWords[1]}</span> into <span className="transition-colors duration-500" style={{ color: getWordColor(currentWords[2], 2) }}>{currentWords[2]}</span>
                    </h2>

                    <div className="flex flex-col gap-6 max-w-md mx-auto">
                        <p className="text-xs md:text-sm opacity-60 leading-relaxed font-normal uppercase tracking-widest">
                            An intelligent space to capture, connect, and expand your digital mind.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Contact Tab */}
            <footer className="fixed bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-none z-20">
                <Link
                    to="/about"
                    className="pointer-events-auto text-xs uppercase tracking-[0.3em] font-bold border-b border-transparent hover:border-[var(--color-text)] transition-all pb-1 opacity-60 hover:opacity-100"
                >
                    Get in touch
                </Link>
            </footer>
        </div>
    );
}
