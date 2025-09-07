-- INTEGRATION-CENTERED PLATFORM DATABASE SCHEMA
-- Core infrastructure for preventing spiritual bypassing and supporting embodied development

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create enum types for developmental tracking
create type holistic_domain as enum ('mind', 'body', 'spirit', 'emotions');
create type development_stage as enum ('beginner', 'intermediate', 'advanced');
create type user_state as enum ('stressed', 'seeking_clarity', 'disconnected', 'physical_concerns', 'balanced', 'energized', 'reflective');
create type spiral_phase as enum ('foundation', 'exploration', 'integration', 'deepening', 'service', 'maintenance');
create type bypassing_pattern as enum ('insight_addiction', 'emotional_avoidance', 'spiritual_superiority', 'transcendence_seeking', 'responsibility_avoidance', 'ordinary_rejection');
create type integration_stage as enum ('initial_insight', 'reflection_gap', 'reality_application', 'daily_integration', 'embodied_wisdom', 'spiral_revisit');
create type account_type as enum ('user', 'professional', 'mentor', 'researcher', 'admin');
create type professional_type as enum ('therapist', 'coach', 'spiritual_director', 'counselor', 'somatic_practitioner');
create type red_flag_severity as enum ('awareness', 'concern', 'intervention', 'professional_referral');

-- User profiles with developmental tracking
create table user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  
  -- Basic profile information
  display_name text,
  bio text,
  account_type account_type default 'user',
  professional_type professional_type,
  
  -- Developmental state tracking
  current_state user_state default 'balanced',
  stress_level integer check (stress_level >= 1 and stress_level <= 10) default 5,
  energy_level integer check (energy_level >= 1 and energy_level <= 10) default 5,
  integration_stage integration_stage default 'initial_insight',
  
  -- Privacy and community settings
  community_visibility text default 'supportive', -- 'private', 'supportive', 'open'
  professional_support_consent boolean default false,
  research_participation_consent boolean default false,
  
  -- Professional credentials (for professional accounts)
  professional_credentials jsonb,
  verified_professional boolean default false,
  
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_active timestamp with time zone default now()
);

-- Domain profiles for holistic development tracking
create table domain_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(user_id) on delete cascade not null,
  domain holistic_domain not null,
  
  -- Current development metrics
  current_level numeric(3,1) check (current_level >= 0 and current_level <= 10),
  development_stage development_stage,
  
  -- Strengths and growth areas
  strengths text[],
  growth_edges text[],
  practices_engaged text[],
  
  -- Assessment tracking
  last_assessment_date timestamp with time zone,
  assessment_responses jsonb,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id, domain)
);

-- Spiral progress tracking - core to integration-centered approach
create table spiral_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(user_id) on delete cascade not null,
  
  -- Spiral development data
  theme text not null,
  depth integer check (depth >= 1 and depth <= 10) default 1,
  phase spiral_phase not null,
  visit_date timestamp with time zone default now(),
  previous_visits timestamp with time zone[],
  
  -- Integration quality metrics
  integration_quality numeric(3,1) check (integration_quality >= 0 and integration_quality <= 10),
  real_world_application text[] not null,
  struggles_encountered text[] not null,
  ordinary_moments text[],
  
  -- Validation and community engagement
  community_validated boolean default false,
  validated_by uuid references user_profiles(user_id),
  validation_date timestamp with time zone,
  
  created_at timestamp with time zone default now()
);

