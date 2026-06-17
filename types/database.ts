export type TreeType = "natural_monument" | "protected_tree";

export interface Tree {
  id: string;
  name: string;
  type: TreeType;
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
  stamp_radius_m: number;
  is_active: boolean;
  source: string | null;
  external_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  user_id: string;
  tree_id: string;
  visited_at: string;
  rating: number | null;
  memo: string | null;
  is_auto_stamped: boolean;
  stamp_latitude: number | null;
  stamp_longitude: number | null;
  distance_m: number | null;
  created_at: string;
  updated_at: string;
}

export interface VisitPhoto {
  id: string;
  visit_id: string;
  user_id: string;
  storage_path: string;
  public_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MyLibraryItem {
  visit_id: string;
  user_id: string;
  tree_id: string;
  tree_name: string;
  tree_type: TreeType;
  region: string;
  district: string | null;
  tree_image_url: string | null;
  visited_at: string;
  rating: number | null;
  memo: string | null;
  is_auto_stamped: boolean;
  photo_count: number;
}

export type LibrarySortKey = "visited_at" | "region" | "rating";
