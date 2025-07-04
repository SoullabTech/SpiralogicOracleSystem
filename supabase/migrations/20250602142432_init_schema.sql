create table if not exists user_phases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  phase text,
  archetype text,
  element text,
  timestamp timestamptz default now()
);

create table if not exists ritual_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  ritual_type text,
  linked_dream_id uuid references journal_entries(id),
  notes text,
  created_at timestamptz default now()
);
