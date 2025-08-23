-- Enhance existing dreams table to match the full schema
-- Handle this step by step to avoid issues

-- 1) Add new columns first
ALTER TABLE public.dreams 
  ADD COLUMN IF NOT EXISTS night_date date,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS segments jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS quote text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS techniques jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS sleep_window tstzrange,
  ADD COLUMN IF NOT EXISTS lucidity_peak int,
  ADD COLUMN IF NOT EXISTS recall_quality int,
  ADD COLUMN IF NOT EXISTS recap_buckets jsonb,
  ADD COLUMN IF NOT EXISTS weaved_from uuid[],
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 2) Migrate existing data - convert content to first segment
UPDATE public.dreams 
SET segments = jsonb_build_array(
  jsonb_build_object(
    'text', content,
    'label', 'Legacy Entry',
    'tags', CASE WHEN tag IS NOT NULL THEN ARRAY[tag] ELSE ARRAY[]::text[] END
  )
),
tags = CASE WHEN tag IS NOT NULL THEN ARRAY[tag] ELSE ARRAY[]::text[] END,
night_date = created_at::date
WHERE segments = '[]';

-- 3) Add constraints (without IF NOT EXISTS for now)
ALTER TABLE public.dreams
  ADD CONSTRAINT dreams_lucidity_peak_range CHECK (lucidity_peak BETWEEN 0 AND 10),
  ADD CONSTRAINT dreams_recall_quality_range CHECK (recall_quality BETWEEN 0 AND 10);

-- 4) Add indexes
CREATE INDEX IF NOT EXISTS dreams_user_date_idx ON public.dreams (user_id, night_date DESC);
CREATE INDEX IF NOT EXISTS dreams_tags_gin_idx ON public.dreams USING gin (tags);
CREATE INDEX IF NOT EXISTS dreams_segments_gin_idx ON public.dreams USING gin (segments jsonb_path_ops);
CREATE INDEX IF NOT EXISTS dreams_techniques_gin_idx ON public.dreams USING gin (techniques jsonb_path_ops);

-- 5) Add trigger function and trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS dreams_set_updated_at ON public.dreams;
CREATE TRIGGER dreams_set_updated_at
BEFORE UPDATE ON public.dreams
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6) Add comments
COMMENT ON TABLE public.dreams IS 'Nightly dream journals with timeline segments and techniques.';
COMMENT ON COLUMN public.dreams.segments IS 'Array of timeline entries. Each entry can include time markers, text, lucidity/emotion ratings, and tags.';
COMMENT ON COLUMN public.dreams.techniques IS 'Capture supplements & practices e.g. galantamine, WBTB, MILD, etc.';
COMMENT ON COLUMN public.dreams.recap_buckets IS 'Server-generated recap mapped to Themes/Emotions/Steps/Ideas/Energy.';