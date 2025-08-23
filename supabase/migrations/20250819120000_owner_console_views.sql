-- Owner/Operator Console - Aggregated Metrics Views
-- Safe aggregated views for admin dashboard (no PII exposure)

-- Oracle Turns Overview
create or replace view admin_oracle_turns as
select 
  date_trunc('day', accessed_at) as day,
  count(*) as total_turns,
  count(distinct user_id) as unique_users,
  avg(completion_percentage) as avg_completion,
  sum(time_spent_minutes) as total_minutes,
  count(case when completion_percentage >= 80 then 1 end) as completed_turns,
  count(case when bypassing_warnings_given > 0 then 1 end) as warning_turns
from content_interactions
where accessed_at >= current_date - interval '30 days'
group by date_trunc('day', accessed_at)
order by day desc;

-- Probe Depth & Enrichment Quality
create or replace view admin_enrichment_metrics as
select 
  date_trunc('day', created_at) as day,
  count(*) as total_enrichments,
  count(distinct user_id) as unique_users,
  avg(integration_quality) as avg_integration_quality,
  count(case when integration_quality >= 8 then 1 end) as high_quality_integrations,
  count(case when real_world_application is not null and array_length(real_world_application, 1) > 0 then 1 end) as applied_insights
from spiral_progress
where created_at >= current_date - interval '30 days'
group by date_trunc('day', created_at)
order by day desc;

-- Soul Memory Bridge Health
create or replace view admin_bridge_health as
select 
  date_trunc('hour', created_at) as hour,
  count(*) as total_entries,
  count(distinct user_id) as active_users,
  avg(case when type = 'consistency_metric' then consistency_rating end) as avg_consistency,
  count(case when validated = true then 1 end) as validated_entries,
  count(case when type = 'struggle_wisdom' then 1 end) as struggle_wisdom_entries,
  count(case when type = 'ordinary_moment' then 1 end) as ordinary_moments
from embodied_wisdom
where created_at >= current_date - interval '7 days'
group by date_trunc('hour', created_at)
order by hour desc;

-- Safeguards & Bypassing Prevention
create or replace view admin_safeguards as
select 
  date_trunc('day', detected_date) as day,
  pattern,
  severity,
  count(*) as detection_count,
  count(distinct user_id) as affected_users,
  count(case when intervention_delivered = true then 1 end) as interventions_delivered,
  count(case when professional_referral_made = true then 1 end) as referrals_made,
  count(case when addressed = true then 1 end) as resolved_cases
from bypassing_detections
where detected_date >= current_date - interval '30 days'
group by date_trunc('day', detected_date), pattern, severity
order by day desc, detection_count desc;

-- Archetype Detection Patterns
create or replace view admin_archetypes as
select 
  date_trunc('day', accessed_at) as day,
  elemental_association as element,
  count(*) as interaction_count,
  count(distinct user_id) as unique_users,
  avg(completion_percentage) as avg_completion
from content_interactions
where elemental_association is not null
  and accessed_at >= current_date - interval '30 days'
group by date_trunc('day', accessed_at), elemental_association
order by day desc, interaction_count desc;

-- Integration Gates & Flow Control
create or replace view admin_integration_flow as
select 
  date_trunc('day', created_at) as day,
  gate_type,
  content_to_unlock,
  count(*) as gate_encounters,
  count(distinct user_id) as unique_users,
  count(case when unlocked = true then 1 end) as successful_unlocks,
  avg(bypass_attempts) as avg_bypass_attempts,
  avg(minimum_integration_days) as avg_integration_requirement
from integration_gates
where created_at >= current_date - interval '30 days'
group by date_trunc('day', created_at), gate_type, content_to_unlock
order by day desc, gate_encounters desc;

-- Reflection Gaps & Processing Quality
create or replace view admin_reflection_quality as
select 
  date_trunc('day', start_date) as day,
  count(*) as gaps_initiated,
  count(distinct user_id) as unique_users,
  count(case when status = 'completed' then 1 end) as completed_gaps,
  count(case when status = 'bypassed' then 1 end) as bypassed_gaps,
  avg(minimum_duration_hours) as avg_duration_required,
  avg(bypass_attempts) as avg_bypass_attempts
from reflection_gaps
where start_date >= current_date - interval '30 days'
group by date_trunc('day', start_date)
order by day desc;

