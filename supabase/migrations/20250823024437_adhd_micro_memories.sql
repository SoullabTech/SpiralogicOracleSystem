-- Table for Quick Capture "micro-memories"
create table if not exists public.micro_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  nd_tags text[] not null default '{}',
  energy text check (energy in ('low','medium','high')),
  recall_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists micro_memories_user_id_created_at_idx
  on public.micro_memories (user_id, created_at desc);

alter table public.micro_memories enable row level security;

create policy "mm: select own"
  on public.micro_memories for select
  using (auth.uid() = user_id);

create policy "mm: insert own"
  on public.micro_memories for insert
  with check (auth.uid() = user_id);

create policy "mm: update own"
  on public.micro_memories for update
  using (auth.uid() = user_id);

create policy "mm: delete own"
  on public.micro_memories for delete
  using (auth.uid() = user_id);

-- Optional: light ND columns on dreams (non-breaking)
do $$ begin
  alter table public.dreams add column if not exists nd_tags text[] not null default '{}';
  alter table public.dreams add column if not exists energy text check (energy in ('low','medium','high'));
exception when others then null; end $$;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists set_updated_at_micro_memories on public.micro_memories;
create trigger set_updated_at_micro_memories
before update on public.micro_memories
for each row execute procedure public.set_updated_at();