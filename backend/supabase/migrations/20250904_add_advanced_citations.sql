-- Advanced Citations Phase 1: Add page numbers and section metadata
-- Run after the main file ingestion tables migration

-- Extend file_citations table with detailed metadata
alter table file_citations 
add column if not exists page_number int,
add column if not exists section_title text,
add column if not exists section_level int, -- 1 = main header, 2 = subheader, etc.
add column if not exists start_char int,
add column if not exists end_char int,
add column if not exists chunk_preview text; -- First 200 chars of the chunk

-- Extend file_embeddings table to store page/section info per chunk
alter table file_embeddings
add column if not exists page_number int,
add column if not exists section_title text,
add column if not exists section_level int,
add column if not exists start_char int,
add column if not exists end_char int;

-- Create index on page numbers for fast filtering
create index if not exists file_embeddings_page_number_idx on file_embeddings(page_number);
create index if not exists file_citations_page_number_idx on file_citations(page_number);

-- Update the vector similarity search function to include citation metadata
create or replace function match_file_embeddings(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5,
  filter_user_id uuid default null
)
returns table (
  id uuid,
  file_id uuid,
  file_name text,
  content text,
  summary text,
  key_topics text[],
  emotional_tone text,
  elemental_resonance text,
  page_number int,
  section_title text,
  section_level int,
  chunk_preview text,
  similarity float
)
language sql stable as $$
  select
    fe.id,
    fe.file_id,
    uf.file_name,
    fe.content,
    uf.summary,
    uf.key_topics,
    uf.emotional_tone,
    uf.elemental_resonance,
    fe.page_number,
    fe.section_title,
    fe.section_level,
    left(fe.content, 200) as chunk_preview,
    1 - (fe.embedding <=> query_embedding) as similarity
  from file_embeddings fe
  join user_files uf on fe.file_id = uf.id
  where 
    1 - (fe.embedding <=> query_embedding) > match_threshold
    and (filter_user_id is null or uf.user_id = filter_user_id)
  order by fe.embedding <=> query_embedding
  limit match_count;
$$;

-- Create a function to get file citations with metadata
create or replace function get_file_citations_with_metadata(
  target_user_id uuid,
  target_file_id uuid default null,
  limit_count int default 10
)
returns table (
  id uuid,
  file_name text,
  page_number int,
  section_title text,
  section_level int,
  chunk_preview text,
  relevance_score float,
  context text,
  created_at timestamptz
)
language sql stable as $$
  select
    fc.id,
    uf.file_name,
    fc.page_number,
    fc.section_title,
    fc.section_level,
    fc.chunk_preview,
    fc.relevance_score,
    fc.context,
    fc.created_at
  from file_citations fc
  join user_files uf on fc.file_id = uf.id
  where 
    fc.user_id = target_user_id
    and (target_file_id is null or fc.file_id = target_file_id)
  order by fc.created_at desc
  limit limit_count;
$$;

-- Create a function to get file stats including page counts
create or replace function get_file_stats_detailed(
  target_user_id uuid
)
returns table (
  total_files int,
  ready_files int,
  processing_files int,
  total_chunks int,
  total_pages int,
  total_citations int,
  avg_pages_per_file float,
  categories jsonb
)
language sql stable as $$
  select
    count(*)::int as total_files,
    count(case when uf.status = 'ready' then 1 end)::int as ready_files,
    count(case when uf.status != 'ready' then 1 end)::int as processing_files,
    coalesce(sum(chunk_counts.chunk_count), 0)::int as total_chunks,
    coalesce(sum(uf.metadata->>'totalPages')::int, 0)::int as total_pages,
    coalesce(citation_counts.total_citations, 0)::int as total_citations,
    case 
      when count(case when uf.status = 'ready' then 1 end) > 0 
      then coalesce(sum(uf.metadata->>'totalPages')::int, 0)::float / count(case when uf.status = 'ready' then 1 end)
      else 0 
    end as avg_pages_per_file,
    coalesce(
      jsonb_object_agg(
        coalesce(uf.category, 'uncategorized'), 
        category_counts.file_count
      ) filter (where category_counts.file_count is not null),
      '{}'::jsonb
    ) as categories
  from user_files uf
  left join (
    select file_id, count(*) as chunk_count
    from file_embeddings 
    group by file_id
  ) chunk_counts on uf.id = chunk_counts.file_id
  left join (
    select 
      coalesce(uf2.category, 'uncategorized') as category,
      count(*) as file_count
    from user_files uf2 
    where uf2.user_id = target_user_id
    group by coalesce(uf2.category, 'uncategorized')
  ) category_counts on coalesce(uf.category, 'uncategorized') = category_counts.category
  cross join (
    select count(*) as total_citations
    from file_citations fc2
    where fc2.user_id = target_user_id
  ) citation_counts
  where uf.user_id = target_user_id;
$$;

-- Add some sample data structure comments for developers
comment on column file_embeddings.page_number is 'Page number where this chunk appears (1-indexed)';
comment on column file_embeddings.section_title is 'Title of the section this chunk belongs to';
comment on column file_embeddings.section_level is 'Header level: 1=main, 2=sub, 3=subsub, etc.';
comment on column file_citations.chunk_preview is 'First 200 characters of the cited chunk for quick reference';

-- Create view for easy citation querying
create or replace view enriched_citations as
select 
  fc.id,
  fc.user_id,
  fc.conversation_id,
  uf.file_name,
  fc.page_number,
  fc.section_title,
  fc.section_level,
  fc.chunk_preview,
  fc.relevance_score,
  fc.context,
  fc.created_at,
  uf.category as file_category,
  uf.emotional_tone,
  uf.elemental_resonance
from file_citations fc
join user_files uf on fc.file_id = uf.id;