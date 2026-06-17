const REGION_FULL_NAMES: Record<string, string> = {
  서울: "서울특별시",
  부산: "부산광역시",
  대구: "대구광역시",
  인천: "인천광역시",
  광주: "광주광역시",
  대전: "대전광역시",
  울산: "울산광역시",
  세종: "세종특별자치시",
  경기: "경기도",
  강원: "강원특별자치도",
  충북: "충청북도",
  충남: "충청남도",
  전북: "전북특별자치도",
  전남: "전라남도",
  경북: "경상북도",
  경남: "경상남도",
  제주: "제주특별자치도",
  기타: "기타",
};

export function normalizeRegionName(region: string): string {
  const trimmed = region.trim().replace(/\s+$/, "");
  if (!trimmed) return "기타";
  if (trimmed.endsWith("도") || trimmed.endsWith("시")) return trimmed;
  return REGION_FULL_NAMES[trimmed] ?? trimmed;
}

export function buildSummary(name: string, content: string): string {
  if (!content) return name;
  const firstParagraph = content.split("\n").find((line) => line.trim()) ?? "";
  const summary = firstParagraph.trim().slice(0, 120);
  return summary || name;
}

export function splitLegend(content: string): string | null {
  const legendMatch = content.match(
    /(?:전설|이야기|전해|한다\.|한다고)[\s\S]{20,800}/,
  );
  if (!legendMatch) return null;
  return legendMatch[0].trim().slice(0, 1000);
}
