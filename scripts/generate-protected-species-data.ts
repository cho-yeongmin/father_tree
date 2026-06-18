import { writeFileSync } from "fs";
import { resolve } from "path";
import { getProtectedTreeDisplayName } from "../lib/trees/protected-tree-label";
import {
  parseProtectedTreesCsv,
  readProtectedTreesCsvContent,
} from "./lib/parse-protected-trees-csv";

const CSV_PATH = resolve(process.cwd(), "data/protected_trees.csv");
const OUT_PATH = resolve(process.cwd(), "lib/data/protected-tree-species.ts");

const rows = parseProtectedTreesCsv(readProtectedTreesCsvContent(CSV_PATH));
const counts = new Map<string, number>();

for (const row of rows) {
  const species = getProtectedTreeDisplayName(row.name);
  counts.set(species, (counts.get(species) ?? 0) + 1);
}

const species = [...counts.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
  .map(([name, count]) => ({ name, count }));

const content = `/** 공공데이터 보호수 CSV 기준 종류 목록 (scripts/generate-protected-species-data.ts) */
export const PROTECTED_TREE_SPECIES = ${JSON.stringify(species, null, 2)} as const;

export type ProtectedTreeSpeciesName =
  (typeof PROTECTED_TREE_SPECIES)[number]["name"];

export const PROTECTED_TREE_SPECIES_NAMES: ProtectedTreeSpeciesName[] =
  PROTECTED_TREE_SPECIES.map((item) => item.name);
`;

writeFileSync(OUT_PATH, content);
console.log(`Wrote ${species.length} species to ${OUT_PATH}`);
