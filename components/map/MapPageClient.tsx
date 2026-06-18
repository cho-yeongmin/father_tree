"use client";

import { useCallback, useMemo, useState } from "react";
import { TreeMapView } from "@/components/map/TreeMapView";
import {
  DEFAULT_MAP_TYPE_FILTERS,
  filterTreesByType,
  MapTypeFilter,
} from "@/components/map/MapTypeFilter";
import { ProtectedTreeFilterBar } from "@/components/map/ProtectedTreeFilterBar";
import { ProtectedTreeFilterSheet } from "@/components/map/ProtectedTreeFilterSheet";
import { useProtectedTreesInBounds } from "@/hooks/useProtectedTreesInBounds";
import type { GeoBounds } from "@/lib/geo/bounds";
import {
  filterTreesByProtectedRegion,
  selectAllProtectedRegions,
  type ProtectedRegionSelection,
} from "@/lib/trees/region-filter";
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

interface RegionFocusRequest {
  region: string;
  nonce: number;
}

export function MapPageClient({
  naturalMonuments,
  reviewedTreeIds,
}: MapPageClientProps) {
  const [typeFilters, setTypeFilters] = useState(DEFAULT_MAP_TYPE_FILTERS);
  const [mapBounds, setMapBounds] = useState<GeoBounds | null>(null);
  const [regionSelection, setRegionSelection] =
    useState<ProtectedRegionSelection>(selectAllProtectedRegions());
  const [speciesSelection, setSpeciesSelection] =
    useState<ProtectedSpeciesSelection>(selectAllProtectedSpecies());
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [regionFocus, setRegionFocus] = useState<RegionFocusRequest | null>(
    null,
  );

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

  const handleFocusRegion = useCallback((region: string) => {
    setRegionFocus({ region, nonce: Date.now() });
    setFilterSheetOpen(false);
  }, []);

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
    const byRegion = filterTreesByProtectedRegion(treesByType, regionSelection);
    return filterTreesByProtectedSpecies(byRegion, speciesSelection);
  }, [treesByType, regionSelection, speciesSelection]);

  const visibleProtectedCount = useMemo(
    () => displayTrees.filter((tree) => tree.type === "protected_tree").length,
    [displayTrees],
  );

  const showProtectedEmptyHint =
    typeFilters.protected_tree &&
    visibleProtectedCount === 0 &&
    !protectedLoading;

  const effectiveReviewedIds = typeFilters.visited_reviewed
    ? reviewedTreeIds
    : [];

  const showProtectedFilter = typeFilters.protected_tree;

  return (
    <>
      {showProtectedFilter && (
        <ProtectedTreeFilterBar
          regionSelection={regionSelection}
          speciesSelection={speciesSelection}
          visibleProtectedCount={visibleProtectedCount}
          onOpen={() => setFilterSheetOpen(true)}
        />
      )}
      {showProtectedEmptyHint && (
        <p className="border-b border-border bg-card/95 px-4 py-2 text-center text-base text-muted">
          이 화면에 표시할 보호수가 없습니다. 지도를 이동하거나 필터를 조정해
          보세요.
        </p>
      )}
      <TreeMapView
        trees={displayTrees}
        reviewedTreeIds={effectiveReviewedIds}
        onMapViewportChange={handleMapViewportChange}
        protectedLoading={shouldLoadProtected && protectedLoading}
        regionFocus={regionFocus}
      />
      {protectedError && (
        <p className="absolute left-1/2 top-20 z-10 max-w-[90%] -translate-x-1/2 rounded-lg bg-card/95 px-4 py-2 text-center text-base text-red-700 shadow-md">
          {protectedError}
        </p>
      )}
      <MapTypeFilter filters={typeFilters} onChange={setTypeFilters} />
      <ProtectedTreeFilterSheet
        open={filterSheetOpen && showProtectedFilter}
        regionSelection={regionSelection}
        speciesSelection={speciesSelection}
        onRegionChange={setRegionSelection}
        onSpeciesChange={setSpeciesSelection}
        onFocusRegion={handleFocusRegion}
        onClose={() => setFilterSheetOpen(false)}
      />
    </>
  );
}
