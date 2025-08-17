-- Minimal anon-safe health RPC: returns 'ok'
create or replace function public.health_check()
returns text
language sql
security definer
as $fn$
  select 'ok'::text;
$fn$;

revoke all on function public.health_check() from public;
grant execute on function public.health_check() to anon;

-- Optional richer health (DISABLED by default)
-- Uncomment only if you want Beta Gate to verify a harmless table count.
-- Requires an authenticated token (e.g., BOT_JWT) and a safe public table.
/*
create or replace function public.health_status()
returns jsonb
language plpgsql
security definer
as $fn$
declare _count bigint;
begin
  -- Replace with a harmless reference table you're OK to reveal count for:
  select count(*) into _count from public.my_public_table;
  return jsonb_build_object(
    'status','ok',
    'ts', now() at time zone 'utc',
    'table_count', _count
  );
end;
$fn$;

revoke all on function public.health_status() from public;
grant execute on function public.health_status() to authenticated;
*/