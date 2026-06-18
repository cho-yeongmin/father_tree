"use client";

import { useEffect } from "react";
import type { EvaluatedBadge } from "@/lib/badges/definitions";
import { Button } from "@/components/ui/Button";

interface BadgeDetailSheetProps {
  badge: EvaluatedBadge | null;
  onClose: () => void;
}

export function BadgeDetailSheet({ badge, onClose }: BadgeDetailSheetProps) {
  useEffect(() => {
    if (!badge) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [badge]);

  if (!badge) {
    return null;
  }

  const { current, target } = badge.progress;
  const percent = Math.round((current / target) * 100);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="배지 상세 닫기"
        onClick={onClose}
      />
      <div className="relative rounded-t-2xl bg-card p-5 shadow-2xl safe-area-bottom">
        <p className="text-center text-5xl" aria-hidden>
          {badge.earned ? badge.icon : "🔒"}
        </p>
        <h3 className="mt-3 text-center text-2xl font-bold text-foreground">
          {badge.title}
        </h3>
        <p className="mt-2 text-center text-lg text-muted">{badge.description}</p>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm text-muted">
            <span>진행률</span>
            <span>
              {current} / {target}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <p className="mt-3 text-center text-base text-foreground">
          {badge.earned ? "획득 완료!" : "아직 획득하지 못했습니다."}
        </p>

        <Button fullWidth variant="outline" className="mt-4" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}
