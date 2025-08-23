-- Enable RLS
alter table dreams enable row level security;

-- Policy: Users can only see their own dreams
create policy "Users can view own dreams"
  on dreams for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own dreams
create policy "Users can insert own dreams"
  on dreams for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own dreams
create policy "Users can update own dreams"
  on dreams for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own dreams
create policy "Users can delete own dreams"
  on dreams for delete
  using (auth.uid() = user_id);