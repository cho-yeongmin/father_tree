import type { Tree } from "@/types/database";

export function buildTmapRouteUrl(tree: Tree): string {
  const params = new URLSearchParams({
    rGoName: tree.name,
    rGoX: String(tree.longitude),
    rGoY: String(tree.latitude),
  });

  return `tmap://route?${params.toString()}`;
}

export function openTmapNavigation(tree: Tree): void {
  const deeplink = buildTmapRouteUrl(tree);
  window.location.href = deeplink;
}
