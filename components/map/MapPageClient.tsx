"use client";

import { useMemo, useState } from "react";
import { TreeMapView } from "@/components/map/TreeMapView";
import { NearbyFilter } from "@/components/map/NearbyFilter";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  DEFAULT_NEARBY_RADIUS_KM,
  filterNearbyTrees,
} from "@/lib/geo/nearby";
import type { Tree } from "@/types/database";

interface MapPageClientProps {
  trees: Tree[];
  reviewedTreeIds: string[];
}

export function MapPageClient({ trees, reviewedTreeIds }: MapPageClientProps) {
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const { position, error: geoError } = useGeolocation({
    enabled: nearbyOnly,
  });

  const displayTrees = useMemo(() => {
    if (!nearbyOnly || !position) return trees;
    return filterNearbyTrees(
      trees,
      position.latitude,
      position.longitude,
      DEFAULT_NEARBY_RADIUS_KM,
    );
  }, [trees, nearbyOnly, position]);

  const userFocus = nearbyOnly && position
    ? { latitude: position.latitude, longitude: position.longitude }
    : null;

  function handleToggleNearby() {
    setNearbyOnly((prev) => !prev);
  }

  return (
    <>
      <NearbyFilter
        enabled={nearbyOnly}
        onToggle={handleToggleNearby}
        nearbyCount={displayTrees.length}
        totalCount={trees.length}
        isLoading={nearbyOnly && !position && !geoError}
        error={nearbyOnly ? geoError : null}
      />
      <TreeMapView
        trees={displayTrees}
        reviewedTreeIds={reviewedTreeIds}
        userFocus={userFocus}
        fitAllTrees={nearbyOnly && !!position}
      />
    </>
  );
}
