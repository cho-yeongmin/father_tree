/**
 * 카카오 지도 level: 숫자가 작을수록 확대(가까이), 클수록 축소(멀리).
 * 기본 화면 level 10 — 보호수는 더 확대했을 때만 표시합니다.
 */
export const PROTECTED_TREE_MAX_VISIBLE_LEVEL = 8;

export function shouldShowProtectedTreePins(mapLevel: number): boolean {
  return mapLevel <= PROTECTED_TREE_MAX_VISIBLE_LEVEL;
}
