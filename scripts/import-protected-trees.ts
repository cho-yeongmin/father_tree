/**
 * 공공데이터포털 전국보호수 CSV → Supabase trees 임포트
 * CSV 다운로드: https://www.data.go.kr/data/15013194/fileData.do
 * 파일을 data/protected_trees.csv 로 저장 후 실행
 *
 * 사용법:
 *   npm run import:protected-trees
 */
import { config } from "dotenv";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { normalizeRegionName } from "../lib/cha/map-region";
import { hasValidCoordinates } from "../lib/cha/tree-filter";
import { createAdminClient } from "./lib/supabase-admin";
import { upsertTreeByExternalId } from "./lib/upsert-tree";

const CSV_PATH = resolve(process.cwd(), "data/protected_trees.csv");

interface CsvRow {
  name: string;
  region: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  externalId: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current.trim());
  return result;
}

function findColumn(headers: string[], candidates: string[]): number {
  const normalized = headers.map((h) => h.replace(/\s/g, "").toLowerCase());
  for (const candidate of candidates) {
    const idx = normalized.indexOf(candidate.toLowerCase());
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const nameIdx = findColumn(headers, [
    "보호수명",
    "보호수명칭",
    "수목명",
    "나무명",
  ]);
  const regionIdx = findColumn(headers, ["시도명", "시도", "광역시도"]);
  const districtIdx = findColumn(headers, ["시군구명", "시군구", "구군명"]);
  const addressIdx = findColumn(headers, [
    "소재지지번주소",
    "소재지도로명주소",
    "소재지",
    "주소",
  ]);
  const latIdx = findColumn(headers, [
    "보호수위도",
    "위도",
    "wgs84위도",
    "lat",
  ]);
  const lngIdx = findColumn(headers, [
    "보호수경도",
    "경도",
    "wgs84경도",
    "lng",
    "lon",
  ]);
  const idIdx = findColumn(headers, [
    "보호수관리번호",
    "관리번호",
    "데이터번호",
    "일련번호",
  ]);

  if (nameIdx < 0 || latIdx < 0 || lngIdx < 0) {
    throw new Error(
      "CSV 헤더에서 필수 컬럼(보호수명, 위도, 경도)을 찾을 수 없습니다.",
    );
  }

  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const latitude = parseFloat(cols[latIdx]);
    const longitude = parseFloat(cols[lngIdx]);
    const name = cols[nameIdx]?.trim();

    if (!name || !hasValidCoordinates(latitude, longitude)) continue;

    const externalId =
      idIdx >= 0 && cols[idIdx]
        ? `protected:${cols[idIdx]}`
        : `protected:${name}:${latitude.toFixed(5)}:${longitude.toFixed(5)}`;

    rows.push({
      name,
      region: cols[regionIdx]?.trim() ?? "기타",
      district: cols[districtIdx]?.trim() ?? "",
      address: cols[addressIdx]?.trim() ?? "",
      latitude,
      longitude,
      externalId,
    });
  }

  return rows;
}

async function main() {
  if (!existsSync(CSV_PATH)) {
    console.error(`CSV 파일이 없습니다: ${CSV_PATH}`);
    console.error(
      "공공데이터포털(https://www.data.go.kr/data/15013194)에서 보호수 CSV를 받아 위 경로에 저장하세요.",
    );
    process.exit(1);
  }

  const content = readFileSync(CSV_PATH, "utf-8");
  const rows = parseCsv(content);

  console.log(`보호수 ${rows.length}건 임포트 시작...`);

  const supabase = createAdminClient();
  let imported = 0;
  let failed = 0;

  for (const row of rows) {
    const dbRow = {
      name: row.name,
      type: "protected_tree" as const,
      latitude: row.latitude,
      longitude: row.longitude,
      address: row.address || null,
      region: normalizeRegionName(row.region),
      district: row.district || null,
      designation_no: null,
      summary: row.name,
      description: null,
      legend: null,
      image_url: null,
      stamp_radius_m: 50,
      is_active: true,
      source: "localdata",
      external_id: row.externalId,
    };

    const { error } = await upsertTreeByExternalId(supabase, dbRow);

    if (error) {
      failed++;
      if (failed <= 5) {
        console.error(`실패: ${row.name} - ${error}`);
      }
    } else {
      imported++;
    }
  }

  console.log(`완료: 성공 ${imported}건, 실패 ${failed}건`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
