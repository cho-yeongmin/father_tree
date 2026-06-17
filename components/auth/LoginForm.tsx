"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/utils/app-url";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function getLoginErrorMessage(errorMessage: string, callbackUrl: string): string {
  const lower = errorMessage.toLowerCase();

  if (
    lower.includes("invalid path") ||
    lower.includes("redirect") ||
    lower.includes("requested path")
  ) {
    return [
      "리다이렉트 URL이 Supabase에 등록되지 않았습니다.",
      "",
      "Supabase 대시보드 → Authentication → URL Configuration에서 아래를 확인해 주세요.",
      `1) Site URL: ${callbackUrl.replace("/auth/callback", "")}`,
      `2) Redirect URLs에 추가: ${callbackUrl}`,
      "   (또는 http://localhost:3000/**)",
      "",
      "※ Site URL을 xxx.supabase.co 로 두면 안 됩니다.",
    ].join("\n");
  }

  return errorMessage;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const callbackUrl = getAuthCallbackUrl();
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(getLoginErrorMessage(error.message, callbackUrl));
      return;
    }

    setStatus("sent");
    setMessage("이메일로 로그인 링크를 보냈습니다. 메일함을 확인해 주세요.");
  }

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="email" className="text-lg font-medium text-foreground">
          이메일 주소
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-touch w-full rounded-xl border-2 border-border bg-background px-4 text-lg text-foreground focus:border-primary focus:outline-none"
        />
        <Button type="submit" fullWidth disabled={status === "loading"}>
          {status === "loading" ? "보내는 중..." : "로그인 링크 받기"}
        </Button>
        {message && (
          <p
            className={[
              "whitespace-pre-line text-lg",
              status === "error" ? "text-red-600" : "text-primary",
            ].join(" ")}
            role="status"
          >
            {message}
          </p>
        )}
      </form>
    </Card>
  );
}
