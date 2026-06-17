ALTER TABLE public.trees
  ADD COLUMN IF NOT EXISTS image_gallery JSONB NOT NULL DEFAULT '[]'::jsonb;
