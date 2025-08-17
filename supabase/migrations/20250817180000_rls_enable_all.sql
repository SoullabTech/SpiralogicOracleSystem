-- Enable RLS on all public base tables (idempotent)
-- Safe to run repeatedly

do $$
declare r record;
begin
  for r in
    select table_name
    from information_schema.tables
    where table_schema='public' and table_type='BASE TABLE'
  loop
    execute format('alter table public.%I enable row level security;', r.table_name);
  end loop;
end $$;