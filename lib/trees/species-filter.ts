import type { Tree } from "@/types/database";
import { PROTECTED_TREE_SPECIES_NAMES } from "@/lib/data/protected-tree-species";
import { getProtectedTreeDisplayName } from "@/lib/trees/protected-tree-label";

/** `null`이면 전체 종류 선택 */
export type ProtectedSpeciesSelection = Set<string> | null;

export function isAllProtectedSpeciesSelected(
  selected: ProtectedSpeciesSelection,
): boolean {
  return selected === null;
}

export function isNoneProtectedSpeciesSelected(
  selected: ProtectedSpeciesSelection,
): boolean {
  return selected !== null && selected.size === 0;
}

export function isProtectedSpeciesSelected(
  selected: ProtectedSpeciesSelection,
  speciesName: string,
): boolean {
  return selected === null || selected.has(speciesName);
}

export function selectAllProtectedSpecies(): ProtectedSpeciesSelection {
  return null;
}

export function deselectAllProtectedSpecies(): ProtectedSpeciesSelection {
  return new Set();
}

export function toggleAllProtectedSpecies(
  selected: ProtectedSpeciesSelection,
): ProtectedSpeciesSelection {
  if (isAllProtectedSpeciesSelected(selected)) {
    return deselectAllProtectedSpecies();
  }
  return selectAllProtectedSpecies();
}

export function toggleProtectedSpecies(
  selected: ProtectedSpeciesSelection,
  speciesName: string,
): ProtectedSpeciesSelection {
  if (selected === null) {
    const next = new Set<string>(PROTECTED_TREE_SPECIES_NAMES);
    next.delete(speciesName);
    return next;
  }

  const next = new Set(selected);
  if (next.has(speciesName)) {
    next.delete(speciesName);
  } else {
    next.add(speciesName);
  }

  if (next.size === PROTECTED_TREE_SPECIES_NAMES.length) {
    return null;
  }

  return next;
}

export function formatProtectedSpeciesSelection(
  selected: ProtectedSpeciesSelection,
): string {
  if (selected === null) {
    return "전체";
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
  return `${names[0]}, ${names[1]} 외 ${names.length - 2}종`;
}

export function filterTreesByProtectedSpecies<T extends Pick<Tree, "type" | "name">>(
  trees: T[],
  selected: ProtectedSpeciesSelection,
): T[] {
  if (selected === null) {
    return trees;
  }

  return trees.filter((tree) => {
    if (tree.type !== "protected_tree") {
      return true;
    }
    return selected.has(getProtectedTreeDisplayName(tree.name));
  });
}

export function countSelectedProtectedSpecies(
  selected: ProtectedSpeciesSelection,
): number {
  if (selected === null) {
    return PROTECTED_TREE_SPECIES_NAMES.length;
  }
  return selected.size;
}
