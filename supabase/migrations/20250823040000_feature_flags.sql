-- Create feature flags table for production-grade flag management
-- Migration: 20250823040000_feature_flags.sql

create table if not exists feature_flags (
  key text primary key,
  value jsonb not null default '{}'::jsonb,  -- {enabled:boolean, percentage:number, allowEmails:[], denyEmails:[]}
  updated_by uuid not null default auth.uid(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table feature_flags enable row level security;

-- Admin-only read/write policy
-- Note: Replace this with your actual admin check logic
create policy "admins can read write flags"
on feature_flags for all
using ( 
  exists (
    select 1 from auth.users u 
    where u.id = auth.uid() 
    and (
      u.email = any(string_to_array(coalesce(current_setting('app.admin_emails', true),''),',')) 
      or u.email in ('andreandnezat@gmail.com') -- fallback admin
    )
  )
)
with check ( 
  exists (
    select 1 from auth.users u 
    where u.id = auth.uid() 
    and (
      u.email = any(string_to_array(coalesce(current_setting('app.admin_emails', true),''),','))
      or u.email in ('andreandnezat@gmail.com') -- fallback admin
    )
  )
);

-- Create index for faster lookups
create index if not exists idx_feature_flags_key on feature_flags (key);
create index if not exists idx_feature_flags_updated_at on feature_flags (updated_at desc);

-- Create audit log function
create or replace function feature_flags_audit()
returns trigger as $$
begin
  insert into public.admin_audit_log (
    table_name, 
    operation, 
    row_id, 
    old_values, 
    new_values, 
    user_id
  ) values (
    'feature_flags',
    TG_OP,
    coalesce(NEW.key, OLD.key),
    case when TG_OP = 'DELETE' then to_jsonb(OLD) else null end,
    case when TG_OP = 'INSERT' or TG_OP = 'UPDATE' then to_jsonb(NEW) else null end,
    auth.uid()
  );
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

-- Create audit log table if it doesn't exist
create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  operation text not null,
  row_id text not null,
  old_values jsonb,
  new_values jsonb,
  user_id uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

-- Enable RLS on audit log
alter table admin_audit_log enable row level security;

-- Admin-only read policy for audit log
create policy "admins can read audit log"
on admin_audit_log for select
using ( 
  exists (
    select 1 from auth.users u 
    where u.id = auth.uid() 
    and (
      u.email = any(string_to_array(coalesce(current_setting('app.admin_emails', true),''),','))
      or u.email in ('andreandnezat@gmail.com') -- fallback admin
    )
  )
);

-- Create audit trigger
drop trigger if exists feature_flags_audit_trigger on feature_flags;
create trigger feature_flags_audit_trigger
  after insert or update or delete on feature_flags
  for each row execute function feature_flags_audit();

-- Create indexes for audit log
create index if not exists idx_admin_audit_log_table_name on admin_audit_log (table_name);
create index if not exists idx_admin_audit_log_created_at on admin_audit_log (created_at desc);
create index if not exists idx_admin_audit_log_user_id on admin_audit_log (user_id);