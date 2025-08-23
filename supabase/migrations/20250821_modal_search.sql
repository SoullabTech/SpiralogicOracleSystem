-- Multi-modal upload search enhancement
-- Adds embeddings and type-specific fields for PDF text, image captions, and OCR

-- Ensure pgvector extension is available
create extension if not exists vector;

-- Add columns for multi-modal content and embeddings
alter table uploads
  add column if not exists text_content text,
  add column if not exists image_caption text,
  add column if not exists ocr_text text,
  add column if not exists embedding vector(1536);  -- matches text-embedding-3-large

-- Create index for vector similarity search
create index if not exists idx_uploads_embedding on uploads 
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100)
  where embedding is not null;

-- Add index for faster user queries
create index if not exists idx_uploads_user_status on uploads(user_id, status)
  where status = 'ready';

-- Helper view for searchable content
create or replace view v_uploads_search as
  select 
    id, 
    user_id, 
    file_name,
    file_type,
    status,
    created_at,
    -- Concatenate all searchable text
    coalesce(text_content, '') || ' ' ||
    coalesce(image_caption, '') || ' ' || 
    coalesce(ocr_text, '') || ' ' ||
    coalesce(summary, '') || ' ' ||
    coalesce(transcript->>'text', '') as searchable_text,
    -- Individual fields for targeted search
    text_content,
    image_caption,
    ocr_text,
    summary,
    transcript,
    embedding
  from uploads
  where status = 'ready';

-- Grant appropriate permissions
grant select on v_uploads_search to authenticated;

-- Function for semantic search with cosine similarity
create or replace function search_uploads_semantic(
  p_user_id uuid,
  p_query_embedding vector(1536),
  p_match_threshold float default 0.7,
  p_limit int default 10
)
returns table (
  id uuid,
  file_name text,
  file_type text,
  similarity float,
  text_snippet text,
  created_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    u.id,
    u.file_name,
    u.file_type,
    1 - (u.embedding <=> p_query_embedding) as similarity,
    left(coalesce(u.text_content, u.image_caption, u.summary, ''), 200) as text_snippet,
    u.created_at
  from uploads u
  where u.user_id = p_user_id
    and u.status = 'ready'
    and u.embedding is not null
    and 1 - (u.embedding <=> p_query_embedding) > p_match_threshold
  order by u.embedding <=> p_query_embedding
  limit p_limit;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function search_uploads_semantic to authenticated;

-- Add comment for documentation
comment on column uploads.text_content is 'Extracted text from PDFs and text files';
comment on column uploads.image_caption is 'AI-generated description of image content';
comment on column uploads.ocr_text is 'Extracted text from images (OCR)';
comment on column uploads.embedding is 'Vector embedding for semantic search';