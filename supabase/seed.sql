-- Second Brain AI - Seed Data
-- File: supabase/seed.sql
-- Description: Optional seed data for testing and development

-- ============================================================================
-- NOTE: This file is for LOCAL DEVELOPMENT ONLY
-- Do NOT run this in production!
-- ============================================================================

-- Example: Create a test user profile (requires existing auth user)
-- Uncomment and modify if needed:

/*
-- Insert test profile (replace UUID with your test user ID)
INSERT INTO public.profiles (id, email, full_name, avatar_url)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'test@example.com',
    'Test User',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample document
INSERT INTO public.documents (id, user_id, title, content, status)
VALUES (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000001',
    'Getting Started with Second Brain AI',
    'This is a sample document to help you understand how the knowledge graph works. You can upload PDFs, text files, or create notes directly in the app.',
    'completed'
);

-- Insert sample nodes
INSERT INTO public.nodes (user_id, type, label, properties)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'concept', 'Artificial Intelligence', '{"description": "The simulation of human intelligence by machines"}'),
    ('00000000-0000-0000-0000-000000000001', 'concept', 'Machine Learning', '{"description": "A subset of AI focused on learning from data"}'),
    ('00000000-0000-0000-0000-000000000001', 'topic', 'Knowledge Management', '{"description": "Organizing and retrieving information effectively"}');

-- Insert sample edges (relationships)
WITH ai_node AS (SELECT id FROM nodes WHERE label = 'Artificial Intelligence' LIMIT 1),
     ml_node AS (SELECT id FROM nodes WHERE label = 'Machine Learning' LIMIT 1)
INSERT INTO public.edges (user_id, source_id, target_id, type, weight)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM ml_node),
    (SELECT id FROM ai_node),
    'derives_from',
    0.9
);
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify your database setup:

-- Check table counts
DO $$
DECLARE
    profile_count INTEGER;
    document_count INTEGER;
    node_count INTEGER;
    edge_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    SELECT COUNT(*) INTO document_count FROM public.documents;
    SELECT COUNT(*) INTO node_count FROM public.nodes;
    SELECT COUNT(*) INTO edge_count FROM public.edges;
    
    RAISE NOTICE 'Database Statistics:';
    RAISE NOTICE '  Profiles: %', profile_count;
    RAISE NOTICE '  Documents: %', document_count;
    RAISE NOTICE '  Nodes: %', node_count;
    RAISE NOTICE '  Edges: %', edge_count;
END $$;
