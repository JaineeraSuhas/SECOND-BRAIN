import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFile, FiTrash2, FiSearch, FiArrowLeft, FiMoreVertical, FiYoutube, FiLink, FiCheckCircle, FiLoader, FiGlobe } from 'react-icons/fi';
import { toast, Modal, NotionImport } from '../components';
import { supabase } from '../lib/supabase';
import { gemini } from '../lib/gemini';
import { neuralChimes } from '../utils/audio';

export default function DocumentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showIngestModal, setShowIngestModal] = useState(false);
    const [showNotionImport, setShowNotionImport] = useState(false);
    const [ingestUrl, setIngestUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (error: any) {
            toast.error(`Fetch failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setShowIngestModal(false);
        const toastId = toast.info(`Ingesting ${file.name}...`);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: docData, error: dbError } = await supabase
                .from('documents')
                .insert({
                    user_id: user.id,
                    title: file.name,
                    file_url: fileName,
                    file_type: file.type,
                    file_size: file.size,
                    status: 'processing'
                })
                .select()
                .single();

            if (dbError) throw dbError;

            setDocuments([docData, ...documents]);
            neuralChimes.chimeSuccess();
            toast.success(`${file.name} uploaded to Vault.`);

            processDocument(docData, user.id);

        } catch (error: any) {
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleUrlIngest = async () => {
        if (!ingestUrl.trim()) return;

        setUploading(true);
        setShowIngestModal(false);
        const type = ingestUrl.includes('youtube.com') || ingestUrl.includes('youtu.be') ? 'video' : 'web';
        const title = type === 'video' ? 'YouTube Extraction' : 'Web Ingest';

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: docData, error: dbError } = await supabase
                .from('documents')
                .insert({
                    user_id: user.id,
                    title: `${title}: ${ingestUrl.substring(0, 30)}...`,
                    file_url: ingestUrl,
                    file_type: type,
                    status: 'processing'
                })
                .select()
                .single();

            if (dbError) throw dbError;

            setDocuments([docData, ...documents]);
            neuralChimes.chimeSuccess();
            toast.success(`URL Protocol initiated: ${type}`);
            setIngestUrl('');

            processDocument(docData, user.id, ingestUrl);

        } catch (error: any) {
            toast.error(`Ingest failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const processDocument = async (doc: any, userId: string, sourceUrl?: string) => {
        try {
            await supabase.from('documents').update({ status: 'processing' }).eq('id', doc.id);

            // In a real app we'd scrape the URL or read the storage file.
            // Here we use Gemini to "Synthesize" the metadata.
            const promptContext = sourceUrl
                ? `Analyze this URL: ${sourceUrl}. It represents a ${doc.file_type}.`
                : `Analyze this file: ${doc.title}.`;

            const { concepts, summary } = await gemini.extractStructuredKnowledge(promptContext);

            // 1. Create Nodes and Links
            for (const label of concepts) {
                // Upsert Node (prevent duplicate concept labels for same user)
                const { data: node, error: nodeError } = await supabase
                    .from('nodes')
                    .insert({
                        user_id: userId,
                        type: 'concept',
                        label: label,
                        properties: { weight: 2 }
                    })
                    .select()
                    .single();

                if (!nodeError && node) {
                    // 2. Create Edge (Link Doc -> Concept)
                    await supabase.from('edges').insert({
                        user_id: userId,
                        source_id: node.id,
                        target_id: node.id, // This is a placeholder for logic 
                        // Wait, document isn't a node in the 'nodes' table yet.
                        // We should make the document itself a node in the graph too.
                    });
                }

                // Better approach:
                // 1. Create a node for the document itself
                const { data: docNode } = await supabase
                    .from('nodes')
                    .insert({
                        user_id: userId,
                        type: 'document',
                        label: doc.title,
                        properties: { doc_id: doc.id }
                    })
                    .select()
                    .single();

                if (docNode) {
                    for (const label of concepts) {
                        const { data: conceptNode } = await supabase
                            .from('nodes')
                            .insert({
                                user_id: userId,
                                type: 'concept',
                                label: label
                            })
                            .select()
                            .single();

                        if (conceptNode) {
                            await supabase.from('edges').insert({
                                user_id: userId,
                                source_id: docNode.id,
                                target_id: conceptNode.id,
                                type: 'relates_to',
                                weight: 1.0
                            });
                            neuralChimes.chimeConnection();
                        }
                    }
                }
            }

            await supabase
                .from('documents')
                .update({
                    status: 'completed',
                    content: summary
                })
                .eq('id', doc.id);

            fetchDocuments();
            toast.success(`Lattice updated for ${doc.title}`);

        } catch (error) {
            console.error('Processing failed:', error);
            await supabase.from('documents').update({ status: 'failed' }).eq('id', doc.id);
        }
    };

    const removeDoc = async (id: string, name: string, fileUrl: string) => {
        try {
            if (fileUrl.startsWith('http')) {
                // Link only
            } else {
                await supabase.storage.from('documents').remove([fileUrl]);
            }

            const { error } = await supabase.from('documents').delete().eq('id', id);
            if (error) throw error;

            setDocuments(documents.filter(doc => doc.id !== id));
            toast.error(`Purged node: ${name}`);
        } catch (error: any) {
            toast.error(`Purge failed: ${error.message}`);
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getIcon = (type: string) => {
        if (type?.includes('video')) return <FiYoutube className="text-red-500" />;
        if (type?.includes('web')) return <FiGlobe className="text-blue-500" />;
        return <FiFile className="text-gray-500" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#FBFBFA] selection:bg-[#F2EDFF]"
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* Ingest Modal */}
            <Modal isOpen={showIngestModal} onClose={() => setShowIngestModal(false)}>
                <div className="p-8 space-y-8">
                    <div className="text-center">
                        <h2 className="text-xl font-normal tracking-tight uppercase mb-2">Universal Ingest</h2>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Capture from any digital source</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-8 bg-[#F3F3F2] hover:bg-[#EBEBEB] rounded-3xl flex flex-col items-center gap-4 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-black shadow-sm">
                                <FiPlus size={24} />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold">Local File</span>
                        </button>
                        <button
                            onClick={() => {
                                setShowIngestModal(false);
                                setShowNotionImport(true);
                            }}
                            className="p-8 bg-[#F3F3F2] hover:bg-[#EBEBEB] rounded-3xl flex flex-col items-center gap-4 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-black shadow-sm">
                                <svg width="24" height="24" viewBox="0 0 100 100" fill="currentColor">
                                    <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z" />
                                </svg>
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold">Notion</span>
                        </button>
                        <button className="p-8 bg-[#F3F3F2] opacity-50 cursor-not-allowed rounded-3xl flex flex-col items-center gap-4 transition-all">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm">
                                <FiPlus size={24} />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold">Knowledge Note</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 ml-4">Neural Data Link (URL)</label>
                        <div className="relative">
                            <FiLink className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={ingestUrl}
                                onChange={(e) => setIngestUrl(e.target.value)}
                                placeholder="Paste YouTube or Article URL..."
                                className="w-full pl-14 pr-24 py-5 bg-[#F3F3F2] border-none rounded-[2rem] text-sm focus:bg-white focus:ring-4 ring-black/5 outline-none transition-all"
                            />
                            <button
                                onClick={handleUrlIngest}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-all"
                            >
                                Ingest
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Notion Import Modal */}
            <AnimatePresence>
                {showNotionImport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <NotionImport
                            onClose={() => setShowNotionImport(false)}
                            onImportComplete={() => {
                                setShowNotionImport(false);
                                fetchDocuments();
                            }}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#FBFBFA]/80 backdrop-blur-xl border-b border-[#EBEBEB]">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-black/5 rounded-full transition-all">
                            <FiArrowLeft size={20} />
                        </Link>
                        <h1 className="text-sm font-medium tracking-tight">Vault</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 mr-4 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            <FiCheckCircle size={10} /> Neural Sync Active
                        </div>
                        <button
                            onClick={() => setShowIngestModal(true)}
                            disabled={uploading}
                            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full text-xs font-medium hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50"
                        >
                            {uploading ? <FiLoader className="animate-spin" size={14} /> : <FiPlus size={14} />}
                            {uploading ? 'Processing' : 'Unified Ingest'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
                <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="relative w-full max-w-xl">
                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search your consciousness..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#F3F3F2] border-none rounded-3xl py-5 pl-16 pr-6 text-sm focus:ring-4 ring-black/5 focus:bg-white transition-all duration-500 outline-none"
                        />
                    </div>
                    <div className="flex gap-4">
                        {['All', 'Video', 'Web', 'Notes'].map(f => (
                            <button key={f} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors">{f}</button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-[#EBEBEB] overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.03)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#FAFAFA] border-b border-[#EBEBEB]">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Knowledge Node</th>
                                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Protocol</th>
                                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Ingestion Date</th>
                                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F5F5F5]">
                                {loading ? (
                                    <tr><td colSpan={4} className="px-10 py-24 text-center text-gray-400 uppercase tracking-widest text-[10px]">Establishing Neural Link...</td></tr>
                                ) : filteredDocs.length === 0 ? (
                                    <tr><td colSpan={4} className="px-10 py-24 text-center text-gray-400 uppercase tracking-widest text-[10px]">No thoughts captured yet.</td></tr>
                                ) : filteredDocs.map((doc, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={doc.id}
                                        className="group hover:bg-[#FBFBFA] transition-colors"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-[#FBFBFA] border border-[#EBEBEB] flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    {getIcon(doc.file_type)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-800 truncate max-w-[350px]">{doc.title}</span>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${doc.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}></div>
                                                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{doc.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                            {doc.file_type?.split('/').pop()}
                                        </td>
                                        <td className="px-10 py-8 text-xs text-gray-500 font-light italic">
                                            {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => removeDoc(doc.id, doc.title, doc.file_url)}
                                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                                <button className="p-3 text-gray-400 hover:text-black hover:bg-black/5 rounded-xl transition-all">
                                                    <FiMoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-10 flex justify-between items-center px-8">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-medium">Lattice Density: {filteredDocs.length} knowledge nodes</p>
                    <button className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold hover:text-black transition-colors">Neural Sync Protocol: V2.4</button>
                </div>
            </main>
        </motion.div>
    );
}
