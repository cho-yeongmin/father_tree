"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getRememberedLogin, toAuthEmail } from "@/lib/auth/credentials";

const ENTRY_PATHS = new Set(["/", "/auth/login"]);

function goToMap(router: ReturnType<typeof useRouter>) {
  router.replace("/map");
  router.refresh();
}

/** 저장된 아이디·비밀번호로 세션이 없을 때 자동 로그인 */
export function AutoLogin() {
  const router = useRouter();
  const pathname = usePathname();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) {
      return;
    }
    attempted.current = true;

    const supabase = createClient();

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        if (ENTRY_PATHS.has(pathname)) {
          goToMap(router);
        }
        return;
      }

      const remembered = getRememberedLogin();
      if (!remembered) {
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: toAuthEmail(remembered.userId),
        password: remembered.password,
      });

      if (!error) {
        goToMap(router);
      }
    })();
  }, [pathname, router]);

  return null;
}
