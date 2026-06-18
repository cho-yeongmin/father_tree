"use client";

import {
  countSelectedProtectedSpecies,
  formatProtectedSpeciesSelection,
  type ProtectedSpeciesSelection,
} from "@/lib/trees/species-filter";

interface ProtectedTreeSpeciesBarProps {
  selected: ProtectedSpeciesSelection;
  onOpen: () => void;
}

export function ProtectedTreeSpeciesBar({
  selected,
  onOpen,
}: ProtectedTreeSpeciesBarProps) {
  const label = formatProtectedSpeciesSelection(selected);
  const count = countSelectedProtectedSpecies(selected);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="absolute left-3 right-3 top-3 z-10 flex min-h-touch items-center gap-3 rounded-xl border-2 border-border bg-card/95 px-4 py-2 text-left shadow-md backdrop-blur-sm"
      aria-label="보호수 종류 선택"
    >
      <span className="shrink-0 text-xl" aria-hidden>
        🌿
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-muted">보호수 종류</span>
        <span className="block truncate text-lg font-semibold text-foreground">
          {label}
        </span>
      </span>
      <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
        {count}종
      </span>
    </button>
  );
}
