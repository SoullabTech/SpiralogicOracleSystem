-- Add last_seen_at column to micro_memories table for tracking viewed whispers
ALTER TABLE public.micro_memories
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Create index for efficient querying of unseen memories
CREATE INDEX IF NOT EXISTS idx_micro_memories_last_seen
  ON public.micro_memories(user_id, last_seen_at)
  WHERE last_seen_at IS NULL;