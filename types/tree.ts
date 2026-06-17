export type { Tree, TreeType, Visit, MyLibraryItem, LibrarySortKey } from "./database";

export type MarkerPinType = "natural_monument" | "protected_tree" | "visited_reviewed";

export interface TreeMarker {
  id: string;
  name: string;
  type: MarkerPinType;
  latitude: number;
  longitude: number;
  summary: string | null;
}
