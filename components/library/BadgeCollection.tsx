"use client";

import { useState } from "react";
import type { EvaluatedBadge } from "@/lib/badges/definitions";
import { BadgeDetailSheet } from "@/components/library/BadgeDetailSheet";

interface BadgeCollectionProps {
  badges: EvaluatedBadge[];
}

export function BadgeCollection({ badges }: BadgeCollectionProps) {
  const [selectedBadge, setSelectedBadge] = useState<EvaluatedBadge | null>(
    null,
  );

  const earnedCount = badges.filter((badge) => badge.earned).length;

  return (
    <>
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">나의 컬렉션</h2>
          <span className="text-base text-muted">
            {earnedCount} / {badges.length} 획득
          </span>
        </div>
        <ul className="flex gap-3 overflow-x-auto pb-1">
          {badges.map((badge) => (
            <li key={badge.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setSelectedBadge(badge)}
                className={[
                  "flex w-24 flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 text-center",
                  badge.earned
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-background opacity-70",
                ].join(" ")}
              >
                <span className="text-3xl" aria-hidden>
                  {badge.earned ? badge.icon : "🔒"}
                </span>
                <span className="line-clamp-2 text-sm font-medium text-foreground">
                  {badge.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <BadgeDetailSheet
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </>
  );
}
