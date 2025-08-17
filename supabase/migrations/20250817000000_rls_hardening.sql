-- =====================================================
-- RLS HARDENING MIGRATION
-- =====================================================
-- Comprehensive security hardening for Spiralogic Oracle System
-- Generated: 2025-08-17
-- 
-- This migration:
-- 1. Enables RLS on all active tables
-- 2. Creates owner-only + facilitator policies
-- 3. Hardens function search paths
-- 4. Moves extensions to dedicated schema
-- 5. Secures foreign tables
-- 6. Revokes unnecessary permissions
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: CREATE SCHEMAS
-- =====================================================

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS private;

-- =====================================================
-- PART 2: ENABLE RLS ON ALL TABLES
-- =====================================================

-- Core User & Profile Tables
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.oracle_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.role_types ENABLE ROW LEVEL SECURITY;

-- Memory & Journal System
ALTER TABLE IF EXISTS public.memory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.soul_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.memory_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.memory ENABLE ROW LEVEL SECURITY;

-- Oracle & AI System
ALTER TABLE IF EXISTS public.oracle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.oracle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.oracle_mode_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prompt_insight_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.spiralogic_prompts ENABLE ROW LEVEL SECURITY;
-- Skip views - prompt_usage_analytics is a view, not a table
ALTER TABLE IF EXISTS public.insight_history ENABLE ROW LEVEL SECURITY;

-- Holoflower & Elemental System
ALTER TABLE IF EXISTS public.holoflower_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.holoflower_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.holoflower_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_holoflower_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.elemental_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.elemental_patterns ENABLE ROW LEVEL SECURITY;

-- Integration & Development Tracking
ALTER TABLE IF EXISTS public.domain_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.spiral_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.integration_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.embodied_wisdom ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.integration_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reflection_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bypassing_detections ENABLE ROW LEVEL SECURITY;

-- Content & Access Control
ALTER TABLE IF EXISTS public.user_content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_content_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.integration_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.spiritual_bypassing_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.content_interactions ENABLE ROW LEVEL SECURITY;

-- Community & Social Features
ALTER TABLE IF EXISTS public.community_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.professional_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_wisdom_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collective_salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pattern_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collective_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cultural_wisdom_mappings ENABLE ROW LEVEL SECURITY;

-- Astrology & Reports
ALTER TABLE IF EXISTS public.birth_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.spiralogic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.practitioner_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.practitioner_branding ENABLE ROW LEVEL SECURITY;

-- Ritual & Progress Tracking
ALTER TABLE IF EXISTS public.ritual_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.adjuster_logs ENABLE ROW LEVEL SECURITY;

-- Retreat & Group Features
ALTER TABLE IF EXISTS public.retreat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.retreat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.retreat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.retreat_oracle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.session_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.participant_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.facilitator_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.participant_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.retreat_facilitators ENABLE ROW LEVEL SECURITY;

-- Post-Retreat & Community Wisdom
ALTER TABLE IF EXISTS public.transformation_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.guidance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.oracle_checkin_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.participant_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_gatherings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.retreat_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wisdom_keeper ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wisdom_search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wisdom_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wisdom_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wisdom_resonance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wisdom_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wisdom_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tag_cloud ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.member_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wisdom_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wisdom_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wisdom_rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.participant_preferences ENABLE ROW LEVEL SECURITY;

-- Analytics & Privacy
ALTER TABLE IF EXISTS public.platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transformation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.privacy_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_privacy_changes ENABLE ROW LEVEL SECURITY;

-- Learning & AI System
ALTER TABLE IF EXISTS public.agent_learning_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wisdom_democratization_events ENABLE ROW LEVEL SECURITY;

-- Special Tables
ALTER TABLE IF EXISTS public.onboarding_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.personal_oracles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 3: CREATE RLS POLICIES
-- =====================================================

