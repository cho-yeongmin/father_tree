"use client";

import { useCallback, useMemo, useState } from "react";
import { TreeMapView } from "@/components/map/TreeMapView";
import {
  DEFAULT_MAP_TYPE_FILTERS,
  filterTreesByType,
  MapTypeFilter,
} from "@/components/map/MapTypeFilter";
import { ProtectedTreeSpeciesFilterBar } from "@/components/map/ProtectedTreeSpeciesFilterBar";
import { SpeciesFilterSheet } from "@/components/map/SpeciesFilterSheet";
import { useProtectedTreesInBounds } from "@/hooks/useProtectedTreesInBounds";
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
  const [typeFilters, setTypeFilters] = useState(DEFAULT_MAP_TYPE_FILTERS);
  const [mapBounds, setMapBounds] = useState<GeoBounds | null>(null);
  const [speciesSelection, setSpeciesSelection] =
    useState<ProtectedSpeciesSelection>(selectAllProtectedSpecies());
  const [speciesSheetOpen, setSpeciesSheetOpen] = useState(false);

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

  const displayTrees = useMemo(
    () => filterTreesByProtectedSpecies(treesByType, speciesSelection),
    [treesByType, speciesSelection],
  );

  const effectiveReviewedIds = typeFilters.visited_reviewed
    ? reviewedTreeIds
    : [];

  const showSpeciesFilter = typeFilters.protected_tree;

  return (
    <>
      {showSpeciesFilter && (
        <ProtectedTreeSpeciesFilterBar
          selected={speciesSelection}
          onOpen={() => setSpeciesSheetOpen(true)}
        />
      )}
      <TreeMapView
        trees={displayTrees}
        reviewedTreeIds={effectiveReviewedIds}
        onMapViewportChange={handleMapViewportChange}
        protectedLoading={shouldLoadProtected && protectedLoading}
      />
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
