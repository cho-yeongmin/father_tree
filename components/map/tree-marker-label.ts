import type { Tree } from "@/types/database";
import { getTreeSpeciesLabel } from "@/lib/trees/display-name";
import { getTreeThumbnailUrl } from "@/lib/trees/images";

const PLACEHOLDER_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='8' fill='%23d4e0d4'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-size='20' fill='%232d5a27'%3E%F0%9F%8C%B3%3C/text%3E%3C/svg%3E";

export function createTreeMarkerLabelElement(
  tree: Tree,
  onClick: () => void,
): HTMLDivElement {
  const root = document.createElement("div");
  root.className = "tree-map-pin-label";
  root.setAttribute("role", "button");
  root.setAttribute("tabindex", "0");
  root.setAttribute("aria-label", `${tree.name} 상세 보기`);

  const thumb = document.createElement("img");
  thumb.className = "tree-map-pin-label__thumb";
  thumb.src = getTreeThumbnailUrl(tree) ?? PLACEHOLDER_THUMB;
  thumb.alt = "";
  thumb.loading = "lazy";
  thumb.referrerPolicy = "no-referrer";

  const textWrap = document.createElement("div");
  textWrap.className = "tree-map-pin-label__text";

  const species = document.createElement("strong");
  species.className = "tree-map-pin-label__species";
  species.textContent = getTreeSpeciesLabel(tree.name);

  const name = document.createElement("span");
  name.className = "tree-map-pin-label__name";
  name.textContent = tree.name;

  textWrap.append(species, name);
  root.append(thumb, textWrap);

  root.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });

  return root;
}

/** 줌이 멀면 라벨을 숨깁니다. 카카오 지도 level이 작을수록 확대됨 */
export function shouldShowTreeMarkerLabels(mapLevel: number): boolean {
  return mapLevel <= 10;
}
