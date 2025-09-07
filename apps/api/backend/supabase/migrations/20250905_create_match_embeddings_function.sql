-- Create the match_embeddings function for semantic search
create or replace function match_embeddings(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id uuid
)
returns table (
  id uuid,
  content text,
  tags text[],
  element text,
  phase text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    je.id,
    je.text as content,
    je.tags,
    je.element,
    je.phase,
    1 - (je.embeddings <=> query_embedding) as similarity
  from journal_entries je
  where je.user_id = match_embeddings.user_id
    and je.embeddings is not null
    and je.embeddings <=> query_embedding < 1 - match_threshold
  order by je.embeddings <=> query_embedding
  limit match_count;
end;
$$;

-- Grant execute permissions
grant execute on function match_embeddings to authenticated;
grant execute on function match_embeddings to service_role;