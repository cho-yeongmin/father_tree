export interface GeoBounds {
  south: number;
  north: number;
  west: number;
  east: number;
}

const KOREA_LAT_MIN = 33.0;
const KOREA_LAT_MAX = 39.5;
const KOREA_LNG_MIN = 124.0;
const KOREA_LNG_MAX = 132.5;

export function clampBounds(bounds: GeoBounds): GeoBounds {
  return {
    south: Math.max(KOREA_LAT_MIN, bounds.south),
    north: Math.min(KOREA_LAT_MAX, bounds.north),
    west: Math.max(KOREA_LNG_MIN, bounds.west),
    east: Math.min(KOREA_LNG_MAX, bounds.east),
  };
}

/** 지도 이동 시 가장자리 깜빡임을 줄이기 위해 영역을 약간 넓힙니다. */
export function expandBounds(
  bounds: GeoBounds,
  paddingRatio = 0.2,
): GeoBounds {
  const latPad = (bounds.north - bounds.south) * paddingRatio;
  const lngPad = (bounds.east - bounds.west) * paddingRatio;

  return clampBounds({
    south: bounds.south - latPad,
    north: bounds.north + latPad,
    west: bounds.west - lngPad,
    east: bounds.east + lngPad,
  });
}

export function boundsFromCenter(
  latitude: number,
  longitude: number,
  radiusKm: number,
): GeoBounds {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

  return clampBounds({
    south: latitude - latDelta,
    north: latitude + latDelta,
    west: longitude - lngDelta,
    east: longitude + lngDelta,
  });
}

export function boundsKey(bounds: GeoBounds): string {
  return [
    bounds.south.toFixed(4),
    bounds.north.toFixed(4),
    bounds.west.toFixed(4),
    bounds.east.toFixed(4),
  ].join(":");
}
