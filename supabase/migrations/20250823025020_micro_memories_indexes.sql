-- Performance indexes for micro_memories whispers queries
create index if not exists micro_memories_nd_tags_gin_idx
  on public.micro_memories using gin (nd_tags);