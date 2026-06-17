-- 방문 사진 Storage 버킷 및 RLS 정책
-- Supabase SQL Editor에서 migration 적용 후 실행

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'visit-photos',
  'visit-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "visit_photos_storage_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "visit_photos_storage_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "visit_photos_storage_delete_own" ON storage.objects;

-- 본인 폴더(user_id)에만 업로드
CREATE POLICY "visit_photos_storage_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'visit-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 공개 버킷이지만 읽기는 로그인 사용자만 (선택적 보안)
CREATE POLICY "visit_photos_storage_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'visit-photos');

-- 본인 사진만 삭제
CREATE POLICY "visit_photos_storage_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'visit-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
