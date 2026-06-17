import { SAMPLE_TREES } from "@/lib/data/sample-trees";
import { createClient } from "@/lib/supabase/server";
import type { Tree } from "@/types/database";

export interface TreeMapData {
  trees: Tree[];
  reviewedTreeIds: Set<string>;
}

export async function getTreesForMap(): Promise<TreeMapData> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { trees: SAMPLE_TREES, reviewedTreeIds: new Set() };
  }

  try {
    const supabase = await createClient();

    const { data: trees, error: treesError } = await supabase
      .from("trees")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (treesError || !trees?.length) {
      return { trees: SAMPLE_TREES, reviewedTreeIds: new Set() };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const reviewedTreeIds = new Set<string>();

    if (user) {
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

    return { trees: trees as Tree[], reviewedTreeIds };
  } catch {
    return { trees: SAMPLE_TREES, reviewedTreeIds: new Set() };
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
