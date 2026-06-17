import Link from "next/link";
import type { MyLibraryItem } from "@/types/database";
import { Card } from "@/components/ui/Card";

const TYPE_LABELS = {
  natural_monument: "천연기념물",
  protected_tree: "보호수",
} as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StarDisplay({ rating }: { rating: number | null }) {
  if (rating == null) {
    return <span className="text-lg text-muted">별점 없음</span>;
  }
  return (
    <span className="text-xl text-accent" aria-label={`별점 ${rating}점`}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

interface VisitCardProps {
  item: MyLibraryItem;
}

export function VisitCard({ item }: VisitCardProps) {
  return (
    <Link href={`/trees/${item.tree_id}`} className="block">
      <Card className="transition-colors active:bg-primary/5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-base font-medium text-primary">
              {TYPE_LABELS[item.tree_type]}
            </span>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              {item.tree_name}
            </h2>
            <p className="mt-1 text-lg text-muted">
              {item.region}
              {item.district ? ` · ${item.district}` : ""}
            </p>
            <p className="mt-2 text-lg text-foreground">
              방문일: {formatDate(item.visited_at)}
            </p>
            <div className="mt-2">
              <StarDisplay rating={item.rating} />
            </div>
            {item.memo && (
              <p className="mt-2 line-clamp-2 text-lg text-foreground">
                &ldquo;{item.memo}&rdquo;
              </p>
            )}
            <p className="mt-2 text-base text-muted">
              사진 {item.photo_count}장
              {item.is_auto_stamped && " · GPS 자동 인증"}
            </p>
          </div>
          <span className="text-2xl text-muted" aria-hidden>
            →
          </span>
        </div>
      </Card>
    </Link>
  );
}
