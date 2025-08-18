-- Precise RLS policies based on schema analysis
-- Applied by relationship type: A (direct owner), B (via profile), C (via parent), D (catalog)

-- =============================================================================
-- TEMPLATE A: Direct owner on the row (user_id uuid)
-- =============================================================================

-- user_profiles (hub table)
create policy user_profiles_select_own
  on public.user_profiles
  for select using (user_id = auth.uid());

create policy user_profiles_insert_self
  on public.user_profiles
  for insert with check (user_id = auth.uid());

create policy user_profiles_update_own
  on public.user_profiles
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy user_profiles_delete_own
  on public.user_profiles
  for delete using (user_id = auth.uid());

-- bypassing_detections
create policy bypassing_detections_select_own
  on public.bypassing_detections
  for select using (user_id = auth.uid());

create policy bypassing_detections_insert_self
  on public.bypassing_detections
  for insert with check (user_id = auth.uid());

create policy bypassing_detections_update_own
  on public.bypassing_detections
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy bypassing_detections_delete_own
  on public.bypassing_detections
  for delete using (user_id = auth.uid());

-- community_interactions
create policy community_interactions_select_own
  on public.community_interactions
  for select using (user_id = auth.uid());

create policy community_interactions_insert_self
  on public.community_interactions
  for insert with check (user_id = auth.uid());

create policy community_interactions_update_own
  on public.community_interactions
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy community_interactions_delete_own
  on public.community_interactions
  for delete using (user_id = auth.uid());

-- content_interactions
create policy content_interactions_select_own
  on public.content_interactions
  for select using (user_id = auth.uid());

create policy content_interactions_insert_self
  on public.content_interactions
  for insert with check (user_id = auth.uid());

create policy content_interactions_update_own
  on public.content_interactions
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy content_interactions_delete_own
  on public.content_interactions
  for delete using (user_id = auth.uid());

-- domain_profiles
create policy domain_profiles_select_own
  on public.domain_profiles
  for select using (user_id = auth.uid());

create policy domain_profiles_insert_self
  on public.domain_profiles
  for insert with check (user_id = auth.uid());

create policy domain_profiles_update_own
  on public.domain_profiles
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy domain_profiles_delete_own
  on public.domain_profiles
  for delete using (user_id = auth.uid());

-- embodied_wisdom
create policy embodied_wisdom_select_own
  on public.embodied_wisdom
  for select using (user_id = auth.uid());

create policy embodied_wisdom_insert_self
  on public.embodied_wisdom
  for insert with check (user_id = auth.uid());

create policy embodied_wisdom_update_own
  on public.embodied_wisdom
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy embodied_wisdom_delete_own
  on public.embodied_wisdom
  for delete using (user_id = auth.uid());

-- integration_gates
create policy integration_gates_select_own
  on public.integration_gates
  for select using (user_id = auth.uid());

create policy integration_gates_insert_self
  on public.integration_gates
  for insert with check (user_id = auth.uid());

create policy integration_gates_update_own
  on public.integration_gates
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy integration_gates_delete_own
  on public.integration_gates
  for delete using (user_id = auth.uid());

-- integration_journeys
create policy integration_journeys_select_own
  on public.integration_journeys
  for select using (user_id = auth.uid());

create policy integration_journeys_insert_self
  on public.integration_journeys
  for insert with check (user_id = auth.uid());

create policy integration_journeys_update_own
  on public.integration_journeys
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy integration_journeys_delete_own
  on public.integration_journeys
  for delete using (user_id = auth.uid());

-- reflection_gaps
create policy reflection_gaps_select_own
  on public.reflection_gaps
  for select using (user_id = auth.uid());

create policy reflection_gaps_insert_self
  on public.reflection_gaps
  for insert with check (user_id = auth.uid());

create policy reflection_gaps_update_own
  on public.reflection_gaps
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy reflection_gaps_delete_own
  on public.reflection_gaps
  for delete using (user_id = auth.uid());

-- spiral_progress
create policy spiral_progress_select_own
  on public.spiral_progress
  for select using (user_id = auth.uid());

create policy spiral_progress_insert_self
  on public.spiral_progress
  for insert with check (user_id = auth.uid());

create policy spiral_progress_update_own
  on public.spiral_progress
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy spiral_progress_delete_own
  on public.spiral_progress
  for delete using (user_id = auth.uid());

-- spiralogic_reports
create policy spiralogic_reports_select_own
  on public.spiralogic_reports
  for select using (user_id = auth.uid());

create policy spiralogic_reports_insert_self
  on public.spiralogic_reports
  for insert with check (user_id = auth.uid());

create policy spiralogic_reports_update_own
  on public.spiralogic_reports
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy spiralogic_reports_delete_own
  on public.spiralogic_reports
  for delete using (user_id = auth.uid());

