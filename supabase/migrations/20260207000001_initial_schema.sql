-- Second Brain AI - Initial Database Schema
-- Migration: 20260207000001_initial_schema.sql
-- Description: Creates all core tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
-- Stores uploaded documents and their metadata
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    file_url TEXT,
    file_type TEXT,
    file_size BIGINT,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS documents_status_idx ON public.documents(status);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON public.documents(created_at DESC);

-- ============================================================================
-- NODES TABLE
-- ============================================================================
-- Knowledge graph nodes (concepts, entities, documents)
CREATE TABLE IF NOT EXISTS public.nodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('document', 'concept', 'person', 'organization', 'topic', 'location')) NOT NULL,
    label TEXT NOT NULL,
    properties JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS nodes_user_id_idx ON public.nodes(user_id);
CREATE INDEX IF NOT EXISTS nodes_type_idx ON public.nodes(type);
CREATE INDEX IF NOT EXISTS nodes_label_idx ON public.nodes(label);
CREATE INDEX IF NOT EXISTS nodes_properties_idx ON public.nodes USING GIN(properties);

-- ============================================================================
-- EDGES TABLE
-- ============================================================================
-- Knowledge graph edges (relationships between nodes)
CREATE TABLE IF NOT EXISTS public.edges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    source_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE NOT NULL,
    target_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('relates_to', 'builds_on', 'contradicts', 'supports', 'derives_from')) NOT NULL,
    weight FLOAT DEFAULT 1.0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS edges_user_id_idx ON public.edges(user_id);
CREATE INDEX IF NOT EXISTS edges_source_id_idx ON public.edges(source_id);
CREATE INDEX IF NOT EXISTS edges_target_id_idx ON public.edges(target_id);
CREATE INDEX IF NOT EXISTS edges_type_idx ON public.edges(type);

-- ============================================================================
-- DOCUMENT_CHUNKS TABLE
-- ============================================================================
-- Text chunks with embeddings for RAG (Retrieval-Augmented Generation)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),  -- Gemini embedding dimension
    chunk_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS document_chunks_user_id_idx ON public.document_chunks(user_id);
CREATE INDEX IF NOT EXISTS document_chunks_chunk_index_idx ON public.document_chunks(chunk_index);

-- Enable vector similarity search (if pgvector is enabled)
-- This allows semantic search on embeddings
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- CHAT_MESSAGES TABLE
-- ============================================================================
-- Chat history for AI conversations
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS chat_messages_role_idx ON public.chat_messages(role);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================
-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SEMANTIC SEARCH FUNCTION
-- ============================================================================
-- Function to search document chunks by semantic similarity
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    document_id uuid,
    content text,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.content,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    WHERE 
        (filter_user_id IS NULL OR dc.user_id = filter_user_id)
        AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Initial schema migration completed successfully!';
    RAISE NOTICE 'Tables created: profiles, documents, nodes, edges, document_chunks, chat_messages';
END $$;
