-- Apply Memory Recall Migration
-- This adds the match_embeddings function for semantic search on journal entries

-- Create the match_embeddings function
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  tags text[],
  element text,
  phase text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    je.id,
    je.text as content,
    je.tags,
    je.element,
    je.phase,
    1 - (je.embeddings <=> query_embedding) as similarity
  FROM journal_entries je
  WHERE je.user_id = match_embeddings.user_id
    AND je.embeddings IS NOT NULL
    AND je.embeddings <=> query_embedding < 1 - match_threshold
  ORDER BY je.embeddings <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION match_embeddings TO authenticated;
GRANT EXECUTE ON FUNCTION match_embeddings TO service_role;

-- Verify the function was created
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name = 'match_embeddings'
  AND routine_schema = 'public';

-- Test the function (will return empty if no embeddings exist yet)
SELECT * FROM match_embeddings(
  ARRAY_FILL(0.1::float, ARRAY[1536])::vector, -- dummy embedding
  0.75,
  5,
  gen_random_uuid()
) LIMIT 1;