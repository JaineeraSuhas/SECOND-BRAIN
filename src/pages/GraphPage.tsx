import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiLayers, FiMaximize, FiX, FiTarget, FiLink } from 'react-icons/fi';
import ForceGraph3D from 'react-force-graph-3d';
import { toast, ConnectionSuggestions } from '../components';
import { supabase } from '../lib/supabase';
import { neuralChimes } from '../utils/audio';

export default function GraphPage() {
    const fgRef = useRef<any>();
    const [nodes, setNodes] = useState<any[]>([]);
    const [links, setLinks] = useState<any[]>([]);
    const [_loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<any>(null);

    useEffect(() => {
        fetchGraphData();

        const nodeSub = supabase
            .channel('nodes-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'nodes' }, () => fetchGraphData())
            .subscribe();

        const edgeSub = supabase
            .channel('edges-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'edges' }, () => fetchGraphData())
            .subscribe();

        return () => {
            nodeSub.unsubscribe();
            edgeSub.unsubscribe();
        };
    }, []);

    const fetchGraphData = async () => {
        try {
            const { data: nodesData } = await supabase.from('nodes').select('*');
            const { data: edgesData } = await supabase.from('edges').select('*');

            const colorMap = {
                central: '#3e3832',
                concept: '#ebb137',
                document: '#2c6469',
                person: '#b20155',
                organization: '#3469a1',
                topic: '#df6536',
                location: '#666'
            };

            const processedNodes = (nodesData || []).map(n => ({
                id: n.id,
                name: n.label,
                type: n.type,
                val: n.type === 'document' ? 5 : 2,
                color: (colorMap as any)[n.type] || '#ccc',
                properties: n.properties
            }));

            if (processedNodes.length === 0) {
                processedNodes.push({ id: 'genesis', name: 'Knowledge Root', type: 'central', val: 5, color: '#3e3832', properties: {} });
            }

            const processedLinks = (edgesData || []).map(e => ({
                source: e.source_id,
                target: e.target_id,
                type: e.type
            }));

            setNodes(processedNodes);
            setLinks(processedLinks);
        } catch (error: any) {
            toast.error(`Graph Sync Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const graphData = useMemo(() => ({ nodes, links }), [nodes, links]);

    const handleNodeClick = (node: any) => {
        setSelectedNode(node);
        neuralChimes.chimeConnection();

        // Aim camera at node
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
            node,
            2000
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#FBFBFA] flex flex-col relative overflow-hidden"
        >
            {/* Header Overlay */}
            <header className="absolute top-0 left-0 right-0 z-50 bg-transparent pointer-events-none">
                <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6 pointer-events-auto">
                        <Link to="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-black/5 rounded-full transition-all">
                            <FiArrowLeft size={20} />
                        </Link>
                        <h1 className="text-sm font-medium tracking-tight">Lattice Engine</h1>
                    </div>
                </div>
            </header>

            {/* Float Controls */}
            <div className="absolute top-24 right-8 z-40 flex flex-col gap-4 pointer-events-auto">
                <button className="w-10 h-10 bg-white border border-[#EBEBEB] rounded-xl flex items-center justify-center text-gray-400 hover:text-black transition-all shadow-sm">
                    <FiLayers size={18} />
                </button>
                <button className="w-10 h-10 bg-white border border-[#EBEBEB] rounded-xl flex items-center justify-center text-gray-400 hover:text-black transition-all shadow-sm">
                    <FiMaximize size={18} />
                </button>
            </div>

            {/* Concept Observer Side Panel */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        className="absolute right-8 top-24 bottom-24 w-80 z-50 bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-[0_32px_80px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
                    >
                        <div className="p-8 pb-4 flex justify-between items-start">
                            <div className="w-10 h-10 rounded-xl bg-[#FBFBFA] border border-[#EBEBEB] flex items-center justify-center text-gray-400">
                                <FiTarget size={20} />
                            </div>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="p-2 text-gray-400 hover:text-black hover:bg-black/5 rounded-full transition-all"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="px-8 flex-1 overflow-y-auto hide-scrollbar">
                            <div className="mb-8">
                                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2 block">{selectedNode.type} Node</span>
                                <h2 className="text-xl font-normal leading-tight">{selectedNode.name}</h2>
                            </div>

                            <div className="space-y-8 pb-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100 pb-2">Properties</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-black/5 rounded-xl">
                                            <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1">Density</span>
                                            <span className="text-xs font-bold">{selectedNode.val}x</span>
                                        </div>
                                        <div className="p-3 bg-black/5 rounded-xl">
                                            <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1">Sync</span>
                                            <span className="text-xs font-bold text-green-500">Live</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100 pb-2">Neural Links</p>
                                    <div className="space-y-3">
                                        {links.filter(l => l.source.id === selectedNode.id || l.target.id === selectedNode.id).map((link, i) => (
                                            <div key={i} className="flex items-center gap-3 text-xs text-gray-600">
                                                <FiLink size={12} className="text-gray-300" />
                                                <span>{link.source === selectedNode.id ? link.target.name : link.source.name}</span>
                                            </div>
                                        ))}
                                        {links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length === 0 && (
                                            <p className="text-[10px] italic text-gray-300">Isolated node detected.</p>
                                        )}
                                    </div>
                                </div>

                                {/* AI Connection Suggestions */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <ConnectionSuggestions
                                        nodeId={selectedNode.id}
                                        nodeName={selectedNode.name}
                                        userId={(selectedNode as any).user_id || ''}
                                        onSuggestionApplied={() => fetchGraphData()}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-[#FAFAFA] border-t border-[#EBEBEB]">
                            <button
                                onClick={() => toast.info('Focus protocol initiated.')}
                                className="w-full py-4 bg-black text-white rounded-2xl text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-all shadow-lg"
                            >
                                Isolate Context
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar Stats */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 z-40 hidden md:block">
                <motion.div className="p-8 bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-[0_24px_80px_rgba(0,0,0,0.04)] w-72">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-gray-400 text-center">Network Density</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ebb137]"></div>
                                <span>Concepts</span>
                            </div>
                            <span className="opacity-40">{nodes.filter(n => n.type === 'concept').length}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#2c6469]"></div>
                                <span>Documents</span>
                            </div>
                            <span className="opacity-40">{nodes.filter(n => n.type === 'document').length}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 3D Graph */}
            <div className="flex-1 w-full h-screen bg-[#FBFBFA]">
                <ForceGraph3D
                    ref={fgRef}
                    graphData={graphData}
                    nodeLabel="name"
                    nodeColor={(n: any) => n.color}
                    nodeRelSize={4}
                    linkWidth={0.8}
                    linkColor={() => '#EBEBEB'}
                    backgroundColor="#FBFBFA"
                    showNavInfo={false}
                    controlType="orbit"
                    cooldownTicks={100}
                    onNodeClick={handleNodeClick}
                />
            </div>
        </motion.div>
    );
}
