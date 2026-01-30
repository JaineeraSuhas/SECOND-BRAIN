import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MeadowCanvas } from '../components';

export default function AboutPage() {
    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#FBFBFA', color: '#3e3832' }}>

            {/* Background Animation */}
            <div className="absolute inset-0 z-0 opacity-20 grayscale-[0.2]">
                <MeadowCanvas />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-8 flex justify-between items-center bg-transparent">
                <Link to="/" className="text-sm uppercase tracking-widest font-bold opacity-80 hover:opacity-100 transition-opacity">
                    Second Brain
                </Link>
                <Link to="/" className="text-xs uppercase tracking-widest font-bold opacity-60 hover:opacity-100 transition-opacity underline-offset-8 underline decoration-[#ebb137]">
                    Go Back
                </Link>
            </nav>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-8 text-center pt-32 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.6, 0.05, 0.01, 0.9] }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="mb-20">
                        <h2 className="text-4xl md:text-7xl font-normal mb-8 uppercase tracking-[-0.04em]" style={{ fontVariantCaps: 'all-small-caps' }}>
                            The <span style={{ color: '#b20155' }}>Second</span> <span style={{ color: '#2c6469' }}>Brain</span> Vision
                        </h2>
                        <p className="text-[10px] uppercase tracking-[0.5em] font-bold text-gray-400">
                            Personal Wikipedia + ChatGPT + Mind Mapping + Time Machine
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">

                        <section className="space-y-6 p-10 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 shadow-sm group hover:bg-white transition-all duration-700 text-left">
                            <h3 className="text-black mb-6 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#b20155]"></div>
                                Ingression
                            </h3>
                            <ul className="space-y-5 list-none p-0 opacity-80 leading-loose">
                                <li>• PDFs & Documents</li>
                                <li>• YouTube Context</li>
                                <li>• Web Articles & Links</li>
                                <li>• Voice & Text Notes</li>
                            </ul>
                        </section>

                        <section className="col-span-1 md:col-span-2 space-y-6 p-10 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 shadow-sm group hover:bg-white transition-all duration-700 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-black mb-6 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#2c6469]"></div>
                                        Synthesis
                                    </h3>
                                    <ul className="space-y-5 list-none p-0 opacity-80 leading-loose">
                                        <li>• AI Concept Extraction</li>
                                        <li>• Neural Relationship Mapping</li>
                                        <li>• Hidden Insight Discovery</li>
                                        <li>• 3D Lattice Visualization</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-black mb-6 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#df6536]"></div>
                                        Intuition
                                    </h3>
                                    <ul className="space-y-5 list-none p-0 opacity-80 leading-loose">
                                        <li>• RAG-based Oracle Interaction</li>
                                        <li>• Distant Concept Bridging</li>
                                        <li>• Knowledge Analytics</li>
                                        <li>• Temporal Flow (Time Machine)</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                    </div>

                    <div className="mt-24 max-w-2xl mx-auto">
                        <p className="text-xs md:text-base leading-relaxed opacity-60 uppercase tracking-[0.15em] font-medium text-center">
                            A sophisticated ecosystem where your digital footprint is transformed into a living, breathing knowledge lattice.
                            Auto-discover connections you never knew existed.
                        </p>
                    </div>

                    <div className="mt-20 opacity-30 text-[9px] uppercase tracking-[0.6em] font-bold">
                        Intelligence System • Multi-Neural Logic • 2026
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <footer className="fixed bottom-0 left-0 right-0 p-8 flex justify-center z-20 pointer-events-none">
                <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-[9px] uppercase tracking-[0.4em] opacity-40 font-bold"
                >
                    Designed for Human Cognition
                </motion.div>
            </footer>
        </div>
    );
}
