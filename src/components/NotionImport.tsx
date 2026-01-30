import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FileText, Database, Download, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { notion, NotionPage, NotionDatabase } from '../lib/notion';
import { supabase } from '../lib/supabase';
import { toast } from './Toast';

interface NotionImportProps {
    onClose?: () => void;
    onImportComplete?: () => void;
}

export default function NotionImport({ onClose, onImportComplete }: NotionImportProps) {
    const [isConfigured, setIsConfigured] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [searching, setSearching] = useState(false);
    const [importing, setImporting] = useState(false);
    const [pages, setPages] = useState<NotionPage[]>([]);
    const [databases, setDatabases] = useState<NotionDatabase[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        setIsConfigured(notion.isConfigured());
    }, []);

    const handleConnect = async () => {
        if (!apiKey.trim()) {
            toast.error('Please enter your Notion API key');
            return;
        }

        try {
            // Test connection by searching
            const notionClient = new (await import('../lib/notion')).NotionClient(apiKey);
            await notionClient.search();

            // Save API key to environment (in production, save to user settings)
            localStorage.setItem('notion_api_key', apiKey);
            setIsConfigured(true);
            toast.success('Connected to Notion successfully!');
        } catch (error: any) {
            toast.error(`Failed to connect: ${error.message}`);
        }
    };

    const handleSearch = async () => {
        setSearching(true);
        try {
            const { pages: foundPages, databases: foundDatabases } = await notion.search();
            setPages(foundPages);
            setDatabases(foundDatabases);
            toast.success(`Found ${foundPages.length} pages and ${foundDatabases.length} databases`);
        } catch (error: any) {
            toast.error(`Search failed: ${error.message}`);
        } finally {
            setSearching(false);
        }
    };

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedItems);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedItems(newSelection);
    };

    const selectAll = () => {
        const allIds = [...pages.map(p => p.id), ...databases.map(d => d.id)];
        setSelectedItems(new Set(allIds));
    };

    const deselectAll = () => {
        setSelectedItems(new Set());
    };

    const handleImport = async () => {
        if (selectedItems.size === 0) {
            toast.error('Please select at least one item to import');
            return;
        }

        setImporting(true);
        setImportProgress({ current: 0, total: selectedItems.size });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Please log in to import');
                return;
            }

            let imported = 0;

            // Import selected pages
            for (const pageId of selectedItems) {
                const page = pages.find(p => p.id === pageId);
                if (page) {
                    await importPage(page, user.id);
                    imported++;
                    setImportProgress({ current: imported, total: selectedItems.size });
                }

                // Import database pages
                const database = databases.find(d => d.id === pageId);
                if (database) {
                    const dbPages = await notion.getDatabasePages(database.id);
                    for (const dbPage of dbPages) {
                        await importPage(dbPage, user.id);
                        imported++;
                        setImportProgress({ current: imported, total: selectedItems.size + dbPages.length });
                    }
                }
            }

            toast.success(`Successfully imported ${imported} items!`);
            if (onImportComplete) onImportComplete();
        } catch (error: any) {
            toast.error(`Import failed: ${error.message}`);
        } finally {
            setImporting(false);
        }
    };

    const importPage = async (page: NotionPage, userId: string) => {
        try {
            // 1. Create document in database
            const { data: document, error: docError } = await supabase
                .from('documents')
                .insert({
                    user_id: userId,
                    title: page.title,
                    content: page.content,
                    file_url: page.url,
                    file_type: 'notion',
                    status: 'processing'
                })
                .select()
                .single();

            if (docError) throw docError;

            // 2. Extract concepts using AI
            const concepts = await notion.extractConcepts(page);

            // 3. Create nodes for each concept
            const nodeIds: string[] = [];
            for (const concept of concepts) {
                const { data: node, error: nodeError } = await supabase
                    .from('nodes')
                    .insert({
                        user_id: userId,
                        type: 'concept',
                        label: concept,
                        properties: {
                            source: 'notion',
                            notion_page_id: page.id,
                            notion_url: page.url
                        }
                    })
                    .select()
                    .single();

                if (!nodeError && node) {
                    nodeIds.push(node.id);
                }
            }

            // 4. Create document node
            const { data: docNode } = await supabase
                .from('nodes')
                .insert({
                    user_id: userId,
                    type: 'document',
                    label: page.title,
                    properties: {
                        source: 'notion',
                        notion_page_id: page.id,
                        notion_url: page.url,
                        content: page.content.substring(0, 500)
                    }
                })
                .select()
                .single();

            // 5. Create edges from document to concepts
            if (docNode) {
                for (const nodeId of nodeIds) {
                    await supabase.from('edges').insert({
                        user_id: userId,
                        source_id: docNode.id,
                        target_id: nodeId,
                        type: 'relates_to',
                        weight: 0.8
                    });
                }
            }

            // 6. Update document status
            await supabase
                .from('documents')
                .update({ status: 'completed' })
                .eq('id', document.id);

        } catch (error) {
            console.error('Failed to import page:', error);
            throw error;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="liquid-glass-heavy rounded-[2rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.15)] max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-black to-gray-800 flex items-center justify-center text-white">
                        <svg width="20" height="20" viewBox="0 0 100 100" fill="white">
                            <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Import from Notion</h2>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">
                            Sync your Notion workspace
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                        <ExternalLink size={20} />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                {!isConfigured ? (
                    /* API Key Setup */
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                            <h3 className="font-medium mb-2 flex items-center gap-2">
                                <AlertCircle size={18} className="text-blue-600" />
                                Setup Instructions
                            </h3>
                            <ol className="text-sm text-gray-600 space-y-2 ml-6 list-decimal">
                                <li>Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">notion.so/my-integrations</a></li>
                                <li>Click "New integration" and give it a name</li>
                                <li>Copy the "Internal Integration Token"</li>
                                <li>Share your Notion pages with the integration</li>
                                <li>Paste the token below</li>
                            </ol>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium">Notion Integration Token</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="secret_..."
                                className="w-full px-4 py-3 bg-white border border-[#EBEBEB] rounded-2xl outline-none focus:border-black transition-colors"
                            />
                            <button
                                onClick={handleConnect}
                                className="w-full py-3 bg-black text-white rounded-2xl text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-all"
                            >
                                Connect to Notion
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Import Interface */
                    <div className="space-y-6">
                        {/* Search Button */}
                        {pages.length === 0 && databases.length === 0 && (
                            <div className="text-center py-12">
                                <Database size={40} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium mb-2">Ready to Import</h3>
                                <p className="text-sm text-gray-400 mb-6">
                                    Search your Notion workspace for pages and databases
                                </p>
                                <button
                                    onClick={handleSearch}
                                    disabled={searching}
                                    className="px-6 py-3 bg-black text-white rounded-2xl text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                                >
                                    {searching ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={14} />
                                            Search Workspace
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Results */}
                        {(pages.length > 0 || databases.length > 0) && (
                            <>
                                {/* Selection Controls */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        {selectedItems.size} of {pages.length + databases.length} selected
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={selectAll}
                                            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={deselectAll}
                                            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                </div>

                                {/* Pages List */}
                                <div className="space-y-2">
                                    {pages.map((page) => (
                                        <motion.button
                                            key={page.id}
                                            onClick={() => toggleSelection(page.id)}
                                            className={`w-full p-4 rounded-2xl transition-all text-left flex items-start gap-4 ${selectedItems.has(page.id)
                                                ? 'bg-black text-white'
                                                : 'bg-white/50 hover:bg-white'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedItems.has(page.id) ? 'bg-white/20' : 'bg-[#F3F3F2]'
                                                }`}>
                                                {selectedItems.has(page.id) ? (
                                                    <CheckCircle size={18} className="text-white" />
                                                ) : (
                                                    <FileText size={18} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{page.title}</h4>
                                                <p className={`text-xs truncate ${selectedItems.has(page.id) ? 'text-white/60' : 'text-gray-500'
                                                    }`}>
                                                    {page.content.substring(0, 100)}...
                                                </p>
                                            </div>
                                        </motion.button>
                                    ))}

                                    {databases.map((db) => (
                                        <motion.button
                                            key={db.id}
                                            onClick={() => toggleSelection(db.id)}
                                            className={`w-full p-4 rounded-2xl transition-all text-left flex items-start gap-4 ${selectedItems.has(db.id)
                                                ? 'bg-black text-white'
                                                : 'bg-white/50 hover:bg-white'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedItems.has(db.id) ? 'bg-white/20' : 'bg-[#F3F3F2]'
                                                }`}>
                                                {selectedItems.has(db.id) ? (
                                                    <CheckCircle size={18} className="text-white" />
                                                ) : (
                                                    <Database size={18} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{db.title}</h4>
                                                <p className={`text-xs ${selectedItems.has(db.id) ? 'text-white/60' : 'text-gray-500'
                                                    }`}>
                                                    Database
                                                </p>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            {isConfigured && (pages.length > 0 || databases.length > 0) && (
                <div className="mt-6 pt-4 border-t border-[#EBEBEB] flex justify-between items-center">
                    {importing && (
                        <div className="flex items-center gap-3">
                            <Loader2 size={16} className="animate-spin text-gray-400" />
                            <span className="text-sm text-gray-500">
                                Importing {importProgress.current} of {importProgress.total}...
                            </span>
                        </div>
                    )}
                    {!importing && (
                        <button
                            onClick={handleSearch}
                            disabled={searching}
                            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                        >
                            {searching ? 'Searching...' : 'Refresh'}
                        </button>
                    )}
                    <button
                        onClick={handleImport}
                        disabled={importing || selectedItems.size === 0}
                        className="px-6 py-3 bg-black text-white rounded-2xl text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {importing ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <Download size={14} />
                                Import Selected
                            </>
                        )}
                    </button>
                </div>
            )}
        </motion.div>
    );
}
