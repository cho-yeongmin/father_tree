import type { Tree } from "@/types/database";
import { PROTECTED_TREE_REGION_NAMES } from "@/lib/data/protected-tree-regions";
import { resolveTreeSidoRegionFromTree } from "@/lib/trees/resolve-sido-region";

/** `null`이면 전국 */
export type ProtectedRegionSelection = Set<string> | null;

export function isAllProtectedRegionsSelected(
  selected: ProtectedRegionSelection,
): boolean {
  return selected === null;
}

export function isProtectedRegionSelected(
  selected: ProtectedRegionSelection,
  regionName: string,
): boolean {
  return selected === null || selected.has(regionName);
}

export function selectAllProtectedRegions(): ProtectedRegionSelection {
  return null;
}

export function deselectAllProtectedRegions(): ProtectedRegionSelection {
  return new Set();
}

export function toggleAllProtectedRegions(
  selected: ProtectedRegionSelection,
): ProtectedRegionSelection {
  if (isAllProtectedRegionsSelected(selected)) {
    return deselectAllProtectedRegions();
  }
  return selectAllProtectedRegions();
}

export function toggleProtectedRegion(
  selected: ProtectedRegionSelection,
  regionName: string,
): ProtectedRegionSelection {
  if (selected === null) {
    const next = new Set<string>(PROTECTED_TREE_REGION_NAMES);
    next.delete(regionName);
    return next;
  }

  const next = new Set(selected);
  if (next.has(regionName)) {
    next.delete(regionName);
  } else {
    next.add(regionName);
  }

  if (next.size === PROTECTED_TREE_REGION_NAMES.length) {
    return null;
  }

  return next;
}

export function formatProtectedRegionSelection(
  selected: ProtectedRegionSelection,
): string {
  if (selected === null) {
    return "전국";
  }

  const names = [...selected].sort((a, b) => a.localeCompare(b, "ko"));
  if (names.length === 0) {
    return "선택 없음";
  }
  if (names.length === 1) {
    return names[0];
  }
  if (names.length === 2) {
    return `${names[0]}, ${names[1]}`;
  }
  return `${names[0]} 외 ${names.length - 1}곳`;
}

export function countSelectedProtectedRegions(
  selected: ProtectedRegionSelection,
): number {
  if (selected === null) {
    return PROTECTED_TREE_REGION_NAMES.length;
  }
  return selected.size;
}

export function filterTreesByProtectedRegion<T extends Pick<Tree, "type" | "region" | "address">>(
  trees: T[],
  selected: ProtectedRegionSelection,
): T[] {
  if (selected === null) {
    return trees;
  }

  return trees.filter((tree) => {
    if (tree.type !== "protected_tree") {
      return true;
    }
    return selected.has(resolveTreeSidoRegionFromTree(tree));
  });
}

export function getSingleSelectedRegion(
  selected: ProtectedRegionSelection,
): string | null {
  if (selected === null || selected.size !== 1) {
    return null;
  }
  return [...selected][0] ?? null;
}

export function formatProtectedFilterSummary(
  regionSelection: ProtectedRegionSelection,
  speciesLabel: string,
): string {
  const regionLabel = formatProtectedRegionSelection(regionSelection);
  return `${regionLabel} · ${speciesLabel}`;
}