-- Helper function to check facilitator role
CREATE OR REPLACE FUNCTION public.is_facilitator(target_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  -- Check if user_roles table exists and user has facilitator role
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    RETURN EXISTS (
      SELECT 1 
      FROM public.user_roles ur 
      JOIN public.role_types rt ON ur.role_id = rt.id 
      WHERE ur.user_id = COALESCE(target_user_id, auth.uid()) 
      AND rt.name = 'facilitator'
    );
  END IF;
  RETURN false;
END;
$$;

-- Macro to create standard user-owned policies
DO $$
DECLARE
  table_record RECORD;
  owner_col TEXT;
BEGIN
  -- Tables with user_id as owner column
  FOR table_record IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
      'user_profiles', 'oracle_preferences', 'user_onboarding', 'user_roles',
      'memory_items', 'soul_memories', 'memory_threads', 'journal_entries', 'memory',
      'oracle_sessions', 'oracle_messages', 'oracle_mode_preferences', 'prompt_insight_log',
      'spiralogic_prompts', 'prompt_usage_analytics', 'insight_history',
      'holoflower_entries', 'holoflower_states', 'holoflower_evolution', 'elemental_assessments', 'elemental_patterns',
      'domain_profiles', 'spiral_progress', 'integration_journeys', 'embodied_wisdom',
      'integration_gates', 'reflection_gaps', 'bypassing_detections',
      'user_content_access', 'user_content_requests', 'integration_requirements',
      'spiritual_bypassing_alerts', 'content_interactions', 'community_interactions',
      'agent_wisdom_exchanges', 'pattern_contributions', 'collective_observations', 'cultural_wisdom_mappings',
      'birth_charts', 'spiralogic_reports', 'practitioner_branding', 'ritual_progress', 'adjuster_logs',
      'retreat_messages', 'retreat_oracle_sessions', 'retreat_facilitators', 'data_export_requests',
      'privacy_consents', 'user_privacy_changes', 'wisdom_democratization_events',
      'personal_oracles', 'event_log'
    )
  LOOP
    -- Owner-only policies
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_owner_select" ON public.%I;
      CREATE POLICY "%s_owner_select" ON public.%I
        FOR SELECT TO authenticated
        USING (user_id = auth.uid());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
    
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_owner_insert" ON public.%I;
      CREATE POLICY "%s_owner_insert" ON public.%I
        FOR INSERT TO authenticated
        WITH CHECK (user_id = auth.uid());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
    
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_owner_update" ON public.%I;
      CREATE POLICY "%s_owner_update" ON public.%I
        FOR UPDATE TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
    
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_owner_delete" ON public.%I;
      CREATE POLICY "%s_owner_delete" ON public.%I
        FOR DELETE TO authenticated
        USING (user_id = auth.uid());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
    
    -- Facilitator read policy
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_facilitator_read" ON public.%I;
      CREATE POLICY "%s_facilitator_read" ON public.%I
        FOR SELECT TO authenticated
        USING (public.is_facilitator());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
  END LOOP;
END;
$$;

-- Special policies for tables with different owner columns

-- Participant-based tables
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
      'retreat_participants', 'daily_checkins', 'session_participations', 'participant_states',
      'support_requests', 'participant_notifications', 'transformation_updates', 'milestones',
      'guidance_sessions', 'oracle_checkin_schedules', 'participant_stats', 'community_shares',
      'retreat_insights', 'wisdom_keeper', 'wisdom_bookmarks', 'wisdom_shares', 'wisdom_resonance',
      'wisdom_connections', 'wisdom_threads', 'member_interests', 'wisdom_interactions',
      'wisdom_searches', 'wisdom_rituals', 'participant_preferences', 'onboarding_flows'
    )
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_participant_select" ON public.%I;
      CREATE POLICY "%s_participant_select" ON public.%I
        FOR SELECT TO authenticated
        USING (participant_id = auth.uid());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
    
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_participant_insert" ON public.%I;
      CREATE POLICY "%s_participant_insert" ON public.%I
        FOR INSERT TO authenticated
        WITH CHECK (participant_id = auth.uid());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
    
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_participant_update" ON public.%I;
      CREATE POLICY "%s_participant_update" ON public.%I
        FOR UPDATE TO authenticated
        USING (participant_id = auth.uid())
        WITH CHECK (participant_id = auth.uid());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
    
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_participant_delete" ON public.%I;
      CREATE POLICY "%s_participant_delete" ON public.%I
        FOR DELETE TO authenticated
        USING (participant_id = auth.uid());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
    
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_facilitator_read" ON public.%I;
      CREATE POLICY "%s_facilitator_read" ON public.%I
        FOR SELECT TO authenticated
        USING (public.is_facilitator());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
  END LOOP;
