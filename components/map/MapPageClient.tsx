"use client";

import { useCallback, useMemo, useState } from "react";
import { TreeMapView } from "@/components/map/TreeMapView";
import { NearbyFilter } from "@/components/map/NearbyFilter";
import {
  DEFAULT_MAP_TYPE_FILTERS,
  filterTreesByType,
  MapTypeFilter,
} from "@/components/map/MapTypeFilter";
import { ProtectedTreeSpeciesBar } from "@/components/map/ProtectedTreeSpeciesBar";
import { SpeciesFilterSheet } from "@/components/map/SpeciesFilterSheet";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useProtectedTreesInBounds } from "@/hooks/useProtectedTreesInBounds";
import {
  DEFAULT_NEARBY_RADIUS_KM,
  filterNearbyTrees,
} from "@/lib/geo/nearby";
import type { GeoBounds } from "@/lib/geo/bounds";
import {
  filterTreesByProtectedSpecies,
  selectAllProtectedSpecies,
  type ProtectedSpeciesSelection,
} from "@/lib/trees/species-filter";
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
  const [speciesSelection, setSpeciesSelection] =
    useState<ProtectedSpeciesSelection>(selectAllProtectedSpecies());
  const [speciesSheetOpen, setSpeciesSheetOpen] = useState(false);

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

  const treesBySpecies = useMemo(
    () => filterTreesByProtectedSpecies(treesByType, speciesSelection),
    [treesByType, speciesSelection],
  );

  const displayTrees = useMemo(() => {
    if (!nearbyOnly || !position) {
      return treesBySpecies;
    }

    return filterNearbyTrees(
      treesBySpecies,
      position.latitude,
      position.longitude,
      DEFAULT_NEARBY_RADIUS_KM,
    );
  }, [treesBySpecies, nearbyOnly, position]);

  const effectiveReviewedIds = typeFilters.visited_reviewed
    ? reviewedTreeIds
    : [];

  const userFocus = nearbyOnly && position
    ? { latitude: position.latitude, longitude: position.longitude }
    : null;

  const showSpeciesFilter = typeFilters.protected_tree;

  function handleToggleNearby() {
    setNearbyOnly((prev) => !prev);
  }

  return (
    <>
      <NearbyFilter
        enabled={nearbyOnly}
        onToggle={handleToggleNearby}
        nearbyCount={displayTrees.length}
        totalCount={treesBySpecies.length}
        isLoading={nearbyOnly && !position && !geoError}
        error={nearbyOnly ? geoError : null}
      />
      <div className="relative flex flex-1 flex-col min-h-[50vh]">
        {showSpeciesFilter && (
          <ProtectedTreeSpeciesBar
            selected={speciesSelection}
            onOpen={() => setSpeciesSheetOpen(true)}
          />
        )}
        <TreeMapView
          trees={displayTrees}
          reviewedTreeIds={effectiveReviewedIds}
          userFocus={userFocus}
          fitAllTrees={nearbyOnly && !!position}
          onMapViewportChange={handleMapViewportChange}
          protectedLoading={shouldLoadProtected && protectedLoading}
        />
      </div>
      {protectedError && (
        <p className="absolute left-1/2 top-20 z-10 max-w-[90%] -translate-x-1/2 rounded-lg bg-card/95 px-4 py-2 text-center text-base text-red-700 shadow-md">
          {protectedError}
        </p>
      )}
      <MapTypeFilter filters={typeFilters} onChange={setTypeFilters} />
      <SpeciesFilterSheet
        open={speciesSheetOpen && showSpeciesFilter}
        selected={speciesSelection}
        onChange={setSpeciesSelection}
        onClose={() => setSpeciesSheetOpen(false)}
      />
    </>
  );
}