-- Integration journeys - tracking real-world application over time
create table integration_journeys (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(user_id) on delete cascade not null,
  
  -- Journey identification
  insight_content text not null,
  content_source text, -- reference to content that sparked journey
  journey_start_date timestamp with time zone default now(),
  
  -- Application tracking
  real_world_applications jsonb not null, -- Array of application entries
  challenges_encountered jsonb not null, -- Array of challenge entries
  adaptations_made jsonb not null, -- Array of adaptation entries
  
  -- Time-based integration
  timeframe text not null, -- "ongoing", "3 months", etc.
  ongoing_practice boolean default true,
  integration_evidence text[],
  
  -- Community and professional validation
  community_feedback jsonb,
  professional_input jsonb,
  
  -- Completion and outcomes
  journey_completed boolean default false,
  completion_date timestamp with time zone,
  embodied_wisdom_gained text,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Embodied wisdom tracking - prioritizing lived experience
create table embodied_wisdom (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(user_id) on delete cascade not null,
  
  -- Types of embodied wisdom
  type text not null check (type in ('lived_experience', 'body_integration', 'struggle_wisdom', 'ordinary_moment', 'consistency_metric')),
  
  -- Core wisdom data
  title text not null,
  description text not null,
  
  -- Specific to type
  somatic_awareness text, -- for body_integration
  physical_practice text, -- for body_integration
  body_wisdom text, -- for body_integration
  
  struggle_details text, -- for struggle_wisdom
  lessons_learned text[], -- for struggle_wisdom
  ongoing_challenges text[], -- for struggle_wisdom
  humility_developed text, -- for struggle_wisdom
  
  moment_description text, -- for ordinary_moment
  awareness_quality text, -- for ordinary_moment
  practice_applied text, -- for ordinary_moment
  humanness_acknowledged text, -- for ordinary_moment
  
  practice_name text, -- for consistency_metric
  frequency text, -- for consistency_metric
  consistency_rating integer check (consistency_rating >= 1 and consistency_rating <= 10), -- for consistency_metric
  maintained_days integer, -- for consistency_metric
  
  -- Validation and quality
  validated boolean default false,
  validation_notes text,
  embodiment_quality numeric(3,1),
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Spiritual bypassing detection and prevention
create table bypassing_detections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(user_id) on delete cascade not null,
  
  -- Detection details
  pattern bypassing_pattern not null,
  severity red_flag_severity not null,
  detected_date timestamp with time zone default now(),
  
  -- Evidence and triggers
  trigger_events text[] not null,
  behavior_indicators jsonb not null,
  pattern_frequency integer default 1,
  
  -- Intervention and response
  intervention_recommended text not null,
  intervention_delivered boolean default false,
  intervention_date timestamp with time zone,
  
  -- Professional referral
  professional_referral_suggested boolean default false,
  professional_referral_made boolean default false,
  referral_date timestamp with time zone,
  
  -- Resolution tracking
  addressed boolean default false,
  addressed_date timestamp with time zone,
  resolution_notes text,
  follow_up_required boolean default false,
  
  created_at timestamp with time zone default now()
);

-- Integration gates - preventing spiritual consumption
create table integration_gates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(user_id) on delete cascade not null,
  
  -- Gate configuration
  content_to_unlock text not null,
  gate_type text not null check (gate_type in ('sequential', 'cumulative', 'spiral_depth')),
  minimum_integration_days integer not null,
  
  -- Requirements for unlocking
  requirements jsonb not null, -- Array of requirement objects
  real_world_application_required boolean default true,
  community_validation_required boolean default false,
  
  -- Gate status
  unlocked boolean default false,
  unlocked_date timestamp with time zone,
  bypass_attempts integer default 0,
  last_bypass_attempt timestamp with time zone,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Reflection gaps - mandatory integration periods
create table reflection_gaps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(user_id) on delete cascade not null,
  content_id text not null,
  
  -- Gap timing
  start_date timestamp with time zone default now(),
  minimum_duration_hours integer not null,
  
  -- Reflection process
  reflection_prompts text[] not null,
  reality_check_questions text[] not null,
  
  -- Evidence collection
  integration_evidence jsonb, -- Array of evidence objects
  
  -- Gap status
  status text default 'processing' check (status in ('processing', 'completed', 'bypassed')),
  bypass_attempts integer default 0,
  completion_date timestamp with time zone,
  
  created_at timestamp with time zone default now()
);

-- Community interactions focused on reality-checking
create table community_interactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(user_id) on delete cascade not null,
  
  -- Interaction type and content
  interaction_type text not null check (interaction_type in ('reality_check', 'integration_validation', 'struggle_support', 'ordinary_moment_sharing', 'bypassing_concern')),
  content text not null,
  context jsonb, -- Additional context data
  
  -- Target and visibility
  target_user_id uuid references user_profiles(user_id),
  group_context text, -- 'general', 'development_stage', 'domain_specific'
  visibility text default 'supportive' check (visibility in ('private', 'supportive', 'open')),
  
  -- Community response tracking
  responses jsonb, -- Array of response objects
  helpful_count integer default 0,
  reality_grounding_count integer default 0,
  bypassing_concern_count integer default 0,
  
  -- Moderation and safety
  flagged boolean default false,
  flagged_reason text,
  moderated boolean default false,
  moderator_notes text,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Professional connections and referrals
