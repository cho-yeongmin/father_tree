export const VISIT_PHOTOS_BUCKET = "visit-photos";
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_PHOTOS_PER_VISIT = 5;
export const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export function buildPhotoStoragePath(
  userId: string,
  visitId: string,
  extension: string,
): string {
  return `${userId}/${visitId}/${crypto.randomUUID()}.${extension}`;
}

export function getExtensionFromFile(file: File): string | null {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };

  return mimeMap[file.type] ?? null;
}

export function validatePhotoFile(file: File): string | null {
  const extension = getExtensionFromFile(file);
  const typeAllowed = ALLOWED_PHOTO_TYPES.includes(
    file.type as (typeof ALLOWED_PHOTO_TYPES)[number],
  );

  if (!typeAllowed && !extension) {
    return "JPG, PNG, WEBP 형식의 사진만 업로드할 수 있습니다.";
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return "사진 크기는 5MB 이하여야 합니다.";
  }

  return null;
}
