/** 시·도별 지도 중심 (보호수 필터 「이 지역으로 이동」) */
export const REGION_MAP_CENTERS: Record<
  string,
  { latitude: number; longitude: number; level: number }
> = {
  서울특별시: { latitude: 37.566, longitude: 126.978, level: 9 },
  부산광역시: { latitude: 35.18, longitude: 129.075, level: 9 },
  대구광역시: { latitude: 35.871, longitude: 128.601, level: 9 },
  인천광역시: { latitude: 37.456, longitude: 126.705, level: 9 },
  광주광역시: { latitude: 35.16, longitude: 126.853, level: 9 },
  대전광역시: { latitude: 36.351, longitude: 127.385, level: 9 },
  울산광역시: { latitude: 35.538, longitude: 129.311, level: 9 },
  세종특별자치시: { latitude: 36.48, longitude: 127.289, level: 10 },
  경기도: { latitude: 37.274, longitude: 127.009, level: 9 },
  강원특별자치도: { latitude: 37.822, longitude: 128.155, level: 9 },
  충청북도: { latitude: 36.635, longitude: 127.491, level: 9 },
  충청남도: { latitude: 36.518, longitude: 126.8, level: 9 },
  전북특별자치도: { latitude: 35.82, longitude: 127.109, level: 9 },
  전라남도: { latitude: 34.816, longitude: 126.463, level: 10 },
  경상북도: { latitude: 36.491, longitude: 128.889, level: 9 },
  경상남도: { latitude: 35.228, longitude: 128.681, level: 9 },
  제주특별자치도: { latitude: 33.499, longitude: 126.531, level: 10 },
  기타: { latitude: 36.5, longitude: 127.5, level: 8 },
};

export function getRegionMapCenter(region: string) {
  return REGION_MAP_CENTERS[region] ?? REGION_MAP_CENTERS.기타;
}
