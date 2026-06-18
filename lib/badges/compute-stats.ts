import type { MyLibraryItem } from "@/types/database";
import { getProtectedTreeDisplayName } from "@/lib/trees/protected-tree-label";
import { resolveTreeSidoRegion } from "@/lib/trees/resolve-sido-region";

export interface BadgeVisitStats {
  uniqueTreeCount: number;
  naturalMonumentCount: number;
  protectedTreeCount: number;
  uniqueRegions: Set<string>;
  uniqueSpecies: Set<string>;
  zelkovaCount: number;
}

export function computeBadgeVisitStats(
  items: MyLibraryItem[],
): BadgeVisitStats {
  const uniqueTreeIds = new Set<string>();
  const naturalMonumentTreeIds = new Set<string>();
  const protectedTreeIds = new Set<string>();
  const uniqueRegions = new Set<string>();
  const uniqueSpecies = new Set<string>();
  const zelkovaTreeIds = new Set<string>();

  for (const item of items) {
    uniqueTreeIds.add(item.tree_id);
    uniqueRegions.add(resolveTreeSidoRegion(item.region));

    if (item.tree_type === "natural_monument") {
      naturalMonumentTreeIds.add(item.tree_id);
    } else if (item.tree_type === "protected_tree") {
      protectedTreeIds.add(item.tree_id);
      const species = getProtectedTreeDisplayName(item.tree_name);
      uniqueSpecies.add(species);
      if (species === "느티나무") {
        zelkovaTreeIds.add(item.tree_id);
      }
    }
  }

  return {
    uniqueTreeCount: uniqueTreeIds.size,
    naturalMonumentCount: naturalMonumentTreeIds.size,
    protectedTreeCount: protectedTreeIds.size,
    uniqueRegions,
    uniqueSpecies,
    zelkovaCount: zelkovaTreeIds.size,
  };
}
