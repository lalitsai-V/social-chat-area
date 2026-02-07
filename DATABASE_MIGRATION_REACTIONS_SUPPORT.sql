-- Create reactions table to store per-user reactions to messages
-- Run this in your Supabase SQL Editor to enable reactions support

CREATE TABLE IF NOT EXISTS reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Ensure a user can have at most one reaction per message
CREATE UNIQUE INDEX IF NOT EXISTS ux_reactions_message_user ON reactions(message_id, user_id);

-- Index for fast lookups by message_id
CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON reactions(message_id);
