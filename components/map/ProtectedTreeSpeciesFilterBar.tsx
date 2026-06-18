"use client";

import {
  countSelectedProtectedSpecies,
  formatProtectedSpeciesSelection,
  type ProtectedSpeciesSelection,
} from "@/lib/trees/species-filter";

interface ProtectedTreeSpeciesFilterBarProps {
  selected: ProtectedSpeciesSelection;
  onOpen: () => void;
}

export function ProtectedTreeSpeciesFilterBar({
  selected,
  onOpen,
}: ProtectedTreeSpeciesFilterBarProps) {
  const label = formatProtectedSpeciesSelection(selected);
  const count = countSelectedProtectedSpecies(selected);

  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-touch w-full items-center gap-3 rounded-xl border-2 border-border bg-background px-5 text-left transition-colors hover:border-primary"
        aria-label="보호수 종류 선택"
      >
        <span className="shrink-0 text-xl" aria-hidden>
          🌿
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-medium text-foreground">
            보호수 종류
          </span>
          <span className="block truncate text-base text-muted">{label}</span>
        </span>
        <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
          {count}종
        </span>
      </button>
    </div>
  );
}
