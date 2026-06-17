import type { Tree } from "@/types/database";

function isAndroid(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  return /Android/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** SK Open API 웹 연동 (앱키가 있을 때) */
export function buildTmapWebRouteUrl(
  tree: Tree,
  appKey: string,
): string | null {
  if (!appKey.trim()) {
    return null;
  }

  const params = new URLSearchParams({
    appKey: appKey.trim(),
    name: tree.name,
    lon: String(tree.longitude),
    lat: String(tree.latitude),
  });

  return `https://apis.openapi.sk.com/tmap/app/routes?${params.toString()}`;
}

/**
 * T map 앱 딥링크
 * - Android: goalx, goaly, goalname (+ referrer)
 * - iOS: rGoX, rGoY, rGoName
 */
export function buildTmapRouteUrl(tree: Tree): string {
  const lon = String(tree.longitude);
  const lat = String(tree.latitude);
  const name = tree.name;

  if (isAndroid()) {
    const params = new URLSearchParams({
      referrer: "com.skt.Tmap",
      goalx: lon,
      goaly: lat,
      goalname: name,
    });
    return `tmap://route?${params.toString()}`;
  }

  if (isIOS()) {
    const params = new URLSearchParams({
      rGoName: name,
      rGoX: lon,
      rGoY: lat,
    });
    return `tmap://route?${params.toString()}`;
  }

  // 기타 환경: 두 형식 모두 포함
  const params = new URLSearchParams({
    referrer: "com.skt.Tmap",
    goalx: lon,
    goaly: lat,
    goalname: name,
    rGoName: name,
    rGoX: lon,
    rGoY: lat,
  });
  return `tmap://route?${params.toString()}`;
}

export function openTmapNavigation(tree: Tree): void {
  if (!tree.longitude || !tree.latitude) {
    window.alert("이 나무의 위치 정보가 없어 길안내를 시작할 수 없습니다.");
    return;
  }

  const webAppKey = process.env.NEXT_PUBLIC_TMAP_APP_KEY;
  const webRouteUrl = webAppKey ? buildTmapWebRouteUrl(tree, webAppKey) : null;

  // SK 웹 연동 URL이 있으면 우선 사용 (모바일 브라우저/PWA에서 안정적)
  window.location.href = webRouteUrl ?? buildTmapRouteUrl(tree);
}
