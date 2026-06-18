const STORAGE_KEY = "father_tree_seen_badge_ids";

export function loadSeenBadgeIds(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function saveSeenBadgeIds(ids: Set<string>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

export function findNewBadgeIds(
  earnedIds: string[],
  seenIds: Set<string>,
): string[] {
  return earnedIds.filter((id) => !seenIds.has(id));
}
