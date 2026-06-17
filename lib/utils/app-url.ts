/**
 * 인증 콜백 등에 쓸 앱 기준 URL.
 * NEXT_PUBLIC_APP_URL 우선, 없으면 브라우저 origin 사용.
 */
export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(): string {
  return `${getAppUrl()}/auth/callback`;
}
