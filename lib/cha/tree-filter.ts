/** 천연기념물 중 수목(나무) 관련 항목 판별 */
const TREE_KEYWORDS =
  /나무|송|소나무|은행|느티|왕벚|이팝|측백|편백|주목|호두|회화|미선|가문비|비자|자작|외목|숲|버들|리갈리스|플라타너스|향나무|백송|정자|당산|보목|유실|과수/;

const NON_TREE_KEYWORDS =
  /번식지|서식지|돌고래|고래|물개|반딧불|습지|화석|지질|조류|두루미|매류|독수리|수달|담비|표범|호랑이|곰|사슴|박쥐|산호|지의류|철쭉|고라니|노루|원숭이|악어|거북|물범|어류|곤충|나비|풀벌|식물군락|초지|암석|동굴|폭포|계곡|해안|섬|바위|화산|온천|사구|모래|호수|갯벌/;

export function isTreeNaturalMonument(name: string): boolean {
  if (!name) return false;
  if (NON_TREE_KEYWORDS.test(name)) return false;
  return TREE_KEYWORDS.test(name);
}

export function hasValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude !== 0 &&
    longitude !== 0 &&
    latitude >= 33 &&
    latitude <= 39.5 &&
    longitude >= 124 &&
    longitude <= 132.5
  );
}
