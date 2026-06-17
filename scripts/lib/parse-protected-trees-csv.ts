import { readFileSync } from "fs";
import { normalizeRegionName } from "../../lib/cha/map-region";
import { hasValidCoordinates } from "../../lib/cha/tree-filter";

export interface ProtectedTreeRow {
  name: string;
  region: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  externalId: string;
  summary: string;
  description: string | null;
}

export interface ProtectedTreeDbRow {
  name: string;
  type: "protected_tree";
  latitude: number;
  longitude: number;
  address: string | null;
  region: string;
  district: string | null;
  designation_no: null;
  summary: string;
  description: string | null;
  legend: null;
  image_url: null;
  image_gallery: [];
  stamp_radius_m: number;
  is_active: boolean;
  source: string;
  external_id: string;
}

function detectDelimiter(headerLine: string): string {
  const tabCount = (headerLine.match(/\t/g) ?? []).length;
  const commaCount = (headerLine.match(/,/g) ?? []).length;
  if (tabCount > commaCount) {
    return "\t";
  }
  return ",";
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

function parseLine(line: string, delimiter: string): string[] {
  if (delimiter === "\t") {
    return line.split("\t").map((cell) => cell.trim());
  }
  return parseCsvLine(line);
}

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .replace(/\s/g, "")
    .toLowerCase();
}

function findColumn(headers: string[], candidates: string[]): number {
  const normalized = headers.map((h) => normalizeHeader(h));
  for (const candidate of candidates) {
    const idx = normalized.indexOf(normalizeHeader(candidate));
    if (idx >= 0) {
      return idx;
    }
  }
  return -1;
}

function headersLookValid(headers: string[]): boolean {
  const speciesIdx = findColumn(headers, [
    "나무종류",
    "보호수명",
    "보호수명칭",
    "수목명",
    "나무명",
  ]);
  const latIdx = findColumn(headers, [
    "wgs84위도",
    "보호수위도",
    "위도",
    "lat",
  ]);
  const lngIdx = findColumn(headers, [
    "wgs84경도",
    "보호수경도",
    "경도",
    "lng",
    "lon",
  ]);
  return speciesIdx >= 0 && latIdx >= 0 && lngIdx >= 0;
}

/** UTF-8 / EUC-KR(윈도우 CSV) 인코딩 자동 감지 */
export function readProtectedTreesCsvContent(path: string): string {
  const buffer = readFileSync(path);
  const attempts: string[] = [];

  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    attempts.push(buffer.subarray(3).toString("utf-8"));
  } else {
    attempts.push(buffer.toString("utf-8"));
  }

  try {
    attempts.push(new TextDecoder("euc-kr").decode(buffer));
  } catch {
    // ignore
  }

  for (const content of attempts) {
    const firstLine = content.split(/\r?\n/).find((line) => line.trim());
    if (!firstLine) {
      continue;
    }
    const headers = parseLine(firstLine, detectDelimiter(firstLine));
    if (headersLookValid(headers)) {
      return content;
    }
  }

  return attempts[0] ?? "";
}

function parseAddressParts(address: string): {
  region: string;
  district: string;
  label: string;
} {
  const parts = address.trim().split(/\s+/).filter(Boolean);
  const region = parts[0] ?? "기타";
  const district = parts[1] ?? "";
  const label = parts.slice(0, 2).join(" ");

  return { region, district, label };
}

function buildTreeName(species: string, address: string): string {
  const { label } = parseAddressParts(address);
  if (label) {
    return `${species} (${label})`;
  }
  return species;
}

function buildSummary(
  species: string,
  age: string,
  height: string,
  girth: string,
): string {
  const details = [
    age ? `약 ${age}` : "",
    height ? `높이 ${height}` : "",
    girth ? `둘레 ${girth}` : "",
  ].filter(Boolean);

  if (details.length === 0) {
    return species;
  }

  return `${species} · ${details.join(", ")}`;
}

