-- RLS Policy Templates
-- Use these patterns for different relationship types

/*
=== TEMPLATE A: Direct owner on the row (uuid) ===
Use when the table has user_id uuid (or owner_id uuid).

create policy {table}_select_own
  on public.{table}
  for select using ({owner_col} = auth.uid());

create policy {table}_insert_self
  on public.{table}
  for insert with check ({owner_col} = auth.uid());

create policy {table}_update_own
  on public.{table}
  for update using ({owner_col} = auth.uid())
          with check ({owner_col} = auth.uid());

create policy {table}_delete_own
  on public.{table}
  for delete using ({owner_col} = auth.uid());

-- If the owner column is text/varchar: use auth.uid()::text
*/

/*
=== TEMPLATE B: Owned via user_profiles (FK like profile_id) ===
Pattern for tables that reference user_profiles.

create policy {table}_via_profile_select
  on public.{table}
  for select using (
    exists (
      select 1 from public.user_profiles up
      where up.id = {table}.profile_id
        and up.user_id = auth.uid()
    )
  );

create policy {table}_via_profile_insert
  on public.{table}
  for insert with check (
    exists (
      select 1 from public.user_profiles up
      where up.id = {table}.profile_id
        and up.user_id = auth.uid()
    )
  );

create policy {table}_via_profile_update
  on public.{table}
  for update using (
    exists (
      select 1 from public.user_profiles up
      where up.id = {table}.profile_id
        and up.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_profiles up
      where up.id = {table}.profile_id
        and up.user_id = auth.uid()
    )
  );

create policy {table}_via_profile_delete
  on public.{table}
  for delete using (
    exists (
      select 1 from public.user_profiles up
      where up.id = {table}.profile_id
        and up.user_id = auth.uid()
    )
  );
*/

/*
=== TEMPLATE C: Owned via a parent row (join up one level) ===
Use when your table references a parent that itself ties to a profile or user_id.
Example: content_interactions.integration_journey_id → integration_journeys(id) → user_profiles(user_id)

create policy {child}_via_parent_select
  on public.{child}
  for select using (
    exists (
      select 1
      from public.{parent} p
      join public.user_profiles up on up.id = p.profile_id
      where p.id = {child}.{parent_fk}
        and up.user_id = auth.uid()
    )
  );

create policy {child}_via_parent_insert
  on public.{child}
  for insert with check (
    exists (
      select 1
      from public.{parent} p
      join public.user_profiles up on up.id = p.profile_id
      where p.id = {child}.{parent_fk}
        and up.user_id = auth.uid()
    )
  );

create policy {child}_via_parent_update
  on public.{child}
  for update using (
    exists (
      select 1
      from public.{parent} p
      join public.user_profiles up on up.id = p.profile_id
      where p.id = {child}.{parent_fk}
        and up.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.{parent} p
      join public.user_profiles up on up.id = p.profile_id
      where p.id = {child}.{parent_fk}
        and up.user_id = auth.uid()
    )
  );

create policy {child}_via_parent_delete
  on public.{child}
  for delete using (
    exists (
      select 1
      from public.{parent} p
      join public.user_profiles up on up.id = p.profile_id
      where p.id = {child}.{parent_fk}
        and up.user_id = auth.uid()
    )
  );
*/

/*
=== TEMPLATE D: Catalog / safe read-only (e.g., elemental_patterns) ===

create policy {table}_read_auth
  on public.{table}
  for select to authenticated
  using (true);
-- no write policies; service role handles writes
*/

/*
=== TEMPLATE E: Facilitator overlay (optional) ===
Lets a facilitator see a client's rows where an assignment exists.

create policy {table}_facilitator_read
  on public.{table}
  for select to authenticated
  using (
    exists (
      select 1
      from public.practitioner_assignments pa
      where pa.user_id = auth.uid() -- facilitator
        and pa.client_profile_id = {table}.profile_id
    )
  );

-- Add alongside the owner policies; Postgres OR's them
*/