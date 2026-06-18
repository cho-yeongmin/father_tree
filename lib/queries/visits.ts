import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Visit } from "@/types/database";

export async function getLatestVisitForTree(
  treeId: string,
): Promise<{ visit: Visit | null; isLoggedIn: boolean }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { visit: null, isLoggedIn: false };
  }

  try {
    const user = await getSessionUser();

    if (!user) {
      return { visit: null, isLoggedIn: false };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("visits")
      .select("*")
      .eq("user_id", user.id)
      .eq("tree_id", treeId)
      .order("visited_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { visit: null, isLoggedIn: true };
    }

    return { visit: data as Visit, isLoggedIn: true };
  } catch {
    return { visit: null, isLoggedIn: false };
  }
}
