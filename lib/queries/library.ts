import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { LibrarySortKey, MyLibraryItem } from "@/types/database";

export async function getLibraryItems(
  sort: LibrarySortKey = "visited_at",
): Promise<MyLibraryItem[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  try {
    const user = await getSessionUser();

    if (!user) {
      return [];
    }

    const supabase = await createClient();
    let query = supabase
      .from("my_library")
      .select("*")
      .eq("user_id", user.id);

    switch (sort) {
      case "region":
        query = query.order("region", { ascending: true }).order("tree_name");
        break;
      case "rating":
        query = query
          .order("rating", { ascending: false, nullsFirst: false })
          .order("visited_at", { ascending: false });
        break;
      case "visited_at":
      default:
        query = query.order("visited_at", { ascending: false });
        break;
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data as MyLibraryItem[];
  } catch {
    return [];
  }
}
