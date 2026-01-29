import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { GraphData, Node, Edge } from '../types';

export function useGraph() {
    const { data: graphData, isLoading } = useQuery({
        queryKey: ['graph'],
        queryFn: async () => {
            // Fetch nodes
            const { data: nodes, error: nodesError } = await supabase
                .from('nodes')
                .select('*')
                .order('created_at', { ascending: false });

            if (nodesError) throw nodesError;

            // Fetch edges
            const { data: edges, error: edgesError } = await supabase
                .from('edges')
                .select('*')
                .order('created_at', { ascending: false });

            if (edgesError) throw edgesError;

            // Transform to graph format
            const graphNodes = (nodes as Node[]).map((node) => ({
                id: node.id,
                label: node.label,
                type: node.type,
                color: getNodeColor(node.type),
                size: 1,
            }));

            const graphLinks = (edges as Edge[]).map((edge) => ({
                source: edge.source_id,
                target: edge.target_id,
                type: edge.type,
                weight: edge.weight,
            }));

            return {
                nodes: graphNodes,
                links: graphLinks,
            } as GraphData;
        },
    });

    return {
        graphData,
        isLoading,
    };
}

function getNodeColor(type: string): string {
    const colors: Record<string, string> = {
        document: '#3B82F6',
        concept: '#8B5CF6',
        person: '#10B981',
        organization: '#F59E0B',
        topic: '#EC4899',
        location: '#06B6D4',
    };
    return colors[type] || '#6B7280';
}
