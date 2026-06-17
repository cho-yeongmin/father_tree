import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { toDisplayUserId } from "@/lib/auth/credentials";
import { createClient } from "@/lib/supabase/server";

export async function AuthStatus() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="rounded-xl border-2 border-primary px-4 py-2 text-base font-medium text-primary"
      >
        로그인
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="max-w-[120px] truncate text-base text-muted">
        {toDisplayUserId(user.email)}
      </span>
      <LogoutButton />
    </div>
  );
}
