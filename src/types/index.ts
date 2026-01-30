// Database types
export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Document {
    id: string;
    user_id: string;
    title: string;
    content?: string;
    file_url?: string;
    file_type?: string;
    file_size?: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
}

export interface Node {
    id: string;
    user_id: string;
    type: 'document' | 'concept' | 'person' | 'organization' | 'topic' | 'location';
    label: string;
    properties: Record<string, unknown>;
    created_at: string;
}

export interface Edge {
    id: string;
    user_id: string;
    source_id: string;
    target_id: string;
    type: 'relates_to' | 'builds_on' | 'contradicts' | 'supports' | 'derives_from';
    weight: number;
    created_at: string;
}

export interface DocumentChunk {
    id: string;
    document_id: string;
    user_id: string;
    content: string;
    embedding?: number[];
    chunk_index: number;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: Array<{
        document_id: string;
        chunk_id: string;
        relevance: number;
    }>;
    created_at: string;
}

// Graph visualization types
export interface GraphNode {
    id: string;
    label: string;
    type: string;
    color?: string;
    size?: number;
    x?: number;
    y?: number;
    z?: number;
}

export interface GraphEdge {
    source: string;
    target: string;
    type: string;
    weight?: number;
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphEdge[];
}

// AI types
export interface ConceptExtractionResult {
    concepts: Array<{
        text: string;
        type: string;
        confidence: number;
    }>;
    entities: Array<{
        text: string;
        type: string;
        salience: number;
    }>;
    relationships: Array<{
        source: string;
        target: string;
        type: string;
    }>;
}

export interface ChatResponse {
    answer: string;
    sources: Array<{
        document_id: string;
        chunk_id: string;
        content: string;
        relevance: number;
    }>;
    confidence: number;
}

// UI types
export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
}

export interface UploadProgress {
    file: File;
    progress: number;
    status: 'uploading' | 'processing' | 'completed' | 'error';
    error?: string;
}
