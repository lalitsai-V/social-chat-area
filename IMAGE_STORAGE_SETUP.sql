-- Add image_url column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create a storage bucket for chat images (run this in Supabase dashboard)
-- Storage > Buckets > Create New Bucket
-- Name: chat-images
-- Public bucket: true

-- Set up RLS policy for chat-images bucket
-- In Storage > Policies, add:
-- Allow public access for SELECT
-- Allow authenticated users to INSERT, UPDATE, DELETE their own files
