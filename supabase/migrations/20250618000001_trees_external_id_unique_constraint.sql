-- ON CONFLICT(upsert)가 동작하려면 UNIQUE 제약이 필요합니다.
-- (부분 UNIQUE INDEX만으로는 PostgREST upsert가 실패할 수 있음)

DROP INDEX IF EXISTS public.idx_trees_external_id;

ALTER TABLE public.trees
  DROP CONSTRAINT IF EXISTS trees_external_id_key;

ALTER TABLE public.trees
  ADD CONSTRAINT trees_external_id_key UNIQUE (external_id);
