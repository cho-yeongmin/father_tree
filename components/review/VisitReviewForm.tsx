"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarRatingInput } from "./StarRatingInput";

interface VisitReviewFormProps {
  visitId: string;
  treeName: string;
  initialRating: number | null;
  initialMemo: string | null;
  visitedAt: string;
}

function formatVisitedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function VisitReviewForm({
  visitId,
  treeName,
  initialRating,
  initialMemo,
  visitedAt,
}: VisitReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(initialRating);
  const [memo, setMemo] = useState(initialMemo ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating == null) {
      setErrorMessage("별점을 선택해 주세요.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("error");
      setErrorMessage("로그인이 필요합니다.");
      return;
    }

    const { error } = await supabase
      .from("visits")
      .update({
        rating,
        memo: memo.trim() || null,
      })
      .eq("id", visitId)
      .eq("user_id", user.id);

    if (error) {
      setStatus("error");
      setErrorMessage("저장에 실패했습니다. 다시 시도해 주세요.");
      return;
    }

    setStatus("success");
    router.refresh();
  }

  const hasExistingReview = initialRating != null || !!initialMemo;

  return (
    <Card padding="lg">
      <h3 className="text-2xl font-bold text-foreground">방문 감상 남기기</h3>
      <p className="mt-2 text-lg text-muted">
        {formatVisitedAt(visitedAt)}에 방문하셨습니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
        <div>
          <p className="mb-3 text-lg font-medium text-foreground">
            {treeName}은(는) 어떠셨나요?
          </p>
          <StarRatingInput value={rating} onChange={setRating} />
        </div>

        <div>
          <label
            htmlFor="visit-memo"
            className="mb-2 block text-lg font-medium text-foreground"
          >
            한 줄 감상 (선택)
          </label>
          <textarea
            id="visit-memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="이 나무를 보며 떠오른 생각을 적어 보세요"
            rows={3}
            maxLength={200}
            className="w-full resize-none rounded-xl border-2 border-border bg-background px-4 py-3 text-lg text-foreground focus:border-primary focus:outline-none"
          />
          <p className="mt-1 text-base text-muted">{memo.length}/200</p>
        </div>

        <Button type="submit" fullWidth disabled={status === "loading"}>
          {status === "loading"
            ? "저장 중..."
            : hasExistingReview
              ? "감상 수정하기"
              : "감상 저장하기"}
        </Button>

        {status === "success" && (
          <p className="text-lg text-primary" role="status">
            감상이 저장되었습니다. 지도에서 금색 별 핀으로 표시됩니다.
          </p>
        )}
        {status === "error" && errorMessage && (
          <p className="text-lg text-red-600" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </Card>
  );
}