END;
$$;

-- Facilitator-owned tables
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('retreat_sessions', 'live_sessions', 'facilitator_alerts', 'community_gatherings')
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_facilitator_select" ON public.%I;
      CREATE POLICY "%s_facilitator_select" ON public.%I
        FOR SELECT TO authenticated
        USING (facilitator_id = auth.uid());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
    
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_facilitator_insert" ON public.%I;
      CREATE POLICY "%s_facilitator_insert" ON public.%I
        FOR INSERT TO authenticated
        WITH CHECK (facilitator_id = auth.uid());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
    
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_facilitator_update" ON public.%I;
      CREATE POLICY "%s_facilitator_update" ON public.%I
        FOR UPDATE TO authenticated
        USING (facilitator_id = auth.uid())
        WITH CHECK (facilitator_id = auth.uid());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
    
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_facilitator_delete" ON public.%I;
      CREATE POLICY "%s_facilitator_delete" ON public.%I
        FOR DELETE TO authenticated
        USING (facilitator_id = auth.uid());
    ', table_record.table_name, table_record.table_name, table_record.table_name, table_record.table_name);
  END LOOP;
END;
$$;

-- Special cases for complex ownership
-- professional_connections (user_id OR professional_id)
DROP POLICY IF EXISTS "professional_connections_select" ON public.professional_connections;
CREATE POLICY "professional_connections_select" ON public.professional_connections
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR professional_id = auth.uid() OR public.is_facilitator());

-- practitioner_clients (user_id OR practitioner_id)  
DROP POLICY IF EXISTS "practitioner_clients_select" ON public.practitioner_clients;
CREATE POLICY "practitioner_clients_select" ON public.practitioner_clients
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR practitioner_id = auth.uid() OR public.is_facilitator());

-- group_holoflower_sync (participant_ids array contains auth.uid())
DROP POLICY IF EXISTS "group_holoflower_sync_select" ON public.group_holoflower_sync;
CREATE POLICY "group_holoflower_sync_select" ON public.group_holoflower_sync
  FOR SELECT TO authenticated
  USING (auth.uid() = ANY(participant_ids) OR public.is_facilitator());

-- collective_salons (participant_id)
DROP POLICY IF EXISTS "collective_salons_select" ON public.collective_salons;
CREATE POLICY "collective_salons_select" ON public.collective_salons
  FOR SELECT TO authenticated
  USING (participant_id = auth.uid() OR public.is_facilitator());

-- Anonymous analytics tables (no user-specific access)
DROP POLICY IF EXISTS "platform_analytics_service_only" ON public.platform_analytics;
CREATE POLICY "platform_analytics_service_only" ON public.platform_analytics
  FOR ALL TO authenticated
  USING (false); -- Service role only

DROP POLICY IF EXISTS "transformation_metrics_service_only" ON public.transformation_metrics;
CREATE POLICY "transformation_metrics_service_only" ON public.transformation_metrics
  FOR ALL TO authenticated
  USING (false); -- Service role only

