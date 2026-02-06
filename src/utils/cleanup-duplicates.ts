// Database Cleanup Utility - Run this once to remove duplicate nodes
// Open browser console on your app and paste this code

import { supabase } from '../lib/supabase';

async function cleanupDuplicateNodes() {
    console.log('🧹 Starting duplicate node cleanup...');

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('❌ Not authenticated');
            return;
        }

        // Get all nodes for this user
        const { data: allNodes } = await supabase
            .from('nodes')
            .select('*')
            .eq('user_id', user.id);

        if (!allNodes) {
            console.log('✅ No nodes found');
            return;
        }

        console.log(`📊 Found ${allNodes.length} total nodes`);

        // Group by type and label to find duplicates
        const nodeMap = new Map();
        const duplicates = [];

        for (const node of allNodes) {
            const key = `${node.type}:${node.label}`;

            if (nodeMap.has(key)) {
                // This is a duplicate - mark for deletion (keep the first one)
                duplicates.push(node.id);
            } else {
                nodeMap.set(key, node);
            }
        }

        console.log(`🔍 Found ${duplicates.length} duplicate nodes`);

        if (duplicates.length === 0) {
            console.log('✅ No duplicates to clean up!');
            return;
        }

        // Delete duplicate nodes
        const { error } = await supabase
            .from('nodes')
            .delete()
            .in('id', duplicates);

        if (error) {
            console.error('❌ Cleanup failed:', error);
        } else {
            console.log(`✅ Successfully removed ${duplicates.length} duplicate nodes!`);
            console.log(`📈 Remaining unique nodes: ${nodeMap.size}`);
        }

        // Also clean up orphaned edges
        const { data: allEdges } = await supabase
            .from('edges')
            .select('*')
            .eq('user_id', user.id);

        const validNodeIds = new Set(Array.from(nodeMap.values()).map((n: any) => n.id));
        const orphanedEdges = allEdges?.filter(
            (edge: any) => !validNodeIds.has(edge.source_id) || !validNodeIds.has(edge.target_id)
        ).map((e: any) => e.id) || [];

        if (orphanedEdges.length > 0) {
            await supabase
                .from('edges')
                .delete()
                .in('id', orphanedEdges);
            console.log(`🧹 Cleaned up ${orphanedEdges.length} orphaned edges`);
        }

        console.log('✨ Cleanup complete! Refresh the graph page to see results.');

    } catch (error) {
        console.error('❌ Cleanup error:', error);
    }
}

// Run the cleanup
cleanupDuplicateNodes();
