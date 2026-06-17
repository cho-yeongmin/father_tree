import Link from "next/link";
import type { Visit, VisitPhoto } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { VisitPhotosSection } from "./VisitPhotosSection";
import { VisitReviewForm } from "./VisitReviewForm";
import { VisitReviewScrollAnchor } from "./VisitReviewScrollAnchor";

interface VisitReviewSectionProps {
  treeName: string;
  visit: Visit | null;
  isLoggedIn: boolean;
  photos: VisitPhoto[];
}

export function VisitReviewSection({
  treeName,
  visit,
  isLoggedIn,
  photos,
}: VisitReviewSectionProps) {
  if (!isLoggedIn) {
    return (
      <Card padding="lg" id="visit-review">
        <h3 className="text-2xl font-bold text-foreground">방문 감상 남기기</h3>
        <p className="mt-3 text-lg text-muted">
          스탬프와 감상을 저장하려면 로그인이 필요합니다.
        </p>
        <Link href="/auth/login" className="mt-4 block">
          <Button fullWidth>로그인하기</Button>
        </Link>
      </Card>
    );
  }

  if (!visit) {
    return (
      <Card padding="lg" id="visit-review">
        <h3 className="text-2xl font-bold text-foreground">방문 감상 남기기</h3>
        <p className="mt-3 text-lg text-muted">
          아직 이 나무의 방문 기록이 없습니다. 나무 가까이(50m 이내) 가시면
          자동으로 스탬프가 찍힙니다.
        </p>
        <Link href="/map" className="mt-4 block">
          <Button fullWidth variant="outline">
            지도에서 찾아가기
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div id="visit-review" className="flex flex-col gap-4 scroll-mt-4">
      <VisitReviewScrollAnchor />
      <VisitReviewForm
        key={visit.id + String(visit.rating) + (visit.memo ?? "")}
        visitId={visit.id}
        treeName={treeName}
        initialRating={visit.rating}
        initialMemo={visit.memo}
        visitedAt={visit.visited_at}
      />
      <VisitPhotosSection visitId={visit.id} initialPhotos={photos} />
    </div>
  );
}
