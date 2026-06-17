import type { Tree, TreeImage } from "@/types/database";
import { normalizeChaImageUrl } from "@/lib/cha/image-url";

export function getTreeImages(tree: Pick<Tree, "image_url" | "image_gallery">): TreeImage[] {
  const gallery = tree.image_gallery ?? [];
  if (gallery.length > 0) {
    return gallery;
  }

  const main = normalizeChaImageUrl(tree.image_url);
  return main ? [{ url: main, description: null }] : [];
}

export function getTreeThumbnailUrl(
  tree: Pick<Tree, "image_url" | "image_gallery">,
): string | null {
  const images = getTreeImages(tree);
  return images[0]?.url ?? null;
}
