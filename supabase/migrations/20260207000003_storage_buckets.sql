-- Second Brain AI - Storage Buckets
-- Migration: 20260207000003_storage_buckets.sql
-- Description: Creates storage buckets for document uploads

-- ============================================================================
-- CREATE STORAGE BUCKET FOR DOCUMENTS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES FOR DOCUMENTS BUCKET
-- ============================================================================
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documents' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to update their own files
CREATE POLICY "Users can update own documents"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to read their own files
CREATE POLICY "Users can read own documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- CREATE STORAGE BUCKET FOR AVATARS (Optional)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES FOR AVATARS BUCKET
-- ============================================================================
-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Storage buckets created successfully!';
    RAISE NOTICE 'Buckets: documents (private), avatars (public)';
    RAISE NOTICE 'File upload path format: user_id/filename.ext';
END $$;
