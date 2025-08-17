-- RLS Verification Queries
-- Run these to verify your RLS setup

-- 1. Check which tables still need RLS enabled
select relname as table_missing_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname='public' and relkind='r' and not relrowsecurity
order by 1;

-- 2. See which tables reference user_profiles (should use Template A policies)
select tc.table_name, kcu.column_name as fk_column
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
where tc.table_schema='public'
  and tc.constraint_type='FOREIGN KEY'
  and tc.constraint_name in (
    select constraint_name
    from information_schema.constraint_column_usage
    where table_schema='public' and table_name='user_profiles'
  )
order by 1,2;

-- 3. List all RLS policies created
select schemaname, tablename, policyname, roles, cmd, qual
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 4. Count policies per table
select tablename, count(*) as policy_count
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;

-- 5. Tables with RLS enabled but no policies (potential gaps)
select c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' 
  and c.relkind = 'r'
  and c.relrowsecurity = true
  and c.relname not in (
    select distinct tablename
    from pg_policies
    where schemaname = 'public'
  )
order by c.relname;