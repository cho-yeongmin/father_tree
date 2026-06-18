import { SAMPLE_TREES } from "@/lib/data/sample-trees";
import { getSessionUser } from "@/lib/auth/session";
import { getCachedNaturalMonuments } from "@/lib/queries/cached-trees";
import { createClient } from "@/lib/supabase/server";
import type { Tree } from "@/types/database";

export interface MapInitialData {
  naturalMonuments: Tree[];
  reviewedTreeIds: Set<string>;
}

function sampleNaturalMonuments(): Tree[] {
  return SAMPLE_TREES.filter((tree) => tree.type === "natural_monument");
}

export async function getMapInitialData(): Promise<MapInitialData> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      naturalMonuments: sampleNaturalMonuments(),
      reviewedTreeIds: new Set(),
    };
  }

  try {
    const [naturalMonuments, user] = await Promise.all([
      getCachedNaturalMonuments(),
      getSessionUser(),
    ]);

    if (!naturalMonuments.length) {
      return {
        naturalMonuments: sampleNaturalMonuments(),
        reviewedTreeIds: new Set(),
      };
    }

    const reviewedTreeIds = new Set<string>();

    if (user) {
      const supabase = await createClient();
      const { data: visits } = await supabase
        .from("visits")
        .select("tree_id, rating, memo")
        .eq("user_id", user.id);

      visits?.forEach((visit) => {
        if (visit.rating != null || visit.memo) {
          reviewedTreeIds.add(visit.tree_id);
        }
      });
    }

    return { naturalMonuments, reviewedTreeIds };
  } catch {
    return {
      naturalMonuments: sampleNaturalMonuments(),
      reviewedTreeIds: new Set(),
    };
  }
}

export async function getTreeById(id: string): Promise<Tree | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return SAMPLE_TREES.find((tree) => tree.id === id) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trees")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return SAMPLE_TREES.find((tree) => tree.id === id) ?? null;
    }

    return data as Tree;
  } catch {
    return SAMPLE_TREES.find((tree) => tree.id === id) ?? null;
  }
}
