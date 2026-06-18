"use client";

import { useCallback, useMemo, useState } from "react";
import { TreeMapView } from "@/components/map/TreeMapView";
import { NearbyFilter } from "@/components/map/NearbyFilter";
import {
  DEFAULT_MAP_TYPE_FILTERS,
  filterTreesByType,
  MapTypeFilter,
} from "@/components/map/MapTypeFilter";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useProtectedTreesInBounds } from "@/hooks/useProtectedTreesInBounds";
import {
  DEFAULT_NEARBY_RADIUS_KM,
  filterNearbyTrees,
} from "@/lib/geo/nearby";
import type { GeoBounds } from "@/lib/geo/bounds";
import type { Tree } from "@/types/database";

interface MapPageClientProps {
  naturalMonuments: Tree[];
  reviewedTreeIds: string[];
}

export function MapPageClient({
  naturalMonuments,
  reviewedTreeIds,
}: MapPageClientProps) {
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [typeFilters, setTypeFilters] = useState(DEFAULT_MAP_TYPE_FILTERS);
  const [mapBounds, setMapBounds] = useState<GeoBounds | null>(null);

  const { position, error: geoError } = useGeolocation({
    enabled: nearbyOnly,
  });

  const shouldLoadProtected =
    typeFilters.protected_tree && mapBounds !== null;

  const {
    protectedTrees,
    isLoading: protectedLoading,
    error: protectedError,
  } = useProtectedTreesInBounds({
    bounds: mapBounds,
    enabled: shouldLoadProtected,
  });

  const handleMapViewportChange = useCallback(
    (bounds: GeoBounds, _mapLevel: number) => {
      setMapBounds(bounds);
    },
    [],
  );

  const allTrees = useMemo(() => {
    const byId = new Map<string, Tree>();
    for (const tree of naturalMonuments) {
      byId.set(tree.id, tree);
    }
    for (const tree of protectedTrees) {
      byId.set(tree.id, tree);
    }
    return Array.from(byId.values());
  }, [naturalMonuments, protectedTrees]);

  const treesByType = useMemo(
    () => filterTreesByType(allTrees, typeFilters),
    [allTrees, typeFilters],
  );

  const displayTrees = useMemo(() => {
    if (!nearbyOnly || !position) {
      return treesByType;
    }

    return filterNearbyTrees(
      treesByType,
      position.latitude,
      position.longitude,
      DEFAULT_NEARBY_RADIUS_KM,
    );
  }, [treesByType, nearbyOnly, position]);

  const effectiveReviewedIds = typeFilters.visited_reviewed
    ? reviewedTreeIds
    : [];

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
        totalCount={treesByType.length}
        isLoading={nearbyOnly && !position && !geoError}
        error={nearbyOnly ? geoError : null}
      />
      <TreeMapView
        trees={displayTrees}
        reviewedTreeIds={effectiveReviewedIds}
        userFocus={userFocus}
        fitAllTrees={nearbyOnly && !!position}
        onMapViewportChange={handleMapViewportChange}
        protectedLoading={shouldLoadProtected && protectedLoading}
      />
      {protectedError && (
        <p className="absolute left-1/2 top-20 z-10 max-w-[90%] -translate-x-1/2 rounded-lg bg-card/95 px-4 py-2 text-center text-base text-red-700 shadow-md">
          {protectedError}
        </p>
      )}
      <MapTypeFilter filters={typeFilters} onChange={setTypeFilters} />
    </>
  );
}
