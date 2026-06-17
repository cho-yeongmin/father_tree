/**
 * 보호수 원본 CSV → Supabase trees 테이블용 CSV 변환
 *
 * 사용법:
 *   npm run export:protected-trees
 *
 * 결과: data/trees_protected_for_supabase.csv
 */
import { existsSync, writeFileSync } from "fs";
import { resolve } from "path";
import {
  parseProtectedTreesCsv,
  readProtectedTreesCsvContent,
  toProtectedTreeDbRow,
} from "./lib/parse-protected-trees-csv";

const SOURCE_PATH = resolve(process.cwd(), "data/protected_trees.csv");
const OUTPUT_PATH = resolve(
  process.cwd(),
  "data/trees_protected_for_supabase.csv",
);

const CSV_COLUMNS = [
  "name",
  "type",
  "latitude",
  "longitude",
  "address",
  "region",
  "district",
  "designation_no",
  "summary",
  "description",
  "legend",
  "image_url",
  "image_gallery",
  "stamp_radius_m",
  "is_active",
  "source",
  "external_id",
] as const;

function escapeCsv(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

function rowToCsvLine(
  values: Record<(typeof CSV_COLUMNS)[number], string | number | boolean | null>,
): string {
  return CSV_COLUMNS.map((column) => escapeCsv(values[column])).join(",");
}

function main() {
  if (!existsSync(SOURCE_PATH)) {
    console.error(`CSV 파일이 없습니다: ${SOURCE_PATH}`);
    process.exit(1);
  }

  const content = readProtectedTreesCsvContent(SOURCE_PATH);
  const rows = parseProtectedTreesCsv(content);

  const lines = [
    CSV_COLUMNS.join(","),
    ...rows.map((row) => {
      const db = toProtectedTreeDbRow(row);
      return rowToCsvLine({
        name: db.name,
        type: db.type,
        latitude: db.latitude,
        longitude: db.longitude,
        address: db.address,
        region: db.region,
        district: db.district,
        designation_no: db.designation_no,
        summary: db.summary,
        description: db.description,
        legend: db.legend,
        image_url: db.image_url,
        image_gallery: "[]",
        stamp_radius_m: db.stamp_radius_m,
        is_active: db.is_active,
        source: db.source,
        external_id: db.external_id,
      });
    }),
  ];

  writeFileSync(OUTPUT_PATH, `\uFEFF${lines.join("\n")}`, "utf-8");

  console.log(`변환 완료: ${rows.length}건`);
  console.log(`저장 위치: ${OUTPUT_PATH}`);
  console.log("");
  console.log("Supabase 대시보드 → Table Editor → trees → Import data from CSV");
}

main();
