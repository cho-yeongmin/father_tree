import { DEFAULT_MAP_REGION } from "@/lib/map/default-region";

export interface SavedMapViewport {
  latitude: number;
  longitude: number;
  level: number;
}

const STORAGE_KEY = "father_tree_map_viewport";

function isValidViewport(viewport: SavedMapViewport): boolean {
  return (
    Number.isFinite(viewport.latitude) &&
    Number.isFinite(viewport.longitude) &&
    Number.isFinite(viewport.level) &&
    viewport.latitude >= 33 &&
    viewport.latitude <= 39.5 &&
    viewport.longitude >= 124 &&
    viewport.longitude <= 132.5 &&
    viewport.level >= 1 &&
    viewport.level <= 14
  );
}

export function hasSavedMapViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw) as SavedMapViewport;
    return isValidViewport(parsed);
  } catch {
    return false;
  }
}

export function loadMapViewport(): SavedMapViewport {
  if (typeof window === "undefined") {
    return { ...DEFAULT_MAP_REGION };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_MAP_REGION };
    }

    const parsed = JSON.parse(raw) as SavedMapViewport;
    if (isValidViewport(parsed)) {
      return parsed;
    }
  } catch {
    // ignore corrupted storage
  }

  return { ...DEFAULT_MAP_REGION };
}

export function saveMapViewport(viewport: SavedMapViewport): void {
  if (typeof window === "undefined" || !isValidViewport(viewport)) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(viewport));
  } catch {
    // ignore quota / private mode errors
  }
}
