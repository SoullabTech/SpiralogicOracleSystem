-- Create prompt_insight_log table to track prompt usage
create table if not exists prompt_insight_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  prompt_id uuid references spiralogic_prompts(id) on delete cascade,
  prompt_text text not null, -- Store the actual prompt text served
  phase text not null check (phase in ('Fire', 'Earth', 'Air', 'Water', 'Aether')),
  elemental_voice text,
  session_id uuid,
  response_quality integer check (response_quality between 1 and 5), -- Optional user feedback
  context_tags text[], -- Array of tags for this specific usage
  served_at timestamp with time zone default now(),
  
  -- Indexes for performance
  index idx_prompt_insight_user_time on prompt_insight_log(user_id, served_at desc),
  index idx_prompt_insight_phase on prompt_insight_log(phase),
  index idx_prompt_insight_session on prompt_insight_log(session_id)
);

-- Create view for analytics
create or replace view prompt_usage_analytics as
select 
  p.phase,
  p.elemental_voice,
  count(distinct pil.user_id) as unique_users,
  count(*) as total_uses,
  avg(pil.response_quality) as avg_quality,
  p.prompt,
  p.id as prompt_id
from prompt_insight_log pil
join spiralogic_prompts p on p.id = pil.prompt_id
group by p.id, p.phase, p.elemental_voice, p.prompt;

-- RLS policies
alter table prompt_insight_log enable row level security;

-- Users can only see their own prompt logs
create policy "Users can view own prompt logs" on prompt_insight_log
  for select using (auth.uid() = user_id);

-- Service role can insert logs
create policy "Service role can insert prompt logs" on prompt_insight_log
  for insert using (auth.role() = 'service_role');