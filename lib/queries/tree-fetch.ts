import { getDistanceMeters } from "@/lib/geo/distance";
import {
  boundsFromCenter,
  clampBounds,
  expandBounds,
  type GeoBounds,
} from "@/lib/geo/bounds";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tree, TreeType } from "@/types/database";

const PAGE_SIZE = 1000;

async function fetchNaturalMonumentsPage(
  supabase: SupabaseClient,
  from: number,
  to: number,
) {
  return supabase
    .from("trees")
    .select("*")
    .eq("is_active", true)
    .eq("type", "natural_monument")
    .order("name")
    .range(from, to);
}

async function fetchBoundedTreesPage(
  supabase: SupabaseClient,
  bounds: GeoBounds,
  from: number,
  to: number,
  type?: TreeType,
) {
  let query = supabase
    .from("trees")
    .select("*")
    .eq("is_active", true)
    .gte("latitude", bounds.south)
    .lte("latitude", bounds.north)
    .gte("longitude", bounds.west)
    .lte("longitude", bounds.east);

  if (type) {
    query = query.eq("type", type);
  }

  return query.order("name").range(from, to);
}

async function collectPagedTrees(
  fetchPage: (
    from: number,
    to: number,
  ) => Promise<{ data: Tree[] | null; error: unknown }>,
): Promise<Tree[] | null> {
  const allTrees: Tree[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);

    if (error) {
      return null;
    }

    if (!data?.length) {
      break;
    }

    allTrees.push(...data);

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return allTrees;
}

export async function fetchNaturalMonuments(
  supabase: SupabaseClient,
): Promise<Tree[] | null> {
  return collectPagedTrees((from, to) =>
    fetchNaturalMonumentsPage(supabase, from, to),
  );
}

export async function fetchTreesInBounds(
  supabase: SupabaseClient,
  bounds: GeoBounds,
  type?: TreeType,
): Promise<Tree[] | null> {
  const box = clampBounds(bounds);

  return collectPagedTrees((from, to) =>
    fetchBoundedTreesPage(supabase, box, from, to, type),
  );
}

export async function fetchProtectedTreesInBounds(
  supabase: SupabaseClient,
  bounds: GeoBounds,
): Promise<Tree[] | null> {
  return fetchTreesInBounds(
    supabase,
    expandBounds(bounds),
    "protected_tree",
  );
}

export async function fetchTreesNearPosition(
  supabase: SupabaseClient,
  latitude: number,
  longitude: number,
  radiusKm: number,
): Promise<Tree[] | null> {
  const bounds = boundsFromCenter(latitude, longitude, radiusKm);
  const trees = await fetchTreesInBounds(supabase, bounds);

  if (!trees) {
    return null;
  }

  const radiusM = radiusKm * 1000;

  return trees.filter(
    (tree) =>
      getDistanceMeters(
        latitude,
        longitude,
        tree.latitude,
        tree.longitude,
      ) <= radiusM,
  );
}