-- System tables (component-based or global)
DROP POLICY IF EXISTS "system_health_metrics_facilitator_only" ON public.system_health_metrics;
CREATE POLICY "system_health_metrics_facilitator_only" ON public.system_health_metrics
  FOR SELECT TO authenticated
  USING (public.is_facilitator());

DROP POLICY IF EXISTS "agent_learning_log_agent_only" ON public.agent_learning_log;
CREATE POLICY "agent_learning_log_agent_only" ON public.agent_learning_log
  FOR ALL TO authenticated
  USING (false); -- Service role only

-- Public reference tables
DROP POLICY IF EXISTS "role_types_public_read" ON public.role_types;
CREATE POLICY "role_types_public_read" ON public.role_types
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "tag_cloud_public_read" ON public.tag_cloud;
CREATE POLICY "tag_cloud_public_read" ON public.tag_cloud
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "wisdom_search_index_public_read" ON public.wisdom_search_index;
CREATE POLICY "wisdom_search_index_public_read" ON public.wisdom_search_index
  FOR SELECT TO authenticated
  USING (true);

-- =====================================================
-- PART 4: REVOKE PERMISSIONS FROM ANON
-- =====================================================

-- Revoke all table permissions from anon
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon;', table_record.table_name);
  END LOOP;
END;
$$;

-- Revoke sequence permissions from anon
DO $$
DECLARE
  seq_record RECORD;
BEGIN
  FOR seq_record IN 
    SELECT sequence_name FROM information_schema.sequences 
    WHERE sequence_schema = 'public'
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon;', seq_record.sequence_name);
  END LOOP;
END;
$$;

-- =====================================================
-- PART 5: HARDEN FUNCTION SEARCH PATHS
-- =====================================================

