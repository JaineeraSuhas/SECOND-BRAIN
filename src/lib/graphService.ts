import { supabase } from './supabase';
import { gemini } from './gemini';

export interface GraphNode {
    id: string;
    name: string;
    type: 'document' | 'concept' | 'person' | 'organization' | 'topic' | 'location' | 'central';
    val: number;
    color: string;
    properties: Record<string, any>;
    x?: number;
    y?: number;
    z?: number;
    ai_confidence?: number;
}

export interface GraphLink {
    source: string;
    target: string;
    type: string;
    weight?: number;
    ai_suggested?: boolean;
    user_confirmed?: boolean;
    confidence_score?: number;
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

export interface AIConnectionSuggestion {
    sourceId: string;
    targetId: string;
    reason: string;
    confidence: number;
    evidence: string[];
}

/**
 * Graph Service - Manages knowledge graph data and AI-powered features
 */
export class GraphService {
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private cacheTimeout = 5 * 60 * 1000; // 5 minutes

    private colorMap = {
        central: '#3e3832',
        concept: '#ebb137',
        document: '#2c6469',
        person: '#b20155',
        organization: '#3469a1',
        topic: '#df6536',
        location: '#666'
    };

    /**
     * Fetch complete graph data with caching
     */
    async fetchGraphData(userId?: string): Promise<GraphData> {
        const cacheKey = `graph_${userId || 'all'}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const query = supabase.from('nodes').select('*');
            if (userId) query.eq('user_id', userId);

            const { data: nodesData, error: nodesError } = await query;
            if (nodesError) throw nodesError;

            const edgeQuery = supabase.from('edges').select('*');
            if (userId) edgeQuery.eq('user_id', userId);

            const { data: edgesData, error: edgesError } = await edgeQuery;
            if (edgesError) throw edgesError;

            const nodes = this.processNodes(nodesData || []);
            const links = this.processLinks(edgesData || []);

            const graphData = { nodes, links };
            this.setCache(cacheKey, graphData);

            return graphData;
        } catch (error) {
            console.error('Failed to fetch graph data:', error);
            throw error;
        }
    }

    /**
     * Process raw node data into GraphNode format
     */
    private processNodes(rawNodes: any[]): GraphNode[] {
        if (rawNodes.length === 0) {
            return [{
                id: 'genesis',
                name: 'Knowledge Root',
                type: 'central',
                val: 5,
                color: this.colorMap.central,
                properties: {}
            }];
        }

        return rawNodes.map(node => ({
            id: node.id,
            name: node.label,
            type: node.type,
            val: this.getNodeSize(node),
            color: this.colorMap[node.type as keyof typeof this.colorMap] || '#ccc',
            properties: node.properties || {},
            ai_confidence: node.ai_confidence
        }));
    }

    /**
     * Calculate node size based on type and connections
     */
    private getNodeSize(node: any): number {
        const baseSize = {
            central: 8,
            document: 5,
            concept: 3,
            person: 4,
            organization: 4,
            topic: 3,
            location: 3
        };

        return baseSize[node.type as keyof typeof baseSize] || 2;
    }

    /**
     * Process raw edge data into GraphLink format
     */
    private processLinks(rawEdges: any[]): GraphLink[] {
        return rawEdges.map(edge => ({
            source: edge.source_id,
            target: edge.target_id,
            type: edge.type || 'relates_to',
            weight: edge.weight || 1.0,
            ai_suggested: edge.ai_suggested || false,
            user_confirmed: edge.user_confirmed || false,
            confidence_score: edge.confidence_score
        }));
    }

    /**
     * AI-powered connection detection between nodes
     */
    async detectConnections(
        sourceNodeId: string,
        targetNodeIds: string[],
        threshold: number = 0.75
    ): Promise<AIConnectionSuggestion[]> {
        try {
            // Fetch source node
            const { data: sourceNode } = await supabase
                .from('nodes')
                .select('*')
                .eq('id', sourceNodeId)
                .single();

            if (!sourceNode) return [];

            // Fetch target nodes
            const { data: targetNodes } = await supabase
                .from('nodes')
                .select('*')
                .in('id', targetNodeIds);

            if (!targetNodes || targetNodes.length === 0) return [];

            const suggestions: AIConnectionSuggestion[] = [];

            for (const targetNode of targetNodes) {
                const prompt = `Analyze the relationship between these two knowledge nodes:

Source: "${sourceNode.label}" (${sourceNode.type})
Content: ${JSON.stringify(sourceNode.properties).substring(0, 500)}

Target: "${targetNode.label}" (${targetNode.type})
Content: ${JSON.stringify(targetNode.properties).substring(0, 500)}

Determine:
1. Are these concepts related? (yes/no)
2. Confidence score (0.0 to 1.0)
3. Type of relationship (relates_to, depends_on, part_of, similar_to, etc.)
4. Brief explanation (max 50 words)

Respond in JSON format:
{
  "related": boolean,
  "confidence": number,
  "relationship_type": string,
  "explanation": string
}`;

                try {
                    const response = await gemini.generateContent(prompt);
                    const result = JSON.parse(response);

                    if (result.related && result.confidence >= threshold) {
                        suggestions.push({
                            sourceId: sourceNodeId,
                            targetId: targetNode.id,
                            reason: result.explanation,
                            confidence: result.confidence,
                            evidence: [result.relationship_type]
                        });
                    }
                } catch (error) {
                    console.error('Failed to analyze connection:', error);
                }
            }

            return suggestions;
        } catch (error) {
            console.error('Connection detection failed:', error);
            return [];
        }
    }

    /**
     * Create AI-suggested edge
     */
    async createSuggestedEdge(
        userId: string,
        sourceId: string,
        targetId: string,
        confidence: number,
        evidence: string[]
    ): Promise<boolean> {
        try {
            const { error } = await supabase.from('edges').insert({
                user_id: userId,
                source_id: sourceId,
                target_id: targetId,
                type: 'relates_to',
                weight: confidence,
                ai_suggested: true,
                user_confirmed: false,
                confidence_score: confidence,
                evidence: evidence
            });

            if (error) throw error;

            // Invalidate cache
            this.invalidateCache(`graph_${userId}`);

            return true;
        } catch (error) {
            console.error('Failed to create suggested edge:', error);
            return false;
        }
    }

    /**
     * Confirm or reject AI suggestion
     */
    async confirmSuggestion(edgeId: string, confirmed: boolean): Promise<boolean> {
        try {
            if (confirmed) {
                const { error } = await supabase
                    .from('edges')
                    .update({ user_confirmed: true })
                    .eq('id', edgeId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('edges')
                    .delete()
                    .eq('id', edgeId);

                if (error) throw error;
            }

            return true;
        } catch (error) {
            console.error('Failed to confirm suggestion:', error);
            return false;
        }
    }

    /**
     * Get AI suggestions for a specific node
     */
    async getSuggestionsForNode(nodeId: string, limit: number = 5): Promise<AIConnectionSuggestion[]> {
        try {
            // Get all nodes except the source
            const { data: allNodes } = await supabase
                .from('nodes')
                .select('id')
                .neq('id', nodeId)
                .limit(50); // Limit to prevent too many API calls

            if (!allNodes || allNodes.length === 0) return [];

            const targetIds = allNodes.map(n => n.id);
            const suggestions = await this.detectConnections(nodeId, targetIds, 0.5);

            // Sort by confidence and return top N
            return suggestions
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, limit);
        } catch (error) {
            console.error('Failed to get suggestions:', error);
            return [];
        }
    }

    /**
     * Calculate graph statistics
     */
    async getGraphStats(userId?: string): Promise<{
        nodeCount: number;
        edgeCount: number;
        avgConnections: number;
        clusters: number;
        density: number;
    }> {
        const graphData = await this.fetchGraphData(userId);

        const nodeCount = graphData.nodes.length;
        const edgeCount = graphData.links.length;
        const avgConnections = nodeCount > 0 ? edgeCount / nodeCount : 0;

        // Simple density calculation
        const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
        const density = maxEdges > 0 ? edgeCount / maxEdges : 0;

        return {
            nodeCount,
            edgeCount,
            avgConnections: Math.round(avgConnections * 10) / 10,
            clusters: 1, // TODO: Implement cluster detection
            density: Math.round(density * 1000) / 1000
        };
    }

    /**
     * Cache management
     */
    private getFromCache(key: string): any | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    private setCache(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    private invalidateCache(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clearCache(): void {
        this.cache.clear();
    }
}

export const graphService = new GraphService();
