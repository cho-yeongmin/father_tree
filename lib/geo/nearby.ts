import type { Tree } from "@/types/database";
import { getDistanceMeters } from "./distance";

export const DEFAULT_NEARBY_RADIUS_KM = 10;

export function filterNearbyTrees(
  trees: Tree[],
  latitude: number,
  longitude: number,
  radiusKm: number = DEFAULT_NEARBY_RADIUS_KM,
): Tree[] {
  const radiusM = radiusKm * 1000;

  return trees
    .filter((tree) => {
      const distance = getDistanceMeters(
        latitude,
        longitude,
        tree.latitude,
        tree.longitude,
      );
      return distance <= radiusM;
    })
    .sort((a, b) => {
      const distA = getDistanceMeters(
        latitude,
        longitude,
        a.latitude,
        a.longitude,
      );
      const distB = getDistanceMeters(
        latitude,
        longitude,
        b.latitude,
        b.longitude,
      );
      return distA - distB;
    });
}

export function formatDistanceKm(
  latitude: number,
  longitude: number,
  tree: Tree,
): string {
  const meters = getDistanceMeters(
    latitude,
    longitude,
    tree.latitude,
    tree.longitude,
  );
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
