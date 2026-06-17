import type { Tree } from "@/types/database";
import { getTreeSpeciesLabel } from "@/lib/trees/display-name";
import { getTreeThumbnailUrl } from "@/lib/trees/images";
import { PLACEHOLDER_THUMB } from "@/lib/map/map-thumbnail";

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
  thumb.src = PLACEHOLDER_THUMB;
  thumb.alt = "";
  thumb.decoding = "async";
  thumb.referrerPolicy = "no-referrer";

  const thumbnailUrl = getTreeThumbnailUrl(tree);
  if (thumbnailUrl) {
    thumb.dataset.thumbUrl = thumbnailUrl;
    thumb.dataset.thumbReady = "false";
  }

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
  return mapLevel <= 9;
}
