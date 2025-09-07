-- ✅ Verify Maya File Ingestion Migration
SELECT
  t.tablename,
  t.tableowner as owner,
  CASE 
    WHEN c.relrowsecurity = true THEN 'enabled'
    ELSE 'disabled'
  END as rls_status,
  pg_size_pretty(pg_total_relation_size(c.oid)) as table_size
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'user_files',
    'file_chunks', 
    'file_citations',
    'ingestion_queue',
    'user_memory_updates'
  )
ORDER BY t.tablename;

-- ✅ Sanity Test: Count rows (should be 0 before uploads)
SELECT 
  'user_files' as table_name, COUNT(*) as row_count FROM user_files
UNION ALL
SELECT 
  'file_chunks' as table_name, COUNT(*) as row_count FROM file_chunks
UNION ALL
SELECT 
  'ingestion_queue' as table_name, COUNT(*) as row_count FROM ingestion_queue
UNION ALL
SELECT 
  'file_citations' as table_name, COUNT(*) as row_count FROM file_citations
UNION ALL
SELECT 
  'user_memory_updates' as table_name, COUNT(*) as row_count FROM user_memory_updates
ORDER BY table_name;