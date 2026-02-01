-- Add image_url column to messages table for image support
-- Run this in your Supabase SQL Editor to enable image uploads

ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create an index for faster queries on image_url
CREATE INDEX IF NOT EXISTS idx_messages_image_url ON messages(image_url);

-- Optional: Add a comment to the column for documentation
COMMENT ON COLUMN messages.image_url IS 'URL to the uploaded image in Supabase Storage (chat-images bucket)';
