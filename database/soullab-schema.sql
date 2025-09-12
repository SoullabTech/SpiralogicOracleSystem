-- 🌟 SoulLab Database Schema
-- Rich journaling, storytelling, and memory weaving system

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 👤 Users table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 🧾 Journal Entries
create table if not exists journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text,
  content text not null,
  metadata jsonb not null default '{}',
  thread_ids text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 📖 Stories
create table if not exists stories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text,
  content text not null,
  story_arc jsonb, -- stage, tension, transformation
  metadata jsonb not null default '{}',
  thread_ids text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 🔄 Relived Moments
create table if not exists relived_moments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  moment_description text not null,
  sensory_details jsonb, -- visual, auditory, kinesthetic, etc.
  emotional_texture text,
  somatic_markers text[],
  metadata jsonb not null default '{}',
  thread_ids text[] default '{}',
  original_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 🧵 Story Threads - Weaving memories together
create table if not exists story_threads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  description text,
  archetype text, -- Dominant archetype
  element text, -- Dominant element
  insights text[], -- Maya's observations
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 🔗 Thread Links - Connect entries to threads
create table if not exists thread_links (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid references story_threads(id) on delete cascade,
  entry_type text check (entry_type in ('journal', 'story', 'moment')),
  entry_id uuid not null,
  position integer, -- Order within thread
  created_at timestamp with time zone default now(),
  unique(thread_id, entry_id)
);

-- 👤 User Soul Profiles - Accumulated patterns
create table if not exists user_soul_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  dominant_elements text[],
  active_archetypes text[],
  developmental_stage text,
  language_tier text check (language_tier in ('everyday', 'metaphorical', 'alchemical')),
  preferred_style text check (preferred_style in ('technical', 'philosophical', 'dramatic', 'soulful')),
  sacred_words text[],
  growth_edge text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 💬 Conversation States - Track ongoing sessions
create table if not exists conversation_states (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  session_id text not null,
  exchange_count integer default 0,
  current_role jsonb not null default '{"primary": "mirror"}',
  last_element text,
  last_archetype text,
  momentum text check (momentum in ('building', 'sustaining', 'completing')),
  thread_context text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, session_id)
);

-- 🎯 Indexes for fast queries
create index idx_journal_metadata on journal_entries using gin (metadata);
create index idx_stories_metadata on stories using gin (metadata);
create index idx_moments_metadata on relived_moments using gin (metadata);
create index idx_journal_user on journal_entries(user_id);
create index idx_stories_user on stories(user_id);
create index idx_moments_user on relived_moments(user_id);
create index idx_threads_user on story_threads(user_id);
create index idx_thread_links on thread_links(thread_id);
create index idx_conversation_session on conversation_states(session_id);

-- Elemental search index
create index idx_journal_element on journal_entries using gin ((metadata->'elemental'));
create index idx_stories_element on stories using gin ((metadata->'elemental'));
create index idx_moments_element on relived_moments using gin ((metadata->'elemental'));

-- Archetypal search index
create index idx_journal_archetype on journal_entries using gin ((metadata->'archetypal'));
create index idx_stories_archetype on stories using gin ((metadata->'archetypal'));
create index idx_moments_archetype on relived_moments using gin ((metadata->'archetypal'));

-- Update timestamp triggers
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_journal_updated_at before update on journal_entries
  for each row execute function update_updated_at();

create trigger update_stories_updated_at before update on stories
  for each row execute function update_updated_at();

create trigger update_moments_updated_at before update on relived_moments
  for each row execute function update_updated_at();

create trigger update_threads_updated_at before update on story_threads
  for each row execute function update_updated_at();

create trigger update_profiles_updated_at before update on user_soul_profiles
  for each row execute function update_updated_at();

create trigger update_conversations_updated_at before update on conversation_states
  for each row execute function update_updated_at();

-- 🔒 Row Level Security
alter table users enable row level security;
alter table journal_entries enable row level security;
alter table stories enable row level security;
alter table relived_moments enable row level security;
alter table story_threads enable row level security;
alter table thread_links enable row level security;
alter table user_soul_profiles enable row level security;
alter table conversation_states enable row level security;

-- RLS Policies (adjust based on your auth strategy)
create policy "Users can view own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

create policy "Users can view own journal entries" on journal_entries
  for select using (auth.uid() = user_id);

create policy "Users can create own journal entries" on journal_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own journal entries" on journal_entries
  for update using (auth.uid() = user_id);

create policy "Users can view own stories" on stories
  for select using (auth.uid() = user_id);

create policy "Users can create own stories" on stories
  for insert with check (auth.uid() = user_id);

create policy "Users can update own stories" on stories
  for update using (auth.uid() = user_id);

create policy "Users can view own moments" on relived_moments
  for select using (auth.uid() = user_id);

create policy "Users can create own moments" on relived_moments
  for insert with check (auth.uid() = user_id);

create policy "Users can update own moments" on relived_moments
  for update using (auth.uid() = user_id);

create policy "Users can view own threads" on story_threads
  for select using (auth.uid() = user_id);

create policy "Users can create own threads" on story_threads
  for insert with check (auth.uid() = user_id);

create policy "Users can update own threads" on story_threads
  for update using (auth.uid() = user_id);

create policy "Users can view own soul profile" on user_soul_profiles
  for select using (auth.uid() = user_id);

create policy "Users can update own soul profile" on user_soul_profiles
  for all using (auth.uid() = user_id);

create policy "Users can view own conversations" on conversation_states
  for select using (auth.uid() = user_id);

create policy "Users can manage own conversations" on conversation_states
  for all using (auth.uid() = user_id);