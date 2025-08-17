-- Performance indexes for RLS predicates
-- Ensures fast policy evaluation under load

-- Core user_id indexes (most common RLS predicate)
create index if not exists idx_bypassing_detections_user_id on public.bypassing_detections(user_id);
create index if not exists idx_community_interactions_user_id on public.community_interactions(user_id);
create index if not exists idx_content_interactions_user_id on public.content_interactions(user_id);
create index if not exists idx_domain_profiles_user_id on public.domain_profiles(user_id);
create index if not exists idx_embodied_wisdom_user_id on public.embodied_wisdom(user_id);
create index if not exists idx_integration_gates_user_id on public.integration_gates(user_id);
create index if not exists idx_integration_journeys_user_id on public.integration_journeys(user_id);
create index if not exists idx_reflection_gaps_user_id on public.reflection_gaps(user_id);
create index if not exists idx_spiral_progress_user_id on public.spiral_progress(user_id);
create index if not exists idx_spiralogic_reports_user_id on public.spiralogic_reports(user_id);
create index if not exists idx_user_phases_user_id on public.user_phases(user_id);
create index if not exists idx_ritual_entries_user_id on public.ritual_entries(user_id);
create index if not exists idx_prompt_insight_log_user_id on public.prompt_insight_log(user_id);
create index if not exists idx_collective_observations_user_id on public.collective_observations(user_id);
create index if not exists idx_pattern_contributions_user_id on public.pattern_contributions(user_id);

-- user_profiles indexes (hub table)
create index if not exists idx_user_profiles_user_id on public.user_profiles(user_id);
create index if not exists idx_user_profiles_community_visibility on public.user_profiles(community_visibility);

-- professional_connections multi-user indexes
create index if not exists idx_professional_connections_user_id on public.professional_connections(user_id);
create index if not exists idx_professional_connections_professional_id on public.professional_connections(professional_id);
create index if not exists idx_professional_connections_initiated_by on public.professional_connections(initiated_by);

-- Foreign key indexes for parent-child relationships
create index if not exists idx_content_interactions_reflection_gap_id on public.content_interactions(reflection_gap_id);
create index if not exists idx_content_interactions_integration_journey_id on public.content_interactions(integration_journey_id);
create index if not exists idx_cultural_wisdom_mappings_pattern_id on public.cultural_wisdom_mappings(pattern_id);
create index if not exists idx_pattern_contributions_pattern_id on public.pattern_contributions(pattern_id);
create index if not exists idx_wisdom_democratization_events_source_pattern_id on public.wisdom_democratization_events(source_pattern_id);

-- Pattern discovery indexes
create index if not exists idx_elemental_patterns_discovered_by_user on public.elemental_patterns(discovered_by_user);

-- Spiral progress validation indexes
create index if not exists idx_spiral_progress_validated_by on public.spiral_progress(validated_by);

-- Community interaction visibility indexes
create index if not exists idx_community_interactions_visibility on public.community_interactions(visibility);
create index if not exists idx_community_interactions_target_user_id on public.community_interactions(target_user_id);

-- Collective salon participation indexes
create index if not exists idx_collective_salons_participants on public.collective_salons using gin(participants);
create index if not exists idx_collective_salons_status on public.collective_salons(status);

-- Platform analytics hash index
create index if not exists idx_platform_analytics_user_hash on public.platform_analytics(user_hash);

-- Compound indexes for common query patterns
create index if not exists idx_prompt_insight_log_user_session on public.prompt_insight_log(user_id, session_id);
create index if not exists idx_content_interactions_user_content on public.content_interactions(user_id, content_id);
create index if not exists idx_spiral_progress_user_theme on public.spiral_progress(user_id, theme);

-- Performance monitoring comment
comment on index idx_user_profiles_user_id is 'Critical RLS performance index - monitors auth.uid() = user_id predicates';
comment on index idx_professional_connections_user_id is 'Multi-user relationship index for professional connections RLS';
comment on index idx_content_interactions_user_id is 'User isolation index for content interaction tracking';