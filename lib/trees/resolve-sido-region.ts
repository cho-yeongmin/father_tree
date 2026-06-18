import { normalizeRegionName } from "@/lib/cha/map-region";
import type { Tree } from "@/types/database";

const SIDO_REGIONS = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원특별자치도",
  "충청북도",
  "충청남도",
  "전북특별자치도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
  "기타",
] as const;

const SIDO_SET = new Set<string>(SIDO_REGIONS);

export type SidoRegionName = (typeof SIDO_REGIONS)[number];

export function resolveTreeSidoRegion(
  region: string,
  address?: string | null,
): SidoRegionName {
  const candidates = [
    ...(address ?? "").trim().split(/\s+/),
    region.trim(),
  ].filter(Boolean);

  for (const part of candidates) {
    const normalized = normalizeRegionName(part);
    if (SIDO_SET.has(normalized)) {
      return normalized as SidoRegionName;
    }
  }

  return "기타";
}

export function resolveTreeSidoRegionFromTree(
  tree: Pick<Tree, "region" | "address">,
): SidoRegionName {
  return resolveTreeSidoRegion(tree.region, tree.address);
}

export { SIDO_REGIONS };
