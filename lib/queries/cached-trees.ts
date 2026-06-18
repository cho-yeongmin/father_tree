import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { fetchNaturalMonuments } from "@/lib/queries/tree-fetch";
import type { Tree } from "@/types/database";

async function loadNaturalMonuments(): Promise<Tree[]> {
  const supabase = createPublicSupabaseClient();
  const trees = await fetchNaturalMonuments(supabase);
  return trees ?? [];
}

export const getCachedNaturalMonuments = unstable_cache(
  loadNaturalMonuments,
  ["natural-monuments"],
  { revalidate: 3600, tags: ["natural-monuments"] },
);
