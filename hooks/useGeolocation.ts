"use client";

import { useEffect, useState } from "react";

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationOptions {
  enabled?: boolean;
  intervalMs?: number;
}

export function useGeolocation({
  enabled = true,
  intervalMs = 15_000,
}: UseGeolocationOptions = {}) {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !navigator.geolocation) {
      setError("이 기기에서는 위치 정보를 사용할 수 없습니다.");
      return;
    }

    let watchId: number | null = null;

    const handleSuccess = (pos: GeolocationPosition) => {
      setPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
      setError(null);
      setIsWatching(true);
    };

    const handleError = (err: GeolocationPositionError) => {
      setIsWatching(false);
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError("위치 권한이 필요합니다. 설정에서 허용해 주세요.");
          break;
        case err.POSITION_UNAVAILABLE:
          setError("현재 위치를 가져올 수 없습니다.");
          break;
        default:
          setError("위치 정보를 확인하는 중 오류가 발생했습니다.");
      }
    };

    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: intervalMs,
      timeout: 10_000,
    });

    return () => {
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled, intervalMs]);

  return { position, error, isWatching };
}