create table professional_connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(user_id) on delete cascade not null,
  professional_id uuid references user_profiles(user_id) on delete cascade not null,
  
  -- Connection details
  connection_type text not null check (connection_type in ('therapy', 'coaching', 'spiritual_direction', 'somatic_work', 'mentorship')),
  initiated_by uuid references user_profiles(user_id) not null,
  connection_reason text,
  
  -- Platform integration
  platform_integration_consent boolean default false,
  data_sharing_level text default 'minimal' check (data_sharing_level in ('minimal', 'summary', 'detailed')),
  
  -- Status tracking
  status text default 'pending' check (status in ('pending', 'active', 'paused', 'completed', 'declined')),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  
  -- Communication log
  communication_log jsonb,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id, professional_id)
);

-- Content delivery tracking with integration requirements
create table content_interactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(user_id) on delete cascade not null,
  
  -- Content identification
  content_id text not null,
  content_type text not null,
  content_title text,
  elemental_association text, -- 'fire', 'water', 'earth', 'air', 'aether'
  
  -- Access control
  access_granted boolean not null,
  access_denied_reason text,
  integration_requirements_met boolean default false,
  
  -- Engagement tracking
  time_spent_minutes integer,
  completion_percentage numeric(5,2),
  
  -- Integration tracking
  reflection_gap_id uuid references reflection_gaps(id),
  integration_journey_id uuid references integration_journeys(id),
  
  -- Grounding and safety
  grounding_prompts_delivered text[],
  bypassing_warnings_given integer default 0,
  reality_checks_prompted integer default 0,
  
  accessed_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- Analytics for research and platform improvement
create table platform_analytics (
  id uuid primary key default uuid_generate_v4(),
  
  -- Anonymized user data
  user_hash text not null, -- Hashed user ID for privacy
  cohort_identifier text, -- For research grouping
  
  -- Developmental metrics
  integration_effectiveness_score numeric(5,2),
  bypassing_reduction_score numeric(5,2),
  community_health_contribution numeric(5,2),
  long_term_development_trend text,
  
  -- Platform engagement patterns
  session_data jsonb,
  content_interaction_patterns jsonb,
  community_participation_patterns jsonb,
  
  -- Outcome tracking
  professional_support_utilization boolean,
  self_reported_wellbeing_change numeric(3,1),
  integration_quality_improvement numeric(3,1),
  
  -- Privacy and research
  research_consent boolean not null,
  data_retention_end_date date,
  
  recorded_at timestamp with time zone default now()
);

-- Row Level Security Policies

-- Enable RLS on all tables
alter table user_profiles enable row level security;
alter table domain_profiles enable row level security;
alter table spiral_progress enable row level security;
alter table integration_journeys enable row level security;
alter table embodied_wisdom enable row level security;
alter table bypassing_detections enable row level security;
alter table integration_gates enable row level security;
alter table reflection_gaps enable row level security;
alter table community_interactions enable row level security;
alter table professional_connections enable row level security;
alter table content_interactions enable row level security;
alter table platform_analytics enable row level security;

-- User profiles - users can see their own profile and public profiles
create policy "Users can view their own profile" on user_profiles
  for select using (auth.uid() = user_id);

create policy "Users can update their own profile" on user_profiles
  for update using (auth.uid() = user_id);

create policy "Users can insert their own profile" on user_profiles
  for insert with check (auth.uid() = user_id);

create policy "Public profiles viewable by community" on user_profiles
  for select using (community_visibility in ('supportive', 'open'));

-- Domain profiles - private to user and authorized professionals
create policy "Users can manage their domain profiles" on domain_profiles
  for all using (auth.uid() = user_id);

create policy "Professionals can view client domain profiles" on domain_profiles
  for select using (
    exists (
      select 1 from professional_connections pc
      join user_profiles up on up.user_id = auth.uid()
      where pc.user_id = domain_profiles.user_id
        and pc.professional_id = auth.uid()
        and pc.status = 'active'
        and pc.platform_integration_consent = true
        and up.account_type = 'professional'
    )
  );

-- Spiral progress - private but community validation allowed
create policy "Users can manage their spiral progress" on spiral_progress
  for all using (auth.uid() = user_id);

create policy "Community can validate spiral progress" on spiral_progress
  for update using (
    exists (
      select 1 from user_profiles up
      where up.user_id = auth.uid()
        and up.community_visibility in ('supportive', 'open')
    )
  );

-- Integration journeys - private to user and consented professionals
create policy "Users can manage their integration journeys" on integration_journeys
  for all using (auth.uid() = user_id);

-- Embodied wisdom - respects community visibility settings
create policy "Users can manage their embodied wisdom" on embodied_wisdom
  for all using (auth.uid() = user_id);

