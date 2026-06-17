"use client";

import Link from "next/link";
import Image from "next/image";
import type { Tree } from "@/types/database";
import type { MarkerPinType } from "@/types/tree";
import { getTreeSpeciesLabel } from "@/lib/trees/display-name";
import { getTreeThumbnailUrl } from "@/lib/trees/images";
import { getMapThumbnailApiUrl } from "@/lib/map/map-thumbnail";
import { Card } from "@/components/ui/Card";

const PIN_LABELS: Record<MarkerPinType, string> = {
  natural_monument: "천연기념물",
  protected_tree: "보호수",
  visited_reviewed: "방문·리뷰 완료",
};

const PIN_BADGE_COLORS: Record<MarkerPinType, string> = {
  natural_monument: "bg-red-100 text-red-800",
  protected_tree: "bg-green-100 text-green-800",
  visited_reviewed: "bg-amber-100 text-amber-900",
};

interface TreeSummaryCardProps {
  tree: Tree;
  pinType: MarkerPinType;
  onClose: () => void;
  distanceLabel?: string | null;
}

export function TreeSummaryCard({
  tree,
  pinType,
  onClose,
  distanceLabel,
}: TreeSummaryCardProps) {
  const originalThumb = getTreeThumbnailUrl(tree);
  const thumbnailUrl = originalThumb
    ? getMapThumbnailApiUrl(originalThumb)
    : null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10">
      <Link href={`/trees/${tree.id}`} className="block">
        <Card padding="md" className="shadow-lg active:bg-primary/5">
          <div className="flex items-start justify-between gap-3">
            {thumbnailUrl && (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border">
                <Image
                  src={thumbnailUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span
                className={[
                  "inline-block rounded-full px-3 py-1 text-base font-medium",
                  PIN_BADGE_COLORS[pinType],
                ].join(" ")}
              >
                {PIN_LABELS[pinType]}
              </span>
              <p className="mt-2 text-base font-semibold text-primary">
                {getTreeSpeciesLabel(tree.name)}
              </p>
              <h2 className="mt-1 truncate text-xl font-bold text-foreground">
                {tree.name}
              </h2>
              <p className="mt-1 text-lg text-muted">
                {tree.region}
                {tree.district ? ` · ${tree.district}` : ""}
              </p>
              {tree.summary && (
                <p className="mt-2 line-clamp-2 text-lg text-foreground">
                  {tree.summary}
                </p>
              )}
              {distanceLabel && (
                <p className="mt-2 text-lg font-medium text-primary">
                  내 위치에서 약 {distanceLabel}
                </p>
              )}
              <p className="mt-3 text-base font-medium text-primary">
                자세히 보기 →
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-full text-2xl text-muted hover:bg-border"
              aria-label="카드 닫기"
            >
              ×
            </button>
          </div>
        </Card>
      </Link>
    </div>
  );
}
