import { createClient } from "@/lib/supabase/server";
import type { VisitPhoto } from "@/types/database";

export async function getVisitPhotos(visitId: string): Promise<VisitPhoto[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("visit_photos")
      .select("*")
      .eq("visit_id", visitId)
      .eq("user_id", user.id)
      .order("sort_order")
      .order("created_at");

    if (error || !data) {
      return [];
    }

    return data as VisitPhoto[];
  } catch {
    return [];
  }
}
