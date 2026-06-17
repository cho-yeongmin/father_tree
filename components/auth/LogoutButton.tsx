"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearRememberedLogin } from "@/lib/auth/credentials";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearRememberedLogin();
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" onClick={handleLogout}>
      로그아웃
    </Button>
  );
}
