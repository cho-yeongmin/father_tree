/** 지도·카드에 표시할 나무 종류(짧은 이름) */
export function getTreeSpeciesLabel(name: string): string {
  const speciesMatch = name.match(
    /([가-힣]+(?:나무|송|수|류|림|군|지|수림|자생지))\s*$/,
  );
  if (speciesMatch?.[1]) {
    return speciesMatch[1];
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    if (last.length <= 10) {
      return last;
    }
  }

  return name.length > 12 ? `${name.slice(0, 11)}…` : name;
}
