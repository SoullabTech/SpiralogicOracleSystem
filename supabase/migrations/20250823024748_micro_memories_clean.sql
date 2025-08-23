-- Create micro_memories table
create table if not exists public.micro_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  tags text[] not null default '{}',
  energy text check (energy in ('low','medium','high')),
  recall_at timestamptz,
  status text check (status in ('active','archived','deleted')) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists micro_memories_user_id_created_at_idx
  on public.micro_memories (user_id, created_at desc);

-- RLS
alter table public.micro_memories enable row level security;

create policy "Users can view own micro_memories"
  on public.micro_memories for select
  using (auth.uid() = user_id);

create policy "Users can insert own micro_memories"
  on public.micro_memories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own micro_memories"
  on public.micro_memories for update
  using (auth.uid() = user_id);

create policy "Users can delete own micro_memories"
  on public.micro_memories for delete
  using (auth.uid() = user_id);

-- Trigger to keep updated_at current
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_micro_memories on public.micro_memories;
create trigger set_updated_at_micro_memories
before update on public.micro_memories
for each row execute procedure public.set_updated_at();