function buildDescription(
  age: string,
  height: string,
  girth: string,
  address: string,
): string | null {
  const lines = [
    age ? `추정 수령: ${age}` : "",
    height ? `수고: ${height}` : "",
    girth ? `가슴높이 둘레: ${girth}` : "",
    address ? `소재지: ${address}` : "",
  ].filter(Boolean);

  return lines.length > 0 ? lines.join("\n") : null;
}

export function parseProtectedTreesCsv(content: string): ProtectedTreeRow[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    return [];
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseLine(lines[0], delimiter);

  const speciesIdx = findColumn(headers, [
    "나무종류",
    "보호수명",
    "보호수명칭",
    "수목명",
    "나무명",
  ]);
  const regionIdx = findColumn(headers, ["시도명", "시도", "광역시도"]);
  const districtIdx = findColumn(headers, ["시군구명", "시군구", "구군명"]);
  const addressIdx = findColumn(headers, [
    "소재지도로명주소",
    "소재지지번주소",
    "소재지",
    "주소",
  ]);
  const ageIdx = findColumn(headers, ["나무나이", "수령", "추정수령"]);
  const heightIdx = findColumn(headers, ["나무높이", "수고", "높이"]);
  const girthIdx = findColumn(headers, [
    "가슴높이둘레",
    "가슴높이둘레(cm)",
    "둘레",
  ]);
  const latIdx = findColumn(headers, [
    "wgs84위도",
    "보호수위도",
    "위도",
    "lat",
  ]);
  const lngIdx = findColumn(headers, [
    "wgs84경도",
    "보호수경도",
    "경도",
    "lng",
    "lon",
  ]);
  const idIdx = findColumn(headers, [
    "보호수관리번호",
    "관리번호",
    "데이터번호",
    "일련번호",
  ]);

  if (speciesIdx < 0 || latIdx < 0 || lngIdx < 0) {
    throw new Error(
      "CSV 헤더에서 필수 컬럼(나무종류, WGS84위도, WGS84경도)을 찾을 수 없습니다.",
    );
  }

  const rows: ProtectedTreeRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i], delimiter);
    const latitude = parseFloat(cols[latIdx]);
    const longitude = parseFloat(cols[lngIdx]);
    const species = cols[speciesIdx]?.trim();
    const address = addressIdx >= 0 ? (cols[addressIdx]?.trim() ?? "") : "";
    const age = ageIdx >= 0 ? (cols[ageIdx]?.trim() ?? "") : "";
    const height = heightIdx >= 0 ? (cols[heightIdx]?.trim() ?? "") : "";
    const girth = girthIdx >= 0 ? (cols[girthIdx]?.trim() ?? "") : "";

    if (!species || !hasValidCoordinates(latitude, longitude)) {
      continue;
    }

    const { region: regionFromAddress, district: districtFromAddress } =
      parseAddressParts(address);
    const region =
      regionIdx >= 0 && cols[regionIdx]?.trim()
        ? cols[regionIdx].trim()
        : regionFromAddress;
    const district =
      districtIdx >= 0 && cols[districtIdx]?.trim()
        ? cols[districtIdx].trim()
        : districtFromAddress;
    const name = buildTreeName(species, address);

    const externalId =
      idIdx >= 0 && cols[idIdx]
        ? `protected:${cols[idIdx]}`
        : `protected:${species}:${latitude.toFixed(5)}:${longitude.toFixed(5)}`;

    rows.push({
      name,
      region,
      district,
      address,
      latitude,
      longitude,
      externalId,
      summary: buildSummary(species, age, height, girth),
      description: buildDescription(age, height, girth, address),
    });
  }

  return rows;
}

export function toProtectedTreeDbRow(row: ProtectedTreeRow): ProtectedTreeDbRow {
  return {
    name: row.name,
    type: "protected_tree",
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address || null,
    region: normalizeRegionName(row.region),
    district: row.district || null,
    designation_no: null,
    summary: row.summary,
    description: row.description,
    legend: null,
    image_url: null,
    image_gallery: [],
    stamp_radius_m: 50,
    is_active: true,
    source: "localdata",
    external_id: row.externalId,
  };
}
