"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  VISIT_PHOTOS_BUCKET,
  buildPhotoStoragePath,
  getExtensionFromFile,
  MAX_PHOTOS_PER_VISIT,
  validatePhotoFile,
} from "@/lib/storage/visit-photos";
import type { VisitPhoto } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface VisitPhotosSectionProps {
  visitId: string;
  initialPhotos: VisitPhoto[];
}

export function VisitPhotosSection({
  visitId,
  initialPhotos,
}: VisitPhotosSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [status, setStatus] = useState<"idle" | "uploading" | "deleting">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const canUploadMore = photos.length < MAX_PHOTOS_PER_VISIT;

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    const validationError = validatePhotoFile(file);
    if (validationError) {
      setMessage(validationError);
      setIsError(true);
      return;
    }

    if (!canUploadMore) {
      setMessage(`사진은 방문당 최대 ${MAX_PHOTOS_PER_VISIT}장까지 올릴 수 있습니다.`);
      setIsError(true);
      return;
    }

    setStatus("uploading");
    setMessage("");
    setIsError(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("idle");
      setMessage("로그인이 필요합니다.");
      setIsError(true);
      return;
    }

    const extension = getExtensionFromFile(file);
    if (!extension) {
      setStatus("idle");
      setMessage("지원하지 않는 사진 형식입니다.");
      setIsError(true);
      return;
    }

    const storagePath = buildPhotoStoragePath(user.id, visitId, extension);

    const { error: uploadError } = await supabase.storage
      .from(VISIT_PHOTOS_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setStatus("idle");
      setMessage(
        uploadError.message.includes("Bucket not found")
          ? "Storage 버킷이 없습니다. Supabase에서 visit-photos 버킷을 생성해 주세요."
          : "사진 업로드에 실패했습니다. 다시 시도해 주세요.",
      );
      setIsError(true);
      return;
    }

    const { data: urlData } = supabase.storage
      .from(VISIT_PHOTOS_BUCKET)
      .getPublicUrl(storagePath);

    const { data: inserted, error: insertError } = await supabase
      .from("visit_photos")
      .insert({
        visit_id: visitId,
        user_id: user.id,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        sort_order: photos.length,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      await supabase.storage.from(VISIT_PHOTOS_BUCKET).remove([storagePath]);
      setStatus("idle");
      setMessage("사진 정보 저장에 실패했습니다.");
      setIsError(true);
      return;
    }

    setPhotos((prev) => [...prev, inserted as VisitPhoto]);
    setStatus("idle");
    setMessage("사진이 업로드되었습니다.");
    setIsError(false);
    router.refresh();
  }

  async function handleDelete(photo: VisitPhoto) {
    if (!confirm("이 사진을 삭제하시겠습니까?")) return;

    setStatus("deleting");
    setMessage("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("idle");
      setMessage("로그인이 필요합니다.");
      setIsError(true);
      return;
    }

    await supabase.storage
      .from(VISIT_PHOTOS_BUCKET)
      .remove([photo.storage_path]);

    const { error } = await supabase
      .from("visit_photos")
      .delete()
      .eq("id", photo.id)
      .eq("user_id", user.id);

    if (error) {
      setStatus("idle");
      setMessage("사진 삭제에 실패했습니다.");
      setIsError(true);
      return;
    }

    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    setStatus("idle");
    setMessage("사진이 삭제되었습니다.");
    setIsError(false);
    router.refresh();
  }

  return (
    <Card padding="lg">
      <h3 className="text-2xl font-bold text-foreground">방문 사진</h3>
      <p className="mt-2 text-lg text-muted">
        이 나무와 함께 찍은 사진을 남겨 보세요. (최대 {MAX_PHOTOS_PER_VISIT}장)
      </p>

      {photos.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.public_url ?? ""}
                alt="방문 사진"
                className="aspect-square w-full rounded-xl border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                disabled={status !== "idle"}
                className="absolute right-2 top-2 flex min-h-touch min-w-touch items-center justify-center rounded-full bg-black/60 text-xl text-white"
                aria-label="사진 삭제"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          capture="environment"
          className="sr-only"
          onChange={handleFileSelect}
          disabled={!canUploadMore || status !== "idle"}
        />
        <Button
          type="button"
          fullWidth
          variant="outline"
          disabled={!canUploadMore || status !== "idle"}
          onClick={() => fileInputRef.current?.click()}
        >
          {status === "uploading"
            ? "업로드 중..."
            : status === "deleting"
              ? "삭제 중..."
              : canUploadMore
                ? "📷 사진 추가하기"
                : `사진 ${MAX_PHOTOS_PER_VISIT}장 모두 등록됨`}
        </Button>
      </div>

      {message && (
        <p
          className={["mt-3 text-lg", isError ? "text-red-600" : "text-primary"].join(
            " ",
          )}
          role="status"
        >
          {message}
        </p>
      )}
    </Card>
  );
}
