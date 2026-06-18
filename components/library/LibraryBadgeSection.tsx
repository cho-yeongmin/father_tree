"use client";

import { useEffect } from "react";
import { computeBadgeVisitStats } from "@/lib/badges/compute-stats";
import { seedSeenBadgesIfEmpty } from "@/lib/badges/detect-new";
import { evaluateBadges, getEarnedBadgeIds } from "@/lib/badges/definitions";
import type { MyLibraryItem } from "@/types/database";
import { BadgeCollection } from "@/components/library/BadgeCollection";

interface LibraryBadgeSectionProps {
  items: MyLibraryItem[];
}

export function LibraryBadgeSection({ items }: LibraryBadgeSectionProps) {
  const badges = evaluateBadges(computeBadgeVisitStats(items));

  useEffect(() => {
    seedSeenBadgesIfEmpty(getEarnedBadgeIds(computeBadgeVisitStats(items)));
  }, [items]);

  return <BadgeCollection badges={badges} />;
}
