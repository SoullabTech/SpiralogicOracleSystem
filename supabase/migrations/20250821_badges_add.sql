-- Add new badges for multi-modal upload features
-- Visionary: Upload and process an image
-- Scholar: Process a document (PDF)

insert into beta_badges (code, name, description, category, emoji, rarity)
values
  ('visionary', 'Visionary', 'Uploaded and processed an image', 'exploration', '🎨', 'common'),
  ('scholar', 'Scholar', 'Processed a document (PDF)', 'insight', '📝', 'common')
on conflict (code) do nothing;

-- Update existing badges that might relate to uploads
update beta_badges 
set description = 'Uploaded 3+ files of different types'
where code = 'archivist';

update beta_badges
set description = 'Referenced uploads in conversation with Oracle'
where code = 'insight_diver';

-- Create view for upload-based badge progress
create or replace view v_upload_badge_progress as
select 
  u.user_id,
  count(*) filter (where u.file_type like 'image/%') as image_uploads,
  count(*) filter (where u.file_type = 'application/pdf') as pdf_uploads,
  count(*) filter (where u.file_type like 'audio/%' or u.file_type like 'video/%') as audio_uploads,
  count(distinct u.file_type) as unique_file_types,
  count(*) as total_uploads,
  max(u.created_at) as last_upload
from uploads u
where u.status = 'ready'
group by u.user_id;