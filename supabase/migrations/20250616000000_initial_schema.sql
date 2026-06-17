-- ============================================================
-- 세월을 품은 나무들 — 초기 스키마
-- Supabase SQL Editor 또는 CLI migration으로 실행
-- ============================================================

-- 1) ENUM 타입
CREATE TYPE public.tree_type AS ENUM (
  'natural_monument',
  'protected_tree'
);

-- 2) 사용자 프로필
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) 나무 마스터
CREATE TABLE public.trees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            public.tree_type NOT NULL,
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,
  address         TEXT,
  region          TEXT NOT NULL,
  district        TEXT,
  designation_no  TEXT,
  summary         TEXT,
  description     TEXT,
  legend          TEXT,
  image_url       TEXT,
  stamp_radius_m  INTEGER NOT NULL DEFAULT 50,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT trees_lat_range CHECK (latitude  BETWEEN 33.0 AND 39.5),
  CONSTRAINT trees_lng_range CHECK (longitude BETWEEN 124.0 AND 132.5)
);

CREATE INDEX idx_trees_type     ON public.trees(type);
CREATE INDEX idx_trees_region   ON public.trees(region);
CREATE INDEX idx_trees_location ON public.trees(latitude, longitude);
CREATE INDEX idx_trees_active   ON public.trees(is_active) WHERE is_active = true;

-- 4) 방문 인증 + 리뷰
CREATE TABLE public.visits (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tree_id          UUID NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  visited_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  rating           SMALLINT CHECK (rating BETWEEN 1 AND 5),
  memo             TEXT,
  is_auto_stamped  BOOLEAN NOT NULL DEFAULT false,
  stamp_latitude   DOUBLE PRECISION,
  stamp_longitude  DOUBLE PRECISION,
  distance_m       DOUBLE PRECISION,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_visits_unique_daily_stamp
  ON public.visits (user_id, tree_id, ((visited_at AT TIME ZONE 'Asia/Seoul')::date));

CREATE INDEX idx_visits_user_visited_at ON public.visits(user_id, visited_at DESC);
CREATE INDEX idx_visits_user_rating     ON public.visits(user_id, rating DESC NULLS LAST);
CREATE INDEX idx_visits_tree_id         ON public.visits(tree_id);

-- 5) 방문 사진 메타데이터
CREATE TABLE public.visit_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id      UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  public_url    TEXT,
  sort_order    SMALLINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_visit_photos_visit_id ON public.visit_photos(visit_id);

-- 6) updated_at 트리거
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_trees_updated_at
  BEFORE UPDATE ON public.trees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_visits_updated_at
  BEFORE UPDATE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7) 신규 가입 시 profiles 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', '나무 탐방가'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8) RLS
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trees         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_photos  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trees_select_public"
  ON public.trees FOR SELECT USING (is_active = true);

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "visits_select_own"
  ON public.visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "visits_insert_own"
  ON public.visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "visits_update_own"
  ON public.visits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "visits_delete_own"
  ON public.visits FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "visit_photos_select_own"
  ON public.visit_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "visit_photos_insert_own"
  ON public.visit_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "visit_photos_delete_own"
  ON public.visit_photos FOR DELETE USING (auth.uid() = user_id);

-- 9) 라이브러리 뷰
CREATE OR REPLACE VIEW public.my_library AS
SELECT
  v.id              AS visit_id,
  v.user_id,
  v.tree_id,
  t.name            AS tree_name,
  t.type            AS tree_type,
  t.region,
  t.district,
  t.image_url       AS tree_image_url,
  v.visited_at,
  v.rating,
  v.memo,
  v.is_auto_stamped,
  COUNT(vp.id)      AS photo_count
FROM public.visits v
JOIN public.trees t ON t.id = v.tree_id
LEFT JOIN public.visit_photos vp ON vp.visit_id = v.id
GROUP BY v.id, t.id;

ALTER VIEW public.my_library SET (security_invoker = true);
