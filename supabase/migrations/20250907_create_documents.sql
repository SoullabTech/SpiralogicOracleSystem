-- Sacred Documents Table
-- Stores all user-uploaded assets with elemental resonance tracking

-- Create documents table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  filename text not null,
  type text check (type in ('text', 'audio', 'video', 'image', 'document')) not null,
  mime_type text,
  status text check (status in ('pending', 'processing', 'processed', 'failed')) default 'pending',
  size_bytes bigint,
  storage_path text not null,
  preview_path text, -- Path to generated preview (waveform, thumbnail, etc.)
  
  -- Sacred metadata
  resonance jsonb default '{}', -- {elements: ['fire', 'water'], coherence: 0.85, frequency: 528}
  extracted_text text, -- For searchability
  duration_seconds numeric, -- For audio/video
  dimensions jsonb, -- {width: 1920, height: 1080} for images/video
  
  -- Session linkage
  session_id uuid references public.sessions(id) on delete set null,
  
  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  processed_at timestamptz
);

-- Indexes for performance
create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists documents_type_idx on public.documents(type);
create index if not exists documents_status_idx on public.documents(status);
create index if not exists documents_session_id_idx on public.documents(session_id);
create index if not exists documents_created_at_idx on public.documents(created_at desc);

-- GIN index for JSONB resonance queries
create index if not exists documents_resonance_idx on public.documents using gin(resonance);

-- Full text search on extracted text
create index if not exists documents_text_search_idx on public.documents using gin(to_tsvector('english', coalesce(extracted_text, '') || ' ' || coalesce(filename, '')));

-- RLS: Row-level security
alter table public.documents enable row level security;

-- Users can view their own documents
create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = user_id);

-- Users can insert their own documents
create policy "Users can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

-- Users can update their own documents
create policy "Users can update their own documents"
  on public.documents for update
  using (auth.uid() = user_id);

-- Users can delete their own documents
create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function public.update_documents_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_documents_updated_at
  before update on public.documents
  for each row
  execute function public.update_documents_updated_at();

-- Storage bucket for documents (if not exists)
insert into storage.buckets (id, name, public, avif_autodetection, allowed_mime_types)
values (
  'sacred-documents',
  'sacred-documents', 
  false,
  false,
  array[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/flac',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]::text[]
)
on conflict (id) do nothing;

-- Storage policies for documents bucket
create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'sacred-documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view their own documents"
  on storage.objects for select
  using (
    bucket_id = 'sacred-documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own documents"
  on storage.objects for update
  using (
    bucket_id = 'sacred-documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own documents"
  on storage.objects for delete
  using (
    bucket_id = 'sacred-documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to calculate elemental resonance from content
create or replace function public.calculate_document_resonance(
  p_filename text,
  p_type text,
  p_extracted_text text default null
)
returns jsonb as $$
declare
  v_resonance jsonb;
  v_elements text[];
  v_coherence numeric;
begin
  v_elements := array[]::text[];
  v_coherence := 0.5; -- Base coherence
  
  -- Analyze filename and content for elemental patterns
  if p_filename ilike '%fire%' or p_filename ilike '%flame%' or p_filename ilike '%heat%' 
     or p_extracted_text ilike '%passion%' or p_extracted_text ilike '%energy%' then
    v_elements := array_append(v_elements, 'fire');
    v_coherence := v_coherence + 0.1;
  end if;
  
  if p_filename ilike '%water%' or p_filename ilike '%flow%' or p_filename ilike '%ocean%'
     or p_extracted_text ilike '%emotion%' or p_extracted_text ilike '%intuition%' then
    v_elements := array_append(v_elements, 'water');
    v_coherence := v_coherence + 0.1;
  end if;
  
  if p_filename ilike '%earth%' or p_filename ilike '%ground%' or p_filename ilike '%nature%'
     or p_extracted_text ilike '%stability%' or p_extracted_text ilike '%foundation%' then
    v_elements := array_append(v_elements, 'earth');
    v_coherence := v_coherence + 0.1;
  end if;
  
  if p_filename ilike '%air%' or p_filename ilike '%wind%' or p_filename ilike '%breath%'
     or p_extracted_text ilike '%thought%' or p_extracted_text ilike '%communication%' then
    v_elements := array_append(v_elements, 'air');
    v_coherence := v_coherence + 0.1;
  end if;
  
  -- Check for sacred frequencies in filename
  if p_filename ~ '\d{3}Hz' then
    v_elements := array_append(v_elements, 'aether');
    v_coherence := least(v_coherence + 0.2, 1.0);
    
    -- Extract frequency
    v_resonance := jsonb_build_object(
      'frequency', (regexp_match(p_filename, '(\d{3})Hz'))[1]::int
    );
  else
    v_resonance := '{}'::jsonb;
  end if;
  
  -- Special boost for sacred terms
  if p_filename ilike '%sacred%' or p_filename ilike '%holoflower%' or p_filename ilike '%divine%' then
    v_coherence := least(v_coherence + 0.15, 1.0);
    if not ('aether' = any(v_elements)) then
      v_elements := array_append(v_elements, 'aether');
    end if;
  end if;
  
  -- Default to air element if no elements detected
  if array_length(v_elements, 1) is null then
    v_elements := array['air'];
  end if;
  
  -- Build final resonance object
  v_resonance := v_resonance || jsonb_build_object(
    'elements', v_elements,
    'coherence', v_coherence
  );
  
  return v_resonance;
end;
$$ language plpgsql;

-- Comment on table and columns for documentation
comment on table public.documents is 'Sacred document storage with elemental resonance tracking';
comment on column public.documents.resonance is 'JSONB metadata containing elemental alignment, coherence score, and sacred frequencies';
comment on column public.documents.preview_path is 'Path to auto-generated preview (waveform for audio, thumbnail for video/image)';
comment on column public.documents.session_id is 'Links document to a specific oracle session for timeline integration';