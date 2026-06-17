/** 문화재청 이미지 URL을 https로 통일 */
export function normalizeChaImageUrl(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) {
    return null;
  }

  return url.trim().replace(/^http:\/\//i, "https://");
}
