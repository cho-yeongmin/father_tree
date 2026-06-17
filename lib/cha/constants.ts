/** 국가유산청 Open API 시도 코드 */
export const CHA_REGION_CODES = [
  "11", // 서울
  "21", // 부산
  "22", // 대구
  "23", // 인천
  "24", // 광주
  "25", // 대전
  "26", // 울산
  "45", // 세종
  "31", // 경기
  "51", // 강원
  "33", // 충북
  "34", // 충남
  "35", // 전북
  "36", // 전남
  "37", // 경북
  "38", // 경남
  "50", // 제주
] as const;

/** 종목코드 16 = 천연기념물 */
export const CHA_KIND_NATURAL_MONUMENT = "16";

export const CHA_LIST_API =
  "https://www.cha.go.kr/cha/SearchKindOpenapiList.do";

export const CHA_DETAIL_API =
  "https://www.cha.go.kr/cha/SearchKindOpenapiDt.do";

export const CHA_IMAGE_API =
  "https://www.cha.go.kr/cha/SearchImageOpenapi.do";
