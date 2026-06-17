import { createClient } from "@/lib/supabase/client";
import {
  fetchProtectedTreesInBounds,
  fetchTreesNearPosition,
} from "@/lib/queries/tree-fetch";
import type { GeoBounds } from "@/lib/geo/bounds";
import type { Tree } from "@/types/database";

const STAMP_NEARBY_RADIUS_KM = 1;

export async function fetchProtectedTreesInBoundsClient(
  bounds: GeoBounds,
): Promise<Tree[]> {
  const supabase = createClient();
  const trees = await fetchProtectedTreesInBounds(supabase, bounds);
  return trees ?? [];
}

export async function fetchTreesNearPositionClient(
  latitude: number,
  longitude: number,
  radiusKm: number = STAMP_NEARBY_RADIUS_KM,
): Promise<Tree[]> {
  const supabase = createClient();
  const trees = await fetchTreesNearPosition(
    supabase,
    latitude,
    longitude,
    radiusKm,
  );
  return trees ?? [];
}
