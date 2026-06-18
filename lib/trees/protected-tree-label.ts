import type { Tree } from "@/types/database";
import { getTreeSpeciesLabel } from "@/lib/trees/display-name";

/** 보호수 라벨 상단: 지역 괄호 없이 나무 이름만 */
export function getProtectedTreeDisplayName(name: string): string {
  const regionSuffix = name.match(/^(.+?)\s*\([^)]+\)\s*$/);
  if (regionSuffix?.[1]) {
    return regionSuffix[1].trim();
  }
  return getTreeSpeciesLabel(name);
}

/** 보호수 라벨 하단: 수령·크기 (summary / description에서 추출) */
export function getProtectedTreeStatsLabel(tree: Tree): string | null {
  if (tree.summary) {
    const separator = tree.summary.indexOf(" · ");
    if (separator >= 0) {
      const stats = tree.summary.slice(separator + 3).trim();
      if (stats) {
        return stats;
      }
    }
  }

  if (tree.description) {
    const parts = tree.description
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("소재지:"));

    if (parts.length > 0) {
      return parts.join(" · ");
    }
  }

  return null;
}
