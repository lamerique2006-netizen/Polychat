-- Add conversation_id to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
