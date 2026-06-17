"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getRememberedUserId,
  saveRememberedLogin,
  toAuthEmail,
} from "@/lib/auth/credentials";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function getLoginErrorMessage(errorMessage: string): string {
  const lower = errorMessage.toLowerCase();

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid credentials")
  ) {
    return "아이디 또는 비밀번호가 맞지 않습니다.";
  }

  if (lower.includes("email not confirmed")) {
    return "이메일 인증이 필요한 계정입니다. Supabase에서 이메일 확인을 끄거나 계정을 확인해 주세요.";
  }

  return errorMessage;
}

const inputClassName =
  "min-h-touch w-full rounded-xl border-2 border-border bg-background px-4 text-lg text-foreground focus:border-primary focus:outline-none";

export function LoginForm() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setUserId(getRememberedUserId());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: toAuthEmail(userId),
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(getLoginErrorMessage(error.message));
      return;
    }

    saveRememberedLogin(userId, password);
    router.push("/map");
    router.refresh();
  }

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="userId" className="text-lg font-medium text-foreground">
          아이디
        </label>
        <input
          id="userId"
          type="text"
          required
          autoComplete="username"
          placeholder="예: hong01"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className={inputClassName}
        />
        <label
          htmlFor="password"
          className="text-lg font-medium text-foreground"
        >
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClassName}
        />
        <Button type="submit" fullWidth disabled={status === "loading"}>
          {status === "loading" ? "로그인 중..." : "로그인"}
        </Button>
        {message && (
          <p className="whitespace-pre-line text-lg text-red-600" role="alert">
            {message}
          </p>
        )}
      </form>
    </Card>
  );
}