-- user_phases
create policy user_phases_select_own
  on public.user_phases
  for select using (user_id = auth.uid());

create policy user_phases_insert_self
  on public.user_phases
  for insert with check (user_id = auth.uid());

create policy user_phases_update_own
  on public.user_phases
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy user_phases_delete_own
  on public.user_phases
  for delete using (user_id = auth.uid());

-- ritual_entries
create policy ritual_entries_select_own
  on public.ritual_entries
  for select using (user_id = auth.uid());

create policy ritual_entries_insert_self
  on public.ritual_entries
  for insert with check (user_id = auth.uid());

create policy ritual_entries_update_own
  on public.ritual_entries
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy ritual_entries_delete_own
  on public.ritual_entries
  for delete using (user_id = auth.uid());

-- prompt_insight_log
create policy prompt_insight_log_select_own
  on public.prompt_insight_log
  for select using (user_id = auth.uid());

create policy prompt_insight_log_insert_self
  on public.prompt_insight_log
  for insert with check (user_id = auth.uid());

create policy prompt_insight_log_update_own
  on public.prompt_insight_log
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy prompt_insight_log_delete_own
  on public.prompt_insight_log
  for delete using (user_id = auth.uid());

-- professional_connections (multiple user_id columns)
create policy professional_connections_select_own
  on public.professional_connections
  for select using (
    user_id = auth.uid() OR 
    professional_id = auth.uid() OR 
    initiated_by = auth.uid()
  );

create policy professional_connections_insert_self
  on public.professional_connections
  for insert with check (
    user_id = auth.uid() OR 
    professional_id = auth.uid() OR 
    initiated_by = auth.uid()
  );

create policy professional_connections_update_own
  on public.professional_connections
  for update using (
    user_id = auth.uid() OR 
    professional_id = auth.uid() OR 
    initiated_by = auth.uid()
  )
  with check (
    user_id = auth.uid() OR 
    professional_id = auth.uid() OR 
    initiated_by = auth.uid()
  );

create policy professional_connections_delete_own
  on public.professional_connections
  for delete using (
    user_id = auth.uid() OR 
    professional_id = auth.uid() OR 
    initiated_by = auth.uid()
  );

-- =============================================================================
-- TEMPLATE D: Catalog / safe read-only tables
-- =============================================================================

-- elemental_patterns (pattern catalog - read by authenticated users)
create policy elemental_patterns_read_auth
  on public.elemental_patterns
  for select to authenticated
  using (true);

-- cultural_wisdom_mappings (catalog)
create policy cultural_wisdom_mappings_read_auth
  on public.cultural_wisdom_mappings
  for select to authenticated
  using (true);

-- wisdom_democratization_events (catalog)
create policy wisdom_democratization_events_read_auth
  on public.wisdom_democratization_events
  for select to authenticated
  using (true);

-- pattern_contributions (user can read all, but only create/update their own)
create policy pattern_contributions_read_auth
  on public.pattern_contributions
  for select to authenticated
  using (true);

create policy pattern_contributions_insert_own
  on public.pattern_contributions
  for insert with check (user_id = auth.uid());

create policy pattern_contributions_update_own
  on public.pattern_contributions
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy pattern_contributions_delete_own
  on public.pattern_contributions
  for delete using (user_id = auth.uid());

-- collective_observations (user can read all observations for collective insights)
create policy collective_observations_read_auth
  on public.collective_observations
  for select to authenticated
  using (true);

create policy collective_observations_insert_own
  on public.collective_observations
  for insert with check (user_id = auth.uid());

create policy collective_observations_update_own
  on public.collective_observations
  for update using (user_id = auth.uid())
          with check (user_id = auth.uid());

create policy collective_observations_delete_own
  on public.collective_observations
  for delete using (user_id = auth.uid());

-- collective_salons (public visibility for community)
create policy collective_salons_read_auth
  on public.collective_salons
  for select to authenticated
  using (true);

-- agent_learning_log (system table - read-only for authenticated)
create policy agent_learning_log_read_auth
  on public.agent_learning_log
  for select to authenticated
  using (true);

-- agent_wisdom_exchanges (system table - read-only for authenticated)
create policy agent_wisdom_exchanges_read_auth
  on public.agent_wisdom_exchanges
  for select to authenticated
  using (true);

-- platform_analytics (privacy-conscious - users can only see their own anonymized data)
create policy platform_analytics_select_own
  on public.platform_analytics
  for select using (user_hash = encode(digest(auth.uid()::text, 'sha256'), 'hex'));

-- prompt_usage_analytics (aggregate data - read-only for authenticated)
-- Note: This appears to be a view, not a table, so no RLS policy needed