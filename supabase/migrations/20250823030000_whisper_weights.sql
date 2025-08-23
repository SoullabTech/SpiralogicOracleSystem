-- Table to persist per-user whisper ranking weights
create table if not exists public.whisper_weights (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weights jsonb not null,
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_whisper_weights_touch on public.whisper_weights;
create trigger trg_whisper_weights_touch
before update on public.whisper_weights
for each row execute function public.touch_updated_at();

-- RLS
alter table public.whisper_weights enable row level security;

-- Select / insert / update / delete own
drop policy if exists "Users select own whisper_weights" on public.whisper_weights;
create policy "Users select own whisper_weights"
  on public.whisper_weights for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own whisper_weights" on public.whisper_weights;
create policy "Users insert own whisper_weights"
  on public.whisper_weights for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own whisper_weights" on public.whisper_weights;
create policy "Users update own whisper_weights"
  on public.whisper_weights for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own whisper_weights" on public.whisper_weights;
create policy "Users delete own whisper_weights"
  on public.whisper_weights for delete
  using (auth.uid() = user_id);

-- (Optional) performance index on updated_at
create index if not exists idx_whisper_weights_updated_at
  on public.whisper_weights(updated_at desc);