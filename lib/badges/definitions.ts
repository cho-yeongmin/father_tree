import type { BadgeVisitStats } from "@/lib/badges/compute-stats";

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "visit" | "type" | "region" | "species";
  target?: number;
  isEarned: (stats: BadgeVisitStats) => boolean;
  getProgress: (stats: BadgeVisitStats) => { current: number; target: number };
}

function countProgress(current: number, target: number) {
  return { current: Math.min(current, target), target };
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "visit_1",
    title: "첫 걸음",
    description: "첫 나무 방문 스탬프를 받았습니다.",
    icon: "🌱",
    category: "visit",
    target: 1,
    isEarned: (s) => s.uniqueTreeCount >= 1,
    getProgress: (s) => countProgress(s.uniqueTreeCount, 1),
  },
  {
    id: "visit_5",
    title: "나무 친구",
    description: "서로 다른 나무 5그루를 방문했습니다.",
    icon: "🌿",
    category: "visit",
    target: 5,
    isEarned: (s) => s.uniqueTreeCount >= 5,
    getProgress: (s) => countProgress(s.uniqueTreeCount, 5),
  },
  {
    id: "visit_20",
    title: "숲 지킴이",
    description: "서로 다른 나무 20그루를 방문했습니다.",
    icon: "🌳",
    category: "visit",
    target: 20,
    isEarned: (s) => s.uniqueTreeCount >= 20,
    getProgress: (s) => countProgress(s.uniqueTreeCount, 20),
  },
  {
    id: "visit_100",
    title: "백그루 여행",
    description: "서로 다른 나무 100그루를 방문했습니다.",
    icon: "🏅",
    category: "visit",
    target: 100,
    isEarned: (s) => s.uniqueTreeCount >= 100,
    getProgress: (s) => countProgress(s.uniqueTreeCount, 100),
  },
  {
    id: "type_natural_1",
    title: "천연기념물 첫 만남",
    description: "천연기념물 나무를 처음 방문했습니다.",
    icon: "🏛️",
    category: "type",
    target: 1,
    isEarned: (s) => s.naturalMonumentCount >= 1,
    getProgress: (s) => countProgress(s.naturalMonumentCount, 1),
  },
  {
    id: "type_protected_1",
    title: "보호수 첫 만남",
    description: "보호수를 처음 방문했습니다.",
    icon: "🌲",
    category: "type",
    target: 1,
    isEarned: (s) => s.protectedTreeCount >= 1,
    getProgress: (s) => countProgress(s.protectedTreeCount, 1),
  },
  {
    id: "type_natural_10",
    title: "명목 탐험가",
    description: "천연기념물 나무 10그루를 방문했습니다.",
    icon: "🎖️",
    category: "type",
    target: 10,
    isEarned: (s) => s.naturalMonumentCount >= 10,
    getProgress: (s) => countProgress(s.naturalMonumentCount, 10),
  },
  {
    id: "type_protected_10",
    title: "보호수 산책",
    description: "보호수 10그루를 방문했습니다.",
    icon: "🚶",
    category: "type",
    target: 10,
    isEarned: (s) => s.protectedTreeCount >= 10,
    getProgress: (s) => countProgress(s.protectedTreeCount, 10),
  },
  {
    id: "region_jeonnam",
    title: "전라남도 숲",
    description: "전라남도 나무를 방문했습니다.",
    icon: "🌊",
    category: "region",
    target: 1,
    isEarned: (s) => s.uniqueRegions.has("전라남도"),
    getProgress: (s) =>
      countProgress(s.uniqueRegions.has("전라남도") ? 1 : 0, 1),
  },
  {
    id: "region_3",
    title: "도내 여행",
    description: "서로 다른 시·도 3곳에서 나무를 방문했습니다.",
    icon: "🗺️",
    category: "region",
    target: 3,
    isEarned: (s) => s.uniqueRegions.size >= 3,
    getProgress: (s) => countProgress(s.uniqueRegions.size, 3),
  },
  {
    id: "region_8",
    title: "반도 일주",
    description: "서로 다른 시·도 8곳에서 나무를 방문했습니다.",
    icon: "🇰🇷",
    category: "region",
    target: 8,
    isEarned: (s) => s.uniqueRegions.size >= 8,
    getProgress: (s) => countProgress(s.uniqueRegions.size, 8),
  },
  {
    id: "species_5",
    title: "종 콜렉터",
    description: "서로 다른 보호수 종 5종 이상을 방문했습니다.",
    icon: "📚",
    category: "species",
    target: 5,
    isEarned: (s) => s.uniqueSpecies.size >= 5,
    getProgress: (s) => countProgress(s.uniqueSpecies.size, 5),
  },
  {
    id: "species_zelkova_3",
    title: "느티나무 마니아",
    description: "느티나무 보호수 3그루 이상을 방문했습니다.",
    icon: "🌳",
    category: "species",
    target: 3,
    isEarned: (s) => s.zelkovaCount >= 3,
    getProgress: (s) => countProgress(s.zelkovaCount, 3),
  },
];

export interface EvaluatedBadge extends BadgeDefinition {
  earned: boolean;
  progress: { current: number; target: number };
}

export function evaluateBadges(stats: BadgeVisitStats): EvaluatedBadge[] {
  return BADGE_DEFINITIONS.map((badge) => ({
    ...badge,
    earned: badge.isEarned(stats),
    progress: badge.getProgress(stats),
  }));
}

export function getEarnedBadgeIds(stats: BadgeVisitStats): string[] {
  return BADGE_DEFINITIONS.filter((badge) => badge.isEarned(stats)).map(
    (badge) => badge.id,
  );
}
