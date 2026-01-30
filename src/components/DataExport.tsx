import { Download } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from '../components';

export default function DataExport() {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Fetch all user data
            const [docs, nodes, edges, messages] = await Promise.all([
                supabase.from('documents').select('*').eq('user_id', user.id),
                supabase.from('nodes').select('*').eq('user_id', user.id),
                supabase.from('edges').select('*').eq('user_id', user.id),
                supabase.from('chat_messages').select('*').eq('user_id', user.id)
            ]);

            const exportData = {
                version: '1.0',
                exported_at: new Date().toISOString(),
                user_id: user.id,
                documents: docs.data || [],
                nodes: nodes.data || [],
                edges: edges.data || [],
                chat_messages: messages.data || []
            };

            // Create and download JSON file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `second-brain-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Knowledge base exported successfully!');
        } catch (error: any) {
            toast.error(`Export failed: ${error.message}`);
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50 hover-lift"
        >
            <Download size={14} />
            {exporting ? 'Exporting...' : 'Export Knowledge Base'}
        </button>
    );
}
