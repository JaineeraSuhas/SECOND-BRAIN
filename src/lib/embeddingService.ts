// Embedding service for semantic search and similarity

/**
 * Embedding service for generating vector embeddings
 * Note: Gemini API doesn't directly support embeddings yet,
 * so we'll use a simple text-based similarity approach for now
 */

export interface Embedding {
    vector: number[];
    text: string;
    model: string;
}

export class EmbeddingService {
    private cache: Map<string, Embedding> = new Map();
    private dimension: number = 768; // Standard embedding dimension

    /**
     * Generate embedding for text
     * For now, we'll create a simple hash-based embedding
     * TODO: Replace with actual embedding API when available
     */
    async generateEmbedding(text: string): Promise<Embedding> {
        // Check cache
        const cached = this.cache.get(text);
        if (cached) return cached;

        // Generate simple embedding based on text characteristics
        const vector = this.textToVector(text);

        const embedding: Embedding = {
            vector,
            text,
            model: 'simple-hash-v1'
        };

        this.cache.set(text, embedding);
        return embedding;
    }

    /**
     * Calculate cosine similarity between two embeddings
     */
    cosineSimilarity(embedding1: Embedding, embedding2: Embedding): number {
        const v1 = embedding1.vector;
        const v2 = embedding2.vector;

        if (v1.length !== v2.length) {
            throw new Error('Embedding dimensions must match');
        }

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            norm1 += v1[i] * v1[i];
            norm2 += v2[i] * v2[i];
        }

        const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
        if (denominator === 0) return 0;

        return dotProduct / denominator;
    }

    /**
     * Find similar texts using embeddings
     */
    async findSimilar(
        queryText: string,
        candidates: string[],
        topK: number = 5,
        threshold: number = 0.5
    ): Promise<Array<{ text: string; similarity: number }>> {
        const queryEmbedding = await this.generateEmbedding(queryText);
        const results: Array<{ text: string; similarity: number }> = [];

        for (const candidate of candidates) {
            const candidateEmbedding = await this.generateEmbedding(candidate);
            const similarity = this.cosineSimilarity(queryEmbedding, candidateEmbedding);

            if (similarity >= threshold) {
                results.push({ text: candidate, similarity });
            }
        }

        // Sort by similarity and return top K
        return results
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
    }

    /**
     * Simple text to vector conversion
     * This is a placeholder - replace with actual embedding API
     */
    private textToVector(text: string): number[] {
        const normalized = text.toLowerCase().trim();
        const vector: number[] = new Array(this.dimension).fill(0);

        // Character frequency features
        for (let i = 0; i < normalized.length; i++) {
            const charCode = normalized.charCodeAt(i);
            const index = charCode % this.dimension;
            vector[index] += 1;
        }

        // Word count features
        const words = normalized.split(/\s+/);
        vector[0] = words.length;

        // Average word length
        const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
        vector[1] = avgWordLength;

        // Normalize vector
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        if (magnitude > 0) {
            for (let i = 0; i < vector.length; i++) {
                vector[i] /= magnitude;
            }
        }

        return vector;
    }

    /**
     * Batch generate embeddings
     */
    async generateBatch(texts: string[]): Promise<Embedding[]> {
        const embeddings: Embedding[] = [];

        for (const text of texts) {
            const embedding = await this.generateEmbedding(text);
            embeddings.push(embedding);
        }

        return embeddings;
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    getCacheSize(): number {
        return this.cache.size;
    }
}

/**
 * Semantic search using embeddings
 */
export class SemanticSearchService {
    private embeddingService: EmbeddingService;

    constructor() {
        this.embeddingService = new EmbeddingService();
    }

    /**
     * Search nodes semantically
     */
    async searchNodes(
        query: string,
        nodes: Array<{ id: string; label: string; properties: any }>,
        topK: number = 10
    ): Promise<Array<{ nodeId: string; label: string; similarity: number }>> {
        // Combine label and properties for better matching
        const nodeTexts = nodes.map(node => {
            const propsText = JSON.stringify(node.properties);
            return `${node.label} ${propsText}`;
        });

        const similar = await this.embeddingService.findSimilar(query, nodeTexts, topK, 0.3);

        return similar.map((result, index) => ({
            nodeId: nodes[index].id,
            label: nodes[index].label,
            similarity: result.similarity
        }));
    }

    /**
     * Find related nodes based on content similarity
     */
    async findRelatedNodes(
        sourceNode: { id: string; label: string; properties: any },
        candidateNodes: Array<{ id: string; label: string; properties: any }>,
        topK: number = 5
    ): Promise<Array<{ nodeId: string; label: string; similarity: number }>> {
        const sourceText = `${sourceNode.label} ${JSON.stringify(sourceNode.properties)}`;

        const candidateTexts = candidateNodes.map(node =>
            `${node.label} ${JSON.stringify(node.properties)}`
        );

        const similar = await this.embeddingService.findSimilar(sourceText, candidateTexts, topK, 0.5);

        return similar.map((result, index) => ({
            nodeId: candidateNodes[index].id,
            label: candidateNodes[index].label,
            similarity: result.similarity
        }));
    }
}

export const embeddingService = new EmbeddingService();
export const semanticSearch = new SemanticSearchService();
