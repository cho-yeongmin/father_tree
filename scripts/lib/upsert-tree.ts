import type { SupabaseClient } from "@supabase/supabase-js";
import type { TreeImage } from "@/types/database";

export interface TreeUpsertRow {
  name: string;
  type: "natural_monument" | "protected_tree";
  latitude: number;
  longitude: number;
  address: string | null;
  region: string;
  district: string | null;
  designation_no: string | null;
  summary: string | null;
  description: string | null;
  legend: string | null;
  image_url: string | null;
  image_gallery: TreeImage[];
  stamp_radius_m: number;
  is_active: boolean;
  source: string;
  external_id: string;
}

export async function upsertTreeByExternalId(
  supabase: SupabaseClient,
  row: TreeUpsertRow,
): Promise<{ error: string | null }> {
  const { data: existing, error: selectError } = await supabase
    .from("trees")
    .select("id")
    .eq("external_id", row.external_id)
    .maybeSingle();

  if (selectError) {
    return { error: selectError.message };
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("trees")
      .update(row)
      .eq("id", existing.id);
    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from("trees").insert(row);
  return { error: error?.message ?? null };
}
