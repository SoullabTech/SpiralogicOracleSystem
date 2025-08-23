-- 1) Table
create table if not exists public.dreams (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,

  -- high level
  night_date       date not null,                -- the night it happened (use local date)
  title            text,                         -- optional short title
  summary          text,                         -- short overall recap

  -- timeline & content
  segments         jsonb not null default '[]',  -- array of { t, label, text, lucidity, emotion, tags[] }
  quote            text,                         -- one-line essence/quote
  tags             text[] not null default '{}', -- global tags across the night

  -- techniques & context
  techniques       jsonb not null default '{}'::jsonb, -- e.g. {"galantamine":true,"wbtb":true,"dose_mg":8}
  sleep_window     tstzrange,                    -- overall sleep period (start,end) if captured
  lucidity_peak    int,                          -- 0-10 peak lucidity for the night
  recall_quality   int,                          -- 0-10 subjective recall score

  -- linkage to your recap pipeline
  recap_buckets    jsonb,                        -- optional pre-bucketed recap (themes/emotions/steps/ideas/energy)
  weaved_from      uuid[],                       -- ids of messages/uploads used to weave this

  -- auditing
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.dreams is 'Nightly dream journals with timeline segments and techniques.';
comment on column public.dreams.segments is 'Array of timeline entries. Each entry can include time markers, text, lucidity/emotion ratings, and tags.';
comment on column public.dreams.techniques is 'Capture supplements & practices e.g. galantamine, WBTB, MILD, etc.';
comment on column public.dreams.recap_buckets is 'Server-generated recap mapped to Themes/Emotions/Steps/Ideas/Energy.';

-- 2) Data quality guards
alter table public.dreams
  add constraint dreams_lucidity_peak_range check (lucidity_peak between 0 and 10),
  add constraint dreams_recall_quality_range check (recall_quality between 0 and 10);

-- 3) Indexes (fast search & filters)
create index if not exists dreams_user_date_idx on public.dreams (user_id, night_date desc);
create index if not exists dreams_tags_gin_idx on public.dreams using gin (tags);
create index if not exists dreams_segments_gin_idx on public.dreams using gin (segments jsonb_path_ops);
create index if not exists dreams_techniques_gin_idx on public.dreams using gin (techniques jsonb_path_ops);

-- 4) Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $
begin
  new.updated_at = now();
  return new;
end; $;

drop trigger if exists dreams_set_updated_at on public.dreams;
create trigger dreams_set_updated_at
before update on public.dreams
for each row execute function public.set_updated_at();