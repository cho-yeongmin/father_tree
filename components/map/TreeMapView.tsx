"use client";

import dynamic from "next/dynamic";
import type { GeoBounds } from "@/lib/geo/bounds";
import type { Tree } from "@/types/database";

const TreeMap = dynamic(
  () => import("./TreeMap").then((mod) => mod.TreeMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 min-h-[50vh] items-center justify-center bg-border/20">
        <p className="text-lg text-muted">지도를 준비하는 중...</p>
      </div>
    ),
  },
);

interface TreeMapViewProps {
  trees: Tree[];
  reviewedTreeIds: string[];
  userFocus?: { latitude: number; longitude: number } | null;
  fitAllTrees?: boolean;
  onMapViewportChange?: (bounds: GeoBounds, mapLevel: number) => void;
  protectedLoading?: boolean;
  regionFocus?: { region: string; nonce: number } | null;
}

export function TreeMapView({
  trees,
  reviewedTreeIds,
  userFocus,
  fitAllTrees,
  onMapViewportChange,
  protectedLoading = false,
  regionFocus = null,
}: TreeMapViewProps) {
  return (
    <TreeMap
      trees={trees}
      reviewedTreeIds={reviewedTreeIds}
      userFocus={userFocus}
      fitAllTrees={fitAllTrees}
      onMapViewportChange={onMapViewportChange}
      protectedLoading={protectedLoading}
      regionFocus={regionFocus}
    />
  );
}