create policy "Community can view supportive embodied wisdom" on embodied_wisdom
  for select using (
    exists (
      select 1 from user_profiles up
      where up.user_id = embodied_wisdom.user_id
        and up.community_visibility in ('supportive', 'open')
    )
  );

-- Bypassing detections - private and professional access only
create policy "Users can view their bypassing detections" on bypassing_detections
  for select using (auth.uid() = user_id);

create policy "Professionals can view client bypassing patterns" on bypassing_detections
  for select using (
    exists (
      select 1 from professional_connections pc
      join user_profiles up on up.user_id = auth.uid()
      where pc.user_id = bypassing_detections.user_id
        and pc.professional_id = auth.uid()
        and pc.status = 'active'
        and pc.data_sharing_level in ('summary', 'detailed')
        and up.account_type = 'professional'
    )
  );

-- Integration gates - private to user
create policy "Users can manage their integration gates" on integration_gates
  for all using (auth.uid() = user_id);

-- Reflection gaps - private to user
create policy "Users can manage their reflection gaps" on reflection_gaps
  for all using (auth.uid() = user_id);

-- Community interactions - based on visibility settings
create policy "Users can manage their community interactions" on community_interactions
  for all using (auth.uid() = user_id);

create policy "Community can view appropriate interactions" on community_interactions
  for select using (
    visibility = 'open' or 
    (visibility = 'supportive' and exists (
      select 1 from user_profiles up
      where up.user_id = auth.uid()
        and up.community_visibility in ('supportive', 'open')
    ))
  );

-- Professional connections - visible to both parties
create policy "Connection parties can view their connections" on professional_connections
  for select using (auth.uid() = user_id or auth.uid() = professional_id);

create policy "Users can initiate professional connections" on professional_connections
  for insert with check (auth.uid() = initiated_by);

create policy "Connection parties can update their connections" on professional_connections
  for update using (auth.uid() = user_id or auth.uid() = professional_id);

-- Content interactions - private to user
create policy "Users can view their content interactions" on content_interactions
  for select using (auth.uid() = user_id);

create policy "System can insert content interactions" on content_interactions
  for insert with check (auth.uid() = user_id);

-- Platform analytics - research team access only
create policy "Researchers can view anonymized analytics" on platform_analytics
  for select using (
    exists (
      select 1 from user_profiles up
      where up.user_id = auth.uid()
        and up.account_type = 'researcher'
    )
  );

-- Create indexes for performance
create index idx_user_profiles_user_id on user_profiles(user_id);
create index idx_domain_profiles_user_id on domain_profiles(user_id);
create index idx_spiral_progress_user_id on spiral_progress(user_id);
create index idx_spiral_progress_theme on spiral_progress(theme);
create index idx_integration_journeys_user_id on integration_journeys(user_id);
create index idx_embodied_wisdom_user_id on embodied_wisdom(user_id);
create index idx_embodied_wisdom_type on embodied_wisdom(type);
create index idx_bypassing_detections_user_id on bypassing_detections(user_id);
create index idx_bypassing_detections_pattern on bypassing_detections(pattern);
create index idx_integration_gates_user_id on integration_gates(user_id);
create index idx_reflection_gaps_user_id on reflection_gaps(user_id);
create index idx_community_interactions_user_id on community_interactions(user_id);
create index idx_community_interactions_type on community_interactions(interaction_type);
create index idx_professional_connections_user_id on professional_connections(user_id);
create index idx_professional_connections_professional_id on professional_connections(professional_id);
create index idx_content_interactions_user_id on content_interactions(user_id);
create index idx_platform_analytics_user_hash on platform_analytics(user_hash);

-- Function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

-- Create triggers for updated_at
create trigger update_user_profiles_updated_at before update on user_profiles
  for each row execute procedure update_updated_at_column();

create trigger update_domain_profiles_updated_at before update on domain_profiles
  for each row execute procedure update_updated_at_column();

create trigger update_integration_journeys_updated_at before update on integration_journeys
  for each row execute procedure update_updated_at_column();

create trigger update_embodied_wisdom_updated_at before update on embodied_wisdom
  for each row execute procedure update_updated_at_column();

create trigger update_integration_gates_updated_at before update on integration_gates
  for each row execute procedure update_updated_at_column();

create trigger update_community_interactions_updated_at before update on community_interactions
  for each row execute procedure update_updated_at_column();

create trigger update_professional_connections_updated_at before update on professional_connections
  for each row execute procedure update_updated_at_column();