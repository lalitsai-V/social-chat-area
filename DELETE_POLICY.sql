-- Add DELETE policy for messages table
-- Run this in Supabase SQL Editor to enable message deletion

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = user_id);
