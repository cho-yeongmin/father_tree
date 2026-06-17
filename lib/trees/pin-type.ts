import type { Tree } from "@/types/database";
import type { MarkerPinType } from "@/types/tree";

export function resolvePinType(
  tree: Tree,
  reviewedTreeIds: Set<string>,
): MarkerPinType {
  if (reviewedTreeIds.has(tree.id)) return "visited_reviewed";
  return tree.type;
}
