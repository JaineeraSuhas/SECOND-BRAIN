-- Second Brain AI - Row Level Security Policies
-- Migration: 20260207000002_enable_rls.sql
-- Description: Enables RLS and creates policies for data isolation

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but allow for manual inserts)
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- DOCUMENTS POLICIES
-- ============================================================================
-- Users can view their own documents
CREATE POLICY "Users can view own documents"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
    ON public.documents FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
    ON public.documents FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- NODES POLICIES
-- ============================================================================
-- Users can view their own nodes
CREATE POLICY "Users can view own nodes"
    ON public.nodes FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own nodes
CREATE POLICY "Users can insert own nodes"
    ON public.nodes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own nodes
CREATE POLICY "Users can update own nodes"
    ON public.nodes FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own nodes
CREATE POLICY "Users can delete own nodes"
    ON public.nodes FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- EDGES POLICIES
-- ============================================================================
-- Users can view their own edges
CREATE POLICY "Users can view own edges"
    ON public.edges FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own edges
CREATE POLICY "Users can insert own edges"
    ON public.edges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own edges
CREATE POLICY "Users can update own edges"
    ON public.edges FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own edges
CREATE POLICY "Users can delete own edges"
    ON public.edges FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- DOCUMENT_CHUNKS POLICIES
-- ============================================================================
-- Users can view their own document chunks
CREATE POLICY "Users can view own chunks"
    ON public.document_chunks FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own document chunks
CREATE POLICY "Users can insert own chunks"
    ON public.document_chunks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own document chunks
CREATE POLICY "Users can update own chunks"
    ON public.document_chunks FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own document chunks
CREATE POLICY "Users can delete own chunks"
    ON public.document_chunks FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- CHAT_MESSAGES POLICIES
-- ============================================================================
-- Users can view their own chat messages
CREATE POLICY "Users can view own messages"
    ON public.chat_messages FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own chat messages
CREATE POLICY "Users can insert own messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own chat messages
CREATE POLICY "Users can delete own messages"
    ON public.chat_messages FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on all tables
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.documents TO authenticated;
GRANT ALL ON public.nodes TO authenticated;
GRANT ALL ON public.edges TO authenticated;
GRANT ALL ON public.document_chunks TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;

-- Grant select only to anonymous users (for public pages if needed)
GRANT SELECT ON public.profiles TO anon;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Row Level Security enabled and policies created successfully!';
    RAISE NOTICE 'All users now have isolated data access based on auth.uid()';
END $$;
