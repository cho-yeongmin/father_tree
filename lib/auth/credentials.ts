const STORAGE_KEY_ID = "father_tree_user_id";
const STORAGE_KEY_PASSWORD = "father_tree_user_password";
const INTERNAL_EMAIL_DOMAIN = "father-tree.local";

/** Supabase 로그인용 이메일. 아이디만 입력해도 내부 도메인을 붙입니다. */
export function toAuthEmail(userId: string): string {
  const id = userId.trim();
  if (id.includes("@")) {
    return id;
  }
  return `${id}@${INTERNAL_EMAIL_DOMAIN}`;
}

/** 화면에 보여줄 아이디 (내부 도메인 이메일이면 @ 앞부분만) */
export function toDisplayUserId(email: string | undefined | null): string {
  if (!email) {
    return "";
  }
  const suffix = `@${INTERNAL_EMAIL_DOMAIN}`;
  if (email.endsWith(suffix)) {
    return email.slice(0, -suffix.length);
  }
  return email;
}

export function getRememberedLogin(): { userId: string; password: string } | null {
  if (typeof window === "undefined") {
    return null;
  }

  const userId = localStorage.getItem(STORAGE_KEY_ID)?.trim();
  const password = localStorage.getItem(STORAGE_KEY_PASSWORD) ?? "";

  if (!userId || !password) {
    return null;
  }

  return { userId, password };
}

export function getRememberedUserId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(STORAGE_KEY_ID)?.trim() ?? "";
}

export function saveRememberedLogin(userId: string, password: string): void {
  localStorage.setItem(STORAGE_KEY_ID, userId.trim());
  localStorage.setItem(STORAGE_KEY_PASSWORD, password);
}

export function clearRememberedLogin(): void {
  localStorage.removeItem(STORAGE_KEY_ID);
  localStorage.removeItem(STORAGE_KEY_PASSWORD);
}
