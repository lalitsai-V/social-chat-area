-- Add reply_to_id column to messages table for message reply support
-- Run this in your Supabase SQL Editor to enable message replies

ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Create an index for faster queries on reply_to_id
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON messages(reply_to_id);

-- Optional: Add a comment to the column for documentation
COMMENT ON COLUMN messages.reply_to_id IS 'ID of the message being replied to (null if not a reply)';
