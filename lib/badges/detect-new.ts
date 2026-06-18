import { createClient } from "@/lib/supabase/client";
import { computeBadgeVisitStats } from "@/lib/badges/compute-stats";
import {
  BADGE_DEFINITIONS,
  getEarnedBadgeIds,
  type BadgeDefinition,
} from "@/lib/badges/definitions";
import {
  findNewBadgeIds,
  loadSeenBadgeIds,
  saveSeenBadgeIds,
} from "@/lib/badges/storage";
import type { MyLibraryItem } from "@/types/database";

export async function detectNewBadgesForUser(
  userId: string,
): Promise<BadgeDefinition[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("my_library")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  const stats = computeBadgeVisitStats(data as MyLibraryItem[]);
  const earnedIds = getEarnedBadgeIds(stats);
  const seenIds = loadSeenBadgeIds();
  const newIds = findNewBadgeIds(earnedIds, seenIds);

  if (newIds.length > 0) {
    saveSeenBadgeIds(new Set([...seenIds, ...newIds]));
  }

  return BADGE_DEFINITIONS.filter((badge) => newIds.includes(badge.id));
}

export function seedSeenBadgesIfEmpty(earnedBadgeIds: string[]): void {
  const seenIds = loadSeenBadgeIds();
  if (seenIds.size === 0 && earnedBadgeIds.length > 0) {
    saveSeenBadgeIds(new Set(earnedBadgeIds));
  }
}
