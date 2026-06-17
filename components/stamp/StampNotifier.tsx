"use client";

import Link from "next/link";
import type { Tree } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface StampNotifierProps {
  tree: Tree;
  distanceM: number;
  onDismiss: () => void;
}

export function StampNotifier({ tree, distanceM, onDismiss }: StampNotifierProps) {
  return (
    <div
      className="fixed inset-x-4 top-20 z-50"
      role="alertdialog"
      aria-labelledby="stamp-title"
      aria-describedby="stamp-desc"
    >
      <Card padding="lg" className="border-2 border-accent shadow-xl">
        <p className="text-4xl text-center" aria-hidden>
          🌳⭐
        </p>
        <h2 id="stamp-title" className="mt-2 text-center text-2xl font-bold text-foreground">
          방문 스탬프 획득!
        </h2>
        <p id="stamp-desc" className="mt-2 text-center text-xl text-foreground">
          <strong>{tree.name}</strong>
          <br />
          약 {Math.round(distanceM)}m 거리에서 인증되었습니다.
        </p>
        <p className="mt-3 text-center text-lg text-muted">
          지금 바로 별점과 감상을 남겨 보세요!
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link href={`/trees/${tree.id}#visit-review`}>
            <Button fullWidth variant="secondary">
              ⭐ 감상 남기기
            </Button>
          </Link>
          <Link href={`/trees/${tree.id}`}>
            <Button fullWidth>나무 상세 보기</Button>
          </Link>
          <Button fullWidth variant="outline" onClick={onDismiss}>
            닫기
          </Button>
        </div>
      </Card>
    </div>
  );
}

interface StampLoginPromptProps {
  onDismiss: () => void;
}

export function StampLoginPrompt({ onDismiss }: StampLoginPromptProps) {
  return (
    <div className="fixed inset-x-4 top-20 z-50">
      <Card padding="lg" className="border-2 border-primary shadow-xl">
        <p className="text-xl text-foreground">
          나무 근처에 도착했습니다! 스탬프를 저장하려면 로그인이 필요합니다.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link href="/auth/login">
            <Button fullWidth>로그인하기</Button>
          </Link>
          <Button fullWidth variant="outline" onClick={onDismiss}>
            나중에
          </Button>
        </div>
      </Card>
    </div>
  );
}