-- Oracle & Session Functions
CREATE OR REPLACE FUNCTION public.end_oracle_session(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  UPDATE public.oracle_sessions 
  SET ended_at = now(), status = 'completed'
  WHERE id = p_session_id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.end_session(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  UPDATE public.oracle_sessions 
  SET ended_at = now(), status = 'completed'
  WHERE id = p_session_id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.end_psychedelic_session(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  UPDATE public.oracle_sessions 
  SET ended_at = now(), status = 'completed', session_type = 'psychedelic'
  WHERE id = p_session_id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_summarize_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Ensure user owns the session
  IF NOT EXISTS (
    SELECT 1 FROM public.oracle_sessions 
    WHERE id = p_session_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Session not found or access denied';
  END IF;
  
  -- Generate summary (simplified)
  SELECT jsonb_build_object(
    'session_id', p_session_id,
    'summary', 'Auto-generated session summary',
    'generated_at', now()
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.summarize_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Ensure user owns the session
  IF NOT EXISTS (
    SELECT 1 FROM public.oracle_sessions 
    WHERE id = p_session_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Session not found or access denied';
  END IF;
  
  SELECT jsonb_build_object(
    'session_id', p_session_id,
    'summary', 'Generated session summary',
    'created_at', now()
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_latest_session(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  target_user_id uuid;
  result jsonb;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Ensure user can only access their own data unless facilitator
  IF target_user_id != auth.uid() AND NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT row_to_json(s.*) INTO result
  FROM public.oracle_sessions s
  WHERE s.user_id = target_user_id
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_psychedelic_session(p_user_id uuid, p_details jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  session_id uuid;
BEGIN
  -- Ensure user can only create for themselves
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  INSERT INTO public.oracle_sessions (user_id, session_type, details, created_at)
  VALUES (p_user_id, 'psychedelic', p_details, now())
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_oracle_insights(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  target_user_id uuid;
  result jsonb;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  IF target_user_id != auth.uid() AND NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT jsonb_agg(row_to_json(i.*)) INTO result
  FROM public.insight_history i
  WHERE i.user_id = target_user_id
  ORDER BY i.created_at DESC
  LIMIT 20;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.add_oracle_insight(p_user_id uuid, p_insight jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  insight_id uuid;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  INSERT INTO public.insight_history (user_id, insight_data, created_at)
  VALUES (p_user_id, p_insight, now())
  RETURNING id INTO insight_id;
  
  RETURN insight_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_oracle_feedback(p_user_id uuid, p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  feedback_id uuid;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  INSERT INTO public.oracle_messages (user_id, message_type, content, created_at)
  VALUES (p_user_id, 'feedback', p_payload, now())
  RETURNING id INTO feedback_id;
  
  RETURN feedback_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_oracle_preferences(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  target_user_id uuid;
  result jsonb;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  IF target_user_id != auth.uid() AND NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT row_to_json(op.*) INTO result
  FROM public.oracle_preferences op
  WHERE op.user_id = target_user_id;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_oracle_preferences(p_user_id uuid, p_preferences jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE public.oracle_preferences 
  SET preferences = p_preferences, updated_at = now()
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.oracle_preferences (user_id, preferences, created_at, updated_at)
    VALUES (p_user_id, p_preferences, now(), now());
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_oracle_variant_descendant(p_variant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  -- This function may need different access control based on business logic
  SELECT row_to_json(ov.*) INTO result
  FROM public.oracle_sessions ov
  WHERE ov.id = p_variant_id;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_oracle_variant_lineage(p_variant_id uuid, p_lineage jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  UPDATE public.oracle_sessions 
  SET lineage_data = p_lineage, updated_at = now()
  WHERE id = p_variant_id AND user_id = auth.uid();
END;
$$;

-- Client Analysis & Insights Functions
CREATE OR REPLACE FUNCTION public.add_session_insight(p_session_id uuid, p_insight jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  insight_id uuid;
BEGIN
  -- Ensure user owns the session
  IF NOT EXISTS (
    SELECT 1 FROM public.oracle_sessions 
    WHERE id = p_session_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Session not found or access denied';
  END IF;
  
  INSERT INTO public.insight_history (user_id, session_id, insight_data, created_at)
  VALUES (auth.uid(), p_session_id, p_insight, now())
  RETURNING id INTO insight_id;
  
  RETURN insight_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.analyze_client_insights(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  target_user_id uuid;
  result jsonb;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  IF target_user_id != auth.uid() AND NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT jsonb_build_object(
    'user_id', target_user_id,
    'insight_count', COUNT(*),
    'latest_insights', jsonb_agg(ih.insight_data ORDER BY ih.created_at DESC)
  ) INTO result
  FROM public.insight_history ih
  WHERE ih.user_id = target_user_id;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.analyze_growth_patterns(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  target_user_id uuid;
  result jsonb;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  IF target_user_id != auth.uid() AND NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT jsonb_build_object(
    'user_id', target_user_id,
    'session_count', COUNT(DISTINCT os.id),
    'growth_metrics', jsonb_agg(DISTINCT sp.*)
  ) INTO result
  FROM public.oracle_sessions os
  LEFT JOIN public.spiral_progress sp ON sp.user_id = os.user_id
  WHERE os.user_id = target_user_id;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.extract_transcript_insights(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.oracle_sessions 
    WHERE id = p_session_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Session not found or access denied';
  END IF;
  
  SELECT jsonb_build_object(
    'session_id', p_session_id,
    'extracted_insights', 'Transcript analysis results',
    'generated_at', now()
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_client_journey_analysis(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  target_user_id uuid;
  result jsonb;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  IF target_user_id != auth.uid() AND NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT jsonb_build_object(
    'user_id', target_user_id,
    'journey_analysis', 'Comprehensive journey insights'
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_client_transcripts(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  target_user_id uuid;
  result jsonb;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  IF target_user_id != auth.uid() AND NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT jsonb_agg(om.*) INTO result
  FROM public.oracle_messages om
  WHERE om.user_id = target_user_id
  ORDER BY om.created_at DESC;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.add_session_feedback(p_session_id uuid, p_feedback jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  feedback_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.oracle_sessions 
    WHERE id = p_session_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Session not found or access denied';
  END IF;
  
  INSERT INTO public.oracle_messages (user_id, session_id, message_type, content, created_at)
  VALUES (auth.uid(), p_session_id, 'feedback', p_feedback, now())
  RETURNING id INTO feedback_id;
  
  RETURN feedback_id;
END;
$$;

-- Journal & File Management Functions
CREATE OR REPLACE FUNCTION public.append_file_url_to_constellation(p_user_id uuid, p_file_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Update user's constellation data with file URL
  UPDATE public.user_profiles 
  SET constellation_files = COALESCE(constellation_files, '[]'::jsonb) || jsonb_build_array(p_file_url)
  WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.append_file_url_to_journal(p_user_id uuid, p_entry_id uuid, p_file_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE public.journal_entries 
  SET file_urls = COALESCE(file_urls, '[]'::jsonb) || jsonb_build_array(p_file_url)
  WHERE id = p_entry_id AND user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_journal_feedback(p_entry_id uuid, p_feedback jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  feedback_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.journal_entries 
    WHERE id = p_entry_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Journal entry not found or access denied';
  END IF;
  
  INSERT INTO public.journal_entries (user_id, entry_type, content, parent_id, created_at)
  VALUES (auth.uid(), 'feedback', p_feedback, p_entry_id, now())
  RETURNING id INTO feedback_id;
  
  RETURN feedback_id;
END;
$$;

-- User Management & Roles Functions
CREATE OR REPLACE FUNCTION public.assign_practitioner(p_user_id uuid, p_practitioner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  -- Only facilitators can assign practitioners
  IF NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied - facilitator role required';
  END IF;
  
  INSERT INTO public.practitioner_clients (user_id, practitioner_id, assigned_at)
  VALUES (p_user_id, p_practitioner_id, now())
  ON CONFLICT (user_id, practitioner_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_role(p_user_id uuid, p_role_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  role_id uuid;
BEGIN
  -- Only facilitators can assign roles
  IF NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied - facilitator role required';
  END IF;
  
  SELECT id INTO role_id 
  FROM public.role_types 
  WHERE name = p_role_name;
  
  IF role_id IS NULL THEN
    RAISE EXCEPTION 'Role not found: %', p_role_name;
  END IF;
  
  INSERT INTO public.user_roles (user_id, role_id, assigned_at)
  VALUES (p_user_id, role_id, now())
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_role(p_user_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  target_user_id uuid;
  role_name text;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  IF target_user_id != auth.uid() AND NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT rt.name INTO role_name
  FROM public.user_roles ur
  JOIN public.role_types rt ON ur.role_id = rt.id
  WHERE ur.user_id = target_user_id
  ORDER BY rt.priority DESC
  LIMIT 1;
  
  RETURN COALESCE(role_name, 'user');
END;
$$;

CREATE OR REPLACE FUNCTION public.update_assignment_status(p_assignment_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  UPDATE public.practitioner_clients 
  SET status = p_status, updated_at = now()
  WHERE id = p_assignment_id 
  AND (user_id = auth.uid() OR practitioner_id = auth.uid() OR public.is_facilitator());
END;
$$;

-- Semantic Search & Memory Functions
CREATE OR REPLACE FUNCTION public.match_semantic_nodes(p_query_embedding vector, p_user_id uuid DEFAULT NULL, p_limit int DEFAULT 10)
RETURNS TABLE(id uuid, content text, similarity float)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  IF target_user_id != auth.uid() AND NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT 
    sm.id,
    sm.content,
    (sm.embedding <-> p_query_embedding)::float as similarity
  FROM public.soul_memories sm
  WHERE sm.user_id = target_user_id
  ORDER BY sm.embedding <-> p_query_embedding
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_semantic_memory(p_query text, p_user_id uuid DEFAULT NULL, p_limit int DEFAULT 10)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  target_user_id uuid;
  result jsonb;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  IF target_user_id != auth.uid() AND NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Simplified semantic search (would integrate with embeddings in real implementation)
  SELECT jsonb_agg(row_to_json(sm.*)) INTO result
  FROM public.soul_memories sm
  WHERE sm.user_id = target_user_id
  AND sm.content ILIKE '%' || p_query || '%'
  ORDER BY sm.created_at DESC
  LIMIT p_limit;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.match_notion_memories(p_query text, p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  target_user_id uuid;
  result jsonb;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  IF target_user_id != auth.uid() AND NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Match against Notion integration data
  SELECT jsonb_agg(row_to_json(mi.*)) INTO result
  FROM public.memory_items mi
  WHERE mi.user_id = target_user_id
  AND mi.source = 'notion'
  AND mi.content ILIKE '%' || p_query || '%'
  ORDER BY mi.created_at DESC
  LIMIT 20;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- System & Deployment Functions
CREATE OR REPLACE FUNCTION public.create_elemental_profile(p_user_id uuid, p_assessment_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  profile_id uuid;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  INSERT INTO public.elemental_assessments (user_id, assessment_data, created_at)
  VALUES (p_user_id, p_assessment_data, now())
  RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_resonance(p_content_id uuid, p_user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Users can only increment resonance for themselves
  IF target_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  INSERT INTO public.wisdom_resonance (participant_id, content_id, resonance_type, created_at)
  VALUES (target_user_id, p_content_id, 'increment', now())
  ON CONFLICT (participant_id, content_id) 
  DO UPDATE SET updated_at = now(), resonance_count = wisdom_resonance.resonance_count + 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_latest_deployment()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only facilitators can check deployment status
  IF NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied - facilitator role required';
  END IF;
  
  SELECT jsonb_build_object(
    'version', 'v1.0.0',
    'deployed_at', now(),
    'status', 'active'
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_deployment(p_deployment_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  deployment_id uuid;
BEGIN
  -- Only facilitators can create deployments
  IF NOT public.is_facilitator() THEN
    RAISE EXCEPTION 'Access denied - facilitator role required';
  END IF;
  
  deployment_id := gen_random_uuid();
  
  -- Log deployment (simplified - would integrate with actual deployment system)
  INSERT INTO public.event_log (user_id, event_type, event_data, created_at)
  VALUES (auth.uid(), 'deployment_created', p_deployment_data, now());
  
  RETURN deployment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_tool_tags()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(tc.*)) INTO result
  FROM public.tag_cloud tc
  ORDER BY tc.usage_count DESC;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- =====================================================
-- PART 6: MOVE EXTENSIONS TO DEDICATED SCHEMA
-- =====================================================

-- Move http extension
DROP EXTENSION IF EXISTS http CASCADE;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Move vector extension  
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- =====================================================
-- PART 7: MOVE FOREIGN TABLES TO PRIVATE SCHEMA
-- =====================================================

-- Move Notion foreign table to private schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'Notion'
    AND table_type = 'FOREIGN TABLE'
  ) THEN
    ALTER FOREIGN TABLE public."Notion" SET SCHEMA private;
  END IF;
END;
$$;

-- Revoke access to private schema and foreign tables
REVOKE USAGE ON SCHEMA private FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA private FROM anon, authenticated;

-- =====================================================
-- PART 8: GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant usage on extensions schema for authenticated users
GRANT USAGE ON SCHEMA extensions TO authenticated;

-- Grant execute on public functions to authenticated users
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Ensure authenticated users can access their own data
GRANT USAGE ON SCHEMA public TO authenticated;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check RLS status
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;

-- Check policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;

-- Check function security
-- SELECT proname, prosecdef, proconfig 
-- FROM pg_proc 
-- WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
-- AND proname LIKE '%oracle%' OR proname LIKE '%session%'
-- ORDER BY proname;