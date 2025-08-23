-- Add element column to micro_memories for elemental classification
ALTER TABLE public.micro_memories
  ADD COLUMN IF NOT EXISTS element text 
  CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether'));

-- Create index for element-based queries
CREATE INDEX IF NOT EXISTS idx_micro_memories_element
  ON public.micro_memories(user_id, element)
  WHERE element IS NOT NULL;