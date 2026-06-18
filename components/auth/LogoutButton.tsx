"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearRememberedLogin } from "@/lib/auth/credentials";
import { Button } from "@/components/ui/Button";

interface LogoutButtonProps {
  fullWidth?: boolean;
}

export function LogoutButton({ fullWidth = false }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearRememberedLogin();
    router.replace("/auth/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      fullWidth={fullWidth}
      onClick={handleLogout}
    >
      로그아웃
    </Button>
  );
}