-- Community Health & Reality-Checking
create or replace view admin_community_health as
select 
  date_trunc('day', created_at) as day,
  interaction_type,
  count(*) as interaction_count,
  count(distinct user_id) as unique_users,
  avg(helpful_count) as avg_helpful_score,
  avg(reality_grounding_count) as avg_grounding_score,
  count(case when bypassing_concern_count > 0 then 1 end) as bypassing_concerns,
  count(case when flagged = true then 1 end) as flagged_interactions
from community_interactions
where created_at >= current_date - interval '30 days'
group by date_trunc('day', created_at), interaction_type
order by day desc, interaction_count desc;

-- Professional Connections & Support Network
create or replace view admin_professional_network as
select 
  date_trunc('day', created_at) as day,
  connection_type,
  count(*) as connection_requests,
  count(distinct user_id) as unique_users,
  count(distinct professional_id) as unique_professionals,
  count(case when status = 'active' then 1 end) as active_connections,
  count(case when platform_integration_consent = true then 1 end) as integrated_connections
from professional_connections
where created_at >= current_date - interval '30 days'
group by date_trunc('day', created_at), connection_type
order by day desc, connection_requests desc;

-- System Health Summary (for quick dashboard overview)
create or replace view admin_system_health as
select 
  'last_24h' as timeframe,
  (select count(*) from content_interactions where accessed_at >= current_timestamp - interval '24 hours') as oracle_turns_24h,
  (select count(distinct user_id) from content_interactions where accessed_at >= current_timestamp - interval '24 hours') as active_users_24h,
  (select count(*) from bypassing_detections where detected_date >= current_timestamp - interval '24 hours') as bypassing_alerts_24h,
  (select count(*) from reflection_gaps where start_date >= current_timestamp - interval '24 hours' and status = 'processing') as active_reflections,
  (select count(*) from integration_gates where created_at >= current_timestamp - interval '24 hours' and unlocked = false) as pending_gates,
  (select avg(embodiment_quality) from embodied_wisdom where created_at >= current_timestamp - interval '24 hours' and embodiment_quality is not null) as avg_embodiment_quality
union all
select 
  'last_7d' as timeframe,
  (select count(*) from content_interactions where accessed_at >= current_timestamp - interval '7 days') as oracle_turns_7d,
  (select count(distinct user_id) from content_interactions where accessed_at >= current_timestamp - interval '7 days') as active_users_7d,
  (select count(*) from bypassing_detections where detected_date >= current_timestamp - interval '7 days') as bypassing_alerts_7d,
  (select count(*) from reflection_gaps where start_date >= current_timestamp - interval '7 days' and status = 'processing') as active_reflections,
  (select count(*) from integration_gates where created_at >= current_timestamp - interval '7 days' and unlocked = false) as pending_gates,
  (select avg(embodiment_quality) from embodied_wisdom where created_at >= current_timestamp - interval '7 days' and embodiment_quality is not null) as avg_embodiment_quality;

-- Grant read access to admin users only (will be handled by RLS policies)
-- Views inherit the RLS policies from their underlying tables

-- Create indexes on commonly queried columns for performance
create index if not exists idx_content_interactions_accessed_at on content_interactions(accessed_at);
create index if not exists idx_spiral_progress_created_at on spiral_progress(created_at);
create index if not exists idx_embodied_wisdom_created_at on embodied_wisdom(created_at);
create index if not exists idx_bypassing_detections_detected_date on bypassing_detections(detected_date);
create index if not exists idx_integration_gates_created_at on integration_gates(created_at);
create index if not exists idx_reflection_gaps_start_date on reflection_gaps(start_date);
create index if not exists idx_community_interactions_created_at on community_interactions(created_at);
create index if not exists idx_professional_connections_created_at on professional_connections(created_at);

-- Admin-specific RLS policies for views
-- Note: Views will respect the RLS policies of underlying tables
-- Additional view-specific policies can be added if needed

comment on view admin_oracle_turns is 'Aggregated Oracle interaction metrics by day';
comment on view admin_enrichment_metrics is 'Soul Memory enrichment and integration quality metrics';
comment on view admin_bridge_health is 'Real-time bridge health and consistency metrics';
comment on view admin_safeguards is 'Spiritual bypassing detection and intervention tracking';
comment on view admin_archetypes is 'Elemental archetype engagement patterns';
comment on view admin_integration_flow is 'Integration gate effectiveness and flow analysis';
comment on view admin_reflection_quality is 'Reflection gap completion and bypass analysis';
comment on view admin_community_health is 'Community interaction quality and safety metrics';
comment on view admin_professional_network is 'Professional support network utilization';
comment on view admin_system_health is 'High-level system health indicators for dashboard';