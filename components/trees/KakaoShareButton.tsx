"use client";

import { useState } from "react";
import type { Tree } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { shareTreeOnKakao } from "@/lib/kakao/share";

interface KakaoShareButtonProps {
  tree: Tree;
}

export function KakaoShareButton({ tree }: KakaoShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleShare() {
    setStatus("loading");
    try {
      await shareTreeOnKakao({
        treeId: tree.id,
        name: tree.name,
        description: tree.summary ?? tree.description ?? tree.name,
        imageUrl: tree.image_url,
      });
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <Button
        fullWidth
        variant="outline"
        onClick={handleShare}
        disabled={status === "loading"}
      >
        {status === "loading" ? "공유 준비 중..." : "카카오톡 공유하기"}
      </Button>
      {status === "error" && (
        <p className="mt-2 text-lg text-red-600">
          공유에 실패했습니다. 카카오 앱 키 설정을 확인해 주세요.
        </p>
      )}
    </div>
  );
}
