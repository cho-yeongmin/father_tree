import {
  CHA_DETAIL_API,
  CHA_KIND_NATURAL_MONUMENT,
  CHA_LIST_API,
  CHA_REGION_CODES,
} from "./constants";
import type { ChaDetailItem, ChaListItem } from "./types";
import { extractCdata, extractItems } from "./xml";

async function fetchXml(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`문화재청 API 요청 실패: ${response.status} ${url}`);
  }
  return response.text();
}

function parseListItem(itemXml: string): ChaListItem {
  return {
    name: extractCdata(itemXml, "ccbaMnm1"),
    nameHanja: extractCdata(itemXml, "ccbaMnm2"),
    region: extractCdata(itemXml, "ccbaCtcdNm"),
    district: extractCdata(itemXml, "ccsiName").replace(/^\.$/, ""),
    admin: extractCdata(itemXml, "ccbaAdmin"),
    ccbaKdcd: extractCdata(itemXml, "ccbaKdcd"),
    ccbaCtcd: extractCdata(itemXml, "ccbaCtcd"),
    ccbaAsno: extractCdata(itemXml, "ccbaAsno"),
    ccbaCpno: extractCdata(itemXml, "ccbaCpno"),
    latitude: parseFloat(extractCdata(itemXml, "latitude") || "0"),
    longitude: parseFloat(extractCdata(itemXml, "longitude") || "0"),
  };
}

export async function fetchNaturalMonumentList(
  regionCode: string,
  pageIndex = 1,
  pageUnit = 200,
): Promise<{ items: ChaListItem[]; totalCnt: number }> {
  const params = new URLSearchParams({
    pageUnit: String(pageUnit),
    pageIndex: String(pageIndex),
    ccbaCncl: "N",
    ccbaKdcd: CHA_KIND_NATURAL_MONUMENT,
    ccbaCtcd: regionCode,
  });

  const xml = await fetchXml(`${CHA_LIST_API}?${params}`);
  const totalCnt = parseInt(extractCdata(xml, "totalCnt") || "0", 10);
  const items = extractItems(xml).map(parseListItem);

  return { items, totalCnt };
}

export async function fetchAllNaturalMonuments(): Promise<ChaListItem[]> {
  const map = new Map<string, ChaListItem>();

  for (const regionCode of CHA_REGION_CODES) {
    const { items, totalCnt } = await fetchNaturalMonumentList(regionCode);

    items.forEach((item) => {
      if (item.ccbaCpno) {
        map.set(item.ccbaCpno, item);
      }
    });

    if (totalCnt > 200) {
      const pages = Math.ceil(totalCnt / 200);
      for (let page = 2; page <= pages; page++) {
        const { items: pageItems } = await fetchNaturalMonumentList(
          regionCode,
          page,
        );
        pageItems.forEach((item) => {
          if (item.ccbaCpno) {
            map.set(item.ccbaCpno, item);
          }
        });
        await sleep(200);
      }
    }

    await sleep(200);
  }

  return [...map.values()];
}

export async function fetchNaturalMonumentDetail(
  item: Pick<ChaListItem, "ccbaKdcd" | "ccbaAsno" | "ccbaCtcd">,
): Promise<ChaDetailItem> {
  const params = new URLSearchParams({
    ccbaKdcd: item.ccbaKdcd,
    ccbaAsno: item.ccbaAsno,
    ccbaCtcd: item.ccbaCtcd,
  });

  const xml = await fetchXml(`${CHA_DETAIL_API}?${params}`);
  const itemXml = extractItems(xml)[0] ?? xml;

  const imageUrl = extractCdata(itemXml, "imageUrl").replace(
    /^http:\/\//,
    "https://",
  );

  return {
    address: extractCdata(itemXml, "ccbaLcad"),
    content: extractCdata(itemXml, "content"),
    imageUrl,
    designatedAt: extractCdata(itemXml, "ccbaAsdt"),
    region: extractCdata(itemXml, "ccbaCtcdNm").trim(),
    district: extractCdata(itemXml, "ccsiName").replace(/^\.$/, ""),
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
