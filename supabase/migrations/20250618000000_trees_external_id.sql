-- 나무 데이터 임포트용 외부 ID (문화재청·공공데이터 연동)
ALTER TABLE public.trees
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS external_id TEXT;

-- upsert(onConflict)용 UNIQUE 제약 (NULL은 여러 개 허용)
ALTER TABLE public.trees
  DROP CONSTRAINT IF EXISTS trees_external_id_key;

ALTER TABLE public.trees
  ADD CONSTRAINT trees_external_id_key UNIQUE (external_id);

CREATE INDEX IF NOT EXISTS idx_trees_source ON public.trees(source);
