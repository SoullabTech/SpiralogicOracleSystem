-- Create soulprints table for storing user petal interaction sessions
create table if not exists soulprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  scores jsonb not null, -- { Fire1: 0.8, Water2: 0.4, ... }
  milestone text not null, -- first-bloom, pattern-keeper, depth-seeker, sacred-gardener, wisdom-keeper
  coherence numeric not null default 0, -- overall coherence score 0-1
  elemental_balance jsonb, -- { fire: 0.7, water: 0.3, earth: 0.9, air: 0.5 }
  total_activation numeric default 0, -- sum of all petal scores
  session_duration integer, -- in seconds
  metadata jsonb default '{}', -- additional session data
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add indexes for performance
create index if not exists idx_soulprints_user_id on soulprints(user_id);
create index if not exists idx_soulprints_milestone on soulprints(milestone);
create index if not exists idx_soulprints_created_at on soulprints(created_at);
create index if not exists idx_soulprints_user_milestone on soulprints(user_id, milestone);

-- Enable RLS (Row Level Security)
alter table soulprints enable row level security;

-- RLS policies
create policy "Users can view their own soulprints"
  on soulprints for select
  using (auth.uid() = user_id);

create policy "Users can insert their own soulprints"
  on soulprints for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own soulprints"
  on soulprints for update
  using (auth.uid() = user_id);

-- Add trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_soulprints_updated_at
    before update on soulprints
    for each row
    execute procedure update_updated_at_column();