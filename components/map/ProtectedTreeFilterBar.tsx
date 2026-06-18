"use client";

import {
  countSelectedProtectedRegions,
  formatProtectedFilterSummary,
  type ProtectedRegionSelection,
} from "@/lib/trees/region-filter";
import {
  countSelectedProtectedSpecies,
  formatProtectedSpeciesSelection,
  type ProtectedSpeciesSelection,
} from "@/lib/trees/species-filter";

interface ProtectedTreeFilterBarProps {
  regionSelection: ProtectedRegionSelection;
  speciesSelection: ProtectedSpeciesSelection;
  visibleProtectedCount: number;
  onOpen: () => void;
}

export function ProtectedTreeFilterBar({
  regionSelection,
  speciesSelection,
  visibleProtectedCount,
  onOpen,
}: ProtectedTreeFilterBarProps) {
  const summary = formatProtectedFilterSummary(
    regionSelection,
    formatProtectedSpeciesSelection(speciesSelection),
  );
  const regionCount = countSelectedProtectedRegions(regionSelection);
  const speciesCount = countSelectedProtectedSpecies(speciesSelection);

  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-touch w-full items-center gap-3 rounded-xl border-2 border-border bg-background px-5 text-left transition-colors hover:border-primary"
        aria-label="보호수 지역·종류 필터"
      >
        <span className="shrink-0 text-xl" aria-hidden>
          🌿
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-medium text-foreground">
            보호수 필터
          </span>
          <span className="block truncate text-base text-muted">{summary}</span>
          <span className="block text-sm text-muted">
            이 화면 {visibleProtectedCount.toLocaleString()}그루 · 지역{" "}
            {regionCount}곳 · 종류 {speciesCount}종
          </span>
        </span>
      </button>
    </div>
  );
}
