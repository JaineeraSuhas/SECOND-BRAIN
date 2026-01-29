import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Types for database tables
export type Profile = {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
};

export type Document = {
    id: string;
    user_id: string;
    title: string;
    content: string | null;
    file_url: string | null;
    file_type: string | null;
    file_size: number | null;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
};

export type Node = {
    id: string;
    user_id: string;
    type: 'document' | 'concept' | 'person' | 'organization' | 'topic' | 'location';
    label: string;
    properties: Record<string, any>;
    created_at: string;
};

export type Edge = {
    id: string;
    user_id: string;
    source_id: string;
    target_id: string;
    type: 'relates_to' | 'builds_on' | 'contradicts' | 'supports' | 'derives_from';
    weight: number;
    created_at: string;
};

export type ChatMessage = {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    sources: any[];
    created_at: string;
};
