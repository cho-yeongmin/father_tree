/** 공공데이터 보호수 CSV 기준 시·도 목록 (scripts/generate-protected-regions-data.ts) */
export const PROTECTED_TREE_REGIONS = [
  {
    "name": "서울특별시",
    "count": 175
  },
  {
    "name": "부산광역시",
    "count": 43
  },
  {
    "name": "대구광역시",
    "count": 38
  },
  {
    "name": "인천광역시",
    "count": 18
  },
  {
    "name": "광주광역시",
    "count": 37
  },
  {
    "name": "대전광역시",
    "count": 117
  },
  {
    "name": "울산광역시",
    "count": 31
  },
  {
    "name": "세종특별자치시",
    "count": 1
  },
  {
    "name": "경기도",
    "count": 695
  },
  {
    "name": "강원특별자치도",
    "count": 177
  },
  {
    "name": "충청북도",
    "count": 505
  },
  {
    "name": "충청남도",
    "count": 883
  },
  {
    "name": "전북특별자치도",
    "count": 309
  },
  {
    "name": "전라남도",
    "count": 1818
  },
  {
    "name": "경상북도",
    "count": 349
  },
  {
    "name": "경상남도",
    "count": 353
  },
  {
    "name": "제주특별자치도",
    "count": 38
  },
  {
    "name": "기타",
    "count": 6984
  }
] as const;

export type ProtectedTreeRegionName =
  (typeof PROTECTED_TREE_REGIONS)[number]["name"];

export const PROTECTED_TREE_REGION_NAMES: ProtectedTreeRegionName[] =
  PROTECTED_TREE_REGIONS.map((item) => item.name);
