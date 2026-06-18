import { writeFileSync } from "fs";
import { resolve } from "path";
import { resolveTreeSidoRegion } from "../lib/trees/resolve-sido-region";
import { getProtectedTreeDisplayName } from "../lib/trees/protected-tree-label";
import {
  parseProtectedTreesCsv,
  readProtectedTreesCsvContent,
} from "./lib/parse-protected-trees-csv";
import { SIDO_REGIONS } from "../lib/trees/resolve-sido-region";

const CSV_PATH = resolve(process.cwd(), "data/protected_trees.csv");
const OUT_PATH = resolve(process.cwd(), "lib/data/protected-tree-regions.ts");

const rows = parseProtectedTreesCsv(readProtectedTreesCsvContent(CSV_PATH));
const counts = new Map<string, number>();

for (const row of rows) {
  const sido = resolveTreeSidoRegion(row.region, row.address);
  counts.set(sido, (counts.get(sido) ?? 0) + 1);
}

const regions = SIDO_REGIONS.map((name) => ({
  name,
  count: counts.get(name) ?? 0,
})).filter((item) => item.count > 0 || item.name !== "기타");

if (!regions.some((item) => item.name === "기타")) {
  regions.push({ name: "기타", count: counts.get("기타") ?? 0 });
}

const content = `/** 공공데이터 보호수 CSV 기준 시·도 목록 (scripts/generate-protected-regions-data.ts) */
export const PROTECTED_TREE_REGIONS = ${JSON.stringify(regions, null, 2)} as const;

export type ProtectedTreeRegionName =
  (typeof PROTECTED_TREE_REGIONS)[number]["name"];

export const PROTECTED_TREE_REGION_NAMES: ProtectedTreeRegionName[] =
  PROTECTED_TREE_REGIONS.map((item) => item.name);
`;

writeFileSync(OUT_PATH, content);
console.log(`Wrote ${regions.length} regions to ${OUT_PATH}`);
