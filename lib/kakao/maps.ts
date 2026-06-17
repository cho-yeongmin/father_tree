const KAKAO_MAP_SCRIPT_ID = "kakao-map-sdk";

export function loadKakaoMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("브라우저 환경에서만 지도를 불러올 수 있습니다."));
      return;
    }

    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve());
      return;
    }

    const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (!appKey) {
      reject(new Error("NEXT_PUBLIC_KAKAO_APP_KEY가 설정되지 않았습니다."));
      return;
    }

    const existing = document.getElementById(KAKAO_MAP_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => {
        window.kakao.maps.load(() => resolve());
      });
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=clusterer`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => reject(new Error("카카오 지도 SDK 로드에 실패했습니다."));
    document.head.appendChild(script);
  });
}

export const MARKER_IMAGES: Record<string, { src: string; width: number; height: number }> = {
  natural_monument: { src: "/markers/marker-red.svg", width: 36, height: 48 },
  protected_tree: { src: "/markers/marker-green.svg", width: 36, height: 48 },
  visited_reviewed: { src: "/markers/marker-star.svg", width: 40, height: 40 },
};

declare global {
  interface Window {
    kakao: typeof kakao;
  }
}
