import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface RLSHealthCheck {
  status: 'healthy' | 'warning' | 'error'
  checks: {
    name: string
    status: 'pass' | 'fail' | 'skip'
    message: string
    details?: any
  }[]
  timestamp: string
  summary: {
    total_tables: number
    tables_with_rls: number
    total_policies: number
    missing_indexes: string[]
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<RLSHealthCheck>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' } as any)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const checks: RLSHealthCheck['checks'] = []
  let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy'

  try {
    // Check 1: RLS enabled on all tables
    const { data: tables, error: tablesError } = await supabase.rpc('sql', {
      query: `
        SELECT table_name, 
               CASE WHEN relrowsecurity THEN 'enabled' ELSE 'disabled' END as rls_status
        FROM information_schema.tables t
        LEFT JOIN pg_class c ON c.relname = t.table_name
        LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE t.table_schema = 'public' 
          AND t.table_type = 'BASE TABLE'
          AND n.nspname = 'public'
        ORDER BY table_name
      `
    })

    if (tablesError) throw tablesError

    const tablesWithoutRLS = tables?.filter((t: any) => t.rls_status === 'disabled') || []
    checks.push({
      name: 'RLS Coverage',
      status: tablesWithoutRLS.length === 0 ? 'pass' : 'fail',
      message: tablesWithoutRLS.length === 0 
        ? 'All tables have RLS enabled'
        : `${tablesWithoutRLS.length} tables missing RLS`,
      details: tablesWithoutRLS.map((t: any) => t.table_name)
    })

    if (tablesWithoutRLS.length > 0) overallStatus = 'error'

    // Check 2: Policy coverage
    const { data: policies, error: policiesError } = await supabase.rpc('sql', {
      query: `
        SELECT tablename, count(*) as policy_count
        FROM pg_policies 
        WHERE schemaname = 'public'
        GROUP BY tablename
        ORDER BY policy_count DESC
      `
    })

    if (policiesError) throw policiesError

    const totalPolicies = policies?.reduce((sum: number, p: any) => sum + parseInt(p.policy_count), 0) || 0
    checks.push({
      name: 'Policy Coverage',
      status: totalPolicies > 0 ? 'pass' : 'fail',
      message: `${totalPolicies} total policies across ${policies?.length || 0} tables`,
      details: policies
    })

    // Check 3: Critical indexes exist
    const { data: indexes, error: indexesError } = await supabase.rpc('sql', {
      query: `
        SELECT schemaname, tablename, indexname
        FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND indexname LIKE 'idx_%_user_id'
        ORDER BY tablename
      `
    })

    if (indexesError) throw indexesError

    const expectedIndexes = [
      'idx_user_profiles_user_id',
      'idx_bypassing_detections_user_id', 
      'idx_community_interactions_user_id',
      'idx_content_interactions_user_id'
    ]

    const existingIndexes = indexes?.map((i: any) => i.indexname) || []
    const missingIndexes = expectedIndexes.filter(idx => !existingIndexes.includes(idx))

    checks.push({
      name: 'Performance Indexes',
      status: missingIndexes.length === 0 ? 'pass' : 'warning',
      message: `${existingIndexes.length} RLS indexes found, ${missingIndexes.length} missing`,
      details: { existing: existingIndexes, missing: missingIndexes }
    })

    if (missingIndexes.length > 0 && overallStatus === 'healthy') overallStatus = 'warning'

    // Check 4: Policy consistency (no duplicate CRUD policies)
    const { data: duplicates, error: duplicatesError } = await supabase.rpc('sql', {
      query: `
        SELECT tablename, cmd, count(*) as policy_count
        FROM pg_policies 
        WHERE schemaname = 'public'
          AND policyname LIKE '%_select_own' OR policyname LIKE '%_insert_self'
        GROUP BY tablename, cmd
        HAVING count(*) > 1
        ORDER BY tablename, cmd
      `
    })

    if (duplicatesError) throw duplicatesError

    checks.push({
      name: 'Policy Consistency',
      status: (duplicates?.length || 0) === 0 ? 'pass' : 'warning',
      message: (duplicates?.length || 0) === 0 
        ? 'No duplicate policies found'
        : `${duplicates?.length} tables have duplicate policies`,
      details: duplicates
    })

    // Summary
    const summary = {
      total_tables: tables?.length || 0,
      tables_with_rls: (tables?.length || 0) - tablesWithoutRLS.length,
      total_policies: totalPolicies,
      missing_indexes: missingIndexes
    }

    const response: RLSHealthCheck = {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
      summary
    }

    res.status(200).json(response)

  } catch (error) {
    console.error('RLS health check failed:', error)
    res.status(500).json({
      status: 'error',
      checks: [{
        name: 'Health Check',
        status: 'fail',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      timestamp: new Date().toISOString(),
      summary: { total_tables: 0, tables_with_rls: 0, total_policies: 0, missing_indexes: [] }
    })
  }
}